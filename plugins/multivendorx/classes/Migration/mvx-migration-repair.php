
<?php
/**
 * MultiVendorX Migration Repair
 */

use MultiVendorX\Store\Store;
use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Utill;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class MVX_Migration_Repair {

    /**
	 * Get mapping of old vendor meta keys to new keys.
	 *
	 * @return array
	 */
    public function old_new_meta_map() {
        $map_meta = array(
            'mvx_vendor_fields'               => 'multivendorx_registration_data',
            '_vendor_address_1'               => 'address',
            '_vendor_address_2'               => 'address',
            '_vendor_city'                    => 'city',
            '_vendor_postcode'                => 'zip',
            '_vendor_country_code'            => 'country',
            '_vendor_state_code'              => 'state',
            '_vendor_hide_address'            => 'hide_address',
            '_vendor_hide_phone'              => 'hide_phone',
            '_vendor_hide_email'              => 'hide_email',
            '_vendor_hide_description'        => 'hide_description',
            '_vendor_fb_profile'              => 'facebook',
            '_vendor_twitter_profile'         => 'twitter',
            '_vendor_linkdin_profile'         => 'linkedin',
            '_vendor_youtube'                 => 'youtube',
            '_vendor_instagram'               => 'instagram',
            '_vendor_pinterest_profile'       => 'pinterest',
            'mvx_vendor_rejection_notes'      => 'store_reject_note',
            '_store_location'                 => 'address',
            '_store_lat'                      => 'location_lat',
            '_store_lng'                      => 'location_lng',
            '_vendor_image'                   => 'image',
            '_vendor_banner'                  => 'banner',
            '_vendor_banner_type'             => 'banner_type',
            '_vendor_video'                   => 'banner_video',
            '_vendor_slider'                  => 'banner_slider',
            'shipping_class_id'               => 'shipping_class_id',
            'vendor_shipping_options'         => 'shipping_options',
            '_vendor_shipping_policy'         => 'shipping_policy',
            '_vendor_refund_policy'           => 'refund_policy',
            'mvx_vendor_followed_by_customer' => '',
            '_vendor_cancellation_policy'     => 'cancellation_policy',
            '_vendor_payment_mode'            => 'payment_method',
            '_vendor_bank_account_type'       => 'account_type',
            '_vendor_bank_name'               => 'bank_name',
            '_vendor_bank_address'            => 'bank_address',
            '_vendor_account_holder_name'     => 'account_holder_name',
            '_vendor_bank_account_number'     => 'account_number',
            '_vendor_aba_routing_number'      => 'routing_number',
            '_vendor_destination_currency'    => 'destination_currency',
            '_vendor_iban'                    => 'iban',
            '_vendor_paypal_email'            => 'paypal_email',
            '_vendor_country'                 => '',
            '_vendor_state'                   => '',
            '_vendor_profile_image'           => '',
            'vendor_connected'                => '',
            'admin_client_id'                 => '',
            'stripe_user_id'                  => 'stripe_connect_account_id',
            'access_token'                    => 'stripe_access_token',
            'stripe_publishable_key'          => 'stripe_publishable_key',
            'refresh_token'                   => 'stripe_refresh_token',
            '_vendor_external_store_url'      => 'store_external_store_url',
            '_vendor_external_store_label'    => 'store_external_store_label',
            '_vendor_term_id'                 => '',
            '_vendor_page_title'              => '',
            '_vendor_page_slug'               => '',
            '_vendor_csd_return_address1'     => '',
            '_vendor_csd_return_address2'     => '',
            '_vendor_csd_return_country'      => '',
            '_vendor_csd_return_state'        => '',
            '_vendor_csd_return_city'         => '',
            '_vendor_csd_return_zip'          => '',
            '_vendor_customer_phone'          => '',
            '_vendor_customer_email'          => '',
            '_vendor_turn_off'                => '',
            '_dismiss_to_do_list'             => '',
            '_mvx_shipping_by_country'        => '',
            '_mvx_country_rates'              => '',
            '_mvx_state_rates'                => '',
            '_mvx_shipping_by_distance'       => '',
            '_mvx_shipping_by_distance_rates' => '',
            '_mvx_user_location_lat'          => 'location_lat',
            '_mvx_user_location_lng'          => 'location_lng',
        );
        return $map_meta;
    }

    /**
     * Constructor
     */
    public function __construct() {

        add_action(
            'admin_init',
            array( $this, 'run_migration_repair' )
        );
    }

    /**
     * Run migration repair
     */
    public function run_migration_repair() {

        // Check whether migration repair is already completed.
        if ( get_option( 'mvx_migration_repair_completed' ) ) {
            return;
        }

        /*
         * Add your actual database migration repair logic here.
         */

        // Mark migration repair as completed.
        update_option(
            'mvx_migration_repair_completed',
            true
        );
    }
    /**
     * Migrate a batch of legacy MVX vendors into MultiVendorX stores.
     *
     * @return void
     */
    public function migrate_vendors( $user_ids = array() ) {
        global $wpdb;

        $vendors = get_users(
            array(
                'include' => $user_ids,
            )
        );

        $map_meta = $this->old_new_meta_map();

        foreach ( $vendors as $user ) {
            $user_id = $user->ID;

            // Change role.
            $wp_user = new \WP_User( $user_id );
            $wp_user->set_role( 'store_owner' );

            // Get all user meta.
            $user_meta = $wpdb->get_results(
                $wpdb->prepare(
                    'SELECT meta_key, meta_value
                    FROM %i
                    WHERE user_id = %d',
                    $wpdb->usermeta,
                    $user_id
                ),
                ARRAY_A
            );
            $term_id   = get_user_meta( $user_id, '_vendor_term_id', true );
            $term      = $wpdb->get_row(
                $wpdb->prepare(
                    'SELECT name, slug FROM %i WHERE term_id = %d',
                    $wpdb->terms,
                    $term_id
                )
            );

            if ( ! empty( $term ) ) {
                $name = $term->name;
                $slug = $term->slug;
            }

            // Store create.
            $store = new Store();
            $store->set( 'name', $name );
            $store->set( 'slug', $slug );
            $store->set( 'status', 'active' );
            $store->set( 'who_created', $user_id );
            $store->set( 'description', get_user_meta( $user_id, '_vendor_description', true ) ?? '' );
            $store_id = $store->save();

            // primary owner set and add store-users table.
            StoreUtil::set_primary_owner( $user_id, $store_id );
            update_user_meta( $user_id, Utill::USER_SETTINGS_KEYS['active_store'], $store_id );
            StoreUtil::add_store_users(
                array(
					'store_id' => $store_id,
					'users'    => (array) $user_id,
					'role_id'  => 'store_owner',
				)
            );

            // add meta in store-meta table.
            $store->update_meta(
                'store_email',
                array(
					'list'    => array( $user->user_email ),
					'primary' => $user->user_email,
                )
            );

            $country      = get_user_meta( $user_id, '_vendor_country_code', true ) ?? '';
            $wc_countries = new \WC_Countries();
            $calling_code = $wc_countries->get_country_calling_code( $country );
            $calling_code = ! empty( $calling_code ) ? $calling_code : '';

            $store->update_meta(
                'phone',
                array(
                    'country_code' => $calling_code,
                    'phone'        => preg_replace( '/[^0-9]/', '', get_user_meta( $user_id, '_vendor_phone', true ) ),
                )
            );

            foreach ( $user_meta as $row ) {
                $meta_key    = $row['meta_key'];
                $meta_values = Utill::safe_unserialize( $row['meta_value'] );
                // report abuse table data insert.
                if ( 'report_abuse_data' === $meta_key ) {
                    $table = $wpdb->prefix . Utill::TABLES['report_abuse'];
                    foreach ( $meta_values as $value ) {
                        // Sanitize and prepare data.
                        $insert_data = array(
                            'store_id'   => $store_id,
                            'product_id' => $value['product_id'],
                            'name'       => $value['name'] ?? '',
                            'email'      => $value['email'] ?? '',
                            'message'    => $value['msg'] ?? '',
                        );

                        // Insert data.
						$wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
                            $table,
                            $insert_data,
                            array( '%d', '%d', '%s', '%s', '%s' )
						);
                    }
                    continue;
                }

                // follow-store store meta migration.
				if ( 'mvx_vendor_followed_by_customer' === $meta_key ) {
                    $new_meta = array();

                    foreach ( $meta_values as $item ) {
                        $new_meta[] = array(
                            'id'   => (int) $item['user_id'],
                            'date' => $item['timestamp'],
                        );
					}

                    $store->update_meta( 'followers', $new_meta );
                    continue;
                }

                // country wise shipping.
				if ( '_mvx_shipping_by_country' === $meta_key ) {
                    $shipping_meta_map = array(
						'_mvx_shipping_type_price' => 'multivendorx_shipping_type_price',
						'_mvx_additional_product'  => 'multivendorx_additional_product',
						'_mvx_additional_qty'      => 'multivendorx_additional_qty',
						'_free_shipping_amount'    => 'free_shipping_amount',
						'_local_pickup_cost'       => 'local_pickup_cost',
					);

					foreach ( $meta_values as $item => $value ) {
						if ( array_key_exists( $item, $shipping_meta_map ) ) {
							$store->update_meta( $shipping_meta_map[ $item ], $value );
						}
					}
					continue;
                }

                if ( '_mvx_country_rates' === $meta_key ) {
                    $state_rates = get_user_meta( $user_id, '_mvx_state_rates', true );
                    $result      = array();

                    if ( ! empty( $meta_values ) ) {
                        foreach ( $meta_values as $country => $cost ) {
                            $country_obj          = new \stdClass();
                            $country_obj->country = $country;
                            $country_obj->cost    = (string) $cost;
                            $country_obj->states  = array();

                            // Check if this country has state data.
                            if ( ! empty( $state_rates[ $country ] ) && is_array( $state_rates[ $country ] ) ) {
                                foreach ( $state_rates[ $country ] as $state => $state_cost ) {
                                    $state_obj             = new \stdClass();
                                    $state_obj->state      = $state;
                                    $state_obj->cost       = (string) $state_cost;
                                    $country_obj->states[] = $state_obj;
                                }
                            }
                            $result[] = $country_obj;
                        }
                    }
                    $store->update_meta( 'multivendorx_shipping_rates', $result );
                    continue;
                }

                // Distance wise shipping.
				if ( '_mvx_shipping_by_distance' === $meta_key ) {
                    $shipping_meta_map = array(
						'_default_cost'      => 'distance_default_cost',
						'_max_distance'      => 'distance_max',
						'_local_pickup_cost' => 'distance_local_pickup_cost',
					);

					foreach ( $meta_values as $item => $value ) {
						if ( array_key_exists( $item, $shipping_meta_map ) ) {
							$store->update_meta( $shipping_meta_map[ $item ], $value );
						}
					}
					continue;
                }

                if ( '_mvx_shipping_by_distance_rates' == $meta_key ) {
                    $new_meta = array();

                    if ( ! empty( $meta_values ) && is_array( $meta_values ) ) {
                        foreach ( $meta_values as $item ) {
                            if ( empty( $item['mvx_distance_unit'] ) || empty( $item['mvx_distance_price'] ) ) {
                                continue;
                            }

                            $new_meta[] = array(
                                'max_distance' => (string) $item['mvx_distance_unit'],
                                'cost'         => (string) $item['mvx_distance_price'],
                            );
                        }
                    }
                    $store->update_meta( 'distance_rules', $new_meta );
                    continue;
                }

                // Skip meta keys that are not mapped.
                if ( ! isset( $map_meta[ $meta_key ] ) ) {
                    continue;
                }

                $new_meta_key = $map_meta[ $meta_key ];

                if ( 'address' === $new_meta_key ) {
                    $existing    = $store->get_meta( 'address' );
                    $meta_values = trim( $existing . ' ' . $meta_values );
                }

                if ( 'shipping_options' == $new_meta_key ) {
                    if ( 'distance_by_zone' == $meta_values ) {
                        $meta_values = 'shipping_by_zone';
                    } elseif ( 'distance_by_shipping' == $meta_values ) {
                        $meta_values = 'shipping_by_distance';
                    } else {
                        $meta_values = 'shipping_by_country';
                    }
                }

                if ( '_vendor_image' == $new_meta_key && is_numeric( $meta_values ) ) {
                    $logo_url = wp_get_attachment_url( $meta_values );
                    if ( $logo_url ) {
                        $store->update_meta( 'image', $logo_url );
                    }
                }

                if ( '_vendor_banner' == $new_meta_key && is_numeric( $meta_values ) ) {
                    $banner_url = wp_get_attachment_url( $meta_values );
                    if ( $banner_url ) {
                        $store->update_meta( 'banner', $banner_url );
                    }
                }

                $store->update_meta( $new_meta_key, $meta_values );
            }
        }
    }

    public function update_commission_store_ids() {
        global $wpdb;

        $commission_table = $wpdb->prefix . Utill::TABLES['commission'];

        $commissions = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT id, order_id
                FROM %i
                WHERE store_id = %d",
                $commission_table,
                0
            )
        );

        foreach ( $commissions as $commission ) {

            // Find the original MVX commission post.
            $commission_post = get_posts(
                array(
                    'post_type'      => 'dc_commission',
                    'post_status'    => 'any',
                    'posts_per_page' => 1,
                    'fields'         => 'ids',
                    'meta_query'     => array(
                        array(
                            'key'   => '_commission_order_id',
                            'value' => $commission->order_id,
                        ),
                    ),
                )
            );

            if ( empty( $commission_post ) ) {
                continue;
            }

            $commission_id = $commission_post[0];

            // Get original vendor term ID.
            $vendor_term_id = get_post_meta(
                $commission_id,
                '_commission_vendor',
                true
            );

            // Get vendor user ID.
            $vendor_id = get_term_meta(
                $vendor_term_id,
                '_vendor_user_id',
                true
            );

            // Get migrated store ID.
            $store_id = absint(
                get_user_meta(
                    $vendor_id,
                    Utill::USER_SETTINGS_KEYS['active_store'],
                    true
                )
            );

            if ( ! $store_id ) {
                continue;
            }

            // Update existing commission record.
            $wpdb->update(
                $commission_table,
                array(
                    'store_id' => $store_id,
                ),
                array(
                    'id' => $commission->id,
                ),
                array( '%d' ),
                array( '%d' )
            );
        }
    }

}