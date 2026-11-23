<?php
/**
 * Templates class file.
 *
 * @package CatalogX
 */

namespace CatalogX\VuloMail;

defined( 'ABSPATH' ) || exit;

/**
 * Registers CatalogX's transactional emails with VuloMail (`vulomail_email_templates`), so their
 * subject/content are editable there -- the single source of truth `Mailer::send()` reads from,
 * instead of a `WC_Email` template file.
 *
 * Every template is defined once, as VuloMail blocks. The plain-HTML `content` fallback (used when
 * VuloMail isn't active) is rendered from those same blocks, so the two can never drift apart.
 */
class Templates {

    const ENQUIRY               = 'catalogx/enquiry';
    const ENQUIRY_CARD          = 'catalogx/enquiry-card';
    const ENQUIRY_PURPLE_BANNER = 'catalogx/enquiry-purple-banner';
    const ENQUIRY_MINIMAL       = 'catalogx/enquiry-minimal';
    const ENQUIRY_ALERT         = 'catalogx/enquiry-alert';
    const ENQUIRY_SIDEBAR       = 'catalogx/enquiry-sidebar';
    const ENQUIRY_REPORT        = 'catalogx/enquiry-report';
    const QUOTE_REQUEST         = 'catalogx/quote-request';

    public static $white        = '#ffffff';
    public static $ink          = '#0f172a';
    public static $body         = '#334155';
    public static $muted        = '#64748b';
    public static $surface      = '#f8fafc';
    public static $line         = '#e2e8f0';
    public static $indigo       = '#4f46e5';
    public static $indigo_dark  = '#312e81';
    public static $indigo_soft  = '#c7d2fe';
    public static $indigo_tint  = '#eef2ff';
    public static $violet       = '#6d28d9';
    public static $violet_tint  = '#f5f3ff';
    public static $orange       = '#ea580c';
    public static $orange_dark  = '#c2410c';
    public static $orange_tint  = '#fff7ed';
    public static $emerald      = '#047857';
    public static $emerald_tint = '#ecfdf5';

    /**
     * Font stack used by the HTML fallback.
     */
    public static $font = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

    /**
     * Templates constructor.
     */
    public function __construct() {
        add_filter( 'vulomail_email_templates', array( $this, 'add_templates' ) );
        add_filter( 'vulomail_email_template_categories', array( $this, 'add_category' ) );
    }

    /**
     * @param array $templates Existing templates, `plugin/name` => {title, description, category, ...}.
     * @return array
     */
    public function add_templates( $templates ) {
        foreach ( self::defaults() as $name => $template ) {
            if ( ! empty( $template['blocks'] ) ) {
                unset( $template['content'] );
            }

            $templates[ $name ] = $template;
        }

        return $templates;
    }

    /**
     * @param array $categories Existing categories, slug => label.
     * @return array
     */
    public function add_category( $categories ) {
        $categories['catalogx'] = __( 'CatalogX', 'catalogx' );

        return $categories;
    }

