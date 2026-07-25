const createWebpackConfig = require(
	'../../tools/webpack/create-config'
);
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );

const config = createWebpackConfig(
	__dirname
);

/**
 * Tailwind CSS (src/tailwind.pcss) is used by this plugin only, not the
 * workspace as a whole — coding-standards.md's "don't hand-edit a
 * plugin's webpack.config.js for a workspace-wide need" implies the
 * inverse for a genuinely plugin-specific one: this file, not the shared
 * tools/webpack/create-config.js factory, is where it belongs.
 *
 * The shared factory's own `.css` rule (style-loader + css-loader, no
 * postcss-loader at all) and `.scss` rule (a hardcoded postcss-loader
 * whose plugins array is just `[autoprefixer]`, never reading a
 * project-level postcss.config.js) both bypass this plugin's root
 * postcss.config.js — @wordpress/scripts' own upstream default config
 * would auto-discover it via hasPostCSSConfig(), but this factory
 * replaces that default `.css`/`.scss` handling with the two rules
 * above. Rather than editing those shared rules (which every other
 * plugin in the workspace also resolves through), tailwind.pcss uses a
 * `.pcss` extension neither existing rule matches, and gets its own
 * dedicated rule appended here — additive, and inert for every plugin
 * that doesn't have a `tailwind.pcss` entry.
 */
config.module.rules.push( {
	test: /\.pcss$/,
	use: [
		MiniCssExtractPlugin.loader,
		{
			loader: 'css-loader',
			options: { importLoaders: 1 },
		},
		{
			loader: 'postcss-loader',
			options: {
				postcssOptions: {
					plugins: [
						require( 'tailwindcss' ),
						require( 'autoprefixer' ),
					],
				},
			},
		},
	],
} );

module.exports = config;
