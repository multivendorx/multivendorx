<?php
/**
 * MultiVendorX Tracker class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Tracker class.
 *
 * @class       MultiVendorX Tracker Class
 *
 * @version     PRODUCT_VERSION
 * @package     MultiVendorX
 * @author      MultiVendorX
 */
class Tracker {

    /**
     * Plugin slug.
     *
     * @var string
     */
    private string $slug;

    /**
     * URL to leave a WordPress.org review.
     *
     * @var string
     */
    private string $review_url;

    /**
     * Support forum URL.
     *
     * @var string
     */
    private string $support_url;

    /**
     * Community Facebook group URL.
     *
     * @var string
     */
    private string $facebook_url;

    /**
     * URL to book a support call.
     *
     * @var string
     */
    private string $calendly_url;

    /**
     * URL to purchase/upgrade to Pro.
     *
     * @var string
     */
    private string $pro_shop_url;

    /**
     * Current free plugin version.
     *
     * @var string
     */
    private string $plugin_version;

    /**
     * Human-readable plugin name.
     *
     * @var string
     */
    private string $plugin_name;

    /**
     * URL to the plugin's settings page.
     *
     * @var string
     */
    private string $settings_url;

    /**
     * Tracking data submission API endpoint.
     *
     * @var string
     */
    private string $api_url;

    /**
     * Installed Pro plugin version, if active.
     *
     * @var string
     */
    private string $pro_plugin_version;

    /**
     * Constructor. Sets up tracker URLs and registers deactivation/tracking hooks.
     */
    public function __construct() {
        $this->slug               = MultiVendorX()->plugin_slug;
        $this->plugin_name        = 'MultiVendorX';
        $this->plugin_version     = MULTIVENDORX_PLUGIN_VERSION;
        $this->pro_shop_url       = MULTIVENDORX_PRO_SHOP_URL;
        $this->pro_plugin_version = defined( 'MULTIVENDORX_PRO_PLUGIN_VERSION' ) ? MULTIVENDORX_PRO_PLUGIN_VERSION : '';
        $this->review_url         = 'https://wordpress.org/support/plugin/' . MultiVendorX()->plugin_slug . '/reviews/#new-post';
        $this->support_url        = 'https://multivendorx.com/support-forum/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx';
        $this->facebook_url       = 'https://www.facebook.com/groups/226246620006065';
        $this->calendly_url       = 'https://calendly.com/contact-hkdq/30min';
        $this->settings_url       = admin_url( 'admin.php?page=multivendorx#&tab=settings&subtab=overview' );
        $this->api_url            = 'https://multivendorx.com/wp-json/mvx_thirdparty/v1/users_database_update';

        add_filter( 'plugin_action_links_' . MultiVendorX()->plugin_base, array( $this, 'deactivate_action_links' ) );
        add_filter( 'admin_multivendorx_register_scripts', array( $this, 'register_deactivation_script' ) );
        add_filter( 'admin_multivendorx_register_styles', array( $this, 'register_deactivation_style' ) );
        add_action( 'admin_print_footer_scripts-plugins.php', array( $this, 'print_deactivation_form' ) );
        add_action( 'admin_enqueue_scripts-plugins.php', array( $this, 'enqueue_deactivation_assets' ) );
        add_action( 'wp_ajax_deactivation_form_' . $this->slug, array( $this, 'handle_form_submit' ) );

        register_deactivation_hook(
            MultiVendorX()->plugin_path . 'dc_product_vendor.php',
            array( $this, 'on_plugin_deactivated' )
        );
    }

    /**
     * Add settings/review/upgrade links to the plugin's row on the Plugins screen.
     *
     * @param array $links Existing plugin action links.
     * @return array
     */
    public function deactivate_action_links( array $links ): array {
        $links['settings'] = '<a href="' . esc_url( $this->settings_url ) . '">'
            . esc_html__( 'Settings', 'multivendorx' ) . '</a>';

        if ( isset( $links['deactivate'] ) ) {
            $links['deactivate'] = $this->wrap_deactivate_link( $links['deactivate'] );
        }

        $links['write_review'] = '<a href="' . esc_url( $this->review_url ) . '" target="_blank" rel="noopener noreferrer">'
            . esc_html__( 'Write a Review', 'multivendorx' ) . '</a>';

        if ( ! Utill::is_khali_dabba() ) {
            $links['go_pro'] = '<a href="' . esc_url( $this->pro_shop_url ) . '" target="_blank" rel="noopener noreferrer">'
                . esc_html__( 'Upgrade to Pro', 'multivendorx' ) . '</a>';
        }

        return $links;
    }

