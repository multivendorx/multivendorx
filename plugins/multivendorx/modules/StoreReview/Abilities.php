<?php
/**
 * MultiVendorX Store Review Abilities.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\StoreReview;

use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Store Review Abilities.
 *
 * Registers abilities on the shared 'multivendorx' category (already
 * registered centrally by \MultiVendorX\Abilities\Abilities), only while
 * this module is active.
 */
class Abilities {

    /**
     * Abilities constructor.
     */
    public function __construct() {
        add_action( 'wp_abilities_api_init', array( $this, 'register_abilities' ) );
    }

    /**
     * Register store-review abilities.
     *
     * @return void
     */
    public function register_abilities() {
        wp_register_ability(
            'multivendorx/get-reviews',
            array(
                'label'               => __( 'Get Reviews', 'multivendorx' ),
                'description'         => __( 'Reviews for a specific store, or every store when store_id is omitted.', 'multivendorx' ),
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
                            'description' => __( 'Number of reviews to return.', 'multivendorx' ),
                        ),
                    ),
                ),
                'output_schema'       => array( 'type' => 'array' ),
                'execute_callback'    => array( $this, 'get_reviews' ),
                'permission_callback' => array( Utill::class, 'store_permissions_check' ),
                'meta'                => array( 'public' => true ),
            )
        );

        wp_register_ability(
            'multivendorx/reply-to-store-review',
            array(
                'label'               => __( 'Reply To Store Review', 'multivendorx' ),
                'description'         => __( 'Reply to a customer review on a store.', 'multivendorx' ),
                'category'            => 'multivendorx',
                'input_schema'        => array(
                    'type'                 => 'object',
                    'properties'           => array(
                        'id'    => array(
                            'type'        => 'integer',
                            'description' => __( 'Review ID.', 'multivendorx' ),
                        ),
                        'reply' => array(
                            'type'        => 'string',
                            'description' => __( 'Reply text.', 'multivendorx' ),
                        ),
                    ),
                    'required'             => array( 'id', 'reply' ),
                    'additionalProperties' => false,
                ),
                'output_schema'       => array( 'type' => 'boolean' ),
                'execute_callback'    => array( $this, 'reply_to_store_review' ),
                'permission_callback' => array( $this, 'review_permissions_check' ),
                'meta'                => array( 'public' => true ),
            )
        );
    }

    /**
     * Check whether the current user can manage the review's store.
     *
     * @param array $input Ability input.
     * @return bool
     */
    public function review_permissions_check( $input ) {
        $review = reset( Util::query_reviews( array( 'review_id' => (int) ( $input['id'] ?? 0 ) ) ) );

        return $review && StoreUtil::current_user_can_manage_store( $review['store_id'] ?? 0 );
    }

    /**
     * Retrieve reviews - a specific store's, or every store's.
     *
     * @param array $input Ability input.
     * @return array|\WP_Error
     */
    public function get_reviews( $input ) {
        $input['store_id'] = Utill::resolve_ability_store_id( $input );

        $response = Module::init()->rest->prepare_get_items_response( (array) $input );

        return Utill::ability_response( $response );
    }

    /**
     * Reply to a store review.
     *
     * @param array $input Ability input.
     * @return bool|\WP_Error
     */
    public function reply_to_store_review( $input ) {
        $id = (int) $input['id'];

        if ( ! reset( Util::query_reviews( array( 'review_id' => $id ) ) ) ) {
            return new \WP_Error( 'multivendorx_review_not_found', __( 'Review not found.', 'multivendorx' ) );
        }

        return (bool) Util::update_review(
            $id,
            array(
                'reply'      => sanitize_textarea_field( (string) $input['reply'] ),
                'reply_date' => current_time( 'mysql' ),
            )
        );
    }
}
