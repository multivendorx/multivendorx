<?php
/**
 * LlmsTxtGenerator class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\GeoAnalysis;

defined( 'ABSPATH' ) || exit;

/**
 * Serves a virtual `/llms.txt` file (the emerging llms.txt convention —
 * a Markdown index of a site's key pages, meant for AI systems to read
 * instead of crawling the whole site) — readme.txt's "llms.txt Generation
 * & Management", the one AI-Visibility bullet with no existing code to
 * build on anywhere in this codebase.
 *
 * No new DB table: content is assembled on every request straight from
 * live `WP_Query` data (published pages/posts), the same "generate at
 * request time, don't cache a stale copy" approach WordPress core's own
 * `/robots.txt` (`do_robots()`) takes — RobotsTxtScanner.php only ever
 * *checks* that file over HTTP, it doesn't generate it, so there was no
 * existing virtual-file-serving pattern in this plugin to reuse; this
 * follows the standard WP `add_rewrite_rule()` + `template_redirect`
 * mechanism instead.
 *
 * Self-registers its own hooks in the constructor (php-wordpress.md) and
 * is constructed unconditionally in VuloPilot::init_classes() — the
 * `enable_llms_txt` setting only gates whether maybe_serve() actually
 * outputs anything, not whether the rewrite rule/query var exist, so
 * toggling the setting later never needs its own flush_rewrite_rules()
 * call beyond the one-time migration in Install.php.
 *
 * @class       LlmsTxtGenerator class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class LlmsTxtGenerator {

    private const QUERY_VAR = 'vulopilot_llms_txt';

    /**
     * Max pages/posts listed in each section — a curated index, not an
     * exhaustive sitemap (the same "curated batch, not everything"
     * posture the Basic\* scanners already take with their 50-post
     * BATCH_SIZE, just smaller here since this is meant to be skimmed).
     */
    private const MAX_ITEMS_PER_SECTION = 20;

    /**
     * LlmsTxtGenerator constructor.
     */
    public function __construct() {
        add_action( 'init', array( $this, 'register_rewrite_rule' ) );
        add_filter( 'query_vars', array( $this, 'add_query_var' ) );
        add_action( 'template_redirect', array( $this, 'maybe_serve' ) );
    }

    /**
     * @return void
     */
    public function register_rewrite_rule(): void {
        add_rewrite_rule( '^llms\.txt$', 'index.php?' . self::QUERY_VAR . '=1', 'top' );
    }

    /**
     * @param string[] $vars Existing public query vars.
     * @return string[]
     */
    public function add_query_var( array $vars ): array {
        $vars[] = self::QUERY_VAR;
        return $vars;
    }

    /**
     * @return void
     */
    public function maybe_serve(): void {
        if ( ! get_query_var( self::QUERY_VAR ) ) {
            return;
        }

        $settings = wp_parse_args( get_option( \VuloPilot\Utill::VULOPILOT_SETTINGS_KEY, array() ), \VuloPilot\Utill::VULOPILOT_SETTINGS_DEFAULTS );

        if ( empty( $settings['enable_llms_txt'] ) ) {
            return;
        }

        header( 'Content-Type: text/plain; charset=utf-8' );
        echo $this->generate(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- plain-text response, not HTML; generate() only interpolates get_bloginfo()/get_permalink()/get_the_title(), no user input.
        exit;
    }

    /**
     * Builds the llms.txt content — also called directly by
     * RestAPI\Controllers\LlmsTxt for the admin "Preview" action, so the
     * preview never needs to hit the live public URL.
     *
     * @return string
     */
    public function generate(): string {
        $lines = array(
            '# ' . get_bloginfo( 'name' ),
            '',
            '> ' . get_bloginfo( 'description' ),
            '',
        );

        $pages = get_posts(
            array(
                'post_type'      => 'page',
                'post_status'    => 'publish',
                'posts_per_page' => self::MAX_ITEMS_PER_SECTION,
                'orderby'        => 'menu_order',
                'order'          => 'ASC',
            )
        );

        if ( $pages ) {
            $lines[] = '## Pages';
            $lines[] = '';
            foreach ( $pages as $page ) {
                $lines[] = sprintf( '- [%s](%s)', get_the_title( $page ), get_permalink( $page ) );
            }
            $lines[] = '';
        }

        $posts = get_posts(
            array(
                'post_type'      => 'post',
                'post_status'    => 'publish',
                'posts_per_page' => self::MAX_ITEMS_PER_SECTION,
                'orderby'        => 'date',
                'order'          => 'DESC',
            )
        );

        if ( $posts ) {
            $lines[] = '## Posts';
            $lines[] = '';
            foreach ( $posts as $post ) {
                $lines[] = sprintf( '- [%s](%s)', get_the_title( $post ), get_permalink( $post ) );
            }
        }

        return implode( "\n", $lines );
    }
}
