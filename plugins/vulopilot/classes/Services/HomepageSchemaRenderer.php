<?php
/**
 * HomepageSchemaRenderer class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Services;

defined( 'ABSPATH' ) || exit;

/**
 * Outputs the `vulopilot_homepage_schema_json` option on `wp_head` for the
 * front page — the sitewide counterpart to Services\SchemaJsonLdRenderer's
 * per-post `_vulopilot_schema_json`. Distinct because Scanners\Basic\SchemaScanner/
 * StructuredDataValidationScanner both check `home_url('/')` specifically,
 * which isn't always a single post (a "latest posts" front page has no
 * one post to attach schema to), so this is a dedicated option rather than
 * postmeta — populated by vulopilot-pro's OneClickFix
 * `generate-homepage-schema` mechanical fix (MechanicalFixRunner), not by
 * any settings-screen field.
 *
 * No settings gate: like SchemaJsonLdRenderer, there's nothing to output
 * until the option actually has content, so construction is unconditional
 * and the hook is a no-op until then. Runs alongside SchemaJsonLdRenderer
 * without conflict — a static front page can legitimately have both its
 * own per-post schema (e.g. Article) AND this sitewide WebSite schema
 * output at once; multiple JSON-LD blocks per page is normal.
 *
 * @class       HomepageSchemaRenderer class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class HomepageSchemaRenderer {

    /**
     * HomepageSchemaRenderer constructor.
     */
    public function __construct() {
        add_action( 'wp_head', array( $this, 'maybe_output_schema' ) );
    }

    /**
     * Outputs the stored homepage schema as JSON-LD, if the front page and set.
     *
     * @return void
     */
    public function maybe_output_schema(): void {
        if ( ! is_front_page() ) {
            return;
        }

        $schema_json = get_option( 'vulopilot_homepage_schema_json', '' );

        if ( '' === $schema_json ) {
            return;
        }

        $decoded = json_decode( (string) $schema_json, true );

        if ( ! is_array( $decoded ) ) {
            return;
        }

        echo '<script type="application/ld+json">' . wp_json_encode( $decoded ) . '</script>' . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_json_encode() of a value this class itself constructed/validated, same pattern as SchemaJsonLdRenderer's own output.
    }
}
