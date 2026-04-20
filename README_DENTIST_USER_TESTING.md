# Dentist User Testing Guide (SIGHT)

This guide helps a dentist test real day-to-day workflows in SIGHT and give clear feedback.

## Testing Goal

Confirm that the app is:

- easy to use during clinic workflow
- accurate for scheduling and appointment status updates
- reliable when internet is unstable

## Before Testing

- Use a device/browser the dentist would normally use.
- Log in with a normal clinic account (not a developer account if possible).
- Ask tester to think out loud while using the app.
- Recommended session length: 30 to 45 minutes.

## How To Capture Feedback

For each task below, collect:

- **Completion:** Done / Partly done / Not done
- **Time:** how long it took
- **Difficulty:** 1 (easy) to 5 (hard)
- **Notes:** confusion, errors, missing info, suggested improvement

---

## Task 1: Find Today’s Patients

**Scenario:** "It is morning clinic. You need to see who is waiting."

1. Open **Today** page.
2. Review AM and PM queues.
3. Open one patient from the queue.

**Observe**

- Can she quickly understand who is scheduled?
- Is patient name + patient ID easy to scan?
- Is it clear how to open patient details?

## Task 2: Update Appointment Status from Today

**Scenario:** "A patient arrived, another canceled, another needs rescheduling."

1. Mark one appointment as **Attended**.
2. Mark one as **Cancelled**.
3. Mark one as **Rescheduled**.
4. Try undoing one status back to scheduled.

**Observe**

- Does the wording match clinic language?
- Is it obvious what changed after each action?
- Is undo behavior easy to understand?

## Task 3: Confirm Schedule Day Filtering

**Scenario:** "You want to check follow-up vs completed patients."

1. Open a day in **Schedule**.
2. Switch between filters: **Follow-up**, **Scheduled**, **Completed**.
3. Confirm that changed statuses appear in expected groups.

**Observe**

- Do filter names make sense clinically?
- Does the grouping match dentist expectation?
- Are badge colors helpful and clear?

## Task 4: Book a New Appointment

**Scenario:** "You need to book a child for next week."

1. Open child profile.
2. Create a new appointment.
3. Select date, AM/PM, and save.
4. Verify it appears in the right day and time window.

**Observe**

- Is calendar/day selection smooth?
- Is quota information understandable?
- Any uncertainty before pressing Save?

## Task 5: Reschedule Flow Validation

**Scenario:** "Parent asks to move appointment to another day."

1. Start reschedule from an existing appointment.
2. Create replacement appointment.
3. Verify old appointment appears as follow-up and new one as scheduled.

**Observe**

- Is it clear which is the old appointment vs new one?
- Does the flow feel safe (low chance of accidental mistakes)?

## Task 6: Contact and Follow-Up Experience

**Scenario:** "You need to follow up with canceled/rescheduled patients."

1. Find a patient in follow-up.
2. Open available contact action (if shown in Today flow).
3. Confirm whether next step is obvious (call/SMS/reminder).

**Observe**

- Does app help dentist know what to do next?
- Is follow-up urgency visible enough?

## Task 7: Offline + Sync Confidence Check

**Scenario:** "Internet drops during clinic."

1. Turn browser offline (DevTools or disconnect internet).
2. Make one appointment change (status or booking).
3. Return online.
4. Use **Sync** and confirm data remains correct.

**Observe**

- Did she trust that data was saved offline?
- Is sync status understandable?
- Any concern about duplicate/missing records?

---

## Short Interview (5-10 min)

Ask after tasks:

1. What felt most useful in your daily workflow?
2. What was confusing or slowed you down?
3. Which terms/buttons should be renamed?
4. What information is missing when making decisions?
5. If you could change one thing first, what would it be?

## Feedback Form Template

Copy this per task:

```text
Task:
Completion (Done / Partly / Not):
Difficulty (1-5):
Time:
What was easy:
What was confusing:
Suggested change:
```

## Priority Ratings For Requested Changes

For every suggested change, tag:

- **P0** Critical: blocks care workflow or risks wrong data
- **P1** High: slows work significantly
- **P2** Medium: moderate friction
- **P3** Low: polish/comfort improvement

## Success Criteria For This Round

Testing round is successful if:

- dentist completes at least 80 percent of tasks without coaching
- no critical confusion on status changes or rescheduling
- offline save + sync feels trustworthy to tester
- top 3 improvement requests are clearly identified

