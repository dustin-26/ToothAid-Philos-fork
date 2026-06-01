/** Follow-up timing set on visits when requiresFollowUp is true. */

export const FOLLOW_UP_WITHIN_7_DAYS = 'WITHIN_7_DAYS';
export const FOLLOW_UP_WITHIN_14_DAYS = 'WITHIN_14_DAYS';
export const FOLLOW_UP_WHENEVER = 'WHENEVER';

export const FOLLOW_UP_TIMING_VALUES = [
  FOLLOW_UP_WITHIN_7_DAYS,
  FOLLOW_UP_WITHIN_14_DAYS,
  FOLLOW_UP_WHENEVER
];

export const FOLLOW_UP_TIMING_OPTIONS = [
  { value: FOLLOW_UP_WITHIN_7_DAYS, label: 'Within 7 days' },
  { value: FOLLOW_UP_WITHIN_14_DAYS, label: 'Within 14 days' },
  { value: FOLLOW_UP_WHENEVER, label: 'Whenever convenient' }
];

const SORT_RANK = {
  [FOLLOW_UP_WITHIN_7_DAYS]: 0,
  [FOLLOW_UP_WITHIN_14_DAYS]: 1,
  [FOLLOW_UP_WHENEVER]: 2
};

/** Normalize stored value; maps legacy P0–P3 to new windows. */
export function normalizeFollowUpTiming(raw) {
  const s = String(raw ?? '').trim();
  if (FOLLOW_UP_TIMING_VALUES.includes(s)) return s;
  if (s === 'P0' || s === 'P1') return FOLLOW_UP_WITHIN_7_DAYS;
  if (s === 'P2') return FOLLOW_UP_WITHIN_14_DAYS;
  if (s === 'P3') return FOLLOW_UP_WHENEVER;
  return FOLLOW_UP_WITHIN_14_DAYS;
}

export function followUpSortRank(timing) {
  return SORT_RANK[normalizeFollowUpTiming(timing)] ?? 99;
}

export function getFollowUpTimingLabel(timing) {
  const t = normalizeFollowUpTiming(timing);
  const opt = FOLLOW_UP_TIMING_OPTIONS.find((o) => o.value === t);
  return opt?.label ?? 'Within 14 days';
}

export function isUrgentFollowUpTiming(timing) {
  return normalizeFollowUpTiming(timing) === FOLLOW_UP_WITHIN_7_DAYS;
}

/** Due date from visit date + window; null for whenever. */
export function computeFollowUpDueAt(visitDate, timing) {
  const t = normalizeFollowUpTiming(timing);
  const base = visitDate ? new Date(visitDate) : null;
  if (!base || Number.isNaN(base.getTime())) return null;
  if (t === FOLLOW_UP_WHENEVER) return null;
  const days = t === FOLLOW_UP_WITHIN_7_DAYS ? 7 : 14;
  const due = new Date(base);
  due.setDate(due.getDate() + days);
  return due.toISOString();
}

export function visitRequiresFollowUp(v) {
  return Boolean(v?.childId && v?.visitId && (v.requiresFollowUp === true || v.requiresFollowUp === 'true'));
}

/** Latest visit per child that still requires a follow-up appointment. */
export function buildLatestFollowUpByChild(visits) {
  const map = new Map();
  if (!Array.isArray(visits)) return map;
  for (const v of visits) {
    if (!visitRequiresFollowUp(v)) continue;
    const childId = v.childId;
    const ts = new Date(v.updatedAt || v.createdAt || v.date || 0).getTime();
    const cur = map.get(childId);
    if (!cur || ts > cur.ts) {
      const timing = normalizeFollowUpTiming(v.followUpPriority);
      map.set(childId, {
        ts,
        timing,
        dueAt:
          v.followUpDueAt != null && String(v.followUpDueAt).trim() !== ''
            ? new Date(v.followUpDueAt).toISOString()
            : computeFollowUpDueAt(v.date, timing),
        visitId: v.visitId
      });
    }
  }
  return map;
}

export function isValidFollowUpTiming(value) {
  return FOLLOW_UP_TIMING_VALUES.includes(String(value ?? '').trim());
}
