# Getting Started

## What it does

Notifima adds a "Notify Me" waitlist to any out-of-stock (or on-backorder) product in your WooCommerce store. A shopper who can't buy right now leaves their email; when you restock the product, Notifima emails everyone who signed up automatically.

## Why it matters

An out-of-stock product with no waitlist is a lost sale the moment it happens, and often a forgotten one by the time you restock. A waitlist turns that missed sale into a list of people actively waiting to buy — and gives you a real signal of demand for products you're deciding whether to reorder.

## How it works, end to end

1. A product goes out of stock (or on backorder, if you allow it).
2. Notifima shows a "Notify Me" form on that product's page instead of (or alongside) the normal add-to-cart button.
3. A shopper enters their email and subscribes.
4. You restock the product — update its stock quantity or status as you normally would in WooCommerce.
5. Notifima emails every subscriber for that product automatically. No manual step is needed.

## Installing

1. In wp-admin, go to **Plugins → Add New**, search for "Notifima", and click **Install Now**, then **Activate**. (Or upload the zip manually via **Plugins → Add New → Upload Plugin** if you downloaded it directly.)
2. WooCommerce must already be active — Notifima is a WooCommerce add-on and won't do anything without it.
3. Once active, you'll see a new **Notifima** item in the wp-admin sidebar menu.

## Finding your way around

The **Notifima** menu has four sections:

| Menu item | What's there |
|---|---|
| **Dashboard** | An overview tab, plus a tab comparing free vs. Pro |
| **Settings** | Automation rules, customer-facing messages, form design, and notification controls — see [SETTINGS](SETTINGS.md) |
| **Subscriber List** | Everyone who's signed up for a waitlist, which product, and when — see [SUBSCRIBERS](SUBSCRIBERS.md) |
| **Inventory Manager** | Stock levels and status for every product in one table — see [INVENTORY](INVENTORY.md) |

You'll also see small additions on the regular WooCommerce **Products** list and each product's edit screen: a subscriber-count column, a "Mark as discontinued" checkbox (hides the waitlist form for that product entirely), and a bulk action to remove all subscribers for selected products.

## A sensible first setup

1. Go to **Notifima → Settings → Automation** and decide who can subscribe (everyone, or logged-in customers only) and whether the form shows for out-of-stock products, backordered ones, or both.
2. Visit a real out-of-stock product on your storefront to confirm the form appears and looks right.
3. Restock that product and confirm you (or a test subscriber) receive the notification email.
4. From there, visit [SETTINGS](SETTINGS.md) to customize the messages and form appearance to match your store.

## Related

- [SETTINGS](SETTINGS.md)
- [SUBSCRIBERS](SUBSCRIBERS.md)
- [TROUBLESHOOTING](TROUBLESHOOTING.md)
