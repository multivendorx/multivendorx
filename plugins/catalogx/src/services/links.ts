/**
 * Links out of the CatalogX admin, in one place: each carries the same campaign tag, so a change to a URL or the tag
 * is one edit.
 */

/** The campaign tag on every link to catalogx.com and the team's other plugin sites. */
export const UTM =
	'utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx';

/** CatalogX's documentation. */
export const DOCS_URL = `https://catalogx.com/docs/?${UTM}`;

/** The customer account: downloads, license keys, renewals. */
export const ACCOUNT_URL = `https://catalogx.com/my-account/?${UTM}`;

/** Contact our support team. */
export const CONTACT_URL = `https://catalogx.com/support/?${UTM}`;

/** Ask the CatalogX community. */
export const COMMUNITY_URL = `https://catalogx.com/community/?${UTM}`;

/** Hire the team for setup or custom work. */
export const EXPERTS_URL = `https://catalogx.com/hire-experts/?${UTM}`;

/** Plans and prices. */
export const PRICING_URL = `https://catalogx.com/pricing/?${UTM}`;
