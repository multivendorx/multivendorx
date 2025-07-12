<?php
use CatalogX\Enquiry\Module;

// Extract the productId from attributes
$product_id = isset($attributes['productId']) ? intval($attributes['productId']) : null;

Module::init()->frontend->add_enquiry_button($product_id);
