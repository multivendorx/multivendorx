<?php
/**
 * Terms class file.
 *
 * @package VuloCart
 */

namespace VuloCart\RestAPI\Controllers;

use VuloCart\Domain\Term\Taxonomy;
use VuloCart\Domain\Term\Term as TermEntity;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Terms REST controller.
 *
 * Registers the same CRUD route shape three times — `/categories`,
 * `/brands`, `/collections` — each bound to one Domain\Term\Taxonomy
 * constant, backing the Offerings menu's "Categories"/"Brands"/
 * "Collections" admin pages (`src/pages/Terms/`). One controller class
 * rather than three near-identical ones, mirroring
 * Domain\Term\Taxonomy's own "one shape, one table" reasoning.
 *
 * Listing/reading is public (categories/brands/collections are harmless
 * reference data, same posture as Offerings' own public GET — rest-api.md);
 * every mutation is `manage_options`-gated.
 *
 * @class       Terms class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Terms extends \WP_REST_Controller {

    /**
     * URL segment => Taxonomy constant.
     *
     * @var array<string, string>
     */
    const ROUTE_TAXONOMIES = array(
        'categories'  => Taxonomy::CATEGORY,
        'brands'      => Taxonomy::BRAND,
        'collections' => Taxonomy::COLLECTION,
    );

    /**
     * Registers this controller's REST routes — one set per entry in
     * self::ROUTE_TAXONOMIES.
     *
     * @return void
     */
    public function register_routes() {
        foreach ( self::ROUTE_TAXONOMIES as $route_segment => $taxonomy ) {
            register_rest_route(
                VuloCart()->rest_namespace,
                '/' . $route_segment,
                array(
                    array(
                        'methods'             => \WP_REST_Server::READABLE,
                        'callback'            => function ( $request ) use ( $taxonomy ) {
                            return $this->get_items( $request, $taxonomy );
                        },
                        'permission_callback' => '__return_true',
                    ),
                    array(
                        'methods'             => \WP_REST_Server::CREATABLE,
                        'callback'            => function ( $request ) use ( $taxonomy ) {
                            return $this->create_item( $request, $taxonomy );
                        },
                        'permission_callback' => array( $this, 'admin_permissions_check' ),
                    ),
                )
            );

            register_rest_route(
                VuloCart()->rest_namespace,
                '/' . $route_segment . '/(?P<id>\d+)',
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
        }
    }

    /**
     * Checks whether the current user can manage categories/brands/collections.
     *
     * @return bool
     */
    public function admin_permissions_check() {
        return current_user_can( 'manage_options' );
    }

    /**
     * Converts a domain Term into the REST response shape.
     *
     * @param TermEntity $term Term to convert to a REST response shape.
     * @return array<string, mixed>
     */
    private function prepare_term_for_response( TermEntity $term ): array {
        return array(
            'id'             => $term->id,
            'taxonomy'       => $term->taxonomy,
            'name'           => $term->name,
            'slug'           => $term->slug,
            'parent_id'      => $term->parent_id,
            'description'    => $term->description,
            'meta'           => $term->meta,
            'offering_count' => VuloCart()->term_service->count_offerings_for_term( $term ),
            'created_at'     => $term->created_at,
            'updated_at'     => $term->updated_at,
        );
    }

    /**
     * Lists every term in a taxonomy.
     *
     * @param \WP_REST_Request $request  Full request object.
     * @param string           $taxonomy One of Taxonomy's constants, bound by register_routes().
     * @return \WP_REST_Response
     */
    public function get_items( $request, $taxonomy = '' ) {
        $args = array();

        if ( $request->get_param( 'search' ) ) {
            $args['search'] = sanitize_text_field( (string) $request->get_param( 'search' ) );
        }

        if ( null !== $request->get_param( 'parent_id' ) ) {
            $args['parent_id'] = absint( $request->get_param( 'parent_id' ) );
        }

        $terms = VuloCart()->term_service->list_terms( $taxonomy, $args );

        return rest_ensure_response( array_map( array( $this, 'prepare_term_for_response' ), $terms ) );
    }

    /**
     * Fetches one term by id.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function get_item( $request ) {
        $term = VuloCart()->term_service->get_term( absint( $request->get_param( 'id' ) ) );

        if ( ! $term ) {
            return new \WP_Error( 'vulocart_term_not_found', esc_html__( 'No term exists with this id.', 'vulocart' ), array( 'status' => 404 ) );
        }

        return rest_ensure_response( $this->prepare_term_for_response( $term ) );
    }

    /**
     * Creates a new term.
     *
     * @param \WP_REST_Request $request  Full request object.
     * @param string           $taxonomy One of Taxonomy's constants, bound by register_routes().
     * @return \WP_REST_Response|\WP_Error
     */
    public function create_item( $request, $taxonomy = '' ) {
        $name = sanitize_text_field( (string) $request->get_param( 'name' ) );

        if ( '' === $name ) {
            return new \WP_Error( 'vulocart_missing_term_name', esc_html__( 'A name is required.', 'vulocart' ), array( 'status' => 400 ) );
        }

        $data = array(
            'taxonomy' => $taxonomy,
            'name'     => $name,
        );

        if ( $request->get_param( 'slug' ) ) {
            $data['slug'] = sanitize_title( (string) $request->get_param( 'slug' ) );
        }

        if ( null !== $request->get_param( 'parent_id' ) ) {
            $data['parent_id'] = absint( $request->get_param( 'parent_id' ) ) ?: null; // phpcs:ignore Universal.Operators.DisallowShortTernary.Found
        }

        if ( null !== $request->get_param( 'description' ) ) {
            $data['description'] = sanitize_textarea_field( (string) $request->get_param( 'description' ) );
        }

        if ( is_array( $request->get_param( 'meta' ) ) ) {
            $data['meta'] = $this->sanitize_term_meta( $request->get_param( 'meta' ) );
        }

        $term     = VuloCart()->term_service->create_term( $data );
        $response = rest_ensure_response( $this->prepare_term_for_response( $term ) );
        $response->set_status( 201 );

        return $response;
    }

    /**
     * Updates an existing term.
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

        if ( null !== $request->get_param( 'parent_id' ) ) {
            $data['parent_id'] = absint( $request->get_param( 'parent_id' ) ) ?: null; // phpcs:ignore Universal.Operators.DisallowShortTernary.Found
        }

        if ( null !== $request->get_param( 'description' ) ) {
            $data['description'] = sanitize_textarea_field( (string) $request->get_param( 'description' ) );
        }

        if ( is_array( $request->get_param( 'meta' ) ) ) {
            $data['meta'] = $this->sanitize_term_meta( $request->get_param( 'meta' ) );
        }

        $term = VuloCart()->term_service->update_term( absint( $request->get_param( 'id' ) ), $data );

        if ( ! $term ) {
            return new \WP_Error( 'vulocart_term_not_found', esc_html__( 'No term exists with this id.', 'vulocart' ), array( 'status' => 404 ) );
        }

        return rest_ensure_response( $this->prepare_term_for_response( $term ) );
    }

    /**
     * Deletes a term.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function delete_item( $request ) {
        $deleted = VuloCart()->term_service->delete_term( absint( $request->get_param( 'id' ) ) );

        if ( ! $deleted ) {
            return new \WP_Error( 'vulocart_term_not_found', esc_html__( 'No term exists with this id.', 'vulocart' ), array( 'status' => 404 ) );
        }

        return rest_ensure_response( array( 'deleted' => true ) );
    }

    /**
     * Whitelist-sanitizes a term's `meta` bag — today just a brand's
     * optional logo media reference, same `{id,url}` shape
     * Offerings' own `sanitize_media_item()` validates.
     *
     * @param array<string, mixed> $meta Raw posted meta.
     * @return array<string, mixed>
     */
    private function sanitize_term_meta( array $meta ): array {
        $sanitized = array();

        if ( isset( $meta['logo'] ) && is_array( $meta['logo'] ) && isset( $meta['logo']['id'], $meta['logo']['url'] ) ) {
            $sanitized['logo'] = array(
                'id'  => absint( $meta['logo']['id'] ),
                'url' => esc_url_raw( (string) $meta['logo']['url'] ),
            );
        }

        return $sanitized;
    }
}
