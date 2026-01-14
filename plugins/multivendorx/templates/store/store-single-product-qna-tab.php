<?php
/**
 * Q&A tab container - all content loaded via AJAX
 */
$product_id = $args['product_id'];
$current_url = get_permalink($product_id);
$myaccount_url = wc_get_page_permalink('myaccount');
$login_url = add_query_arg('redirect_to', $current_url, $myaccount_url);
?>

<div id="product-qna" data-product="<?php echo esc_attr($product_id); ?>">

    <div class="header">
        <h3><?php echo esc_html__('Questions about this product', 'multivendorx'); ?></h3>

        <form class="woocommerce-form qna-search">
            <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                <input type="text" id="qna-search" class="woocommerce-Input woocommerce-Input--text input-text"
                    placeholder="<?php echo esc_attr__('Have a question? Search for an answer.', 'multivendorx'); ?>">
            </p>
        </form>
    </div>

    <!-- Questions List (populated via AJAX) -->
    <ul id="qna-list"></ul>

    <!-- Success Message -->
    <div id="qna-success-message" class="qna-notice" style="display:none;">
        <?php echo esc_html__('Your question has been submitted successfully. It will appear once answered.', 'multivendorx'); ?>
    </div>

    <!-- Login Prompt Only -->
    <?php if (!is_user_logged_in()): ?>
        <div class="login-wrapper">
            <div class="description"><?php echo esc_html__('Can’t find your answer?', 'multivendorx'); ?></div>
            <a class="button"
                href="<?php echo esc_url($login_url); ?>"><?php echo esc_html__('Log in', 'multivendorx'); ?></a>
            <span><?php echo esc_html__('to share your question with us.', 'multivendorx'); ?></span>
        </div>
    <?php endif; ?>

</div>