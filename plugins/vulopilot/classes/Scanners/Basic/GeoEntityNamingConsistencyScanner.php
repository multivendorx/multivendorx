<?php
/**
 * GeoEntityNamingConsistencyScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilot\ValueObjects\Finding;
use VuloPilot\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags published posts/pages that mention the site's own name (the brand
 * entity) in more than one distinct casing/spacing variant — e.g.
 * "VuloPilot" in one paragraph and "Vulopilot"/"Vulo Pilot" in another. AI
 * answer engines resolve entities partly by exact-string consistency, so
 * a brand name that isn't written the same way throughout a piece of
 * content is a real (if heuristic) readability signal, the same "regex
 * heuristic, not a claim to verify meaning" posture every other Geo*
 * scanner in this file already takes (see GeoCitationOpportunityScanner's
 * own docblock for the same reasoning).
 *
 * Skips sites with a very short name (under 3 characters) — a short site
 * name is too likely to substring-collide with unrelated words, the same
 * defensive narrowing GeoEeatSignalsScanner applies to its own two-signal
 * check.
 *
 * @class       GeoEntityNamingConsistencyScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class GeoEntityNamingConsistencyScanner extends AbstractBasicScanner {

    private const BATCH_SIZE = 50;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'geo-entity-naming-consistency';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Entity Naming Consistency', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_category(): string {
        return 'geo';
    }

    /**
     * @inheritDoc
     */
    public function scan(): array {
        $site_name = trim( (string) get_bloginfo( 'name' ) );

        if ( strlen( $site_name ) < 3 ) {
            return array();
        }

        $findings = array();
        $posts    = get_posts(
            array(
                'post_type'      => array( 'post', 'page' ),
                'post_status'    => 'publish',
                'posts_per_page' => self::BATCH_SIZE,
                'orderby'        => 'modified',
                'order'          => 'DESC',
            )
        );

        foreach ( $posts as $post ) {
            $variants = $this->find_naming_variants( wp_strip_all_tags( $post->post_content ), $site_name );

            if ( count( $variants ) < 2 ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is the post/page title. */
                    __( 'Brand name written inconsistently: %s', 'vulopilot' ),
                    get_the_title( $post )
                ),
                Severity::LOW,
                $this->get_category(),
                sprintf(
                    /* translators: %s is a comma-separated list of the different spellings found. */
                    __( 'This content refers to the site as multiple different spellings/casings (%s). AI answer engines resolve entities more reliably when a brand name is written the exact same way throughout.', 'vulopilot' ),
                    implode( ', ', $variants )
                ),
                'post',
                (string) $post->ID
            );
        }

        return $findings;
    }

    /**
     * Every distinct exact-casing/spacing substring of $content that
     * matches $site_name case-insensitively.
     *
     * @param string $content   Plain-text post content.
     * @param string $site_name The site's own name.
     * @return string[]
     */
    private function find_naming_variants( string $content, string $site_name ): array {
        if ( ! preg_match_all( '/' . preg_quote( $site_name, '/' ) . '/i', $content, $matches ) ) {
            return array();
        }

        return array_values( array_unique( $matches[0] ) );
    }
}
