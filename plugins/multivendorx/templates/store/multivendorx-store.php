<?php
/**
 * Template loader for MultiVendorX Store
 */

$store_name = get_query_var( 'store' ); // or $this->custom_store_url

if ( ! $store_name ) {
    get_header();
    echo '<p>Store not found.</p>';
    get_footer();
    return;
}

// Optionally, get WP template
$block_template = get_posts( array(
    'post_type' => 'wp_template',
    'name'      => 'multivendorx-store',
    'posts_per_page' => 1,
) );

get_header();

if ( ! empty( $block_template ) ) {
    echo apply_filters( 'the_content', $block_template[0]->post_content );
} else {
    // fallback static HTML
    echo '<h2>Store Template</h2>';
}

get_footer();
