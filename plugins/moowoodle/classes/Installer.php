<?php
/**
 * Installer class file.
 *
 * @package MooWoodle
 */

namespace MooWoodle;

defined( 'ABSPATH' ) || exit;
use MooWoodle\Core\Category;
use MooWoodle\Core\Course;
use MooWoodle\Enrollment;
use MooWoodle\Util;

/**
 * MooWoodle Installer class
 *
 * @version     3.3.0
 * @package     MooWoodle
 * @author      DualCube
 */
class Installer {
    /**
     * Installer Constructor.
     */
    public function __construct() {
        $previous_version = get_option( 'moowoodle_version', false );
		if ( ! $previous_version ) {
			$this->set_default_settings();
			$this->create_tables();
		} else {
			$this->run_migrations( $previous_version );
		}

        update_option( 'moowoodle_version', MOOWOODLE_PLUGIN_VERSION );

        do_action( 'moowoodle_updated' );
    }

    /**
     * Set default moowoodle admin settings.
     *
     * @return void
     */
    private function set_default_settings() {
        $connection_access = array(
            'moodle_url'               => '',
            'moodle_access_token'      => '',
            'moowoodle_sso_enable'     => array(),
            'moowoodle_sso_secret_key' => '',
        );

        $course_enrollment = array(
            'start_end_date'                    => array( 'start_end_date' ),
            'my_courses_priority'               => 0,
            'learners_hub_priority'             => 1,
            'moowoodle_create_user_custom_mail' => array(),
        );

        // Default value for log setting.
        $system_log_settings = array(
            'moowoodle_adv_log' => array(),
            'moodle_timeout'    => 5,
            'schedule_interval' => 1,
        );

        // Default value sync course setting.
        $course_settings = array(
            'sync_course_options' => array( 'sync_courses_category' ),
            'product_sync_option' => array( 'create', 'update' ),
        );
        // Default value for sync user setting.
        $user_settings = array(
            'wordpress_user_role' => array( 'customer' ),
            'moodle_user_role'    => array( '5' ),
        );

        update_option( Util::MOOWOODLE_SETTINGS['connection-access'], $connection_access );
        update_option( Util::MOOWOODLE_SETTINGS['course-enrollment'], $course_enrollment );
        update_option( Util::MOOWOODLE_SETTINGS['system-logs'], $system_log_settings );
        update_option( Util::MOOWOODLE_SETTINGS['synchronize-course'], $course_settings );
        update_option( Util::MOOWOODLE_SETTINGS['synchronize-user'], $user_settings );
    }

    /**
     * Database creation functions.
     *
     * @return void
     */
    public static function create_tables() {
        global $wpdb;

        // Get the charset collate for the tables.
        $collate = $wpdb->get_charset_collate();

        // SQL for enrollment table.
        $sql_enrollment = "CREATE TABLE `{$wpdb->prefix}" . Util::TABLES['enrollment'] . "` (
            `id` bigint(20) NOT NULL AUTO_INCREMENT,
            `user_id` bigint(20) NOT NULL DEFAULT 0,
            `user_email` varchar(100) NOT NULL,
            `course_id` bigint(20) NOT NULL,
            `cohort_id` bigint(20) NOT NULL,
            `group_id` bigint(20) NOT NULL,
            `order_id` bigint(20) NOT NULL,
            `order_item_id` bigint(20) NOT NULL,
            `status` varchar(20) NOT NULL,
            `enrollment_date` timestamp NULL DEFAULT NULL,
            `unenrollment_date` timestamp NULL DEFAULT NULL,
            `unenrollment_reason` text DEFAULT NULL,
            `learners_hub_id` bigint(20) NOT NULL,
            PRIMARY KEY (`id`)
        ) $collate;";

