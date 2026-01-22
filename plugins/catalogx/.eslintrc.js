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
        'jsx-a11y/no-noninteractive-element-interaction': 'off',
        // Example: <p onClick={handleClick}>Click</p> // Normally not allowed

        // Allow static elements like <div> or <span> to have interaction handlers
        'jsx-a11y/no-static-element-interactions': 'off',
        // Example: <div onClick={doSomething}>Click</div> // No warning
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