    /**
     * The default subject/content for every email `Mailer::send()` knows how to send -- used to
     * register them with VuloMail, and as the fallback when VuloMail isn't active.
     *
     * @return array `plugin/name` => {title, description, category, group, recipients, subject, content, blocks}
     */
    public static function defaults() {
        $enquiry_subject = __( 'New enquiry for {product_name} from {user_name}', 'catalogx' );

        $templates = array(
            self::ENQUIRY               => array(
                'title'       => __( 'Enquiry notification', 'catalogx' ),
                'description' => __( 'Sent to the site owner (and vendor, if MultiVendorX is active) when a customer sends a product enquiry.', 'catalogx' ),
                'group'       => __( 'Enquiry', 'catalogx' ),
                'recipients'  => array( 'admin', 'store' ),
                'subject'     => $enquiry_subject,
                'blocks'      => self::enquiry_default_blocks(),
            ),
            self::ENQUIRY_CARD          => array(
                'title'       => __( 'Enquiry notification (card style)', 'catalogx' ),
                'description' => __( 'Same enquiry notification, with a soft hero panel and stacked detail cards.', 'catalogx' ),
                'group'       => __( 'Enquiry', 'catalogx' ),
                'recipients'  => array( 'admin', 'store' ),
                'subject'     => $enquiry_subject,
                'blocks'      => self::enquiry_card_blocks(),
            ),
            self::ENQUIRY_PURPLE_BANNER => array(
                'title'       => __( 'Enquiry notification (purple banner)', 'catalogx' ),
                'description' => __( 'Same enquiry notification, with a bold indigo hero banner.', 'catalogx' ),
                'group'       => __( 'Enquiry', 'catalogx' ),
                'recipients'  => array( 'admin', 'store' ),
                'subject'     => $enquiry_subject,
                'blocks'      => self::enquiry_banner_blocks(),
            ),
            self::ENQUIRY_MINIMAL       => array(
                'title'       => __( 'Enquiry notification (minimal)', 'catalogx' ),
                'description' => __( 'Same enquiry notification, typography only with no colored backgrounds.', 'catalogx' ),
                'group'       => __( 'Enquiry', 'catalogx' ),
                'recipients'  => array( 'admin', 'store' ),
                'subject'     => $enquiry_subject,
                'blocks'      => self::enquiry_minimal_blocks(),
            ),
            self::ENQUIRY_ALERT         => array(
                'title'       => __( 'Enquiry notification (alert badge)', 'catalogx' ),
                'description' => __( 'Same enquiry notification, with an orange "new" alert strip and timestamp.', 'catalogx' ),
                'group'       => __( 'Enquiry', 'catalogx' ),
                'recipients'  => array( 'admin', 'store' ),
                'subject'     => $enquiry_subject,
                'blocks'      => self::enquiry_alert_blocks(),
            ),
            self::ENQUIRY_SIDEBAR       => array(
                'title'       => __( 'Enquiry notification (accent sidebar)', 'catalogx' ),
                'description' => __( 'Same enquiry notification, as a key/value sheet with a tinted label column.', 'catalogx' ),
                'group'       => __( 'Enquiry', 'catalogx' ),
                'recipients'  => array( 'admin', 'store' ),
                'subject'     => $enquiry_subject,
                'blocks'      => self::enquiry_sidebar_blocks(),
            ),
            self::ENQUIRY_REPORT        => array(
                'title'       => __( 'Enquiry report', 'catalogx' ),
                'description' => __( 'Periodic report of product enquiries, sent to the site admin.', 'catalogx' ),
                'group'       => __( 'Enquiry', 'catalogx' ),
                'recipients'  => array( 'admin' ),
                'subject'     => __( 'Your enquiry report: {start_date} – {end_date}', 'catalogx' ),
                'blocks'      => self::enquiry_report_blocks(),
            ),
            self::QUOTE_REQUEST         => array(
                'title'       => __( 'New quote request', 'catalogx' ),
                'description' => __( 'Sent to the site admin when a customer submits a quote request.', 'catalogx' ),
                'group'       => __( 'Quote', 'catalogx' ),
                'recipients'  => array( 'admin' ),
                'subject'     => __( 'New quote request from {customer_name}', 'catalogx' ),
                'blocks'      => self::quote_request_blocks(),
            ),
        );

        foreach ( $templates as $name => $template ) {
            $templates[ $name ] = array(
                'title'       => $template['title'],
                'description' => $template['description'],
                'category'    => 'catalogx',
                'group'       => $template['group'],
                'recipients'  => $template['recipients'],
                'subject'     => $template['subject'],
                'content'     => self::render_html( $template['blocks'] ),
                'blocks'      => $template['blocks'],
            );
        }

        return $templates;
    }

    /*
    |--------------------------------------------------------------------------
    | Enquiry: default
    |--------------------------------------------------------------------------
    */

