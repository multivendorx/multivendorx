<?php
/**
 * Store Review Form Template
 *
 * Override this template by copying it to yourtheme/dc-woocommerce-multi-vendor/store/store-review.php
 *
 * @package     MultiVendorX/Templates
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$store_id               = $args['store_id'] ?? 0;
$is_logged_in           = is_user_logged_in();
$user                   = wp_get_current_user();
$parameters             = MultiVendorX()->setting->get_setting( 'ratings_parameters', array() );
$review_status          = '';
$is_verified_buyer      = 0;
$storereview            = MultiVendorX()->setting->get_setting( 'is_storereview_varified', array() );
$is_verified_buyer_only = reset( $storereview ) ?? false;

if ( $is_logged_in && $store_id ) {
    $review_status = \MultiVendorX\StoreReview\Util::get_user_review_status( $store_id, $user->ID );

    // If setting is enabled, check if user is verified buyer.
    if ( $is_verified_buyer_only ) {
        $is_verified_buyer = \MultiVendorX\StoreReview\Util::is_verified_buyer( $store_id, $user->ID );
    }
}
?>

<div class="woocommerce">
    <div id="multivendorx-store-reviews">
        <div id="avg-rating"></div>

        <div id="review-form-wrapper">
            <?php if ( ! $is_logged_in ) : ?>
                <div class="woocommerce-info">
                    <?php esc_html_e( 'Please login to submit a review.', 'multivendorx' ); ?>
                </div>

                <?php elseif ( 'pending' === $review_status || 'rejected' === $review_status ) : ?>
                <div class="woocommerce-info">
                    <?php esc_html_e( 'You have already submitted a review for this store.', 'multivendorx' ); ?>
                </div>

            <?php elseif ( empty( $review_status ) ) : ?>
                <?php if ( $is_verified_buyer_only && ! $is_verified_buyer ) : ?>
                    <div class="woocommerce-info">
                        <?php esc_html_e( 'Only verified buyers can leave a review for this store.', 'multivendorx' ); ?>
                    </div>
                <?php else : ?>
                    <button id="write-review-btn" type="button">
                        <?php esc_html_e( 'Write a review', 'multivendorx' ); ?>
                    </button>
                    <!--Show form only if no review submitted and verified -->
                    <form id="commentform" class="comment-form" class="comment-form" style="display:none;">
                        <div class="form-wrapper">
                            <label><?php esc_html_e( 'Review Title', 'multivendorx' ); ?></label>
                            <input type="text" id="review_title" name="review_title" />
                        </div>

                        <div class="form-wrapper">

                            <label><?php esc_html_e( 'Your Review', 'multivendorx' ); ?></label>
                            <textarea id="review_content" name="review_content"></textarea>
                        </div>

                        <?php if ( ! empty( $parameters ) && is_array( $parameters ) ) : ?>
                            <?php
                            foreach ( $parameters as $param ) :
                                $param_value = is_array( $param ) ? ( $param['label'] ?? '' ) : $param;
                                if ( empty( $param_value ) ) {
                                    continue;
                                }
                                $param_key = sanitize_title( $param_value );
                                ?>

                                <div class="rating stars" data-selected="0">
                                    <i class="dashicons-star-empty dashicons" data-value="1"></i>
                                    <i class="dashicons-star-empty dashicons" data-value="2"></i>
                                    <i class="dashicons-star-empty dashicons" data-value="3"></i>
                                    <i class="dashicons-star-empty dashicons" data-value="4"></i>
                                    <i class="dashicons-star-empty dashicons" data-value="5"></i>
                                    <span class="title"><?php echo esc_html( $param_value ); ?></span>
                                    <input type="hidden" name="rating[<?php echo esc_attr( $param_value ); ?>]" value="0" class="multivendorx-rating-select" />
                                </div>

                            <?php endforeach; ?>
                        <?php endif; ?>
                        <div class="form-wrapper">
                            <label><?php esc_html_e( 'Upload Images', 'multivendorx' ); ?></label>
                            <input type="file" id="review_images" name="review_images[]" multiple accept="image/*" />
                        </div>

                        <p>
                            <button id="review_submit" type="button">
                                <?php esc_html_e( 'Submit Review', 'multivendorx' ); ?>
                            </button>
                        </p>
                    </form>
                <?php endif; ?>
            <?php endif; ?>
        </div>

        <input type="hidden" id="store_for_rating" value="<?php echo esc_attr( $store_id ); ?>">

        <div id="multivendorx-store-reviews-list"></div>
    </div>
</div>
