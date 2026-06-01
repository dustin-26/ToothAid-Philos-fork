export const APPOINTMENT_PROCEDURE_PRESETS = [
  'Cleaning',
  'Fluoride',
  'Sealant',
  'Filling',
  'Extraction'
];

export const APPOINTMENT_PROCEDURE_UI_OTHER = 'Other';

export function isPresetProcedureType(value) {
  const v = String(value ?? '').trim();
  return APPOINTMENT_PROCEDURE_PRESETS.includes(v);
}

/** Map stored procedureType to form select + custom field. */
export function procedureTypeToFormState(procedureType) {
  const v = String(procedureType ?? '').trim();
  if (!v) return { select: '', custom: '' };
  if (isPresetProcedureType(v)) return { select: v, custom: '' };
  return { select: APPOINTMENT_PROCEDURE_UI_OTHER, custom: v };
}

/** Value to persist on appointment. */
export function resolveProcedureTypeForSave(select, custom) {
  const sel = String(select ?? '').trim();
  if (!sel) return null;
  if (sel === APPOINTMENT_PROCEDURE_UI_OTHER) {
    const c = String(custom ?? '').trim();
    return c || null;
  }
  return sel;
}

export function formatProcedureTypeDisplay(procedureType) {
  const v = String(procedureType ?? '').trim();
  return v || '—';
}
