/* eslint-disable no-console */
/**
 * This file is created to delete the unnecessery files.
 */
import fs from 'fs-extra';
import chalk from 'chalk';
import path from 'path';

/**
 * This is the list of files that are unnecessery for production build.
 * format: (path start from the root of the project './')
 * 1. 'dist' (directory)
 * 2. 'junk/junk.js' (file)
 */
const targetFiles = [ "dist" ];

const { name } = JSON.parse( fs.readFileSync( "package.json" ) );

console.log(
    chalk.bgYellowBright.black(
        `🧹Removing files that are unnecessery for production build in ${ name }`
    )
);

targetFiles.forEach( ( file ) => {
    const fileDir = path.resolve( file );
    fs.remove( fileDir, ( error ) => {
        if ( error ) {
            console.log( chalk.red( error ) );
        } else {
            console.log( chalk.greenBright( `🗑️Removed: ${ file }` ) );
        }
    } );
} );
