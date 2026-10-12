<?php
/**
 * Q&A tab container - all content loaded via AJAX
 *
 * @package     MultiVendorX/Templates
 * @version     5.0.0
 * @author      MultiVendorX
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$product_id    = $args['product_id'];
$current_url   = get_permalink( $product_id );
$myaccount_url = wc_get_page_permalink( 'myaccount' );
$login_url     = add_query_arg( 'redirect_to', $current_url, $myaccount_url );
?>

<div id="product-customer-queries" data-product="<?php echo esc_attr( $product_id ); ?>">

    <div class="header">
        <h3><?php echo esc_html__( 'Questions about this product', 'multivendorx' ); ?></h3>

        <form class="woocommerce-form customer-queries-search">
            <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                <input type="text" id="customer-queries-search" class="woocommerce-Input woocommerce-Input--text input-text"
                    placeholder="<?php echo esc_attr__( 'Have a question? Search for an answer.', 'multivendorx' ); ?>">
            </p>
        </form>
    </div>

    <!-- Questions List (populated via AJAX) -->
    <div class="woocommerce-js">
        <div id="reviews">
            <div id="comments">
                <ol id="customer-queries-list" class="commentlist"></ol>
            </div>
        </div>
    </div>
    <div id="customer-queries-no-results-container" class="customer-queries-empty" style="display:none;">
        <span id="customer-queries-no-results-message">
            <?php echo esc_html__( 'Have not discovered the information you seek', 'multivendorx' ); ?>
        </span>
        <button
            type="submit"
            id="customer-queries-direct-submit"
            class="woocommerce-button button">
            <?php echo esc_html__( 'Ask now', 'multivendorx' ); ?>
        </button>
    </div>
    <!-- Success Message -->
    <div class="woocommerce-notices-wrapper" style="display:none;" id="customer-queries-success-message">
        <div class="woocommerce-message" role="alert">
            <?php echo esc_html__( 'Your question has been submitted successfully. It will appear once answered.', 'multivendorx' ); ?>
        </div>
    </div>
    <!-- Login Prompt Only -->
    <?php if ( ! is_user_logged_in() ) : ?>
        <div class="login-wrapper">
            <div class="description"><?php echo esc_html__( 'Can’t find your answer?', 'multivendorx' ); ?></div>
            <a class="button"
                href="<?php echo esc_url( $login_url ); ?>"><?php echo esc_html__( 'Log in', 'multivendorx' ); ?></a>
            <span><?php echo esc_html__( 'to share your question with us.', 'multivendorx' ); ?></span>
        </div>
    <?php endif; ?>

</div>