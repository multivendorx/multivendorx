<?php

namespace MultiVendorX;

defined( 'ABSPATH' ) || exit;
/**
 * @class       MultiVendorX Promotions Class
 *
 * @version     PRODUCT_VERSION
 * @package     MultiVendorX
 * @author 		MultiVendorX
 */
class Promotions {
    private string $review_url;
    private string $plugin_version;
    private string $pro_plugin_version;
    private string $api_url;
    public function __construct() {
        $this->plugin_version     = MULTIVENDORX_PLUGIN_VERSION;
        $this->pro_plugin_version = defined('MULTIVENDORX_PRO_PLUGIN_VERSION') ? MULTIVENDORX_PRO_PLUGIN_VERSION : '';
        $this->review_url         = sprintf(
            'https://wordpress.org/support/plugin/%s/reviews/#new-post',
            MultiVendorX()->plugin_slug
        );
        $this->api_url = 'https://multivendorx.com/wp-json/mvx_thirdparty/v1/coupon_create_for_pro';
        add_action( 'admin_notices', array($this, 'seek_site_information' ) );
        add_action( 'admin_notices', array($this, 'seek_product_review'));
        add_action( 'admin_notices', array( $this, 'free_pro_admin_notice' ) );
        add_action( 'wp_ajax_admin_notice_action', array($this, 'admin_notice_action'), 10);
        add_action( 'wp_ajax_dismiss_free_pro_notice', array($this, 'dismiss_free_pro_notice') );
        add_action( 'admin_print_footer_scripts', array($this, 'notice_script' ) );
    }

    public function admin_notice_action() {
        check_ajax_referer('admin_notice', 'nonce');
        $action_type = filter_input(INPUT_POST, 'admin_notice_action_type', FILTER_SANITIZE_STRING);
        $user_id     = get_current_user_id();
        if (!$action_type) {
            wp_die();
        }
        switch ($action_type) {
            case 'later':
                set_transient('wp_review_request', 'yes', MONTH_IN_SECONDS);
                break;

            case 'add_review':
                update_user_meta($user_id, 'wp_review_request', 'true', true);
                break;

            case 'review_closed':
                set_transient('wp_review_request', 'yes', YEAR_IN_SECONDS);
                break;
        }
        wp_send_json_success();
    }

    public function seek_product_review() {
        $user_id = get_current_user_id();

        if ( false !== get_transient('wp_review_request') || get_user_meta($user_id, 'wp_review_request', true) ) {
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

    public function seek_site_information() {
        if (get_option('plugin_action_block_notice')) {
            return;
        }

        $yes_url = add_query_arg([
            'plugin'        => 'dc-woocommerce-multi-vendor',
            'plugin_action' => 'yes',
        ]);

        $no_url = add_query_arg([
            'plugin'        => 'dc-woocommerce-multi-vendor',
            'plugin_action' => 'no',
        ]);

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

        if ($plugin_action) {
            update_option('plugin_action_block_notice', $plugin_action);
            if ($plugin_action === 'yes') {
                $body = MultiVendorX()->tracker->get_data();
                $body['status'] = 'Deactivated';
                $body['deactivated_date'] = time();
                MultiVendorX()->tracker->send_data($body);
                $current_user = wp_get_current_user();
                $this->create_coupon_for_discount([
                    'name'  => sanitize_text_field($current_user->display_name),
                    'email' => sanitize_email($current_user->user_email),
                ]);

                $email = WC()->mailer()->emails['WC_Email_Send_Site_Information'];
                $email->trigger(get_current_user_id());
            }
        }
    }

    public function create_coupon_for_discount( $data = array() ) {
		if ( empty( $data ) ) {
			return new \WP_Error( 'missing_data', __( 'Coupon data is required.', 'multivendorx' ) );
		}

		$response = wp_remote_post(
			$this->api_url,
			array(
				'timeout'    => 30,
				'headers'    => array(
					'User-Agent' => 'MultiVendorX/' . $this->plugin_version ?? '1.0.0' . '; ' . home_url(),
				),
				'body'       => $data,
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

    public function notice_script() {
        ?>
        <script>
            jQuery(function ($) {
                const ajaxData = {
                    action: 'admin_notice_action',
                    nonce: '<?php echo esc_js(wp_create_nonce('admin_notice')); ?>'
                };

                $(document)
                    .on('click', '.review-notice .button', function (e) {
                        e.preventDefault();

                        const actionType = $(this).data('action');
                        const href = $(this).attr('href');

                        $.post(ajaxurl, {
                            ...ajaxData,
                            admin_notice_action_type: actionType
                        });

                        $(this).closest('.notice').fadeOut();

                        if (href && href !== '#') {
                            window.open(href, '_blank', 'noopener');
                        }
                    })
                    .on('click', '.review-notice .notice-dismiss', function () {
                        $.post(ajaxurl, {
                            ...ajaxData,
                            admin_notice_action_type: 'review_closed'
                        });
                    })
                    .on('click', '.tracking-toggle', function (e) {
                        e.preventDefault();
                        $('.tracking-details').slideToggle('fast');
                    })

                    // Free pro notice dismiss
                    .on('click', '.free-pro-notice .notice-dismiss', function () {
                        $.post(ajaxurl, {
                            action: 'dismiss_free_pro_notice'
                        });
                    });

            });
        </script>
        <?php
    }

    public function free_pro_admin_notice() {
        if ( get_option( 'multivendorx_dismiss_free_pro_notice' ) ) {
            return;
        }

        if (
            version_compare( $this->plugin_version, '5.0.0', '>=' ) &&
            defined( $this->pro_plugin_version ) &&
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

    public function dismiss_free_pro_notice() {
        update_option('multivendorx_dismiss_free_pro_notice', true);
        die();
    }
}