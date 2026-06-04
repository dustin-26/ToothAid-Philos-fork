/** Occupies an active slot on a clinic day (quota, duplicate child in same window). */
export const isActiveBookedSlot = (a) => Boolean(a && a.status === 'SCHEDULED');

/** True when the appointment was originally added via the Schedule page waiting list. */
export const isWaitlistOriginAppointment = (appt) => {
  if (!appt) return false;
  const via = appt.metadata?.waitlistRequestedVia;
  return via != null && String(via).trim() !== '';
};

/** Restore a previously scheduled waitlist appointment back to the waiting list. */
export const buildWaitlistRevertPayload = (appt, overrides = {}) => ({
  ...appt,
  clinicDayId: 'UNASSIGNED',
  timeWindow: 'FULL',
  slotNumber: null,
  status: 'TO_BE_SCHEDULED',
  order: null,
  statusChangedAt: null,
  statusChangedBy: null,
  statusReason: null,
  followUpNeeded: false,
  followUpDueAt: null,
  ...overrides
});

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
