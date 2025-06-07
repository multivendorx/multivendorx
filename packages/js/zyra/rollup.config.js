import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import copy from "rollup-plugin-copy";
import terser from "@rollup/plugin-terser";

export default {
    input: "src/index.ts",
    output: {
        globals: {
            react: "React",
            "react-dom": "ReactDOM",
        },
        dir: "build",
        format: "esm",
    },
    context: "this",
    treeshake: true,
    plugins: [
        copy( {
            targets: [
                { src: "src/assets/fonts/*", dest: "build/assets/fonts" }, // Adjust paths accordingly
            ],
            verbose: true,
        } ),
        peerDepsExternal( {
            includeDependencies: true,
        } ),
        json(),
        resolve( {
            browser: true,
            preferBuiltins: false,
        } ),
        commonjs(),
        typescript( {
            tsconfig: "./tsconfig.json",
        } ),
        postcss( {
            extract: "index.css", // Extract CSS into this file
            minimize: true,
            use: [ "sass" ],
        } ),
        terser(),
    ],
    external: [ "react", "react-dom" ],
    onwarn( warning, warn ) {
        if ( warning.code === "MODULE_LEVEL_DIRECTIVE" ) return;
        warn( warning );
    },
};
