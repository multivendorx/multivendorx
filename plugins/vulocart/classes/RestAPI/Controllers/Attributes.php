<?php
/**
 * Attributes class file.
 *
 * @package VuloCart
 */

namespace VuloCart\RestAPI\Controllers;

use VuloCart\Domain\Attribute\ProductAttribute as AttributeEntity;
use VuloCart\Domain\Attribute\AttributeValue;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Attributes REST controller.
 *
 * Backs the Offerings menu's "Attributes" admin page
 * (`src/pages/Attributes/`). Listing/reading is public (same posture as
 * Terms.php/Offerings.php's own public GET); every mutation is
 * `manage_options`-gated.
 *
 * @class       Attributes class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Attributes extends \WP_REST_Controller {

    /**
     * REST base for this controller's routes.
     *
     * @var string
     */
    protected $rest_base = 'attributes';

    /**
     * Registers this controller's REST routes.
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            VuloCart()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_items' ),
                    'permission_callback' => '__return_true',
                ),
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'create_item' ),
                    'permission_callback' => array( $this, 'admin_permissions_check' ),
                ),
            )
        );

        register_rest_route(
            VuloCart()->rest_namespace,
            '/' . $this->rest_base . '/(?P<id>\d+)',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_item' ),
                    'permission_callback' => '__return_true',
                ),
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array( $this, 'update_item' ),
                    'permission_callback' => array( $this, 'admin_permissions_check' ),
                ),
                array(
                    'methods'             => \WP_REST_Server::DELETABLE,
                    'callback'            => array( $this, 'delete_item' ),
                    'permission_callback' => array( $this, 'admin_permissions_check' ),
                ),
            )
        );

        register_rest_route(
            VuloCart()->rest_namespace,
            '/' . $this->rest_base . '/(?P<id>\d+)/values',
            array(
                'methods'             => \WP_REST_Server::CREATABLE,
                'callback'            => array( $this, 'add_value' ),
                'permission_callback' => array( $this, 'admin_permissions_check' ),
            )
        );

        register_rest_route(
            VuloCart()->rest_namespace,
            '/' . $this->rest_base . '/values/(?P<value_id>\d+)',
            array(
                'methods'             => \WP_REST_Server::DELETABLE,
                'callback'            => array( $this, 'delete_value' ),
                'permission_callback' => array( $this, 'admin_permissions_check' ),
            )
        );
    }

    /**
     * Checks whether the current user can manage attributes.
     *
     * @return bool
     */
    public function admin_permissions_check() {
        return current_user_can( 'manage_options' );
    }

    /**
     * Converts a domain AttributeValue into the REST response shape.
     *
     * @param AttributeValue $value Value to convert to a REST response shape.
     * @return array<string, mixed>
     */
    private function format_value_for_response( AttributeValue $value ): array {
        return array(
            'id'    => $value->id,
            'value' => $value->value,
        );
    }

    /**
     * Converts a domain ProductAttribute into the REST response shape.
     *
     * @param AttributeEntity $attribute ProductAttribute to convert to a REST response shape.
     * @return array<string, mixed>
     */
    private function prepare_attribute_for_response( AttributeEntity $attribute ): array {
        return array(
            'id'         => $attribute->id,
            'name'       => $attribute->name,
            'slug'       => $attribute->slug,
            'values'     => array_map( array( $this, 'format_value_for_response' ), $attribute->values ),
            'created_at' => $attribute->created_at,
            'updated_at' => $attribute->updated_at,
        );
    }

    /**
     * Lists every attribute.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response
     */
    public function get_items( $request ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found
        $attributes = VuloCart()->attribute_service->list_attributes();

        return rest_ensure_response( array_map( array( $this, 'prepare_attribute_for_response' ), $attributes ) );
    }

    /**
     * Fetches one attribute by id.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function get_item( $request ) {
        $attribute = VuloCart()->attribute_service->get_attribute( absint( $request->get_param( 'id' ) ) );

        if ( ! $attribute ) {
            return new \WP_Error( 'vulocart_attribute_not_found', esc_html__( 'No attribute exists with this id.', 'vulocart' ), array( 'status' => 404 ) );
        }

        return rest_ensure_response( $this->prepare_attribute_for_response( $attribute ) );
    }

    /**
     * Creates a new attribute.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function create_item( $request ) {
        $name = sanitize_text_field( (string) $request->get_param( 'name' ) );

        if ( '' === $name ) {
            return new \WP_Error( 'vulocart_missing_attribute_name', esc_html__( 'A name is required.', 'vulocart' ), array( 'status' => 400 ) );
        }

        $data = array( 'name' => $name );

        if ( $request->get_param( 'slug' ) ) {
            $data['slug'] = sanitize_title( (string) $request->get_param( 'slug' ) );
        }

        $attribute = VuloCart()->attribute_service->create_attribute( $data );
        $response  = rest_ensure_response( $this->prepare_attribute_for_response( $attribute ) );
        $response->set_status( 201 );

        return $response;
    }

    /**
     * Updates an existing attribute.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function update_item( $request ) {
        $data = array();

        if ( null !== $request->get_param( 'name' ) ) {
            $data['name'] = sanitize_text_field( (string) $request->get_param( 'name' ) );
        }

        if ( null !== $request->get_param( 'slug' ) ) {
            $data['slug'] = sanitize_title( (string) $request->get_param( 'slug' ) );
        }

        $attribute = VuloCart()->attribute_service->update_attribute( absint( $request->get_param( 'id' ) ), $data );

        if ( ! $attribute ) {
            return new \WP_Error( 'vulocart_attribute_not_found', esc_html__( 'No attribute exists with this id.', 'vulocart' ), array( 'status' => 404 ) );
        }

        return rest_ensure_response( $this->prepare_attribute_for_response( $attribute ) );
    }

    /**
     * Deletes an attribute.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function delete_item( $request ) {
        $deleted = VuloCart()->attribute_service->delete_attribute( absint( $request->get_param( 'id' ) ) );

        if ( ! $deleted ) {
            return new \WP_Error( 'vulocart_attribute_not_found', esc_html__( 'No attribute exists with this id.', 'vulocart' ), array( 'status' => 404 ) );
        }

        return rest_ensure_response( array( 'deleted' => true ) );
    }

    /**
     * Adds a new value to an attribute.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function add_value( $request ) {
        $value = sanitize_text_field( (string) $request->get_param( 'value' ) );

        if ( '' === $value ) {
            return new \WP_Error( 'vulocart_missing_value', esc_html__( 'A value is required.', 'vulocart' ), array( 'status' => 400 ) );
        }

        $added = VuloCart()->attribute_service->add_value( absint( $request->get_param( 'id' ) ), $value );

        if ( ! $added ) {
            return new \WP_Error( 'vulocart_attribute_not_found', esc_html__( 'No attribute exists with this id.', 'vulocart' ), array( 'status' => 404 ) );
        }

        $response = rest_ensure_response( $this->format_value_for_response( $added ) );
        $response->set_status( 201 );

        return $response;
    }

    /**
     * Deletes an attribute value.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response
     */
    public function delete_value( $request ) {
        $deleted = VuloCart()->attribute_service->delete_value( absint( $request->get_param( 'value_id' ) ) );

        return rest_ensure_response( array( 'deleted' => $deleted ) );
    }
}
