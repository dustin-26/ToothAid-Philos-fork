import { formatChildDisplayName } from './displayName';
import { parseYmd, toYmd } from './dates';

export const PROCEDURE_VISAYAN_LABELS = {
  Cleaning: 'Paglimpyo sa ngipon',
  'Oral Prophylaxis': 'Paglimpyo sa ngipon',
  Fluoride: 'Pagbutang ug fluoride',
  'Topical Fluoride Application': 'Pagbutang ug fluoride',
  Sealant: 'Pagbutang ug sealant',
  'Pits and Fissure Sealants': 'Pagbutang ug sealant',
  Filling: 'Pasta sa ngipon',
  'Fillings / Restorations': 'Pasta sa ngipon',
  'Temporary Filling per Surface': 'Temporary nga pasta sa ngipon',
  Extraction: 'Pag-ibot sa ngipon',
  Consultation: 'Konsultasyon',
  'X-Rays': 'X-ray',
  'Silver Diamine Fluoride': 'Silver diamine fluoride',
  'Oral Examination': 'Eksaminasyon sa ngipon',
  Others: 'Uban pa'
};

const stripProcedureDetails = (procedureType) =>
  String(procedureType ?? '')
    .trim()
    .replace(/^Tooth\s+[^:]+:\s*/i, '')
    .replace(/\s*\([^)]*\)\s*$/g, '')
    .trim();

export function translateProcedureToVisayan(procedureType) {
  const raw = String(procedureType ?? '').trim();
  const base = stripProcedureDetails(raw);
  if (!base) return 'Pag-atiman sa ngipon';
  return PROCEDURE_VISAYAN_LABELS[base] || PROCEDURE_VISAYAN_LABELS[raw] || raw;
}

export function formatAppointmentMessageDate(dateValue) {
  const dateKey = toYmd(dateValue);
  const date = parseYmd(dateKey);
  if (!date) return String(dateValue ?? '').trim();
  const month = date.toLocaleString('en-US', { month: 'long' });
  const day = date.getDate();
  const weekday = date.toLocaleString('en-US', { weekday: 'long' });
  return `${month} ${day} ${weekday}`;
}

export function formatAppointmentMessageTimeWindow(timeWindow) {
  return timeWindow === 'PM' ? 'afternoon' : 'morning';
}

export function formatAppointmentMessageLocation(location) {
  const raw = String(location ?? '').trim();
  const upper = raw.toUpperCase();
  if (!raw || raw === '—') return '';
  if (upper.includes('BOCTOL')) return 'BOCTOL';
  if (upper.includes('JCES') || upper.includes('JECS') || upper.includes('JAGNA CENTRAL')) return 'JECS';
  return raw;
}

export function buildAppointmentScheduleMessage({ child, appointment, date, location }) {
  const procedure = translateProcedureToVisayan(appointment?.procedureType);
  const name = formatChildDisplayName(child);
  const dateText = formatAppointmentMessageDate(date);
  const timeText = formatAppointmentMessageTimeWindow(appointment?.timeWindow);
  const locationText = formatAppointmentMessageLocation(location);

  return [
    `Schedule for ${procedure}`,
    name,
    dateText,
    timeText,
    locationText ? `@ ${locationText}` : ''
  ]
    .filter((line) => line != null && String(line).trim() !== '')
    .join('\n');
}
