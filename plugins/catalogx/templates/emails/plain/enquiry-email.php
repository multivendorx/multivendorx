<?php
/**
 * CatalogX Enquiry Email (Plain Text)
 *
 * @author 	MultiVendorX
 * @version  6.0.0
 */
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
$enquiry_data = $args['enquiry_data'];

echo $email_heading . "\n\n";

echo sprintf( __( "Dear Admin", 'catalogx' ) ) . "\n\n";
echo sprintf( __( "Please find the product enquiry, details are given below", 'catalogx' ) ) . "\n\n";

echo "\n****************************************************\n\n";

$product_obj = wc_get_product( key($args['product_id']) );

echo "\n Product Name : ".$product_obj->get_name();

if($product_obj->get_type() == 'variation'){
    if(isset($enquiry_data['variations']) && count($enquiry_data['variations']) > 0 ){
            foreach ($enquiry_data['variations'] as $label => $value) {
                $label = str_replace( 'attribute_pa_', '', $label );
                $label = str_replace( 'attribute_', '', $label );
                echo "\n".ucfirst($label).": ".ucfirst($value);
            } 
        }else{
            if($product_obj->get_attributes()){
                foreach ($product_obj->get_attributes() as $label => $value) {
                  echo "\n".ucfirst(wc_attribute_label($label)).": ".ucfirst($value);
                }
            }
        }
}

echo "\n\n Product link : ".$product_obj->get_permalink();
if($product_obj->get_sku())
    echo "\n\n Product SKU : ".$product_obj->get_sku();

echo "\n\n\n****************************************************\n\n";

echo "\n Customer Details : ";

echo "\n\n\n Name : ".$enquiry_data['cust_name'];

echo "\n\n Email : ".$enquiry_data['cust_email'];
if(isset($enquiry_data['phone']))
    echo "\n\n User Phone : ".$enquiry_data['phone'];
if(isset($enquiry_data['address']))
    echo "\n\n User Address : ".$enquiry_data['address'];
if(isset($enquiry_data['subject']))
    echo "\n\n User Subject : ".$enquiry_data['subject'];
if(isset($enquiry_data['comment']))
    echo "\n\n User Comments : ".$enquiry_data['comment'];

echo "\n\n\n****************************************************\n\n";

echo apply_filters('catalogx_email_footer_text', sprintf( __( '%s - Powered by CatalogX', 'catalogx' ), get_bloginfo( 'name', 'display' ) ) );