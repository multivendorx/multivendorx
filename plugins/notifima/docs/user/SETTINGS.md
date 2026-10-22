# Settings

## What it does

**Notifima → Settings** holds every configuration option, split across four tabs: **Automation**, **Customer Messages**, **Subscription Form Designer**, and **Notifications**.

## Why it matters

This is where you decide who can subscribe, when the waitlist form shows up, what customers see at every step, and how restock alerts actually get delivered. The defaults work out of the box, but a few minutes here makes the waitlist match your store's tone and workflow.

## Automation

Go to **Settings → Automation**. This tab controls who can subscribe, when the form appears, and how notifications are sent.

### Access and timing

| Setting | What it does | Why you'd change it |
|---|---|---|
| **Subscription access** | Lets you choose between **Everyone** or **Logged-in customers only** | Restrict signups to registered customers if you want to tie waitlists to accounts |
| **Show subscription form for** | Choose whether the form shows for **Out of stock** products, products **On backorder**, or both | Show it only where it's actually useful for your store's stock policy |

### Restock timing (lead time)

| Setting | What it does | Why you'd change it |
|---|---|---|
| **Stock Status for Lead Time** | Choose which products (out of stock / on backorder) show an expected restock time | Lets shoppers know roughly when to expect the product back |
| **Lead Format** | **Static** (one fixed message) or **Dynamic** [PRO] | Static is simplest; Dynamic lets Pro calculate a real estimate |
| **Lead time default message** | The message shown when a product has no restock time of its own | Set a sensible fallback like "Usually restocks within 2 weeks" |

### Subscription experience

| Setting | What it does | Why you'd change it |
|---|---|---|
| **Display subscription form as** | **Popup** or **Inline In-page** | Match your theme's style — inline blends into the page, popup stands out |
| **Subscriber visibility** | Show or hide the subscriber count on the product page | Showing the count can create urgency ("12 people are waiting") |
| **Subscriber count notification message** | Customize the message shown with the count. Use `%no_of_subscribed%` as a placeholder | Only shown when subscriber count is visible |
| **Subscription confirmation** | **Subscribe immediately** or **Confirm via email** [PRO] | Email confirmation avoids fake/mistyped addresses |
| **'Unsubscribe' Button Caption** | The text on the button a subscribed customer clicks to stop alerts | Leave blank to use "Unsubscribe" |

### Audience synchronization [PRO]

Store subscribers locally (free) or sync them automatically to a Mailchimp audience (Pro) — requires a Mailchimp API key and connecting your account.

### SMS & WhatsApp notifications [PRO]

Send restock alerts by SMS and/or WhatsApp through Twilio or Vonage, instead of (or alongside) email. Requires your own account and credentials with the chosen provider.

### Notification delivery

| Setting | What it does | Why you'd change it |
|---|---|---|
| **Notification delivery** | **Send all at once** or **Send in batches** | Batching avoids sending hundreds of emails in one burst on a busy restock |
| **Batch size per minute** | How many notifications go out per minute when batching | Lower it if your email provider rate-limits you |
| **Retry Failed Notifications** | Automatically retry emails that failed to send | Recommended on — catches temporary mail server issues |
| **Retry Interval** | How often a failed email is retried: hourly, every 6 hours, or daily | Match to how urgent restock alerts are for your store |
| **Maximum Retry Attempts** | How many times a failed email is retried before giving up | Prevents retrying forever on a permanently bad address |

## Customer Messages

Go to **Settings → Customer Messages**. These are the exact messages customers see while interacting with the waitlist form.

| Setting | What it does |
|---|---|
| **Successful form submission** | Shown right after a customer subscribes. Supports `%product_title%` and `%customer_email%` |
| **Repeated subscription alert** | Shown if a customer tries to subscribe to a product they're already on the list for |
| **Email validation error** | Shown when the entered email is missing or badly formatted |
| **Unsubscribe confirmation** | Shown after a successful unsubscribe |

**Note:** if you're using Loco Translator, editing these fields replaces the default (already translatable) text with your own custom text, which Loco can no longer translate automatically — only customize these if you're happy entering the text yourself in each language you support.

## Subscription Form Designer

Go to **Settings → Subscription Form Designer**. The **Free** tab shows a preview of the simple email-field-and-button form every subscriber sees. Full drag-and-drop form building — adding text, phone and reCAPTCHA fields to the form — is a **[PRO]** feature (the **Pro** tab).

## Notifications

Go to **Settings → Notifications**. This tab is about who gets notified, not what subscribers see.

| Setting | What it does |
|---|---|
| **Recipient email for new subscriber** | Email address(es) that get notified whenever a customer subscribes. Separate multiple addresses with commas |
| **Block email domains** [PRO] | Domains that are never allowed to subscribe |
| **Blocked domain alert message** [PRO] | Message shown when a signup is rejected for a blocked domain |
| **Blocked email addresses** [PRO] | Specific addresses that are never allowed to subscribe |
| **Blocked email alert message** [PRO] | Message shown when a signup is rejected for a blocked address |

## Related

- [GETTING-STARTED](GETTING-STARTED.md)
- [SUBSCRIBERS](SUBSCRIBERS.md)
- [TROUBLESHOOTING](TROUBLESHOOTING.md)
