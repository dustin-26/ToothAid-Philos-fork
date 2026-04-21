/** Priority display: P0 red, P1 yellow, P2 green, P3 neutral (no fill). */

export const PRIORITY_SORT_RANK = { P0: 0, P1: 1, P2: 2, P3: 3 };

export function prioritySortValue(p) {
  return PRIORITY_SORT_RANK[String(p ?? '').trim().toUpperCase()] ?? 99;
}

/** Pill / badge style for read-only labels */
export function getPriorityPillStyle(p) {
  const v = String(p || 'P2').toUpperCase();
  if (v === 'P0') return { label: 'P0', color: '#b91c1c', bg: 'rgba(220, 38, 38, 0.18)' };
  if (v === 'P1') return { label: 'P1', color: '#854d0e', bg: 'rgba(250, 204, 21, 0.35)' };
  if (v === 'P2') return { label: 'P2', color: '#14532d', bg: 'rgba(34, 197, 94, 0.22)' };
  if (v === 'P3') return { label: 'P3', color: '#4b5563', bg: 'rgba(229, 231, 235, 0.9)' };
  return { label: v, color: '#4b5563', bg: 'rgba(229, 231, 235, 0.9)' };
}

/** Selected-state style for priority buttons */
export function getPriorityButtonStyle(p, selected) {
  const v = String(p || '').toUpperCase();
  const base = {
    flex: 1,
    minWidth: '52px',
    padding: '10px 8px',
    borderRadius: '10px',
    fontWeight: 800,
    fontSize: '14px',
    cursor: 'pointer',
    border: '2px solid transparent',
    transition: 'transform 0.08s ease, box-shadow 0.12s ease'
  };
  if (v === 'P0') {
    return {
      ...base,
      background: selected ? '#dc2626' : '#fecaca',
      color: selected ? '#fff' : '#991b1b',
      borderColor: selected ? '#b91c1c' : '#fca5a5',
      boxShadow: selected ? '0 0 0 2px rgba(220, 38, 38, 0.25)' : 'none'
    };
  }
  if (v === 'P1') {
    return {
      ...base,
      background: selected ? '#eab308' : '#fef9c3',
      color: selected ? '#422006' : '#854d0e',
      borderColor: selected ? '#ca8a04' : '#fde047',
      boxShadow: selected ? '0 0 0 2px rgba(234, 179, 8, 0.35)' : 'none'
    };
  }
  if (v === 'P2') {
    return {
      ...base,
      background: selected ? '#16a34a' : '#bbf7d0',
      color: selected ? '#fff' : '#14532d',
      borderColor: selected ? '#15803d' : '#86efac',
      boxShadow: selected ? '0 0 0 2px rgba(22, 163, 74, 0.28)' : 'none'
    };
  }
  if (v === 'P3') {
    return {
      ...base,
      background: selected ? '#f3f4f6' : '#fff',
      color: '#6b7280',
      borderColor: selected ? '#9ca3af' : '#e5e7eb',
      boxShadow: selected ? '0 0 0 2px rgba(156, 163, 175, 0.35)' : 'none'
    };
  }
  return { ...base, background: '#f3f4f6', color: '#374151', borderColor: '#d1d5db' };
}
