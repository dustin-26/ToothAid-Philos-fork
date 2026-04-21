import { useCallback, useEffect, useMemo, useState } from 'react';

function loadExtras(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    const p = raw ? JSON.parse(raw) : [];
    return Array.isArray(p)
      ? p.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim())
      : [];
  } catch {
    return [];
  }
}

/**
 * Merges immutable `defaultList` with extra strings from localStorage.
 */
export function useEditablePresets(storageKey, defaultList) {
  const [extras, setExtras] = useState(() => loadExtras(storageKey));

  useEffect(() => {
    setExtras(loadExtras(storageKey));
  }, [storageKey]);

  const list = useMemo(() => {
    const seen = new Set(defaultList.map((d) => String(d).toLowerCase()));
    const out = [...defaultList];
    for (const e of extras) {
      const t = String(e).trim();
      if (!t) continue;
      const k = t.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(t);
    }
    return out;
  }, [defaultList, extras]);

  const writeExtras = useCallback((next) => {
    setExtras(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const saveShortcut = useCallback(
    (label) => {
      const t = String(label || '').trim();
      if (!t) return;
      if (list.some((x) => String(x).toLowerCase() === t.toLowerCase())) return;
      writeExtras([...extras, t]);
    },
    [extras, list, writeExtras]
  );

  const renameExtra = useCallback(
    (oldLabel, newLabel) => {
      const t = String(newLabel || '').trim();
      if (!t) return;
      const next = extras.map((x) => (x === oldLabel ? t : x));
      writeExtras(next);
    },
    [extras, writeExtras]
  );

  const removeExtra = useCallback(
    (label) => {
      writeExtras(extras.filter((x) => x !== label));
    },
    [extras, writeExtras]
  );

  const isDefault = useCallback((label) => defaultList.some((d) => d === label), [defaultList]);

  return { list, extras, saveShortcut, renameExtra, removeExtra, isDefault };
}

export const LONG_PRESS_MS = 550;
