# Troubleshooting

## A vendor can't see part of their dashboard

Check **Settings → Store Permissions** (and **User Permissions**) — several dashboard sections (like Wallet or Products) can be hidden per-store or marketplace-wide. A missing menu item is usually a permissions setting, not a bug.

## A vendor's payout didn't go out when expected

1. Confirm the order that funded it actually reached the status configured under **Settings → Payouts** (e.g. **Completed**) — earnings aren't payable before that.
2. Check the **Clearance period** — earnings only become payable once that holding window has passed.
3. Check the **Minimum payout threshold** — a small balance may simply not have crossed it yet.
4. Check **Automatic payout frequency** — if it's set to **Manual**, payouts don't happen until you trigger one yourself.

## Commission looks wrong on an order

Check whether the rate is coming from a marketplace-wide default or a per-vendor/per-category override — see [COMMISSIONS](COMMISSIONS.md). Also check whether commission is configured as store-order-based or per-item-based, since that changes how a multi-item order's total commission is calculated.

## FAQ

**How does a WooCommerce multivendor marketplace work?**
Vendors sign up and manage their own products and orders from their dashboard; the admin oversees vendor activity, commissions, and overall site management.

**Can vendors manage their own products and orders?**
Yes — vendors upload products, process orders, and view reports from their own frontend dashboard.

**How does vendor registration work?**
Vendors register through a vendor registration page; once you approve them, they get access to their dashboard.

**Can I set different commission rates for each vendor?**
Yes — fixed, percentage, or tiered, per vendor or per category.

**Can I approve vendors and products before they go live?**
Yes — via the Approval Queue.

**Does MultiVendorX support different product types?**
Yes — physical, digital, downloadable, grouped, external, booking, rental, and subscription products.

**How do payments and vendor payouts work?**
Customers pay through your normal WooCommerce gateways; you handle vendor payouts manually or automatically — see [PAYOUTS](PAYOUTS.md).

**Can vendors contact the admin or customers?**
Yes — vendors can message the admin, and some setups allow vendor-customer communication too.

**Can I migrate from another multivendor plugin to MultiVendorX?**
Yes — migration tools are provided.

## Still stuck?

See the [developer docs](../developer/README.md) if you're comfortable with code-level detail, or the [MultiVendorX knowledge base](https://multivendorx.com/docs/).

## Related

- [GETTING-STARTED](GETTING-STARTED.md)
- [SETTINGS](SETTINGS.md)
