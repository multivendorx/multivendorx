<?php
/**
 * Elementor Template for Store with Header and Footer
 */
if ( ! defined( 'ABSPATH' ) ) exit;

$store_slug = get_query_var( 'store' );
$elementor_template_id = false;

// Get template ID
if ( class_exists( '\Elementor\Plugin' ) && did_action( 'elementor/loaded' ) ) {
    $args = [
        'post_type' => 'elementor_library',
        'posts_per_page' => 1,
        'post_status' => 'publish',
        'meta_query' => [
            [
                'key' => '_elementor_template_type',
                'value' => 'multivendorx-store',
            ]
        ]
    ];
    
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
            echo \Elementor\Plugin::instance()->frontend->get_builder_content( $elementor_template_id );
        } else {
            ?>
            <div class="store-no-template">
                <p><?php _e( 'No store template found. Please create a Store Page template in Elementor.', 'multivendorx' ); ?></p>
            </div>
            <?php
        }
        ?>
    </div>
</main>

<?php
get_footer();