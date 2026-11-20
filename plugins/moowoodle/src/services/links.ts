/**
 * Links out of the MooWoodle admin, in one place: each carries the same campaign tag, so a change to a URL or the tag
 * is one edit.
 */

/** The campaign tag on every link to moowoodle.com and dualcube.com. */
export const UTM =
	'utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=moowoodle';

/** MooWoodle's documentation. */
export const DOCS_URL = `https://dualcube.com/knowledgebase/?${UTM}`;
/** The customer account: downloads, license keys, renewals. */
export const ACCOUNT_URL = `https://dualcube.com/my-account/?${UTM}`;

/** Contact our support team. */
export const CONTACT_URL = `https://dualcube.com/contact-us/?${UTM}`;
