<?php
/**
 * MultiVendorX Transaction Abilities controller.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Abilities\AbilitiesApi;

use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Transaction Abilities controller.
 */
class Transactions {

    /**
     * Register MultiVendorX transaction abilities.
     *
     * @return void
     */
    public function register_abilities() {
        wp_register_ability(
            'multivendorx/get-transactions',
            array(
                'label'               => __( 'Get Transactions', 'multivendorx' ),
                'description'         => __( 'Transactions for a specific store, or every store when store_id is omitted.', 'multivendorx' ),
                'category'            => 'multivendorx',
                'input_schema'        => array(
                    'type'       => 'object',
                    'properties' => array(
                        'store_id' => array(
                            'type'        => 'integer',
                            'description' => __( 'Store ID. Omit for every store (admin only).', 'multivendorx' ),
                        ),
                        'limit'    => array(
                            'type'        => 'integer',
                            'description' => __( 'Number of transactions to return.', 'multivendorx' ),
                        ),
                    ),
                ),
                'output_schema'       => array(
                    'type'  => 'array',
                    'items' => array(
                        'type'       => 'object',
                        'properties' => array(
                            'id'               => array( 'type' => 'integer' ),
                            'amount'           => array( 'type' => 'string' ),
                            'balance'          => array( 'type' => 'string' ),
                            'status'           => array( 'type' => 'string' ),
                            'transaction_type' => array( 'type' => 'string' ),
                            'created_at'       => array( 'type' => 'string' ),
                        ),
                    ),
                ),
                'execute_callback'    => array( $this, 'get_transactions' ),
                'permission_callback' => array( $this, 'store_permissions_check' ),
                'meta'                => array( 'public' => true ),
            )
        );
    }

    /**
     * No store_id -> admin only. A store_id -> scoped to that store.
     *
     * @param array $input Ability input.
     * @return bool
     */
    public function store_permissions_check( $input ) {
        if ( ! empty( $input['store_id'] ) ) {
            return StoreUtil::current_user_can_manage_store( $input['store_id'] );
        }

        return Utill::current_user_has_capability( array( 'manage_options' ) );
    }

    /**
     * Retrieve transactions - a specific store's, or every store's.
     *
     * @param array $input Ability input.
     * @return \WP_REST_Response|\WP_Error
     */
    public function get_transactions( $input ) {
        return MultiVendorX()->rest->transaction->prepare_get_items_response( (array) $input );
    }
}
