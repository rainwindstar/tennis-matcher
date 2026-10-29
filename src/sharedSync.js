// Only the shared record is handled here; scheduling and scoring stay in App.
export const SHARED_FIELDS = [
  'attendees', 'core_members', 'schedule', 'schedule_generated',
  'live_match_id', 'live_points', 'is_tiebreak', 'tiebreak_points',
];
export const PENDING_KEY = 'tennis_shared_pending_v1';
export const BACKUP_KEY = 'tennis_shared_conflict_backup_v1';

const canonical = value => {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])]));
  }
  return value;
};
export const same = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const clone = value => JSON.parse(JSON.stringify(value));
const message = error => error?.message || String(error);

// Compare-and-swap in ONE UPDATE statement, rather than a read followed by a
// blind write. Keep raw DB values (including nulls) in the expected row.
// JSON columns must support equality (jsonb). Unsupported schema fails closed.
export function createSharedTransport(database, id = 1) {
  return {
    async read() {
      const { data, error } = await database.from('tennis_shared_state')
        .select().eq('id', id).abortSignal(AbortSignal.timeout(15000)).maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('공유 레코드가 없거나 읽기 권한이 없습니다.');
      return data;
    },
    async save(expected, payload) {
      let query = database.from('tennis_shared_state').update(payload).eq('id', id);
      for (const field of SHARED_FIELDS) {
        if (!(field in expected)) throw new Error(`서버 필드 누락: ${field}`);
        const value = expected[field];
        query = value === null ? query.is(field, null)
          : query.eq(field, typeof value === 'object' ? JSON.stringify(value) : value);
      }
      const { data, error } = await query.select().abortSignal(AbortSignal.timeout(15000));
      if (error) throw error;
      if (!Array.isArray(data)) throw new Error('서버 저장 확인 응답이 없습니다.');
      if (data.length === 0) return null; // concurrent write, deletion, or RLS
      if (data.length !== 1) throw new Error('공유 레코드 응답 개수가 올바르지 않습니다.');
      return data[0];
    },
  };
}

export class SharedSync {
  constructor({ transport, initial, normalize, storage, onRemote, onStatus,
    setTimer = setTimeout, clearTimer = clearTimeout }) {
    Object.assign(this, { transport, normalize, storage, onRemote, onStatus, setTimer, clearTimer });
    this.local = clone(initial);
    this.base = null;
    this.remote = null;
    this.ready = false;
    this.stopped = false;
    this.busy = false;
    this.failures = 0;
    this.storageError = '';
    try {
      const saved = JSON.parse(storage.getItem(PENDING_KEY) || 'null');
      if (saved) {
        if (saved.version !== 1 || !saved.local || !SHARED_FIELDS.every(k => k in saved.local)) {
          throw new Error('저장 대기 기록 형식 확인 필요');
        }
        this.local = saved.local;
        this.base = saved.base;
        this.restored = true;
      }
    } catch (error) {
      this.storageError = `기기 내 대기 기록 읽기 실패: ${message(error)}`;
      // Do not overwrite an unreadable recovery record.
      this.recoveryBlocked = true;
    }
  }

  dirty() { return !this.base || !same(this.local, this.normalize(this.base)); }

  emit(state, error = '') {
    if (!this.stopped) this.onStatus({ state, error, storageError: this.storageError,
      conflict: this.remote ? { local: clone(this.local), server: this.normalize(this.remote) } : null });
  }

  persist() {
    if (this.recoveryBlocked) return;
    try {
      if (this.dirty()) this.storage.setItem(PENDING_KEY, JSON.stringify({
        version: 1, base: this.base, local: this.local,
      }));
      else this.storage.removeItem(PENDING_KEY);
      this.storageError = '';
    } catch (error) {
      this.storageError = `기기 내 백업 실패: ${message(error)}. 창을 닫기 전에 기록을 내려받으세요.`;
    }
  }

