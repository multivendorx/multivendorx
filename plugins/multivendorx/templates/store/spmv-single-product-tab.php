<?php
/**
 * Template to display the more offers tab in single product page.
 *
 * Override this template by copying it to yourtheme/dc-woocommerce-multi-vendor/store/spmv-single-product-tab.php
 *
 * @package     MultiVendorX/Templates
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */

use MultiVendorX\Store\Store;
use MultiVendorX\StoreReview\Util;

$product_ids = $args['product_ids'];
?>

<table class="woocommerce-table shop_table more-offers-table">
    <thead>
        <tr>
            <th>Store</th>
            <th>Price</th>
            <th></th>
        </tr>
    </thead>
    <tbody>
        <?php
        foreach ( $product_ids as $product_id ) :
            $product = wc_get_product( $product_id );
            if ( ! $product ) {
				continue;
            }

            $store_id        = get_post_meta( $product_id, 'multivendorx_store_id', true );
            $store           = new Store( $store_id );
            $overall_reviews = Util::get_overall_rating( $store_id );
            $reviews         = count( Util::get_reviews_by_store( $store_id ) );
			?>
            <tr>
                <td>
                    <?php echo esc_html( $store->get( 'name' ) ?? 'Admin' ); ?>

                    <div class="reviews-wrapper">
                        <?php for ( $i = 0; $i < 5; $i++ ) : ?>
                            <i
                                class="review adminfont-star
                                <?php
                                    echo (
                                        $reviews > 0 &&
                                        $i < round( $overall_reviews )
															) ? '' : '-o';
								?>
                                "
                            ></i>
                        <?php endfor; ?>
                    </div>

                </td>

                <td><?php echo wc_price( $product->get_price() ); ?></td>

                <td>
                    <?php woocommerce_template_loop_add_to_cart( array( 'product' => $product ) ); ?>
                    <a href="<?php echo get_permalink( $product_id ); ?>" class="button">
                        Details
                    </a>
                </td>
            </tr>
        <?php endforeach; ?>
    </tbody>
</table>

