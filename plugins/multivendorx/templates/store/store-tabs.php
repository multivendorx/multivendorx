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

use MultiVendorX\Utill;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$store_id = $args['store_id'];

// Get store tabs.
$store_tabs = MultiVendorX()->store->storeutil->get_store_tabs( $store_id );

if ( empty( $store_tabs ) ) {
	return;
}

$current_tab      = 'products'; // Default.
$sidebar_position = MultiVendorX()->setting->get_setting( 'store_sidebar', array() );

$current_tab = 'products';
$tab = sanitize_key(filter_input(INPUT_GET, 'tab') ?? '');
// Plain permalink.
if ($tab) {
    $current_tab = $tab;
} else {
    // Pretty permalink.
    $request_uri = filter_input(INPUT_SERVER, 'REQUEST_URI', FILTER_SANITIZE_URL) ?? '';
    $path        = trim(parse_url($request_uri, PHP_URL_PATH) ?? '', '/');
    $segments = explode('/', $path);
    $last     = sanitize_key(end($segments));

    if ($last && isset($store_tabs[$last])) {
        $current_tab = $last;
    }
}

do_action( 'multivendorx_before_store_tabs', $store_id );
?>
<div class="multivendorx-store-wrapper">
    <!-- left sidebar -->
    <?php
    if ( in_array( $sidebar_position, array( 'left' ), true ) ) {
        ?>
        <aside class="multivendorx-store-sidebar <?php echo esc_attr( $sidebar_position ); ?>">
            <?php
            if ( is_active_sidebar( 'multivendorx-store-sidebar' ) ) {
                dynamic_sidebar( 'multivendorx-store-sidebar' );
            }
            ?>
        </aside>
        <?php
    }
    ?>
    
    <div class="woocommerce">
        <div class="product">
            <div class="woocommerce-tabs wc-tabs-wrapper">
                <ul class="tabs wc-tabs">
                    <?php foreach ( $store_tabs as $tab_key => $tab_item ) : ?>
                        <?php if ( ! empty( $tab_item['url'] ) ) : ?>
                            <li class="<?php echo esc_attr( $tab_key ); ?> <?php echo ( $current_tab === $tab_key ) ? 'active' : ''; ?>">
                                <a href="<?php echo esc_url( $tab_item['url'] ); ?>">
                                    <?php echo esc_html( $tab_item['title'] ); ?>
                                </a>
                            </li>
                        <?php endif; ?>
                    <?php endforeach; ?>
                </ul>

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
                        $search_keyword = filter_input(
                            INPUT_GET,
                            'store_search',
                            FILTER_SANITIZE_SPECIAL_CHARS
                        );

                        $search_keyword = $search_keyword ? trim( $search_keyword ) : '';
                        $paged_number   = get_query_var( 'paged' ) ? get_query_var( 'paged' ) : 1;

                        $args = array(
                            'post_type'      => 'product',
                            'posts_per_page' => get_option( 'posts_per_page' ),
                            'paged'          => $paged_number,
                            'author'         => $store_id,
                            'post_status'    => 'publish',
                            'meta_query'     => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
                                array(
                                    'key'     => Utill::POST_META_SETTINGS['store_id'],
                                    'value'   => $store_id,
                                    'compare' => '=',
                                ),
                            ),
                        );

                        if ( ! empty( $search_keyword ) ) {
                            $args['s'] = $search_keyword;
                        }

                        $args = apply_filters(
                            'multivendorx_store_product_query_args',
                            $args,
                            $store_id,
                            $search_keyword,
                            $paged_number
                        );

                        $products = new WP_Query( $args );
                        ?>
                        <div class="panel entry-content wc-tab">
                            <form method="get" class="store-product-search">
                                <input
                                    type="search"
                                    name="store_search"
                                    placeholder="<?php esc_attr_e( 'Search products...', 'multivendorx' ); ?>"
                                    value="<?php echo esc_attr( $search_keyword ); ?>"
                                    autocomplete="off" />

                                <?php
                                // Preserve pagination if needed.
                                if ( $paged_number > 1 ) :
                                    ?>
                                    <input type="hidden" name="paged" value="<?php echo esc_attr( $paged_number ); ?>">
                                <?php endif; ?>
                            </form>
                            
                            <?php if ( $products->have_posts() ) : ?>
                                <?php woocommerce_product_loop_start(); ?>
                                <?php
                                while ( $products->have_posts() ) :
									$products->the_post();
									?>
                                    <?php
                                    do_action( 'woocommerce_shop_loop' );
                                    wc_get_template_part( 'content', 'product' );
                                    ?>
                                <?php endwhile; ?>
                                <?php woocommerce_product_loop_end(); ?>
                                
                                <?php
                                echo paginate_links( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                                    array(
                                        'total' => $products->max_num_pages,
                                    )
                                );
                                ?>
                            <?php else : ?>
                                <?php do_action( 'woocommerce_no_products_found' ); ?>
                            <?php endif; ?>
                            <?php wp_reset_postdata(); ?>
                        </div>
                        <?php
                        break;
                }
                ?>
            </div>
        </div>
    </div>
    
    <!-- right sidebar -->
    <?php
    if ( in_array( $sidebar_position, array( 'right' ), true ) ) {
        ?>
        <aside class="multivendorx-store-sidebar <?php echo esc_attr( $sidebar_position ); ?>">
            <?php
            if ( is_active_sidebar( 'multivendorx-store-sidebar' ) ) {
                dynamic_sidebar( 'multivendorx-store-sidebar' );
            }
            ?>
        </aside>
        <?php
    }
    ?>
</div>