<?php
/**
 * Plugin block template wrapper
 * Renders plugin block template for /store/{store_slug}/ endpoint
 */

defined( 'ABSPATH' ) || exit;

get_header();

// Get store slug from query var
$store_slug = get_query_var( 'store' );

global $post;

if ( $post && ! empty( $post->post_content ) ) {
    echo do_blocks( $post->post_content ); // renders blocks edited in Gutenberg
} else {
    // Fallback (unlikely, page should have content)
    $block_template_path = MultiVendorX()->plugin_path . 'templates/store/store.html';
    $blocks_html         = file_exists( $block_template_path ) ? file_get_contents( $block_template_path ) : '';
    echo do_blocks( $blocks_html );
}


get_footer();
