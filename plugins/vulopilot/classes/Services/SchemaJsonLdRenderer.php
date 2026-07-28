<?php
/**
 * SchemaJsonLdRenderer class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Services;

defined( 'ABSPATH' ) || exit;

/**
 * Closes AIActions\Actions\GenerateSchemaAction's own documented gap:
 * that action only ever saved AI-generated JSON-LD to a postmeta key
 * (`_vulopilot_schema_json`) and said so itself — "Actually outputting
 * this JSON-LD on the frontend ... isn't built yet. This action's job
 * ends at saving valid schema data; rendering it is a separate, still-
 * needed piece." This class is that piece: it outputs whatever's saved
 * there as a real `<script type="application/ld+json">` tag on the
 * matching singular post/page, so a "Fix" via that action (or
 * vulopilot-pro's OneClickFix, e.g. for the sitewide-structured-data
 * scanner) actually resolves what a scanner checks for, not just writes
 * data nothing ever reads.
 *
 * No settings gate — unlike SitemapManager/RobotsTxtManager (which decide
 * whether to generate something site-wide), this only ever outputs
 * something a site owner (or an approved AI action) already explicitly
 * created for one specific post; there's nothing to output until that
 * postmeta exists.
 *
 * Self-registers its own hook in the constructor (php-wordpress.md) and
 * is constructed unconditionally in VuloPilot::init_classes().
 *
 * @class       SchemaJsonLdRenderer class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class SchemaJsonLdRenderer {

    /**
     * Must match GenerateSchemaAction::META_KEY.
     */
    private const META_KEY = '_vulopilot_schema_json';

    /**
     * SchemaJsonLdRenderer constructor.
     */
    public function __construct() {
        add_action( 'wp_head', array( $this, 'maybe_output_schema' ) );
    }

    /**
     * @return void
     */
    public function maybe_output_schema(): void {
        if ( ! is_singular() ) {
            return;
        }

        $schema_json = get_post_meta( get_queried_object_id(), self::META_KEY, true );

        if ( '' === $schema_json || ! is_string( $schema_json ) ) {
            return;
        }

        $decoded = json_decode( $schema_json, true );

        if ( ! is_array( $decoded ) ) {
            return; // Malformed/edited-outside-the-action value — don't output invalid JSON-LD.
        }

        echo '<script type="application/ld+json">' . wp_json_encode( $decoded ) . '</script>' . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_json_encode() output of a decoded structure, not raw user input.
    }
}
