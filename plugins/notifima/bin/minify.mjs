/* eslint-disable no-console */
import { minify as minifyJs } from 'terser';
import CleanCSS from 'clean-css';
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import chalk from 'chalk';
import sass from 'sass';

/**
 * This is the list of folders where the .js and .css files are present.
 * format: (path start from the root of the project './')
 * 1. 'dist' (directory)
 */
const sourceFolders = [
    "assets",
    ...glob.sync("modules/*/assets/*")
];

const { name } = JSON.parse( fs.readFileSync( "package.json" ) );

( async () => {
    for ( const sourceFolder of sourceFolders ) {
        console.log(
            chalk.bgYellowBright.black(
                `🧹Minification start in ${ sourceFolder }`
            )
        );
        const files = glob.sync( `${ sourceFolder }/**/*.{js,scss}` );

        for ( const file of files ) {
            try {
                console.log( chalk.bgCyanBright.black( `🧹Minify ${ file }` ) );
                let ext = path.extname( file );
                const content = await fs.readFile( file, "utf8" );

                let minified;
                if ( ext === ".js" ) {
                    const result = await minifyJs( content );
                    minified = result.code;
                } else if ( ext === ".scss" ) {
                    const compiled = sass.compile(file);
                    const result = new CleanCSS().minify( compiled.css );
                    minified = result.styles;
                    ext = ".css";
                }

                const relativePath = path.relative( '.', file );
                const parsed = path.parse( relativePath );

                let outputPath;
                if (relativePath.startsWith('assets/js')) {
                    outputPath = `release/assets/js/${name}-${parsed.name}.min${ext}`;
                } else if (relativePath.startsWith('assets/styles')) {
                    outputPath = `release/assets/styles/${name}-${parsed.name}.min${ext}`;
                } else if (relativePath.startsWith('modules/')) {
                    const parts = relativePath.split(path.sep); // ['modules', '{module_name}', 'assets', 'js' or 'styles', {file_name}]
                    const moduleName = parts[1];
                    const assetType = parts[3]; // js or styles
                    outputPath = path.join(
                        `release/assets/modules/${moduleName}/${assetType}`,
                        `${name}-${parsed.name}.min${ext}`
                    );
                } else {
                    console.log(chalk.yellow(`⚠️ Unknown file location: ${file}, skipping.`));
                    continue;
                }

                await fs.outputFile( outputPath, minified );
            } catch ( err ) {
                console.log(
                    chalk.red(
                        `❌ Error minifying ${ file }: ${ err.message }`
                    )
                );
            }
        }
    }
    console.log( chalk.bgGreenBright.black( "✅ Minification completed" ) );
} )();
