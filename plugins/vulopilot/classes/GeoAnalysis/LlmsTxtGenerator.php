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
        add_action( 'init', array( $this, 'maybe_bootstrap_physical_file' ), 20 );
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
        // Prefer an admin's saved edits (Settings → GEO's llms_txt_content
        // textarea) over the auto-generated version, same precedence
        // write_file()/maybe_bootstrap_physical_file() use — this virtual
        // route and the real on-disk file should never disagree.
        echo empty( $settings['llms_txt_content'] ) ? $this->generate() : $settings['llms_txt_content']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Content-Type is text/plain (not HTML/JS), so raw Markdown content here can't execute in a browser regardless of escaping; generate()'s own output only interpolates get_bloginfo()/get_permalink()/get_the_title().
        exit;
    }

    /**
     * Writes the effective content straight to a real `/llms.txt` at the
     * site root — so "View live file" (and any AI crawler fetching it
     * directly) doesn't depend on the rewrite rule above ever having been
     * flushed, which is the actual reason that link 404s on a site that
     * had this plugin active before this feature existed (a rewrite rule
     * added via add_rewrite_rule() only takes effect once WordPress's
     * cached rewrite_rules option is flushed — see Install.php's own
     * migration note on this exact gotcha). Best-effort: a locked-down
     * host where ABSPATH isn't writable still has the setting saved and
     * the virtual route above still serves it correctly, it just doesn't
     * also get a static file.
     *
     * @param string $content Effective llms.txt content to persist.
     * @return bool True if the file was written.
     */
    public function write_file( string $content ): bool {
        if ( ! wp_is_writable( ABSPATH ) ) {
            return false;
        }

        $file_path = trailingslashit( ABSPATH ) . 'llms.txt';

        // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents -- ABSPATH/llms.txt is a plain-text file at the site root (same convention as robots.txt/ads.txt), not a value that needs WP_Filesystem's FTP-credential fallback; matches the existing precedent in Reports/Exporters/JsonExporter.php.
        return false !== file_put_contents( $file_path, $content );
    }

    /**
     * Bootstraps a real `/llms.txt` on disk the first time it's missing —
     * covers a fresh install (so the live file works immediately, not
     * just once an admin visits Settings and saves) as well as an
     * existing site that only just enabled the feature. Never overwrites
     * an existing file (an admin's saved edits, or one written by a
     * previous run), so this only ever fires once per site.
     *
     * @return void
     */
    public function maybe_bootstrap_physical_file(): void {
        $settings = wp_parse_args( get_option( \VuloPilot\Utill::VULOPILOT_SETTINGS_KEY, array() ), \VuloPilot\Utill::VULOPILOT_SETTINGS_DEFAULTS );

        if ( empty( $settings['enable_llms_txt'] ) ) {
            return;
        }

        if ( file_exists( trailingslashit( ABSPATH ) . 'llms.txt' ) ) {
            return;
        }

        $this->write_file( empty( $settings['llms_txt_content'] ) ? $this->generate() : $settings['llms_txt_content'] );
    }

    /**
     * Builds the auto-generated llms.txt content from live WP_Query data —
     * also called directly by Controllers\Settings::get_stored_settings()
     * to pre-fill the Settings → GEO textarea before an admin has ever
     * customized it, and by maybe_bootstrap_physical_file() to seed the
     * initial on-disk file.
     *
     * @return string
     */
    public function generate(): string {
        $settings      = wp_parse_args( get_option( \VuloPilot\Utill::VULOPILOT_SETTINGS_KEY, array() ), \VuloPilot\Utill::VULOPILOT_SETTINGS_DEFAULTS );
        $include_types = (array) ( $settings['llms_include_types'] ?? array( 'pages', 'posts' ) );

        $lines = array(
            '# ' . get_bloginfo( 'name' ),
            '',
            '> ' . get_bloginfo( 'description' ),
            '',
        );

        if ( in_array( 'pages', $include_types, true ) ) {
            $this->append_section( $lines, __( 'Pages', 'vulopilot' ), 'page', 'menu_order', 'ASC' );
        }

        if ( in_array( 'posts', $include_types, true ) ) {
            $this->append_section( $lines, __( 'Posts', 'vulopilot' ), 'post', 'date', 'DESC' );
        }

        if ( in_array( 'products', $include_types, true ) && post_type_exists( 'product' ) ) {
            $this->append_section( $lines, __( 'Products', 'vulopilot' ), 'product', 'date', 'DESC' );
        }

        return implode( "\n", $lines );
    }

    /**
     * Appends one `## Heading` + list-of-links section for one post type —
     * the three sections in generate() only ever differ in post type,
     * heading, and sort order, so this is the one place that shape lives.
     *
     * @param string[] $lines   Lines built so far, appended to by reference.
     * @param string   $heading Markdown heading text (no leading `##`).
     * @param string   $post_type WordPress post type to query.
     * @param string   $orderby WP_Query orderby.
     * @param string   $order   WP_Query order.
     * @return void
     */
    private function append_section( array &$lines, string $heading, string $post_type, string $orderby, string $order ): void {
        $items = get_posts(
            array(
                'post_type'      => $post_type,
                'post_status'    => 'publish',
                'posts_per_page' => self::MAX_ITEMS_PER_SECTION,
                'orderby'        => $orderby,
                'order'          => $order,
            )
        );

        if ( ! $items ) {
            return;
        }

        $lines[] = '## ' . $heading;
        $lines[] = '';

        foreach ( $items as $item ) {
            $lines[] = sprintf( '- [%s](%s)', get_the_title( $item ), get_permalink( $item ) );
        }

        $lines[] = '';
    }
}
