# SIGHT / ToothAid — Detailed feature list

This document reflects **routes and behaviour wired in `client/src/App.jsx`** as of the current codebase. Some additional page components exist under `client/src/pages/` but are **not** reachable from the live router unless linked elsewhere (e.g. legacy clinic-day list/roster flows).

---

## 1. Application shell & platform

| Feature | Description |
|--------|-------------|
| **Progressive Web App (PWA)** | Vite + `vite-plugin-pwa`; installable; service worker for offline asset caching. |
| **Responsive layout** | Single-column mobile-first layout; max-width container; safe-area aware bottom navigation. |
| **Bottom navigation** | Four tabs: **Today** (`/`), **Children** (`/children`), **Schedule** (`/schedule`), **Reports** (`/reports`). |
| **Global offline banner** | When `navigator.onLine` is false, a sticky banner states that changes will sync when online. |
| **Sync feedback** | Top sync toast (success/error); “Syncing…” pill indicator during automatic sync. |
| **Toast notifications** | In-app toasts (e.g. save success/error) via `ToastHost` / `notify.js`. |
| **Route guarding** | All app routes except `/login` require a JWT in `localStorage`; otherwise redirect to login. |
| **Main layout** | `MainLayout` wraps authenticated routes and hosts the toast layer. |

---

## 2. Authentication (`/login`)

| Feature | Description |
|--------|-------------|
| **Sign in** | `POST` to API auth login; stores `token` and `username` in `localStorage`; navigates to Today. |
| **Register account** | Toggle to registration mode; password + confirm; minimum length check; `POST` register; auto-login on success. |
| **Demo quick-fill** | Button to pre-fill demo credentials (when using seeded `demo` user). |
| **Error handling** | Clear messages for wrong credentials, network failure, non-JSON/empty API responses, wrong `VITE_API_URL`. |
| **Logout** | Available from Today page; clears token and username; navigates to `/login`. |

---

## 3. Today / home (`/`)

| Feature | Description |
|--------|-------------|
| **Date context** | Uses local “today” as `YYYY-MM-DD` for clinic-day matching. |
| **Online / offline status** | Visual indicator (green/grey) plus copy. |
| **Sync card** | Shows **pending outbox operation count**, **last sync time**, optional last sync message. |
| **Manual sync** | **Sync** button runs `performSync` when online; disabled while syncing or offline. |
| **AM / PM waiting lists** | Builds queues from **today’s clinic day(s)** and **non-cancelled appointments**; stable ordering from appointment `createdAt`. |
| **Per-slot capacity hint** | Displays something like `n / 3` per window (max slots). |
| **Reorder queue** | Move up/down within AM or PM list; order persisted in local meta + outbox-driven sync where implemented. |
| **Expand row** | Tap row to expand actions for that queue entry. |
| **Patient display** | **PatientNameBlock**: display name + **Patient ID** line. |
| **Statuses** | Rows reflect appointment/queue status (e.g. WAITING, ATTENDED, CANCELLED, etc.) with muted styling when not active. |
| **Open profile** | Navigate to child profile. |
| **Book / appointment shortcut** | From expanded state, open **Appointment** flow for that child (with return state). |
| **Contact** | Opens **PatientContactModal** with phone (call/SMS) and messenger (open link / copy). |
| **Add appointment** | Button navigates to **Schedule day** for today with state to open “add appointment” modal and preselect AM/PM. |

*Note: Today’s queue is appointment-driven. The **floating “+”** to register a new child is on the **Children** search page, not on Today.*

---

## 4. Children — search & list (`/children`)

| Feature | Description |
|--------|-------------|
| **Load all children** | On mount, loads full local child list from IndexedDB. |
| **Search** | From **2+ characters**, uses `searchChildren`: name fields, school, barangay, and **numeric patient ID** substring match. |
| **Filters (toolbar)** | **School** (presets + “Others”), **Grade**, **Class**; three-column filter row. |
| **Clear filters** | Resets school/grade/class filters. |
| **Sort modes** | **By priority** (P0→P3) or **by most recent visit date**. |
| **Result cards** | Link to profile; **PatientNameBlock** + **priority pill**; line for school • grade • class. |
| **Empty / no-results states** | Copy for no registry vs no matches. |
| **Register shortcut** | Entry point to `/children/register` (e.g. FAB). |

---

## 5. Register new child (`/children/register`)

| Feature | Description |
|--------|-------------|
| **Form fields** | First/last name, DOB, age, sex, school (presets + other), grade, class, barangay, guardian phone, messenger, notes, etc. (see page). |
| **Patient ID** | Generation/validation utilities (`patientId.js`); **6-digit** style aligned with server normalisation where applicable. |
| **Duplicate detection** | `checkDuplicates` against existing children; warning list with **PatientNameBlock**-style display + school/DOB/age hints. |
| **Submit** | `upsertChild`, outbox, optional immediate `performSync` when online. |
| **Navigation** | Back link to children list. |

---

## 6. Child profile (`/children/:childId`)

