<?php
/**
 * MultiVendorX Commission Abilities controller.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Abilities\AbilitiesApi;

use MultiVendorX\Commission\CommissionUtil;
use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Commission Abilities controller.
 */
class Commissions {

    /**
     * Register MultiVendorX commission abilities.
     *
     * @return void
     */
    public function register_abilities() {
        wp_register_ability(
            'multivendorx/get-commission-summary',
            array(
                'label'               => __( 'Get Commission Summary', 'multivendorx' ),
                'description'         => __( 'Commission summary for a specific store, or every store when store_id is omitted.', 'multivendorx' ),
                'category'            => 'multivendorx',
                'input_schema'        => array(
                    'type'       => 'object',
                    'properties' => array(
                        'store_id'   => array(
                            'type'        => 'integer',
                            'description' => __( 'Store ID. Omit for every store (admin only).', 'multivendorx' ),
                        ),
                        'start_date' => array(
                            'type'        => 'string',
                            'description' => __( 'Start date (Y-m-d).', 'multivendorx' ),
                        ),
                        'end_date'   => array(
                            'type'        => 'string',
                            'description' => __( 'End date (Y-m-d).', 'multivendorx' ),
                        ),
                    ),
                ),
                'output_schema'       => array( 'type' => 'object' ),
                'execute_callback'    => array( $this, 'get_commission_summary' ),
                'permission_callback' => array( $this, 'store_permissions_check' ),
                'meta'                => array( 'public' => true ),
            )
        );
    }

    /**
     * No store_id -> active_store, then admin only if that's empty too.
     *
     * @param array $input Ability input.
     * @return bool
     */
    public function store_permissions_check( $input ) {
        $store_id = $input['store_id'] ?? (int) MultiVendorX()->active_store;

        if ( ! empty( $store_id ) ) {
            return StoreUtil::current_user_can_manage_store( $store_id );
        }

        return Utill::current_user_has_capability( array( 'manage_options' ) );
    }

    /**
     * Retrieve a commission summary - a specific store's, or every store's.
     *
     * @param array $input Ability input.
     * @return array
     */
    public function get_commission_summary( $input ) {
        $store_id = $input['store_id'] ?? (int) MultiVendorX()->active_store;

        $args = array_filter(
            array(
                'start_date' => $input['start_date'] ?? null,
                'end_date'   => $input['end_date'] ?? null,
            )
        );

        return CommissionUtil::get_commission_summary_for_store( (int) $store_id, false, null, null, $args );
    }
}
