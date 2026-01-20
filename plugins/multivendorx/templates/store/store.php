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

$store_id = $args['store_id'];
if ( ! $store_id ) {
    wp_safe_redirect( wc_get_page_permalink( 'shop' ) );
    exit();
}

get_header( 'shop' );

do_action( 'woocommerce_before_main_content' );
if (MultiVendorX()->setting->get_setting( 'store_sidebar' ) == 'left') {
    get_sidebar();
}
?>
<div class="mvx-store-wrapper">

    <header class="woocommerce-products-header">
        <?php if ( apply_filters( 'mvx_show_page_title', false ) ) : ?>
            <h1 class="woocommerce-products-header__title page-title">
                <?php woocommerce_page_title(); ?>
            </h1>
        <?php endif; ?>

        <?php
        // Store banner & vendor info.
        do_action( 'mvx_archive_description' );
        MultiVendorX()->util->get_template( 'store/store-banner-info.php', array( 'store_id' => $store_id ) );
        ?>
    </header>

    <?php
    // Tabs.
    MultiVendorX()->util->get_template( 'store/store-tabs.php', array( 'store_id' => $store_id ) );
	?>

</div>

<?php
// if (MultiVendorX()->setting->get_setting( 'store_sidebar' ) == 'right') {
//     get_sidebar();
// }
$sidebar_position = MultiVendorX()->setting->get_setting( 'store_sidebar', array() );
if ( in_array( $sidebar_position, array( 'left', 'right' ), true ) ) {
    ?>
    <aside class="multivendorx-store-sidebar multivendorx-store-sidebar-<?php echo esc_attr( $sidebar_position ); ?>">
        <?php
        if ( is_active_sidebar( 'multivendorx-store-sidebar' ) ) {
            dynamic_sidebar( 'multivendorx-store-sidebar' );
        }
        ?>
    </aside>
    <?php
}

do_action( 'woocommerce_after_main_content' );

get_footer( 'shop' );
