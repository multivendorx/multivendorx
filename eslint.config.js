const js = require('@eslint/js');

const globals = require('globals');

const tseslint = require(
	'@typescript-eslint/eslint-plugin'
);

const tsParser = require(
	'@typescript-eslint/parser'
);

module.exports = [
	/**
	 * Global ignores
	 */
	{
		ignores: [
			'**/node_modules/**',
			'**/vendor/**',
			
			'**/stories/**',

			'**/build/**',
			'**/dist/**',
			'**/release/**',

			'**/assets/**',

			'**/.wireit/**',
			'**/.cache/**',

			'**/coverage/**',

			'**/*.min.js',
			'**/*.bundle.js',
		],
	},

	js.configs.recommended,

	{
		files: ['**/*.{js,jsx,ts,tsx,mjs}'],

		languageOptions: {
			parser: tsParser,

			parserOptions: {
				ecmaVersion: 'latest',

				sourceType: 'module',

				ecmaFeatures: {
					jsx: true,
				},
			},

			globals: {
				...globals.browser,
				...globals.node,

				wp: 'readonly',
			},
		},

		plugins: {
			'@typescript-eslint': tseslint,
		},

		rules: {
			'no-console': 'off',

			'no-debugger': 'warn',

			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
		},
	},
];