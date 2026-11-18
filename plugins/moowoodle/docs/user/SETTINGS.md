# Settings

## What it does

**MooWoodle → Settings** holds the plugin's configuration, split across three tabs: **Connection & Access**, **Course & Enrollment**, and **System & Logs**. A separate **Synchronization** screen (its own top-level menu item, not under Settings) controls how courses, cohorts and users sync.

## Why it matters

This is where you connect to Moodle, decide how courses and enrollment behave on your storefront, and control sync timing and logging. The defaults work for most setups, but the connection settings are not optional — nothing syncs without them.

## Connection & Access

Go to **Settings → Connection & Access**. Covered in full in [CONNECTING-MOODLE](CONNECTING-MOODLE.md) — your Moodle URL, access token, test connection, and Single Sign-On (Pro).

## Course & Enrollment

Go to **Settings → Course & Enrollment**.

| Setting | What it does | Why you'd change it |
|---|---|---|
| **Display course duration in 'Shop Page'** | Shows how long a course runs, right on the shop listing | Helps customers decide without opening each product |
| **'My Course' menu position** | Where the "My Courses" link appears in your site's account menu | Match your theme's navigation layout |
| **Classroom mode / group purchase** [PRO] | Let one purchase cover multiple seats | For selling to businesses/schools rather than individuals |
| **Seat reassignment** [PRO] | Move a purchased seat to someone else | Useful when the buyer isn't the student |
| **Gift someone** [PRO] | Let a customer buy a course for another person | Standard gifting flow for course products |
| **Disable new user registration email** | Skips WordPress's default "your account was created" email | Useful if you're sending your own custom welcome email instead |

## System & Logs

Go to **Settings → System & Logs**.

| Setting | What it does | Why you'd change it |
|---|---|---|
| **Connection timeout** | How long MooWoodle waits for a response from Moodle before giving up | Raise it if large syncs are failing or courses aren't fully importing — a common cause of "course didn't show up" |
| **Automatic synchronization frequency** | How often MooWoodle automatically re-syncs with Moodle | Match to how often your Moodle course catalog actually changes |
| **Advance log** | Turns on detailed request/response logging | Turn on temporarily while diagnosing a sync problem, then back off — it's verbose |

## Synchronization

A separate top-level menu item, not a Settings sub-tab. Covered in [COURSES](COURSES.md) for the course-sync behavior; cohort and user sync (mapping roles, syncing profile fields, real-time profile sync) are **[PRO]**.

## Related

- [GETTING-STARTED](GETTING-STARTED.md)
- [CONNECTING-MOODLE](CONNECTING-MOODLE.md)
- [TROUBLESHOOTING](TROUBLESHOOTING.md)
