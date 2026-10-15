# Troubleshooting

## Add to Cart is still showing where I expected catalog mode

1. Confirm the **Catalog** module is active under **CatalogX → Modules**.
2. Check **Settings → Access Rules** — if the product, its category/tag/brand, or the current user's role is listed as excluded there, catalog mode won't apply to it.
3. Check **Settings → Enquiry & Quote → Store experience** is set to **Browse products only** if you intended this store-wide.

## The Enquiry or Quote button isn't showing

1. Confirm the relevant module (**Enquiry** or **Quote**) is active under **CatalogX → Modules**.
2. Check **Settings → Access Rules** for that feature — a product can be excluded from enquiry or quote independently of catalog mode.
3. If you're checking an out-of-stock-only setup, confirm **Show enquiry for** is actually set to include out-of-stock products.

## I'm not receiving enquiry or quote notifications

1. Check **Settings → Enquiry & Quote → Recipient email for product enquiries** — confirm it's a real, actively monitored address.
2. Check your site's outgoing email is working at all (a common WordPress hosting issue, unrelated to CatalogX) — try a password-reset email as a quick test.
3. Check spam/promotions folders.

## FAQ

**How do I enable Catalog mode on my site?**
Activate the Catalog module and set **Store experience** to **Browse products only** under **Settings → Enquiry & Quote**. The Add to Cart button will be removed accordingly.

**Can I show both the Enquiry button and Add to Cart at the same time?**
Yes, in [CatalogX Pro](https://catalogx.com/pricing/?utm_source=wporg&utm_medium=plugindescription&utm_campaign=catalogxwporg) — the free plugin's catalog mode replaces, rather than adds to, the buying flow.

**How do I respond to a customer's enquiry?**
You'll get an email notification for each one — reply directly from your inbox. (Pro adds a dedicated admin screen for managing these as ongoing conversations.)

**Can I show the enquiry button only on specific products?**
Yes — use **Settings → Access Rules** to exclude or include specific products, categories, tags, brands or roles.

**Can I show the enquiry button only for out-of-stock products?**
Yes — under **Settings → Enquiry & Quote**, set **Show enquiry for** to out-of-stock products only.

## Still stuck?

See the [developer docs](../developer/README.md) if you're comfortable with code-level detail, or [catalogx.com/docs](https://catalogx.com/docs/?utm_source=wporg&utm_medium=plugindescription&utm_campaign=catalogxwporg).

## Related

- [GETTING-STARTED](GETTING-STARTED.md)
- [SETTINGS](SETTINGS.md)
