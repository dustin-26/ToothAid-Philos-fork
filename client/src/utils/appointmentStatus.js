/** Occupies an active slot on a clinic day (quota, duplicate child in same window). */
export const isActiveBookedSlot = (a) => Boolean(a && a.status === 'SCHEDULED');

/**
 * IDs of appointments replaced by a newer SCHEDULED row (`rescheduledFromAppointmentId`).
 * Hides old CANCELLED / MISSED / etc. rows once a new booking links back.
 */
export const getSupersededAppointmentIds = (appointments) => {
  const ids = new Set();
  if (!Array.isArray(appointments)) return ids;
  for (const a of appointments) {
    if (a?.status === 'SCHEDULED' && a.rescheduledFromAppointmentId != null) {
      const from = String(a.rescheduledFromAppointmentId).trim();
      if (from) ids.add(from);
    }
  }
  return ids;
};

/**
 * Hide from schedule lists / “need to schedule” reminders: superseded by link, or canonical RESCHEDULED stub.
 */
export const isAppointmentHiddenAsSuperseded = (appt, supersededIds) => {
  if (!appt) return false;
  if (supersededIds && supersededIds.has(appt.appointmentId)) return true;
  return (
    appt.status === 'RESCHEDULED' &&
    appt.rescheduledToAppointmentId != null &&
    String(appt.rescheduledToAppointmentId).trim() !== ''
  );
};

/** Lifetime MISSED appointments for one child, excluding superseded rows. */
export const countMissedAppointments = (appointments) => {
  const supersededIds = getSupersededAppointmentIds(appointments);
  return (appointments || []).filter(
    (a) => a?.status === 'MISSED' && !isAppointmentHiddenAsSuperseded(a, supersededIds)
  ).length;
};
