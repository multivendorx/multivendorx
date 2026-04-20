<?php
/**
 * MVX Install class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Migration;

use MultiVendorX\Store\Store;
use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Dokan migration class
 *
 * @class       Dokan class
 * @version     5.0.0
 * @author      MultiVendorX
 */
class MVX {
    const BATCH_SIZE = 100;

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
     * Migrate old Multivendorx tables data
     *
     * @return void
     */
    public function run_migration_cron() {

        $before = $this->get_all_offsets();

        $this->migrate_vendors();
        $this->migrate_product_category_settings();
        $this->migrate_followers();
        $this->migrate_other_tables();
        $this->migrate_commissions();
        $this->migrate_refunds();
        $this->migrate_ledger();
        $this->migrate_reviews();

        // product and coupon store id save.
        $this->migrate_product_coupon_vendor();
        $after = $this->get_all_offsets();

        if ( $before === $after ) {
            wp_clear_scheduled_hook( 'mvx_full_migration' );
        }
    }

    public function get_all_offsets() {
        return array(
            'vendor'        => (int) get_option( 'mvx_vendor_offset', 0 ),
            'follow'        => (int) get_option( 'mvx_follow_offset', 0 ),
            'zone'          => (int) get_option( 'mvx_zone_offset', 0 ),
            'announcement'  => (int) get_option( 'mvx_announcement_offset', 0 ),
            'kb'            => (int) get_option( 'mvx_kb_offset', 0 ),
            'visitors'      => (int) get_option( 'mvx_visitors_offset', 0 ),
            'qna'           => (int) get_option( 'mvx_qna_offset', 0 ),
            'spmv'          => (int) get_option( 'mvx_spmv_offset', 0 ),
            'commission'    => (int) get_option( 'mvx_commission_offset', 0 ),
            'refund'        => (int) get_option( 'mvx_refund_offset', 0 ),
            'ledger'        => (int) get_option( 'mvx_ledger_offset', 0 ),
            'product'       => (int) get_option( 'mvx_product_settings_offset', 0 ),
            'category'      => (int) get_option( 'mvx_category_settings_offset', 0 ),
            'coupon'        => (int) get_option( 'mvx_coupon_migration_offset', 0 ),
            'product_store' => (int) get_option( 'mvx_product_migration_offset', 0 ),
            'rating'        => (int) get_option( 'mvx_rating_offset', 0 ),
        );
    }