| Feature | Description |
|--------|-------------|
| **Header** | `PageHeader`: display name, **secondary line Patient ID**, subtitle (e.g. school • barangay). |
| **Contact** | Opens **PatientContactModal** (call / SMS / messenger). |
| **View / edit child** | Toggle edit mode; form with school presets, “Other” school mode, grades, contacts, notes, **patient ID** editing with validation. |
| **Save / cancel** | Persists via `upsertChild` + outbox; sync when online. |
| **Priority** | Shown as coloured pill (P0–P3) next to **PatientNameBlock** in view mode. |
| **Details collapsible** | “Details” expands: **PatientNameBlock** + sex, DOB, age, school, grade, class, barangay, phone, messenger, notes, created/updated by. |
| **Consent** | View consent status; **Edit** opens consent editor (general consent date + specific procedures with dates). |
| **Tooth chart summary** | Persisted **toothStates** per tooth; visual grid in profile consistent with visit chart palette. |
| **Visit history** | List of visits sorted by `createdAt` then date; expandable cards with tooth grids (primary/permanent), medications, legacy treatment types, chief complaint, notes. |
| **Per-visit actions** | **Edit** visit, **Delete** visit (confirm + outbox). |
| **Add visit** | Link to `/children/:childId/visit-entry`. |
| **Appointment** | Link to `/children/:childId/appointment`. |
| **Delete child** | Confirm dialog; `deleteChild` + cascade local appointments/visits + outbox; sync; navigate to children list. |
| **Refresh** | Refetch on navigation state `refreshVisits`; refetch on window focus when on profile. |

---

## 7. Visit entry & edit (`/children/:childId/visit-entry`, `/children/:childId/visit-entry/:visitId`)

| Feature | Description |
|--------|-------------|
| **New vs edit** | Same page; loads existing visit when `visitId` present. |
| **Header** | **PatientNameBlock** in page header context. |
| **Date** | Date picker for visit date. |
| **Chief complaint — symptoms** | Toggle chips: **Pain, Swelling, Bleeding, Sensitivity**; custom symptoms; per-symptom **duration in days**. |
| **Dentition** | **Permanent / Primary** toggle for tooth examination flow. |
| **Tooth examination(s)** | One or more examinations; pick tooth from **FDI grid**; per-tooth **condition** (colour-coded presets); optional tooth note. |
| **Treatments per tooth** | Quick toggles (e.g. Cleaning, Fluoride, Sealant, Filling, Extraction); custom treatment text; remove tags. |
| **Persisted tooth condition** | When selecting a tooth, can preload condition from child **toothStates**. |
| **Medication section** | Quick-add common meds; structured fields (name, dosage, frequency, days); list with remove. |
| **Visit notes** | Free-text notes. |
| **Save** | Writes visit + outbox; sync when online; navigate back to profile with refresh flag. |
| **UI** | Chip-style toggles aligned with global `.chip-toggle` styles; primary/secondary buttons. |

---

## 8. Appointments from profile (`/children/:childId/appointment`)

| Feature | Description |
|--------|-------------|
| **Calendar month view** | Select **year/month**; grid of days; pick a date. |
| **Clinic day awareness** | Uses `getAllClinicDays`; resolves quota for selected date. |
| **AM/PM window** | Choose **AM** or **PM**; shows remaining vs total when quota exists. |
| **Priority & note** | P0–P3 and optional note. |
| **Quota full handling** | In-app dialog to **bump quota** and still book (creates/updates clinic day + appointment). |
| **Save** | `upsertAppointment` + outbox; optional sync. |
| **Navigation** | Respects `returnTo` state (e.g. back to Today). |

---

## 9. Schedule — month (`/schedule`)

| Feature | Description |
|--------|-------------|
| **Weekday-only month grid** | Monday–Friday cells only; weekends omitted. |
| **Per-day summary** | For days with quota records: **location** (e.g. BOCTOL/CENTRAL), **AM/PM remaining/total**; days with **no** AM/PM capacity hidden or de-emphasised (per implementation). |
| **Past vs future** | Future (or non-today) behaviour may grey out or restrict selection per product rules. |
| **Navigate to day** | Tap day → `/schedule/:date` (`YYYY-MM-DD`). |
| **Batch update (weekly)** | Modal: select **weekdays** (Mon–Fri chips), **location**, **AM/PM numeric quotas**, **Apply to this month** — writes/merges `clinicDay` rows + outbox + optional `syncPush`. |
| **Month navigation** | Change visible month/year. |
| **Data refresh** | Reload on window focus / location key change. |

---

## 10. Schedule — day (`/schedule/:date`)

