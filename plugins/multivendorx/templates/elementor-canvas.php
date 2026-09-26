<?php
/**
 * Elementor Template for Store with Header and Footer.
 *
 * Loads the Elementor template for a store page if available.
 *
 * @package MultiVendorX
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$store_slug            = MultiVendorX()->setting->get_setting( 'store_url', 'store' );
$elementor_template_id = false;

// Get Elementor template ID for the store page.
if ( class_exists( '\Elementor\Plugin' ) && did_action( 'elementor/loaded' ) ) {
    $args = array(
        'post_type'      => 'elementor_library',
        'posts_per_page' => 1,
        'post_status'    => 'publish',
        'meta_query'     => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
            array(
                'key'   => '_elementor_template_type',
                'value' => 'multivendorx-store',
            ),
        ),
    );

    $templates = get_posts( $args );
    if ( ! empty( $templates ) ) {
        $elementor_template_id = $templates[0]->ID;
    }
}

get_header();
?>

<main id="main" class="site-main store-page-content" role="main">
    <div class="store-container">
        <?php
        if ( $elementor_template_id && class_exists( '\Elementor\Plugin' ) ) {
            $elementor_content = \Elementor\Plugin::instance()->frontend->get_builder_content( $elementor_template_id );
            echo wp_kses_post( $elementor_content );
        } else {
            ?>
            <div class="store-no-template">
                <p><?php echo esc_html__( 'No store template found. Please create a Store Page template in Elementor.', 'multivendorx' ); ?></p>
            </div>
            <?php
        }
        ?>
    </div>
</main>

<?php
get_footer();