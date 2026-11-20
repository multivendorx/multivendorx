<?php
/**
 * MultiVendorX Promotions class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

defined( 'ABSPATH' ) || exit;
/**
 * MultiVendorX Promotions class.
 *
 * @class       MultiVendorX Promotions Class
 *
 * @version     PRODUCT_VERSION
 * @package     MultiVendorX
 * @author      MultiVendorX
 */
class Promotions {

    /**
     * URL to leave a WordPress.org review.
     *
     * @var string
     */
    private string $review_url;

    /**
     * Current free plugin version.
     *
     * @var string
     */
    private string $plugin_version;

    /**
     * Current Pro plugin version, if Pro is active.
     *
     * @var string
     */
    private string $pro_plugin_version;

    /**
     * Coupon-creation API endpoint.
     *
     * @var string
     */
    private string $api_url;

    /**
     * Constructor. Registers admin-notice hooks.
     */
    public function __construct() {
        $this->plugin_version     = MULTIVENDORX_PLUGIN_VERSION;
        $this->pro_plugin_version = defined( 'MULTIVENDORX_PRO_PLUGIN_VERSION' ) ? MULTIVENDORX_PRO_PLUGIN_VERSION : '';
        $this->review_url         = sprintf(
            'https://wordpress.org/support/plugin/%s/reviews/#new-post',
            MultiVendorX()->plugin_slug
        );
        $this->api_url            = 'https://multivendorx.com/wp-json/mvx_thirdparty/v1/coupon_create_for_pro';
        add_action( 'admin_notices', array( $this, 'seek_site_information' ) );
        add_action( 'admin_notices', array( $this, 'seek_product_review' ) );
        add_action( 'admin_notices', array( $this, 'free_pro_admin_notice' ) );
        add_action( 'wp_ajax_multivendorx_admin_notice_action', array( $this, 'admin_notice_action' ), 10 );
        add_action( 'wp_ajax_multivendorx_dismiss_free_pro_notice', array( $this, 'dismiss_free_pro_notice' ) );
        add_filter( 'admin_multivendorx_register_scripts', array( $this, 'register_notice_script' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_notice_script' ) );
    }

    /**
     * Handle the review/site-info admin notice dismiss actions.
     */
    public function admin_notice_action() {
        check_ajax_referer( 'admin_notice', 'nonce' );

        if ( ! Utill::current_user_has_capability( array( 'manage_options' ) ) ) {
            wp_send_json_error( null, 403 );
        }

        $action_type = sanitize_key( filter_input( INPUT_POST, 'admin_notice_action_type' ) ?? '' );
        $user_id     = get_current_user_id();
        if ( ! $action_type ) {
            wp_die();
        }
        switch ( $action_type ) {
            case 'later':
                set_transient( 'multivendorx_review_request', 'yes', MONTH_IN_SECONDS );
                break;

            case 'add_review':
                update_user_meta( $user_id, 'multivendorx_review_request', 'true', true );
                break;

            case 'review_closed':
                set_transient( 'multivendorx_review_request', 'yes', YEAR_IN_SECONDS );
                break;
        }
        wp_send_json_success();
    }

    /**
     * Show a "leave a review" admin notice, once, after enough time has passed.
     */
    public function seek_product_review() {
        $user_id = get_current_user_id();

        if ( false !== get_transient( 'multivendorx_review_request' ) || get_user_meta( $user_id, 'multivendorx_review_request', true ) ) {
            return;
        }
        AdminNotice::render(
            array(
                'type'        => 'info',
                'icon'        => 'star-filled',
                'class'       => 'review-notice',
                'dismissible' => true,
                'title'       => __( 'Enjoying MultiVendorX?', 'multivendorx' ),
                'message'     => __( 'If it has helped your business, please consider leaving a quick review. It helps other store owners find us.', 'multivendorx' ),
                'actions'     => array(
                    array(
                        'label'      => __( 'Review now', 'multivendorx' ),
                        'url'        => $this->review_url,
                        'new_tab'    => true,
                        'attributes' => array( 'data-action' => 'add_review' ),
                    ),
                    array(
                        'label'      => __( 'Remind me later', 'multivendorx' ),
                        'style'      => 'secondary',
                        'attributes' => array( 'data-action' => 'later' ),
                    ),
                ),
            )
        );
    }

    /**
     * Show the anonymous-usage-tracking opt-in admin notice and handle the yes/no response.
     */
    public function seek_site_information() {
        if ( get_option( 'multivendorx_plugin_action_block_notice' ) ) {
            return;
        }

        // Handle the answer first, so the notice is gone on the page load that records it.
        $plugin_action = filter_input( INPUT_GET, 'plugin_action', FILTER_UNSAFE_RAW );
        $plugin_action = is_string( $plugin_action ) ? sanitize_text_field( wp_unslash( $plugin_action ) ) : '';

        if ( $plugin_action ) {
            update_option( 'multivendorx_plugin_action_block_notice', $plugin_action );
            if ( 'yes' === $plugin_action ) {
                $body                     = MultiVendorX()->tracker->get_tracking_payload();
                $body['status']           = 'Deactivated';
                $body['deactivated_date'] = time();
                MultiVendorX()->tracker->send_data( $body );
                $current_user = MultiVendorX()->current_user;
                $this->create_coupon_for_discount(
                    array(
						'name'  => sanitize_text_field( $current_user->display_name ),
						'email' => sanitize_email( $current_user->user_email ),
                    )
                );

                $email = WC()->mailer()->emails['WC_Email_Send_Site_Information'];
                $email->trigger( get_current_user_id() );
            }
            return;
        }

        $yes_url = add_query_arg(
            array(
				'plugin'        => 'dc-woocommerce-multi-vendor',
				'plugin_action' => 'yes',
            )
        );

        $no_url = add_query_arg(
            array(
				'plugin'        => 'dc-woocommerce-multi-vendor',
				'plugin_action' => 'no',
            )
        );

        AdminNotice::render(
            array(
                'type'    => 'info',
                'icon'    => 'chart-bar',
                'title'   => __( 'Help improve MultiVendorX and get 10% off', 'multivendorx' ),
                'message' => sprintf(
                    '%1$s <a href="#" class="tracking-toggle" aria-expanded="false">%2$s</a>',
                    esc_html__( 'Share anonymous usage data and we\'ll email you a 10% discount coupon for premium extensions.', 'multivendorx' ),
                    esc_html__( 'What we collect', 'multivendorx' )
                ),
                'details' => sprintf(
                    '<p class="multivendorx-notice-details tracking-details">%s</p>',
                    esc_html__( 'Non-sensitive diagnostic and usage data: your site URL, WordPress and PHP versions, active plugins and themes, and your email address so we can send the coupon.', 'multivendorx' )
                ),
                'actions' => array(
                    array(
                        'label' => __( 'Sure, I\'d like to help', 'multivendorx' ),
                        'url'   => $yes_url,
                    ),
                    array(
                        'label' => __( 'No thanks', 'multivendorx' ),
                        'url'   => $no_url,
                        'style' => 'secondary',
                    ),
                ),
            )
        );
    }

    /**
     * Request a discount coupon from the MultiVendorX API for a user who opted into tracking.
     *
     * @param array $recipient_data Coupon recipient data (name, email).
     * @return array|\WP_Error
     */
    public function create_coupon_for_discount( $recipient_data = array() ) {
		if ( empty( $recipient_data ) ) {
			return new \WP_Error( 'missing_data', __( 'Coupon data is required.', 'multivendorx' ) );
		}

		$response = wp_remote_post(
			$this->api_url,
			array(
				'timeout'     => 30,
				'headers'     => array(
					'User-Agent' => 'MultiVendorX/' . $this->plugin_version,
				),
				'body'        => $recipient_data,
				'data_format' => 'body',
			)
		);
		if ( is_wp_error( $response ) ) {
			return $response;
		}
		$response_code = wp_remote_retrieve_response_code( $response );
		if ( 200 !== $response_code ) {
			return new \WP_Error( 'remote_request_failed', __( 'Unable to create coupon.', 'multivendorx' ) );
		}
		return $response;
	}

    /**
     * Register the admin-notice dismiss/action handling script.
     *
     * @param array $scripts Existing admin scripts.
     * @return array
     */
    public function register_notice_script( $scripts ) {
        $scripts['multivendorx-admin-notices'] = array(
            'src'  => FrontendScripts::get_asset_path() . 'js/public/' . MULTIVENDORX_PLUGIN_SLUG . '-admin-notices.min.js',
            'deps' => array( 'jquery' ),
        );
        return $scripts;
    }

    /**
     * Enqueue the admin-notice dismiss/action handling script.
     */
    public function enqueue_notice_script() {
        FrontendScripts::enqueue_script( 'multivendorx-admin-notices' );
        FrontendScripts::localize_script(
            'multivendorx-admin-notices',
            'multivendorxAdminNotices',
            array(
                'action' => 'multivendorx_admin_notice_action',
                'nonce'  => wp_create_nonce( 'admin_notice' ),
            )
        );
    }

    /**
     * Show a notice when the installed Pro plugin version is below the required minimum.
     */
    public function free_pro_admin_notice() {
        if ( get_option( 'multivendorx_dismiss_free_pro_notice' ) ) {
            return;
        }

        if (
            version_compare( $this->plugin_version, '5.0.0', '>=' ) &&
            ! empty( $this->pro_plugin_version ) &&
            version_compare( $this->pro_plugin_version, '2.0.0', '<' )
        ) {
            AdminNotice::render(
                array(
                    'type'        => 'error',
                    'icon'        => 'update',
                    'class'       => 'free-pro-notice',
                    'dismissible' => true,
                    'title'       => __( 'MultiVendorX Pro needs an update', 'multivendorx' ),
                    'message'     => __( 'This version of MultiVendorX needs MultiVendorX Pro 2.0.0 or later. Update Pro to keep every feature working.', 'multivendorx' ),
                    'actions'     => array(
                        array(
                            'label' => __( 'Update now', 'multivendorx' ),
                            'url'   => admin_url( 'plugins.php' ),
                        ),
                    ),
                )
            );
        }
    }

    /**
     * Dismiss the free/pro version-mismatch admin notice.
     */
    public function dismiss_free_pro_notice() {
        check_ajax_referer( 'admin_notice', 'nonce' );

        if ( ! Utill::current_user_has_capability( array( 'manage_options' ) ) ) {
            wp_send_json_error( null, 403 );
        }

        update_option( 'multivendorx_dismiss_free_pro_notice', true );
        wp_send_json_success();
    }
}
