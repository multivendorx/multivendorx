/* eslint-disable no-console */
import fs from 'fs-extra';
import chalk from 'chalk';
import path from 'path';
import { glob } from 'glob';

const targetFiles = [ "release/assets/js" ];
const dest = [
    {
        dest: "release/assets/js/externals",
        rule: "moveNum",
    },
];

// Ensure destination directory exists
fs.ensureDirSync( dest[ 0 ].dest );

targetFiles.forEach( ( file, ind ) => {
    const fileDir = path.resolve( file );
    const files = glob.sync( `${ fileDir }/**/*.{js,php}` );
    const rule = dest[ ind ].rule;

    if ( rule === "moveNum" ) {
        files.forEach( ( subfile ) => {
            const fullPath = path.resolve( subfile );
            const basename = path.basename( fullPath );

            if ( basename.match( /^\d+/ ) ) {
                const destPath = path.join( dest[ ind ].dest, basename ); // Create full destination path

                fs.move( fullPath, destPath, { overwrite: true }, ( error ) => {
                    if ( error ) {
                        console.log( chalk.red( error ) );
                    } else {
                        console.log(
                            chalk.greenBright(
                                `File moved: ${ subfile } → ${ destPath }`
                            )
                        );
                    }
                } );
            }
        } );
    }
    else{
        // move all files
    }
} );
