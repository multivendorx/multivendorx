<?php

namespace MultiVendorX\RestAPI\Controllers;

use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Store\Store;

defined( 'ABSPATH' ) || exit;

class MultiVendorX_REST_Dashboard_Controller extends \WP_REST_Controller {



    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'endpoints';

    public function register_routes() {
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_items' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                ),
            )
        );
    }

    public function get_items_permissions_check($request)
    {
        // return current_user_can('read');
        return true;
    }

    public function get_items($request)
    {
        $menu_only = $request->get_param('menuOnly');

        $endpoints = $this->all_endpoints();

        $other_endpoints = apply_filters('dashboard_other_endpoints', [
            'view-notifications' => array(
                'name'       => '',
                'icon'       => '',
                'slug'       => 'view-notifications',
                'submenu'    => array(),
                'capability' => array('edit_products'),
                'filename'   => 'view-notifications'
            )
        ]);

        if ( !$menu_only ) {
            $endpoints = array_merge($endpoints, $other_endpoints);
        }
        return rest_ensure_response($endpoints);
    }

    public function all_endpoints() {
        // Default endpoints
        $all_endpoints = array(
            'dashboard'     => array(
                'name'       => 'Dashboard',
                'icon'       => 'adminlib-module',
                'slug'       => '',
                'submenu'    => array(),
                'capability' => array( 'edit_products' ),
            ),
            'products'      => array(
                'name'       => 'Products',
                'slug'       => 'products',
                'icon'       => 'adminlib-single-product',
                'submenu'    => array(),
                'capability' => array( 'manage_products' ),
            ),
            'add-products' => array(
                'name' => 'Add Products',
                'slug' => 'add-products',
                'icon' => 'adminlib-single-product',
                'submenu' => array(),
                'capability' => array('manage_products'),
            ),
            'coupons' => array(
                'name' => 'Coupons',
                'slug' => 'coupons',
                'icon' => 'adminlib-coupon',
                'capability' => array('read_shop_coupons'),
            ),
            'sales'         => array(
                'name'       => 'Sales',
                'slug'       => 'sales',
                'icon'       => 'adminlib-sales',
                'submenu'    => array(
                    array(
                        'key'        => 'orders',
                        'name'       => 'Orders',
                        'slug'       => 'orders',
                        'capability' => array( 'read_shop_orders', 'edit_shop_orders', 'delete_shop_orders' ),
                    ),
                    array(
                        'key'        => 'refund',
                        'name'       => 'Refund',
                        'slug'       => 'refund',
                        'capability' => array( 'read_shop_coupons', 'edit_shop_coupons' ),
                        'module'     => 'marketplace-refund',
                    ),
                    array(
                        'key'        => 'commissions',
                        'name'       => 'Commissions',
                        'slug'       => 'commissions',
                        'capability' => array( 'read_shop_coupons', 'edit_shop_coupons' ),
                    ),
                ),
                'capability' => array( 'read_shop_orders' ),

            ),
            'wallet'        => array(
                'name'       => 'Wallet',
                'icon'       => 'adminlib-wallet',
                'slug'       => 'wallet',
                'submenu'    => array(
                    array(
                        'key'  => 'transactions',
                        'name' => 'Transactions',
                        'slug' => 'transactions',
                    ),
                    array(
                        'key'  => 'withdrawls',
                        'name' => 'Withdrawls',
                        'slug' => 'withdrawls',
                    ),
                ),
                'capability' => array( 'manage_payment' ),
            ),
            'store_support' => array(
                'name'       => 'Store Support',
                'icon'       => 'adminlib-customer-service',
                'slug'       => 'store-support',
                'submenu'    => array(
                    array(
                        'key'        => 'support-tickets',
                        'name'       => 'Support Tickets',
                        'slug'       => 'support-tickets',
                        'capability' => array( 'read_shop_coupons', 'edit_shop_coupons', 'delete_shop_coupons' ),
                        'module'     => 'customer-support',
                    ),
                    array(
                        'key'        => 'customer-questions',
                        'name'       => 'Customer Questions',
                        'slug'       => 'customer-questions',
                        'capability' => array( 'read_shop_coupons', 'edit_shop_coupons' ),
                        'module'     => 'question-answer',
                    ),
                    array(
                        'key'        => 'store-followers',
                        'name'       => 'Store Followers',
                        'slug'       => 'store-followers',
                        'capability' => array( 'read_products', 'edit_products', 'delete_products' ),
                        'module'     => 'follow-store',
                    ),
                    array(
                        'key'        => 'store-review',
                        'name'       => 'Store Review',
                        'slug'       => 'store-review',
                        'capability' => array( 'read_products', 'edit_products', 'delete_products' ),
                    ),
                ),
                'capability' => array( 'manage_users' ),
            ),
            'reports'       => array(
                'name'       => 'Stats / Report',
                'slug'       => 'reports',
                'icon'       => 'adminlib-report',
                'submenu'    => array(
                    array(
                        'key'        => 'overview',
                        'name'       => 'Overview',
                        'slug'       => 'overview',
                        'capability' => array( 'read_shop_coupons', 'edit_shop_coupons', 'delete_shop_coupons' ),
                    ),
                ),
                'capability' => array( 'read_shop_coupons' ),
            ),
            'resources'     => array(
                'name'       => 'Resources',
                'icon'       => 'adminlib-resources',
                'slug'       => 'resources',
                'submenu'    => array(
                    array(
                        'key'        => 'documentation',
                        'name'       => 'Documentation',
                        'slug'       => 'documentation',
                        'capability' => array( 'read_shop_coupons', 'edit_shop_coupons' ),
                    ),
                    array(
                        'key'        => 'tools',
                        'name'       => 'Tools',
                        'slug'       => 'tools',
                        'capability' => array( 'read_shop_coupons', 'edit_shop_coupons', 'delete_shop_coupons' ),
                    ),
                ),
                'capability' => array( 'manage_users' ),
            ),
            'settings'      => array(
                'name'       => 'Settings',
                'slug'       => 'settings',
                'icon'       => 'adminlib-setting',
                'capability' => array( 'read_products' ),
            ),
        );

        $saved_endpoints = MultiVendorX()->setting->get_setting( 'menu_manager' );

        if ( ! empty( $saved_endpoints ) && is_array( $saved_endpoints ) ) {
            $visible_endpoints = array();
            foreach ( $saved_endpoints as $key => $endpoint ) {
                if ( isset( $endpoint['visible'] ) && $endpoint['visible'] ) {
                    $visible_endpoints[ $key ] = array_merge(
                        $all_endpoints[ $key ] ?? array(),
                        $endpoint
                    );
                }
            }
            return $visible_endpoints;
        }

        return $all_endpoints;
    }


    // public function get_current_page_and_submenu() {
    // $current_user        = wp_get_current_user();
    // $capability_settings = MultiVendorX()->setting->get_setting( reset( $current_user->roles ), array() );
    // $store_ids           = StoreUtil::get_stores_from_user_id( $current_user->ID );
    // $active_store        = get_user_meta( $current_user->ID, 'multivendorx_active_store', true );
    // $all_endpoints       = $this->all_endpoints();
    // $div_id              = 'dashboard';
    // $allowed             = true;
    // $store               = new Store( $active_store );
    // $store_status        = $store->get( 'status' );

    // if (empty($store_ids)) {
    // $error_msg = "No active store select for this user.";
    // return array(
    // 'error_msg'    => $error_msg,
    // );
    // } else {
    // if ( empty( $active_store ) ) {
    // update_user_meta( $current_user->ID, 'multivendorx_active_store', reset( $store_ids ) );
    // }
    // }

    // if ( get_option( 'permalink_structure' ) ) {
    // $current_page = get_query_var( 'tab' ) ?? 'dashboard';
    // $current_sub  = get_query_var( 'subtab' );
    // } else {
    // $current_page = filter_input( INPUT_GET, 'tab', FILTER_DEFAULT ) ?? 'dashboard';
    // $current_sub  = filter_input( INPUT_GET, 'subtab', FILTER_DEFAULT );
    // }

    // Auto-redirect if submenu exists
    // if ( $current_page && empty( $current_sub ) ) {
    // foreach ( $all_endpoints as $section ) {
    // if ( $section['slug'] === $current_page && ! empty( $section['submenu'] ) ) {
    // $first_sub = $section['submenu'][0]['slug'];
    // wp_safe_redirect( StoreUtil::get_endpoint_url( $current_page, $first_sub ) );
    // exit;
    // }
    // }
    // }

    // if ( $current_page ) {
    // foreach ( $all_endpoints as $key => $section ) {
    // if ( $section['slug'] !== $current_page ) {
    // continue;
    // }

    // Helper function to check user capability.
    // $has_capability = function( $caps ) use ( $capability_settings ) {
    // foreach ( (array) $caps as $cap ) {
    // if ( current_user_can( $cap ) && in_array( $cap, $capability_settings, true ) ) {
    // return true;
    // }
    // }
    // return false;
    // };

    // if ( ! empty( $section['capability'] ) ) {
    // $allowed = $has_capability( $section['capability'] );
    // }

    // Handle submenu.
    // if ( $current_sub ) {
    // if ( empty( $section['submenu'] ) ) {
    // Capability defined at section-sub level.
    // $sub_caps_key = 'capability-' . $current_sub;
    // if ( ! empty( $section[ $sub_caps_key ] ) ) {
    // $allowed = $has_capability( $section[ $sub_caps_key ] );
    // }
    // $div_id = $current_sub;
    // } else {
    // Find matching submenu.
    // foreach ( $section['submenu'] as $submenu ) {
    // if ( $submenu['slug'] === $current_sub ) {
    // if ( ! empty( $submenu['capability'] ) ) {
    // $allowed = $has_capability( $submenu['capability'] );
    // }
    // $div_id = $submenu['key'];
    // break;
    // }
    // }
    // }
    // } else {
    // $div_id = $key;
    // }

    // break;
    // }
    // }

    // switch ( $store_status ) {
    // case 'pending':
    // $error_msg = 'Waiting for approval your store is pending';
    // break;

    // case 'locked':
    // $error_msg = 'Your account has been suspended by the admin';
    // break;

    // case 'reject':
    // $error_msg = 'The application is rejected';
    // break;

    // default:
    // if ( ! $div_id || ! $allowed ) {
    // $error_msg = 'You do not have permission to access this section.';
    // break;
    // }

    // if ( $div_id === 'edit' ) {
    // ob_start();
    // $this->call_edit_product_template();
    // $content = ob_get_clean();
    // } else {
    // $id = $div_id;
    // }
    // break;
    // }

    // return array(
    // 'active_store' => $active_store,
    // 'current_page' => $current_page,
    // 'current_sub'  => $current_sub,
    // 'error_msg'    => $error_msg,
    // 'id'           => $id,
    // 'content'      => $content,
    // );
    // }

    public function call_edit_product_template() {
        $element    = get_query_var( 'element' );
        $context_id = get_query_var( 'context_id' );

        if ( $element === 'edit' ) {
            if ( ! empty( $context_id ) ) {
                MultiVendorX()->store->products->call_edit_product();
            } elseif ( MultiVendorX()->setting->get_setting( 'category_pyramid_guide' ) == 'yes' || MultiVendorX()->modules->is_active( 'spmv' ) ) {
                MultiVendorX()->store->products->call_add_product();
            }
        }
    }

    public function get_current_page_and_submenu() {
        $dashboard_array = array(
            'all_endpoints' => $this->all_endpoints() ?? array(),
            'store_ids'     => array(),
            'active_store'  => '',
            'current_page'  => '',
            'current_sub'   => '',
            'error_msg'     => '',
            'id'            => '',
            'content'       => '',
        );

        $other_endpoints = apply_filters(
            'dashboard_other_endpoints',
            array(
				'view-notifications' => array(
					'name'       => '',
					'icon'       => '',
					'slug'       => 'view-notifications',
					'submenu'    => array(),
					'capability' => array( 'edit_products' ),
				),
			)
        );

        $current_user                    = wp_get_current_user();
        $dashboard_array['store_ids']    = StoreUtil::get_stores_from_user_id( $current_user->ID );
        $dashboard_array['active_store'] = get_user_meta( $current_user->ID, 'multivendorx_active_store', true );
        $store                           = new Store( $dashboard_array['active_store'] );
        $store_status                    = $store->get( 'status' );
        $capability_settings             = MultiVendorX()->setting->get_setting( reset( $current_user->roles ), array() );

        foreach ( $dashboard_array['all_endpoints'] as $key => $endpoint ) {
            if ( ! empty( $endpoint['submenu'] ) ) {
                $filtered_submenu = array();

                foreach ( $endpoint['submenu'] as $submenu_item ) {

                    // if module exists and is disabled → skip entry
                    if ( ! empty( $submenu_item['module'] ) && ! in_array( $submenu_item['module'], MultiVendorX()->modules->get_active_modules() ) ) {
                        continue;
                    }

                    $filtered_submenu[] = $submenu_item;
                }

                $dashboard_array['all_endpoints'][ $key ]['submenu'] = $filtered_submenu;

                // if every submenu was removed → remove the whole endpoint
                if ( empty( $filtered_submenu ) && ! empty( $endpoint['submenu'] ) ) {
                    unset( $dashboard_array['all_endpoints'][ $key ] );
                }
            }
        }

        // Early exit if no store found.
        if ( empty( $dashboard_array['store_ids'] ) ) {
            $dashboard_array['error_msg'] = esc_html__( 'No active store selected for this user.', 'multivendorx' );
            return $dashboard_array;
        }

        // Ensure active store is set.
        if ( empty( $dashboard_array['active_store'] ) ) {
            update_user_meta( $current_user->ID, 'multivendorx_active_store', reset( $dashboard_array['store_ids'] ) );
            $dashboard_array['active_store'] = reset( $dashboard_array['store_ids'] );
        }

        // Get sanitized current page and subtab.
        [$current_page, $current_sub] = $this->get_tab_and_subtab();

        // Auto-redirect if submenu exists but not specified.
        if ( $current_page && empty( $current_sub ) ) {
            foreach ( $dashboard_array['all_endpoints'] as $section ) {
                if ( $section['slug'] === $current_page && ! empty( $section['submenu'] ) ) {
                    $first_sub = $section['submenu'][0]['slug'];
                    wp_safe_redirect( StoreUtil::get_endpoint_url( $current_page, $first_sub ) );
                    exit;
                }
            }
        }

        $div_id  = 'dashboard';
        $allowed = true;

        // Resolve the current section and capability check.
        foreach ( $dashboard_array['all_endpoints'] as $key => $section ) {
            if ( $section['slug'] !== $current_page ) {
                continue;
            }

            $allowed = $this->user_has_section_capability( $section, $capability_settings );

            if ( $current_sub ) {
                [$div_id, $allowed] = $this->resolve_submenu_access( $section, $current_sub, $capability_settings );
            } else {
                $div_id = $key;
            }

            break;
        }

        if ( ! empty( $other_endpoints[ $current_page ] ) ) {
            $div_id  = $current_page;
            $allowed = current_user_can( implode( ',', $other_endpoints[ $current_page ]['capability'] ) );
        }

        switch ( $store_status ) {
            case 'pending':
                $dashboard_array['error_msg'] = MultiVendorX()->setting->get_setting( 'pending_msg' );
                break;

            case 'suspended':
                $dashboard_array['error_msg'] = MultiVendorX()->setting->get_setting( 'suspended_msg' );
                break;

            case 'under_review':
                $dashboard_array['error_msg'] = MultiVendorX()->setting->get_setting( 'under_review_msg' );
                break;

            case 'rejected':
                $reapply_link                 = sprintf(
                    '<a href="%s">%s</a>',
                    esc_url( get_permalink( MultiVendorX()->setting->get_setting( 'store_registration_page' ) ) ),
                    esc_html__( 'Click here to reapply.', 'multivendorx' )
                );
                $dashboard_array['error_msg'] = MultiVendorX()->setting->get_setting( 'rejected_msg' ) . ' ' . $reapply_link;
                break;

            default:
                if ( ! $allowed ) {
                    $dashboard_array['error_msg'] = 'You do not have permission to access this section.';
                    break;
                }

                if ( $div_id === 'edit' ) {
                    $dashboard_array['content'] = $this->get_page_content( $div_id );
                } else {
                    $dashboard_array['id'] = $div_id;
                }
                break;
        }

        $dashboard_array['current_page'] = $current_page;
        $dashboard_array['current_sub']  = $current_sub;

        return $dashboard_array;
    }

    /**
     * Retrieve sanitized tab and subtab.
     */
    private function get_tab_and_subtab(): array {
        if ( get_option( Utill::WORDPRESS_SETTINGS['permalink'] ) ) {
            $segment = sanitize_key( get_query_var( 'segment' ) ?: 'dashboard' );
            $element = sanitize_key( get_query_var( 'element' ) );
        } else {
            $segment = filter_input( INPUT_GET, 'segment', FILTER_DEFAULT ) ?? 'dashboard';
            $element = filter_input( INPUT_GET, 'element', FILTER_DEFAULT );
        }
        return array( $segment, $element );
    }

    /**
     * Check user capability for a section.
     */
    private function user_has_section_capability( array $section, array $capability_settings ): bool {
        if ( empty( $section['capability'] ) ) {
            return true;
        }

        foreach ( (array) $section['capability'] as $cap ) {
            if ( current_user_can( $cap ) && in_array( $cap, $capability_settings, true ) ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Resolve submenu access and ID.
     */
    private function resolve_submenu_access( array $section, string $current_sub, array $capability_settings ): array {
        $id      = $current_sub;
        $allowed = true;

        if ( ! empty( $section['submenu'] ) ) {
            foreach ( $section['submenu'] as $submenu ) {
                if ( $submenu['slug'] === $current_sub ) {
                    $allowed = empty( $submenu['capability'] )
                        ? true
                        : $this->user_has_section_capability( $submenu, $capability_settings );
                    $id      = $submenu['key'] ?? $current_sub;
                    break;
                }
            }
        } else {
            $sub_cap_key = 'capability-' . $current_sub;
            if ( ! empty( $section[ $sub_cap_key ] ) ) {
                $allowed = $this->user_has_section_capability( array( 'capability' => $section[ $sub_cap_key ] ), $capability_settings );
            }
        }

        return array( $id, $allowed );
    }

    /**
     * Load content for special pages.
     */
    private function get_page_content( string $id ): ?string {
        if ( 'edit' === $id ) {
            ob_start();
            $this->call_edit_product_template();
            return ob_get_clean();
        }

        return null;
    }
}
