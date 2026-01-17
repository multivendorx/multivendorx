import { defineConfig } from 'eslint-define-config';
import js from '@eslint/js';
import prettierPlugin from 'eslint-plugin-prettier';
import wordpressPlugin from '@wordpress/eslint-plugin';
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
            '.prettierrc.js',
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
                appLocalizer: "readonly",
                __WebpackModuleApi: "readonly",
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
            // If you want to allow 'any' in some places without errors:
            // "@typescript-eslint/no-explicit-any": "off",
            // // To fix the unused vars error permanently:
            // "@typescript-eslint/no-unused-vars": "warn",
            // "@typescript-eslint/no-require-imports": "off",
            // "@typescript-eslint/no-unused-vars": [
            //     "warn", 
            //     { 
            //     "argsIgnorePattern": "^_",
            //     "varsIgnorePattern": "^_",
            //     "caughtErrorsIgnorePattern": "^_"
            //     }
            //],
        },
    },
]);
