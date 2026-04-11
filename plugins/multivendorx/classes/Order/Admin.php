<?php
/**
 * MultiVendorX Order Admin class
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Order;

use MultiVendorX\Commission\CommissionUtil;
use MultiVendorX\Store\Store;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Order Admin class
 *
 * @version     PRODUCT_VERSION
 * @package     MultiVendorX
 * @author      MultiVendorX
 */
class Admin {
    /**
     * Constructor
     */
    public function __construct() {
        add_filter( 'manage_woocommerce_page_wc-orders_columns', array( $this, 'shop_order_columns' ), 99 );
        add_action( 'manage_woocommerce_page_wc-orders_custom_column', array( $this, 'show_shop_order_columns' ), 99, 2 );

        add_filter( 'woocommerce_order_actions', array( $this, 'woocommerce_order_actions' ), 10, 2 );
        add_action( 'woocommerce_order_action_regenerate_order_commissions', array( $this, 'regenerate_order_commissions' ) );
        add_action( 'woocommerce_order_action_regenerate_suborders', array( $this, 'regenerate_suborders' ) );
    }

    /**
     * Add custom columns to the order list page
     *
     * @param  array $columns Columns.
     */
    public function shop_order_columns( $columns ) {

        $post_status = filter_input( INPUT_GET, 'post_status', FILTER_DEFAULT );
        $post_status = sanitize_text_field( $post_status );
        if ( empty( $post_status ) || 'trash' !== $post_status ) {
            $suborder         = array(
                'multivendorx_suborder' => __( 'Suborders', 'multivendorx' ),
            );
            $title_number_pos = array_search( 'order_number', array_keys( $columns ), true );
            $columns          = array_slice( $columns, 0, $title_number_pos + 1, true )
                    + $suborder
                    + array_slice( $columns, $title_number_pos + 1, null, true );
        }
        return $columns;
    }

    /**
     * Output custom columns for orders
     *
     * @param  string $column Column name.
     * @param  int    $post_id Post ID.
     */
    public function show_shop_order_columns( $column, $post_id ) {
        remove_filter( 'woocommerce_orders_table_query_clauses', array( $this, 'wc_order_list_filter' ) );
        switch ( $column ) {
            case 'multivendorx_suborder':
                $multivendorx_suborders = MultiVendorX()->order->get_suborders( $post_id );
                if ( $multivendorx_suborders ) {
                    echo '<ul class="mvx-order-vendor" style="margin:0;">';
                    foreach ( $multivendorx_suborders as $suborder ) {
                        if ( $suborder->get_type() === 'shop_order_refund' ) {
                            continue;
                        }
                        $store            = Store::get_store( $suborder->get_meta( Utill::POST_META_SETTINGS['store_id'], true ) );
                        $store_page_title = ( $store ) ? $store->get( 'name' ) : esc_html__( 'Deleted store', 'multivendorx' );

                        $order_uri = apply_filters( 'multivendorx_admin_store_shop_order_edit_url', esc_url( 'admin.php?page=wc-orders&action=edit&id=' . $suborder->get_id() . '' ), $suborder->get_id() );

                        printf(
                            '<li><mark class="%s tips" data-tip="%s">%s</mark> <strong><a href="%s">#%s</a></strong> &ndash; <small class="mvx-order-for-vendor">%s %s</small></li>',
                            esc_attr( sanitize_title( $suborder->get_status() ) ),
                            esc_attr( $suborder->get_status() ),
                            esc_html( $suborder->get_status() ),
                            esc_url( $order_uri ),
                            esc_html( $suborder->get_order_number() ),
                            esc_html_x( 'for', 'Order table details', 'multivendorx' ),
                            esc_html( $store_page_title )
                        );

                        do_action( 'multivendorx_after_add_suborder_details_admin', $suborder );
                    }
                    echo '</ul>';
                } else {
                    echo '<span class="na">&ndash;</span>';
                }
                break;
        }
    }

    /**
     * Add actions to the order list page
     *
     * @param  array  $actions Actions.
     * @param  object $order Order object.
     */
    public function woocommerce_order_actions( $actions, $order ) {
        if ( $order && $order->get_parent_id() ) {
            $actions['regenerate_order_commissions'] = __( 'Regenerate order commissions', 'multivendorx' );
        }
        if ( $order && ! $order->get_parent_id() ) {
            $actions['regenerate_suborders'] = __( 'Regenerate suborders', 'multivendorx' );
        }

        return $actions;
    }

	/**
	 * Regenerate order commissions
	 *
	 * @param  object $order Order object.
	 */
	public function regenerate_order_commissions( $order ) {
		global $wpdb;
		if ( ! $order->get_parent_id() ) {
			return;
		}

		$commission_id = $order->get_meta( Utill::ORDER_META_SETTINGS['commission_id'], true ) ?? '';

		if ( ! in_array( $order->get_status(), apply_filters( 'multivendorx_regenerate_order_commissions_statuses', array( 'on-hold', 'pending', 'processing', 'completed' ), $order ), true ) ) {
			return;
		}

		$order->delete_meta_data( Utill::ORDER_META_SETTINGS['commissions_processed'] );

		$regenerate_commission_id = MultiVendorX()->commission->calculate_commission( $order, $commission_id );

		$order->update_meta_data( Utill::ORDER_META_SETTINGS['commission_id'], $regenerate_commission_id );
		$order->update_meta_data( Utill::ORDER_META_SETTINGS['commissions_processed'], 'yes' );
		$order->save();

		$commission = CommissionUtil::get_commission_db( $regenerate_commission_id );

		if ( 'unpaid' !== $commission->status ) {
			$row = $wpdb->get_row( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $wpdb->prepare(
                    "SELECT *
                        FROM $wpdb->prefix . Utill::TABLES['transaction']
                        WHERE commission_id = %d",
                    $regenerate_commission_id
                )
			);

			$wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
				$wpdb->prefix . Utill::TABLES['transaction'],
				array(
					'store_id'         => $row->store_id,
					'entry_type'       => 'Dr',
					'transaction_type' => 'Reversed',
					'amount'           => $row->amount,
					'currency'         => $row->currency,
					'narration'        => 'Transaction Reversed',
					'status'           => 'Completed',
                ),
                array( '%d', '%s', '%s', '%f', '%s', '%s', '%s' )
			);

			$wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
				$wpdb->prefix . Utill::TABLES['transaction'],
				array(
					'store_id'         => $row->store_id,
					'entry_type'       => 'Cr',
					'transaction_type' => 'Commission',
					'amount'           => $commission->store_payable,
					'currency'         => $row->currency,
					'narration'        => 'Regeneate Commission received for order ' . $order->get_id(),
					'status'           => 'Completed',
                ),
                array( '%d', '%s', '%s', '%f', '%s', '%s', '%s' )
			);

			if ( ! empty( $wpdb->last_error ) && MultivendorX()->show_advanced_log ) {
				MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
			}
		}
	}

    /**
     * Regenerate suborders
     *
     * @param  object $order Order object.
     */
    public function regenerate_suborders( $order ) {
        MultiVendorX()->order->create_store_orders( $order );
    }
}