  schedule(delay = 800) {
    this.clearTimer(this.timer);
    if (!this.stopped) this.timer = this.setTimer(() => { void this.sync(); }, delay);
  }

  edit(payload) {
    if (same(payload, this.local)) return;
    if (!this.ready) this.editedBeforeReady = true;
    this.local = clone(payload);
    this.persist();
    this.emit(this.remote ? 'conflict' : 'pending');
    if (!this.remote) this.schedule();
  }

  async start() {
    if (this.restored) this.onRemote(clone(this.local));
    // An untouched empty initial screen is not a local draft. In particular,
    // StrictMode's mount/cleanup/mount must not manufacture an empty conflict.
    if (this.restored || this.local.attendees.length || this.local.schedule.length) this.persist();
    this.emit('loading');
    if (this.recoveryBlocked) {
      this.emit('error', this.storageError);
      return;
    }
    await this.sync();
  }

  accept(row) {
    this.base = clone(row);
    this.local = this.normalize(row);
    this.onRemote(clone(this.local));
    this.persist();
    this.emit('saved');
  }

  conflict(row) {
    this.remote = clone(row);
    this.persist();
    this.emit('conflict');
  }

  async sync() {
    if (this.stopped || this.busy || this.remote || this.recoveryBlocked) return;
    this.clearTimer(this.timer);
    this.busy = true;
    try {
      const row = await this.transport.read();
      if (this.stopped) return;
      const remotePayload = this.normalize(row);
      if (!this.ready) {
        this.ready = true;
        if (!this.base) {
          const hasLocalData = this.local.attendees.length > 0 || this.local.schedule.length > 0;
          if (!hasLocalData && !this.restored && !this.editedBeforeReady) {
            this.accept(row);
            return;
          }
          if (!same(this.local, remotePayload) &&
              (remotePayload.attendees.length || remotePayload.schedule.length)) {
            this.conflict(row);
            return;
          }
          this.base = clone(row);
        }
      }
      // A successful write with a lost HTTP response can be acknowledged by readback.
      if (same(this.local, remotePayload)) {
        this.accept(row);
        return;
      }
      if (!this.dirty()) {
        this.accept(row);
        return;
      }
      if (!same(this.normalize(this.base), remotePayload)) {
        this.conflict(row);
        return;
      }
      this.emit('saving');
      const sent = clone(this.local);
      const saved = await this.transport.save(row, sent);
      if (this.stopped) return;
      if (!saved) {
        this.conflict(await this.transport.read());
        return;
      }
      if (!same(sent, this.normalize(saved))) throw new Error('서버 저장 내용이 요청과 다릅니다.');
      // Only a confirmed response advances the baseline. New edits made while
      // awaiting this response remain dirty and are saved separately.
      this.base = clone(saved);
      this.failures = 0;
      this.persist();
      this.emit(this.dirty() ? 'pending' : 'saved');
      if (this.dirty()) this.schedule();
    } catch (error) {
      if (!this.stopped) {
        this.persist();
        this.emit('error', message(error));
        this.schedule(Math.min(30000, 1000 * 2 ** Math.min(this.failures++, 5)));
      }
    } finally {
      this.busy = false;
    }
  }

  // Explicit whole-record conflict resolution. Always preserve both versions.
  resolve(choice) {
    if (!this.remote || this.busy || !['server', 'local'].includes(choice)) return;
    try {
      this.storage.setItem(BACKUP_KEY, JSON.stringify({
        at: new Date().toISOString(), base: this.base, local: this.local, server: this.remote,
      }));
    } catch (error) {
      this.emit('conflict', `충돌 백업 실패: ${message(error)}. 기록을 먼저 내려받으세요.`);
      return;
    }
    const row = this.remote;
    this.remote = null;
    this.ready = true;
    if (choice === 'server') this.accept(row);
    else {
      this.base = clone(row);
      this.persist();
      this.emit('pending');
      this.schedule(0); // read again and CAS; never a forced blind write
    }
  }

  stop() { this.stopped = true; this.clearTimer(this.timer); }
}