    /**
     * Wrap the "Deactivate" link with the deactivation-feedback modal markup.
     *
     * @param string $link Original deactivate link HTML.
     * @return string
     */
    private function wrap_deactivate_link( string $link ): string {
        $slug  = esc_attr( $this->slug );
        $modal = '<div class="modal-wrap" id="modal-' . $slug . '" style="display: none">'
                . '<div class="modal-bg"></div>'
                . '<div class="modal-box" id="modal-box-' . $slug . '"></div>'
                . '</div>';

        return str_replace(
            '<a ',
            $modal . '<a id="deactivate-link-' . $slug . '" ',
            $link
        );
    }

    /**
     * Send final deactivation tracking data when the plugin is deactivated.
     */
    public function on_plugin_deactivated(): void {
        if ( get_option( 'plugin_action_block_notice' ) !== 'yes' ) {
            return;
        }

        $slug                         = $this->slug;
        $body                         = $this->get_tracking_payload();
        $body['status']               = 'Deactivated';
        $body['deactivated_date']     = time();
        $body['deactivation_reason']  = get_option( 'deactivation_reason_' . $slug, '' );
        $body['deactivation_details'] = get_option( 'deactivation_details_' . $slug, '' );

        $this->send_data( $body );

        delete_option( 'deactivation_reason_' . $slug );
        delete_option( 'deactivation_details_' . $slug );
    }

