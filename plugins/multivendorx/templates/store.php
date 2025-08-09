<?php

echo "hellooooo";

$store_tabs    = MultiVendorX()->storeutil->get_store_tabs($args['store_id']);
foreach ( $store_tabs as $key => $tab ) { 
    if ( $tab['url'] ) : ?>
        <li><a href="<?php echo esc_url( $tab['url'] ); ?>"><?php echo esc_html( $tab['title'] ); ?></a></li>
    <?php endif; 
}