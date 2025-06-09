module.exports = {
    extends: [ "plugin:@wordpress/eslint-plugin/recommended" ],
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
        curly: "off",
        "jsx-a11y/click-events-have-key-events": "off",
        "jsx-a11y/no-noninteractive-element-interaction": "off",
        "jsx-a11y/label-has-associated-control": "off",
        "jsdoc/check-line-alignment": "off",
        "jsx-a11y/no-static-element-interactions": "off",
        "jsx-a11y/no-noninteractive-element-to-interactive-role": "off"
    },
    parserOptions: {
        ecmaVersion: 8,
        ecmaFeatures: {
            modules: true,
            experimentalObjectRestSpread: true,
            jsx: true,
        },
    },
    overrides: [
		{
			files: [
				'**/stories/*.ts',
				'**/stories/*.tsx',
			],
			rules: {
				'no-console': "off",
			},
		},
	],
};
