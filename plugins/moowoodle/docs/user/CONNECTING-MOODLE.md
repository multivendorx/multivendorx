# Connecting Moodle

## What it does

This is the one-time setup that links your WordPress site to your Moodle site, so MooWoodle can read course data and create enrollments.

## Why it matters

Nothing else in the plugin works until this connection is in place — no courses can sync and no enrollment can happen without it.

## How to use it

1. In your Moodle site, create (or locate) a web-service access token with the permissions MooWoodle needs (course, category, user and enrollment web services).
2. Go to **MooWoodle → Settings → Connection & Access**.
3. Enter your **Moodle site URL** and **Moodle access token**.
4. Click **MooWoodle test connection** — this confirms WordPress can actually reach your Moodle site and that the token works, before you rely on it for real orders.
5. If the test fails, double check the URL (no trailing slash issues, correct protocol) and that the token hasn't expired or been revoked in Moodle.

## Does Moodle have to be on the same server?

No — MooWoodle works whether WordPress and Moodle are on the same server or on completely separate hosts. It only needs to be able to reach your Moodle site's URL over the network.

## Can one Moodle site serve multiple WordPress sites?

Yes — you can connect a single Moodle instance to more than one WordPress site, which is useful for agencies or multi-brand learning platforms.

## Settings explained

Go to **Settings → Connection & Access**.

| Setting | What it does | Why you'd change it |
|---|---|---|
| **Moodle site URL** | The base URL of your Moodle installation | Required — this is where every synced request is sent |
| **Moodle access token** | Authenticates MooWoodle's requests to Moodle | Rotate it if you suspect it's been exposed |
| **MooWoodle test connection** | Checks the URL/token actually work | Run this any time something isn't syncing — it's the fastest way to rule out a connection problem |
| **Single Sign On** [PRO] | Lets a user log into WordPress and Moodle with one login | Removes the friction of a separate Moodle login for students |

## Related

- [GETTING-STARTED](GETTING-STARTED.md)
- [COURSES](COURSES.md)
- [TROUBLESHOOTING](TROUBLESHOOTING.md)