    /**
     * @return array
     */
    private static function enquiry_default_blocks() {
        return self::with_ids(
            array_merge(
                array(
                    self::eyebrow( __( 'New enquiry', 'catalogx' ), self::$indigo ),
                    self::title( __( 'You have a new product enquiry', 'catalogx' ) ),
                    self::greeting(),
                    self::intro( __( 'Someone is interested in {product_name}. Here is everything you need to follow up.', 'catalogx' ) ),
                ),
                self::tile( __( 'Product', 'catalogx' ), '{product_name}', self::$indigo_tint, self::$indigo_dark, self::$indigo ),
                self::tile( __( 'Customer', 'catalogx' ), '{user_name}', self::$surface, self::$ink ),
                self::tile( __( 'Email', 'catalogx' ), '{user_email}', self::$surface, self::$indigo ),
                array(
                    self::label( __( 'Message', 'catalogx' ), self::$muted, array( 'marginTop' => 16 ) ),
                    self::panel( '{enquiry_details}', self::$surface ),
                    self::divider(),
                    self::footer( __( 'You are receiving this email because product enquiries are enabled on your store.', 'catalogx' ) ),
                )
            )
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Enquiry: card
    |--------------------------------------------------------------------------
    */

    /**
     * @return array
     */
    private static function enquiry_card_blocks() {
        return self::with_ids(
            array_merge(
                array(
                    self::hero(
                        __( 'New product enquiry', 'catalogx' ),
                        self::$indigo_tint,
                        self::$indigo_dark
                    ),
                    self::greeting( array( 'textAlign' => 'center' ) ),
                    self::intro(
                        __( 'A customer has asked about {product_name}. Their details are below.', 'catalogx' ),
                        array( 'textAlign' => 'center' )
                    ),
                ),
                self::tile( __( 'Product', 'catalogx' ), '{product_name}', self::$surface, self::$ink ),
                self::tile( __( 'Customer', 'catalogx' ), '{user_name}', self::$surface, self::$ink ),
                self::tile( __( 'Email', 'catalogx' ), '{user_email}', self::$surface, self::$indigo ),
                array(
                    self::label( __( 'Message', 'catalogx' ), self::$muted, array( 'marginTop' => 16 ) ),
                    self::panel( '{enquiry_details}', self::$surface ),
                    self::divider(),
                    self::footer( __( 'Reply to the customer directly to follow up on this enquiry.', 'catalogx' ) ),
                )
            )
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Enquiry: purple banner
    |--------------------------------------------------------------------------
    */

    /**
     * @return array
     */
    private static function enquiry_banner_blocks() {
        return self::with_ids(
            array_merge(
                array(
                    self::hero(
                        __( 'New enquiry received', 'catalogx' ),
                        self::$indigo_dark,
                        self::$white
                    ),
                    self::greeting(),
                    self::intro( __( 'A customer has submitted a new enquiry for {product_name}. Please review the details below.', 'catalogx' ) ),
                    self::section( __( 'Enquiry details', 'catalogx' ), self::$indigo_tint, self::$indigo_dark ),
                ),
                self::tile( __( 'Customer name', 'catalogx' ), '{user_name}', self::$violet_tint, self::$ink ),
                self::tile( __( 'Email address', 'catalogx' ), '{user_email}', self::$violet_tint, self::$indigo ),
                array(
                    self::label( __( 'Message', 'catalogx' ), self::$muted, array( 'marginTop' => 16 ) ),
                    self::panel( '{enquiry_details}', self::$surface ),
                    self::divider(),
                    self::footer( __( 'This is an automated notification.', 'catalogx' ) ),
                )
            )
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Enquiry: minimal
    |--------------------------------------------------------------------------
    */

    /**
     * @return array
     */
    private static function enquiry_minimal_blocks() {
        $value = array(
            'color'        => self::$ink,
            'fontSize'     => 16,
            'fontWeight'   => 600,
            'marginBottom' => 16,
        );

        return self::with_ids(
            array(
                self::title( __( 'New product enquiry', 'catalogx' ), 2 ),
                self::greeting(),
                self::intro( __( 'A customer has submitted an enquiry for {product_name}.', 'catalogx' ), array( 'marginBottom' => 0 ) ),
                self::divider( array( 'marginTop' => 20, 'marginBottom' => 20 ) ),
                self::label( __( 'Product', 'catalogx' ), self::$muted ),
                self::text( '{product_name}', $value ),
                self::label( __( 'Name', 'catalogx' ), self::$muted ),
                self::text( '{user_name}', $value ),
                self::label( __( 'Email', 'catalogx' ), self::$muted ),
                self::text( '{user_email}', $value ),
                self::label( __( 'Message', 'catalogx' ), self::$muted ),
                self::text(
                    '{enquiry_details}',
                    array(
                        'color'    => self::$body,
                        'fontSize' => 15,
                    )
                ),
            )
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Enquiry: alert badge
    |--------------------------------------------------------------------------
    */

    /**
     * @return array
     */
    private static function enquiry_alert_blocks() {
        return self::with_ids(
            array_merge(
                array(
                    self::section(
                        __( '● New enquiry  ·  Received {date_time}', 'catalogx' ),
                        self::$orange_tint,
                        self::$orange_dark,
                        array(
                            'fontSize'     => 12,
                            'marginBottom' => 24,
                        )
                    ),
                    self::title( __( 'Product enquiry for {product_name}', 'catalogx' ) ),
                    self::greeting(),
                    self::intro( __( 'A customer is waiting to hear back from you. Here is what they sent.', 'catalogx' ) ),
                ),
                self::tile( __( 'Customer', 'catalogx' ), '{user_name}', self::$surface, self::$ink ),
                self::tile( __( 'Email', 'catalogx' ), '{user_email}', self::$surface, self::$orange ),
                array(
                    self::label( __( 'Message', 'catalogx' ), self::$muted, array( 'marginTop' => 16 ) ),
                    self::panel( '{enquiry_details}', self::$surface ),
                    self::divider(),
                    self::footer( __( 'This is an automated notification. Please do not reply to this email — reply to the customer at {user_email} instead.', 'catalogx' ) ),
                )
            )
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Enquiry: accent sidebar
    |--------------------------------------------------------------------------
    */

    /**
     * @return array
     */
    private static function enquiry_sidebar_blocks() {
        return self::with_ids(
            array_merge(
                array(
                    self::eyebrow( __( 'New enquiry', 'catalogx' ), self::$violet ),
                    self::title( __( 'New product enquiry', 'catalogx' ) ),
                    self::greeting(),
                    self::intro( __( 'A customer has submitted an enquiry for {product_name}. Here are the full details.', 'catalogx' ) ),
                ),
                self::sidebar_row( __( 'Product', 'catalogx' ), '{product_name}' ),
                self::sidebar_row( __( 'Name', 'catalogx' ), '{user_name}' ),
                self::sidebar_row( __( 'Email', 'catalogx' ), '{user_email}' ),
                array(
                    self::label( __( 'Message', 'catalogx' ), self::$violet, array( 'marginTop' => 16 ) ),
                    self::panel( '{enquiry_details}', self::$violet_tint ),
                    self::divider(),
                    self::footer( __( 'Sent automatically when a customer submits a product enquiry.', 'catalogx' ) ),
                )
            )
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Enquiry report
    |--------------------------------------------------------------------------
    */

    /**
     * @return array
     */
    private static function enquiry_report_blocks() {
        return self::with_ids(
            array(
                self::hero(
                    __( 'Your enquiry summary', 'catalogx' ),
                    self::$indigo_dark,
                    self::$white,
                    array( 'paddingBottom' => 12 )
                ),
                self::section(
                    __( 'Reporting period: {start_date} – {end_date}', 'catalogx' ),
                    self::$indigo_tint,
                    self::$indigo_dark,
                    array(
                        'textAlign'    => 'center',
                        'marginBottom' => 24,
                    )
                ),
                self::intro( __( 'Here is how many enquiries each of your products received during this period.', 'catalogx' ) ),
                self::table_header( __( 'Product', 'catalogx' ), __( 'Enquiries', 'catalogx' ) ),
                self::rows( '{enquiry_rows}' ),
                self::divider(),
                self::footer( __( 'This report is generated automatically by CatalogX.', 'catalogx' ) ),
            )
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Quote request
    |--------------------------------------------------------------------------
    */

    /**
     * @return array
     */
    private static function quote_request_blocks() {
        return self::with_ids(
            array_merge(
                array(
                    self::section(
                        __( '● New quote request', 'catalogx' ),
                        self::$emerald_tint,
                        self::$emerald,
                        array(
                            'fontSize'     => 12,
                            'marginBottom' => 24,
                        )
                    ),
                    self::title( __( '{customer_name} is requesting a quote', 'catalogx' ) ),
                    self::intro( __( 'Review the requested products below and send your best price to the customer.', 'catalogx' ) ),
                    self::label( __( 'Requested products', 'catalogx' ), self::$muted ),
                    self::table_header( __( 'Product', 'catalogx' ), __( 'Quantity', 'catalogx' ) ),
                    self::rows( '{quote_rows}' ),
                    self::label( __( 'Customer', 'catalogx' ), self::$muted, array( 'marginTop' => 24 ) ),
                ),
                self::tile( __( 'Email', 'catalogx' ), '{customer_email}', self::$surface, self::$emerald ),
                self::tile( __( 'Phone', 'catalogx' ), '{customer_phone}', self::$surface, self::$ink ),
                array(
                    self::panel( '{customer_details}', self::$surface ),
                    self::divider(),
                    self::footer( __( 'You are receiving this email because quote requests are enabled on your store.', 'catalogx' ) ),
                )
            )
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Block builders
    |--------------------------------------------------------------------------
    */

    /**
     * Base block style, merged with overrides.
     *
     * @param array $style Overrides.
     * @return array
     */
    private static function style( array $style = array() ) {
        return array_merge(
            array(
                'marginTop'    => 0,
                'marginBottom' => 8,
            ),
            $style
        );
    }

    /**
     * @param string $text  Heading text.
     * @param int    $level Heading level.
     * @param array  $style Style overrides.
     * @return array
     */
    private static function heading( $text, $level = 1, array $style = array() ) {
        return array(
            'type'  => 'heading',
            'text'  => $text,
            'level' => $level,
            'style' => self::style( $style ),
        );
    }

    /**
     * @param string $html  Already-escaped HTML.
     * @param array  $style Style overrides.
     * @return array
     */
    private static function text( $html, array $style = array() ) {
        return array(
            'type'  => 'richtext',
            'html'  => $html,
            'style' => self::style( $style ),
        );
    }

    /**
     * @param array $style Style overrides.
     * @return array
     */
    private static function divider( array $style = array() ) {
        return array(
            'type'  => 'divider',
            'style' => self::style(
                array_merge(
                    array(
                        'marginTop'    => 28,
                        'marginBottom' => 16,
                    ),
                    $style
                )
            ),
        );
    }

    /**
     * @param string $layout  Column layout, e.g. '2' or '1:2'.
     * @param array  $columns List of columns, each a list of blocks.
     * @return array
     */
    private static function columns( $layout, array $columns ) {
        return array(
            'type'    => 'columns',
            'layout'  => $layout,
            'columns' => $columns,
        );
    }

    /**
     * Large page title.
     *
     * @param string $text  Text.
     * @param int    $level Heading level.
     * @param array  $style Style overrides.
     * @return array
     */
    private static function title( $text, $level = 1, array $style = array() ) {
        return self::heading(
            $text,
            $level,
            array_merge(
                array(
                    'color'        => self::$ink,
                    'fontSize'     => 1 === $level ? 28 : 22,
                    'fontWeight'   => 800,
                    'marginBottom' => 16,
                ),
                $style
            )
        );
    }

    /**
     * Full-width colored hero heading.
     *
     * @param string $text       Text.
     * @param string $background Background.
     * @param string $color      Text color.
     * @param array  $style      Style overrides.
     * @return array
     */
    private static function hero( $text, $background, $color, array $style = array() ) {
        return self::heading(
            $text,
            1,
            array_merge(
                array(
                    'textAlign'       => 'center',
                    'color'           => $color,
                    'backgroundColor' => $background,
                    'fontSize'        => 28,
                    'fontWeight'      => 800,
                    'roundedCorners'  => 16,
                    'paddingTop'      => 40,
                    'paddingRight'    => 24,
                    'paddingBottom'   => 40,
                    'paddingLeft'     => 24,
                    'marginBottom'    => 24,
                ),
                $style
            )
        );
    }

    /**
     * Small colored kicker above a title.
     *
     * @param string $text  Text.
     * @param string $color Color.
     * @return array
     */
    private static function eyebrow( $text, $color ) {
        return self::text(
            esc_html( $text ),
            array(
                'color'        => $color,
                'fontSize'     => 13,
                'fontWeight'   => 700,
                'marginBottom' => 6,
            )
        );
    }

    /**
     * "Hi {user_name}," greeting.
     *
     * @param array $style Style overrides.
     * @return array
     */
    private static function greeting( array $style = array() ) {
        return self::text(
            esc_html__( 'Hi {user_name},', 'catalogx' ),
            array_merge(
                array(
                    'color'        => self::$ink,
                    'fontSize'     => 16,
                    'fontWeight'   => 700,
                    'marginBottom' => 6,
                ),
                $style
            )
        );
    }

    /**
     * Intro paragraph under the title/greeting.
     *
     * @param string $text  Text.
     * @param array  $style Style overrides.
     * @return array
     */
    private static function intro( $text, array $style = array() ) {
        return self::text(
            esc_html( $text ),
            array_merge(
                array(
                    'color'        => self::$body,
                    'fontSize'     => 16,
                    'marginBottom' => 24,
                ),
                $style
            )
        );
    }

    /**
     * Small field label.
     *
     * @param string $text  Text.
     * @param string $color Color.
     * @param array  $style Style overrides.
     * @return array
     */
    private static function label( $text, $color, array $style = array() ) {
        return self::text(
            esc_html( $text ),
            array_merge(
                array(
                    'color'        => $color,
                    'fontSize'     => 12,
                    'fontWeight'   => 700,
                    'marginBottom' => 6,
                ),
                $style
            )
        );
    }

    /**
     * A tinted, rounded strip (section title, alert, date range).
     *
     * @param string $text       Text.
     * @param string $background Background.
     * @param string $color      Text color.
     * @param array  $style      Style overrides.
     * @return array
     */
    private static function section( $text, $background, $color, array $style = array() ) {
        return self::text(
            esc_html( $text ),
            array_merge(
                array(
                    'backgroundColor' => $background,
                    'color'           => $color,
                    'fontSize'        => 14,
                    'fontWeight'      => 700,
                    'roundedCorners'  => 10,
                    'paddingTop'      => 12,
                    'paddingRight'    => 16,
                    'paddingBottom'   => 12,
                    'paddingLeft'     => 16,
                    'marginBottom'    => 16,
                ),
                $style
            )
        );
    }

    /**
     * A label/value tile: two stacked blocks sharing one background.
     *
     * @param string $label       Label.
     * @param string $value       Value (placeholder).
     * @param string $background  Tile background.
     * @param string $value_color Value color.
     * @param string $label_color Label color.
     * @return array List of blocks.
     */
    private static function tile( $label, $value, $background, $value_color, $label_color = null ) {
        $label_color = $label_color ?? self::$muted;

        return array(
            self::text(
                esc_html( $label ),
                array(
                    'backgroundColor' => $background,
                    'color'           => $label_color,
                    'fontSize'        => 12,
                    'fontWeight'      => 600,
                    'paddingTop'      => 16,
                    'paddingRight'    => 18,
                    'paddingBottom'   => 2,
                    'paddingLeft'     => 18,
                    'marginBottom'    => 0,
                )
            ),
            self::text(
                $value,
                array(
                    'backgroundColor' => $background,
                    'color'           => $value_color,
                    'fontSize'        => 16,
                    'fontWeight'      => 700,
                    'paddingTop'      => 2,
                    'paddingRight'    => 18,
                    'paddingBottom'   => 16,
                    'paddingLeft'     => 18,
                    'marginBottom'    => 8,
                )
            ),
        );
    }

    /**
     * Rounded content panel (message, extra details).
     *
     * @param string $html       Content (placeholder).
     * @param string $background Background.
     * @return array
     */
    private static function panel( $html, $background ) {
        return self::text(
            $html,
            array(
                'backgroundColor' => $background,
                'color'           => self::$body,
                'fontSize'        => 15,
                'roundedCorners'  => 12,
                'paddingTop'      => 20,
                'paddingRight'    => 20,
                'paddingBottom'   => 20,
                'paddingLeft'     => 20,
            )
        );
    }

    /**
     * Centered small footer note.
     *
     * @param string $text Text.
     * @return array
     */
    private static function footer( $text ) {
        return self::text(
            esc_html( $text ),
            array(
                'textAlign' => 'center',
                'color'     => self::$muted,
                'fontSize'  => 12,
            )
        );
    }

    /**
     * A 1:2 key/value row with a tinted label column.
     *
     * @param string $label Label.
     * @param string $value Value (placeholder).
     * @return array
     */
    private static function sidebar_row( $label, $value ) {
        return array(
            self::text(
                esc_html( $label ),
                array(
                    'backgroundColor' => self::$violet_tint,
                    'color'           => self::$violet,
                    'fontSize'        => 12,
                    'fontWeight'      => 700,
                    'roundedCorners'  => 8,
                    'paddingTop'      => 10,
                    'paddingRight'    => 16,
                    'paddingBottom'   => 2,
                    'paddingLeft'     => 16,
                    'marginBottom'    => 0,
                )
            ),
            self::text(
                $value,
                array(
                    'backgroundColor' => self::$surface,
                    'color'           => self::$ink,
                    'fontSize'        => 15,
                    'fontWeight'      => 600,
                    'roundedCorners'  => 8,
                    'paddingTop'      => 2,
                    'paddingRight'    => 16,
                    'paddingBottom'   => 12,
                    'paddingLeft'     => 16,
                    'marginBottom'    => 8,
                )
            ),
        );
    }

    /**
     * Two-column table header (left label, right-aligned label).
     *
     * @param string $left  Left header.
     * @param string $right Right header.
     * @return array
     */
    private static function table_header( $left, $right ) {
        $cell = array(
            'backgroundColor' => self::$surface,
            'color'           => self::$muted,
            'fontSize'        => 12,
            'fontWeight'      => 700,
            'paddingTop'      => 12,
            'paddingRight'    => 16,
            'paddingBottom'   => 12,
            'paddingLeft'     => 16,
            'marginBottom'    => 0,
        );

        return self::columns(
            '2',
            array(
                array( self::text( esc_html( $left ), $cell ) ),
                array( self::text( esc_html( $right ), array_merge( $cell, array( 'textAlign' => 'right' ) ) ) ),
            )
        );
    }

    /**
     * Placeholder that `Mailer` replaces with the pre-rendered table rows.
     *
     * @param string $placeholder e.g. `{enquiry_rows}`.
     * @return array
     */
    private static function rows( $placeholder ) {
        return self::text(
            $placeholder,
            array(
                'color'    => self::$ink,
                'fontSize' => 15,
            )
        );
    }

    /**
     * Assigns sequential ids to a block tree (parents before their children).
     *
     * @param array $blocks Blocks.
     * @param int   $id     Running id counter.
     * @return array
     */
    private static function with_ids( array $blocks, &$id = 0 ) {
        foreach ( $blocks as $i => $block ) {
            $blocks[ $i ] = array( 'id' => ++$id ) + $block;

            if ( 'columns' === $block['type'] ) {
                foreach ( $block['columns'] as $c => $column ) {
                    $blocks[ $i ]['columns'][ $c ] = self::with_ids( $column, $id );
                }
            }
        }

        return $blocks;
    }

    /*
    |--------------------------------------------------------------------------
    | HTML fallback renderer (used when VuloMail isn't active)
    |--------------------------------------------------------------------------
    */

    /**
     * Renders a block tree as email-safe HTML inside a centered white card.
     *
     * @param array $blocks Blocks.
     * @return string
     */
    private static function render_html( array $blocks ) {
        return '<div style="background:' . self::$surface . ';padding:32px 12px;font-family:' . self::$font . ';">'
            . '<div style="max-width:600px;margin:0 auto;background:' . self::$white . ';border:1px solid ' . self::$line . ';border-radius:16px;padding:36px 32px;color:' . self::$body . ';line-height:1.6;">'
            . self::render_blocks( $blocks )
            . '</div></div>';
    }

    /**
     * @param array $blocks Blocks.
     * @return string
     */
    private static function render_blocks( array $blocks ) {
        $html = '';

        foreach ( $blocks as $block ) {
            $style = isset( $block['style'] ) ? self::css( $block['style'] ) : '';

            switch ( $block['type'] ) {
                case 'heading':
                    $level = max( 1, min( 6, (int) $block['level'] ) );
                    $html .= '<h' . $level . ' style="line-height:1.25;' . $style . '">' . esc_html( $block['text'] ) . '</h' . $level . '>';
                    break;

                case 'richtext':
                    if ( preg_match( '/^\{\w+_rows\}$/', $block['html'] ) ) {
                        // Mailer fills these with `<tr>` rows, so they need a table around them.
                        $html .= '<table style="width:100%;' . $style . '"><tbody>' . $block['html'] . '</tbody></table>';
                    } else {
                        $html .= '<div style="' . $style . '">' . $block['html'] . '</div>';
                    }
                    break;

                case 'divider':
                    $html .= '<hr style="border:none;border-top:1px solid ' . self::$line . ';' . $style . '">';
                    break;

                case 'columns':
                    $html .= self::render_columns( $block );
                    break;
            }
        }

        return $html;
    }

    /**
     * Renders a columns block as a presentation table.
     *
     * @param array $block Columns block.
     * @return string
     */
    private static function render_columns( array $block ) {
        $count  = count( $block['columns'] );
        $ratios = array_map( 'intval', explode( ':', (string) $block['layout'] ) );

        if ( count( $ratios ) !== $count ) {
            $ratios = array_fill( 0, $count, 1 );
        }

        $total = max( 1, array_sum( $ratios ) );

        // The preview's HTML sanitizer strips the `width` attribute and most table-related CSS
        // (`table-layout`, `border-collapse`) wholesale, but lets a plain `vertical-align` style
        // through -- so the only reliable place left to put each column's width is inline on its
        // own <td>, alongside that same property, rather than on the <table> itself.
        $gap_percent       = $count > 1 ? 2 : 0;
        $available_percent = 100 - $gap_percent * ( $count - 1 );
        $cells             = array();

        foreach ( $block['columns'] as $i => $column ) {
            $width   = round( $available_percent * $ratios[ $i ] / $total, 2 );
            $cells[] = '<td style="width:' . $width . '%;vertical-align:top;">' . self::render_blocks( $column ) . '</td>';
        }

        $gap = '<td style="width:' . $gap_percent . '%;font-size:0;line-height:0;">&nbsp;</td>';

        return '<table style="width:100%;"><tr>' . implode( $gap, $cells ) . '</tr></table>';
    }

    /**
     * Converts a block style array to inline CSS.
     *
     * @param array $style Block style.
     * @return string
     */
    private static function css( array $style ) {
        $map = array(
            'marginTop'       => 'margin-top',
            'marginBottom'    => 'margin-bottom',
            'paddingTop'      => 'padding-top',
            'paddingRight'    => 'padding-right',
            'paddingBottom'   => 'padding-bottom',
            'paddingLeft'     => 'padding-left',
            'fontSize'        => 'font-size',
            'roundedCorners'  => 'border-radius',
            'fontWeight'      => 'font-weight',
            'textAlign'       => 'text-align',
            'color'           => 'color',
            'backgroundColor' => 'background-color',
        );
        $units = array( 'fontWeight' => '' );
        $css   = '';

        foreach ( $style as $key => $value ) {
            if ( ! isset( $map[ $key ] ) ) {
                continue;
            }

            if ( is_int( $value ) || is_float( $value ) ) {
                $value .= isset( $units[ $key ] ) ? $units[ $key ] : 'px';
            }

            $css .= $map[ $key ] . ':' . $value . ';';
        }

        return $css;
    }
}