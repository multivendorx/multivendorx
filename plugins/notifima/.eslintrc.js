module.exports = {
    extends: ["plugin:@wordpress/eslint-plugin/recommended"],
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    globals: {
        wp: true,
        wpApiSettings: true,
        wcSettings: true,
        es6: true,
    },
    rules: {
        "prettier/prettier": "off",
        quotes: "off",
        "no-multi-spaces": "off",
        // indent: "off",
        // quotes: "off",
        // "@typescript-eslint/indent": "off",
        // "react/jsx-indent": "off",
        // "react/jsx-indent-props": "off",
        // "no-alert": "off",
        // "jsx-a11y/click-events-have-key-events": "off",
        // "jsx-a11y/no-static-element-interactions": "off",
        // curly: "off",
    },
    parserOptions: {
        ecmaVersion: 8,
        ecmaFeatures: {
            modules: true,
            experimentalObjectRestSpread: true,
            jsx: true,
        },
    },
};
