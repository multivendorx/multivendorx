# Enrollment

## What it does

The moment a WooCommerce order containing a course product is marked **Completed**, MooWoodle automatically enrolls that customer in the matching Moodle course — no manual step on your end.

## Why it matters

Manually enrolling every paying student doesn't scale, and a delay between payment and enrollment is a common source of "I paid but can't access the course" support tickets. Automating it removes both problems.

## How it works

1. A customer buys a synced course product — through any WooCommerce-compatible payment gateway, not just Stripe or PayPal.
2. When the order reaches **Completed** status (whether automatically, like most card payments, or manually, if you mark it complete yourself), MooWoodle enrolls the customer in the matching Moodle course.
3. On the order's thank-you page, the customer sees a notice confirming their enrollment.
4. Each product shows its course's availability dates on the shop page and product page, so customers know when a course starts/ends before buying.

## One seat per purchase

A course product can only be purchased one at a time — if a customer tries to raise the quantity above 1 in their cart, MooWoodle resets it back to 1 with a notice. This is intentional: enrollment is tied to the purchasing account, so "buying 3" wouldn't enroll 3 different people. If you need to sell seats for a group/classroom, that's a Pro feature — see below.

## What's Pro

- **Classroom mode / group purchase** — let one purchase cover multiple seats. **[PRO]**
- **Seat reassignment** — move a purchased seat to a different person. **[PRO]**
- **Gift someone** — let a customer buy a course for another person. **[PRO]**
- Manage and review enrollments from a dedicated **Enrolments** admin screen. **[PRO]**

## Related

- [COURSES](COURSES.md)
- [TROUBLESHOOTING](TROUBLESHOOTING.md)
