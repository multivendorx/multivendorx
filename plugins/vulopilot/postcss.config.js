/**
 * wp-scripts' webpack config auto-discovers this file via postcss-loader
 * (its `hasPostCSSConfig()` check) — no change to the shared
 * tools/webpack/create-config.js factory needed, since this is a
 * per-plugin need, not a workspace-wide one.
 */
module.exports = {
	plugins: {
		tailwindcss: {},
		autoprefixer: {},
	},
};
