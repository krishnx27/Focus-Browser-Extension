import { useState, useEffect, useCallback } from 'react';
import { AppSettings, SettingsKey } from '../../shared/schema';
import { getSetting, setSetting, onSettingsChanged } from '../../shared/storage';

export function useStorage<K extends SettingsKey>(
  key: K
): [AppSettings[K] | undefined, (v: AppSettings[K]) => Promise<void>, boolean] {
  const [value, setLocal] = useState<AppSettings[K] | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getSetting(key).then(v => {
      if (alive) { setLocal(v); setLoading(false); }
    });
    const unsub = onSettingsChanged(changes => {
      if (changes[key] && alive) setLocal(changes[key].newValue as AppSettings[K]);
    });
    return () => { alive = false; unsub(); };
  }, [key]);

  const update = useCallback(async (v: AppSettings[K]) => {
    setLocal(v);
    await setSetting(key, v);
  }, [key]);

  return [value, update, loading];
}
