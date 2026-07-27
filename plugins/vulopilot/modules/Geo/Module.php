<?php
/**
 * Module class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Geo;

use VuloPilot\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * VuloPilot Geo module.
 *
 * The GEO scanners themselves (Scanners\Basic\Geo*) always run (no
 * whole-category kill switch — see ScannerRegistry::get_disabled_categories())
 * and the llms.txt virtual route/physical file (GeoAnalysis\LlmsTxtGenerator)
 * stays core, gated only by 'enable_llms_txt' (Settings → GEO), the same
 * way it worked before this module existed — so toggling this module off
 * can never take down a live `/llms.txt` URL an AI crawler may already be
 * relying on.
 *
 * This module's own, narrower job: auto-regenerating llms.txt on
 * publish/update, per Settings → GEO's `llms_auto_regen` field — the one
 * piece of GEO behavior that's genuinely optional convenience layered on
 * top of the core feature, rather than the feature itself. Same
 * Module.php shape module-architecture.md documents for multivendorx-pro/
 * catalogx-pro, discovered by VuloPilot's own free-plugin `modules/`
 * source (Modules::get_all_modules()'s default, self-registered
 * `VuloPilot` namespace — no filter registration needed since this
 * module ships in Free itself).
 *
 * @class       Module class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Module {

    /**
     * Module constructor.
     */
    public function __construct() {
        add_action( 'save_post', array( $this, 'maybe_regenerate_llms_txt' ), 10, 2 );
    }

    /**
     * @param int      $post_id Post being saved.
     * @param \WP_Post $post    Same post object.
     * @return void
     */
    public function maybe_regenerate_llms_txt( int $post_id, \WP_Post $post ): void {
        if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
            return;
        }

        if ( 'publish' !== $post->post_status ) {
            return;
        }

        $settings = wp_parse_args( get_option( Utill::VULOPILOT_SETTINGS_KEY, array() ), Utill::VULOPILOT_SETTINGS_DEFAULTS );

        if ( empty( $settings['enable_llms_txt'] ) || empty( $settings['llms_auto_regen'] ) ) {
            return;
        }

        $content = VuloPilot()->llms_txt_generator->generate();

        VuloPilot()->llms_txt_generator->write_file( $content );

        // Keeps Settings → GEO's textarea showing the same content the
        // live file now has, not the pre-publish version, next time an
        // admin opens it — same "virtual route/file/setting should never
        // disagree" posture LlmsTxtGenerator::maybe_serve() already keeps.
        $settings['llms_txt_content'] = $content;
        update_option( Utill::VULOPILOT_SETTINGS_KEY, $settings );
    }

    /**
     * @return self
     */
    public static function init(): self {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }
}
