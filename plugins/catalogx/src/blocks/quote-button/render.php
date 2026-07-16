<?php

use CatalogX\Quote\Module;

// Extract the productId from attributes.
$product_id = isset( $attributes['productId'] ) ? intval( $attributes['productId'] ) : null;

if ( CatalogX()->modules->is_active( 'quote' ) ) {
    CatalogX()->render_quote_btn_via = 'block';
    Module::init()->frontend->add_button_for_quote( $product_id );
}
