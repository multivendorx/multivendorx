# Payouts

## What it does

Payouts is how vendors actually receive the money they've earned — what triggers a payout, how long earnings are held before they're payable, and how often payouts run.

## Why it matters

Vendors judge a marketplace partly on how reliably and predictably they get paid. A clear payout schedule and a sensible clearance period (to protect against refunds/chargebacks on just-completed orders) protects both the marketplace and the vendor.

## How to use it

1. Go to **MultiVendorX → Settings → Payouts**.
2. Choose which order status releases earnings for payout (e.g. **Completed** — **Delivered**/**Processing**/**Shipped** are Pro options for stores that want to pay out earlier in the fulfillment cycle).
3. Set a **Clearance period** — a holding window after the triggering status before the money becomes payable, to allow for refunds/disputes.
4. Set a **Minimum payout threshold** so small balances accumulate instead of triggering tiny, frequent payouts, and optionally a **Minimum wallet reserve** that always stays in a vendor's balance.
5. Choose an **Automatic payout frequency** — Manual, Hourly, Daily, Weekly, Fortnightly, or Monthly — and the specific timing for whichever frequency you pick (e.g. a daily payout time, or which weekday for weekly).
6. Go to **MultiVendorX → Transaction History** to see every payout and transaction that's actually happened.

## Settings explained

Go to **Settings → Payouts**.

| Setting | What it does | Why you'd change it |
|---|---|---|
| **Payout Schedule (status)** | Which order status makes earnings eligible for payout | Pay out sooner or later in the fulfillment cycle depending on how much you trust your vendors/fulfillment process |
| **Clearance period** | How long after that status before the money is actually payable | Protects against paying out, then having to claw back money on a refund |
| **Minimum payout threshold** | The smallest balance that triggers a payout | Avoids processing fees eating into tiny payouts |
| **Minimum wallet reserve** | A balance that's never paid out, always kept in reserve | A safety buffer against future refunds/disputes |
| **Automatic payout frequency** | How often payouts run automatically | Match to your own cash-flow and vendor expectations — weekly/monthly is common |

## How vendors get paid

Customers pay through your normal WooCommerce payment gateways. The marketplace then pays vendors out separately, manually or automatically, based on the schedule above. PayPal Marketplace and Stripe Marketplace payout methods are available (some aspects are **[PRO]** — check **Settings → Withdrawal Methods** for what's configured on your site).

## Related

- [COMMISSIONS](COMMISSIONS.md)
- [STORES](STORES.md)
- [VENDOR-DASHBOARD](VENDOR-DASHBOARD.md)