    /**
     * Print the deactivation-feedback modal's HTML template.
     */
    public function print_deactivation_form(): void {
        $slug  = $this->slug;
        $form  = $this->deactivation_reasons();
        $nonce = wp_create_nonce( 'deactivation_nonce' );
        ?>

        <!-- Deactivation Modal -->
        <script type="text/html" id="form-template-<?php echo esc_attr( $slug ); ?>">
            <div class="form-head">
                <?php echo esc_html( $form['heading'] ); ?>
            </div>

            <div class="form-body">
                <p><?php echo esc_html( $form['subtitle'] ); ?></p>

                <div class="support-cards">
                    <a href="<?php echo esc_url( $this->support_url ); ?>" target="_blank" rel="noopener noreferrer" class="support-card">
                        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M15.573,11.624c0.568-0.478,0.947-1.219,0.947-2.019c0-1.37-1.108-2.569-2.371-2.569s-2.371,1.2-2.371,2.569c0,0.8,0.379,1.542,0.946,2.019c-0.253,0.089-0.496,0.2-0.728,0.332c-0.743-0.898-1.745-1.573-2.891-1.911c0.877-0.61,1.486-1.666,1.486-2.812c0-1.79-1.479-3.359-3.162-3.359S4.269,5.443,4.269,7.233c0,1.146,0.608,2.202,1.486,2.812c-2.454,0.725-4.252,2.998-4.252,5.685c0,0.218,0.178,0.396,0.395,0.396h16.203c0.218,0,0.396-0.178,0.396-0.396C18.497,13.831,17.273,12.216,15.573,11.624 M12.568,9.605c0-0.822,0.689-1.779,1.581-1.779s1.58,0.957,1.58,1.779s-0.688,1.779-1.58,1.779S12.568,10.427,12.568,9.605 M5.06,7.233c0-1.213,1.014-2.569,2.371-2.569c1.358,0,2.371,1.355,2.371,2.569S8.789,9.802,7.431,9.802C6.073,9.802,5.06,8.447,5.06,7.233 M2.309,15.335c0.202-2.649,2.423-4.742,5.122-4.742s4.921,2.093,5.122,4.742H2.309z M13.346,15.335c-0.067-0.997-0.382-1.928-0.882-2.732c0.502-0.271,1.075-0.429,1.686-0.429c1.828,0,3.338,1.385,3.535,3.161H13.346z"/></svg>
                        <span><?php esc_html_e( 'Support Forum', 'multivendorx' ); ?></span>
                    </a>
                    <a href="<?php echo esc_url( $this->facebook_url ); ?>" target="_blank" rel="noopener noreferrer" class="support-card">
                        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10,0.5c-5.247,0-9.5,4.253-9.5,9.5c0,5.247,4.253,9.5,9.5,9.5c5.247,0,9.5-4.253,9.5-9.5C19.5,4.753,15.247,0.5,10,0.5 M10,18.637c-4.77,0-8.636-3.867-8.636-8.637S5.23,1.364,10,1.364S18.637,5.23,18.637,10S14.77,18.637,10,18.637 M10.858,7.949c0-0.349,0.036-0.536,0.573-0.536h0.719v-1.3H11c-1.38,0-1.866,0.65-1.866,1.743v0.845h-0.86V10h0.86v3.887h1.723V10h1.149l0.152-1.299h-1.302L10.858,7.949z"/></svg>
                        <span><?php esc_html_e( 'Facebook Group', 'multivendorx' ); ?></span>
                    </a>
                    <a href="<?php echo esc_url( $this->calendly_url ); ?>" target="_blank" rel="noopener noreferrer" class="support-card">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.384,17.752a2.108,2.108,0,0,1-.522,3.359,7.543,7.543,0,0,1-5.476.642C10.5,20.523,3.477,13.5,2.247,8.614a7.543,7.543,0,0,1,.642-5.476,2.108,2.108,0,0,1,3.359-.522L8.333,4.7a2.094,2.094,0,0,1,.445,2.328A3.877,3.877,0,0,1,8,8.2c-2.384,2.384,5.417,10.185,7.8,7.8a3.877,3.877,0,0,1,1.173-.781,2.092,2.092,0,0,1,2.328.445Z"/></svg>
                        <span><?php esc_html_e( 'Book a Call', 'multivendorx' ); ?></span>
                    </a>
                </div>

                <p><?php echo esc_html( $form['reason_label'] ); ?></p>

                <ul class="deactivation-reasons">
                    <?php
                    foreach ( $form['options'] as $option ) :
                        $label       = is_array( $option ) ? $option['label'] : $option;
                        $id          = 'deactivate-reason-' . sanitize_title( $label );
                        $has_extra   = is_array( $option ) && ! empty( $option['extra_field'] );
                        $is_textarea = $has_extra && ( $option['type'] ?? '' ) === 'textarea';
						?>
                        <li>
                            <input type="radio" name="deactivate-reason" id="<?php echo esc_attr( $id ); ?>" value="<?php echo esc_attr( $label ); ?>">
                            <label for="<?php echo esc_attr( $id ); ?>"><?php echo esc_html( $label ); ?></label>
                            <?php if ( $has_extra ) : ?>
                                <?php if ( $is_textarea ) : ?>
                                    <textarea class="extra-field" placeholder="<?php echo esc_attr( $option['extra_field'] ); ?>"></textarea>
                                <?php else : ?>
                                    <input type="text" class="extra-field" placeholder="<?php echo esc_attr( $option['extra_field'] ); ?>">
                                <?php endif; ?>
                            <?php endif; ?>
                        </li>
                    <?php endforeach; ?>
                </ul>

                <div class="data-notice">
                    <?php esc_html_e( 'We collect non-sensitive diagnostic data and plugin usage information along with your feedback.', 'multivendorx' ); ?>
                </div>
            </div>

            <div class="form-footer">
                <a class="footer-button button-skip" href="#"><?php esc_html_e( 'Skip & Deactivate', 'multivendorx' ); ?></a>
                <button type="button" class="footer-button button-submit"><?php esc_html_e( 'Submit & Deactivate', 'multivendorx' ); ?></button>
            </div>
        </script>
        <?php
    }

    /**
     * Register the deactivation modal's behavior script.
     *
     * @param array $scripts Existing admin scripts.
     * @return array
     */
    public function register_deactivation_script( $scripts ) {
        $scripts['multivendorx-deactivation-modal'] = array(
            'src'  => FrontendScripts::get_asset_path() . 'js/public/' . MULTIVENDORX_PLUGIN_SLUG . '-deactivation-modal.min.js',
            'deps' => array( 'jquery' ),
        );
        return $scripts;
    }

    /**
     * Register the deactivation modal's stylesheet.
     *
     * @param array $styles Existing admin styles.
     * @return array
     */
    public function register_deactivation_style( $styles ) {
        $styles['multivendorx-deactivation-modal'] = array(
            'src' => FrontendScripts::get_asset_path() . 'styles/public/' . MULTIVENDORX_PLUGIN_SLUG . '-deactivation-modal.min.css',
        );
        return $styles;
    }

