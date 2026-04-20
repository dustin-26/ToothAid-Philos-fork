# Appointment Status Changes Guide

This document summarizes the recent appointment and schedule behavior updates, including status handling, reschedule flow, follow-up creation, and simplified filters.

## What Changed

### 1) Today actions now update real appointments

Previously, some actions in the **Today** queue were reflected mainly in local queue metadata.  
Now these actions persist directly on appointment records and are queued for sync:

- `ATTENDED`
- `CANCELLED`
- `RESCHEDULED`
- undo actions back to `SCHEDULED`

This ensures status changes are reflected consistently across:

- Today view
- Schedule Day view
- Sync to backend / other devices

### 2) Appointment status audit fields added

Appointments now support audit metadata:

- `statusChangedAt`
- `statusChangedBy`
- `statusReason`

This gives traceability for who changed status, when, and why.

### 3) Reschedule linking between old and new appointments

Rescheduling now links appointment records:

- old appointment: marked `RESCHEDULED`
- new appointment: created as `SCHEDULED`
- relationship fields:
  - `rescheduledFromAppointmentId`
  - `rescheduledToAppointmentId`

This makes reschedule history explicit and queryable.

### 4) Follow-up and contact records added

Appointments now support follow-up tracking fields:

- `followUpNeeded`
- `followUpDueAt`
- `followUps[]`
- `contactLogs[]`

When status is set to `CANCELLED` or `RESCHEDULED`, the app auto-creates:

- a reminder item (`followUps[]`)
- a contact/outreach entry (`contactLogs[]`)

Current default behavior:

- follow-up due time: ~24 hours from action
- contact entry: outbound SMS, pending outcome

## Schedule Day Simplification

### Simplified status labels

Raw appointment statuses are grouped into simpler UI labels:

- `SCHEDULED` -> **Scheduled**
- `CANCELLED` / `RESCHEDULED` -> **Needs follow-up**
- `ATTENDED` / `MISSED` -> **Done**

### Color badges

Status badges are color-coded:

- **Scheduled**: blue
- **Needs follow-up**: amber
- **Done**: green

### Filter options (final)

Schedule Day now exposes only these filters:

- **Follow-up**
- **Scheduled**
- **Completed**

Mapping:

- `Follow-up` -> `CANCELLED`, `RESCHEDULED`
- `Scheduled` -> `SCHEDULED`
- `Completed` -> `ATTENDED`, `MISSED`

## Data / Sync Notes

- Status changes are stored in local DB and queued via outbox (`UPSERT_APPOINTMENT`).
- Online flow attempts immediate sync.
- Pull merge logic keeps new appointment fields (audit, follow-up, contact logs, reschedule links) from being dropped.

## Quick Test Checklist

### A) Cancel flow

1. Open Today queue item.
2. Tap **Cancelled**.
3. Confirm in Schedule Day:
   - item appears in **Follow-up**
   - row label shows **Needs follow-up**
4. Sync and reload; status remains correct.

### B) Reschedule flow

1. In Today, tap **Rescheduled**.
2. Create a new appointment.
3. Verify:
   - old appointment is `RESCHEDULED` (Follow-up)
   - new appointment is `SCHEDULED` (Scheduled)
   - link fields are present between old/new records

### C) Undo flows

1. Undo Cancel or Undo Reschedule.
2. Verify appointment returns to `SCHEDULED`.
3. Verify it appears under **Scheduled** filter.

### D) Completed flow

1. Mark as **Attended**.
2. Verify appointment appears under **Completed** filter with **Done** badge.

## Files Impacted (high-level)

- `client/src/pages/Home.jsx`
- `client/src/pages/AppointmentPage.jsx`
- `client/src/pages/ScheduleDay.jsx`
- `client/src/db/indexedDB.js`
- `server/models/Appointment.js`

