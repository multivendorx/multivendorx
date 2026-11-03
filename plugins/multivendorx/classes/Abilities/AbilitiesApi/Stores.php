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
 *
 * Doesn't re-implement store read/write logic - every execute_callback below
 * delegates into the RestAPI\Controllers\Stores controller's shared
 * `prepare_*_response()` methods (the same ones the REST `get_items()`/
 * `get_item()`/`update_item()` callbacks call), so the two surfaces can
 * never drift. That shared logic already scopes access via
 * StoreUtil::current_user_can_manage_store() - an admin can read/update any
 * store, a store owner/staff member only their own.
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
                'description'         => __( 'List MultiVendorX stores - every store for an admin, only the caller\'s own store(s) otherwise.', 'multivendorx' ),
                'category'            => 'multivendorx',
                'input_schema'        => array(
                    'type'       => 'object',
                    'properties' => array(
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
                'output_schema'       => array(
                    'type'  => 'array',
                    'items' => array( 'type' => 'object' ),
                ),
                'execute_callback'    => array( $this, 'get_stores' ),
                'permission_callback' => array( $this, 'get_stores_permissions_check' ),
                'meta'                => array( 'public' => true ),
            )
        );

        wp_register_ability(
            'multivendorx/get-store',
            array(
                'label'               => __( 'Get Store', 'multivendorx' ),
                'description'         => __( 'Retrieve a MultiVendorX store\'s details.', 'multivendorx' ),
                'category'            => 'multivendorx',
                'input_schema'        => array(
                    'type'                 => 'object',
                    'properties'           => array(
                        'store_id' => array(
                            'type'        => 'integer',
                            'description' => __( 'Store ID.', 'multivendorx' ),
                        ),
                    ),
                    'required'             => array( 'store_id' ),
                    'additionalProperties' => false,
                ),
                'output_schema'       => array(
                    'type'       => 'object',
                    'properties' => array(
                        'id'          => array( 'type' => 'integer' ),
                        'name'        => array( 'type' => 'string' ),
                        'slug'        => array( 'type' => 'string' ),
                        'description' => array( 'type' => 'string' ),
                        'status'      => array( 'type' => 'string' ),
                    ),
                ),
                'execute_callback'    => array( $this, 'get_store' ),
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
                'output_schema'       => array( 'type' => 'object' ),
                'execute_callback'    => array( $this, 'update_store' ),
                'permission_callback' => array( $this, 'store_permissions_check' ),
                'meta'                => array( 'public' => true ),
            )
        );
    }

    /**
     * Check permission to list stores. Not a blanket allow - the caller
     * still needs at least a marketplace-management capability; which
     * stores they actually get back is then scoped inside
     * prepare_get_items_response() (all of them for an admin, only their
     * own for anyone else).
     *
     * @return bool
     */
    public function get_stores_permissions_check() {
        return Utill::current_user_has_capability( array( 'manage_options', 'edit_stores' ) );
    }

    /**
     * Check whether the current user can manage the store named in the ability input.
     *
     * @param array $input Ability input.
     * @return bool
     */
    public function store_permissions_check( $input ) {
        return StoreUtil::current_user_can_manage_store( $input['store_id'] ?? 0 );
    }

    /**
     * List stores - admin sees all, non-admin sees only their own.
     *
     * @param array $input Ability input.
     * @return array|\WP_Error
     */
    public function get_stores( $input ) {
        return Utill::unwrap_ability_response( MultiVendorX()->rest->store->prepare_get_items_response( (array) $input ) );
    }

    /**
     * Retrieve a store's details.
     *
     * @param array $input Ability input.
     * @return array|\WP_Error
     */
    public function get_store( $input ) {
        $params = array( 'id' => (int) ( $input['store_id'] ?? 0 ) );

        return Utill::unwrap_ability_response( MultiVendorX()->rest->store->prepare_get_item_response( $params ) );
    }

    /**
     * Update a store's details.
     *
     * @param array $input Ability input.
     * @return array|\WP_Error
     */
    public function update_store( $input ) {
        $params = array(
            'id'   => (int) ( $input['store_id'] ?? 0 ),
            'data' => (array) ( $input['data'] ?? array() ),
        );

        return Utill::unwrap_ability_response( MultiVendorX()->rest->store->prepare_update_item_response( $params ) );
    }
}
