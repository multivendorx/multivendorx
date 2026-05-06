<?php
/**
 * Template Name: Store Dashboard (No Header/Footer)
 *
 * Override this template by copying it to yourtheme/dc-woocommerce-multi-vendor/store/store-dashboard.php
 *
 * @package     MultivendorX/Templates
 * @version     5.0.0
 * @author      MultiVendorX
 */

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>

    <div id="multivendorx-store-dashboard" class="admin-main-wrapper"></div>

    <?php wp_footer(); ?>
</body>
</html>
