const defaultConfig = require(
	'@wordpress/prettier-config'
);

module.exports = {
	...defaultConfig,

	useTabs: true,

	tabWidth: 4,

	singleQuote: true,

	trailingComma: 'es5',
};