<?php
/**
 * MultiVendorX Commission Abilities controller.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Abilities\AbilitiesApi;

use MultiVendorX\Commission\CommissionUtil;
use MultiVendorX\Store\Store;
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
                'permission_callback' => array( Utill::class, 'store_permissions_check' ),
                'meta'                => array( 'public' => true ),
            )
        );
    }

    /**
     * Retrieve a commission summary - a specific store's, or every store's.
     *
     * @param array $input Ability input.
     * @return array
     */
    public function get_commission_summary( $input ) {
        $store_id = $input['store_id'] ?? 0;

        if ( empty( $store_id ) ) {
            $store_ids = Store::get_store( MultiVendorX()->current_user_id, 'user' );
            $store_id  = ! empty( $store_ids ) ? reset( $store_ids )['id'] : 0;
        }

        $args = array_filter(
            array(
                'start_date' => $input['start_date'] ?? null,
                'end_date'   => $input['end_date'] ?? null,
            )
        );

        $response = CommissionUtil::get_commission_summary_for_store( (int) $store_id, false, false, 3, $args );

        return Utill::ability_response( $response );
    }
}
