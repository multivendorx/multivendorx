<?php
/**
 * Migration class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Migration;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX migration class
 *
 * @class       Cron class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Cron {
    public function __construct() {
        add_filter( 'cron_schedules', array( $this, 'custom_schedules_for_migration' ) );

        if ( ! wp_next_scheduled( 'multivendorx_order_migration' ) ) {
            wp_schedule_event( time(), 'every_5_minutes', 'multivendorx_order_migration' );
        }

        add_action( 'multivendorx_order_migration', array( $this, 'order_migration' ) );
    }

    public function custom_schedules_for_migration( $schedules ) {
        $schedules['every_5_minutes'] = array(
            'interval' => 5 * 60,
            'display'  => __( 'Every 5 Minutes', 'multivendorx' ),
        );
        return $schedules;
    }

    public function order_migration() {
        $active_plugin = Utill::get_active_multivendor();
        if ( empty( $active_plugin ) ) {
            return;
        }

        $class    = "\\MultiVendorX\\Migration\\{$active_plugin}";
        $migrator = new $class();
        $migrator->migrate_orders_and_commissions();
    }
}
