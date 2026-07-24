<?php
/**
 * GenerateProductFaqAction class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AIActions\Actions;

use VuloPilotCore\Exceptions\InvalidActionInputException;
use VuloPilotCore\Exceptions\InvalidActionOutputException;
use VuloPilotCore\ValueObjects\ActionExecutionResult;
use VuloPilotCore\ValueObjects\ActionPreview;
use VuloPilotCore\ValueObjects\AIResponse;

defined( 'ABSPATH' ) || exit;

/**
 * The product-specific counterpart to GenerateFaqAction — questions a
 * shopper would plausibly ask before buying (fit, materials, care,
 * compatibility) rather than questions about an article's subject matter.
 * Appended to `post_content` the same way, since AI answer engines and
 * shoppers alike only benefit from a visible, rendered FAQ block, not
 * hidden metadata.
 *
 * @class       GenerateProductFaqAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class GenerateProductFaqAction extends AbstractBasicAction {

    private const MIN_QUESTIONS = 3;
    private const MAX_QUESTIONS = 6;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'generate-product-faq';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Generate product FAQ section', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function validate_input( array $input ): array {
        $post_id = absint( $input['post_id'] ?? 0 );
        $product = $post_id ? wc_get_product( $post_id ) : null;

        if ( ! $product ) {
            throw new InvalidActionInputException( __( 'post_id must refer to an existing product.', 'vulopilot' ) );
        }

        return array(
            'post_id'          => $post_id,
            'title'            => $product->get_name(),
            'original_content' => $product->get_description(),
            'attributes'       => wp_strip_all_tags( $product->get_attribute_summary() ),
        );
    }

    /**
     * @inheritDoc
     */
    public function build_prompt( array $input ): array {
        return array(
            array(
                'role'    => 'system',
                'content' => sprintf(
                    'You write frequently-asked-question sections for e-commerce product pages. Produce %d-%d '
                        . 'question/answer pairs a shopper would plausibly ask before buying this product (fit, materials, '
                        . 'care, compatibility, shipping). Each answer must be answerable in 1-3 sentences using only '
                        . 'information already given. Respond with ONLY a raw JSON array like '
                        . '[{"question": "...", "answer": "..."}] — no markdown fences, no commentary.',
                    self::MIN_QUESTIONS,
                    self::MAX_QUESTIONS
                ),
            ),
            array(
                'role'    => 'user',
                'content' => sprintf(
                    "Product: %s\nAttributes: %s\n\nDescription:\n%s",
                    $input['title'],
                    $input['attributes'] ?: '(none)',
                    wp_trim_words( wp_strip_all_tags( $input['original_content'] ), 300 ) ?: '(no description available)'
                ),
            ),
        );
    }

    /**
     * @inheritDoc
     */
    public function parse_response( AIResponse $response ): array {
        $content = preg_replace( '/^```(?:json)?\s*|\s*```$/', '', trim( $response->get_content() ) );
        $decoded = json_decode( trim( (string) $content ), true );

        return array( 'faq_pairs' => is_array( $decoded ) ? $decoded : array() );
    }

    /**
     * @inheritDoc
     */
    public function validate_output( array $output, array $input ): void {
        $pairs = $output['faq_pairs'] ?? array();

        if ( empty( $pairs ) || ! is_array( $pairs ) ) {
            throw new InvalidActionOutputException( __( 'The AI did not return any FAQ questions.', 'vulopilot' ) );
        }

        foreach ( $pairs as $pair ) {
            if ( ! is_array( $pair ) || empty( $pair['question'] ) || empty( $pair['answer'] ) ) {
                throw new InvalidActionOutputException( __( 'The AI returned an incomplete FAQ question/answer pair.', 'vulopilot' ) );
            }
        }
    }

    /**
     * @inheritDoc
     */
    public function build_preview( array $output, array $input ): ActionPreview {
        $questions = wp_list_pluck( $output['faq_pairs'], 'question' );

        return new ActionPreview(
            sprintf(
                /* translators: %d is the number of FAQ questions generated. */
                __( 'Add %d FAQ questions to this product', 'vulopilot' ),
                count( $questions )
            ),
            null,
            implode( "\n", $questions ),
            'text'
        );
    }

    /**
     * @inheritDoc
     */
    public function execute( array $output, array $input ): ActionExecutionResult {
        $faq_html = $this->build_faq_html( $output['faq_pairs'] );
        $result   = wp_update_post(
            array(
                'ID'           => $input['post_id'],
                'post_content' => $input['original_content'] . "\n" . $faq_html,
            ),
            true
        );

        if ( is_wp_error( $result ) ) {
            return new ActionExecutionResult( false, 'product', (string) $input['post_id'], array(), $result->get_error_message() );
        }

        return new ActionExecutionResult(
            true,
            'product',
            (string) $input['post_id'],
            array(
                'post_id'          => $input['post_id'],
                'previous_content' => $input['original_content'],
            )
        );
    }

    /**
     * @inheritDoc
     */
    public function rollback( array $snapshot ): void {
        wp_update_post(
            array(
                'ID'           => $snapshot['post_id'],
                'post_content' => $snapshot['previous_content'],
            )
        );
    }

    /**
     * @param array<int, array{question: string, answer: string}> $pairs Question/answer pairs.
     * @return string
     */
    private function build_faq_html( array $pairs ): string {
        $html = '<h2>' . esc_html__( 'Frequently Asked Questions', 'vulopilot' ) . '</h2>' . "\n";

        foreach ( $pairs as $pair ) {
            $html .= '<h3>' . esc_html( $pair['question'] ) . '</h3>' . "\n";
            $html .= '<p>' . esc_html( $pair['answer'] ) . '</p>' . "\n";
        }

        return $html;
    }
}
