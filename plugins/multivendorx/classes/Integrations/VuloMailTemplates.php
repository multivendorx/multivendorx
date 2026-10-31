<?php
/**
 * VuloMail email templates integration class.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Integrations;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Registers MultiVendorX's emails with VuloMail's template registry: one template per event listed
 * under Settings > Notification > Event Rules, named `multivendorx/<event-key>`, plus the Sales Report.
 *
 * The emails stay in MultiVendorX. VuloMail only shows the editor; it reads an email through
 * `load_callback` and hands the edited email back to `save_callback`, which writes it to the event's
 * own row, so a change to where or how an event stores its email is made here.
 *
 * @class       VuloMailTemplates class
 * @version     5.0.21
 * @author      MultiVendorX
 */
class VuloMailTemplates {

	/**
	 * VuloMail's category slug for this plugin's templates.
	 */
	const CATEGORY = 'multivendorx';

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_filter( 'vulomail_email_template_categories', array( $this, 'register_category' ) );
		add_filter( 'vulomail_email_templates', array( $this, 'register_templates' ) );
	}

	/**
	 * @param array $categories Category slug => label.
	 * @return array
	 */
	public function register_category( $categories ) {
		$categories[ self::CATEGORY ] = 'MultiVendorX';

		return $categories;
	}

	/**
	 * The template name for an event key.
	 *
	 * @param string $event_key Event key, such as `store_pending_approval`.
	 * @return string
	 */
	public static function template_name( $event_key ) {
		return self::CATEGORY . '/' . str_replace( '_', '-', sanitize_key( $event_key ) );
	}

	/**
	 * The event key behind a template name, '' for a template that isn't an event.
	 *
	 * @param string $name Template name.
	 * @return string
	 */
	public static function event_key( $name ) {
		$slug = (string) substr( (string) strstr( $name, '/' ), 1 );

		return str_replace( '-', '_', $slug );
	}

	/**
	 * @param array $templates Registered templates.
	 * @return array
	 */
	public function register_templates( $templates ) {
		$events = (array) MultiVendorX()->notifications->default_events();

		foreach ( $events as $key => $event ) {
			if ( empty( $event['name'] ) ) {
				continue;
			}

			$templates[ self::template_name( $key ) ] = array(
				'title'         => $event['name'],
				'description'   => (string) ( $event['desc'] ?? '' ),
				'category'      => self::CATEGORY,
				'icon'             => 'mail',
				'group'            => $this->group_label( (string) ( $event['tag'] ?? '' ) ),
				'recipients'       => $this->recipients( $event ),
				'subject'          => (string) ( $event['email_subject'] ?? '' ),
				'content'          => (string) ( $event['email_body'] ?? '' ),
				'load_callback'    => array( $this, 'load_event' ),
				'save_callback'    => array( $this, 'save_event' ),
				'enabled_callback' => array( $this, 'is_event_enabled' ),
				'toggle_callback'  => array( $this, 'toggle_event' ),
			);
		}

		$templates[ self::CATEGORY . '/sales-report' ] = array(
			'title'         => __( 'Sales Report', 'multivendorx' ),
			'description'   => __( 'Your weekly sales summary, sent to stores.', 'multivendorx' ),
			'category'      => self::CATEGORY,
			'icon'          => 'mail',
			'group'         => __( 'General', 'multivendorx' ),
			'recipients'    => array( 'store' ),
			'subject'       => __( 'Your weekly sales summary from {siteName}', 'multivendorx' ),
			'file'          => MultiVendorX()->plugin_path . 'templates/email/sales-report.json',
			'load_callback' => array( $this, 'load_customizer' ),
			'save_callback' => array( $this, 'save_customizer' ),
		);

		return $templates;
	}

	/**
	 * The section an event is listed under, from its tag. Events with no tag are General.
	 *
	 * @param string $tag Event tag.
	 * @return string
	 */
	private function group_label( $tag ) {
		$labels = array(
			'Store'         => __( 'Store account', 'multivendorx' ),
			'Order'         => __( 'Orders', 'multivendorx' ),
			'Shipping'      => __( 'Shipping', 'multivendorx' ),
			'Refund'        => __( 'Refunds', 'multivendorx' ),
			'Review'        => __( 'Reviews', 'multivendorx' ),
			'Product'       => __( 'Products', 'multivendorx' ),
			'Payment'       => __( 'Payments', 'multivendorx' ),
			'Report'        => __( 'Reports', 'multivendorx' ),
			'System'        => __( 'General', 'multivendorx' ),
			'Follower'      => __( 'Followers', 'multivendorx' ),
			'Wholesale'     => __( 'Wholesale', 'multivendorx' ),
			'Store Support' => __( 'Store support', 'multivendorx' ),
		);

		return $labels[ $tag ] ?? __( 'General', 'multivendorx' );
	}

	/**
	 * Who an event is sent to, from the event's own recipient switches.
	 *
	 * @param array $event Event definition.
	 * @return string[]
	 */
	private function recipients( array $event ) {
		$out = array();

		foreach ( array( 'store', 'customer', 'admin' ) as $who ) {
			if ( ! empty( $event[ $who . '_enabled' ] ) ) {
				$out[] = $who;
			}
		}

		return $out;
	}

	/**
	 * Whether an event's email channel is switched on, as on the Event Rules screen.
	 *
	 * @param string $name Template name.
	 * @return bool
	 */
	public function is_event_enabled( $name ) {
		global $wpdb;

		$table = $wpdb->prefix . Utill::TABLES['system_events'];

		return (bool) $wpdb->get_var( $wpdb->prepare( 'SELECT email_enabled FROM %i WHERE system_action = %s', $table, self::event_key( $name ) ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
	}

	/**
	 * Switches an event's email channel, the same switch Event Rules has.
	 *
	 * @param string $name    Template name.
	 * @param bool   $enabled Whether the email is on.
	 * @return bool
	 */
	public function toggle_event( $name, $enabled ) {
		global $wpdb;

		$table = $wpdb->prefix . Utill::TABLES['system_events'];

		return false !== $wpdb->update( $table, array( 'email_enabled' => $enabled ? 1 : 0 ), array( 'system_action' => self::event_key( $name ) ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
	}

	/**
	 * The saved email of an event, from its row in the system events table.
	 *
	 * @param string $name Template name.
	 * @return array
	 */
	public function load_event( $name ) {
		global $wpdb;

		$table = $wpdb->prefix . Utill::TABLES['system_events'];
		$row   = $wpdb->get_row( $wpdb->prepare( 'SELECT email_subject, email_body FROM %i WHERE system_action = %s', $table, self::event_key( $name ) ), ARRAY_A ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		if ( ! $row ) {
			return array();
		}

		return array(
			'subject' => (string) $row['email_subject'],
			'content' => (string) $row['email_body'],
		);
	}

	/**
	 * Writes an edited email to the event's row.
	 *
	 * @param string $name Template name.
	 * @param array  $data `subject` and `content`.
	 * @return bool
	 */
	public function save_event( $name, $data ) {
		global $wpdb;

		$table   = $wpdb->prefix . Utill::TABLES['system_events'];
		$updated = $wpdb->update( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
			$table,
			array(
				'email_subject' => $data['subject'],
				'email_body'    => $data['content'],
			),
			array( 'system_action' => self::event_key( $name ) )
		);

		return false !== $updated;
	}

	/**
	 * The Sales Report as saved by the old Email Template Customizer, else the shipped one.
	 *
	 * @return array
	 */
	public function load_customizer() {
		$stored = get_option( Utill::MULTIVENDORX_SETTINGS['email-template-customizer'], array() );
		$saved  = $stored['email_templates']['emailTemplates'][0]['blocks'] ?? array();

		return empty( $saved ) ? array() : array( 'blocks' => $saved );
	}

	/**
	 * Keeps the Sales Report where the customizer always stored it.
	 *
	 * @param string $name Template name.
	 * @param array  $data `blocks` in the editor's block format.
	 * @return bool
	 */
	public function save_customizer( $name, $data ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found
		update_option(
			Utill::MULTIVENDORX_SETTINGS['email-template-customizer'],
			array(
				'email_templates' => array(
					'emailTemplates'        => array(
						array(
							'id'     => 'store-registration',
							'name'   => __( 'Sales Report', 'multivendorx' ),
							'blocks' => $data['blocks'],
						),
					),
					'activeEmailTemplateId' => 'store-registration',
				),
			)
		);

		return true;
	}
}
