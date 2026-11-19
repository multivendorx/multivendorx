/**
 * Links out of the Notifima admin, in one place: each carries the same campaign tag, so a change to a URL or the tag
 * is one edit.
 */

/** The campaign tag on every link to notifima.com. */
export const UTM =
	'utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=notifima';

/** Notifima's documentation. */
export const DOCS_URL = `https://notifima.com/docs/?${UTM}`;

/** The customer account: downloads, license keys, renewals. */
export const ACCOUNT_URL = `https://notifima.com/my-account/?${UTM}`;

/** Contact our support team. */
export const CONTACT_URL = `https://notifima.com/contact/?${UTM}`;

/** Book a call with a Notifima specialist. */
export const CONSULTATION_URL = 'https://calendly.com/contact-notifima/30min?back=1';