    /**
     * Enqueue the deactivation modal's styles and behavior on the Plugins screen.
     */
    public function enqueue_deactivation_assets(): void {
        $slug = $this->slug;

        FrontendScripts::enqueue_style( 'multivendorx-deactivation-modal' );
        FrontendScripts::enqueue_script( 'multivendorx-deactivation-modal' );
        FrontendScripts::localize_script(
            'multivendorx-deactivation-modal',
            'multivendorxDeactivation',
            array(
                'slug'           => $slug,
                'nonce'          => wp_create_nonce( 'deactivation_nonce' ),
                'ajaxUrl'        => admin_url( 'admin-ajax.php' ),
                'submittingText' => __( 'Submitting…', 'multivendorx' ),
            )
        );
    }

    /**
     * Handle the deactivation-feedback form's AJAX submission.
     */
    public function handle_form_submit(): void {
        check_ajax_referer( 'deactivation_nonce', 'security' );

        if ( ! Utill::current_user_has_capability( array( 'activate_plugins' ) ) ) {
            wp_send_json_error( 'Insufficient permissions.', 403 );
        }

        $slug    = $this->slug;
        $reason  = sanitize_text_field( wp_unslash( filter_input( INPUT_POST, 'values' ) ?? '' ) );
        $details = sanitize_text_field( wp_unslash( filter_input( INPUT_POST, 'details' ) ?? '' ) );

        update_option( 'deactivation_reason_' . $slug, $reason, false );
        update_option( 'deactivation_details_' . $slug, $details, false );

        $mailer = WC()->mailer()->emails['WC_Email_Plugin_Deactivated_Mail'] ?? null;
        if ( $mailer ) {
            $mailer->trigger( get_current_user_id() );
        }

        wp_send_json_success();
    }

    /**
     * Build the deactivation-feedback form's heading, labels, and reason options.
     *
     * @return array
     */
    private function deactivation_reasons(): array {
        $form = array(
            'heading'      => __( "We're sorry to see you leave 😔", 'multivendorx' ),
            'subtitle'     => __( "Thinking about deactivating? We're here to help — contact us anytime.", 'multivendorx' ),
            'reason_label' => __( 'Would you quickly share your reason for deactivating?', 'multivendorx' ),
            'options'      => array(
                __( 'I no longer need the plugin', 'multivendorx' ),
                array(
                    'label'       => __( 'I found a better plugin', 'multivendorx' ),
                    'extra_field' => __( 'Please share which plugin', 'multivendorx' ),
                ),
                __( "I couldn't get the plugin to work", 'multivendorx' ),
                __( "It's a temporary deactivation", 'multivendorx' ),
                array(
                    'label'       => __( 'Other', 'multivendorx' ),
                    'extra_field' => __( 'Please share the reason', 'multivendorx' ),
                    'type'        => 'textarea',
                ),
            ),
        );

        return $form;
    }

