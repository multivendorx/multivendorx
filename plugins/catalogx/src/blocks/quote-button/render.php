<?php
use CatalogX\Quote\Module;

// Extract the productId from attributes
$product_id = isset($attributes['productId']) ? intval($attributes['productId']) : null;

Module::init()->frontend->add_button_for_quote($product_id);
