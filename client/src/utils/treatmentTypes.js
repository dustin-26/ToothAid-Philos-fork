/**
 * Treatment type options for visits.
 * Some have sub-options (extraction type/counts, fillings details, temporary filling surfaces).
 */
export const TREATMENT_OPTIONS = [
  { id: 'oral_prophylaxis', label: 'Oral Prophylaxis' },
  { id: 'topical_fluoride', label: 'Topical Fluoride Application' },
  { id: 'sealants', label: 'Pits and Fissure Sealants' },
  { id: 'extraction', label: 'Extraction', subType: 'extraction' },
  { id: 'fillings', label: 'Fillings / Restorations', subType: 'fillings' },
  { id: 'temporary_filling', label: 'Temporary Filling per Surface', subType: 'temporary_filling' },
  { id: 'consultation', label: 'Consultation' },
  { id: 'xrays', label: 'X-Rays' },
  { id: 'sdf', label: 'Silver Diamine Fluoride' },
  { id: 'oral_exam', label: 'Oral Examination' },
  { id: 'others', label: 'Others' }
];

export const EXTRACTION_CHOICES = [
  { value: 'Permanent', label: 'Permanent Teeth' },
  { value: 'Temporary', label: 'Temporary Teeth' }
];

/**
 * Build treatmentTypes array for API from form state.
 */
export function buildTreatmentTypesArray({
  selectedIds,
  extractionType,
  extractionPermanentCount,
  extractionTemporaryCount,
  fillingsNumberOfTeeth,
  fillingsGlassIonomer,
  fillingsComposite,
  temporaryFillingSurfaces
}) {
  const result = [];
  for (const opt of TREATMENT_OPTIONS) {
    if (!selectedIds.includes(opt.id)) continue;
    if (opt.subType === 'extraction') {
      const perm = extractionPermanentCount?.trim() ? parseInt(extractionPermanentCount, 10) : 0;
      const temp = extractionTemporaryCount?.trim() ? parseInt(extractionTemporaryCount, 10) : 0;
      if (perm > 0 || temp > 0) {
        const parts = [];
        if (perm > 0) parts.push(`Permanent: ${perm}`);
        if (temp > 0) parts.push(`Temporary: ${temp}`);
        result.push(`Extraction (${parts.join(', ')})`);
      }
    } else if (opt.subType === 'fillings') {
      const n = fillingsNumberOfTeeth?.trim() ? parseInt(fillingsNumberOfTeeth, 10) : 0;
      const gi = fillingsGlassIonomer?.trim() ? parseInt(fillingsGlassIonomer, 10) : 0;
      const comp = fillingsComposite?.trim() ? parseInt(fillingsComposite, 10) : 0;
      result.push(`Fillings / Restorations (Teeth: ${n}, GI: ${gi}, Composite: ${comp})`);
    } else if (opt.subType === 'temporary_filling') {
      const s = temporaryFillingSurfaces?.trim() ? parseInt(temporaryFillingSurfaces, 10) : 0;
      result.push(`Temporary Filling per Surface (Surfaces: ${s})`);
    } else {
      result.push(opt.label);
    }
  }
  return result;
}

/**
 * Parse existing visit.treatmentTypes back into form state (for edit mode).
 */
