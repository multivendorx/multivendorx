# Getting Started

## What it does

CatalogX turns some or all of your WooCommerce store into a catalog: products can be shown without prices and without an "Add to Cart" button, replaced instead with an **Enquiry** button ("ask about this") or a **Quote** button ("request a price for this"). You choose which products this applies to, and who it applies to.

## Why it matters

Not every store sells directly online. If you run a B2B, wholesale, or lead-generation business — or just have some products you'd rather discuss with a customer before selling (custom work, large orders, regulated items) — CatalogX lets you keep using WooCommerce's product catalog without forcing every visitor through a normal checkout.

## The three building blocks

| Block | What it replaces | Guide |
|---|---|---|
| **Catalog mode** | Hides the price and/or "Add to Cart" button on chosen products | [CATALOG-MODE](CATALOG-MODE.md) |
| **Enquiry** | Adds an "Enquire Now" button that opens a message form instead of adding to cart | [ENQUIRY](ENQUIRY.md) |
| **Quote** | Lets customers collect products in a quote cart and submit a request-a-quote | [QUOTES](QUOTES.md) |

You can use any combination of the three — a fully catalog-only store, a normal store with enquiries only on a few special products, or anything in between.

## Installing

1. In wp-admin, go to **Plugins → Add New**, search for "CatalogX", click **Install Now**, then **Activate**. (Or upload the zip manually if you downloaded it directly.)
2. WooCommerce must already be active — CatalogX is a WooCommerce add-on.
3. Once active, you'll see a new **CatalogX** item in the wp-admin sidebar menu.

## Finding your way around

The **CatalogX** menu has these sections:

| Menu item | What's there |
|---|---|
| **Dashboard** | An overview tab, plus a tab comparing free vs. Pro |
| **Enquiry Messages** | Conversations with customers who've sent a product enquiry — **[PRO]** |
| **Quotation Requests** | Every quote request submitted, with status and totals |
| **Wholesale Users** | Manage wholesale-tier customers — **[PRO]** |
| **Dynamic Pricing Rules** | Rule-based pricing by role, quantity, or product — **[PRO]** |
| **Settings** | Every configuration tab — see [SETTINGS](SETTINGS.md) |
| **Modules** | Turn the Catalog, Enquiry and Quote modules on or off |

## A sensible first setup

1. Go to **CatalogX → Settings → Pages & Shortcodes** and set up the pages that'll host your enquiry cart and quote requests.
2. Decide your store's overall mode under **Settings → Enquiry & Quote → Store experience**: browse-only catalog, or browse-and-purchase with enquiry/quote as an option.
3. If you only want this on specific products or for specific customers, set that up under **Settings → Access Rules** — see [SETTINGS](SETTINGS.md#access-rules).
4. Visit a real product on your storefront to confirm the button you expect (Enquire / Request Quote / nothing, if Add to Cart is hidden) shows up correctly.

## Related

- [CATALOG-MODE](CATALOG-MODE.md)
- [SETTINGS](SETTINGS.md)
- [TROUBLESHOOTING](TROUBLESHOOTING.md)
