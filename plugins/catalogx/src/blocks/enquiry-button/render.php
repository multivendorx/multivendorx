<?php
use CatalogX\Enquiry\Module;

// Extract the productId from attributes
$product_id = isset( $attributes['productId'] ) ? intval( $attributes['productId'] ) : null;
CatalogX()->render_enquiry_btn_via = 'block';
Module::init()->frontend->render_product_enquiry_button( $product_id );
