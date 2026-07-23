<?php
/**
 * GeoAuthorInfoScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags published posts/pages whose author has no bio set
 * (`get_the_author_meta('description')`). AI answer engines weigh
 * visible author expertise/identity signals when deciding whether to
 * cite a source (part of what Google's own EEAT framework calls
 * "Experience/Expertise") — content with no identifiable author bio
 * gives an AI crawler nothing to evaluate that signal from.
 *
 * @class       GeoAuthorInfoScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class GeoAuthorInfoScanner extends AbstractBasicScanner {

    private const BATCH_SIZE = 50;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'geo-author-info';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Author Information', 'vulopilot' );
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
            $bio = get_the_author_meta( 'description', $post->post_author );

            if ( '' !== trim( (string) $bio ) ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is the post/page title. */
                    __( 'No author bio available: %s', 'vulopilot' ),
                    get_the_title( $post )
                ),
                Severity::LOW,
                $this->get_category(),
                __( 'AI answer engines weigh visible author expertise when deciding whether to cite a source. A missing author bio gives them nothing to evaluate.', 'vulopilot' ),
                'post',
                (string) $post->ID
            );
        }

        return $findings;
    }
}
