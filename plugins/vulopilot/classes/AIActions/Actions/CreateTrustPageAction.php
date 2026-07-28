<?php
/**
 * CreateTrustPageAction class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AIActions\Actions;

use VuloPilot\Exceptions\InvalidActionInputException;
use VuloPilot\Exceptions\InvalidActionOutputException;
use VuloPilot\ValueObjects\ActionExecutionResult;
use VuloPilot\ValueObjects\ActionPreview;
use VuloPilot\ValueObjects\AIResponse;

defined( 'ABSPATH' ) || exit;

/**
 * GEO-MODULE.md's fix for GeoTrustSignalsScanner's finding — the odd one
 * out among every Geo* fix action: that scanner is site-wide (its Finding
 * has object_type 'url', not 'post'), and the fix is a page *creation*
 * (like GenerateBlogAction), not an edit to something that already exists.
 * `has_about`/`has_contact` come straight from the Finding's own `meta`
 * (GeoTrustSignalsScanner::scan() records exactly these two booleans),
 * so this only ever asks the AI to write content for whichever of the two
 * page types is actually missing.
 *
 * Unlike GenerateBlogAction's "always draft" rule, this publishes
 * immediately — a draft page does nothing for the scanner's own check
 * (`has_published_page_matching_slug()` requires `post_status = publish`),
 * and this action is only ever reachable through
 * VuloPilotPro\OneClickFix\FindingFixRest's already-deliberate
 * propose()-then-immediately-approve() exception (see that class's own
 * docblock) — never through the propose()-only Automation pathway.
 * rollback() trashes whatever it created, same safety net GenerateBlogAction
 * relies on.
 *
 * @class       CreateTrustPageAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class CreateTrustPageAction extends AbstractBasicAction {

    /**
     * Page type => slug to create it at.
     *
     * @var array<string, string>
     */
    private const PAGE_SLUGS = array(
        'about'   => 'about',
        'contact' => 'contact',
    );

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'create-trust-page';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Create missing trust page(s)', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function validate_input( array $input ): array {
        $missing = array();

        if ( empty( $input['has_about'] ) ) {
            $missing[] = 'about';
        }

        if ( empty( $input['has_contact'] ) ) {
            $missing[] = 'contact';
        }

        if ( empty( $missing ) ) {
            throw new InvalidActionInputException( __( 'This site already has both an About and a Contact page — there is nothing to fix.', 'vulopilot' ) );
        }

        return array(
            'missing_pages'     => $missing,
            'site_name'         => get_bloginfo( 'name' ),
            'site_description'  => get_bloginfo( 'description' ),
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
                    'You write short WordPress page content for a site\'s trust pages. For each of the following page '
                        . 'types requested — %s — write a short (2-4 paragraph) page written from the site\'s own '
                        . 'perspective. An "about" page introduces who runs the site and what it\'s for. A "contact" page '
                        . 'explains how a reader can get in touch, without inventing a specific email address, phone '
                        . 'number, or physical address (say the reader can use the site\'s contact form instead). Respond '
                        . 'with ONLY a raw JSON object like {"about": {"title": "...", "content": "..."}, "contact": '
                        . '{"title": "...", "content": "..."}} — only include the keys that were requested, no markdown '
                        . 'fences, no commentary.',
                    implode( ' and ', $input['missing_pages'] )
                ),
            ),
            array(
                'role'    => 'user',
                'content' => sprintf( "Site name: %s\nSite tagline: %s", $input['site_name'], $input['site_description'] ),
            ),
        );
    }

    /**
     * @inheritDoc
     */
    public function parse_response( AIResponse $response ): array {
        $content = preg_replace( '/^```(?:json)?\s*|\s*```$/', '', trim( $response->get_content() ) );
        $decoded = json_decode( trim( (string) $content ), true );

        return array( 'pages' => is_array( $decoded ) ? $decoded : array() );
    }

    /**
     * @inheritDoc
     */
    public function validate_output( array $output, array $input ): void {
        foreach ( $input['missing_pages'] as $type ) {
            if ( empty( $output['pages'][ $type ]['title'] ) || empty( $output['pages'][ $type ]['content'] ) ) {
                throw new InvalidActionOutputException( __( 'The AI did not return content for one of the requested pages.', 'vulopilot' ) );
            }
        }
    }

    /**
     * @inheritDoc
     */
    public function build_preview( array $output, array $input ): ActionPreview {
        $titles   = array();
        $excerpts = array();

        foreach ( $input['missing_pages'] as $type ) {
            $titles[]   = $output['pages'][ $type ]['title'];
            $excerpts[] = $output['pages'][ $type ]['content'];
        }

        return new ActionPreview(
            sprintf(
                /* translators: %s is a comma-separated list of new page titles. */
                __( 'Create new page(s): %s', 'vulopilot' ),
                implode( ', ', $titles )
            ),
            null,
            implode( "\n\n", $excerpts ),
            'html'
        );
    }

    /**
     * @inheritDoc
     */
    public function execute( array $output, array $input ): ActionExecutionResult {
        $created_ids = array();

        foreach ( $input['missing_pages'] as $type ) {
            $page    = $output['pages'][ $type ];
            $post_id = wp_insert_post(
                array(
                    'post_title'   => sanitize_text_field( $page['title'] ),
                    'post_name'    => self::PAGE_SLUGS[ $type ],
                    'post_content' => wp_kses_post( $page['content'] ),
                    'post_status'  => 'publish',
                    'post_type'    => 'page',
                ),
                true
            );

            if ( is_wp_error( $post_id ) ) {
                foreach ( $created_ids as $rollback_id ) {
                    wp_trash_post( $rollback_id );
                }

                return new ActionExecutionResult( false, 'page', null, array(), $post_id->get_error_message() );
            }

            $created_ids[ $type ] = $post_id;
        }

        return new ActionExecutionResult(
            true,
            'page',
            implode( ',', $created_ids ),
            array( 'created_post_ids' => array_values( $created_ids ) )
        );
    }

    /**
     * @inheritDoc
     */
    public function rollback( array $snapshot ): void {
        foreach ( (array) ( $snapshot['created_post_ids'] ?? array() ) as $post_id ) {
            wp_trash_post( $post_id );
        }
    }
}
