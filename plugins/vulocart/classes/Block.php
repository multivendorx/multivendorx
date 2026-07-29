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
 * The vision's "Provide Gutenberg Blocks" list (Catalog, Offering Grid,
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
        add_action( 'save_post', array( $this, 'clear_block_page_url_cache' ) );
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
        $settings = wp_parse_args( get_option( Utill::SETTINGS_KEY, array() ), Utill::SETTINGS_DEFAULTS );

        $config = array(
            'apiUrl'                  => untrailingslashit( esc_url_raw( rest_url() ) ),
            'restUrl'                 => VuloCart()->rest_namespace,
            // Checkout tab settings (src/settings/Checkout.ts) — real
            // storefront behavior now, not just saved-and-unread values:
            // src/blocks/checkout/Checkout.tsx enforces both client-side,
            // and Order\Rest::create_item() enforces guestCheckoutEnabled
            // again server-side (a client-side-only check isn't real
            // enforcement against a direct API call).
            'guestCheckoutEnabled'    => ! empty( $settings['guest_checkout_enabled'] ),
            'requireTermsAcceptance'  => ! empty( $settings['require_terms_acceptance'] ),
            'checkoutTermsUrl'        => (string) $settings['checkout_terms_url'],
            'isLoggedIn'              => is_user_logged_in(),
            // Frontend tab (src/settings/General/Frontend.ts) — whether the
            // checkout block shows its catalog-browsing section at all, and
            // whether the block functions at all.
            'offeringsListingEnabled' => ! empty( $settings['enable_offerings_listing'] ),
            'cartCheckoutEnabled'     => ! empty( $settings['enable_cart_checkout'] ),
            // Cross-links between the storefront blocks — see
            // find_page_url_with_block()'s own docblock for why this is
            // auto-discovered rather than a settings field the merchant
            // has to fill in by hand.
            'checkoutPageUrl'         => $this->find_page_url_with_block( 'vulocart/checkout' ),
            'offeringsPageUrl'        => $this->find_page_url_with_block( 'vulocart/offerings' ),
        );

        echo '<script id="vulocart-frontend-data">window.vulocartFrontendData = ' . wp_json_encode( $config ) . ';</script>' . "\n"; // phpcs:ignore WordPress.WP.EnqueuedResources.NonEnqueuedScript -- a ~2-property inline config object, not a real script asset; every other frontend block's view.js depends on this existing before it runs (see docblock).
    }

    /**
     * Finds the first published page/post containing a given block,
     * returning its permalink — backs `checkoutPageUrl`/
     * `offeringsPageUrl` in `vulocartFrontendData`, so
     * `src/blocks/offerings/OfferingDetail.tsx`'s "Go to checkout" link
     * and any future cross-link between the storefront blocks don't
     * require the merchant to manually configure a page URL in Settings
     * (this plugin's admin-UX brief already asks for "make settings
     * compact" — a block-editor "which page is checkout?" picker control
     * would be its own real feature; a merchant only ever needs to add
     * the block to a page once for this to resolve correctly). Cached in
     * a transient, cleared on every `save_post` (clear_block_page_url_cache())
     * rather than tracked precisely per-post, since this only needs to be
     * roughly fresh (a page's block content changing is a rare, admin-only
     * action) and a wrong stale URL for at most one save cycle is harmless.
     *
     * @param string $block_name Registered block name, e.g. 'vulocart/checkout'.
     * @return string|null Permalink, or null if no published page/post has this block.
     */
    private function find_page_url_with_block( string $block_name ): ?string {
        $cache_key = 'vulocart_page_url_' . str_replace( '/', '_', $block_name );
        $cached    = get_transient( $cache_key );

        if ( false !== $cached ) {
            return '' === $cached ? null : $cached;
        }

        global $wpdb;

        $post_id = $wpdb->get_var( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- one-time lookup, result cached in a transient immediately below.
            $wpdb->prepare(
                "SELECT ID FROM {$wpdb->posts} WHERE post_status = 'publish' AND post_type IN ('page', 'post') AND post_content LIKE %s ORDER BY ID ASC LIMIT 1", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- $wpdb->posts, not user input.
                '%<!-- wp:' . $wpdb->esc_like( $block_name ) . '%'
            )
        );

        $url = $post_id ? get_permalink( (int) $post_id ) : null;

        set_transient( $cache_key, $url ? $url : '', HOUR_IN_SECONDS );

        return $url ? $url : null;
    }

    /**
     * Clears find_page_url_with_block()'s cache whenever any post/page is
     * saved — cheap and broad rather than trying to detect exactly which
     * save could have added/removed a `vulocart/checkout`/
     * `vulocart/offerings` block, since `save_post` isn't hot enough
     * (admin-only, infrequent) to make that precision worth the
     * complexity.
     *
     * @return void
     */
    public function clear_block_page_url_cache(): void {
        delete_transient( 'vulocart_page_url_vulocart_checkout' );
        delete_transient( 'vulocart_page_url_vulocart_offerings' );
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
