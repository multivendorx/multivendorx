<?php
/**
 * Promotions class file.
 *
 * @package MooWoodle
 */

namespace MooWoodle;

defined( 'ABSPATH' ) || exit;

/**
 * Admin notices communications MooWoodle Pro and VuloMail.
 *
 * @version     3.4.0
 * @package     MooWoodle
 */
class Communications {

	/**
	 * MooWoodle Pro shop URL used in upgrade links.
	 *
	 * @var string
	 */
	private string $pro_upgrade_url;

	/**
	 * Communications constructor. Registers notice, AJAX and script hooks.
	 */
	public function __construct() {
		$this->pro_upgrade_url = MOOWOODLE_PRO_SHOP_URL;
		add_action( 'admin_notices', array( $this, 'display_admin_notices' ) );
		add_action( 'wp_ajax_moowoodle_admin_notice_action', array( $this, 'moowoodle_dismiss_notice' ) );
		add_filter( 'moowoodle_admin_scripts', array( $this, 'register_notice_script' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_notice_script' ) );
	}

	/**
	 * Display all MooWoodle admin notices.
	 *
	 * @return void
	 */
	public function display_admin_notices() {
		$this->display_unsupported_extension_notice();
		$this->display_vulomail_promotion_notice();
		$this->display_pro_update_notice();
	}

	/**
	 * Display the VuloMail promotion to administrators who have not activated it.
	 *
	 * This notice is independent of the MooWoodle Pro license state.
	 *
	 * @return void
	 */
	public function display_vulomail_promotion_notice() {
		if ( $this->is_vulomail_active() || ! $this->should_display_notice('vulomail_notice') ) {
			return;
		}

		$install_url = wp_nonce_url( self_admin_url( 'update.php?action=install-plugin&plugin=vulomail' ), 'install-plugin_vulomail' );
		?>
		<div class="notice notice-info is-dismissible moowoodle-vulomail-notice">
			<span class="moowoodle-vulomail-icon dashicons dashicons-email-alt" aria-hidden="true"></span>

			<div class="moowoodle-vulomail-body">
				<p class="moowoodle-vulomail-title">
					<?php esc_html_e( 'Track enrollment emails with VuloMail', 'moowoodle' ); ?>
					<span class="moowoodle-vulomail-badge"><?php esc_html_e( 'Free', 'moowoodle' ); ?></span>
				</p>
				<p class="moowoodle-vulomail-desc">
					<?php esc_html_e( 'See which enrollment emails were sent to students and quickly identify emails that failed to send.', 'moowoodle' ); ?>
				</p>
			</div>

			<div class="moowoodle-vulomail-actions">
				<a class="button button-primary moowoodle-vulomail-install" href="<?php echo esc_url( $install_url ); ?>">
					<?php esc_html_e( 'Install VuloMail', 'moowoodle' ); ?>
				</a>
				<a class="moowoodle-vulomail-learn" href="<?php echo esc_url( 'https://vulomail.com/' ); ?>" target="_blank" rel="noopener noreferrer">
					<?php esc_html_e( 'Learn more', 'moowoodle' ); ?>
					<span class="screen-reader-text"><?php esc_html_e( '(opens in a new tab)', 'moowoodle' ); ?></span>
					<span class="dashicons dashicons-external" aria-hidden="true"></span>
				</a>
			</div>
		</div>
		<?php
	}
	/**
	 * Save the VuloMail notice dismissal timestamp.
	 *
	 * @return void
	 */
	public function moowoodle_dismiss_notice() {
		check_ajax_referer( 'moowoodle_dismiss_notice', 'nonce' );

		$notice_type = isset( $_POST['notice_type'] ) ? sanitize_text_field( $_POST['notice_type'] ) : '';

		if ( 'vulomail' === $notice_type ) {
			update_option( Util::MOOWOODLE_OTHER_SETTINGS['vulomail_notice'], time(), false );
		} elseif ( 'pro_update' === $notice_type ) {
			update_option( Util::MOOWOODLE_OTHER_SETTINGS['pro_update_notice'], time(), false );
		}

		wp_send_json_success();
	}

	/**
	 * Display an admin notice reminding administrators to keep MooWoodle Pro updated.
	 *
	 * Using an outdated version of MooWoodle Pro may cause unexpected student unenrollment.
	 *
	 * @return void
	 */
	public function display_pro_update_notice() {
		if ( ! Util::is_khali_dabba() || ! $this->should_display_notice('pro_update_notice') ) {
			return;
		}

		?>
		<div class="notice notice-error is-dismissible moowoodle-pro-update-notice">
			<p>
				<strong>
					<?php esc_html_e( 'Important: Ensure MooWoodle Pro Is Up to Date!', 'moowoodle' ); ?>
				</strong>
			</p>
			<p>
				<?php
				esc_html_e(
					'Please ensure that you are using the latest version of MooWoodle Pro. Using an outdated version may cause unexpected student unenrollment. Keeping MooWoodle Pro updated helps prevent such issues.',
					'moowoodle'
				);
				?>
			</p>
		</div>
		<?php
	}

	/**
	 * Register the admin-notice dismiss/action handling script.
	 *
	 * @param array $scripts Existing admin scripts.
	 * @return array
	 */
	public function register_notice_script( $scripts ) {
		$scripts['moowoodle-admin-notices'] = array(
			'src'  => FrontendScripts::get_asset_path() . 'js/public/' . MOOWOODLE_PLUGIN_SLUG . '-admin-notices.min.js',
			'deps' => array( 'jquery' ),
		);
		return $scripts;
	}

	/**
	 * Enqueue the admin-notice dismiss/action handling script.
	 *
	 * @return void
	 */
	public function enqueue_notice_script() {
		FrontendScripts::enqueue_script( 'moowoodle-admin-notices' );

		// The VuloMail notice shows on every admin screen, not only MooWoodle's, so its layout ships as an inline
		// stylesheet here rather than in the admin app's bundle.
		wp_register_style( 'moowoodle-admin-notices', false, array(), MOOWOODLE_PLUGIN_VERSION );
		wp_enqueue_style( 'moowoodle-admin-notices' );
		wp_add_inline_style( 'moowoodle-admin-notices', $this->get_vulomail_notice_css() );
		FrontendScripts::localize_script(
			'moowoodle-admin-notices',
			'moowoodleAdminNotices',
			array(
				'action' => 'moowoodle_admin_notice_action',
				'nonce'  => wp_create_nonce( 'moowoodle_dismiss_notice' ),
			)
		);
	}

		/**
	 * Layout of the VuloMail notice: an icon tile, the title and description, then the actions, on one row from 783px
	 * up and stacked below that. `#wpbody` lets it outrank the MooWoodle admin app's own notice restyle, which would
	 * otherwise recolour the install button's label to match its background.
	 *
	 * @return string
	 */
	private function get_vulomail_notice_css() {
		return '
			#wpbody .moowoodle-vulomail-notice { display: flex; align-items: center; gap: 16px; padding: 16px 48px 16px 16px; border-left-color: #5007aa; }
			#wpbody .moowoodle-vulomail-notice .moowoodle-vulomail-icon { flex: none; width: 44px; height: 44px; border-radius: 10px; background: #f4eefb; color: #5007aa; font-size: 24px; line-height: 44px; text-align: center; }
			#wpbody .moowoodle-vulomail-notice .moowoodle-vulomail-body { flex: 1; min-width: 0; }
			#wpbody .moowoodle-vulomail-notice p { margin: 0; padding: 0; }
			#wpbody .moowoodle-vulomail-notice .moowoodle-vulomail-title { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; color: #1d2327; font-size: 14px; font-weight: 600; line-height: 1.4; }
			#wpbody .moowoodle-vulomail-notice .moowoodle-vulomail-badge { padding: 1px 8px; border-radius: 999px; background: #e7f6ec; color: #1a7f37; font-size: 11px; font-weight: 600; line-height: 18px; }
			#wpbody .moowoodle-vulomail-notice .moowoodle-vulomail-desc { margin-top: 2px; color: #50575e; font-size: 13px; line-height: 1.5; }
			#wpbody .moowoodle-vulomail-notice .moowoodle-vulomail-actions { display: flex; flex: none; align-items: center; gap: 16px; }
			#wpbody .moowoodle-vulomail-notice .moowoodle-vulomail-install { margin: 0; border-color: #5007aa; background: #5007aa; color: #fff; font-weight: 600; text-decoration: none; }
			#wpbody .moowoodle-vulomail-notice .moowoodle-vulomail-install:hover,
			#wpbody .moowoodle-vulomail-notice .moowoodle-vulomail-install:focus { border-color: #3f0588; background: #3f0588; color: #fff; }
			#wpbody .moowoodle-vulomail-notice .moowoodle-vulomail-learn { display: inline-flex; align-items: center; gap: 2px; color: #5007aa; font-weight: 600; text-decoration: none; }
			#wpbody .moowoodle-vulomail-notice .moowoodle-vulomail-learn:hover { text-decoration: underline; }
			#wpbody .moowoodle-vulomail-notice .moowoodle-vulomail-learn .dashicons { width: 16px; height: 16px; font-size: 16px; }
			@media (max-width: 782px) {
				#wpbody .moowoodle-vulomail-notice { flex-wrap: wrap; align-items: flex-start; }
				#wpbody .moowoodle-vulomail-notice .moowoodle-vulomail-body { flex-basis: calc(100% - 60px); }
				#wpbody .moowoodle-vulomail-notice .moowoodle-vulomail-actions { flex-basis: 100%; padding-left: 60px; }
			}
		';
	}

	/**
	 * Check whether the admin notice should be displayed.
	 *
	 * @param string $notice_type Notice type.
	 * @return bool
	 */
	private function should_display_notice( $notice_type ) {
		$dismissed_at = (int) get_option( Util::MOOWOODLE_OTHER_SETTINGS[ $notice_type ], 0 );

		return ! $dismissed_at || ( time() - $dismissed_at ) >= YEAR_IN_SECONDS;
	}

	/**
	 * Check whether VuloMail is active on this site or network.
	 *
	 * @return bool
	 */
	private function is_vulomail_active() {
		return in_array( 'vulomail/vulomail.php', $this->get_active_plugin_files(), true );
	}

	/**
	 * Get the plugin files active on this site, including network-activated ones.
	 *
	 * @return string[]
	 */
	private function get_active_plugin_files() {
		$active_plugins = (array) get_option( 'active_plugins', array() );

		if ( is_multisite() ) {
			$network_plugins = array_keys( (array) get_site_option( 'active_sitewide_plugins', array() ) );
			$active_plugins  = array_unique( array_merge( $active_plugins, $network_plugins ) );
		}

		return $active_plugins;
	}

	/**
	 * Display admin notice for unsupported WooCommerce extensions
	 * in MooWoodle free version.
	 *
	 * @return void
	 */
	public function display_unsupported_extension_notice() {
		if ( Util::is_khali_dabba() ) {
			return;
		}

		$restricted_extensions = array(
			'woocommerce-subscriptions/woocommerce-subscriptions.php'     => 'WooCommerce Subscription',
			'woocommerce-product-bundles/woocommerce-product-bundles.php' => 'WooCommerce Product Bundles',
		);

		$active_plugins = $this->get_active_plugin_files();

		$active_pro_only_extensions = array();
		foreach ( $restricted_extensions as $plugin_file => $plugin_name ) {
			if ( in_array( $plugin_file, $active_plugins, true ) ) {
				$active_pro_only_extensions[] = $plugin_name;
			}
		}

		if ( empty( $active_pro_only_extensions ) ) {
			return;
		}

		$message = sprintf(
			esc_html(
				/* translators: %s: Plugin names */
				_n(
					'%s is supported only in MooWoodle Pro.',
					'%s are supported only in MooWoodle Pro.',
					count( $active_pro_only_extensions ),
					'moowoodle'
				)
			),
			esc_html( implode( ', ', $active_pro_only_extensions ) )
		);

		?>
		<div class="notice notice-warning is-dismissible">
			<p>
				<?php echo esc_html( $message ); ?>
				<a href="<?php echo esc_url( $this->pro_upgrade_url ); ?>" target="_blank" rel="noopener noreferrer">
					<?php esc_html_e( 'Upgrade to MooWoodle Pro', 'moowoodle' ); ?>
				</a>
			</p>
		</div>
		<?php
	}
}
