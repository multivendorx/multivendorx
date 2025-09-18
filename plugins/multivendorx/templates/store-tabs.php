<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$store_id = $args['store_id'];

// Get store tabs
$store_tabs = MultiVendorX()->store->storeutil->get_store_tabs( $store_id );

if ( empty( $store_tabs ) ) {
	return;
}

$current_tab = 'products'; // default
$request_url = trailingslashit( home_url( add_query_arg( [], $wp->request ) ) );

// Loop through tabs
foreach ( $store_tabs as $key => $tab ) {
    if ( ! empty( $tab['url'] ) ) {
        // Compare current URL with tab URL
        if ( untrailingslashit( $tab['url'] ) === untrailingslashit( $request_url ) ) {
            $current_tab = $key;
            break;
        }
    }
}

?>
<ul class="mvx-store-tabs">
    <?php foreach ( $store_tabs as $key => $tab ) : ?>
        <?php if ( ! empty( $tab['url'] ) ) : ?>
            <li class="mvx-store-tab <?php echo esc_attr( $key ); ?>">
                <a href="<?php echo esc_url( $tab['url'] ); ?>">
                    <?php echo esc_html( $tab['title'] ); ?>
                </a>
            </li>
        <?php endif; ?>
    <?php endforeach; ?>
</ul>


<div class="mvx-store-tab-content">
<?php
switch ( $current_tab ) {
    case 'reviews':
        MultiVendorX()->util->get_template( 'store-review.php', ['store_id' => $store_id] );
        break;

    case 'policy':
        MultiVendorX()->util->get_template( 'store-policy.php', ['store_id' => $store_id] );
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

					<?php while ( have_posts() ) : the_post(); ?>

						<?php
						/**
						 * Hook: woocommerce_shop_loop
						 */
						do_action( 'woocommerce_shop_loop' );

						wc_get_template_part( 'content', 'product' ); // standard product card
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
