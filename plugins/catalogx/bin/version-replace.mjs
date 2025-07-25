import fs from 'fs-extra';
const replace = (await import('replace-in-file')).default;

/**
 * List of folders in which to update the version string.
 * Paths should start from the project root (e.g., './').
 */
const pluginFiles = [
    "classes/**/*",
    "assets/**/*",
    "src/**/*",
    "templates/**/*",
    "config.php",
    "Woocommerce_Catalog_Enquiry.php",
];

const { version } = JSON.parse( fs.readFileSync( "package.json" ) );

await replace( {
    files: pluginFiles,
    from: [ /PRODUCT_VERSION_SINCE/g, /PRO_PRODUCT_VERSION_SINCE/g ],
    to: version,
} );
