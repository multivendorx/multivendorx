<?php
/**
 * Admin class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;
use MultiVendorX\Store\Store;
use MultiVendorX\Commission\CommissionUtil;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Admin class
 *
 * @class       Admin class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Admin {

    /**
     * Admin constructor.
     */
    public function __construct() {
        // admin pages manu and submenu.
        add_action( 'admin_menu', array( $this, 'add_menus' ), 10 );
        // admin script and style.
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_script' ) );

        // Allow URL.
        add_filter( 'allowed_redirect_hosts', array( $this, 'allow_multivendorx_redirect_host' ) );
        // For loco translation.
        add_action( 'load_script_textdomain_relative_path', array( $this, 'textdomain_relative_path' ), 10, 2 );

        // Add Store menu in woocommerce product page.
		add_filter( 'woocommerce_product_data_tabs', array( $this, 'add_store_tab_in_product' ) );
        add_action( 'woocommerce_product_data_panels', array( $this, 'add_additional_product_data_panels' ) );
        add_action( 'woocommerce_process_product_meta', array( $this, 'save_store_in_product' ) );
        add_action( 'wp_ajax_search_stores', array( $this, 'multivendorx_get_stores' ));
        // For Variation
        add_action('woocommerce_product_after_variable_attributes', array($this, 'add_variation_settings'), 10, 3);
        add_action( 'woocommerce_save_product_variation', array($this, 'save_commission_field_variations'), 10, 2 );
        // For Category
        add_action('product_cat_add_form_fields', array($this, 'add_product_cat_commission_fields'));
        add_action('product_cat_edit_form_fields', array($this, 'edit_product_cat_commission_fields'), 10);
        add_action('created_term', array($this, 'save_product_cat_commission_fields'), 10, 3);
        add_action('edit_term', array($this, 'save_product_cat_commission_fields'), 10, 3);
        add_action( 'init', array( $this, 'register_multivendorx_custom_post_types' ), 5 );

        //add store tab in coupons section backend
        add_filter('woocommerce_coupon_data_tabs', array($this, 'add_store_tab_in_coupon'));
        add_action('woocommerce_coupon_data_panels', array($this, 'add_content_in_store_tab'), 10, 1);
        add_action('woocommerce_coupon_options_save', array($this, 'save_store_in_coupon'), 10, 2);
    
        // Display radios after order actions for COD order if shipping not found
        add_action( 'add_meta_boxes', array($this, 'add_option_for_payment'), 10, 2);
        add_action( 'woocommerce_process_shop_order_meta', array($this, 'save_option_for_payment'));

    }

    /**
     * Add options page.
     */
    public function add_menus() {
        if ( is_admin() ) {
            add_menu_page(
                'MultiVendorX',
                'MultiVendorX',
                'manage_options',
                'multivendorx',
                array( $this, 'create_setting_page' ),
                'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgMjU2IDI1NiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjU2IDI1NjsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiNmZmY7fQo8L3N0eWxlPgo8Zz4KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0yMTUuMDksNTYuNTlDOTcuMiw4Ni45MSw0OC4wMiwyNC45MywyMy4wOSw2Mi42NWMtMTMuNDcsMjEuNTYsMy4zNyw5Ny42OCwxNS40OSwxNjYuNAoJCWMyNS42LDE2Ljg0LDU2LjU5LDI2Ljk1LDg5LjYsMjYuOTVjMzQuMzYsMCw2Ni42OS0xMC43OCw5Mi45Ny0yOC45N0MyMzguNjcsMTU3LjY0LDI1MC4xMyw0Ny44MywyMTUuMDksNTYuNTl6IE0xNDYuMzYsMjA2LjgzCgkJbC0xNi45OC0yMS45OGwtMTYuOTgsMjEuOThINjcuNzRsMzkuNzktNDguNDdMNzAuMzMsMTEyLjdoNDQuODVsMTQuMjcsMTkuMTVsMTQuNTItMTkuMTVoNDQuNjZsLTM3LjAzLDQ1LjU1bDM5LjgsNDguNTdIMTQ2LjM2eiIKCQkvPgoJPHBhdGggY2xhc3M9InN0MCIgZD0iTTkyLjQ4LDM1LjcxYzAtMTYuMTcsMTMuNDctMjkuNjQsMjkuNjQtMjkuNjRoMTYuMTdjMTYuMTcsMCwyOS42NCwxMy40NywyOS42NCwyOS42NHYyMi4yMwoJCWMyLjAyLDAsNC4wNCwwLDYuMDYtMC42N1YzNS43MUMxNzQsMTYuMTcsMTU4LjUxLDAsMTM4LjI5LDBoLTE2LjE3Yy0xOS41NCwwLTM1LjcxLDE2LjE3LTM1LjcxLDM1LjcxdjE0LjgyCgkJYzIuMDIsMC42Nyw0LjA0LDAuNjcsNi4wNiwxLjM1VjM1LjcxeiIvPgo8L2c+Cjwvc3ZnPgo=',
                 50
            );

            $pro_sticker = ! Utill::is_khali_dabba() ?
            '<span 
                class="multivendorx-pro-tag"
                style="
                font-size: 0.5rem;
                background: #e35047;
                padding: 0.125rem 0.5rem;
                color: #F9F8FB;
                font-weight: 700;
                line-height: 1;
                position: absolute;
                margin-left: 0.25rem;
                border-radius: 2rem 0;
                top: 50%;
                transform: translateY(-50%);
                "
            > Pro </span>' : '';

            $commission_count = CommissionUtil::get_commissions(['paid_status' => 'unpaid'], true, true);
            // Array contain multivendorx submenu.
            $submenus = array(
                'dashboard' => array(
                    'name'   => __( 'Dashboard', 'multivendorx' ),
                    'subtab' => '',
                ),
                'actions-items' => array(
                    'name'   => __( 'Actions Items', 'multivendorx' ),
                    'subtab' => '',
                ),
                'customer-support' => array(
                    'name'   => __( 'Customer Support', 'multivendorx' ),
                    'subtab' => '',
                ),
                'stores' => array(
                    'name'   => __( 'Stores', 'multivendorx' ),
                    'subtab' => '',
                ),
                'commissions' => array(
                    'name'   => __( 'Commissions', 'multivendorx' ),
                    'subtab' => '',
                    'count'  => $commission_count,
                ),
                'transaction-history' => array(
                    'name'   => __( 'Transaction History', 'multivendorx' ),
                    'subtab' => '',
                ),
                'analytics' => array(
                    'name'   => __( 'Analytics', 'multivendorx' ),
                    'subtab' => '',
                ),
                'memberships' => array(
                    'name'   => __( 'Memberships', 'multivendorx' ),
                    'subtab' => 'payment-membership-message',
                ),
                'advertisement' => array(
                    'name'   => __( 'Advertisement', 'multivendorx' ),
                    'subtab' => '',
                ),
                'settings' => array(
                    'name'   => __( 'Settings', 'multivendorx' ),
                    'subtab' => 'marketplace-settings',
                ),
                'modules' => array(
                    'name'   => __( 'Modules', 'multivendorx' ),
                    'subtab' => '',
                ),
                'status-tools' => array(
                    'name'   => __( 'Status & Tools', 'multivendorx' ),
                    'subtab' => 'version-control',
                ),
                'announcement' => array(
                    'name'   => __( 'Announcement', 'multivendorx' ),
                    'subtab' => '',
                ),
                'knowledgebase' => array(
                    'name'   => __( 'Knowledgebase', 'multivendorx' ),
                    'subtab' => '',
                ),
                // 'blogs' => array(
                //     'name'   => __( 'Blogs', 'multivendorx' ),
                //     'subtab' => '',
                // ),
                'help-support' => array(
                    'name'   => __( 'Help & Support', 'multivendorx' ),
                    'subtab' => '',
                ),
                // 'setup' => array(
                //     'name'   => __( 'Setup', 'multivendorx' ),
                //     'subtab' => '',
                // ),
            );
            
            foreach ( $submenus as $slug => $submenu ) {
                // prepare subtab if subtab is exist.
                $subtab = '';

                if ( $submenu['subtab'] ) {
                    $subtab = '&subtab=' . $submenu['subtab'];
                }

                $menu_name = $submenu['name'];

                if ( isset( $submenu['count'] ) && $submenu['count'] > 0 ) {
                    $menu_name = $menu_name . " <span class='update-plugins count-" . intval( $submenu['count'] ) . "' style='margin-left:5px;'>
                                    <span class='plugin-count'>" . intval( $submenu['count'] ) . "</span>
                                 </span>";
                }
                
                add_submenu_page(
                    'multivendorx',
                    $submenu['name'],
                    "<span style='position: relative; display: block; width: 100%;' class='admin-menu'>" . $menu_name . '</span>',
                    'manage_options',
                    'multivendorx#&tab=' . $slug . $subtab,
                    '__return_null'
                );
                

            }

            // Register upgrade to pro submenu page.
            if ( ! Utill::is_khali_dabba() ) {
                add_submenu_page(
                    'multivendorx',
                    __( 'Upgrade to Pro', 'multivendorx' ),
                    '<style>
                        a:has(.upgrade-to-pro){
                            background: linear-gradient(-28deg, #c4a9e8, #7848b9, #852aff) !important;
                            color: White !important;
                        }
                        padding: 5px 0;
                    </style>
                    <div style="margin-left: -12px;" class="upgrade-to-pro"><i class="dashicons dashicons-awards"></i>' . esc_html__( 'Upgrade to Pro', 'multivendorx' ) . '</div> ',
                    'manage_options',
                    '',
                    array( self::class, 'handle_external_redirects' )
                );
            }

            remove_submenu_page( 'multivendorx', 'multivendorx' );
        }
    }

    /**
     * Create empty div. React root from here.
     *
     * @return void
     */
    public function create_setting_page() {
        echo '<div id="admin-main-wrapper"></div>';
    }

    /**
     * Enqueue JavaScript for admin fronend page and localize script.
     *
     * @return void
     */
    public function enqueue_admin_script() {
        if ( get_current_screen()->id === 'toplevel_page_multivendorx' ) {
            wp_enqueue_script( 'wp-element' );
            wp_enqueue_editor();
            // Support for media
            wp_enqueue_media();
            FrontendScripts::admin_load_scripts();
            FrontendScripts::enqueue_script( 'multivendorx-components-script' );
            FrontendScripts::enqueue_script( 'multivendorx-admin-script' );
			FrontendScripts::enqueue_style( 'multivendorx-components-style' );
			FrontendScripts::localize_scripts( 'multivendorx-admin-script' );
        }

        if ( get_current_screen()->id === 'product' || get_current_screen()->id === 'shop_coupon' ) {
            FrontendScripts::admin_load_scripts();
            FrontendScripts::enqueue_script( 'multivendorx-product-tab-script' );
            FrontendScripts::localize_scripts( 'multivendorx-product-tab-script' );
        }
    }

    /**
     * Filters the relative path for the plugin's textdomain.
     *
     * This method can be used to adjust the location where translation files are loaded from.
     *
     * @param string $path Relative path to the .mo file.
     * @param string $url  URL to the .mo file.
     * @return string Modified path.
     */
    public function textdomain_relative_path( $path, $url ) {

        if ( strpos( $url, 'dc-woocommerce-product-vendor' ) !== false ) {
            foreach ( MultiVendorX()->block_paths as $key => $new_path ) {
                if ( strpos( $url, $key ) !== false ) {
                    $path = $new_path;
                }
            }

            if ( strpos( $url, 'block' ) === false ) {
                $path = 'assets/js/components.js';
            }
        }

        return $path;
    }

    /**
	 * Redirct to pro shop url.
     *
	 * @return never
	 */
	public static function handle_external_redirects() {
		wp_safe_redirect( esc_url_raw( MULTIVENDORX_PRO_SHOP_URL ) );
		exit;
	}

    /**
     * Allow MultiVendorX domain for safe redirection using wp_safe_redirect().
     *
     * @param string[] $hosts List of allowed hosts.
     * @return string[] Modified list with MultiVendorX domain included.
     */
    public function allow_multivendorx_redirect_host( $hosts ) {
        $parsed_url = wp_parse_url( MULTIVENDORX_PRO_SHOP_URL );

        if ( isset( $parsed_url['host'] ) ) {
            $hosts[] = $parsed_url['host'];
        }

        return $hosts;
    }

    /**
	 * Creates custom tab for product types.
     *
	 * @param array $product_data_tabs all product tabs in admin.
	 * @return array
	 */
	public function add_store_tab_in_product( $product_data_tabs ) {
		$product_data_tabs['store'] = array(
			'label'  => __( 'Store', 'multivendorx' ),
			'target' => 'multivendorx-store-link-tab',
		);
		return $product_data_tabs;
	}

    /**
     * Add meta box panel.
     *
     * @return void
     */
	public function add_additional_product_data_panels() {
		global $post;

        $linked_store = get_post_meta( $post->ID, 'multivendorx_store_id', true );
        $product_fixed_commission = get_post_meta( $post->ID, 'multivendorx_product_fixed_commission', true );
        $product_percentage_commission = get_post_meta( $post->ID, 'multivendorx_product_percentage_commission', true );

        ?>
        <div id="multivendorx-store-link-tab" class="panel woocommerce_options_panel hidden">
            <p class="form-field">
                <label for="linked_store"><?php _e( 'Assign Store', 'multivendorx' ); ?></label>
                <select class="wc-store-search"
                    style="width: 50%;"
                    id="linked_store"
                    name="linked_store"
                    data-placeholder="<?php esc_attr_e( 'Search for a store…', 'multivendorx' ); ?>"
                    data-action="search_stores">

                    <?php
                    if ( $linked_store ) {
                        $store = Store::get_store_by_id( $linked_store );
                        if ( $store ) {
                            echo '<option value="' . esc_attr( $store->get_id() ) . '" selected="selected">' . esc_html( $store->get('name') ) . '</option>';
                        }
                    }
                    ?>
                </select>
            </p>
            <p> 
                <?php
                woocommerce_wp_text_input(
					array(
						'id'          => 'product_fixed_commission',
						'label'       => __( 'Commission Fixed', 'multivendorx' ),
						'placeholder' => wc_format_localized_price( 0 ),
						'description' => __( 'Fixed commission.', 'multivendorx' ),
						// 'data_type'   => 'percent' === $coupon->get_discount_type( 'edit' ) ? 'decimal' : 'price',
						'desc_tip'    => true,
						'value'       => $product_fixed_commission ?? '',
					)
				);
                ?>
            </p>
            <p> 
                <?php
                woocommerce_wp_text_input(
					array(
						'id'          => 'product_percentage_commission',
						'label'       => __( 'Commission Percentage', 'multivendorx' ),
						'placeholder' => wc_format_localized_price( 0 ),
						'description' => __( 'Percentage commission.', 'multivendorx' ),
						// 'data_type'   => 'percent' === $coupon->get_discount_type( 'edit' ) ? 'decimal' : 'price',
						'desc_tip'    => true,
						'value'       => $product_percentage_commission ?? '',
					)
				);
                ?>
            </p>
        </div>
        <?php
    }

    public function save_store_in_product($post_id) {
        $linked_store_id = absint( filter_input( INPUT_POST, 'linked_store' ) );
        $fixed_commission_per_product = absint( filter_input( INPUT_POST, 'product_fixed_commission' ) );
        $percentage_commission_per_product = absint( filter_input( INPUT_POST, 'product_percentage_commission' ) );
        
        if ( $linked_store_id ) {
            update_post_meta( $post_id, 'multivendorx_store_id', $linked_store_id );
        }

        if ( $fixed_commission_per_product ) {
            update_post_meta( $post_id, 'multivendorx_product_fixed_commission', $fixed_commission_per_product );
        }

        if ( $percentage_commission_per_product ) {
            update_post_meta( $post_id, 'multivendorx_product_percentage_commission', $percentage_commission_per_product );
        }
    }

    public function add_variation_settings($loop, $variation_data, $variation) {
        $commission_percentage = $commission_fixed = '';
        $commission_percentage = get_post_meta($variation->ID, 'multivendorx_variable_product_percentage_commission', true);
        $commission_fixed = get_post_meta($variation->ID, 'multivendorx_variable_product_fixed_commission', true);

        woocommerce_wp_text_input( array(
            'id'            => 'variable_product_fixed_commission[' . $variation->ID . ']',
            'label'         => __( 'Commission Fixed', 'multivendorx' ),
            'desc_tip'      => true,
            'description'   => __( 'Fixed Commission.', 'multivendorx' ),
            'value'         => $commission_fixed ?? '',
        ) );

        woocommerce_wp_text_input( array(
            'id'            => 'variable_product_percentage_commission[' . $variation->ID . ']',
            'label'         => __( 'Commission Percentage', 'multivendorx' ),
            'desc_tip'      => true,
            'description'   => __( 'Percentage Commission.', 'multivendorx' ),
            'value'         => $commission_percentage ?? '',
        ) );
    }

    public function save_commission_field_variations( $variation_id, $i ) {
        $fixed_commissions       = filter_input( INPUT_POST, 'variable_product_fixed_commission', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );
        $percentage_commissions  = filter_input( INPUT_POST, 'variable_product_percentage_commission', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY );

        if ( isset( $fixed_commissions[ $variation_id ] ) ) {
            $fixed_commission = wc_format_decimal( $fixed_commissions[ $variation_id ] );
            update_post_meta( $variation_id, 'multivendorx_variable_product_fixed_commission', $fixed_commission );
        }

        if ( isset( $percentage_commissions[ $variation_id ] ) ) {
            $percentage_commission = wc_format_decimal( $percentage_commissions[ $variation_id ] );
            update_post_meta( $variation_id, 'multivendorx_variable_product_percentage_commission', $percentage_commission );
        }
    }

    /**
     * Add commission field in create new category page
     */
    public function add_product_cat_commission_fields() {
        ?>
            <div class="form-field term-display-type-wrap">
                <label for="category_percentage_commission"><?php _e('Commission Percentage', 'multivendorx'); ?></label>
                <input type="number" class="short" name="category_percentage_commission" id="category_percentage_commission" value="" placeholder="">
            </div>
            <div class="form-field term-display-type-wrap">
                <label for="category_fixed_commission"><?php _e('Commission Fixed', 'multivendorx'); ?></label>
                <input type="number" class="short" name="category_fixed_commission" id="category_fixed_commission" value="" placeholder="">
            </div>
        <?php
    }

    /**
     * Add commission field in edit category page
     * @param Object $term
     */
    public function edit_product_cat_commission_fields($term) {
        $commission_percentage = get_term_meta($term->term_id, 'multivendorx_category_percentage_commission', true);
        $commision_fixed = get_term_meta($term->term_id, 'multivendorx_category_fixed_commission', true);
        ?>
        <tr class="form-field">
            <th scope="row" valign="top"><label for="category_percentage_commission"><?php _e('Commission Percentage', 'multivendorx'); ?></label></th>
            <td><input type="number" class="short" style="" name="category_percentage_commission" id="category_percentage_commission" value="<?php echo $commission_percentage; ?>" placeholder=""></td>
        </tr>
    
        <tr class="form-field">
            <th scope="row" valign="top"><label for="category_fixed_commission"><?php _e('Commission Fixed per transaction', 'multivendorx'); ?></label></th>
            <td><input type="number" class="short" style="" name="category_fixed_commission" id="category_fixed_commission" value="<?php echo $commision_fixed; ?>" placeholder=""></td>
        </tr>
       
        <?php
    }

    /**
     * Save commission settings for product category
     * @param int $term_id
     * @param int $tt_id
     * @param string $taxonomy
     */
    public function save_product_cat_commission_fields($term_id, $tt_id = '', $taxonomy = '') {
        if ( 'product_cat' === $taxonomy ) {
            $percentage = filter_input( INPUT_POST, 'category_percentage_commission', FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION );
            $fixed      = filter_input( INPUT_POST, 'category_fixed_commission', FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION );
            update_term_meta( $term_id, 'multivendorx_category_percentage_commission', (float) $percentage );        
            update_term_meta( $term_id, 'multivendorx_category_fixed_commission', (float) $fixed );
        }
    }

    public function multivendorx_get_stores() {
        $term   = sanitize_text_field( filter_input( INPUT_GET, 'term', FILTER_SANITIZE_FULL_SPECIAL_CHARS ) ?? '' );
        $stores = Store::get_store_by_name($term);

        $results = array();
        foreach ( $stores as $store ) {
            $results[] = array(
                'id'   => $store->get_id(),
                'text' => $store->get('name'),
            );
        }

        wp_send_json( $results );
    }
    public function register_multivendorx_custom_post_types() {
        // Announcements
        register_post_type( 'multivendorx_an', array(
            'public'             => false,   // Not publicly queryable
            'show_ui'            => false,   // Hide from admin UI
            'show_in_menu'       => false,   // Do not add to admin menu
            'show_in_nav_menus'  => false,
            'exclude_from_search'=> true,
            'publicly_queryable' => false,   // Prevent front-end queries
            'show_in_rest'       => true,    // REST API access
            'rest_base'          => 'announcements', // Optional custom REST endpoint
            'supports'           => array( 'title', 'editor' ),
        ) );
        
    
        // Knowledge Base (KB)
        register_post_type( 'multivendorx_kb', array(
            'public'             => false,   // Not publicly queryable
            'show_ui'            => false,   // Hide in admin UI
            'show_in_menu'       => false,   // Do not add to admin menu
            'show_in_nav_menus'  => false,
            'exclude_from_search'=> true,
            'publicly_queryable' => false,   // Prevent frontend queries
            'show_in_rest'       => true,    // REST API access only
            'rest_base'          => 'kb',    // Custom REST endpoint base
            'supports'           => array( 'title', 'editor' ),
        ) );
        
    }
    
    public function add_store_tab_in_coupon( $coupon_data_tabs ) {
        $coupon_data_tabs['store'] = array(
            'label'  => __( 'Store', 'multivendorx' ),
            'target' => 'store_coupon_data',
            'class'  => 'store_coupon_data',
        );	
        return $coupon_data_tabs; 
    }

    public function add_content_in_store_tab( $coupon_id ) {

        $current_coupon = get_post( $coupon_id );
        $linked_store = get_post_meta( $coupon_id, 'multivendorx_store_id', true );
       
        ?>
        <div id="store_coupon_data" class="panel woocommerce_options_panel">
            <p class="form-field">
                <label for="linked_store"><?php _e( 'Assign Store', 'multivendorx' ); ?></label>
                <select class="wc-store-search"
                    style="width: 50%;"
                    id="linked_store"
                    name="coupon_linked_store"
                    data-placeholder="<?php esc_attr_e( 'Search for a store…', 'multivendorx' ); ?>"
                    data-action="search_stores">

                    <?php
                    if ( $linked_store ) {
                        $store = Store::get_store_by_id( $linked_store );
                        if ( $store ) {
                            echo '<option value="' . esc_attr( $store->get_id() ) . '" selected="selected">' . esc_html( $store->get('name') ) . '</option>';
                        }
                    }
                    ?>
                </select>
            </p>
        </div>
        <?php
    }

    public function save_store_in_coupon($post_id) {
        $linked_store_id = absint( filter_input( INPUT_POST, 'coupon_linked_store' ) );
        if ( $linked_store_id ) {
            update_post_meta( $post_id, 'multivendorx_store_id', $linked_store_id );
        }
    }

    public function add_option_for_payment($page, $order) {
        if( $page && $page != 'woocommerce_page_wc-orders' ) return;
        if(  $order->get_parent_id() == 0 ) return;
        
        add_meta_box(
            'multivendorx_cod_order_payment_box', 
            __( 'COD Order Payment', 'multivendorx' ), 
            [ $this, 'render_multivendorx_cod_order_payment_box' ], 
            $page,
            'side',  
            'default'
        );
        
    }

    public function render_multivendorx_cod_order_payment_box( $post ) {
        $order = wc_get_order( $post->ID );
        $value = $order ? $order->get_meta( 'multivendorx_cod_order_payment', true ) : '';
        ?>
        <p>
            <label>
                <input type="radio" name="order_payment" value="admin" <?php checked( $value, 'admin' ); ?> />
                <?php _e( 'Admin', 'multivendorx' ); ?>
            </label><br>
            <label>
                <input type="radio" name="order_payment" value="store" <?php checked( $value, 'store' ); ?> />
                <?php _e( 'Store', 'multivendorx' ); ?>
            </label>
        </p>
        <?php
    }

    public function save_option_for_payment( $order_id ) {

        $selected = filter_input( INPUT_POST, 'order_payment', FILTER_SANITIZE_FULL_SPECIAL_CHARS );
        if ( $selected !== null ) {
            $order = wc_get_order($order_id);
            $order->update_meta_data( 'multivendorx_cod_order_payment', $selected );
            $order->save();
        }
    }

    
}
