<?php
/**
 * GeoFaqOpportunityScanner class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners\Basic;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Severity;

defined( 'ABSPATH' ) || exit;

/**
 * Flags long-form published posts/pages with no question-phrased heading
 * anywhere in the content (a real, bounded proxy for "no FAQ-style
 * section") — AI answer engines frequently lift direct question/answer
 * pairs verbatim into their responses, so content structured as explicit
 * questions is disproportionately more likely to be cited than the same
 * information written as plain prose. Pairs with
 * AIActions\Actions\GenerateFaqAction (GEO-MODULE.md) as the fix.
 *
 * @class       GeoFaqOpportunityScanner class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class GeoFaqOpportunityScanner extends AbstractBasicScanner {

    private const BATCH_SIZE              = 50;
    private const MIN_WORD_COUNT_TO_CHECK = 300;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'geo-faq-opportunity';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'FAQ Opportunities', 'vulopilot' );
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
            $word_count = str_word_count( wp_strip_all_tags( $post->post_content ) );

            if ( $word_count < self::MIN_WORD_COUNT_TO_CHECK ) {
                continue;
            }

            if ( preg_match( '/<h[2-6][^>]*>[^<]*\?\s*<\/h[2-6]>/i', $post->post_content ) ) {
                continue;
            }

            $findings[] = new Finding(
                sprintf(
                    /* translators: %s is the post/page title. */
                    __( 'No FAQ-style questions found: %s', 'vulopilot' ),
                    get_the_title( $post )
                ),
                Severity::LOW,
                $this->get_category(),
                __( 'AI answer engines frequently lift direct question/answer pairs into their responses. Content with no question-phrased headings is less likely to be cited this way.', 'vulopilot' ),
                'post',
                (string) $post->ID,
                array(
                    'word_count'      => $word_count,
                    'faq_opportunity' => true,
                )
            );
        }

        return $findings;
    }
}
