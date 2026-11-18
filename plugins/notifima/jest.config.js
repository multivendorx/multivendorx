/** @type {import('jest').Config} */
module.exports = {
	testEnvironment: 'jsdom',
	rootDir: __dirname,
	testMatch: [ '<rootDir>/src/**/*.test.{ts,tsx,js,jsx}' ],
	transform: {
		'^.+\\.(t|j)sx?$': [ 'babel-jest', { configFile: './babel.config.test.js' } ],
	},
	moduleNameMapper: {
		'\\.(css|scss|less)$': 'identity-obj-proxy',
		// The real @multivendorx/zyra package transitively pulls in
		// @react-pdf/renderer (ESM-only), which breaks under Jest's default
		// CJS transform, and touching that shared package is out of scope
		// for this plugin. Stub the specific zyra exports this plugin's
		// components actually use instead of the whole package.
		'^@zyra/(core|components|inputs|table|builders)$': '<rootDir>/tests/js/__mocks__/zyraMock.js',
	},
	setupFilesAfterEnv: [ '<rootDir>/tests/js/setup.js' ],
	clearMocks: true,
};
