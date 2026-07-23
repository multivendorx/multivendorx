// Module declarations for asset imports. Kept in a file of its own,
// separate from global.d.ts's `declare global` augmentation — a
// shorthand `declare module '*.ext'` sharing a file with `export {}` +
// `declare global` silently stops being recognized by tsc's module
// resolution (reproduced in isolation while verifying this plugin's
// TypeScript), so this split isn't stylistic, it's load-bearing.
declare module '*.png';
declare module '*.svg';
