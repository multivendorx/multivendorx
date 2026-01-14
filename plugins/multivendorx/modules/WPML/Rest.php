<?php

/**
 * Modules class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\WPML;

defined('ABSPATH') || exit;

/**
 * MultiVendorX REST API WPML controller.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Rest extends \WP_REST_Controller
{

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'multivendorx-wpml';

    /**
     * Constructor.
     */
    public function __construct()
    {
        add_action('rest_api_init', array($this, 'register_routes'), 10);
    }

    /**
     * Register the routes for the objects of the controller.
     */
    public function register_routes()
    {
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array($this, 'get_items'),
                    'permission_callback' => array($this, 'get_items_permissions_check'),
                ),
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array($this, 'update_item'),
                    'permission_callback' => array($this, 'update_item_permissions_check'),
                ),
            )
        );
    }

    /**
     * Get all WPMLs filtered by store, search, and date.
     *
     * @param object $request Full details about the request.
     */
    public function get_items_permissions_check($request)
    {
        return current_user_can('read_shop_orders') || current_user_can('edit_shop_orders');
    }

    /**
     * Update an existing WPML.
     *
     * @param object $request Full details about the request.
     */
    public function update_item_permissions_check($request)
    {
        return current_user_can('edit_shop_orders');
    }


    /**
     * Get all WPMLs filtered by store, search, and date.
     * 100% WooCommerce-native (no raw SQL).
     */
    public function get_items( $request ) {

        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );
    
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log( $error );
            }
    
            return $error;
        }
    
        try {
    
            // Check WPML availability
            if ( ! defined( 'ICL_SITEPRESS_VERSION' ) ) {
                throw new \Exception( 'WPML not active' );
            }
    
            global $sitepress, $wpml_post_translations;
    
            // Get active WPML languages
            $languages = apply_filters(
                'wpml_active_languages',
                null,
                array(
                    'skip_missing' => 0,
                    'orderby'      => 'code',
                )
            );
    
            if ( empty( $languages ) ) {
                return rest_ensure_response( array() );
            }
    
            // Current / default language
            $current_language = $sitepress->get_current_language();
    
            // Optional product_id
            $product_id = absint( $request->get_param( 'product_id' ) );
    
            // Get translation group ID only if product_id exists
            $trid = $product_id
                ? $wpml_post_translations->get_element_trid( $product_id )
                : null;
    
            $response = array();
    
            foreach ( $languages as $lang ) {
    
                $translated_product_id = null;
    
                // Resolve translation only when product_id is provided
                if ( $product_id && $lang['code'] !== $current_language && $trid ) {
                    $translated_product_id = $wpml_post_translations->element_id_in(
                        $product_id,
                        $lang['code']
                    );
                }
    
                $response[] = array(
                    'code'                  => $lang['code'],
                    'name'                  => $lang['translated_name'],
                    'native_name'           => $lang['native_name'],
                    'flag_url'              => $lang['country_flag_url'] ?? '',
                    'is_default'            => $lang['code'] === $current_language,
                    'translated_product_id' => $product_id
                        ? ( $translated_product_id ? absint( $translated_product_id ) : null )
                        : null,
                );
            }
    
            return rest_ensure_response( $response );
    
        } catch ( \Exception $e ) {
            return new \WP_Error(
                'WPML_failed',
                __( 'WPML Failed', 'multivendorx' ),
                array( 'status' => 400 )
            );
        }
    }
    
    /**
     * Create a new translated product (WPML duplicate).
     *
     * @param \WP_REST_Request $request
     */
    public function update_item($request)
    {
        $nonce = $request->get_header('X-WP-Nonce');
        if (! wp_verify_nonce($nonce, 'wp_rest')) {
            return new \WP_Error(
                'invalid_nonce',
                __('Invalid nonce', 'multivendorx'),
                array('status' => 403)
            );
        }
    
        // WPML check
        if (! defined('ICL_SITEPRESS_VERSION')) {
            return new \WP_Error(
                'wpml_not_active',
                __('WPML not active', 'multivendorx'),
                array('status' => 400)
            );
        }
    
        global $sitepress, $wpml_post_translations;
    
        $product_id = absint($request->get_param('product_id'));
        $lang_code  = sanitize_text_field($request->get_param('lang'));
    
        if (! $product_id || ! $lang_code) {
            return new \WP_Error(
                'invalid_data',
                __('Missing product ID or language', 'multivendorx'),
                array('status' => 400)
            );
        }
    
        // Save current language to restore later
        $original_lang = $sitepress->get_current_language();
        $default_language = $sitepress->get_default_language();
    
        try {
            // Prevent duplicate creation if translation already exists
            $existing = $wpml_post_translations->element_id_in($product_id, $lang_code);
            if ($existing) {
                return rest_ensure_response(array(
                    'product_id' => absint($existing),
                    'existing'   => true,
                ));
            }
    
            // Create translated duplicate product
            $new_product_id = apply_filters(
                'wpml_copy_post_to_language',
                $product_id,
                $lang_code,
                false
            );
    
            if (! $new_product_id) {
                throw new \Exception('Failed to create translation');
            }
    
            // MVX hook for post-creation logic
            do_action('mvx_after_translated_new_product', $new_product_id);
    
            return rest_ensure_response(array(
                'product_id' => absint($new_product_id),
                'existing'   => false,
            ));
    
        } catch (\Exception $e) {
            return new \WP_Error(
                'wpml_create_failed',
                __('Failed to create translated product', 'multivendorx'),
                array('status' => 400)
            );
    
        } finally {
            // ALWAYS restore original language
            $sitepress->switch_lang($original_lang ?: $default_language);
        }
    }
}
