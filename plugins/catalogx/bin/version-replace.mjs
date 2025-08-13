import fs from 'fs-extra';
const { replaceInFile } = await import('replace-in-file');

/**
 * List of folders in which to update the version string.
 */
const pluginFiles = [
    "classes/**/*",
    "assets/**/*",
    'modules/**/*',
    "src/**/*",
    "templates/**/*",
    "config.php",
    "Woocommerce_Catalog_Enquiry.php",
];

const { version } = JSON.parse( fs.readFileSync( "package.json" ) );

await replaceInFile( {
    files: pluginFiles,
    from: [/PRODUCT_VERSION/g, /PRO_PRODUCT_VERSION/g],
    to: version,
} );

console.log(`✅ Version placeholders replaced with: ${version}`);
