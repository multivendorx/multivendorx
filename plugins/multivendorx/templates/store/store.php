<?php
/**
 * Store Shop Template
 *
 * Override this template by copying it to yourtheme/dc-woocommerce-multi-vendor/store/store.php
 *
 * @package     MultiVendorX/Templates
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

$store_slug = get_query_var( MultiVendorX()->setting->get_setting( 'store_url', 'store' ) );
$store      = MultiVendorX\Store\Store::get_store( $store_slug, 'slug' );
$store_id   = $store->get_id();

if ( ! $store_id ) {
    wp_safe_redirect( wc_get_page_permalink( 'shop' ) );
    exit();
}

get_header( 'shop' );

?>

    <header class="woocommerce-products-header">
        <?php if ( apply_filters( 'mvx_show_page_title', false ) ) : ?>
            <h1 class="woocommerce-products-header__title page-title">
                <?php woocommerce_page_title(); ?>
            </h1>
        <?php endif; ?>

        <?php
        // Store banner & vendor info.
        do_action( 'multivendorx_archive_description' );
        MultiVendorX()->util->get_template( 'store/store-banner-info.php', array( 'store_id' => $store_id ) );
        do_action( 'multivendorx_after_store_banner', $store_id );
        ?>
    </header>
    
    <?php
    // Tabs and content with sidebar - now handled in store-tabs.php.
    MultiVendorX()->util->get_template( 'store/store-tabs.php', array( 'store_id' => $store_id ) );
    ?>

<?php

get_footer( 'shop' );
?>