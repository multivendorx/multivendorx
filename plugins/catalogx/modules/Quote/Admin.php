<?php
/**
 * Quote module Admin class file
 *
 * @package CatalogX
 */

namespace CatalogX\Quote;

/**
 * CatalogX Quote Module Admin class
 *
 * @class       Admin class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Admin {
    /**
     * Admin class constructor functions
     */
    public function __construct() {
        add_action( 'init', array( $this, 'register_custom_order_status' ) );
        add_filter( 'wc_order_statuses', array( $this, 'add_custom_order_status_to_order_statuses' ) );
        add_filter( 'wc_order_is_editable', array( $this, 'order_is_editable' ), 10, 2 );
    }

    /**
     * Register the custom status
     */
    public function register_custom_order_status() {
        register_post_status(
            'wc-quote-new',
            array(
                'label'                     => _x( 'New Quote Request', 'Order status', 'catalogx' ),
                'public'                    => true,
                'exclude_from_search'       => false,
                'show_in_admin_all_list'    => true,
                'show_in_admin_status_list' => true,
                /* translators: %s: Number of order status as new quote. */
                'label_count'               => _n_noop( 'New Quote Request <span class="count">(%s)</span>', 'New Quote Requests <span class="count">(%s)</span>', 'catalogx' ),
            )
        );

        register_post_status(
            'wc-quote-pending',
            array(
                'label'                     => _x( 'Pending Quote', 'Order status', 'catalogx' ),
                'public'                    => true,
                'exclude_from_search'       => false,
                'show_in_admin_all_list'    => true,
                'show_in_admin_status_list' => true,
                /* translators: %s: Number of order status as pending quote. */
                'label_count'               => _n_noop( 'Pending Quote <span class="count">(%s)</span>', 'Pending Quote <span class="count">(%s)</span>', 'catalogx' ),
            )
        );

        register_post_status(
            'wc-quote-expired',
            array(
                'label'                     => _x( 'Expired Quote', 'Order status', 'catalogx' ),
                'public'                    => true,
                'exclude_from_search'       => false,
                'show_in_admin_all_list'    => true,
                'show_in_admin_status_list' => true,
                /* translators: %s: Number of order status as expired quote. */
                'label_count'               => _n_noop( 'Expired Quote <span class="count">(%s)</span>', 'Expired Quotes <span class="count">(%s)</span>', 'catalogx' ),
            )
        );

        register_post_status(
            'wc-quote-accepted',
            array(
                'label'                     => _x( 'Accepted Quote', 'Order status', 'catalogx' ),
                'public'                    => true,
                'exclude_from_search'       => false,
                'show_in_admin_all_list'    => true,
                'show_in_admin_status_list' => true,
                /* translators: %s: Number of order status as accepted quote. */
                'label_count'               => _n_noop( 'Accepted Quote <span class="count">(%s)</span>', 'Accepted Quote <span class="count">(%s)</span>', 'catalogx' ),
            )
        );

        register_post_status(
            'wc-quote-rejected',
            array(
                'label'                     => _x( 'Rejected Quote', 'Order status', 'catalogx' ),
                'public'                    => true,
                'exclude_from_search'       => false,
                'show_in_admin_all_list'    => true,
                'show_in_admin_status_list' => true,
                /* translators: %s: Number of order status as rejected quote. */
                'label_count'               => _n_noop( 'Rejected Quote <span class="count">(%s)</span>', 'Rejected Quote <span class="count">(%s)</span>', 'catalogx' ),
            )
        );
    }

    /**
     * Merge new status and old status
     *
     * @param array $order_statuses_old Existing WooCommerce order statuses.
     * @return array Modified list of order statuses including custom quote statuses.
     */
    public function add_custom_order_status_to_order_statuses( $order_statuses_old ) {
        $order_statuses['wc-quote-new']      = _x( 'New Quote Request', 'Order status', 'catalogx' );
        $order_statuses['wc-quote-pending']  = _x( 'Pending Quote', 'Order status', 'catalogx' );
        $order_statuses['wc-quote-expired']  = _x( 'Expired Quote', 'Order status', 'catalogx' );
        $order_statuses['wc-quote-accepted'] = _x( 'Accepted Quote', 'Order status', 'catalogx' );
        $order_statuses['wc-quote-rejected'] = _x( 'Rejected Quote', 'Order status', 'catalogx' );

        $new_quote = filter_input( INPUT_GET, 'new_quote', FILTER_SANITIZE_SPECIAL_CHARS );
        $page      = filter_input( INPUT_GET, 'page', FILTER_SANITIZE_SPECIAL_CHARS );
        $post_type = filter_input( INPUT_GET, 'post_type', FILTER_SANITIZE_SPECIAL_CHARS );

        if ( ( isset( $new_quote ) && $new_quote && ( isset( $page ) && 'wc-orders' === $page ) ) ||
        ( isset( $new_quote ) && $new_quote && isset( $post_type ) && 'shop_order' === $post_type ) ) {
            $new_status = array_merge( $order_statuses, $order_statuses_old );
        } else {
            $new_status = array_merge( $order_statuses_old, $order_statuses );
        }

        return $new_status;
    }

    /**
     * Make the order is editable in order-edit page
     *
     * @param bool     $editable Whether the order is editable.
     * @param WC_Order $order    The WooCommerce order object.
     * @return bool
     */
    public function order_is_editable( $editable, $order ) {
        $accepted_statuses = array(
			'quote-new',
			'quote-accepted',
			'quote-pending',
			'quote-expired',
			'quote-rejected',
		);

        if ( in_array( $order->get_status(), $accepted_statuses, true ) ) {
            return true;
        }

        return $editable;
    }
}
