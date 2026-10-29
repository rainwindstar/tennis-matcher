import test from 'node:test';
import assert from 'node:assert/strict';
import { SharedSync, createSharedTransport, SHARED_FIELDS, PENDING_KEY, BACKUP_KEY, same } from '../src/sharedSync.js';

const copy = v => structuredClone(v);
const empty = () => ({ attendees: [], core_members: ['A', 'B'], schedule: [],
  schedule_generated: false, live_match_id: null, live_points: { A: 0, B: 0 },
  is_tiebreak: false, tiebreak_points: { A: 0, B: 0 } });
const normalize = row => Object.fromEntries(SHARED_FIELDS.map(k => [k, row[k]]));
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };

function memoryStorage() {
  const values = new Map();
  return { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v), removeItem: k => values.delete(k) };
}
function server(initial = empty()) {
  return {
    row: { id: 1, ...copy(initial) }, reads: 0, writes: 0,
    async read() { this.reads++; if (this.offline) throw new Error('offline'); return copy(this.row); },
    async save(expected, payload) {
      this.writes++;
      if (this.offline || this.failWrite) throw new Error('save failed');
      if (!same(expected, this.row)) return null;
      this.row = { id: 1, ...copy(payload) };
      return copy(this.row);
    },
  };
}
function device(transport, options = {}) {
  const statuses = [], applied = [], timers = new Map();
  let id = 0;
  const storage = options.storage ?? memoryStorage();
  const sync = new SharedSync({ transport, initial: empty(), normalize, storage,
    onRemote: v => applied.push(copy(v)), onStatus: v => statuses.push(v),
    setTimer: (fn, delay) => { timers.set(++id, { fn, delay }); return id; },
    clearTimer: key => timers.delete(key), ...options });
  return { sync, statuses, applied, storage, timers, status: () => statuses.at(-1) };
}
const change = (sync, n = 1) => sync.edit({ ...sync.local, live_points: { A: n, B: 0 } });

test('confirmed save alone advances baseline and clears durable pending', async () => {
  const backend = server(), d = device(backend);
  await d.sync.start();
  const base = copy(d.sync.base);
  change(d.sync);
  assert.deepEqual(d.sync.base, base);
  assert.equal(d.status().state, 'pending');
  assert.ok(d.storage.getItem(PENDING_KEY));
  await d.sync.sync();
  assert.equal(d.status().state, 'saved');
  assert.equal(backend.row.live_points.A, 1);
  assert.equal(d.sync.base.live_points.A, 1);
  assert.equal(d.storage.getItem(PENDING_KEY), null);
});

test('save rejection keeps dirty state, baseline, and retry timer', async () => {
  const backend = server(), d = device(backend);
  await d.sync.start(); change(d.sync);
  backend.failWrite = true;
  await d.sync.sync();
  assert.equal(d.status().state, 'error');
  assert.equal(d.sync.base.live_points.A, 0);
  assert.equal(d.sync.local.live_points.A, 1);
  assert.ok(d.storage.getItem(PENDING_KEY));
  assert.equal([...d.timers.values()][0].delay, 1000);
});

test('network recovery retries and saves retained local input', async () => {
  const backend = server(), d = device(backend);
  await d.sync.start(); change(d.sync, 2); backend.offline = true;
  await d.sync.sync(); assert.equal(d.status().state, 'error');
  backend.offline = false;
  await [...d.timers.values()][0].fn();
  // timer callback starts an async operation; wait for the transport microtasks.
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(d.status().state, 'saved');
  assert.equal(backend.row.live_points.A, 2);
});

test('a dirty poll never applies an older server record over input', async () => {
  const backend = server(), d = device(backend);
  await d.sync.start(); const applied = d.applied.length;
  change(d.sync, 3); backend.failWrite = true;
  await d.sync.sync(); await d.sync.sync();
  assert.equal(d.applied.length, applied);
  assert.equal(d.sync.local.live_points.A, 3);
});

test('clean device follows remote changes', async () => {
  const backend = server(), d = device(backend);
  await d.sync.start(); backend.row.live_points.B = 2;
  await d.sync.sync();
  assert.equal(d.applied.at(-1).live_points.B, 2);
  assert.equal(backend.writes, 0);
});

test('simultaneous devices: CAS permits one writer; other preserves both versions', async () => {
  const backend = server(), a = device(backend), b = device(backend);
  await Promise.all([a.sync.start(), b.sync.start()]);
  change(a.sync, 1); change(b.sync, 2);
  await Promise.all([a.sync.sync(), b.sync.sync()]);
  assert.equal(a.status().state, 'saved');
  assert.equal(b.status().state, 'conflict');
  assert.equal(backend.row.live_points.A, 1);
  assert.equal(b.sync.local.live_points.A, 2);
  assert.equal(b.status().conflict.server.live_points.A, 1);
  const writes = backend.writes;
  await b.sync.sync(); assert.equal(backend.writes, writes);
});

