<?php
/**
 * MultiVendorX Store Abilities controller.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Abilities\AbilitiesApi;

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
                'permission_callback' => array( Utill::class, 'store_permissions_check' ),
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
                'permission_callback' => array( Utill::class, 'store_permissions_check' ),
                'meta'                => array( 'public' => true ),
            )
        );
    }

    /**
     * Get a specific store when store_id is given, otherwise the store list.
     *
     * @param array $input Ability input.
     * @return array|\WP_Error
     */
    public function get_stores( $input ) {
        $input['store_id'] = Utill::resolve_ability_store_id( $input );

        $response = ! empty( $input['store_id'] )
            ? MultiVendorX()->rest->store->prepare_get_item_response( array( 'id' => (int) $input['store_id'] ) )
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
        $input['store_id'] = Utill::resolve_ability_store_id( $input );

        $params = array(
            'id'   => (int) $input['store_id'],
            'data' => (array) ( $input['data'] ?? array() ),
        );

        $response = MultiVendorX()->rest->store->prepare_update_item_response( $params );

        return Utill::ability_response( $response );
    }
}
