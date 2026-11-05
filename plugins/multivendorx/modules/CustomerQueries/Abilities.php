<?php
/**
 * MultiVendorX Customer Queries Abilities.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\CustomerQueries;

use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Customer Queries Abilities.
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
     * Register customer-question abilities.
     *
     * @return void
     */
    public function register_abilities() {
        wp_register_ability(
            'multivendorx/get-customer-questions',
            array(
                'label'               => __( 'Get Customer Questions', 'multivendorx' ),
                'description'         => __( 'Customer questions for a specific store, or every store when store_id is omitted.', 'multivendorx' ),
                'category'            => 'multivendorx',
                'input_schema'        => array(
                    'type'       => 'object',
                    'properties' => array(
                        'store_id' => array(
                            'type'        => 'integer',
                            'description' => __( 'Store ID. Omit for every store (admin only).', 'multivendorx' ),
                        ),
                        'status'   => array(
                            'type'        => 'string',
                            'description' => __( 'Filter by answer status.', 'multivendorx' ),
                            'enum'        => array( 'has_answer', 'no_answer' ),
                        ),
                    ),
                ),
                'output_schema'       => array( 'type' => 'array' ),
                'execute_callback'    => array( $this, 'get_customer_questions' ),
                'permission_callback' => array( Utill::class, 'store_permissions_check' ),
                'meta'                => array( 'public' => true ),
            )
        );

        wp_register_ability(
            'multivendorx/answer-customer-question',
            array(
                'label'               => __( 'Answer Customer Question', 'multivendorx' ),
                'description'         => __( 'Answer a customer\'s product question.', 'multivendorx' ),
                'category'            => 'multivendorx',
                'input_schema'        => array(
                    'type'                 => 'object',
                    'properties'           => array(
                        'id'          => array(
                            'type'        => 'integer',
                            'description' => __( 'Question ID.', 'multivendorx' ),
                        ),
                        'answer_text' => array(
                            'type'        => 'string',
                            'description' => __( 'Answer text.', 'multivendorx' ),
                        ),
                    ),
                    'required'             => array( 'id', 'answer_text' ),
                    'additionalProperties' => false,
                ),
                'output_schema'       => array( 'type' => 'boolean' ),
                'execute_callback'    => array( $this, 'answer_customer_question' ),
                'permission_callback' => array( $this, 'question_permissions_check' ),
                'meta'                => array( 'public' => true ),
            )
        );
    }

    /**
     * Check whether the current user can manage the question's store.
     *
     * @param array $input Ability input.
     * @return bool
     */
    public function question_permissions_check( $input ) {
        $question = reset( Util::query_questions( array( 'id' => (int) ( $input['id'] ?? 0 ) ) ) );

        return $question && StoreUtil::current_user_can_manage_store( $question['store_id'] ?? 0 );
    }

    /**
     * Retrieve customer questions - a specific store's, or every store's.
     *
     * @param array $input Ability input.
     * @return array|\WP_Error
     */
    public function get_customer_questions( $input ) {
        $store_id = $input['store_id'] ?? (int) MultiVendorX()->active_store;

        $response = Module::init()->rest->prepare_get_items_response( array_merge( (array) $input, array( 'store_id' => $store_id ) ) );

        return Utill::ability_response( $response );
    }

    /**
     * Answer a customer question.
     *
     * @param array $input Ability input.
     * @return bool|\WP_Error
     */
    public function answer_customer_question( $input ) {
        $id = (int) $input['id'];

        if ( ! reset( Util::query_questions( array( 'id' => $id ) ) ) ) {
            return new \WP_Error( 'multivendorx_question_not_found', __( 'Question not found.', 'multivendorx' ) );
        }

        return (bool) Util::update_question(
            $id,
            array(
                'answer_text' => sanitize_textarea_field( (string) $input['answer_text'] ),
                'answer_by'   => MultiVendorX()->current_user_id,
            )
        );
    }
}