test('edit while save is in flight remains pending after earlier save succeeds', async () => {
  const backend = server(), d = device(backend), gate = deferred(), entered = deferred();
  await d.sync.start(); change(d.sync, 1);
  const save = backend.save.bind(backend);
  backend.save = async (...args) => { entered.resolve(); await gate.promise; return save(...args); };
  const running = d.sync.sync(); await entered.promise;
  change(d.sync, 2); gate.resolve(); await running;
  assert.equal(d.sync.base.live_points.A, 1);
  assert.equal(d.sync.local.live_points.A, 2);
  assert.equal(d.status().state, 'pending');
  backend.save = save; await d.sync.sync();
  assert.equal(backend.row.live_points.A, 2);
});

test('edit during initial read is preserved, including a change back to empty', async () => {
  const backend = server({ ...empty(), attendees: ['Remote'] }), gate = deferred();
  backend.read = () => gate.promise;
  const d = device(backend);
  const running = d.sync.start(); change(d.sync, 1); change(d.sync, 0);
  gate.resolve(copy(backend.row)); await running;
  assert.equal(d.status().state, 'conflict');
  assert.deepEqual(d.sync.local.attendees, []);
  assert.equal(backend.writes, 0);
});

test('initial network failure never seeds blindly; retry reads first', async () => {
  const backend = server({ ...empty(), attendees: ['Remote'] }); backend.offline = true;
  const d = device(backend); await d.sync.start(); change(d.sync, 2);
  assert.equal(backend.writes, 0);
  backend.offline = false; await d.sync.sync();
  assert.equal(d.status().state, 'conflict');
  assert.equal(d.sync.local.live_points.A, 2);
});

test('reload restores local draft AND its baseline, then detects intervening remote edit', async () => {
  const backend = server(), a = device(backend);
  await a.sync.start(); change(a.sync, 2); a.sync.stop();
  backend.row.live_points.B = 1;
  const b = device(backend, { storage: a.storage }); await b.sync.start();
  assert.equal(b.sync.local.live_points.A, 2);
  assert.equal(b.status().state, 'conflict');
  assert.equal(b.applied[0].live_points.A, 2);
});

test('lost save response is resolved through readback without repeating write', async () => {
  const backend = server(), d = device(backend);
  await d.sync.start(); change(d.sync, 2);
  const save = backend.save.bind(backend);
  backend.save = async (...args) => { await save(...args); throw new Error('response lost'); };
  await d.sync.sync(); assert.equal(d.status().state, 'error');
  await d.sync.sync();
  assert.equal(d.status().state, 'saved'); assert.equal(backend.writes, 1);
});

test('local conflict resolution backs up both versions and detects another intervening change', async () => {
  const backend = server(), d = device(backend);
  await d.sync.start(); change(d.sync, 2); backend.row.live_points.B = 1;
  await d.sync.sync(); d.sync.resolve('local');
  assert.ok(d.storage.getItem(BACKUP_KEY));
  backend.row.live_points.B = 2;
  await d.sync.sync();
  assert.equal(d.status().state, 'conflict');
  assert.equal(backend.row.live_points.B, 2);
});

test('server conflict resolution preserves backup before replacing local draft', async () => {
  const backend = server(), d = device(backend);
  await d.sync.start(); change(d.sync, 2); backend.row.live_points.B = 1;
  await d.sync.sync(); d.sync.resolve('server');
  assert.equal(d.status().state, 'saved');
  assert.equal(d.sync.local.live_points.B, 1);
  assert.equal(JSON.parse(d.storage.getItem(BACKUP_KEY)).local.live_points.A, 2);
});

test('storage quota failure is visible and conflict resolution cannot discard data', async () => {
  const backend = server(), d = device(backend);
  await d.sync.start(); change(d.sync, 2); backend.row.live_points.B = 1;
  await d.sync.sync(); d.storage.setItem = () => { throw new Error('quota'); };
  d.sync.resolve('server');
  assert.equal(d.status().state, 'conflict'); assert.match(d.status().error, /quota/);
  change(d.sync, 3); assert.match(d.status().storageError, /quota/);
  assert.equal(d.sync.local.live_points.A, 3);
});

test('legacy local data conflicting with populated server is not silently discarded', async () => {
  const backend = server({ ...empty(), attendees: ['Server'] });
  const d = device(backend, { initial: { ...empty(), attendees: ['Local'] } });
  await d.sync.start(); assert.equal(d.status().state, 'conflict');
  assert.equal(backend.writes, 0);
});