| Feature | Description |
|--------|-------------|
| **Stable clinic day id** | `clinicday-YYYY-MM-DD` used to attach appointments. |
| **Quota editor** | **Location** (select), **AM quota**, **PM quota**; **Save** updates `upsertClinicDay` + outbox + sync. |
| **Appointment lists** | Separate **AM** and **PM** lists; shows **PatientNameBlock**, status, priority, note snippet. |
| **Reorder** | Move scheduled appointments up/down within window; renumbers `order` field + outbox. |
| **Edit appointment** | Modal: time window, priority, note, status (e.g. SCHEDULED, CANCELLED, …). |
| **Delete appointment** | With confirm path as implemented. |
| **Add appointment** | Modal: **search by name or patient ID**; result list; pick child; AM/PM, priority, note; duplicate-slot detection; **quota full** confirm to expand quota. |
| **Contact** | Row-level contact modal. |
| **Today integration** | Route state `openAddAppointment` + `timeWindow` opens add modal with window preselected. |
| **Back to month** | Navigation back to `/schedule`. |

---

## 11. Reports (`/reports`)

| Feature | Description |
|--------|-------------|
| **Data scope** | Aggregates from local IndexedDB children + visits (and related fields) for charts. |
| **Swipeable chart deck** | Touch/drag between chart types. |
| **Chart types (examples)** | Zero cavities by grade; average decayed teeth; % with decay; F/DMFT ratio; treatments by type; treatments by school; average DMFT by school; average DMFT over time — see `Graphs.jsx` `switch` cases. |
| **Time filters** | Many charts support monthly / quarterly / half-year style buckets (`timeBuckets.js`). |
| **Interactive tooltips** | Custom active point / tooltip behaviour on charts. |
| **Export section** | **Monthly / Yearly** toggle for export range; month/year selectors when applicable. |
| **Excel export** | Treatment summary workbook via `xlsx` (`exportTreatmentSummary` utility). |
| **Dataset overview** | Summary stats (totals, schools, date ranges) as implemented in page. |

---

## 12. Offline, sync & data layer (client)

| Feature | Description |
|--------|-------------|
| **IndexedDB (Dexie)** | Tables: `children`, `visits`, `clinicDays`, `appointments`, `outbox`, `meta` (e.g. deviceId, lastSyncAt, queue snapshots). |
| **Outbox** | Mutations enqueue `UPSERT_*`, `DELETE_*` operations with stable `opId` for idempotency. |
| **Pull merge rules** | Defensive merges so server partial rows do not wipe rich local fields (visits: meds, tooth charts; children: toothStates, consent, patientId; clinic days: AM/PM capacity; appointments: notes/status/priority). |
| **Automatic sync** | On **app launch** (delayed), and when browser goes **online**; skips if no pending ops (except launch path pulls); **10s cooldown** between auto runs. |
| **Manual sync** | Today page **Sync** button. |
| **High-risk helper** | `getHighRiskVisits` exists in DB layer for pain/swelling etc. (used if legacy pages or future UI call it). |
| **Search & indexes** | Children indexed by `patientId`, names, school, barangay, `updatedAt`. |

---

## 13. Backend (API) — summary

| Feature | Description |
|--------|-------------|
| **Auth** | JWT issue on login; register endpoint; `authenticateToken` middleware on sync. |
| **Sync push** | Accepts batch of ops; **ProcessedOp** idempotency; applies UPSERT/DELETE for children, visits, clinic days, appointments. |
| **Sync pull** | Returns changes since timestamp + scope; includes tombstones / id lists as implemented. |
| **Normalisation** | e.g. `patientId` six digits; treatment type arrays; consent arrays; toothStates objects. |
| **Scripts** | `seed`, `import-csv`, migrations, `view-data` (see `server/scripts/`). |

---

## 14. Shared UI components (selected)

| **Component** | **Role** |
|---------------|----------|
| `PageHeader` | Teal header, optional back (smart parent path), title, optional secondary title (e.g. ID), subtitle, decorative icon. |
| `PatientNameBlock` | Name + **ID** line; used across lists, modals, schedule. |
| `PatientContactModal` | Phone + SMS (`sms:` link) + messenger link/copy. |
| `DateInput` | Shared date field behaviour. |
| `NavBar` | Bottom four tabs. |
| `ToastHost` | Global toast line for `notify.*` events. |

---

## 15. Not mounted in `App.jsx` (code may still exist)

The following modules appear in the repo but are **not** registered in the current `Routes` table:

- `SyncPage.jsx` (standalone sync UI — superseded by Today sync card + auto-sync)
- `RegisterChild.jsx` (alternate register flow)
- `HighRiskList.jsx`
- `ClinicDaysList.jsx`, `CreateClinicDay.jsx`, `ClinicDayRoster.jsx`, `BuildRoster.jsx`

They may be reattached later or used from deep links in older builds; treat as **non-user-facing** unless routing is restored.

---

## 16. Configuration & deployment hooks

| Item | Purpose |
|------|---------|
| `client/.env.example` | `VITE_API_URL` for production build; empty in dev → Vite proxy. |
| `server/.env.example` | `PORT`, `MONGODB_URI`, `JWT_SECRET`, optional `FRONTEND_ORIGIN`. |
| `docker-compose.yml` | Local MongoDB only. |
| `client/vite.config.js` | Dev server proxy to API. |

---

*End of feature list.*
