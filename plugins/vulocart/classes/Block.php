<?php
/**
 * Block class file.
 *
 * @package VuloCart
 */

namespace VuloCart;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Block class.
 *
 * Discovers and registers every Gutenberg block VuloCart ships, mirroring
 * `MultiVendorX\Block`'s own discovery mechanism: `tools/webpack/
 * create-config.js` builds each `src/blocks/{name}/` folder into
 * `assets/js/block/{name}/` (block.json copied alongside the built JS via
 * `CopyWebpackPlugin` — coding-standards.md's build section), and this
 * class `glob()`s that *built* directory at runtime rather than hardcoding
 * a block list, so a new block folder under `src/blocks/` is picked up
 * automatically after a build with no PHP change needed here.
 *
 * The vision's "Provide Gutenberg Blocks" list (Catalog, Asset Grid,
 * Checkout, Cart, Search, Buy Button, Recommendations, Collections) will
 * each just be another `src/blocks/{name}/` folder discovered the same
 * way — this class doesn't need to change as more are added.
 *
 * @class       Block class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Block {

    /**
     * Discovered blocks, cached for the lifetime of one request.
     *
     * @var array<int, array{name: string, path: string}>|null
     */
    private $blocks;

    /**
     * Block constructor.
     */
    public function __construct() {
        add_action( 'init', array( $this, 'register_blocks' ) );
        add_action( 'wp_head', array( $this, 'print_frontend_config' ) );
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_shared_vendors_chunk' ), 20 );
    }

    /**
     * Prints a tiny inline `vulocartFrontendData` global on every frontend
     * page load — deliberately not `wp_localize_script()` against a
     * specific block's auto-generated view-script handle (fragile to
     * depend on WordPress's exact handle-naming convention); `wp_head`
     * always runs before any `viewScript` (typically footer-enqueued), so
     * this is guaranteed to exist by the time a block's view.js runs.
     * Cheap and harmless to print unconditionally even on pages with no
     * VuloCart block — same tradeoff Cart/Order's public REST routes
     * already accept (no nonce needed since these routes don't require
     * one, see RestAPI/Controllers/Cart.php's own docblock).
     *
     * @return void
     */
    public function print_frontend_config(): void {
        $config = array(
            'apiUrl'  => untrailingslashit( esc_url_raw( rest_url() ) ),
            'restUrl' => VuloCart()->rest_namespace,
        );

        echo '<script id="vulocart-frontend-data">window.vulocartFrontendData = ' . wp_json_encode( $config ) . ';</script>' . "\n"; // phpcs:ignore WordPress.WP.EnqueuedResources.NonEnqueuedScript -- a ~2-property inline config object, not a real script asset; every other frontend block's view.js depends on this existing before it runs (see docblock).
    }

    /**
     * Scans `assets/js/block/` for built block folders containing a
     * `block.json`.
     *
     * @return array<int, array{name: string, path: string}>
     */
    private function get_blocks(): array {
        if ( null !== $this->blocks ) {
            return $this->blocks;
        }

        $this->blocks = array();

        $block_base_path = VuloCart()->plugin_path . 'assets/js/block/';

        if ( ! is_dir( $block_base_path ) ) {
            return $this->blocks;
        }

        $folders = glob( $block_base_path . '*', GLOB_ONLYDIR );

        foreach ( $folders as $folder ) {
            if ( file_exists( $folder . '/block.json' ) ) {
                $this->blocks[] = array(
                    'name' => basename( $folder ),
                    'path' => $folder,
                );
            }
        }

        return $this->blocks;
    }

    /**
     * Registers every discovered block.
     *
     * @return void
     */
    public function register_blocks(): void {
        foreach ( $this->get_blocks() as $block ) {
            register_block_type( $block['path'] );
        }
    }

    /**
     * Makes every block's `viewScript` depend on the shared `vendors.js`
     * chunk webpack's `splitChunks` produces (`tools/webpack/
     * create-config.js`, coding-standards.md's build section) — the same
     * chunk `classes/Admin/Menu.php` already has to explicitly enqueue
     * ahead of `index.js` for the wp-admin bundle, for the identical
     * reason: any npm dependency a block's view.js imports that isn't a
     * WordPress-provided external (e.g. `axios`, used by
     * `src/blocks/checkout/Checkout.tsx`) lands in `vendors.js`, not the
     * view script itself, and `DependencyExtractionWebpackPlugin`'s
     * generated `.asset.php` only ever lists WordPress script handles —
     * it has no way to know about this internal chunk. Without this,
     * `register_block_type()`'s automatic script registration (which only
     * reads that `.asset.php`) enqueues the view script with a dependency
     * list missing `vendors.js` entirely, so the view script's own
     * `import axios from 'axios'` fails at runtime with nothing on the
     * page ever visibly erroring (confirmed the hard way: no console
     * error, just a silently unmounted block).
     *
     * @return void
     */
    public function enqueue_shared_vendors_chunk(): void {
        $vendors_asset_file = VuloCart()->plugin_path . 'assets/js/vendors.asset.php';

        if ( ! file_exists( $vendors_asset_file ) ) {
            return;
        }

        $vendors_asset = require $vendors_asset_file;

        wp_register_script(
            'vulocart-block-vendors',
            VuloCart()->plugin_url . 'assets/js/vendors.js',
            $vendors_asset['dependencies'],
            $vendors_asset['version'],
            true
        );

        foreach ( $this->get_blocks() as $block ) {
            $handle = 'vulocart-' . $block['name'] . '-view-script';

            if ( wp_script_is( $handle, 'registered' ) ) {
                wp_scripts()->registered[ $handle ]->deps[] = 'vulocart-block-vendors';
            }
        }
    }
}
