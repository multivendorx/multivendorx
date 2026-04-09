<?php
/**
 * MultiVendorX AJAX handlers.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\StoreReview;

use MultiVendorX\Store\Store;
use MultiVendorX\Utill;

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
		$user_id        = MultiVendorX()->current_user_id;
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
		$files           = $_FILES['review_images'] ?? null;

		if ( ! empty( $files ) && is_array( $files ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
			// Validate required file structure.
			$required_keys = array( 'name', 'type', 'tmp_name', 'error', 'size' );
			foreach ( $required_keys as $key ) {
				if ( ! is_array( $files[ $key ] ) ) {
					wp_send_json_error(
                        array(
							'message' => __( 'Invalid file upload data.', 'multivendorx' ),
                        )
                    );
				}
			}

			// Normalize safely.
			$file_names  = array_map( 'sanitize_file_name', (array) ( $files['name'] ?? array() ) );
			$file_types  = (array) ( $files['type'] ?? array() );
			$file_tmp    = (array) ( $files['tmp_name'] ?? array() );
			$file_errors = array_map( 'intval', (array) ( $files['error'] ?? array() ) );
			$file_sizes  = array_map( 'intval', (array) ( $files['size'] ?? array() ) );

			foreach ( $file_names as $index => $name ) {
				$tmp   = $file_tmp[ $index ] ?? '';
				$type  = $file_types[ $index ] ?? '';
				$error = $file_errors[ $index ] ?? UPLOAD_ERR_NO_FILE;
				$size  = $file_sizes[ $index ] ?? 0;
				// Basic validation.
				if ( $name === '' || $tmp === '' || $error !== UPLOAD_ERR_OK ) {
					continue;
				}
				$file   = array(
					'name'     => $name,
					'type'     => sanitize_mime_type( $type ),
					'tmp_name' => $tmp,
					'error'    => $error,
					'size'     => $size,
				);
				$upload = wp_handle_upload( $file, array( 'test_form' => false ) );
				if ( ! empty( $upload['error'] ) || empty( $upload['url'] ) ) {
					continue;
				}
				$uploaded_images[] = esc_url_raw( $upload['url'] );
			}
		}

		// Insert review with image data.
		$review_id = Util::insert_review( $store_id, $user_id, $review_title, $review_content, $overall, $order_id, $uploaded_images );
		Util::insert_ratings( $review_id, $ratings );
		$store = new Store( $store_id );
		MultiVendorX()->notifications->send_notification_helper('new_store_review', $store, null, [
			'category'      => 'activity',
		]);
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
			echo '<div id="reviews" class="woocommerce-Reviews"> 
                <div id="comments">
                <ol class="commentlist">';
			foreach ( $reviews as $review ) {
				$user_info         = get_userdata( $review->customer_id );
				$reviewer_name     = $user_info ? $user_info->display_name : __( 'Anonymous', 'multivendorx' );
				$rating_percentage = ( floatval( $review->overall_rating ) / 5 ) * 100;
				$rating_rounded    = round( floatval( $review->overall_rating ), 1 );

				// Get timestamp for time diff.
				$review_time = strtotime( $review->date_created );
				$time_diff   = human_time_diff( $review_time, time() );
				?>
            <li class="review byuser comment-author-admin bypostauthor">
                <div class="comment_container">
                            <?php
                            if ( $user_info ) {
                                echo get_avatar( $review->customer_id, 60 );
							} else {
                                echo get_avatar( 0, 60 );
							}
							?>
                    <div class="comment-text">
                        <div class="star-rating" role="img" aria-label="
                        <?php
                            /* translators: %s: rating value */
                            printf( esc_attr__( 'Rated %s out of 5', 'multivendorx' ), esc_html( $rating_rounded ) );
                        ?>
                        ">
                            <span style="width: <?php echo esc_attr( $rating_percentage ); ?>%;">
                                <strong class="rating"><?php echo esc_html( $rating_rounded ); ?></strong> <?php esc_html_e( 'out of 5', 'multivendorx' ); ?>
                            </span>
                        </div>

                        <p class="meta">
                            <strong class="woocommerce-review__author"><?php echo esc_html( $reviewer_name ); ?></strong>
                            <span class="woocommerce-review__dash">–</span>

                            <time class="woocommerce-review__published-date" datetime="<?php echo esc_attr( $review->date_created ); ?>">
                                <?php
                                /* translators: %s: time difference */
                                echo esc_html( sprintf( __( '%s ago', 'multivendorx' ), $time_diff ) );
                                ?>
                            </time>
                        </p>

                        <div class="description">
								<?php if ( ! empty( $review->review_title ) ) : ?>
                                <h4 class="woocommerce-review__title"><?php echo esc_html( $review->review_title ); ?></h4>
                            <?php endif; ?>

                            <p><?php echo esc_html( $review->review_content ); ?></p>

								<?php
								if ( ! empty( $review->review_images ) ) :
									$images = json_decode( stripslashes( $review->review_images ), true );
									if ( is_array( $images ) && ! empty( $images ) ) :
										?>
                                    <div class="review-images">
                                        <?php foreach ( $images as $img_url ) : ?>
                                            <a href="<?php echo esc_url( $img_url ); ?>" target="_blank" rel="noopener noreferrer">
                                                <img src="<?php echo esc_url( $img_url ); ?>" alt="<?php esc_attr_e( 'Review Image', 'multivendorx' ); ?>" />
                                            </a>
                                        <?php endforeach; ?>
                                    </div>
									<?php endif; ?>
								<?php endif; ?>
                        </div>

							<?php if ( ! empty( $review->reply ) ) : ?>
                            <div class="multivendorx-review-reply">
                                <strong><?php esc_html_e( 'Admin reply:', 'multivendorx' ); ?></strong>
                                <p><?php echo esc_html( $review->reply ); ?></p>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </li>
				<?php
			}
			echo '</ol> 
            </div>
            </div>';
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
