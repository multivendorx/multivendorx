<?php
/**
 * Weekly sales report email.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Notifications;

use MultiVendorX\Utill;
use MultiVendorX\Store\StoreUtil;

defined( 'ABSPATH' ) || exit;

/**
 * Renders the "Sales Report" email template saved from the Email Template
 * Customizer, fills its `{tags}` with a store's real numbers, and sends it
 * to every active store once a week.
 *
 * @class       SalesReportEmail
 * @version     5.0.0
 * @author      MultiVendorX
 */
class SalesReportEmail {

	const TEMPLATE_ID = 'store-registration';
	const CRON_HOOK   = 'multivendorx_send_weekly_sales_report';

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( self::CRON_HOOK, array( $this, 'send_weekly_reports' ) );

		if ( ! wp_next_scheduled( self::CRON_HOOK ) ) {
			wp_schedule_event( time() + DAY_IN_SECONDS, 'weekly', self::CRON_HOOK );
		}
	}

	/**
	 * Cron callback: email last week's report to every active store.
	 *
	 * @return void
	 */
	public function send_weekly_reports() {
		$period_end   = time();
		$period_start = $period_end - WEEK_IN_SECONDS;

		foreach ( StoreUtil::get_stores() as $store ) {
			if ( 'active' !== $store['status'] ) {
				continue;
			}
			$this->send_report( (int) $store['ID'], $period_start, $period_end );
		}
	}

	/**
	 * Build and send one store's report.
	 *
	 * @param int $store_id     Store id.
	 * @param int $period_start Period start (unix time).
	 * @param int $period_end   Period end (unix time).
	 * @return bool Whether wp_mail accepted the message.
	 */
	public function send_report( $store_id, $period_start, $period_end ) {
		$owner_id = StoreUtil::get_primary_owner( $store_id );
		$owner    = $owner_id ? get_userdata( $owner_id ) : false;
		if ( ! $owner ) {
			return false;
		}

		$store_rows = StoreUtil::get_store_information( array( 'ID' => $store_id ) );
		$store_name = $store_rows[0]['name'] ?? '';

		$tags = $this->get_tag_values( $store_id, $store_name, $owner, $period_start, $period_end );
		$html = $this->render_email( $this->get_template_blocks(), $tags );

		/* translators: %s: store name. */
		$subject = sprintf( __( 'Your weekly sales report for %s', 'multivendorx' ), $store_name );

		return wp_mail(
			$owner->user_email,
			$subject,
			$html,
			array( 'Content-Type: text/html; charset=UTF-8' )
		);
	}

	/**
	 * Saved Sales Report blocks, or the built-in default when never edited.
	 *
	 * @return array
	 */
	private function get_template_blocks() {
		$saved = MultiVendorX()->setting->get_setting( 'email_templates', array() );

		foreach ( (array) ( $saved['emailTemplates'] ?? array() ) as $template ) {
			if ( ( $template['id'] ?? '' ) === self::TEMPLATE_ID && ! empty( $template['blocks'] ) ) {
				return $template['blocks'];
			}
		}

		return $this->get_default_blocks();
	}

	/**
	 * Real values for every `{tag}` the template can use.
	 *
	 * @param int      $store_id     Store id.
	 * @param string   $store_name   Store name.
	 * @param \WP_User $owner        Store owner.
	 * @param int      $period_start Period start.
	 * @param int      $period_end   Period end.
	 * @return array Map of `{tag}` => plain-text value.
	 */
	private function get_tag_values( $store_id, $store_name, $owner, $period_start, $period_end ) {
		global $wpdb;

		$table = $wpdb->prefix . Utill::TABLES['commission'];
		$totals = $wpdb->get_row( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->prepare(
				'SELECT COUNT(DISTINCT order_id) AS orders, COALESCE(SUM(total_order_value),0) AS sales,
					COALESCE(SUM(marketplace_commission),0) AS commission, COALESCE(SUM(store_payable),0) AS earnings,
					COALESCE(SUM(store_refunded),0) AS refunds
				FROM %i WHERE store_id = %d AND created_at BETWEEN %s AND %s',
				$table,
				$store_id,
				gmdate( 'Y-m-d H:i:s', $period_start ),
				gmdate( 'Y-m-d H:i:s', $period_end )
			),
			ARRAY_A
		);

		$sales      = (float) ( $totals['sales'] ?? 0 );
		$commission = (float) ( $totals['commission'] ?? 0 );
		$earnings   = (float) ( $totals['earnings'] ?? 0 );
		$refunds    = (float) ( $totals['refunds'] ?? 0 );
		$rate       = $sales > 0 ? round( $commission / $sales * 100, 1 ) : 0;
		$date_fmt   = get_option( 'date_format' );

		$money = static function ( $amount ) {
			return html_entity_decode( wp_strip_all_tags( wc_price( $amount ) ), ENT_QUOTES, 'UTF-8' );
		};

		return array(
			'{storeName}'        => $store_name,
			'{storeEmail}'       => $owner->user_email,
			'{userName}'         => $owner->display_name,
			'{userEmail}'        => $owner->user_email,
			'{siteName}'         => get_bloginfo( 'name' ),
			'{date}'             => wp_date( $date_fmt ),
			'{periodStart}'      => wp_date( $date_fmt, $period_start ),
			'{periodEnd}'        => wp_date( $date_fmt, $period_end ),
			'{totalOrders}'      => (string) (int) ( $totals['orders'] ?? 0 ),
			'{totalSales}'       => $money( $sales ),
			'{storeEarnings}'    => $money( $earnings ),
			'{commissionRate}'   => $rate . '%',
			'{commissionAmount}' => $money( $commission ),
			'{totalRefunds}'     => $money( $refunds ),
			'{netEarnings}'      => $money( max( 0, $earnings - $refunds ) ),
		);
	}

	/**
	 * Turn template blocks into email HTML with tags replaced.
	 *
	 * @param array $blocks Template blocks (builder's saved shape).
	 * @param array $tags   `{tag}` => value map.
	 * @return string
	 */
	public function render_email( $blocks, $tags ) {
		$safe_tags = array_map( 'esc_html', $tags );
		$body      = '';
		foreach ( $blocks as $block ) {
			$body .= $this->render_block( (array) $block, $safe_tags );
		}

		// A fragment, not a full document: the mail layer (WooCommerce / mail
		// plugins) already wraps content in <html><body>, and nesting a second
		// one breaks the markup. Table layout + inline styles keep it intact
		// across mail clients.
		return '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#f1f1f4;font-family:Arial,Helvetica,sans-serif;"><tr><td align="center" style="padding:24px;">'
			. '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;"><tr><td>'
			. $body
			. '</td></tr></table></td></tr></table>';
	}

	/**
	 * Render one block (recursing into columns).
	 *
	 * @param array $block     Block.
	 * @param array $safe_tags Escaped tag values.
	 * @return string
	 */
	private function render_block( $block, $safe_tags ) {
		$style = $this->css( (array) ( $block['style'] ?? array() ) );
		$type  = $block['type'] ?? '';

		switch ( $type ) {
			case 'heading':
				$level = min( 6, max( 1, (int) ( $block['level'] ?? 2 ) ) );
				$text  = strtr( esc_html( (string) ( $block['text'] ?? '' ) ), $safe_tags );
				return sprintf( '<h%1$d style="margin:0;%2$s">%3$s</h%1$d>', $level, esc_attr( $style ), $text );

			case 'richtext':
				$html = strtr( (string) ( $block['html'] ?? '' ), $safe_tags );
				return sprintf( '<div style="%s">%s</div>', esc_attr( $style ), wp_kses_post( $html ) );

			case 'divider':
				return sprintf( '<div style="%s"><hr style="border:0;border-top:1px solid #e2e8f0;margin:0;"></div>', esc_attr( $style ) );

			case 'image':
				return sprintf( '<div style="%s"><img src="%s" alt="%s" style="max-width:100%%;"></div>', esc_attr( $style ), esc_url( (string) ( $block['src'] ?? '' ) ), esc_attr( (string) ( $block['alt'] ?? '' ) ) );

			case 'button':
				return sprintf(
					'<div style="%s"><a href="%s" style="display:inline-block;padding:10px 20px;background:#4f0cae;color:#ffffff;text-decoration:none;border-radius:4px;">%s</a></div>',
					esc_attr( $style ),
					esc_url( (string) ( $block['url'] ?? '' ) ),
					strtr( esc_html( (string) ( $block['text'] ?? '' ) ), $safe_tags )
				);

			case 'columns':
				$columns = (array) ( $block['columns'] ?? array() );
				if ( ! $columns ) {
					return '';
				}
				$width = round( 100 / count( $columns ), 2 );
				$cells = '';
				foreach ( $columns as $column ) {
					$inner = '';
					foreach ( (array) $column as $child ) {
						$inner .= $this->render_block( (array) $child, $safe_tags );
					}
					$cells .= sprintf( '<td valign="top" width="%1$s%%" style="width:%1$s%%;">%2$s</td>', $width, $inner );
				}
				// Margins and padding go on a wrapper: a 100%-wide table plus its own
				// margin/padding overflows, and many mail clients ignore them on <table>.
				$spacing = array();
				foreach ( array( 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft' ) as $spacing_key ) {
					if ( isset( $block['style'][ $spacing_key ] ) ) {
						$spacing[ $spacing_key ] = $block['style'][ $spacing_key ];
						unset( $block['style'][ $spacing_key ] );
					}
				}
				return sprintf(
					'<div style="%s"><table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="width:100%%;table-layout:fixed;%s"><tr>%s</tr></table></div>',
					esc_attr( $this->css( $spacing ) ),
					esc_attr( $this->css( (array) ( $block['style'] ?? array() ) ) ),
					$cells
				);
		}

		return '';
	}

	/**
	 * Builder style object -> inline CSS.
	 *
	 * @param array $style Style object.
	 * @return string
	 */
	private function css( $style ) {
		$px  = array(
			'fontSize'      => 'font-size',
			'paddingTop'    => 'padding-top',
			'paddingRight'  => 'padding-right',
			'paddingBottom' => 'padding-bottom',
			'paddingLeft'   => 'padding-left',
			'marginTop'     => 'margin-top',
			'marginRight'   => 'margin-right',
			'marginBottom'  => 'margin-bottom',
			'marginLeft'    => 'margin-left',
			'borderRadius'  => 'border-radius',
		);
		$raw = array(
			'lineHeight' => 'line-height',
			'fontWeight' => 'font-weight',
			'textAlign'  => 'text-align',
			'color'      => 'color',
			'backgroundColor' => 'background-color',
		);

		$css = '';
		foreach ( $px as $key => $property ) {
			if ( isset( $style[ $key ] ) && is_numeric( $style[ $key ] ) ) {
				$css .= $property . ':' . (float) $style[ $key ] . 'px;';
			}
		}
		foreach ( $raw as $key => $property ) {
			if ( isset( $style[ $key ] ) && '' !== $style[ $key ] ) {
				$css .= $property . ':' . preg_replace( '/[^#a-zA-Z0-9.\-,() ]/', '', (string) $style[ $key ] ) . ';';
			}
		}

		return $css;
	}

	/**
	 * Built-in Sales Report layout, used until an admin saves their own.
	 * Mirrors src/assets/template/emailTemplate/salesReport.tsx.
	 *
	 * @return array
	 */
	private function get_default_blocks() {
		$row = static function ( $label, $value, $color = '#2d3748' ) {
			return array(
				'type'    => 'columns',
				'style'   => array(
					'paddingTop'    => 12,
					'paddingBottom' => 12,
					'paddingLeft'   => 24,
					'paddingRight'  => 24,
				),
				'columns' => array(
					array( array( 'type' => 'richtext', 'html' => $label, 'style' => array( 'color' => '#4a5568', 'fontSize' => 15 ) ) ),
					array( array( 'type' => 'richtext', 'html' => $value, 'style' => array( 'color' => $color, 'fontSize' => 15, 'fontWeight' => 600, 'textAlign' => 'right' ) ) ),
				),
			);
		};
		$stat = static function ( $value, $label, $color = '#2d3748' ) {
			return array(
				array( 'type' => 'heading', 'text' => $value, 'level' => 2, 'style' => array( 'fontSize' => 22, 'textAlign' => 'center', 'color' => $color, 'paddingTop' => 18 ) ),
				array( 'type' => 'richtext', 'html' => $label, 'style' => array( 'color' => '#718096', 'fontSize' => 13, 'textAlign' => 'center', 'paddingBottom' => 18 ) ),
			);
		};

		return array(
			array( 'type' => 'heading', 'text' => __( 'Hi {storeName},', 'multivendorx' ), 'level' => 2, 'style' => array( 'fontSize' => 20, 'paddingTop' => 28, 'paddingLeft' => 24, 'paddingRight' => 24 ) ),
			array( 'type' => 'richtext', 'html' => __( "Here's how your store performed on {siteName} this week.", 'multivendorx' ), 'style' => array( 'color' => '#4a5568', 'fontSize' => 15, 'paddingTop' => 6, 'paddingBottom' => 24, 'paddingLeft' => 24, 'paddingRight' => 24 ) ),
			array(
				'type'    => 'columns',
				'style'   => array( 'backgroundColor' => '#f7f5fc', 'marginLeft' => 24, 'marginRight' => 24 ),
				'columns' => array(
					$stat( '{totalOrders}', __( 'Total orders', 'multivendorx' ) ),
					$stat( '{totalSales}', __( 'Total sales', 'multivendorx' ) ),
					$stat( '{storeEarnings}', __( 'Your earnings', 'multivendorx' ), '#2f8a3b' ),
				),
			),
			array( 'type' => 'heading', 'text' => __( 'Earnings breakdown', 'multivendorx' ), 'level' => 3, 'style' => array( 'fontSize' => 16, 'paddingTop' => 32, 'paddingBottom' => 4, 'paddingLeft' => 24 ) ),
			$row( __( 'Total sales', 'multivendorx' ), '{totalSales}' ),
			$row( __( 'Marketplace commission ({commissionRate})', 'multivendorx' ), '−{commissionAmount}' ),
			$row( __( 'Total refunds', 'multivendorx' ), '−{totalRefunds}', '#d90d0d' ),
			$row( __( 'Net earnings', 'multivendorx' ), '{netEarnings}', '#2f8a3b' ),
			array( 'type' => 'richtext', 'html' => __( 'Your payout will be processed within 2–3 business days. Reply to this email if you have any questions.', 'multivendorx' ), 'style' => array( 'color' => '#4a5568', 'fontSize' => 15, 'paddingTop' => 24, 'paddingLeft' => 24, 'paddingRight' => 24 ) ),
			array( 'type' => 'richtext', 'html' => __( 'Best regards,', 'multivendorx' ), 'style' => array( 'color' => '#718096', 'fontSize' => 14, 'paddingTop' => 24, 'paddingLeft' => 24 ) ),
			array( 'type' => 'heading', 'text' => __( 'The {siteName} Team', 'multivendorx' ), 'level' => 4, 'style' => array( 'fontSize' => 15, 'paddingBottom' => 28, 'paddingLeft' => 24 ) ),
		);
	}
}
