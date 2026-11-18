# Troubleshooting

## The "Notify Me" form isn't showing on a product

Check, in order:

1. Is the product actually out of stock (or on backorder, if that's the mode you rely on)? The form only shows for the stock states selected under **Settings → Automation → Show subscription form for**.
2. Did you mark the product (or variation) as **discontinued**? That checkbox, on the product's Inventory panel in wp-admin, hides the waitlist form for that product entirely — on purpose.
3. Is WooCommerce active? Notifima depends on it and won't render anything if it's deactivated.

## A customer says they didn't get the restock email

1. Confirm the product's stock was actually updated (quantity raised above zero, or status changed to "In stock") — notifications fire off that change, not off a manual action.
2. Check **Settings → Automation → Notification delivery**. If you're using batched delivery, a large subscriber list can take a few minutes to fully go out.
3. Check whether **Retry Failed Notifications** is on — a failed send is retried automatically, but only up to the configured number of attempts.
4. Ask the customer to check spam/promotions folders — this is an automated transactional email and can be filtered by some mail providers.

## FAQ

**Can I enable the waitlist when backorders are active?**
Yes. Notifima works whether a product is out of stock or on backorder — see **Settings → Automation**.

**Can I customize the form and its messages?**
Yes — colors, button text and styling under **Subscription Form Designer**, and every customer-facing message under **Customer Messages**.

**Can stock notifications go to more than one email?**
Yes, for the admin side — set multiple addresses, separated by commas, under **Settings → Notifications → Recipient email for new subscriber**.

**Does it work with every WooCommerce product type?**
Yes — simple, variable, grouped, subscription and bundled products are all supported.

**Can I export my subscriber list?**
Yes, from **Subscriber List → Download CSV**. Full detailed exports (names, dates, products, emails in one combined export) are a Pro feature.

**Can customers unsubscribe themselves?**
In the free plugin, you remove subscribers yourself (via the Products list bulk action). Letting customers unsubscribe from their own My Account page is a Pro feature.

**Does it support multiple languages?**
Yes — Notifima is WPML compatible.

**Can I track stock change history over time?**
Not yet — this isn't available in the current version.

## Still stuck?

See the [developer docs](../developer/README.md) if you're comfortable with code-level detail, or reach out via [notifima.com/docs](https://notifima.com/docs/?utm_source=wporg&utm_medium=plugindescription&utm_campaign=notifimawporg).

## Related

- [GETTING-STARTED](GETTING-STARTED.md)
- [SETTINGS](SETTINGS.md)
