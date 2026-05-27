import { defineConfig } from 'tsup';
import { sassPlugin } from 'esbuild-sass-plugin';

export default defineConfig({
    entry: ['src/index.ts'],

    format: ['esm', 'cjs'],

    dts: false,

    sourcemap: true,

    clean: true,

    splitting: false,

    external: [
        'react',
        'react-dom',

        '@emotion/react',
        '@emotion/styled',
        '@reactour/tour',
        '@tinymce/tinymce-react',

        'google-map-react',

        'react-drag-listview',
        'react-draggable',
        'react-multi-date-picker',
        'react-router-dom',
        'react-select',
        'react-sortablejs',
    ],

    esbuildPlugins: [
        sassPlugin({
            type: 'css',
        }),
    ],

    loader: {
        '.woff': 'file',
        '.woff2': 'file',
        '.ttf': 'file',
        '.eot': 'file',
        '.svg': 'file',
        '.png': 'file',
        '.jpg': 'file',
        '.jpeg': 'file',
        '.gif': 'file',
    },
});