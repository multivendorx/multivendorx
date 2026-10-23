# Commissions

## What it does

Commission is the cut the marketplace keeps from each sale — the rest goes to the vendor. MultiVendorX lets you set this as a flat value or a percentage, based on either the whole order or each item, and even vary it by condition (e.g. a different rate above a certain order value).

## Why it matters

This is how your marketplace actually makes money. Getting it wrong in either direction is costly: too high and vendors leave for a cheaper marketplace, too low and the marketplace doesn't cover its own costs (payment processing, support, hosting).

## How to use it

1. Go to **MultiVendorX → Settings → Commissions**.
2. Choose whether commission is calculated **Store order based** (one calculation per whole order) or **Per item based** (calculated on each line item separately).
3. Set the **Commission value** — a flat amount or a percentage, optionally conditioned on whether the product/listing price or order value is up to or more than a threshold.
4. Decide how **tax** is split: marketplace share, store share, or commission-based tax distribution, and whether tax applies to shipping cost too.
5. Visit **MultiVendorX → Commissions** to see the actual commission amounts calculated per order, not just the rule that produces them.

## Per-vendor and per-category rates

You're not limited to one marketplace-wide rate — commission can be set per vendor or per category so, for example, a trusted high-volume vendor pays a lower rate than a new one, or electronics carry a different commission than apparel.

## Settings explained

Go to **Settings → Commissions**.

| Setting | What it does | Why you'd change it |
|---|---|---|
| **Marketplace commission** | Store order based vs. per item based calculation | Per item is more precise for mixed-vendor carts; store order based is simpler to reason about |
| **Commission value** | The flat amount or percentage taken, optionally conditioned on price/order value thresholds | Tiered commission rewards larger orders differently than small ones |
| **Tax distribution options** | Who the tax portion of a sale is attributed to | Match your actual tax/accounting setup with vendors |
| **Charge tax on shipping cost** | Whether shipping is taxed the same way as the product | Depends on your tax jurisdiction's rules |
| **Marketplace fees** [PRO] | Additional flat/percentage fees deducted from store earnings beyond commission | For marketplaces that charge a separate platform fee on top of commission |
| **Facilitator fees** [PRO] | Fees for a payment facilitator model | Relevant if you're using a marketplace payment facilitator (e.g. Stripe Connect/PayPal Marketplace in Pro) |
| **Gateway fees** | Payment gateway processing fees, and who absorbs them | Decide whether the marketplace or the vendor eats card-processing fees |

## Related

- [PAYOUTS](PAYOUTS.md)
- [STORES](STORES.md)
- [SETTINGS](SETTINGS.md)
