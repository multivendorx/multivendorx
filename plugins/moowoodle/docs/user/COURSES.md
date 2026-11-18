# Courses

## What it does

**MooWoodle → Courses** lists every Moodle course you've synced, alongside the WooCommerce product it's linked to, and lets you sync new courses in or refresh existing ones.

## Why it matters

This is where your Moodle course catalog becomes something customers can actually buy. Without syncing, a course that exists in Moodle has no product page, no price, and no checkout — MooWoodle transfers the course title, description, image, and category into a real WooCommerce product automatically.

## How to use it

1. Go to **MooWoodle → Courses**.
2. Each row shows the **Course**, its linked **Product**, and the number of **Enrolled users**.
3. Use the bulk actions to **Sync course**, **Create product**, or **Update product** for selected courses — or use the **Sync Course Data** action on a single row.
4. Use **Select Category** to filter the list down to a specific Moodle course category.
5. Once a course has synced, its product appears in your normal WooCommerce product list like any other product — you can edit price, description, and images from there.

## Why courses sometimes don't show up after syncing

A sync can silently fail to finish if your server times out mid-request to Moodle, especially with a large course catalog. See **Settings → System & Logs → Connection timeout** in [SETTINGS](SETTINGS.md), and the [TROUBLESHOOTING](TROUBLESHOOTING.md) guide.

## What's Pro

- Mapping richer course fields (categories, product SKU from the Moodle course ID, course image, course group) during sync. **[PRO]**
- **Update Existing Products** — refresh data only for courses already added, without importing anything new. **[PRO]**
- Cohort-based syncing, so a Moodle cohort maps to its own product. **[PRO]**

## Related

- [CONNECTING-MOODLE](CONNECTING-MOODLE.md)
- [ENROLLMENT](ENROLLMENT.md)
- [SETTINGS](SETTINGS.md)
