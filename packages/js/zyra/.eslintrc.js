module.exports = {
	extends: ['plugin:@wordpress/eslint-plugin/recommended'],
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
		// Don't require curly braces for one-line if/else/loops
		curly: 'off',
		// Example: if (x) doSomething(); // Allowed without braces

		// Don't enforce keyboard events when using onClick on elements
		'jsx-a11y/click-events-have-key-events': 'off',
		// Example: <div onClick={doSomething}>Click me</div> // No key event required

		// Allow non-interactive HTML elements to have interaction handlers
		// "jsx-a11y/no-noninteractive-element-interaction": "off",
		// Example: <p onClick={handleClick}>Click</p> // Normally not allowed

		// Don't require every <label> to be linked to an input field
		'jsx-a11y/label-has-associated-control': 'off',
		// Example: <label>Username</label> // No <input> needed

		// Allow static elements like <div> or <span> to have interaction handlers
		'jsx-a11y/no-static-element-interactions': 'off',
		// Example: <div onClick={doSomething}>Click</div> // No warning

		// Allow using roles (like button) on non-interactive elements
		'jsx-a11y/no-noninteractive-element-to-interactive-role': 'off',
		// Example: <div role="button">Click</div> // Normally discouraged, now allowed
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
			files: ['**/stories/*.ts', '**/stories/*.tsx'],
			rules: {
				'no-console': 'off',
			},
		},
	],
};
