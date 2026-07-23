<?php
/**
 * GeoEeatSignalsScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags published posts/pages showing neither of two real, checkable
 * EEAT (Experience, Expertise, Authoritativeness, Trustworthiness)
 * freshness/authorship signals: an author bio, or any edit after initial
 * publish (`post_modified` later than `post_date`, i.e. evidence the
 * content has been reviewed/kept current). Deliberately compound and
 * narrower than GeoAuthorInfoScanner's separate bio-only check — this
 * only fires when *both* signals are absent, since either one alone is a
 * real, if partial, trust signal on its own.
 *
 * @class       GeoEeatSignalsScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class GeoEeatSignalsScanner extends AbstractBasicScanner {

    private const BATCH_SIZE = 50;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'geo-eeat-signals';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'EEAT Signals', 'vulopilot' );
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
            $has_bio          = '' !== trim( (string) get_the_author_meta( 'description', $post->post_author ) );
            $has_been_updated = strtotime( $post->post_modified ) > strtotime( $post->post_date );

            if ( $has_bio || $has_been_updated ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is the post/page title. */
                    __( 'No EEAT signals found: %s', 'vulopilot' ),
                    get_the_title( $post )
                ),
                Severity::LOW,
                $this->get_category(),
                __( 'This content has no author bio and has never been updated since it was first published — two of the clearest signals AI engines use to judge expertise and trustworthiness are both missing.', 'vulopilot' ),
                'post',
                (string) $post->ID
            );
        }

        return $findings;
    }
}
