# Getting Started

## What it does

MooWoodle connects your WordPress/WooCommerce store to a Moodle site. It syncs Moodle courses in as WooCommerce products customers can buy, and automatically enrolls a student in the matching Moodle course the moment their order is complete.

## Why it matters

Moodle is great at running courses, WooCommerce is great at selling things — MooWoodle removes the manual work of connecting the two: no copy-pasting course details into WordPress, no manually enrolling every student who pays.

## How it works, end to end

1. You connect MooWoodle to your Moodle site (its URL and an access token).
2. You sync your Moodle courses — MooWoodle creates a matching WooCommerce product for each one.
3. A customer buys the course product through your normal WooCommerce checkout, using whichever payment gateway you already have.
4. Once the order is marked **Completed**, MooWoodle automatically enrolls that customer in the matching Moodle course. No manual step is needed.

## Installing

1. In wp-admin, go to **Plugins → Add New**, search for "MooWoodle", click **Install Now**, then **Activate**. (Or upload the zip manually if you downloaded it directly.)
2. WooCommerce must already be active — MooWoodle is a WooCommerce add-on.
3. Once active, you'll see a new **MooWoodle** item in the wp-admin sidebar menu.

## Finding your way around

The **MooWoodle** menu has these sections:

| Menu item | What's there |
|---|---|
| **Dashboard** | An overview tab |
| **Courses** | Every synced course and its matching WooCommerce product — see [COURSES](COURSES.md) |
| **Cohorts** | Sync Moodle cohorts to products — **[PRO]** |
| **Enrolments** | Manage enrollments — **[PRO]** |
| **Synchronization** | Sync behavior for courses, cohorts, and users |
| **Settings** | Connection, course & enrollment, and system settings — see [SETTINGS](SETTINGS.md) |
| **Help & Support** | Links to documentation and support |

## A sensible first setup

1. Go to **MooWoodle → Settings → Connection & Access** and enter your Moodle site URL and access token, then click **Test Connection** — see [CONNECTING-MOODLE](CONNECTING-MOODLE.md).
2. Go to **MooWoodle → Courses** and sync your existing Moodle courses — each one becomes a WooCommerce product.
3. Place a real test order for one of the synced course products, mark it **Completed**, and confirm the test account gets enrolled in Moodle.
4. If anything doesn't sync or enroll as expected, see [TROUBLESHOOTING](TROUBLESHOOTING.md) — most issues trace back to the connection or a server timeout during sync.

## Related

- [CONNECTING-MOODLE](CONNECTING-MOODLE.md)
- [COURSES](COURSES.md)
- [TROUBLESHOOTING](TROUBLESHOOTING.md)
