<?php
/**
 * Communications class file.
 *
 * @package Notifima
 */

namespace Notifima\Discovery;

use MultivendorX\Engagement\Engagement;

defined( 'ABSPATH' ) || exit;

/**
 * Promotes VuloMail to administrators who haven't installed it yet.
 *
 * @version     3.1.9
 * @package     Notifima
 */
class Communications {

	const NOTICE_ID = 'notifima_vulomail_promotion';

	/**
	 * Requests the VuloMail promotion notice from the shared framework, if available.
	 */
	public function __construct() {
		if ( ! class_exists( Engagement::class ) ) {
			return;
		}

		add_action( 'init', array( $this, 'request_vulomail_notice' ) );
	}

	/**
	 * Request the VuloMail promotion notice. NoticeManager handles whether it's actually
	 * eligible to show right now (not dismissed, within frequency/cooldown) - this just
	 * supplies content and the one real precondition (VuloMail not already active).
	 */
	public function request_vulomail_notice() {
		if ( ! is_admin() || $this->is_vulomail_active() ) {
			return;
		}

		$install_url = wp_nonce_url( self_admin_url( 'update.php?action=install-plugin&plugin=vulomail' ), 'install-plugin_vulomail' );

		Engagement::instance()->notices()->request(
			array(
				'id'        => self::NOTICE_ID,
				'type'      => 'product_discovery',
				'source'    => 'notifima',
				'priority'  => 80,
				'content'   => array(
					'title'       => __( 'Improve your email deliverability with VuloMail', 'notifima' ),
					'description' => __( 'Track outgoing emails, monitor email delivery, and quickly identify failed notifications with VuloMail.', 'notifima' ),
					'layout'      => 'card',
				),
				'actions'   => array(
					array(
						'id'    => 'install',
						'label' => __( 'Install VuloMail', 'notifima' ),
						'type'  => 'url',
						'url'   => $install_url,
					),
					array(
						'id'    => 'learn_more',
						'label' => __( 'Learn more', 'notifima' ),
						'type'  => 'url',
						'url'   => 'https://vulomail.com/',
					),
					array(
						'id'    => 'dismiss',
						'label' => __( 'Dismiss', 'notifima' ),
						'type'  => 'dismiss',
					),
				),
				'frequency' => array(
					'max_impressions' => 1,
					'cooldown_days'   => 365,
				),
			)
		);
	}

	/**
	 * Check whether VuloMail is active on this site or network - is_plugin_active() already
	 * checks both site and network activation, so there's no need to manually merge
	 * `active_plugins`/`active_sitewide_plugins` the way Tracker::get_tracking_payload() does
	 * for its full plugin list (a different need - every plugin, not one specific slug).
	 *
	 * @return bool
	 */
	private function is_vulomail_active() {
		if ( ! function_exists( 'is_plugin_active' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		return is_plugin_active( 'vulomail/vulomail.php' );
	}
}
