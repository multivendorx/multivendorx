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

			// Base rules don't understand TS-only constructs (ambient .d.ts
			// function signatures, TS global types like __WebpackModuleApi) -
			// the @typescript-eslint rule below replaces no-unused-vars, and
			// tsc itself is the real check for genuinely undefined names.
			'no-unused-vars': 'off',
			'no-undef': 'off',

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