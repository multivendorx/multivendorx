<?php
/**
 * Reviews class file.
 *
 * @package VuloCart
 */

namespace VuloCart\RestAPI\Controllers;

use VuloCart\Domain\Review\Review as ReviewEntity;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Reviews REST controller.
 *
 * Backs the Offerings menu's "Reviews" admin page
 * (`src/pages/Reviews/`) and a future public review-submission form on
 * `src/blocks/offerings/OfferingDetail.tsx`. `POST /reviews` (submit) is
 * public — same "guest-first" posture Cart/Order's own public routes
 * take (Cart\Rest.php's own docblock) — everything else is
 * `manage_options`-gated moderation, matching Order\Rest's own admin-only
 * listing/update posture.
 *
 * @class       Reviews class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Reviews extends \WP_REST_Controller {

    /**
     * REST base for this controller's routes.
     *
     * @var string
     */
    protected $rest_base = 'reviews';

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
                    'permission_callback' => array( $this, 'admin_permissions_check' ),
                ),
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'create_item' ),
                    'permission_callback' => '__return_true',
                ),
            )
        );

        register_rest_route(
            VuloCart()->rest_namespace,
            '/' . $this->rest_base . '/(?P<id>\d+)',
            array(
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

    /**
     * Checks whether the current user can moderate reviews.
     *
     * @return bool
     */
    public function admin_permissions_check() {
        return current_user_can( 'manage_options' );
    }

    /**
     * Converts a domain Review into the REST response shape.
     *
     * @param ReviewEntity $review Review to convert to a REST response shape.
     * @return array<string, mixed>
     */
    private function prepare_review_for_response( ReviewEntity $review ): array {
        $offering = VuloCart()->offering_service->get_offering( $review->offering_id );

        return array(
            'id'             => $review->id,
            'offering_id'    => $review->offering_id,
            'offering_title' => $offering ? $offering->title : null,
            'customer_name'  => $review->customer_name,
            'customer_email' => $review->customer_email,
            'rating'         => $review->rating,
            'title'          => $review->title,
            'content'        => $review->content,
            'status'         => $review->status,
            'created_at'     => $review->created_at,
            'updated_at'     => $review->updated_at,
        );
    }

    /**
     * Lists reviews, paginated — admin only.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response
     */
    public function get_items( $request ) {
        $page        = absint( $request->get_param( 'page' ) ? $request->get_param( 'page' ) : 1 );
        $per_page    = absint( $request->get_param( 'per_page' ) ? $request->get_param( 'per_page' ) : 20 );
        $status      = sanitize_key( (string) $request->get_param( 'status' ) );
        $offering_id = absint( $request->get_param( 'offering_id' ) );

        $result = VuloCart()->review_service->list_reviews(
            array(
                'page'        => $page,
                'per_page'    => $per_page,
                'status'      => $status,
                'offering_id' => $offering_id,
            )
        );

        $response = rest_ensure_response( array_map( array( $this, 'prepare_review_for_response' ), $result['data'] ) );
        $response->header( 'X-WP-Total', (string) $result['total'] );
        $response->header( 'X-WP-TotalPages', (string) ceil( $result['total'] / max( 1, $per_page ) ) );

        foreach ( VuloCart()->review_service->count_reviews_by_status() as $status_value => $count ) {
            $response->header( 'X-WP-Count-' . $status_value, (string) $count );
        }

        return $response;
    }

    /**
     * Submits a new review. Public — see class docblock.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function create_item( $request ) {
        $data = array(
            'offering_id' => absint( $request->get_param( 'offering_id' ) ),
            'rating'      => absint( $request->get_param( 'rating' ) ),
        );

        if ( $request->get_param( 'customer_name' ) ) {
            $data['customer_name'] = sanitize_text_field( (string) $request->get_param( 'customer_name' ) );
        }

        if ( $request->get_param( 'customer_email' ) ) {
            $data['customer_email'] = sanitize_email( (string) $request->get_param( 'customer_email' ) );
        }

        if ( $request->get_param( 'title' ) ) {
            $data['title'] = sanitize_text_field( (string) $request->get_param( 'title' ) );
        }

        if ( $request->get_param( 'content' ) ) {
            $data['content'] = sanitize_textarea_field( (string) $request->get_param( 'content' ) );
        }

        try {
            $review = VuloCart()->review_service->submit_review( $data );
        } catch ( \InvalidArgumentException $exception ) {
            return new \WP_Error( 'vulocart_invalid_review', esc_html( $exception->getMessage() ), array( 'status' => 400 ) );
        }

        $response = rest_ensure_response( $this->prepare_review_for_response( $review ) );
        $response->set_status( 201 );

        return $response;
    }

    /**
     * Moderates a review (approve/reject) — admin only.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function update_item( $request ) {
        $status = sanitize_key( (string) $request->get_param( 'status' ) );

        try {
            $review = VuloCart()->review_service->moderate_review( absint( $request->get_param( 'id' ) ), $status );
        } catch ( \InvalidArgumentException $exception ) {
            return new \WP_Error( 'vulocart_invalid_status', esc_html( $exception->getMessage() ), array( 'status' => 400 ) );
        }

        if ( ! $review ) {
            return new \WP_Error( 'vulocart_review_not_found', esc_html__( 'Review not found.', 'vulocart' ), array( 'status' => 404 ) );
        }

        return rest_ensure_response( $this->prepare_review_for_response( $review ) );
    }

    /**
     * Deletes a review.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response
     */
    public function delete_item( $request ) {
        $deleted = VuloCart()->review_service->delete_review( absint( $request->get_param( 'id' ) ) );

        return rest_ensure_response( array( 'deleted' => $deleted ) );
    }
}
