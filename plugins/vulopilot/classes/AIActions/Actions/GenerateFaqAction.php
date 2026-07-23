<?php
/**
 * GenerateFaqAction class file.
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
 * GEO-MODULE.md's one-click fix for
 * RuleEngine\Rules\FaqOpportunityRule's recommendations. A content-append
 * pattern like GenerateSchemaAction, but unlike that action's postmeta
 * write, the FAQ section has to actually be visible HTML inside
 * `post_content` — AI answer engines and question-phrased headings only
 * help discoverability if a crawler renders the page and sees them, the
 * same reasoning GeoFaqOpportunityScanner's own docblock gives for why
 * this check exists. Appended via `wp_update_post()`, so it also gets a
 * WordPress revision as a bonus safety net (ImproveReadabilityAction's
 * same benefit).
 *
 * @class       GenerateFaqAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class GenerateFaqAction extends AbstractBasicAction {

    private const MIN_QUESTIONS = 3;
    private const MAX_QUESTIONS = 6;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'generate-faq';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Generate FAQ section', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function validate_input( array $input ): array {
        $post_id = absint( $input['post_id'] ?? 0 );
        $post    = $post_id ? get_post( $post_id ) : null;

        if ( ! $post || ! in_array( $post->post_type, array( 'post', 'page' ), true ) ) {
            throw new InvalidActionInputException( __( 'post_id must refer to an existing post or page.', 'vulopilot' ) );
        }

        if ( '' === trim( wp_strip_all_tags( $post->post_content ) ) ) {
            throw new InvalidActionInputException( __( 'This post has no content to generate FAQs from.', 'vulopilot' ) );
        }

        return array(
            'post_id'          => $post_id,
            'title'            => $post->post_title,
            'original_content' => $post->post_content,
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
                    'You write frequently-asked-question sections for web content. Read the article and produce %d-%d '
                        . 'question/answer pairs a reader would plausibly ask about this specific content. Each answer must be '
                        . 'answerable in 1-3 sentences using only information already in the article. '
                        . 'Respond with ONLY a raw JSON array like [{"question": "...", "answer": "..."}] — no markdown fences, no commentary.',
                    self::MIN_QUESTIONS,
                    self::MAX_QUESTIONS
                ),
            ),
            array(
                'role'    => 'user',
                'content' => sprintf(
                    "Title: %s\n\nContent:\n%s",
                    $input['title'],
                    wp_trim_words( wp_strip_all_tags( $input['content'] ), 400 )
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
                __( 'Add %d FAQ questions to this page', 'vulopilot' ),
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
            return new ActionExecutionResult( false, 'post', (string) $input['post_id'], array(), $result->get_error_message() );
        }

        return new ActionExecutionResult(
            true,
            'post',
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
