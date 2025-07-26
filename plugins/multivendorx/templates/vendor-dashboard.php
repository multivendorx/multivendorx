<?php
/**
 * Template Name: Vendor Dashboard (No Header/Footer)
 */
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
    <div id="vendor-dashboard">
    <?php echo do_shortcode( '[multivendorx_vendor_dashboard]' ); ?>
    </div>
    <?php wp_footer(); ?>
</body>
</html>
