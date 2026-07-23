<?php
/**
 * OrphanPageScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags a published post/page that no other post among the same sampled
 * batch links to — an "orphan" page reachable only through search,
 * direct URL, or navigation menus outside the content itself, which
 * search engines discover far less reliably than pages reached through
 * in-content links (InternalLinkingScanner's complementary, opposite
 * check: does *this* page link out to others).
 *
 * Bounded to a fixed batch checked against itself (an O(n²) comparison,
 * capped at BATCH_SIZE² operations, small enough to stay fast — per
 * performance.md, an unbounded sitewide cross-reference would not be) —
 * a genuine, documented simplification: a page could still have an
 * inbound link from an older post outside this batch and be reported as
 * an orphan here. That trade-off is what keeps this scanner's runtime
 * bounded and predictable.
 *
 * @class       OrphanPageScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class OrphanPageScanner extends AbstractBasicScanner {

    private const BATCH_SIZE = 50;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'orphan-pages';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Orphan Pages', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_category(): string {
        return 'seo';
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

        if ( count( $posts ) < 2 ) {
            return $findings; // Nothing to cross-reference against.
        }

        foreach ( $posts as $post ) {
            $permalink = get_permalink( $post );

            if ( $this->has_inbound_link( $post, $posts, $permalink ) ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is the post/page title. */
                    __( 'No internal links point to this page: %s', 'vulopilot' ),
                    get_the_title( $post )
                ),
                Severity::LOW,
                $this->get_category(),
                __( 'Among the recently modified content sampled by this scan, nothing links to this page. Pages with no inbound internal links are harder for search engines to discover.', 'vulopilot' ),
                'post',
                (string) $post->ID
            );
        }

        return $findings;
    }

    /**
     * @param \WP_Post     $target    The post being checked for inbound links.
     * @param \WP_Post[]   $all_posts Every post in the sampled batch.
     * @param string|false $permalink The target's permalink.
     * @return bool
     */
    private function has_inbound_link( \WP_Post $target, array $all_posts, $permalink ): bool {
        if ( ! $permalink ) {
            return true; // Can't check without a real permalink — don't false-flag.
        }

        foreach ( $all_posts as $candidate ) {
            if ( $candidate->ID === $target->ID ) {
                continue;
            }

            if ( false !== strpos( $candidate->post_content, $permalink ) ) {
                return true;
            }
        }

        return false;
    }
}