    /**
     * Build the anonymous site/plugin usage data payload sent to the tracking API.
     *
     * @return array
     */
    public function get_tracking_payload(): array {
        if ( ! function_exists( 'get_plugins' ) ) {
            require_once ABSPATH . '/wp-admin/includes/plugin.php';
        }
        if ( ! function_exists( 'wp_get_current_user' ) ) {
            require_once ABSPATH . 'wp-includes/pluggable.php';
        }

        $all_plugins    = array_keys( get_plugins() );
        $active_plugins = is_network_admin()
            ? array_keys( get_site_option( 'active_sitewide_plugins', array() ) )
            : (array) get_option( 'active_plugins', array() );

        $user            = wp_get_current_user();
        $user_one        = get_userdata( 1 );
        $theme           = wp_get_theme();
        $pro_key_details = get_option( 'wc_am_client_multivendorx_pro', true ) ? get_option( 'wc_am_client_multivendorx_pro', true ) : array();

        return array(
            'plugin_slug'      => $this->slug,
            'plugin_version'   => $this->plugin_version,
            'plugin'           => $this->plugin_name,
            'version'          => $this->plugin_version,
            'url'              => get_bloginfo( 'url' ),
            'site_name'        => get_bloginfo( 'name' ),
            'site_version'     => get_bloginfo( 'version' ),
            'site_language'    => get_bloginfo( 'language' ),
            'charset'          => get_bloginfo( 'charset' ),
            'php_version'      => phpversion(),
            'multisite'        => is_multisite(),
            'text_direction'   => function_exists( 'is_rtl' ) ? ( is_rtl() ? 'RTL' : 'LTR' ) : 'NOT SET',
            'server'           => sanitize_text_field( (string) ( filter_input( INPUT_SERVER, 'SERVER_SOFTWARE', FILTER_UNSAFE_RAW ) ?? getenv( 'SERVER_SOFTWARE' ) ) ),
            'email'            => implode(
                ',',
                array_filter(
                    array(
						$user->user_email ?? '',
						$user_one ? $user_one->data->user_email : '',
						get_option( 'admin_email', '' ),
                    )
                )
            ),
            'active_plugins'   => maybe_serialize( $active_plugins ),
            'inactive_plugins' => maybe_serialize( array_values( array_diff( $all_plugins, $active_plugins ) ) ),
            // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- WP_Theme::__get() only recognizes the capitalized 'Name'/'Version' header keys.
            'theme'            => sanitize_text_field( $theme->Name ),
            // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- WP_Theme::__get() only recognizes the capitalized 'Name'/'Version' header keys.
            'theme_version'    => sanitize_text_field( $theme->Version ),
            'status'           => 'Active',
            'file_location'    => __FILE__,
            'pro_version'      => $this->pro_plugin_version,
            'api_key'          => isset( $pro_key_details['wc_am_client_multivendorx_pro_api_key'] ) ? $pro_key_details['wc_am_client_multivendorx_pro_api_key'] : '',
            'product_id'       => get_option( 'wc_am_product_id_multivendorx_pro', true ) ? get_option( 'wc_am_product_id_multivendorx_pro', true ) : '',
            'pro_status'       => get_option( 'wc_am_client_multivendorx_pro_activated', true ) ? get_option( 'wc_am_client_multivendorx_pro_activated', true ) : '',
        );
    }

    /**
     * Send the tracking data payload to the MultiVendorX API, registering the site if needed.
     *
     * @param array $body Tracking data payload.
     */
    public function send_data( array $body ): void {
        $slug         = $this->slug;
        $site_id_key  = "{$slug}_site_id";
        $orig_url_key = "{$slug}_original_url";
        $site_url     = get_bloginfo( 'url' );

        $site_id  = get_option( $site_id_key, false );
        $orig_url = get_option( $orig_url_key, false );

        // Reset if site URL changed.
        if ( false !== $orig_url && $orig_url !== $site_url ) {
            $site_id = false;
        }

        if ( false !== $site_id ) {
            return; // Already registered.
        }

        $ip = sanitize_text_field( (string) ( filter_input( INPUT_SERVER, 'REMOTE_ADDR', FILTER_VALIDATE_IP ) ?? getenv( 'REMOTE_ADDR' ) ) );
        if ( $ip && '127.0.0.1' !== $ip && filter_var( $ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE ) ) {
            $geo = wp_remote_get( 'https://ip-api.com/json/' . rawurlencode( $ip ) . '?fields=country' );
            if ( ! is_wp_error( $geo ) && wp_remote_retrieve_response_code( $geo ) === 200 ) {
                $geo_data        = json_decode( wp_remote_retrieve_body( $geo ) );
                $body['country'] = sanitize_text_field( $geo_data->country ?? 'NOT SET' );
            }
        }

        $body['plugin_slug'] = $slug;
        $body['url']         = $site_url;

        $response = wp_remote_post(
            $this->api_url,
            array(
				'method'      => 'POST',
				'timeout'     => 30,
				'httpversion' => '1.1',
				'body'        => $body,
				'user-agent'  => 'PUT/1.0.0; ' . $site_url,
			)
        );

        if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) !== 200 ) {
            return;
        }

        $result = json_decode( wp_remote_retrieve_body( $response ), true );
        if ( is_array( $result ) && isset( $result['siteId'] ) ) {
            $sid = $result['siteId'];
            update_option( $site_id_key, $sid, false );
            update_option( $orig_url_key, $site_url, false );
            update_option( "{$slug}_{$sid}", $body, false );
        }
    }
}