    public function migrate_other_tables() {
        global $wpdb;

        // Shipping zone methods table migrate.
        $offset     = (int) get_option( 'mvx_zone_offset', 0 );
        $zone_table = $wpdb->prefix . 'mvx_shipping_zone_methods';
        $results    = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$zone_table} LIMIT %d OFFSET %d",
                self::BATCH_SIZE,
                $offset
            )
        );
        if ( ! empty( $results ) ) {
            foreach ( $results as $row ) {
                $vendor_id = $row->vendor_id;
                $store_id  = get_user_meta( $vendor_id, Utill::USER_SETTINGS_KEYS['active_store'], true );
                $meta_key  = $row->method_id . '_' . $row->zone_id;
                $store     = new Store( $store_id );
                $store->update_meta( $meta_key, $row->settings );
            }
            update_option( 'mvx_zone_offset', $offset + count( $results ) );
        }

        // Announcement table migrate.
        $offset = (int) get_option( 'mvx_announcement_offset', 0 );

        $args = array(
            'post_type'      => 'mvx_vendor_notice',
            'post_status'    => 'any',
            'fields'         => 'ids',
            'posts_per_page' => self::BATCH_SIZE,
            'offset'         => $offset,
        );

        $announcements = get_posts( $args );

        foreach ( $announcements as $post_id ) {
            wp_update_post(
                array(
					'ID'        => $post_id,
					'post_type' => 'multivendorx_an',
                )
            );

            $vendors = get_post_meta( $post_id, '_mvx_vendor_notices_vendors', true );

            $stores = array();

            foreach ( $vendors as $vendor_id ) {
                $active_store = get_user_meta( $vendor_id, Utill::USER_SETTINGS_KEYS['active_store'], true );

                if ( ! empty( $active_store ) ) {
                    $stores[] = (int) $active_store;
                }
            }

            update_post_meta( $post_id, 'multivendorx_announcement_stores', array_unique( $stores ) );

            delete_post_meta( $post_id, '_mvx_vendor_notices_vendors' );
        }

        update_option( 'mvx_announcement_offset', $offset + count( $announcements ) );

        // Knowledgebase table migrate.
        $offset = (int) get_option( 'mvx_kb_offset', 0 );

        $args = array(
            'post_type'      => 'mvx_university',
            'post_status'    => 'any',
            'fields'         => 'ids',
            'posts_per_page' => self::BATCH_SIZE,
            'offset'         => $offset,
        );

        $knowledgebase = get_posts( $args );

        foreach ( $knowledgebase as $post_id ) {
            wp_update_post(
                array(
					'ID'        => $post_id,
					'post_type' => 'multivendorx_kb',
                )
            );
        }
        update_option( 'mvx_kb_offset', $offset + count( $knowledgebase ) );

        // Visitor stats table migrate.
        $offset = (int) get_option( 'mvx_visitors_offset', 0 );

		$old_visitors_table = $wpdb->prefix . 'mvx_visitors_stats';
		$new_visitors_table = $wpdb->prefix . Utill::TABLES['visitors_stats'];

        $rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$old_visitors_table} LIMIT %d OFFSET %d",
                self::BATCH_SIZE,
                $offset
            )
        );

		$store_cache = array();
		foreach ( $rows as $row ) {
			$author_id = (int) $row->vendor_id;

			if ( ! isset( $store_cache[ $author_id ] ) ) {
				$store_cache[ $author_id ] = (int) get_user_meta( $author_id, Utill::USER_SETTINGS_KEYS['active_store'], true );
			}

			$store_id = ! empty( $store_cache[ $author_id ] ) ? $store_cache[ $author_id ] : 0;

			$wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
				$new_visitors_table,
				array(
					'store_id'    => $store_id,
					'user_id'     => (int) $row->user_id,
					'user_cookie' => $row->user_cookie,
					'session_id'  => $row->session_id,
					'ip'          => $row->ip,
					'lat'         => $row->lat,
					'lon'         => $row->lon,
					'city'        => $row->city,
					'zip'         => $row->zip,
					'regionCode'  => $row->regionCode, // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
                'region'          => $row->region,
                'countryCode'     => $row->countryCode, // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
                'country'         => $row->country,
                'isp'             => $row->isp,
                'timezone'        => $row->timezone,
                'created'         => $row->created,
				)
			);
		}
        update_option( 'mvx_visitors_offset', $offset + count( $rows ) );

        // Questions and answers table migration.
		$questions_table = $wpdb->prefix . 'mvx_cust_questions';
		$answers_table   = $wpdb->prefix . 'mvx_cust_answers';
		$new_qna_table   = $wpdb->prefix . Utill::TABLES['customer_queries'];
        $offset          = (int) get_option( 'mvx_qna_offset', 0 );

        $questions = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$questions_table} LIMIT %d OFFSET %d",
                self::BATCH_SIZE,
                $offset
            )
        );

		foreach ( $questions as $question ) {
			$answer = $wpdb->get_row( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
				$wpdb->prepare(
                    "SELECT * FROM {$answers_table} WHERE ques_ID = %d ORDER BY ans_created ASC LIMIT 1", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                    $question->ques_ID // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
				)
			);

			$ques_votes = $question->ques_vote ? maybe_unserialize( $question->ques_vote ) : array();
			$ans_votes  = $answer ? maybe_unserialize( $answer->ans_vote ) : array();

			$merged_votes = array_merge( $ques_votes, $ans_votes );
			$total_votes  = count( $merged_votes );

			$store_id = get_post_meta( $question->product_ID, Utill::POST_META_SETTINGS['store_id'], true ); // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
			$wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
				$new_qna_table,
				array(
					'id'                  => (int) $question->ques_ID, // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
					'product_id'          => (int) $question->product_ID, // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
					'store_id'            => $store_id,
					'question_text'       => $question->ques_details,
					'question_by'         => (int) $question->ques_by,
					'question_date'       => $question->ques_created,
					'answer_text'         => $answer ? $answer->ans_details : null,
					'answer_by'           => $answer ? (int) $answer->ans_by : null,
					'answer_date'         => $answer ? $answer->ans_created : null,
					'total_votes'         => $total_votes,
					'voters'              => maybe_serialize( $merged_votes ),
					'question_visibility' => 'public',
					'created_at'          => $question->ques_created,
					'updated_at'          => $answer ? $answer->ans_created : $question->ques_created,
				),
				array(
					'%d',
					'%d',
					'%d',
					'%s',
					'%d',
					'%s',
					'%s',
					'%d',
					'%s',
					'%d',
					'%s',
					'%s',
					'%s',
				)
			);
		}

        update_option( 'mvx_qna_offset', $offset + count( $questions ) );

        // SPMV table migration.
		$old_spmv_table = $wpdb->prefix . 'mvx_products_map';
		$new_spmv_table = $wpdb->prefix . Utill::TABLES['shared_listing'];
        $offset         = (int) get_option( 'mvx_spmv_offset', 0 );

        $spmv_products = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT product_map_id, product_id, created 
                FROM {$old_spmv_table}
                ORDER BY product_map_id, ID
                LIMIT %d OFFSET %d",
                self::BATCH_SIZE,
                $offset
            )
        );

        $maps = array();
        foreach ( $spmv_products as $row ) {
            $map_id     = (int) $row->product_map_id;
            $product_id = (int) $row->product_id;

            if ( ! isset( $maps[ $map_id ] ) ) {
                $maps[ $map_id ] = array(
                    'products' => array(),
                    'created'  => $row->created,
                );
            }

            $maps[ $map_id ]['products'][] = $product_id;
        }

        foreach ( $maps as $map_id => $data ) {
			$wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $new_spmv_table,
                array(
					'ID'               => $map_id,
					'listing_products' => maybe_serialize( array_values( $data['products'] ) ),
					'created'          => $data['created'],
                ),
                array(
					'%d',
					'%s',
					'%s',
                )
			);

            foreach ( $data['products'] as $product_id ) {
                update_post_meta( $product_id, 'multivendorx_shared_listing_id', $map_id );
                delete_post_meta( $product_id, '_mvx_spmv_map_id' );
                delete_post_meta( $product_id, '_mvx_spmv_product' );
            }
        }

        update_option( 'mvx_spmv_offset', $offset + count( $spmv_products ) );
    }

    /**
	 * Migrate product, category, and coupon settings from MVX structure.
	 *
	 * Handles:
	 * - Product-level commission meta migration.
	 * - Product vendor (store) association update.
	 * - Category-level commission meta migration.
	 * - Coupon vendor (store) association update.
	 *
	 * @return void
	 */
    public function migrate_product_category_settings() {
        $previous_commission_settings = get_option( 'mvx_commissions_tab_settings', array() );
        $offset                       = (int) get_option( 'mvx_product_settings_offset', 0 );
        $limit                        = self::BATCH_SIZE;

        $page = floor( $offset / $limit ) + 1;

        $products = wc_get_products(
            array(
				'status' => 'any',
				'return' => 'ids',
				'limit'  => $limit,
				'page'   => $page,
            )
        );

        foreach ( $products as $product_id ) {
			if ( 'fixed' === $previous_commission_settings['commission_type']['value'] ) {
				$previous_value = get_post_meta( $product_id, '_commission_per_product', true );

				if ( empty( $previous_value ) ) {
					continue;
				}

				update_post_meta( $product_id, Utill::POST_META_SETTINGS['fixed_commission'], $previous_value );
			}

			if ( 'percent' === $previous_commission_settings['commission_type']['value'] ) {
				$previous_value = get_post_meta( $product_id, '_commission_per_product', true );

				if ( empty( $previous_value ) ) {
					continue;
				}

				update_post_meta( $product_id, Utill::POST_META_SETTINGS['percentage_commission'], $previous_value );
			}

			if ( 'fixed_with_percentage_qty' === $previous_commission_settings['commission_type']['value'] ) {
				$previous_percentage_value = get_post_meta( $product_id, '_commission_percentage_per_product', true );
				$previous_fixed_value      = get_post_meta( $product_id, '_commission_fixed_with_percentage_qty', true );

				if ( empty( $previous_fixed_value ) || empty( $previous_percentage_value ) ) {
					continue;
				}

				update_post_meta( $product_id, Utill::POST_META_SETTINGS['fixed_commission'], $previous_fixed_value );
				update_post_meta( $product_id, Utill::POST_META_SETTINGS['percentage_commission'], $previous_percentage_value );
			}

			if ( 'fixed_with_percentage' === $previous_commission_settings['commission_type']['value'] ) {
				$previous_percentage_value = get_post_meta( $product_id, '_commission_percentage_per_product', true );
				$previous_fixed_value      = get_post_meta( $product_id, '_commission_fixed_with_percentage', true );

				if ( empty( $previous_fixed_value ) || empty( $previous_percentage_value ) ) {
					continue;
				}

				update_post_meta( $product_id, Utill::POST_META_SETTINGS['fixed_commission'], $previous_fixed_value );
				update_post_meta( $product_id, Utill::POST_META_SETTINGS['percentage_commission'], $previous_percentage_value );
			}
        }

        update_option( 'mvx_product_settings_offset', $offset + count( $products ) );

        $offset = (int) get_option( 'mvx_category_settings_offset', 0 );
        $terms  = get_terms(
            array(
				'taxonomy'   => 'product_cat',
				'hide_empty' => false,
				'fields'     => 'ids',
                'number'     => $limit,
                'offset'     => $offset,
            )
        );

        foreach ( $terms as $term_id ) {
			if ( 'fixed' === $previous_commission_settings['commission_type']['value'] ) {
				$previous_value = get_term_meta( $term_id, 'commission', true );

				if ( empty( $previous_value ) ) {
					continue;
				}

				update_term_meta( $term_id, Utill::WORDPRESS_SETTINGS['category_fixed_commission'], $previous_value );
			}

			if ( 'percent' === $previous_commission_settings['commission_type']['value'] ) {
				$previous_value = get_term_meta( $term_id, 'commission', true );

				if ( empty( $previous_value ) ) {
					continue;
				}

				update_term_meta( $term_id, Utill::WORDPRESS_SETTINGS['category_percentage_commission'], $previous_value );
			}

			if ( 'fixed_with_percentage_qty' === $previous_commission_settings['commission_type']['value'] ) {
				$previous_percentage_value = get_term_meta( $term_id, 'commission_percentage', true );
				$previous_fixed_value      = get_term_meta( $term_id, 'fixed_with_percentage_qty', true );

				if ( empty( $previous_fixed_value ) || empty( $previous_percentage_value ) ) {
					continue;
				}

				update_term_meta( $term_id, Utill::WORDPRESS_SETTINGS['category_fixed_commission'], $previous_fixed_value );
				update_term_meta( $term_id, Utill::WORDPRESS_SETTINGS['category_percentage_commission'], $previous_percentage_value );
			}

			if ( 'fixed_with_percentage' === $previous_commission_settings['commission_type']['value'] ) {
				$previous_percentage_value = get_term_meta( $term_id, 'commission_percentage', true );
				$previous_fixed_value      = get_term_meta( $term_id, 'fixed_with_percentage', true );

				if ( empty( $previous_fixed_value ) || empty( $previous_percentage_value ) ) {
					continue;
				}

				update_term_meta( $term_id, Utill::WORDPRESS_SETTINGS['category_fixed_commission'], $previous_fixed_value );
				update_term_meta( $term_id, Utill::WORDPRESS_SETTINGS['category_percentage_commission'], $previous_percentage_value );
			}
        }

        update_option( 'mvx_category_settings_offset', $offset + count( $products ) );
    }

    public function migrate_vendors() {
        global $wpdb;
        $offset = (int) get_option( 'mvx_vendor_offset', 0 );

        $vendors = get_users(
            array(
				'role__in' => array( 'dc_vendor', 'dc_pending_vendor', 'dc_rejected_vendor' ),
				'number'   => self::BATCH_SIZE,
				'offset'   => $offset,
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
                    "SELECT meta_key, meta_value 
                    FROM {$wpdb->usermeta} 
                    WHERE user_id = %d",
                    $user_id
                ),
                ARRAY_A
            );
            $term_id   = get_user_meta( $user_id, '_vendor_term_id', true );
            $term      = $wpdb->get_row(
                $wpdb->prepare(
                    "SELECT name, slug FROM {$wpdb->terms} WHERE term_id = %d",
                    $term_id
                )
            );

            if (!empty($term)) {
                $name = $term->name;
                $slug = $term->slug;
            }

            if ( in_array( 'dc_vendor', (array) $user->roles, true ) ) {
                $status = 'active';
            }

            if ( in_array( 'dc_pending_vendor', (array) $user->roles, true ) ) {
                $status = 'pending';
                $name = $user->display_name;
                $slug = Store::generate_unique_store_slug( $user->display_name );
            }

            if ( in_array( 'dc_rejected_vendor', (array) $user->roles, true ) ) {
                $status = 'rejected';
                $name = $user->display_name;
                $slug = Store::generate_unique_store_slug( $user->display_name );
            }

			if ( 'Enable' === get_user_meta( $user_id, '_vendor_turn_off', true ) ) {
				$status = 'suspended';
                $name = $user->display_name;
                $slug = Store::generate_unique_store_slug( $user->display_name );
			}

            // Store create.
            $store = new Store();
            $store->set( 'name', $name );
            $store->set( 'slug', $slug );
            $store->set( 'status', $status );
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
                $meta_values = maybe_unserialize( $row['meta_value'] );
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
                    if ( $meta_values == 'distance_by_zone' ) {
                        $meta_values = 'shipping_by_zone';
                    } elseif ( $meta_values == 'distance_by_shipping' ) {
                        $meta_values = 'shipping_by_distance';
                    } else {
                        $meta_values = 'shipping_by_country';
                    }
                }

                if ( '_vendor_image' == $new_meta_key && is_numeric($meta_values) ) {
                    $logo_url = wp_get_attachment_url( $meta_values );
                    if ( $logo_url ) {
                        $store->update_meta( 'image', $logo_url );
                    }
                }

                if ( '_vendor_banner' == $new_meta_key && is_numeric($meta_values) ) {
                    $banner_url = wp_get_attachment_url( $meta_values );
                    if ( $banner_url ) {
                        $store->update_meta( 'banner', $banner_url );
                    }
                }

                $store->update_meta( $new_meta_key, $meta_values );
            }
        }

        update_option( 'mvx_vendor_offset', $offset + count( $vendors ) );
    }

    public function migrate_followers() {
        $offset = (int) get_option( 'mvx_follow_offset', 0 );

        $users = get_users(
            array(
				'meta_key'     => 'mvx_customer_follow_vendor',
				'meta_compare' => 'EXISTS',
				'fields'       => 'ID',
				'number'       => self::BATCH_SIZE,
				'offset'       => $offset,
            )
        );

        foreach ( $users as $user_id ) {
            $results  = array();
            $followed = get_user_meta( $user_id, 'mvx_customer_follow_vendor', true );

            if ( is_array( $followed ) ) {
                foreach ( $followed as $item ) {
                    if ( ! empty( $item['user_id'] ) ) {
                        $store_id = get_user_meta( $item['user_id'], Utill::USER_SETTINGS_KEYS['active_store'], true );

                        if ( $store_id ) {
                            $results[] = (int) $store_id;
                        }
                    }
                }
            }

            update_user_meta( $user_id, 'multivendorx_following_stores', array_unique( $results ) );
            delete_user_meta( $user_id, 'mvx_customer_follow_vendor' );
        }

        update_option( 'mvx_follow_offset', $offset + count( $users ) );
    }

    public function migrate_commissions() {
        global $wpdb;

        $offset     = (int) get_option( 'mvx_commission_offset', 0 );
        $table_name = $wpdb->prefix . Utill::TABLES['commission'];

        $args = array(
            'post_type'      => 'dc_commission',
            'fields'         => 'ids',
            'posts_per_page' => self::BATCH_SIZE,
            'offset'         => $offset,
            'post_status'    => 'any',
        );

        $commission_ids = get_posts( $args );
        if ( empty( $commission_ids ) ) {
			return;
        }

        foreach ( $commission_ids as $commission_id ) {
            $commission_vendor   = get_post_meta( $commission_id, '_commission_vendor', true );
            $commission_order_id = get_post_meta( $commission_id, '_commission_order_id', true );
            $store_earning       = get_post_meta( $commission_id, '_commission_amount', true );
            $store_shipping      = get_post_meta( $commission_id, '_shipping', true );
            $store_tax           = get_post_meta( $commission_id, '_tax', true );
            $store_payable       = get_post_meta( $commission_id, '_commission_total', true );
            $status              = get_post_meta( $commission_id, '_paid_status', true );
            $refunded            = abs( (float) get_post_meta( $commission_id, '_commission_refunded', true ) );
            $paid_date           = get_post_meta( $commission_id, '_paid_date', true );
            $created_at          = ( is_numeric( $paid_date ) && $paid_date > 0 )
                                    ? gmdate( 'Y-m-d H:i:s', (int) $paid_date )
                                    : 0;
            $vendor_id           = get_term_meta( $commission_vendor, '_vendor_user_id', true );
            $store_id            = get_user_meta( $vendor_id, Utill::USER_SETTINGS_KEYS['active_store'], true );
            $order               = wc_get_order( $commission_order_id );

			$wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
                $table_name,
                array(
					'order_id'       => (int) $commission_order_id,
					'store_id'       => (int) $store_id,
                    'total_order_value' =>  !empty($order) ? $order->get_total() : 0,
					'store_earning'  => $store_earning,
					'store_shipping' => $store_shipping,
					'store_tax'      => $store_tax,
					'store_payable'  => $store_payable,
					'store_refunded' => $refunded,
					'status'         => $status,
					'created_at'     => $created_at,
                ),
                array(
					'%d',
					'%d',
					'%f',
					'%f',
					'%f',
					'%f',
					'%f',
					'%f',
					'%s',
					'%s',
                )
			);
            $insert_id = $wpdb->insert_id;

            if ( in_array( $order->get_status(), array( 'completed', 'processing' ), true ) ) {
                $wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
                    $wpdb->prefix . Utill::TABLES['transaction'],
                    array(
                        'store_id'         => $store_id,
                        'order_id'         => (int) $commission_order_id,
                        'commission_id'    => $insert_id,
                        'entry_type'       => 'Cr',
                        'transaction_type' => 'Commission',
                        'amount'           => $store_payable,
                        'currency'         => get_woocommerce_currency(),
                        'narration'        => 'Commission received for order ' . $commission_order_id,
                        'status'           => 'Completed',
                        'created_at'       => $created_at,
                    ),
                    array(
                        '%d',
                        '%d',
                        '%d',
                        '%s',
                        '%s',
                        '%f',
                        '%s',
                        '%s',
                        '%s',
                        '%s',
                    )
                );
            }

            $meta_map = array(
                '_commission_id'               => 'multivendorx_commission_id',
                '_commissions_processed'       => 'multivendorx_commissions_processed',
                '_vendor_id'                   => 'multivendorx_store_id',
                'order_items_commission_rates' => 'multivendorx_order_items_commission_rates',
            );

            foreach ( $meta_map as $old_key => $new_key ) {
				if ( '_commission_id' === $old_key ) {
					$value = $insert_id;
				} elseif ( '_vendor_id' === $old_key ) {
					$value = $store_id;
				} else {
					$value = $order->get_meta( $old_key );
				}

                $order->update_meta_data( $new_key, $value );
                $order->delete_meta_data( $old_key );
            }

            $order->save();
        }

        update_option( 'mvx_commission_offset', $offset + count( $commission_ids ) );
    }

    public function migrate_refunds() {
        $offset     = (int) get_option( 'mvx_refund_offset', 0 );
        $refund_ids = wc_get_orders(
            array(
				'type'   => 'shop_order_refund',
				'status' => array_keys( wc_get_order_statuses() ),
				'return' => 'ids',
                'limit'  => self::BATCH_SIZE,
                'offset' => $offset,
            )
        );

        foreach ( $refund_ids as $refund_id ) {
            $refund          = wc_get_order( $refund_id );
            $parent_order_id = $refund->get_parent_id();
            $parent_order    = wc_get_order( $parent_order_id );

            $store_id = $parent_order->get_meta( 'multivendorx_store_id', true );
            $refund->update_meta_data( 'multivendorx_store_id', $store_id );
            $refund->save();
        }

        update_option( 'mvx_refund_offset', $offset + count( $refund_ids ) );
    }

    public function migrate_ledger() {
        global $wpdb;
        $offset = (int) get_option( 'mvx_ledger_offset', 0 );

        $old_ledger_table = $wpdb->prefix . 'mvx_vendor_ledger';
		$new_ledger_table = $wpdb->prefix . Utill::TABLES['transaction'];

        $transactions = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$old_ledger_table} LIMIT %d OFFSET %d",
                self::BATCH_SIZE,
                $offset
            ),
            ARRAY_A
        );

        $store_cache = array();

        foreach ( $transactions as $row ) {
            if ( $row['ref_status'] !== 'completed' ) {
                continue;
            }
            $author_id = (int) $row['vendor_id'];

            if ( ! isset( $store_cache[ $author_id ] ) ) {
                $store_cache[ $author_id ] = (int) get_user_meta( $author_id, Utill::USER_SETTINGS_KEYS['active_store'], true );
            }

            $store_id = ! empty( $store_cache[ $author_id ] ) ? $store_cache[ $author_id ] : 0;

            $is_credit  = ! empty( $row['credit'] );
            $entry_type = $is_credit ? 'Cr' : 'Dr';
            $amount     = $is_credit ? (float) $row['credit'] : (float) $row['debit'];
            $order      = wc_get_order( $row['order_id'] );

			$wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
                $new_ledger_table,
                array(
					'store_id'         => $store_id,
					'order_id'         => (int) $row['order_id'],
					'commission_id'    => $order->get_meta( 'multivendorx_commission_id', true ),
					'entry_type'       => $entry_type,
					'transaction_type' => $row['ref_type'],
					'amount'           => $amount,
					'currency'         => get_woocommerce_currency(),
					'narration'        => $row['ref_info'],
					'status'           => $row['ref_status'],
					'created_at'       => $row['created'],
                ),
                array(
					'%d',
					'%d',
					'%d',
					'%s',
					'%s',
					'%f',
					'%s',
					'%s',
					'%s',
					'%s',
                )
			);
        }

        update_option( 'mvx_ledger_offset', $offset + count( $transactions ) );
    }

    public function migrate_product_coupon_vendor() {
        $offset = (int) get_option( 'mvx_product_migration_offset', 0 );

        $store_owners = get_users(
            array(
				'role'   => 'store_owner',
				'fields' => 'ID',
            )
        );

        if ( empty( $store_owners ) ) {
            return;
        }

        $products = get_posts(
            array(
				'post_type'      => 'product',
				'fields'         => 'ids',
				'posts_per_page' => self::BATCH_SIZE,
				'offset'         => $offset,
				'post_status'    => 'any',
            )
        );

        foreach ( $products as $product_id ) {
            $author_id = get_post_field( 'post_author', $product_id );

            // Only assign if author is store_owner
            if ( in_array( $author_id, $store_owners, true ) ) {
                $active_store = get_user_meta( $author_id, Utill::USER_SETTINGS_KEYS['active_store'], true );
                update_post_meta( $product_id, Utill::POST_META_SETTINGS['store_id'], $active_store );
            }
        }

        update_option( 'mvx_product_migration_offset', $offset + count( $products ) );

        // Migrate coupon vendor.
        $offset = (int) get_option( 'mvx_coupon_migration_offset', 0 );

        $coupons = get_posts(
            array(
				'post_type'      => 'shop_coupon',
				'fields'         => 'ids',
				'posts_per_page' => self::BATCH_SIZE,
				'offset'         => $offset,
				'post_status'    => 'any',
            )
        );

        foreach ( $coupons as $coupon_id ) {
            $author_id = get_post_field( 'post_author', $coupon_id );

            if ( in_array( $author_id, $store_owners, true ) ) {
                $active_store = get_user_meta( $author_id, Utill::USER_SETTINGS_KEYS['active_store'], true );
                update_post_meta( $coupon_id, Utill::POST_META_SETTINGS['store_id'], $active_store );
            }
        }

        update_option( 'mvx_coupon_migration_offset', $offset + count( $coupons ) );
    }

    public function migrate_reviews() {
        global $wpdb;

        $offset       = (int) get_option( 'mvx_rating_offset', 0 );
        $limit        = self::BATCH_SIZE;
        $table_review = $wpdb->prefix . Utill::TABLES['review'];

        $query = new \WP_Comment_Query(
            array(
				'type'    => 'mvx_vendor_rating',
				'number'  => $limit,
				'offset'  => $offset,
				'status'  => 'approve',
				'orderby' => 'comment_ID',
				'order'   => 'ASC',
            )
        );

        $comments = $query->comments;
        foreach ( $comments as $comment ) {
            $comment_id = $comment->comment_ID;
            $rating     = get_comment_meta( $comment_id, 'vendor_rating', true );
            $vendor_id  = get_comment_meta( $comment_id, 'vendor_rating_id', true );
            $store_id   = get_user_meta( $vendor_id, Utill::USER_SETTINGS_KEYS['active_store'], true );

            $wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
                $table_review,
                array(
                    'store_id'       => $store_id,
                    'customer_id'    => $comment->user_id,
                    'overall_rating' => $rating,
                    'review_title'   => wp_trim_words( $comment->comment_content, 5, '' ),
                    'review_content' => $comment->comment_content,
                    'status'         => 'approved',
                    'date_created'   => $comment->comment_date,
                    'user_ip'        => $comment->comment_author_IP,
                )
            );
        }
        update_option( 'mvx_rating_offset', $offset + count( $comments ) );
    }
}
