<?php
/**
 * AI Assistant REST API Controller
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\RestAPI\Controllers;

defined( 'ABSPATH' ) || exit;

class ImportDummyData extends \WP_REST_Controller {

    /**
     * Route Base.
     *
     * @var string
     */
    protected $rest_base = 'import-dummy-data';

    /**
     * Register AI Assistant API routes
     */
    public function register_routes() {
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE, // POST
                    'callback'            => array( $this, 'process_action' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                ),
                array(
                    'methods'             => \WP_REST_Server::READABLE, // GET
                    'callback'            => array( $this, 'get_status' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                ),
            )
        );
    }

    /**
     * Permission check for AI Operations
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'edit_products' );
    }

    /**
     * Process action request
     *
     * @param \WP_REST_Request $request
     */
    public function process_action( $request ) {

        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            if ( is_wp_error( $error ) ) {
                 MultiVendorX()->util->log( $error );
            }

            return $error;
        }
            
        $action    = $request->get_param( 'action' );

        if (method_exists( $this, $action ) ) {
            return $this->$action( $request );
        }

        return array(
            'success' => false,
            'message' => 'Unknown action',
        );
    }

    /**
     * Get current status
     */
    public function get_status( $request ) {
        $task = $request->get_param( 'task' );
        $status    = get_transient( 'multivendorx_import_status_' . $task ) ?: array();

        return array(
            'success' => true,
            'running' => ! empty( $status ),
            'status'  => $status,
        );
    }

    public function import_store_owners( ) {
        $xml = $this->load_dummy_xml( 'store_owners' );

        $store_owners = array();

        foreach ( $xml->store as $store ) {
            $username = (string) $store->username;
            $email    = (string) $store->email;

            // Check if user already exists
            $user = get_user_by( 'login', $username );

            if ( $user ) {
                $user_id = $user->ID;
            } else {
                $userdata = array(
                    'user_login'    => $username,
                    'user_pass'     => (string) $store->password,
                    'user_email'    => $email,
                    'user_nicename' => (string) $store->nickname,
                    'first_name'    => (string) $store->firstname,
                    'last_name'     => (string) $store->lastname,
                    'role'          => 'store_owner',
                );

                $user_id = wp_insert_user( $userdata );

                if ( is_wp_error( $user_id ) ) {
                    MultiVendorX()->util->log( $user_id );
                    continue;
                }
            }

            $store_owners[] = (int) $user_id;

            // Image handling
            if ( isset( $store->images->image ) ) {
                foreach ( $store->images->image as $image ) {
                    $src    = plugins_url( 'multivendorx/' . (string) $image->src );
                    $upload = wc_rest_upload_image_from_url( esc_url_raw( $src ) );

                    if ( is_wp_error( $upload ) ) {
                        continue;
                    }

                    $attachment_id = wc_rest_set_uploaded_image_as_attachment( $upload, $user_id );

                    if ( wp_attachment_is_image( $attachment_id ) ) {
                        if ( 'store' === (string) $image->position ) {
                            update_user_meta( $user_id, '_store_image', $attachment_id );
                        } elseif ( 'cover' === (string) $image->position ) {
                            update_user_meta( $user_id, '_store_banner', $attachment_id );
                        }
                    }
                }
            }
        }

            $response_data = array(
            'success' => true,
            'data'    => $store_owners,
            'message' => __( 'Store owners imported successfully.', 'multivendorx' )
        );
        
        $response = rest_ensure_response( $response_data );
        $response->header( 'X-WP-Total', count( $store_owners ) );
        
        return $response;
    }

    private function load_dummy_xml( string $filename ) {

        $base_path = trailingslashit( MultiVendorX()->plugin_path ) . 'assets/dummy-data/';
        $file_path = $base_path . $filename . '.xml';

        if ( ! file_exists( $file_path ) ) {
            return new \WP_Error(
                'file_not_found',
                sprintf(
                    __( '%s XML file not found.', 'multivendorx' ),
                    ucfirst( str_replace( '_', ' ', $filename ) )
                ),
                array( 'status' => 404 )
            );
        }

        libxml_use_internal_errors( true );
        $xml = simplexml_load_file( $file_path );

        if ( ! $xml ) {
            return new \WP_Error(
                'invalid_xml',
                __( 'Invalid XML structure.', 'multivendorx' ),
                array( 'status' => 400 )
            );
        }

        return $xml;
    }

    public function import_stores( $request ) {

        $xml = $this->load_dummy_xml( 'stores' );

        $created_store_ids = array();

        foreach ( $xml->store as $store ) {
            $params = $request->get_json_params();
            $store_owners = $params['responseData'] ;
            $owner_index  = (int) $store->owner_index;
            $owner_id     = $store_owners[ $owner_index ] ?? 0;

            if ( ! $owner_id ) {
                continue;
            }

            $store_slug = sanitize_title( (string) $store->slug );

            // CHECK IF STORE ALREADY EXISTS BY SLUG
            if ( \MultiVendorX\Store\Store::store_slug_exists( $store_slug ) ) {
                // Store already exists → skip creation
                continue;
            }

            // Create store object
            $store_obj = new \MultiVendorX\Store\Store();

            $store_data = array(
                'name'        => (string) $store->name,
                'slug'        => $store_slug,
                'description' => (string) $store->description,
                'status'      => (string) $store->status,
                'who_created' => $owner_id,
            );

            foreach ( $store_data as $key => $value ) {
                $store_obj->set( $key, $value );
            }

            // Save store
            $store_id = $store_obj->save();

            if ( ! $store_id ) {
                continue;
            }

            // Assign owner
            \MultiVendorX\Store\StoreUtil::set_primary_owner( $owner_id, $store_id );

            // Store meta
            $meta_fields = array(
                'phone'     => (string) $store->phone,
                'address_1' => (string) $store->address_1,
                'city'      => (string) $store->city,
                'state'     => (string) $store->state,
                'country'   => (string) $store->country,
                'postcode'  => (string) $store->postcode,
            );

            foreach ( $meta_fields as $key => $value ) {
                if ( ! empty( $value ) ) {
                    $store_obj->update_meta( $key, $value );
                }
            }

            $store_obj->set( 'status', 'active' );
            $store_obj->save();

            $created_store_ids[] = $store_id;
        }

        $response_data = array(
            'success' => true,
            'data'    => $created_store_ids,
            'message' => __( 'Stores imported successfully.', 'multivendorx' )
        );

        $response = rest_ensure_response( $response_data );
        $response->header( 'X-WP-Total', count( $created_store_ids ) );

        return $response;
    }

    public function import_products( $request ) {

        $product_files = array(
            'simple',
            'variable',
            'subscription',
            'variable-subscription',
            'booking',
            'rental',
            'appointment',
            'auction',
            'bundle',
            'gift_card',
        );

        $created_products = array();

        foreach ( $product_files as $product_type ) {
            $xml = $this->load_dummy_xml( $product_type );

            if ( empty( $xml->product ) ) {
                continue;
            }

            foreach ( $xml->product as $product ) {
                $store_index = (int) $product->store_index;
                $params = $request->get_json_params();
                $store_ids   = $params['responseData'] ;
                $store_id    = $store_ids[ $store_index ] ?? 0;
                $sku = (string) $product->sku;

                if ( ! empty( $sku ) ) {
                    $existing_id = wc_get_product_id_by_sku( $sku );
                    if ( $existing_id ) {
                        $created_products[] = $existing_id;
                        continue;
                    }
                }

                if ( ! $store_id ) {
                    continue;
                }

                $store = new \MultiVendorX\Store\Store( $store_id );
                if ( ! $store ) {
                    continue;
                }

                // CREATE PRODUCT
                $product_id = wp_insert_post(
                    array(
						'post_title'   => sanitize_text_field( (string) $product->name ),
						'post_name'    => sanitize_title( (string) $product->slug ),
						'post_content' => wp_kses_post( (string) $product->description ),
						'post_excerpt' => wp_kses_post( (string) $product->short_description ),
						'post_status'  => (string) $product->status ?: 'publish',
						'post_type'    => 'product',
						'post_author'  => get_current_user_id(),
                    )
                );

                if ( is_wp_error( $product_id ) ) {
                    continue;
                }

                update_post_meta( $product_id, 'multivendorx_store_id', $store_id );

                do_action( 'multivendorx_after_product_import', $product_id, $store_id );

                // PRODUCT TYPE
                wp_set_object_terms( $product_id, $product_type, 'product_type' );

                // COMMON META
                update_post_meta( $product_id, '_sku', (string) $product->sku );
                update_post_meta( $product_id, '_visibility', 'visible' );

                if ( isset( $product->price ) ) {
                    update_post_meta( $product_id, '_regular_price', (string) $product->price );
                    update_post_meta( $product_id, '_price', (string) $product->price );
                }

                if ( isset( $product->sale_price ) ) {
                    update_post_meta( $product_id, '_sale_price', (string) $product->sale_price );
                    update_post_meta( $product_id, '_price', (string) $product->sale_price );
                }

                // STOCK
                if ( isset( $product->stock ) ) {
                    update_post_meta( $product_id, '_manage_stock', (string) $product->stock->manage === 'true' ? 'yes' : 'no' );
                    update_post_meta( $product_id, '_stock', (int) $product->stock->quantity );
                    update_post_meta( $product_id, '_stock_status', (string) $product->stock->status );
                }

                // CATEGORIES
                if ( isset( $product->categories->category ) ) {
                    $cats = array();
                    foreach ( $product->categories->category as $cat ) {
                        $cats[] = (int) $cat;
                    }
                    wp_set_object_terms( $product_id, $cats, 'product_cat' );
                }

                // TAGS
                if ( isset( $product->tags->tag ) ) {
                    $tags = array();
                    foreach ( $product->tags->tag as $tag ) {
                        $tags[] = sanitize_text_field( (string) $tag );
                    }
                    wp_set_object_terms( $product_id, $tags, 'product_tag' );
                }

                // SUBSCRIPTIONS
                if ( in_array( $product_type, array( 'subscription', 'variable-subscription' ), true ) ) {
                    update_post_meta( $product_id, '_subscription_price', (string) $product->price );
                    update_post_meta( $product_id, '_subscription_period', (string) $product->period ?: 'month' );
                    update_post_meta( $product_id, '_subscription_interval', (string) $product->interval ?: 1 );
                }

                // VARIABLE PRODUCTS
                if ( isset( $product->variations->variation ) ) {
                    wp_set_object_terms( $product_id, 'variable', 'product_type' );

                    foreach ( $product->variations->variation as $variation ) {
                        $variation_id = wp_insert_post(
                            array(
								'post_title'  => 'Variation',
								'post_name'   => 'product-' . $product_id . '-variation',
								'post_status' => 'publish',
								'post_parent' => $product_id,
								'post_type'   => 'product_variation',
								'post_author' => get_current_user_id(),
                            )
                        );

                        if ( is_wp_error( $variation_id ) ) {
                            continue;
                        }

                        foreach ( $variation->attributes->attribute as $attr ) {
                            update_post_meta(
                                $variation_id,
                                'attribute_' . sanitize_title( (string) $attr->name ),
                                sanitize_text_field( (string) $attr->value )
                            );
                        }

                        update_post_meta( $variation_id, '_regular_price', (string) $variation->price );
                        update_post_meta( $variation_id, '_price', (string) $variation->price );
                    }
                }

                do_action( 'multivendorx_after_product_import', $product_id, $store_id );

                $created_products[] = $product_id;
            }
        }

        $response_data = array(
            'success' => true,
            'data'    => $created_products,
            'message' => __( 'Products imported successfully.', 'multivendorx' )
        );

        $response = rest_ensure_response( $response_data );
        $response->header( 'X-WP-Total', count( $created_products ) );

        return $response;
    }

    public function import_commissions( ) {

        $xml = $this->load_dummy_xml( 'commissions' );

        // Get current commission type setting
        $commission_type = MultiVendorX()->setting->get_setting( 'commission_type' );

        foreach ( $xml->commission as $commission ) {
            $category_name = sanitize_text_field( (string) $commission->category );
            $value         = floatval( (string) $commission->value );

            if ( empty( $category_name ) ) {
                continue;
            }

            // Create or get category
            $term = term_exists( $category_name, 'product_cat' );
            if ( ! $term ) {
                $term = wp_insert_term( $category_name, 'product_cat' );
            }

            if ( is_wp_error( $term ) ) {
                continue;
            }

            $term_id = is_array( $term ) ? $term['term_id'] : $term;

            $existing = get_term_meta( $term_id, 'category_' . $commission_type . '_commission', true );
            if ( $existing ) {
                continue;
            }
            /**
             * Apply commission based on system configuration
             */
            switch ( $commission_type ) {
                case 'fixed':
                    update_term_meta(
                        $term_id,
                        'category_fixed_commission',
                        $value
                    );
                    break;

                case 'percent':
                    update_term_meta(
                        $term_id,
                        'category_percentage_commission',
                        $value
                    );
                    break;

                case 'fixed_with_percentage':
                    update_term_meta(
                        $term_id,
                        'category_fixed_commission',
                        $value
                    );
                    update_term_meta(
                        $term_id,
                        'category_percentage_commission',
                        $value
                    );
                    break;

                default:
                    // fallback
                    update_term_meta(
                        $term_id,
                        'category_percentage_commission',
                        $value
                    );
                    break;
            }
        }

        $response_data = array(
            'success' => true,
            'message' => __( 'Commissions imported successfully.', 'multivendorx' )
        );
        
        $response = rest_ensure_response( $response_data );
        

        return $response;
    }

    public function import_orders( $request ) {

        $xml = $this->load_dummy_xml( 'orders' );

        foreach ( $xml->order as $order_xml ) {

            // Create order
            $order = wc_create_order(
                array(
					'status' => (string) $order_xml->status,
                )
            );

            if ( is_wp_error( $order ) ) {
                continue;
            }

            // Billing details
            $order->set_billing_first_name( (string) $order_xml->billing->first_name );
            $order->set_billing_last_name( (string) $order_xml->billing->last_name );
            $order->set_billing_email( (string) $order_xml->billing->email );
            $order->set_billing_phone( (string) $order_xml->billing->phone );
            $order->set_billing_address_1( (string) $order_xml->billing->address_1 );
            $order->set_billing_city( (string) $order_xml->billing->city );
            $order->set_billing_postcode( (string) $order_xml->billing->postcode );
            $order->set_billing_country( (string) $order_xml->billing->country );

            // Add products
            foreach ( $order_xml->items->item as $item ) {
                $params = $request->get_json_params();
                $product_ids = $params['responseData'];
                $product_id  = (int) $product_ids[ (int) $item->product_index ] ?? 0;

                if ( ! $product_id ) {
                    continue;
                }

                $product = wc_get_product( $product_id );
                if ( ! $product ) {
                    continue;
                }

                $order->add_product(
                    $product,
                    (int) $item->quantity,
                    array(
                        'subtotal' => (float) $item->subtotal,
                        'total'    => (float) $item->total,
                    )
                );
            }

            // Shipping
            if ( isset( $order_xml->shipping ) ) {
                $shipping = new \WC_Order_Item_Shipping();
                $shipping->set_method_title( (string) $order_xml->shipping->method );
                $shipping->set_method_id( 'flat_rate' );
                $shipping->set_total( (float) $order_xml->shipping->cost );
                $order->add_item( $shipping );
            }

            // Payment method
            $order->set_payment_method( (string) $order_xml->payment_method );
            $order->set_payment_method_title( ucfirst( (string) $order_xml->payment_method ) );

            // Finalize
            $order->calculate_totals();
            $order->save();

            /**
             * Create sub-orders (MultiVendorX logic)
             */
            if ( function_exists( 'MultiVendorX' ) ) {
                MultiVendorX()->order->create_store_orders( $order );
            }
        }

        $response_data = array(
            'success' => true,
            'data'    => $order,
            'message' => __( 'Orders imported successfully.', 'multivendorx' )
        );
        
        $response = rest_ensure_response( $response_data );
        return $response;

    }

    public function import_reviews( $request ) {

        $params = $request->get_json_params();
        $product_ids = $params['responseData'];

        if ( empty( $product_ids ) || ! is_array( $product_ids ) ) {
            return array(
                'success' => false,
                'message' => 'No product IDs provided',
            );
        }

        $xml = $this->load_dummy_xml( 'reviews' );

        if ( ! $xml ) {
            return array(
                'success' => false,
                'message' => 'Invalid reviews XML',
            );
        }

        $product_index  = 0;
        $total_products = count( $product_ids );

        foreach ( $xml->review as $review ) {
            if ( $product_index >= $total_products ) {
                break;
            }

            $product_id = (int) $product_ids[ $product_index ];
            ++$product_index;

            if ( ! $product_id || get_post_type( $product_id ) !== 'product' ) {
                continue;
            }

            // Prevent duplicate reviews
            $existing = get_comments(
                array(
					'post_id'      => $product_id,
					'author_email' => sanitize_email( (string) $review->email ),
					'type'         => 'review',
					'count'        => true,
                )
            );

            if ( $existing > 0 ) {
                continue;
            }

            $comment_id = wp_insert_comment(
                array(
					'comment_post_ID'      => $product_id,
					'comment_author'       => sanitize_text_field( (string) $review->reviewer ),
					'comment_author_email' => sanitize_email( (string) $review->email ),
					'comment_content'      => sanitize_textarea_field( (string) $review->comment ),
					'comment_type'         => 'review',
					'comment_approved'     => 1,
					'comment_date'         => current_time( 'mysql' ),
                )
            );

            if ( is_wp_error( $comment_id ) ) {
                continue;
            }

            $rating = max( 1, min( 5, (int) $review->rating ) );
            update_comment_meta( $comment_id, 'rating', $rating );

            do_action( 'woocommerce_review_posted', $comment_id );
        }

        $response_data = array(
            'success' => true,
            'data'    => $comment_id,
            'message' => __( 'Reviews imported successfully.', 'multivendorx' )
        );
        
        $response = rest_ensure_response( $response_data );
        
        return $response;
    }
}
