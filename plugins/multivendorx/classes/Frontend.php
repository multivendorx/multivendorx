<?php
/**
 * Frontend class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

use MultiVendorX\Store\Store;
use MultiVendorX\Store\StoreUtil;

/**
 * MultiVendorX Frontend class
 *
 * @class       Frontend class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Frontend {
    /**
     * Frontend class construct function
     */
    public function __construct() {
        // Redirect store dashboard page.
        add_filter( 'template_include', array( $this, 'store_dashboard_template' ) );
        add_filter( 'woocommerce_login_redirect', array( $this, 'redirect_store_dashboard' ), 10 );
        add_filter( 'login_redirect', array( $this, 'redirect_store_dashboard' ), 10 );

        // Modify related products section in single product page.
        add_filter( 'woocommerce_related_products', array( $this, 'show_related_products' ), 99, 3 );

        // Show message in cart page for multiple stores product.
        if ( ! empty( MultiVendorX()->setting->get_setting( 'store_order_display' ) ) ) {
            add_action( 'woocommerce_before_calculate_totals', array( $this, 'cart_items_sort_by_store' ), 10 );
            add_action( 'woocommerce_before_cart', array( $this, 'message_multiple_stores_cart' ), 10 );
            add_filter( 'render_block_woocommerce/cart-line-items-block', array( $this, 'message_multiple_stores_cart_block' ), 10 );
        }

        // Restrict product visibility on shop, cart, and checkout pages.
        add_action( 'woocommerce_product_query', array( $this, 'restrict_store_products_from_shop' ) );
        add_action( 'woocommerce_cart_loaded_from_session', array( $this, 'restrict_products_already_in_cart' ) );
        add_filter( 'woocommerce_add_to_cart_validation', array( $this, 'restrict_products_from_cart' ), 10, 2 );
        add_action( 'woocommerce_checkout_process', array( $this, 'restrict_products_from_checkout' ) );

        // Store visitors stats data.
        add_action( 'template_redirect', array( $this, 'set_multivendorx_user_cookies' ), 10 );
        add_action( 'template_redirect', array( $this, 'multivendorx_store_visitors_stats' ), 20 );
        add_action( 'wp_enqueue_scripts', array( $this, 'load_scripts' ) );
        // user information before registration.
        add_filter( 'multivendorx_add_content_before_form', array( $this, 'add_woocommerce_login_from' ) );
        // Display custom message in My Account Dashboard.
        add_action( 'woocommerce_account_dashboard', [ $this, 'custom_my_account_dashboard_message'] );
        // Restrict media for store dashboard.
        add_filter('ajax_query_attachments_args', [ $this, 'multivendorx_restrict_store_media' ] );
      
        add_action( 'woocommerce_view_order', array( $this, 'view_order_content' ) );
    }

	/**
	 * Load and enqueue frontend scripts for the store.
	 *
	 * This includes the general frontend scripts and
	 * the specific store products script.
	 *
	 * @return void
	 */
	public function load_scripts() {
		FrontendScripts::load_scripts();
		FrontendScripts::enqueue_script( 'multivendorx-store-products-script' );
        if ( is_account_page() ) {
            FrontendScripts::enqueue_style( 'multivendorx-store-tabs-style' );
        }
	}

    /**
     * Restrict store products from shop
     *
     * @param object $q Query object.
     * @return void
     */
    public function restrict_store_products_from_shop( $q ) {

        $products = wc_get_products(
            array(
				'limit'  => -1,
				'return' => 'ids',
            )
        );

        $exclude = array();

        foreach ( $products as $product_id ) {
            if ( StoreUtil::get_excluded_products( $product_id ) ) {
                $exclude[] = $product_id;
            }
        }

        if ( ! empty( $exclude ) ) {
            $q->set( 'post__not_in', $exclude );
        }
    }
    public function view_order_content( $order_id ) {
        if ( ! is_wc_endpoint_url( 'view-order' ) ) {
            return;
        }
        ?>
        <div class="woocommerce-info confirm-section" id="confirm-section">
            <div class="confirm-left">
                <!-- <div class="confirm-icon">
                    <span class="dashicons dashicons-trash"></span>
                </div> -->

                <div class="confirm-heading">
                  <strong> <?php esc_html_e( 'Did you receive your package?', 'multivendorx' ); ?> </strong> 
                </div>
                <div class="confirm-sub">
                    <?php esc_html_e( 'Let us know once your order has arrived safely.', 'multivendorx' ); ?>
                </div>
            </div>

            <button type="button" class="button confirm-btn" id="confirm-btn">
                <?php esc_html_e( 'Confirm Order Received', 'multivendorx' ); ?>
            </button>

        </div>
        <section class="woocommerce-customer-details multivendorx-refund-reason">
            <h2 class="woocommerce-column__title">
                <?php esc_html_e( 'Refund reason', 'multivendorx' ); ?>
            </h2>

            <address>
                <!-- Category -->
                <p class="category-name">
                    <strong><?php esc_html_e( 'Category:', 'multivendorx' ); ?></strong><br/>
                    <span class="multivendorx-badge">
                        <?php esc_html_e( 'Wrong item received', 'multivendorx' ); ?>
                    </span>
                </p>

                <!-- Reason -->
                <address>
                    <?php esc_html_e( "I ordered a medium-sized jacket but received a large instead. The tag also shows a different product code than what was listed on the order. I'd like a full refund as the correct size isn't available.", 'multivendorx' ); ?>
                </address>

                <!-- Attachments -->
                <p>
                    <strong><?php esc_html_e( 'Attached images:', 'multivendorx' ); ?></strong>
                </p>
                
                <div class="refund-reason-image">
                <img src="<?php echo esc_url( wc_placeholder_img_src() ); ?>" alt="" />
                <img src="<?php echo esc_url( wc_placeholder_img_src() ); ?>" alt="" />
                <img src="<?php echo esc_url( wc_placeholder_img_src() ); ?>" alt="" />
                <img src="<?php echo esc_url( wc_placeholder_img_src() ); ?>" alt="" />
                </div>
            </address>

        </section>

        <section class="woocommerce-customer-details multivendorx-request-timeline">
            <h2 class="woocommerce-column__title">
                <?php esc_html_e( 'Request timeline', 'multivendorx' ); ?>
            </h2>
            <address>
                <div class="multivendorx-timeline">
                    <!-- Step 1 -->
                    <div class="multivendorx-timeline-item">
                        <div class="timeline-icon">
                            <span class="dashicons dashicons-yes"></span>
                        </div>
                        <div class="multivendorx-timeline-content">
                            <div class="multivendorx-timeline-title">
                            <strong> <?php esc_html_e( 'Refund requested', 'multivendorx' ); ?> </strong>
                            </div>
                            <span class="multivendorx-timeline-time">
                                Mar 30, 2026 · 10:42 AM
                            </span>
                            <div class="multivendorx-timeline-note">
                                <?php esc_html_e( 'Customer submitted request with 3 attachments.', 'multivendorx' ); ?>
                            </div>
                        </div>
                            
                    </div>

                    <div class="multivendorx-timeline-item">
                        <div class="timeline-icon">
                            <span class="dashicons dashicons-ellipsis"></span>
                        </div>
                        <div class="multivendorx-timeline-content">
                            <div class="multivendorx-timeline-title">
                            <strong> <?php esc_html_e( 'Under review', 'multivendorx' ); ?> </strong>
                            </div>
                            <span class="multivendorx-timeline-time">
                                Awaiting admin action
                            </span>
                            <div class="multivendorx-timeline-note">
                                <?php esc_html_e( 'Request is pending review by the store admin.', 'multivendorx' ); ?>
                            </div>
                        </div>                            
                    </div>

                    <div class="multivendorx-timeline-item">
                        <div class="timeline-icon">
                            <span class="dashicons dashicons-minus"></span>
                        </div>
                        <div class="multivendorx-timeline-content">
                            <div class="multivendorx-timeline-title">
                            <strong> <?php esc_html_e( 'Decision pending', 'multivendorx' ); ?> </strong>
                            </div>
                        </div>                            
                    </div>
                </div>
            </address>
        </section>
        <?php
    }
    /**
     * Restrict products from cart
     *
     * @param bool $passed Passed.
     * @param int  $product_id Product ID.
     * @return bool
     */
    public function restrict_products_from_cart( $passed, $product_id ) {

        if ( StoreUtil::get_excluded_products( $product_id ) ) {
            wc_add_notice( __( 'This product cannot be purchased at the moment.', 'multivendorx' ), 'error' );
            return false;
        }

        return $passed;
    }

    /**
     * Restrict products already in cart
     *
     * @param object $cart Cart object.
     * @return void
     */
    public function restrict_products_already_in_cart( $cart ) {
        foreach ( $cart->get_cart() as $cart_key => $item ) {
            $product_id = $item['product_id'];

            if ( StoreUtil::get_excluded_products( $product_id ) ) {
                $cart->remove_cart_item( $cart_key );
            }
        }
    }

    /**
     * Restrict products from checkout
     */
    public function restrict_products_from_checkout() {

        foreach ( WC()->cart->get_cart() as $item ) {
            $product_id = $item['product_id'];

            if ( StoreUtil::get_excluded_products( $product_id ) ) {
                wc_add_notice( __( 'Checkout blocked: your cart contains products from a restricted store.', 'multivendorx' ), 'error' );
                break;
            }
        }
    }


	/**
	 * Show related products or not.
	 *
	 * @param array $query      Query args.
	 * @param int   $product_id Product ID.
	 * @return array Filtered related products IDs.
	 */
	public function show_related_products( $query, $product_id ) {

		if ( ! $product_id ) {
			return $query;
		}

		$related = MultiVendorX()->setting->get_setting( 'recommendation_source', '' );

		if ( 'none' === $related ) {
			return array();
		}

		if ( 'all_stores' === $related ) {
			return $query;
		}

		if ( 'same_store' !== $related ) {
			return $query;
		}

		$store = Store::get_store( $product_id, 'product' );
		if ( ! $store || ! $store->get_id() ) {
			return $query;
		}

		$products = wc_get_products(
            array(
				'status'   => 'publish',
				'limit'    => -1,
				'exclude'  => array( $product_id ),
				'return'   => 'ids',
				'meta_key' => Utill::POST_META_SETTINGS['store_id'], // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
            'meta_value'   => $store->get_id(), // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
            'orderby'      => 'rand',
            )
		);

		return $products ? $products : $query;
	}

    /**
     * Message multiple stores cart
     */
    public function message_multiple_stores_cart() {
        $stores_in_cart = $this->get_stores_in_cart();
        if ( count( $stores_in_cart ) > 1 ) {
            wc_print_notice( esc_html__( 'Your cart has products from various stores. They’ll be processed and shipped individually, so expect more than one delivery.', 'multivendorx' ), 'notice' );
        }
    }

    /**
     * Message multiple stores cart block
     *
     * @param string $block_content Block content.
     *
     * @return string
     */
    public function message_multiple_stores_cart_block( $block_content ) {
        $message        = '';
        $stores_in_cart = $this->get_stores_in_cart();
        if ( count( $stores_in_cart ) > 1 ) {
            $message = __( 'Your cart has products from various stores. They’ll be processed and shipped individually, so expect more than one delivery.', 'multivendorx' );
        }
        return $message . $block_content;
    }

    /**
     * Get stores in cart
     *
     * @return array
     */
    public function get_stores_in_cart() {

        if ( ! is_object( WC()->cart ) ) {
            return array();
        }

        $stores = array();

        foreach ( WC()->cart->get_cart() as $cart_item ) {
            $store = Store::get_store( $cart_item['product_id'] ?? 0, 'product' );

            if ( $store && $store->get_id() ) {
                $stores[] = $store->get_id();
            }
        }

        return array_values( array_unique( $stores ) );
    }

    /**
     * Sort cart items by store
     *
     * @param object $cart Cart.
     */
    public function cart_items_sort_by_store( $cart ) {
        $store_groups   = array();
        $admin_products = array();

        foreach ( $cart->get_cart() as $cart_item_key => $cart_item ) {
            $store = Store::get_store( $cart_item['product_id'], 'product' );

            if ( $store ) {
                $store_groups[ $store->get_id() ][ $cart_item_key ] = $cart_item;
            } else {
                $admin_products[ $cart_item_key ] = $cart_item;
            }
        }

        $new_cart = array();

        foreach ( $store_groups as $cart_item_key => $items ) {
            foreach ( $items as $key => $item ) {
                $new_cart[ $key ] = $item;
            }
        }

        foreach ( $admin_products as $key => $item ) {
            $new_cart[ $key ] = $item;
        }

        $cart->cart_contents = $new_cart;
    }

    /**
     * Store dashboard template
     *
     * @param string $template Template.
     *
     * @return string
     */
    public function store_dashboard_template( $template ) {
        if ( is_user_logged_in() && Utill::is_store_dashboard() && in_array( 'administrator', MultiVendorX()->current_user->roles, true ) ) {
            wp_safe_redirect( admin_url() );
            exit;
        }
        if ( is_user_logged_in() && is_page() && Utill::is_store_dashboard() ) {
            return MultiVendorX()->plugin_path . 'templates/store/store-dashboard.php';
        }
        return $template;
    }

    /**
     * Redirect Store dashboard
     *
     * @param string $redirect redirect url.
     *
     * @return string
     */
    public function redirect_store_dashboard( $redirect ) {
        if ( Utill::is_store_registration_page() ) {
            return $redirect;
        }
        if ( in_array( 'store_owner', MultiVendorX()->current_user->roles, true ) && MultiVendorX()->active_store ) {
            return get_permalink( MultiVendorX()->setting->get_setting( 'store_dashboard_page' ) );
        }
        return $redirect;
    }

    /**
     * Set user cookies
     */
    public function set_multivendorx_user_cookies() {
        if ( is_product() || Utill::is_store_page() ) {
            $current_user_id = MultiVendorX()->current_user_id;
            $cookie_id       = '_multivendorx_user_cookie_' . $current_user_id;

            if ( ! headers_sent() ) {
                $secure       = ( 'https' === wp_parse_url( home_url(), PHP_URL_SCHEME ) );
                $cookie_value = filter_input( INPUT_COOKIE, $cookie_id );

                if ( ! $cookie_value ) {
                    $cookie_value = uniqid( 'multivendorx_cookie', true );
                }

                setcookie(
                    $cookie_id,
                    $cookie_value,
                    time() + YEAR_IN_SECONDS,
                    COOKIEPATH,
                    COOKIE_DOMAIN,
                    $secure,
                    true
                );
            }
        }
    }
	/**
	 * Track store visitors statistics
	 *
	 * Records visitor data when viewing a product or store page
	 *
	 * @return void
	 */
    public function multivendorx_store_visitors_stats() {
        $product_store = false;

        if ( is_product() ) {
            global $post;
            $product_store = Store::get_store( $post->ID, 'product' );
        } elseif ( Utill::is_store_page() ) {
            $product_store = Utill::is_store_page();
        }

        $user_id     = MultiVendorX()->current_user_id;
        $user_cookie = filter_input( INPUT_COOKIE, '_multivendorx_user_cookie_' . $user_id );

        if ( $product_store && $user_cookie ) {
            $ip_data = $this->get_visitor_ip_data();

            if ( ! empty( $ip_data ) && 'success' === $ip_data->status ) {
                $ip_data->user_id     = $user_id;
                $ip_data->user_cookie = $user_cookie;
                $ip_data->session_id  = session_id();

                $this->multivendorx_save_visitor_stats(
                    $product_store->get_id(),
                    $ip_data
                );
            }
        }
    }
	/**
	 * Get visitor IP geolocation data
	 *
	 * Uses ip-api.com service to get location data for visitor IP
	 * Results are cached for 2 months
	 *
	 * @return object|void IP data object with status, country, city, etc.
	 */
    public function get_visitor_ip_data() {
        if ( ! class_exists( 'WC_Geolocation', false ) ) {
            include_once WC_ABSPATH . 'includes/class-wc-geolocation.php';
        }
        $e          = new \WC_Geolocation();
        $ip_address = $e->get_ip_address();
        if ( $ip_address ) {
            if ( get_transient( 'multivendorx_' . $ip_address ) ) {
                $data = get_transient( 'multivendorx_' . $ip_address );
				if ( 'error' !== $data->status ) {
					return $data;
				}
            }
            $service_endpoint = 'http://ip-api.com/json/%s';
            $response         = wp_safe_remote_get( sprintf( $service_endpoint, $ip_address ), array( 'timeout' => 2 ) );
            if ( ! is_wp_error( $response ) && $response['body'] ) {
                set_transient( 'multivendorx_' . $ip_address, json_decode( $response['body'] ), 2 * MONTH_IN_SECONDS );
                return json_decode( $response['body'] );
            } else {
                $data         = new \stdClass();
                $data->status = 'error';
                set_transient( 'multivendorx_' . $ip_address, $data, 2 * MONTH_IN_SECONDS );
                return $data;
            }
        }
    }

	/**
	 * Save vistor stats for store.
	 *
	 * @since 3.0.0
	 * @param int   $store_id Store ID.
	 * @param array $data     Visitor data object.
	 */
	public function multivendorx_save_visitor_stats( $store_id, $data ) {
		global $wpdb;

		$table_name = $wpdb->prefix . Utill::TABLES['visitors_stats'];

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->prepare(
                "INSERT INTO {$table_name} 
            ( store_id
            , user_id
            , user_cookie
            , session_id
            , ip
            , lat
            , lon
            , city
            , zip
            , regionCode
            , region
            , countryCode
            , country
            , isp
            , timezone
            ) VALUES ( %d
            , %d
            , %s
            , %s
            , %s
            , %s
            , %s
            , %s
            , %s 
            , %s
            , %s
            , %s
            , %s
            , %s
            , %s
            ) ON DUPLICATE KEY UPDATE `created` = now()",
                $store_id,
                $data->user_id,
                $data->user_cookie,
                $data->session_id,
                $data->query,
                $data->lat,
                $data->lon,
                $data->city,
                $data->zip,
                $data->region,
                $data->regionName, // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
                $data->countryCode, // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
                $data->country,
                $data->isp,
                $data->timezone
            )
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
	}

	/**
	 * Render WooCommerce login form or welcome message for MultiVendorX registration.
	 *
	 * @param string $content Original content passed by the filter (unused).
	 * @return string Rendered login or welcome HTML.
	 */
	public function add_woocommerce_login_from( $content ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found
		ob_start();

		if ( is_user_logged_in() ) {
			?>
        <p class="woocommerce">
            <?php
            printf(
                /* translators: %s: Current user display name */
                esc_html__( 'Welcome %s', 'multivendorx' ),
                esc_html( MultiVendorX()->current_user->display_name )
            );
			?>
        </p>
			<?php
		} else {
			echo '<div class="multivendorx-registration woocommerce">';
			echo '<div class="woocommerce-notices-wrapper"><div class="woocommerce-error"><div class="wc-block-components-notice-banner__content"><strong>' .
            esc_html__( 'Kindly login before registration', 'multivendorx' ) .
			'</strong></div></div></div>';
			wc_get_template( 'myaccount/form-login.php' );
			echo '</div>';
		}

		return ob_get_clean();
	}

    public function custom_my_account_dashboard_message() {
        if ( in_array( 'store_owner', MultiVendorX()->current_user->roles, true ) ) {
            $dashboard_url = get_permalink((int) MultiVendorX()->setting->get_setting( 'store_dashboard_page' ));
            echo '<div class="woocommerce-message">';
            echo 'Manage your store, orders, and products <a href="' . esc_url($dashboard_url) . '">Open dashboard</a>.';
            echo '</div>';
        }
        ?>
            <div class="woocommerce-message">
                <p><strong><?php esc_html_e( 'Unlock Wholesale Pricing', 'multivendorx' ); ?></strong></p>
                <p>
                    <?php esc_html_e( 'Apply for wholesale access to get exclusive bulk discounts.', 'multivendorx' ); ?> 
                    <button type="button" class="multivendorx-apply-now-btn">
                        <?php esc_html_e( 'Apply Now', 'multivendorx' ); ?>
                    </button>
                </p>
            </div>

            <div id="wholesale-popup" class="wholesale-popup">
                <div class="popup-content">
                     <span class="popup-close dashicons dashicons-no-alt"></span>
                    <h2><?php esc_html_e( 'Apply for Wholesale Access', 'multivendorx' ); ?></h2>
                    <p><?php esc_html_e( 'Fill in your business details and upload the required verification documents.', 'multivendorx' ); ?></p>

                    <form method="post" class="woocommerce-form wholesale-form">

                        <!-- <p class="form-section-title">
                            <?php esc_html_e( 'Business Information', 'multivendorx' ); ?>
                        </p> -->

                        <!-- Row -->
                        <div class="form-row form-row-first">
                            <label for="biz-name"><?php esc_html_e( 'Business Name *', 'multivendorx' ); ?></label>
                            <input type="text" id="biz-name" name="biz_name" class="input-text" placeholder="Acme Retail Ltd." />
                        </div>

                        <div class="form-row form-row-last">
                            <label for="biz-type"><?php esc_html_e( 'Business Type *', 'multivendorx' ); ?></label>
                            <select id="biz-type" name="biz_type" class="select">
                                <option value=""><?php esc_html_e( 'Select type…', 'multivendorx' ); ?></option>
                                <option value="retailer"><?php esc_html_e( 'Retailer', 'multivendorx' ); ?></option>
                                <option value="distributor"><?php esc_html_e( 'Distributor', 'multivendorx' ); ?></option>
                                <option value="reseller"><?php esc_html_e( 'Reseller', 'multivendorx' ); ?></option>
                                <option value="other"><?php esc_html_e( 'Other', 'multivendorx' ); ?></option>
                            </select>
                        </div>

                        <div class="clear"></div>

                        <!-- Row -->
                        <div class="form-row form-row-first">
                            <label for="tax-num"><?php esc_html_e( 'GST / Tax Number *', 'multivendorx' ); ?></label>
                            <input type="text" id="tax-num" name="tax_num" class="input-text" placeholder="22AAAAA0000A1Z5" />
                        </div>

                        <div class="form-row form-row-last">
                            <label for="volume"><?php esc_html_e( 'Expected Monthly Volume', 'multivendorx' ); ?></label>
                            <select id="volume" name="volume" class="select">
                                <option>₹50,000 – ₹2,00,000</option>
                                <option>₹2,00,000 – ₹5,00,000</option>
                                <option>₹5,00,000+</option>
                            </select>
                        </div>

                        <div class="clear"></div>

                        <!-- Address -->
                        <p class="form-row form-row-wide">
                            <label for="biz-addr"><?php esc_html_e( 'Business Address *', 'multivendorx' ); ?></label>
                            <textarea id="biz-addr" name="biz_addr" class="input-text" placeholder="123 Market Street, Kolkata, WB 700001"></textarea>
                        </p>

                        <!-- Reason -->
                        <p class="form-row form-row-wide">
                            <label for="biz-reason"><?php esc_html_e( 'Why do you want wholesale access?', 'multivendorx' ); ?></label>
                            <textarea id="biz-reason" name="biz_reason" class="input-text" rows="3"></textarea>
                        </p>

                        <!-- Documents -->
                        <fieldset class="wholesale-documents">
                            <legend><?php esc_html_e( 'Verification Documents', 'multivendorx' ); ?></legend>

                            <p class="form-row form-row-wide">
                                <label><?php esc_html_e( 'Business Registration Certificate *', 'multivendorx' ); ?></label>
                                <input type="file" name="doc_brc" accept=".pdf,.jpg,.jpeg,.png" />
                            </p>

                            <p class="form-row form-row-wide">
                                <label><?php esc_html_e( 'Tax Identification Document *', 'multivendorx' ); ?></label>
                                <input type="file" name="doc_tax" accept=".pdf,.jpg,.jpeg,.png" />
                            </p>

                            <p class="form-row form-row-wide">
                                <label><?php esc_html_e( 'Address Proof *', 'multivendorx' ); ?></label>
                                <input type="file" name="doc_addr" accept=".pdf,.jpg,.jpeg,.png" />
                            </p>

                            <p class="form-row form-row-wide">
                                <label><?php esc_html_e( 'Identity Proof (Owner / Authorized) *', 'multivendorx' ); ?></label>
                                <input type="file" name="doc_id" accept=".pdf,.jpg,.jpeg,.png" />
                            </p>
                        </fieldset>

                        <!-- Actions -->
                        <p class="form-row">
                            <button type="submit" class="button button-primary">
                                <?php esc_html_e( 'Submit Application', 'multivendorx' ); ?>
                            </button>
                        </p>

                    </form>
                </div>
            </div>
        <?php
    }

    public function multivendorx_restrict_store_media($query) {
        if ( in_array('store_owner', MultiVendorX()->current_user->roles, true) ) {
            $query['author'] = MultiVendorX()->current_user_id;
        }

        return $query;
    }
}
