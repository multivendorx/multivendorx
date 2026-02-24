<?php
/**
 * MultiVendorX AJAX handlers.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\StoreReview;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * MultiVendorX AJAX handlers.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Ajax {

    /**
     * Constructor.
     */
    public function __construct() {
        add_action( 'wp_ajax_multivendorx_store_review_submit', array( $this, 'submit_review' ) );
        add_action( 'wp_ajax_nopriv_multivendorx_store_review_submit', array( $this, 'submit_review' ) );

        add_action( 'wp_ajax_multivendorx_store_review_list', array( $this, 'get_reviews' ) );
        add_action( 'wp_ajax_nopriv_multivendorx_store_review_list', array( $this, 'get_reviews' ) );

        add_action( 'wp_ajax_multivendorx_store_review_avg', array( $this, 'get_avg_ratings' ) );
        add_action( 'wp_ajax_nopriv_multivendorx_store_review_avg', array( $this, 'get_avg_ratings' ) );
    }

    /**
     * Submit a review.
     */
    public function submit_review() {
        check_ajax_referer( 'multivendorx-review-frontend-script', 'nonce' );

        $data = filter_input_array(
            INPUT_POST,
            array(
				'store_id'       => FILTER_SANITIZE_NUMBER_INT,
				'review_title'   => FILTER_SANITIZE_FULL_SPECIAL_CHARS,
				'review_content' => FILTER_SANITIZE_FULL_SPECIAL_CHARS,
				'rating'         => array(
					'filter' => FILTER_DEFAULT,
					'flags'  => FILTER_REQUIRE_ARRAY,
				),
			)
        );

        $store_id       = intval( $data['store_id'] ?? 0 );
        $user_id        = get_current_user_id();
        $review_title   = $data['review_title'] ?? '';
        $review_content = $data['review_content'] ?? '';
        $ratings        = $data['rating'] ?? array();

        if ( ! $user_id || ! $store_id || empty( $ratings ) ) {
            wp_send_json_error( array( 'message' => __( 'Missing required fields.', 'multivendorx' ) ) );
        }

        if ( Util::has_reviewed( $store_id, $user_id ) ) {
            wp_send_json_error( array( 'message' => __( 'You have already reviewed this store.', 'multivendorx' ) ) );
        }

        $order_id = Util::is_verified_buyer( $store_id, $user_id );
        $overall  = array_sum( $ratings ) / count( $ratings );

        // Handle image uploads.
        $uploaded_images = array();
        if ( ! empty( $_FILES['review_images']['name'][0] ) ) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
            $files = $_FILES['review_images'];

            foreach ( $files['name'] as $key => $value ) {
                if ( $files['name'][ $key ] ) {
                    $file = array(
                        'name'     => $files['name'][ $key ],
                        'type'     => $files['type'][ $key ],
                        'tmp_name' => $files['tmp_name'][ $key ],
                        'error'    => $files['error'][ $key ],
                        'size'     => $files['size'][ $key ],
                    );

                    $upload = wp_handle_upload( $file, array( 'test_form' => false ) );
                    if ( ! isset( $upload['error'] ) && isset( $upload['url'] ) ) {
                        $uploaded_images[] = esc_url_raw( $upload['url'] );
                    }
                }
            }
        }

        // Insert review with image data.
        $review_id = Util::insert_review( $store_id, $user_id, $review_title, $review_content, $overall, $order_id, $uploaded_images );
        Util::insert_ratings( $review_id, $ratings );

        wp_send_json_success( array( 'message' => __( 'Review submitted successfully!', 'multivendorx' ) ) );
    }

    /**
     * Get reviews for a store.
     */
    public function get_reviews() {
        $store_id = filter_input( INPUT_POST, 'store_id', FILTER_SANITIZE_NUMBER_INT );
        $reviews  = Util::get_reviews_by_store( $store_id );

        ob_start();
        if ( $reviews ) {
            echo '<ul class="multivendorx-review-list">';
            foreach ( $reviews as $review ) {
                echo '<li class="multivendorx-review-item">';
                $user_info     = get_userdata( $review->customer_id );
                $reviewer_name = $user_info ? $user_info->display_name : __( 'Anonymous', 'multivendorx' );
                echo '<div class="header"> <div class="details-wrapper">';
                echo '<div class="avatar">B</div> <div class="name">' . esc_html( $reviewer_name ) . '</div> <span class="time">1 day ago</span></div> ';
                echo '</div>';
                echo '<div class="body">';
                $overall_rating = round( floatval( $review->overall_rating ) ); // Assuming your review object has overall_rating.

                echo '<div class="rating">';
                for ( $i = 1; $i <= 5; $i++ ) {
                    if ( $i <= $overall_rating ) {
                        echo '<i class="dashicons dashicons-star-filled"></i>';
                    } else {
                        echo '<i class="dashicons dashicons-star-empty"></i>';
                    }
                }
                echo '<span class="title">' . esc_html( $review->review_title ) . '</span></div>';

                echo ' <div class="content">' . esc_html( $review->review_content ) . '</div> </div>';
                if ( ! empty( $review->review_images ) ) {
                    $images = json_decode( stripslashes( $review->review_images ), true );

                    if ( is_array( $images ) && ! empty( $images ) ) {
                        echo '<div class="review-images">';
                        foreach ( $images as $img_url ) {
                            echo '<a href="' . esc_url( $img_url ) . '" target="_blank">';
                            echo '<img src="' . esc_url( $img_url ) . '" alt="Review Image" />';
                            echo '</a>';
                        }
                        echo '</div>';
                    }
                }

                echo '</div>';

                if ( ! empty( $review->reply ) ) {
                    echo '<div class="multivendorx-review-reply">';
                    echo '<strong>' . esc_html__( 'Admin reply:', 'multivendorx' ) . '</strong> ';
                    echo '<p>' . esc_html( $review->reply ) . '</p>';
                    echo '</div>';
                }

                echo '</li>';
            }
            echo '</ul>';
        } else {
            echo '<p>' . esc_html__( 'No reviews yet.', 'multivendorx' ) . '</p>';
        }

        wp_send_json_success( array( 'html' => ob_get_clean() ) );
    }

    /**
     * Get average ratings for a store.
     */
    public function get_avg_ratings() {
        $store_id   = filter_input( INPUT_POST, 'store_id', FILTER_SANITIZE_NUMBER_INT );
        $parameters = MultiVendorX()->setting->get_setting( 'ratings_parameters', array() );

        $averages = Util::get_avg_ratings( $store_id, $parameters );
        $overall  = Util::get_overall_rating( $store_id );

        // Get all reviews.
        $reviews       = Util::get_reviews_by_store( $store_id );
        $total_reviews = count( $reviews );

        // Initialize breakdown.
        $breakdown = array(
            5 => 0,
            4 => 0,
            3 => 0,
            2 => 0,
            1 => 0,
        );

        foreach ( $reviews as $review ) {
            $rating = round( floatval( $review->overall_rating ) ); // Round to nearest star.
            if ( isset( $breakdown[ $rating ] ) ) {
                ++$breakdown[ $rating ];
            }
        }

        wp_send_json_success(
            array(
				'averages'      => $averages,
				'overall'       => round( $overall, 1 ),
				'total_reviews' => $total_reviews,
				'breakdown'     => $breakdown,
            )
        );
    }
}
