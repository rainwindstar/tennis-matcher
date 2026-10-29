import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { SharedSync, createSharedTransport } from './sharedSync.js';

export function useSharedSync({ database, payload, normalize, applyRemote }) {
  const controller = useRef(null);
  const callbacks = useRef({ normalize, applyRemote });
  callbacks.current = { normalize, applyRemote };
  const [status, setStatus] = useState({ state: 'loading' });

  // Register committed user edits before timers/network callbacks can apply data.
  useLayoutEffect(() => { controller.current?.edit(payload); }, [payload]);

  useEffect(() => {
    const sync = new SharedSync({
      transport: createSharedTransport(database), initial: payload,
      normalize: row => callbacks.current.normalize(row), storage: window.localStorage,
      onRemote: row => callbacks.current.applyRemote(row), onStatus: setStatus,
    });
    controller.current = sync;
    void sync.start();
    const poll = setInterval(() => { void sync.sync(); }, 5000);
    const retry = () => { void sync.sync(); };
    const warnBeforeClose = event => {
      if (sync.dirty()) { event.preventDefault(); event.returnValue = ''; }
    };
    window.addEventListener('online', retry);
    window.addEventListener('beforeunload', warnBeforeClose);
    return () => {
      sync.stop();
      controller.current = null;
      clearInterval(poll);
      window.removeEventListener('online', retry);
      window.removeEventListener('beforeunload', warnBeforeClose);
    };
    // The controller owns the mutable snapshot; the layout effect handles edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [database]);

  return { ...status,
    retry: () => { void controller.current?.sync(); },
    resolve: choice => controller.current?.resolve(choice),
    download: () => {
      const sync = controller.current;
      if (!sync) return;
      const blob = new Blob([JSON.stringify({ local: sync.local, base: sync.base,
        server: sync.remote, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tennis-record-backup-${Date.now()}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
  };
}
