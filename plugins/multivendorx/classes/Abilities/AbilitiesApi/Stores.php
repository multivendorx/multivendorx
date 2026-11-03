<?php
/**
 * MultiVendorX Store Abilities controller.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Abilities\AbilitiesApi;

use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Store Abilities controller.
 */
class Stores {

    /**
     * Register MultiVendorX store abilities.
     *
     * @return void
     */
    public function register_abilities() {
        wp_register_ability(
            'multivendorx/get-stores',
            array(
                'label'               => __( 'Get Stores', 'multivendorx' ),
                'description'         => __( 'Retrieve a specific MultiVendorX store when store_id is given, otherwise the full store list.', 'multivendorx' ),
                'category'            => 'multivendorx',
                'input_schema'        => array(
                    'type'       => 'object',
                    'properties' => array(
                        'store_id'      => array(
                            'type'        => 'integer',
                            'description' => __( 'Store ID. Omit to list all stores.', 'multivendorx' ),
                        ),
                        'filter_status' => array(
                            'type'        => 'string',
                            'description' => __( 'Filter stores by status.', 'multivendorx' ),
                        ),
                        'search_value'  => array(
                            'type'        => 'string',
                            'description' => __( 'Search stores by name.', 'multivendorx' ),
                        ),
                    ),
                ),
                'execute_callback'    => array( $this, 'get_stores' ),
                'permission_callback' => array( $this, 'store_permissions_check' ),
                'meta'                => array( 'public' => true ),
            )
        );

        wp_register_ability(
            'multivendorx/update-store',
            array(
                'label'               => __( 'Update Store', 'multivendorx' ),
                'description'         => __( 'Update a MultiVendorX store\'s details.', 'multivendorx' ),
                'category'            => 'multivendorx',
                'input_schema'        => array(
                    'type'                 => 'object',
                    'properties'           => array(
                        'store_id' => array(
                            'type'        => 'integer',
                            'description' => __( 'Store ID.', 'multivendorx' ),
                        ),
                        'data'     => array(
                            'type'        => 'object',
                            'description' => __( 'Store fields to update (e.g. description). Admin-only fields are ignored for non-admin callers.', 'multivendorx' ),
                        ),
                    ),
                    'required'             => array( 'store_id', 'data' ),
                    'additionalProperties' => false,
                ),
                'execute_callback'    => array( $this, 'update_store' ),
                'permission_callback' => array( $this, 'store_permissions_check' ),
                'meta'                => array( 'public' => true ),
            )
        );
    }

    /**
     * Permission check shared by both abilities.
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
     * Get a specific store when store_id is given, otherwise the store list.
     *
     * @param array $input Ability input.
     * @return array|\WP_Error
     */
    public function get_stores( $input ) {
        $store_id = $input['store_id'] ?? (int) MultiVendorX()->active_store;

        $response = ! empty( $store_id )
            ? MultiVendorX()->rest->store->prepare_get_item_response( array( 'id' => (int) $store_id ) )
            : MultiVendorX()->rest->store->prepare_get_items_response( (array) $input );

        return Utill::ability_response( $response );
    }

    /**
     * Update a store's details.
     *
     * @param array $input Ability input.
     * @return array|\WP_Error
     */
    public function update_store( $input ) {
        $store_id = $input['store_id'] ?? (int) MultiVendorX()->active_store;

        $params = array(
            'id'   => (int) $store_id,
            'data' => (array) ( $input['data'] ?? array() ),
        );

        $response = MultiVendorX()->rest->store->prepare_update_item_response( $params );

        return Utill::ability_response( $response );
    }
}
