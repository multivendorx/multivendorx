<?php
/**
 * GeoTrustSignalsScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * A sitewide (not per-post) check: does this site have a published page
 * whose slug identifies it as an About or Contact page. AI answer
 * engines and human readers alike use "who is behind this site" pages as
 * a baseline trust signal before treating a site as citable — their
 * complete absence is a real, checkable gap distinct from
 * GeoEeatSignalsScanner's per-post authorship/freshness check.
 *
 * @class       GeoTrustSignalsScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class GeoTrustSignalsScanner extends AbstractBasicScanner {

    /**
     * Common slugs for these two page types — a real, bounded check
     * against the conventional naming almost every site uses, not a
     * content-based guess.
     */
    private const ABOUT_SLUGS   = array( 'about', 'about-us', 'about-me' );
    private const CONTACT_SLUGS = array( 'contact', 'contact-us' );

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'geo-trust-signals';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Trust Signals', 'vulopilot' );
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
        $findings   = array();
        $has_about   = $this->has_published_page_matching_slug( self::ABOUT_SLUGS );
        $has_contact = $this->has_published_page_matching_slug( self::CONTACT_SLUGS );

        if ( $has_about && $has_contact ) {
            return $findings;
        }

        $missing = array();
        if ( ! $has_about ) {
            $missing[] = __( 'an About page', 'vulopilot' );
        }
        if ( ! $has_contact ) {
            $missing[] = __( 'a Contact page', 'vulopilot' );
        }

        $findings[] = new Finding(
            sprintf(
                /* translators: %s is a comma-separated list of missing page types. */
                __( 'Site is missing %s', 'vulopilot' ),
                implode( ' and ', $missing )
            ),
            Severity::MEDIUM,
            $this->get_category(),
            __( 'AI answer engines and readers both use "who is behind this site" pages as a baseline trust signal before treating content as citable.', 'vulopilot' ),
            'url',
            home_url( '/' ),
            array( 'has_about' => $has_about, 'has_contact' => $has_contact )
        );

        return $findings;
    }

    /**
     * @param string[] $slugs Candidate page slugs.
     * @return bool
     */
    private function has_published_page_matching_slug( array $slugs ): bool {
        foreach ( $slugs as $slug ) {
            $page = get_page_by_path( $slug, OBJECT, 'page' );

            if ( $page && 'publish' === $page->post_status ) {
                return true;
            }
        }

        return false;
    }
}
