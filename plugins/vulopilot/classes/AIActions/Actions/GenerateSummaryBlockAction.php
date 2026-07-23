<?php
/**
 * GenerateSummaryBlockAction class file.
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
 * RuleEngine\Rules\MissingSummaryBlockRule's recommendations. A
 * content-*prepend* pattern — the one shape none of the other built-in
 * actions use yet (GenerateFaqAction appends to the end,
 * ImproveReadabilityAction replaces the whole body) — because
 * Scanners\Basic\GeoSummaryBlockScanner specifically checks the first
 * SUMMARY_WINDOW_CHARS of the content for a summary, so the generated
 * block has to land at the top to actually fix that finding.
 *
 * @class       GenerateSummaryBlockAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class GenerateSummaryBlockAction extends AbstractBasicAction {

    private const MIN_TAKEAWAYS = 3;
    private const MAX_TAKEAWAYS = 5;

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'generate-summary-block';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Generate summary block', 'vulopilot' );
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
            throw new InvalidActionInputException( __( 'This post has no content to summarize.', 'vulopilot' ) );
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
                    'You write "key takeaways" summaries for web articles. Read the article and produce %d-%d short bullet '
                        . 'points capturing its main points, each one sentence. '
                        . 'Respond with ONLY a raw JSON array of strings like ["...", "..."] — no markdown fences, no commentary.',
                    self::MIN_TAKEAWAYS,
                    self::MAX_TAKEAWAYS
                ),
            ),
            array(
                'role'    => 'user',
                'content' => sprintf(
                    "Title: %s\n\nContent:\n%s",
                    $input['title'],
                    wp_trim_words( wp_strip_all_tags( $input['original_content'] ), 400 )
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

        return array( 'takeaways' => is_array( $decoded ) ? $decoded : array() );
    }

    /**
     * @inheritDoc
     */
    public function validate_output( array $output, array $input ): void {
        $takeaways = $output['takeaways'] ?? array();

        if ( empty( $takeaways ) || ! is_array( $takeaways ) ) {
            throw new InvalidActionOutputException( __( 'The AI did not return any key takeaways.', 'vulopilot' ) );
        }

        foreach ( $takeaways as $takeaway ) {
            if ( ! is_string( $takeaway ) || '' === trim( $takeaway ) ) {
                throw new InvalidActionOutputException( __( 'The AI returned an empty key takeaway.', 'vulopilot' ) );
            }
        }
    }

    /**
     * @inheritDoc
     */
    public function build_preview( array $output, array $input ): ActionPreview {
        return new ActionPreview(
            __( 'Add a key-takeaways summary to the top of this page', 'vulopilot' ),
            null,
            implode( "\n", $output['takeaways'] ),
            'text'
        );
    }

    /**
     * @inheritDoc
     */
    public function execute( array $output, array $input ): ActionExecutionResult {
        $summary_html = $this->build_summary_html( $output['takeaways'] );
        $result       = wp_update_post(
            array(
                'ID'           => $input['post_id'],
                'post_content' => $summary_html . "\n" . $input['original_content'],
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
     * @param string[] $takeaways Key-takeaway bullet strings.
     * @return string
     */
    private function build_summary_html( array $takeaways ): string {
        $html = '<h2>' . esc_html__( 'Key Takeaways', 'vulopilot' ) . '</h2>' . "\n<ul>\n";

        foreach ( $takeaways as $takeaway ) {
            $html .= '<li>' . esc_html( $takeaway ) . '</li>' . "\n";
        }

        return $html . '</ul>';
    }
}