test('empty server receives legacy seed only after a confirmed CAS', async () => {
  const backend = server(), d = device(backend, { initial: { ...empty(), attendees: ['Local'] } });
  await d.sync.start(); assert.equal(d.status().state, 'saved');
  assert.deepEqual(backend.row.attendees, ['Local']);
});

test('stopped controller cannot apply late response', async () => {
  const backend = server(), gate = deferred(); backend.read = () => gate.promise;
  const d = device(backend); const running = d.sync.start(); d.sync.stop();
  gate.resolve(copy(backend.row)); await running;
  assert.equal(d.applied.length, 0); assert.equal(d.timers.size, 0);
});

test('overlapping poll/retry produces just one active operation', async () => {
  const backend = server(), d = device(backend), gate = deferred();
  await d.sync.start(); change(d.sync); const read = backend.read.bind(backend);
  backend.read = async () => { await gate.promise; return read(); };
  const running = d.sync.sync(); await d.sync.sync(); gate.resolve(); await running;
  assert.equal(backend.writes, 1);
});

test('unreadable durable recovery record blocks automatic read/write', async () => {
  const backend = server(), storage = memoryStorage(); storage.setItem(PENDING_KEY, '{bad json');
  const d = device(backend, { storage }); await d.sync.start(); await d.sync.sync();
  assert.equal(d.status().state, 'error'); assert.equal(backend.reads, 0);
  assert.equal(storage.getItem(PENDING_KEY), '{bad json');
});

test('StrictMode empty mount/cleanup/mount does not manufacture a pending draft', async () => {
  const backend = server({ ...empty(), attendees: ['Remote'] }), storage = memoryStorage(), gate = deferred();
  const read = backend.read.bind(backend); backend.read = () => gate.promise;
  const a = device(backend, { storage }); const running = a.sync.start(); a.sync.stop();
  assert.equal(storage.getItem(PENDING_KEY), null);
  backend.read = read;
  const b = device(backend, { storage }); await b.sync.start();
  gate.resolve(copy(backend.row)); await running;
  assert.equal(b.status().state, 'saved'); assert.deepEqual(b.sync.local.attendees, ['Remote']);
});

test('transport read: SDK error, missing row, and thrown network failure never produce a baseline', async () => {
  for (const response of [{ data: null, error: new Error('read denied') }, { data: null, error: null }]) {
    const mock = sdk(response); mock.query.maybeSingle = () => mock.query;
    await assert.rejects(createSharedTransport(mock.query).read());
  }
  const mock = sdk(Promise.reject(new Error('network'))); mock.query.maybeSingle = () => mock.query;
  await assert.rejects(createSharedTransport(mock.query).read(), /network/);
});

// Test the real adapter boundary separately: a fake fluent SDK captures every
// server predicate and returns actual SDK response shapes (including errors).
function sdk(response) {
  const calls = [];
  const query = Object.fromEntries(['from', 'update', 'eq', 'is', 'select', 'abortSignal'].map(method =>
    [method, (...args) => { calls.push([method, ...args]); return query; }]));
  query.then = (resolve, reject) => Promise.resolve(response).then(resolve, reject);
  return { query, calls };
}
test('adapter uses atomic predicates for every shared field and requests returned row', async () => {
  const row = { id: 1, ...empty() }, mock = sdk({ data: [row], error: null });
  assert.deepEqual(await createSharedTransport(mock.query).save(row, empty()), row);
  assert.equal(mock.calls.filter(c => c[0] === 'eq').length, SHARED_FIELDS.length);
  assert.ok(mock.calls.some(c => c[0] === 'is' && c[1] === 'live_match_id' && c[2] === null));
  assert.ok(mock.calls.some(c => c[1] === 'live_points' && c[2] === '{"A":0,"B":0}'));
  assert.ok(mock.calls.some(c => c[0] === 'select'));
  assert.equal(mock.calls.at(-1)[0], 'abortSignal');
});
test('adapter treats zero affected rows as conflict, SDK errors as failures', async () => {
  assert.equal(await createSharedTransport(sdk({ data: [], error: null }).query).save(empty(), empty()), null);
  await assert.rejects(createSharedTransport(sdk({ data: null, error: new Error('permission denied') }).query).save(empty(), empty()), /permission denied/);
  await assert.rejects(createSharedTransport(sdk({ data: null, error: null }).query).save(empty(), empty()), /확인 응답/);
  await assert.rejects(createSharedTransport(sdk({ data: [], error: null }).query).save({}, empty()), /필드 누락/);
});
