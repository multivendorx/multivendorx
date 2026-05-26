import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import wordpressPlugin from '@wordpress/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default defineConfig([
	{
		ignores: [
			'bin/',
			'release/',
			'assets/',
			'.cache/',
			'.wireit/',
			'vendor/',
			'templates/',
			'classes/',
			'node_modules/',
			'*.config.js',
			'webpack.config.js',
			'.prettierrc.js'
		],
	},

	{
		files: ['**/*.{js,jsx,ts,tsx,mjs}'],

		languageOptions: {
			parser: tsParser,
			...js.configs.recommended.languageOptions,
			parserOptions: {
				ecmaVersion: 2020,
				sourceType: 'module',
				ecmaFeatures: { jsx: true },
			},
			globals: {
				...globals.browser,
				...globals.node,
				wp: 'readonly',
				wpApiSettings: 'readonly',
				wcSettings: 'readonly',
			},
		},

		plugins: {
			'@typescript-eslint': tsPlugin,
			'@wordpress': wordpressPlugin,
			prettier: prettierPlugin,
		},

		rules: {
			...js.configs.recommended.rules,
			...(tsPlugin.configs.recommended?.rules ?? {}),
			...wordpressPlugin.configs.recommended.rules,
		},
	},
]);