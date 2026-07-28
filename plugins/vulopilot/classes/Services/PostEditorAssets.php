<?php
/**
 * PostEditorAssets class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Services;

use VuloPilot\AIActions\Actions\GenerateSchemaAction;

defined( 'ABSPATH' ) || exit;

/**
 * Enqueues the "Meta Box Appearing in Single Posts & Pages" (readme's
 * research into rankmath.com/kb/on-page-seo/) — src/post-editor/index.tsx,
 * a `@wordpress/plugins` PluginSidebar registered into the Block Editor,
 * not a mount into VuloPilot's own dashboard app (react-frontend.md's
 * `#admin-main-wrapper` render is a different mount point entirely; this
 * is the first VuloPilot surface that hooks the Block Editor itself).
 *
 * Only enqueued for `post`/`page` edit screens, matching
 * AIActions\Actions\WriteMetaTitleAction/WriteMetaDescriptionAction's own
 * `in_array( $post->post_type, array( 'post', 'page' ) )` scope — the
 * metabox edits exactly the fields those two actions already know how to
 * write.
 *
 * @class       PostEditorAssets class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class PostEditorAssets {

    /**
     * PostEditorAssets constructor.
     */
    public function __construct() {
        add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_assets' ) );
    }

    /**
     * Enqueues the post-editor sidebar's script/style on post/page edit screens.
     *
     * @return void
     */
    public function enqueue_assets(): void {
        $screen = get_current_screen();

        if ( ! $screen || ! in_array( $screen->post_type, array( 'post', 'page' ), true ) ) {
            return;
        }

        $asset_file = VuloPilot()->plugin_path . 'assets/js/post-editor.asset.php';

        if ( ! file_exists( $asset_file ) ) {
            return;
        }

        $asset = include $asset_file;

        wp_enqueue_script(
            'vulopilot-post-editor',
            VuloPilot()->plugin_url . 'assets/js/post-editor.js',
            $asset['dependencies'],
            $asset['version'],
            true
        );

        $style_path = VuloPilot()->plugin_path . 'assets/styles/post-editor.css';
        if ( file_exists( $style_path ) ) {
            wp_enqueue_style( 'vulopilot-post-editor', VuloPilot()->plugin_url . 'assets/styles/post-editor.css', array(), $asset['version'] );
        }

        wp_localize_script(
            'vulopilot-post-editor',
            'vulopilotPostSeo',
            array(
                'apiUrl'   => esc_url_raw( rest_url( VuloPilot()->rest_namespace ) ),
                'nonce'    => wp_create_nonce( 'wp_rest' ),
                'isPro'    => VuloPilot()->util->is_khali_dabba(),
                // Same constant FrontendScripts::localize_scripts() itself
                // localizes as 'shop_url' — not a container key.
                'shopUrl'  => defined( 'VULOPILOT_PRO_SHOP_URL' ) ? VULOPILOT_PRO_SHOP_URL : '',
                // The metabox reads/writes native post meta via
                // wp.data's core/editor 'meta' attribute (registered by
                // Services\PostSeoMetaFields), keyed by these exact
                // strings — localized rather than hand-copied in TS so
                // the two layers can't drift apart.
                'metaKeys' => array_merge(
                    PostSeoMetaFields::META_KEYS,
                    array( 'schema_json' => GenerateSchemaAction::META_KEY )
                ),
            )
        );
    }
}
