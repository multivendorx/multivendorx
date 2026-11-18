/**
 * Babel config used only by Jest (babel-jest), scoped to this plugin.
 * The webpack/production build continues to use its own existing
 * @wordpress/scripts-based toolchain untouched.
 */
module.exports = {
	presets: [
		[ '@babel/preset-env', { targets: { node: 'current' } } ],
		[ '@babel/preset-react', { runtime: 'automatic' } ],
		'@babel/preset-typescript',
	],
};