export function parseTreatmentTypesForForm(treatmentTypes = []) {
  const selectedIds = [];
  let extractionType = '';
  let extractionPermanentCount = '';
  let extractionTemporaryCount = '';
  let fillingsNumberOfTeeth = '';
  let fillingsGlassIonomer = '';
  let fillingsComposite = '';
  let temporaryFillingSurfaces = '';

  for (const t of treatmentTypes) {
    if (t.startsWith('Extraction (')) {
      selectedIds.push('extraction');
      if (t.includes('Permanent')) extractionType = 'Permanent';
      if (t.includes('Temporary')) extractionType = extractionType ? extractionType : 'Temporary';
      const bothMatch = t.match(/Permanent:\s*(\d+),\s*Temporary:\s*(\d+)/i);
      const permOnlyMatch = t.match(/Permanent:\s*(\d+)\)/i);
      const tempOnlyMatch = t.match(/Temporary:\s*(\d+)\)/i);
      if (bothMatch) {
        extractionPermanentCount = bothMatch[1];
        extractionTemporaryCount = bothMatch[2];
      } else if (permOnlyMatch) {
        extractionPermanentCount = permOnlyMatch[1];
      } else if (tempOnlyMatch) {
        extractionTemporaryCount = tempOnlyMatch[1];
      } else {
        const permMatch = t.match(/Permanent Teeth:\s*(\d+)/i);
        const tempMatch = t.match(/Temporary Teeth:\s*(\d+)/i);
        if (permMatch) extractionPermanentCount = permMatch[1];
        if (tempMatch) extractionTemporaryCount = tempMatch[1];
      }
    } else if (t.startsWith('Fillings / Restorations (')) {
      selectedIds.push('fillings');
      const match = t.match(/\(Teeth:\s*(\d+),\s*GI:\s*(\d+),\s*Composite:\s*(\d+)\)/i) || t.match(/\((\d+)\s*teeth,\s*GI:\s*(\d+),\s*Composite:\s*(\d+)\)/i);
      if (match) {
        fillingsNumberOfTeeth = match[1];
        fillingsGlassIonomer = match[2];
        fillingsComposite = match[3];
      }
    } else if (t.startsWith('Temporary Filling per Surface (')) {
      selectedIds.push('temporary_filling');
      const m = t.match(/\(Surfaces:\s*(\d+)\)/i) || t.match(/\((\d+)\)/);
      if (m) temporaryFillingSurfaces = m[1];
    } else {
      const opt = TREATMENT_OPTIONS.find(o => o.label === t && !o.subType);
      if (opt) selectedIds.push(opt.id);
    }
  }

  return {
    selectedIds: [...new Set(selectedIds)],
    extractionType: extractionType || 'Permanent',
    extractionPermanentCount,
    extractionTemporaryCount,
    fillingsNumberOfTeeth,
    fillingsGlassIonomer,
    fillingsComposite,
    temporaryFillingSurfaces
  };
}

/** Big-title labels only (for charts). Same order as TREATMENT_OPTIONS. */
export const TREATMENT_CHART_LABELS = TREATMENT_OPTIONS.map(o => o.label);

/**
 * Map a stored treatment string to a chart category (big title) and value.
 * For Extraction: value = sum of permanent + temporary teeth. For others: value = 1 (occurrence).
 * Returns { category: string, value: number }.
 */
export function getTreatmentCategoryAndValue(treatmentString) {
  const t = (treatmentString || '').trim();
  if (!t) return null;

  /** Visit entry: per-tooth treatment stored as "Tooth 36: Cleaning" — chart by underlying label */
  const toothScoped = t.match(/^Tooth\s+[^:]+:\s*(.+)$/i);
  if (toothScoped) return getTreatmentCategoryAndValue(toothScoped[1].trim());

  if (t.startsWith('Extraction (')) {
    let perm = 0;
    let temp = 0;
    const bothMatch = t.match(/Permanent:\s*(\d+),\s*Temporary:\s*(\d+)/i);
    const permOnlyMatch = t.match(/Permanent:\s*(\d+)\)/i);
    const tempOnlyMatch = t.match(/Temporary:\s*(\d+)\)/i);
    if (bothMatch) {
      perm = parseInt(bothMatch[1], 10);
      temp = parseInt(bothMatch[2], 10);
    } else if (permOnlyMatch) {
      perm = parseInt(permOnlyMatch[1], 10);
    } else if (tempOnlyMatch) {
      temp = parseInt(tempOnlyMatch[1], 10);
    } else {
      const permMatch = t.match(/Permanent Teeth:\s*(\d+)/i);
      const tempMatch = t.match(/Temporary Teeth:\s*(\d+)/i);
      if (permMatch) perm = parseInt(permMatch[1], 10);
      if (tempMatch) temp = parseInt(tempMatch[1], 10);
    }
    const total = perm + temp;
    return { category: 'Extraction', value: total > 0 ? total : 1 };
  }
  if (t.startsWith('Fillings / Restorations (')) return { category: 'Fillings / Restorations', value: 1 };
  if (t.startsWith('Temporary Filling per Surface (')) return { category: 'Temporary Filling per Surface', value: 1 };

  // Match exact label (including Extraction, Fillings, etc. when stored without parenthetical detail)
  const exact = TREATMENT_OPTIONS.find(o => o.label === t);
  if (exact) return { category: exact.label, value: 1 };
  /** Custom or future treatment strings: keep their own category so reports stay accurate. */
  return { category: t.length > 120 ? `${t.slice(0, 117)}…` : t, value: 1 };
}
