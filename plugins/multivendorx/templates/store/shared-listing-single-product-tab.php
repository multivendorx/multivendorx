<?php
/**
 * Template to display the more offers tab in single product page.
 *
 * Override this template by copying it to yourtheme/dc-woocommerce-multi-vendor/store/shared-listing-single-product-tab.php
 *
 * @package     MultiVendorX/Templates
 * @version     5.0.0
 * @author      MultiVendorX
 */

use MultiVendorX\Store\Store;
use MultiVendorX\StoreReview\Util;

$product_ids = $args['product_ids'];
?>

<table class="woocommerce-table shop_table more-offers-table">
    <thead>
        <tr>
            <th><?php esc_html_e( 'Store', 'multivendorx' ); ?></th>
            <th><?php esc_html_e( 'Price', 'multivendorx' ); ?></th>
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
            if ( ! $store->exists() ) {
                continue;
            }
            $overall_reviews = Util::get_overall_rating( $store_id );
            $reviews         = count( Util::get_reviews_by_store( $store_id ) );
            ?>
            <tr>
                <td>
                    <?php echo esc_html( $store->get( 'name' ) ?? __( 'Admin', 'multivendorx' ) ); ?>

                    <div class="reviews-wrapper">
                        <?php for ( $i = 0; $i < 5; $i++ ) : ?>
                            <i
                                class="review adminfont-star
                                <?php
                                    echo esc_attr(
                                        ( $reviews > 0 && $i < round( $overall_reviews ) ) ? '' : '-o'
                                    );
                                ?>
                                "
                            ></i>
                        <?php endfor; ?>
                    </div>

                </td>

                <td><?php echo wp_kses_post( wc_price( $product->get_price() ) ); ?></td>

                <td>
                    <?php woocommerce_template_loop_add_to_cart( array( 'product' => $product ) ); ?>
                    <a href="<?php echo esc_url( get_permalink( $product_id ) ); ?>" class="button">
                        <?php esc_html_e( 'Details', 'multivendorx' ); ?>
                    </a>
                </td>
            </tr>
        <?php endforeach; ?>
    </tbody>
</table>