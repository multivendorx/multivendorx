# Getting Started

## What it does

MultiVendorX turns a single WooCommerce store into a marketplace: multiple vendors sign up, manage their own products and orders from their own dashboard, and the marketplace admin oversees everything — vendor approval, commissions, and payouts — from a central admin dashboard.

## Why it matters

Running a marketplace yourself (one admin listing every product) doesn't scale past a certain size. MultiVendorX lets independent vendors do their own product and order management while you focus on running the marketplace itself: who's allowed to sell, how much the marketplace earns per sale, and when vendors get paid.

## The two roles

| Role | What they do | Where they work |
|---|---|---|
| **Marketplace admin** | Approves vendors and products, sets commission rules, pays out vendors, oversees the whole marketplace | wp-admin → **MultiVendorX** menu |
| **Vendor** | Lists products, fulfills orders, tracks earnings, manages their own store | Their own frontend **Store Dashboard** (a page on your site, not wp-admin) |

If you're both building the marketplace and planning to sell on it yourself, you'll use both.

## Installing

1. In wp-admin, go to **Plugins → Add New**, search for "MultiVendorX", click **Install Now**, then **Activate**. (Or upload the zip manually if you downloaded it directly.)
2. WooCommerce must already be active — MultiVendorX is a WooCommerce add-on.
3. Once active, you'll see a new **MultiVendorX** item in the wp-admin sidebar menu.

## Finding your way around, as an admin

The **MultiVendorX** admin menu has these sections:

| Menu item | What's there |
|---|---|
| **Dashboard** | An overview of marketplace activity |
| **Stores** | Every vendor store — see [STORES](STORES.md) |
| **Commissions** | How much the marketplace earns per sale — see [COMMISSIONS](COMMISSIONS.md) |
| **Transaction History** | Every payout and transaction — see [PAYOUTS](PAYOUTS.md) |
| **Approval Queue** | New vendors/products waiting for your review |
| **Compliance** | Policy and compliance tools |
| **Customers** | Marketplace-wide customer view |
| **Reports** | Marketplace-wide sales and performance reports |
| **Settings** | Every configuration tab — see [SETTINGS](SETTINGS.md) |
| **Status & Tools** | System status and diagnostic tools |
| **Help & Support** | Links to documentation and support |

## Finding your way around, as a vendor

Once approved, a vendor logs in and lands on their own **Store Dashboard** (not wp-admin). See [VENDOR-DASHBOARD](VENDOR-DASHBOARD.md) for the full tour — the short version: **Dashboard**, **Products**, **Coupons**, **Sales** (orders, refunds, commissions earned), **Wallet** (transactions, withdrawals), **Store Support** (tickets, questions, followers, reviews), **Resources**, and their own **Settings**.

## A sensible first setup, as admin

1. Go to **Settings → Onboarding** and configure how vendors register and get approved (see [SETTINGS](SETTINGS.md)).
2. Go to **Settings → Store** and **Store Permissions** to decide what vendors can and can't do.
3. Go to **Commissions** and set your marketplace-wide (or per-vendor) commission rate — see [COMMISSIONS](COMMISSIONS.md).
4. Register a test vendor account yourself, approve it from **Approval Queue**, and walk through listing a product and placing a test order to see both sides end to end.
5. Set up how and when vendors get paid under **Settings → Payouts** — see [PAYOUTS](PAYOUTS.md).

## Related

- [STORES](STORES.md)
- [COMMISSIONS](COMMISSIONS.md)
- [TROUBLESHOOTING](TROUBLESHOOTING.md)
