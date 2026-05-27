import { defineConfig } from 'tsup';
import { sassPlugin } from 'esbuild-sass-plugin';

export default defineConfig({
    entry: ['src/index.ts'],

    format: ['esm', 'cjs'],

    dts: false,

    splitting: false,
    sourcemap: true,
    clean: true,

    outDir: 'build',

    external: [
        'react',
        'react-dom',
    ],

    esbuildPlugins: [
        sassPlugin({
            type: 'css',
        }),
    ],

    loader: {
        '.scss': 'css',
        '.css': 'css',
        '.svg': 'file',
        '.png': 'file',
        '.jpg': 'file',
        '.woff': 'file',
        '.woff2': 'file',
        '.ttf': 'file',
        '.eot': 'file',
    },
});