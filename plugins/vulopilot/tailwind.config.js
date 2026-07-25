/**
 * This plugin's React bundle shares a global CSS scope with the rest of
 * wp-admin (its own stylesheet, other plugins' screens) and with zyra's
 * own global class names (`.admin-badge`, `.analytics-container`, etc.) —
 * there's no CSS Modules/Shadow DOM isolation here. Enabling Tailwind's
 * unprefixed utility set (`.border`, `.hidden`, `.container`, `.flex`,
 * ...) would very likely collide with one of those. `prefix: 'tw-'` keeps
 * every Tailwind class name unambiguous; `preflight: false` stops
 * Tailwind's CSS reset from silently changing button/input/heading
 * appearance across the *entire* wp-admin page this bundle loads on, not
 * just this plugin's own markup.
 */
module.exports = {
	content: ['./src/**/*.{js,jsx,ts,tsx}'],
	prefix: 'tw-',
	corePlugins: {
		preflight: false,
	},
	theme: {
		extend: {},
	},
	plugins: [],
};
