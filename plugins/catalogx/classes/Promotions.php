<?php
/**
 * Promotions class file
 *
 * @package CatalogX
 */

namespace CatalogX;

defined( 'ABSPATH' ) || exit;

/**
 * Handles CatalogX promotional notices and plugin listing links.
 *
 * @class Promotions
 */
class Promotions {

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_filter(
			'plugin_row_meta',
			array( $this, 'plugin_row_meta' ),
			10,
			2
		);

		add_action(
			'in_plugin_update_message-woocommerce-catalog-enquiry/Woocommerce_Catalog_Enquiry.php',
			array( $this, 'catalogx_plugin_update_message' )
		);

		if ( is_admin() && ! wp_doing_ajax() ) {
			add_filter(
				'plugin_action_links_' . CatalogX()->plugin_base,
				array( $this, 'get_plugin_action_links' )
			);
		}
	}

	/**
	 * Show plugin update message for major updates.
	 *
	 * @return void
	 */
	public function catalogx_plugin_update_message() {
		if ( version_compare( get_option( 'catalogx_plugin_version' ), '6.0.0', '<' ) ) {
			?>
			<p>
				<strong><?php esc_html_e( 'Heads up!', 'catalogx' ); ?></strong>
				<?php esc_html_e( '6.0.0 is a major update. Make a full site backup before upgrading your marketplace to avoid any undesirable situations.', 'catalogx' ); ?>
			</p>
			<?php
		}
	}

	/**
	 * Add custom action links to the plugin listing.
	 *
	 * @param array $links Existing links.
	 * @return array
	 */
	public function get_plugin_action_links( $links ) {
		$plugin_links = array(
			'<a href="' .
			admin_url( 'admin.php?page=catalogx#&tab=settings&subtab=general' ) .
			'">' .
			__( 'Settings', 'catalogx' ) .
			'</a>',
		);

		$links = array_merge( $plugin_links, $links );

		if ( ! Utill::is_khali_dabba() ) {
			$links[] =
				'<a href="' .
				esc_url( CATALOGX_PRO_SHOP_URL ) .
				'" class="catalogx-pro-plugin" target="_blank" style="font-weight:700;background:linear-gradient(110deg,rgb(63,20,115) 0%,25%,rgb(175 59 116) 50%,75%,rgb(219 75 84) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">' .
				__( 'Upgrade to Pro', 'catalogx' ) .
				'</a>';
		}

		return $links;
	}

	/**
	 * Add plugin row meta links.
	 *
	 * @param array  $links Existing meta links.
	 * @param string $file Plugin file.
	 * @return array
	 */
	public function plugin_row_meta( $links, $file ) {
		if ( CatalogX()->plugin_base !== $file ) {
			return $links;
		}

		$row_meta = array(
			'docs'    => sprintf(
				'<a href="%s" target="_blank">%s</a>',
				'https://catalogx.com/docs/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx',
				esc_html__( 'Docs', 'catalogx' )
			),
			'support' => sprintf(
				'<a href="%s" target="_blank">%s</a>',
				'https://catalogx.com/support/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx',
				esc_html__( 'Support', 'catalogx' )
			),
		);

		if ( ! Utill::is_khali_dabba() ) {
			$row_meta['pro'] = sprintf(
				'<a href="%s" class="catalogx-pro-plugin" target="_blank" style="font-weight:700;background:linear-gradient(110deg,rgb(63,20,115) 0%%,25%%,rgb(175 59 116) 50%%,75%%,rgb(219 75 84) 100%%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;" title="%s">%s</a>',
				esc_url( CATALOGX_PRO_SHOP_URL ),
				esc_attr__( 'Upgrade to Pro', 'catalogx' ),
				__( 'Upgrade to Pro', 'catalogx' )
			);
		}

		return array_merge( $links, $row_meta );
	}
}