<?php
/**
 * Store tabs template.
 *
 * Override this template by copying it to yourtheme/dc-woocommerce-multi-vendor/store/store-tabs.php
 *
 * @package     MultiVendorX/Templates
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$store_id = $args['store_id'];

// Get store tabs.
$store_tabs = MultiVendorX()->store->storeutil->get_store_tabs( $store_id );

if ( empty( $store_tabs ) ) {
	return;
}

$current_tab = 'products'; // Default.
$request_url = trailingslashit( home_url( add_query_arg( array(), $wp->request ) ) );

// Loop through tabs.
foreach ( $store_tabs as $key => $tab ) {
    if ( ! empty( $tab['url'] ) ) {
        // Compare current URL with tab URL.
        if ( untrailingslashit( $tab['url'] ) === untrailingslashit( $request_url ) ) {
            $current_tab = $key;
            break;
        }
    }
}

?>
<ul class="multivendorx-store-tabs">
    <?php foreach ( $store_tabs as $key => $tab ) : ?>
        <?php if ( ! empty( $tab['url'] ) ) : ?>
            <li class="multivendorx-store-tab <?php echo esc_attr( $key ); ?> <?php echo ( $current_tab === $key ) ? 'active' : ''; ?>">
                <a href="<?php echo esc_url( $tab['url'] ); ?>">
                    <?php echo esc_html( $tab['title'] ); ?>
                </a>
            </li>
        <?php endif; ?>
    <?php endforeach; ?>
</ul>


<div class="multivendorx-policies-accordion">
<?php
switch ( $current_tab ) {
    case 'reviews':
        MultiVendorX()->util->get_template( 'store/store-review.php', array( 'store_id' => $store_id ) );
        break;

    case 'policy':
        MultiVendorX()->util->get_template( 'store/store-policy.php', array( 'store_id' => $store_id ) );
        break;

    case 'products':
    default:
        ?>
        <div class="woocommerce">
			<?php if ( woocommerce_product_loop() ) : ?>

				<?php
				/**
				 * Hook: woocommerce_before_shop_loop
				 * - Notices
				 * - Result count
				 * - Sorting dropdown
				 */
				do_action( 'woocommerce_before_shop_loop' );
				?>

				<?php woocommerce_product_loop_start(); ?>

					<?php
                    while ( have_posts() ) :
						the_post();
						?>

						<?php
						/**
						 * Hook: woocommerce_shop_loop
						 */
						do_action( 'woocommerce_shop_loop' );

						wc_get_template_part( 'content', 'product' ); // Standard product card.
						?>

					<?php endwhile; ?>

				<?php woocommerce_product_loop_end(); ?>

				<?php
				/**
				 * Hook: woocommerce_after_shop_loop
				 * - Pagination
				 */
				do_action( 'woocommerce_after_shop_loop' );
				?>

			<?php else : ?>

				<?php
				/**
				 * Hook: woocommerce_no_products_found
				 */
				do_action( 'woocommerce_no_products_found' );
				?>

			<?php endif; ?>
		</div>
        <?php
        break;
}
?>
</div>
