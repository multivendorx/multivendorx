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
                set_transient( 'wp_review_request', 'yes', MONTH_IN_SECONDS );
                break;

            case 'add_review':
                update_user_meta( $user_id, 'wp_review_request', 'true', true );
                break;

            case 'review_closed':
                set_transient( 'wp_review_request', 'yes', YEAR_IN_SECONDS );
                break;
        }
        wp_send_json_success();
    }

    /**
     * Show a "leave a review" admin notice, once, after enough time has passed.
     */
    public function seek_product_review() {
        $user_id = get_current_user_id();

        if ( false !== get_transient( 'wp_review_request' ) || get_user_meta( $user_id, 'wp_review_request', true ) ) {
            return;
        }
        ?>
        <div class="notice notice-info is-dismissible review-notice">
			<h3><?php echo esc_html( 'MultiVendorX' ); ?></h3>
			<p><?php esc_html_e( 'We appreciate you using MultiVendorX. If it has helped your business, please consider leaving a quick review.', 'multivendorx' ); ?></p>
			<p>
				<a href="#" class="button button-secondary" data-action="later"><?php esc_html_e( 'Remind me later', 'multivendorx' ); ?></a>
				<a href="<?php echo esc_url( $this->review_url ); ?>" target="_blank" rel="noopener noreferrer" class="button button-primary" data-action="add_review"><?php esc_html_e( 'Review now', 'multivendorx' ); ?></a>
			</p>
		</div>
        <?php
    }

    /**
     * Show the anonymous-usage-tracking opt-in admin notice and handle the yes/no response.
     */
    public function seek_site_information() {
        if ( get_option( 'plugin_action_block_notice' ) ) {
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

        ?>
        <div class="notice notice-success">
			<p>
				<?php echo wp_kses_post( __( 'Want to help make <strong>MultiVendorX</strong> even better? Allow anonymous usage tracking and receive a <strong>10% discount coupon</strong> for premium extensions.', 'multivendorx' ) ); ?>
				<a href="#" class="tracking-toggle"><?php esc_html_e( 'What we collect.', 'multivendorx' ); ?></a>
			</p>

			<div class="tracking-details" style="display:none;">
				<p><?php echo wp_kses_post( __( 'We collect non-sensitive diagnostic and usage data, including your site URL, WordPress and PHP versions, active plugins and themes, and your email address to send the discount coupon.', 'multivendorx' ) ); ?></p>
			</div>

			<p>
				<a href="<?php echo esc_url( $yes_url ); ?>" class="button button-primary"><?php esc_html_e( 'Sure, I\'d like to help', 'multivendorx' ); ?></a>
				<a href="<?php echo esc_url( $no_url ); ?>" class="button button-secondary"><?php esc_html_e( 'No Thanks', 'multivendorx' ); ?></a>
			</p>
		</div>
        <?php

        $plugin_action = filter_input( INPUT_GET, 'plugin_action', FILTER_UNSAFE_RAW );
        $plugin_action = is_string( $plugin_action ) ? sanitize_text_field( wp_unslash( $plugin_action ) ) : '';

        if ( $plugin_action ) {
            update_option( 'plugin_action_block_notice', $plugin_action );
            if ( 'yes' === $plugin_action ) {
                $body                     = MultiVendorX()->tracker->get_tracking_payload();
                $body['status']           = 'Deactivated';
                $body['deactivated_date'] = time();
                MultiVendorX()->tracker->send_data( $body );
                $current_user = wp_get_current_user();
                $this->create_coupon_for_discount(
                    array(
						'name'  => sanitize_text_field( $current_user->display_name ),
						'email' => sanitize_email( $current_user->user_email ),
                    )
                );

                $email = WC()->mailer()->emails['WC_Email_Send_Site_Information'];
                $email->trigger( get_current_user_id() );
            }
        }
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
            ?>
            <div class="notice notice-error is-dismissible free-pro-notice">
                <p>
                    <strong><?php echo esc_html__( 'MultivendorX Update Required', 'multivendorx' ); ?></strong><br>
                    <?php echo esc_html__( 'To ensure all the feature compatibility and accessibility, MultiVendorX Pro minimum v2.0.0 is required.', 'multivendorx' ); ?>
                </p>
                <p>
                    <a href="<?php echo esc_url( admin_url( 'plugins.php' ) ); ?>" class="button button-primary">
                        <?php echo esc_html__( 'Update Now', 'multivendorx' ); ?>
                    </a>
                </p>
            </div>
            <?php
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