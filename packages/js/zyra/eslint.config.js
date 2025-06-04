import wordpressPlugin from "@wordpress/eslint-plugin";
import js from "@eslint/js";
import typescriptParser from "@typescript-eslint/parser";
import globals from "globals";

export default [
    // 1. Base ESLint recommended
    js.configs.recommended,

    // 2. WordPress plugin setup
    {
        plugins: {
            "@wordpress": wordpressPlugin,
        },
        rules: {
            // Manually include essential WordPress rules
            "@wordpress/no-unsafe-wp-apis": "error",
            "@wordpress/i18n-text-domain": "error",

            // Your custom rule overrides
            indent: "off",
            quotes: "off",
            "@typescript-eslint/indent": "off",
            "react/jsx-indent": "off",
            "react/jsx-indent-props": "off",
            "no-alert": "off",
            "jsx-a11y/click-events-have-key-events": "off",
            "jsx-a11y/no-static-element-interactions": "off",
            curly: "off",
            "no-undef": "off",
        },
    },

    // 3. Environment config
    {
        files: [ "**/*.{js,jsx,ts,tsx}" ],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                wp: "readonly",
                jQuery: "readonly",
            },
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 2020,
                jsx: true,
            },
        },
    },

    // 4. Ignore patterns
    {
        ignores: [ "**/node_modules/**", "**/.wireit/**", "**/build/**" ],
    },
];