        // SQL for category table.
        $sql_category = "CREATE TABLE `{$wpdb->prefix}" . Util::TABLES['category'] . "` (
            `id` bigint(20) NOT NULL,
            `name` varchar(255) NOT NULL,
            `parent_id` bigint(20) NOT NULL DEFAULT 0,
            PRIMARY KEY (`id`)
        ) $collate;";

        // SQL for course table.
        $sql_course = "CREATE TABLE `{$wpdb->prefix}" . Util::TABLES['course'] . "` (
            `id` bigint(20) NOT NULL AUTO_INCREMENT,
            `moodle_course_id` bigint(20) NOT NULL,
            `shortname` varchar(255) NOT NULL,
            `category_id` bigint(20) NOT NULL,
            `fullname` text NOT NULL,
            `product_id` bigint(20) NOT NULL,
            `startdate` bigint(20) DEFAULT NULL,
            `enddate` bigint(20) DEFAULT NULL,
            `created` datetime DEFAULT NULL,
            PRIMARY KEY (`id`),
            UNIQUE KEY `moodle_course_id` (`moodle_course_id`)
        ) $collate;";

        // Include upgrade functions if not loaded.
        if ( ! function_exists( 'dbDelta' ) ) {
            require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        }

        // Run dbDelta on each table creation SQL.
        dbDelta( $sql_enrollment );
        dbDelta( $sql_category );
        dbDelta( $sql_course );
    }

    /**
     * Migrate database.
     *
     * @return void
     */
    public static function run_migrations( $previous_version ) {

        if ( version_compare( $previous_version, '3.3.0', '<' ) ) {
            self::create_tables();
            self::migrate_categories_3_3_0();
            self::migrate_courses_3_3_0();
            self::migrate_enrollments_3_3_0();
        }

        if ( version_compare( $previous_version, '3.3.1', '<' ) ) {
            self::migrate_courses_3_3_0();
        }

        if ( version_compare( $previous_version, '3.3.3', '<' ) ) {
            $general_settings = get_option( 'moowoodle_general_settings', array() );
            unset(
                $general_settings['moodle_timeout'],
                $general_settings['moowoodle_adv_log']
            );

            update_option( 'moowoodle_general_settings', $general_settings );
        }

        if ( version_compare( $previous_version, '3.4.0', '<' ) ) {
            self::migrate_product_meta_3_4_0();

            $general_settings = get_option( 'moowoodle_general_settings', array() );
            $sso_settings     = get_option( 'moowoodle_sso_settings', array() );
            update_option( Util::MOOWOODLE_SETTINGS['connection-access'], array_merge( $general_settings, $sso_settings ) );

            $display_settings     = get_option( 'moowoodle_display_settings', array() );
            $bulk_access_settings = get_option( 'moowoodle_bulk_access_settings', array() );
            update_option( Util::MOOWOODLE_SETTINGS['course-enrollment'], array_merge( $display_settings, $bulk_access_settings ) );

            $tool_settings = get_option( 'moowoodle_tool_settings', array() );
            $log_settings  = get_option( 'moowoodle_log_settings', array() );
            update_option( Util::MOOWOODLE_SETTINGS['system-logs'], array_merge( $tool_settings, $log_settings ) );

            delete_option( 'moowoodle_general_settings' );
            delete_option( 'moowoodle_sso_settings' );
            delete_option( 'moowoodle_display_settings' );
            delete_option( 'moowoodle_bulk_access_settings' );
            delete_option( 'moowoodle_tool_settings' );
            delete_option( 'moowoodle_log_settings' );

            $synchronize_user_settings = get_option( Util::MOOWOODLE_SETTINGS['synchronize-user'], array() );

            if ( ! empty( $synchronize_user_settings['user_sync_options'] ) ) {
                foreach ( $synchronize_user_settings['user_sync_options'] as &$mapping ) {
                    if ( isset( $mapping[0], $mapping[1] ) ) {
                        $mapping = array(
                            'wordpress' => $mapping[0],
                            'moodle'    => $mapping[1],
                        );
                    }
                }

                update_option(
                    Util::MOOWOODLE_SETTINGS['synchronize-user'],
                    $synchronize_user_settings
                );
            }

            $synchronize_course_settings = get_option( Util::MOOWOODLE_SETTINGS['synchronize-course'], array() );

            if ( ! empty( $synchronize_course_settings['sync-course-options'] ) ) {
                $synchronize_course_settings['sync_course_options'] = $synchronize_course_settings['sync-course-options'];

                unset( $synchronize_course_settings['sync-course-options'] );

                update_option(
                    Util::MOOWOODLE_SETTINGS['synchronize-course'],
                    $synchronize_course_settings
                );
            }
        }
    }

    /**
     * Migrate WordPress term data to the MooWoodle categories table.
     *
     * This function reads terms from the 'course_cat' taxonomy that have Moodle category IDs
     * stored in term meta (_category_id), and inserts or updates them in the moowoodle_categories table.
     *
     * @return void
     */
    public static function migrate_categories_3_3_0() {
            global $wpdb;

            // Get terms with '_category_id' meta and optional '_parent' meta for 'course_cat' taxonomy.
            $category_migration_query = $wpdb->prepare(
                "
                SELECT 
                    t.term_id,
                    t.name,
                    tm.meta_value AS id,
                    pm.meta_value AS parent_id
                FROM {$wpdb->terms} t
                INNER JOIN {$wpdb->term_taxonomy} tt 
                    ON t.term_id = tt.term_id
                INNER JOIN {$wpdb->termmeta} tm 
                    ON t.term_id = tm.term_id AND tm.meta_key = '_category_id' AND tm.meta_value > 0
                LEFT JOIN {$wpdb->termmeta} pm 
                    ON t.term_id = pm.term_id AND pm.meta_key = '_parent'
                WHERE tt.taxonomy = %s
            ",
                'course_cat'
            );

        $category_terms = $wpdb->get_results( $category_migration_query, ARRAY_A ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery

		if ( empty( $category_terms ) ) {
			return;
		}

		foreach ( $category_terms as $term ) {
			$category_payload = array(
				'id'        => (int) $term['id'],
				'name'      => sanitize_text_field( $term['name'] ),
				'parent_id' => (int) $term['parent_id'],
			);

			$category_updated = Category::update_course_category( $category_payload );

            if ( $category_updated ) {
                wp_delete_term( (int) $term['term_id'], 'course_cat' );
            }
		}
    }


    /**
     * Migrate old course post data to the custom MooWoodle course table.
     *
     * This function fetches all posts of type 'course', reads their meta data,
     * and inserts the relevant information into the custom course table.
     * Optionally, it can update the linked product meta and delete the old post.
     *
     * @return void
     */
    public static function migrate_courses_3_3_0() {
        $matched_courses = get_posts(
            array(
                'post_type'      => 'course',
                'post_status'    => 'any',
                'posts_per_page' => -1,
                'meta_key'       => 'moodle_course_id',
                'fields'         => 'ids',
            )
        );

        if ( empty( $matched_courses ) ) {
            return;
        }

        foreach ( $matched_courses as $course_id ) {
            $legacy_course_meta = get_post_meta( $course_id );

            if ( empty( $legacy_course_meta['moodle_course_id'][0] ) ) {
                continue;
            }

            $course_payload = array(
                'moodle_course_id' => is_array( $legacy_course_meta['moodle_course_id'] ?? null ) ? reset( $legacy_course_meta['moodle_course_id'] ) : 0,
                'shortname'        => is_array( $legacy_course_meta['_course_short_name'] ?? null ) ? reset( $legacy_course_meta['_course_short_name'] ) : '',
                'category_id'      => is_array( $legacy_course_meta['_category_id'] ?? null ) ? reset( $legacy_course_meta['_category_id'] ) : 0,
                'fullname'         => get_the_title( $course_id ),
                'product_id'       => is_array( $legacy_course_meta['linked_product_id'] ?? null ) ? reset( $legacy_course_meta['linked_product_id'] ) : 0,
                'startdate'        => is_array( $legacy_course_meta['_course_startdate'] ?? null ) ? reset( $legacy_course_meta['_course_startdate'] ) : 0,
                'enddate'          => is_array( $legacy_course_meta['_course_enddate'] ?? null ) ? reset( $legacy_course_meta['_course_enddate'] ) : 0,
            );

            $new_course_id = Course::update_course( $course_payload );

            if ( ! empty( $course_payload['product_id'] ) && $new_course_id ) {
                update_post_meta( $course_payload['product_id'], 'linked_course_id', $new_course_id );
                wp_delete_post( $course_id, true );
            }
        }
    }

    /**
     * Migrate enrollment data from order to our custom table.
     *
     * @return void
     */
    public static function migrate_enrollments_3_3_0() {
        // Get all enrollment data.
        $order_ids = wc_get_orders(
            array(
                'status'     => 'completed',
                'meta_query' => array(
                    array(
                        'key'     => 'moodle_user_enrolled',
                        'value'   => 1,
                        'compare' => '=',
                    ),
                ),
                'return'     => 'ids',
            )
        );

        // Migrate all orders.
        foreach ( $order_ids as $order_id ) {
            $order = wc_get_order( $order_id );
            if ( ! $order instanceof \WC_Order ) {
                continue;
            }
            self::migrate_enrollment( $order );
        }
    }


    /**
     * Migrate enrollment data from the WooCommerce order to the custom enrollment table.
     *
     * This function checks each product in the order, finds the associated Moodle course,
     * and saves the enrollment status (enrolled/unenrolled) for the user.
     *
     * @param WC_Order $order WooCommerce order object.
     */
    public static function migrate_enrollment( $order ) {
        $unenrolled_courses = $order->get_meta( '_course_unenroled', true );
        $unenrolled_courses = $unenrolled_courses ? explode( ',', $unenrolled_courses ) : array();

        $customer = $order->get_user();
        if ( ! $customer ) {
            return;
        }

        $enrollment_date = $order->get_meta( 'moodle_user_enrolment_date', true );
        if ( is_numeric( $enrollment_date ) ) {
            $enrollment_date = gmdate( 'Y-m-d H:i:s', $enrollment_date );
        }

        foreach ( $order->get_items() as $item ) {
            $product = $item->get_product();
            if ( ! $product ) {
                continue;
            }

            $moodle_course_id = $product->get_meta( Util::MOOWOODLE_PRODUCT_META['moodle_course_id'], true );
            $linked_course_id = $product->get_meta( Util::MOOWOODLE_PRODUCT_META['linked_course_id'], true );

            $courses = Course::get_courses(
                array( 'moodle_course_id' => $moodle_course_id )
            );

            $course = reset( $courses );
            if ( empty( $course ) ) {
                continue;
            }

            $enrollment_data = array(
                'user_id'         => $customer->ID,
                'user_email'      => $customer->user_email,
                'course_id'       => (int) $course['id'],
                'order_id'        => $order->get_id(),
                'order_item_id'   => $item->get_id(),
                'status'          => in_array( $linked_course_id, $unenrolled_courses, true ) ? 'unenrolled' : 'enrolled',
                'enrollment_date' => $enrollment_date,
            );

            Enrollment::update_enrollment( $enrollment_data );
        }
    }

    /**
     * Migrate legacy product meta keys to new prefixed keys.
     *
     * @return void
     */
    public static function migrate_product_meta_3_4_0() {

        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
        $wpdb->query(
            "
            UPDATE {$wpdb->postmeta}
            SET meta_key = CASE meta_key
                WHEN '_course_startdate' THEN 'moowoodle_course_startdate'
                WHEN '_course_enddate' THEN 'moowoodle_course_enddate'
                WHEN 'moodle_course_id' THEN 'moowoodle_moodle_course_id'
                WHEN 'linked_course_id' THEN 'moowoodle_wordpress_course_id'
                WHEN 'linked_cohort_id' THEN 'moowoodle_wordpress_cohort_id'
                WHEN 'moodle_cohort_id' THEN 'moowoodle_moodle_cohort_id'
                WHEN 'moodle_group_id' THEN 'moowoodle_moodle_group_id'
                WHEN 'linked_group_id' THEN 'moowoodle_wordpress_group_id'
            END
            WHERE meta_key IN (
                '_course_startdate',
                '_course_enddate',
                'moodle_course_id',
                'linked_course_id',
                'linked_cohort_id',
                'moodle_cohort_id',
                'moodle_group_id',
                'linked_group_id'
            )
            "
        );

        wp_cache_flush();
    }
}
