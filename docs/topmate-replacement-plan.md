# Topmate Replacement Plan (Manual Approval + Better Timezones + India Payments)

## Goals
- Prevent automatic booking confirmations.
- Make timezone handling clear and correct for San Francisco host + global users.
- Support Indian payment rails for both collections and payouts.
- Keep UX very simple for both visitor and host.

## Product decisions
1. **Two-step booking state machine**
   - `Requested` → `Approved` → `Paid` → `Scheduled`.
   - Invites are sent only after host approval and successful payment.
2. **Host is source of truth**
   - Host can set availability windows, but each booking still requires manual approval.
3. **Timezone safety**
   - Visitor always picks local time + timezone.
   - Host sees converted time in `America/Los_Angeles` before approving.
   - Store slots in UTC in backend.
4. **Indian payments**
   - Use Razorpay checkout/payment links for customer payment.
   - Use Razorpay Route / payouts to settle to your parent's Indian account.

## Suggested architecture
- **Frontend:** Next.js + Tailwind (simple responsive UI).
- **Backend:** Node.js (NestJS/Express) or Supabase Edge Functions.
- **Database:** Postgres with UTC timestamps.
- **Queue/Jobs:** background worker for reminders and calendar invites.
- **Integrations:**
  - Google Calendar / Outlook API.
  - Razorpay Payments + Webhooks.
  - Email: Resend/Postmark.

## Core tables
- `users` (host profile, payout settings)
- `availability_rules` (weekly windows)
- `booking_requests` (requested slot, visitor timezone, status)
- `transactions` (payment status, razorpay IDs)
- `meetings` (conference link, invite metadata)

## Booking flow
1. Visitor submits request with topic and preferred time.
2. System creates `booking_requests` with `Requested` status.
3. Host dashboard shows request converted to SF time.
4. Host clicks Approve or Reject.
5. If approved, system creates Razorpay payment link and shares it.
6. Razorpay webhook marks payment success.
7. System creates calendar event and sends invites.

## Anti-timezone bugs checklist
- Always persist date/time in UTC.
- Persist original timezone string from visitor.
- Convert for display only.
- Unit test DST boundaries for `America/Los_Angeles` and `Asia/Kolkata`.

## UX checklist
- One-page booking form.
- One-card approval queue for host.
- Clear labels: "Your local time" vs "Host time (San Francisco)".
- Mobile-first controls and larger tap targets.

## Revenue model
- Keep your own platform fee (e.g., 10%) in transaction records.
- Optional coupon support for social followers.

## 3-week MVP roadmap
- **Week 1:** auth, host profile, availability, booking request.
- **Week 2:** approval queue, timezone conversion, Razorpay payment links.
- **Week 3:** calendar invites, reminders, analytics, production hardening.
