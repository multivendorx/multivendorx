# Troubleshooting

## Moodle courses aren't showing up on WordPress

1. Go to **Settings → Connection & Access** and run **Test Connection** — this is the fastest way to confirm WordPress can actually reach your Moodle site.
2. If the test fails, double-check the Moodle site URL and that the access token is still valid in Moodle.
3. If the connection test passes but courses still don't appear, try the sync again from **Courses** — a large catalog can time out partway through (see below).

## A student paid but wasn't enrolled in Moodle

This is most often a server timeout during the sync that happens around enrollment, not a payment problem.

1. Confirm the order actually reached **Completed** status in WooCommerce — enrollment only fires on that status, not on "Processing" or "Pending payment".
2. Go to **Settings → System & Logs** and raise the **Connection timeout** value, then try a test enrollment again.
3. Turn on **Advance log** temporarily and check the log for the specific request that failed, then turn it back off.

## A customer can't buy more than one seat of a course

This is expected in the free plugin — a course product is capped at one unit per purchase, since enrollment is tied to the purchasing account. Selling to a classroom or group is a Pro feature (**Classroom mode / group purchase**).

## FAQ

**Can I sell Moodle courses with WooCommerce?**
Yes — that's the plugin's core purpose. Any WooCommerce-compatible payment gateway works; you're not limited to Stripe or PayPal.

**Does MooWoodle support Single Sign-On between WordPress and Moodle?**
In [MooWoodle Pro](https://dualcube.com/product/moowoodle-pro/?utm_source=wporg&utm_medium=plugindescription&utm_campaign=moowoodlewporg) — students and instructors log in once for both.

**Do I need coding knowledge to connect Moodle and WordPress?**
No — it's all configured through the Settings screens, no code required.

**Can I connect one Moodle site to multiple WordPress sites?**
Yes.

**What course details sync from Moodle to WordPress?**
Title, description, image, and category.

**Do WordPress and Moodle need to be on the same server?**
No.

**Can I only update existing courses without importing new ones?**
In [MooWoodle Pro](https://dualcube.com/product/moowoodle-pro/?utm_source=wporg&utm_medium=plugindescription&utm_campaign=moowoodlewporg), via the **Update Existing Products** setting.

## Still stuck?

See the [developer docs](../developer/README.md) if you're comfortable with code-level detail, or [dualcube.com/docs](https://dualcube.com/docs/moowoodle-pro/?utm_source=wporg&utm_medium=plugindescription&utm_campaign=moowoodlewporg).

## Related

- [GETTING-STARTED](GETTING-STARTED.md)
- [CONNECTING-MOODLE](CONNECTING-MOODLE.md)
- [SETTINGS](SETTINGS.md)
