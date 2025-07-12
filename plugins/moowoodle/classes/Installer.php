<?php
/**
 * Installer class file.
 *
 * @package MooWoodle
 */

namespace MooWoodle;

defined( 'ABSPATH' ) || exit;

/**
 * MooWoodle Installer class
 *
 * @version     PRODUCT_VERSION
 * @package     MooWoodle
 * @author      DualCube
 */
class Installer {
    /**
     * Installer Constructor.
     */
    public function __construct() {
		if ( ! ( get_option( 'moowoodle_version', false ) ) ) {
			$this->set_default_settings();
			$this->create_databases();
		} else {
			$this->run_default_migration();
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
        $general_settings = array(
            'moodle_url'          => '',
            'moodle_access_token' => '',
        );
        // Default value for sso setting.
        $sso_settings = array(
            'moowoodle_sso_enable'     => array(),
            'moowoodle_sso_secret_key' => '',
        );
        // Default value for display setting.
        $display_settings = array(
            'start_end_date'                    => array( 'start_end_date' ),
            'my_courses_priority'               => 0,
            'learners_hub_priority'             => 1,
            'moowoodle_create_user_custom_mail' => array(),
        );
        // Default value for log setting.
        $tool_settings = array(
            'moowoodle_adv_log' => array(),
            'moodle_timeout'    => 5,
            'schedule_interval' => 1,
        );
        // Default value sync course setting.
        $course_settings = array(
            'sync-course-options' => array( 'sync_courses_category' ),
            'product_sync_option' => array( 'create', 'update' ),
        );
        // Default value for sync user setting.
        $user_settings = array(
            'wordpress_user_role' => array( 'customer' ),
            'moodle_user_role'    => array( '5' ),
        );
        // Update default settings.
        update_option(
            'moowoodle_general_settings',
            array_merge(
                $general_settings,
                get_option( 'moowoodle_general_settings', array() )
            )
        );
        update_option(
            'moowoodle_sso_settings',
            array_merge(
                $sso_settings,
                get_option( 'moowoodle_sso_settings', array() )
            )
        );
        update_option( 'moowoodle_display_settings', $display_settings );
        update_option( 'moowoodle_tool_settings', $tool_settings );
        update_option( 'moowoodle_synchronize_course_settings', $course_settings );
        update_option( 'moowoodle_synchronize_user_settings', $user_settings );
    }

    /**
     * Database creation functions.
     *
     * @return void
     */
    public static function create_databases() {
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
    public static function run_default_migration() {
        $previous_version = get_option( 'moowoodle_version', '' );

        if ( version_compare( $previous_version, '3.3.0', '<' ) ) {
            self::create_databases();
            self::migrate_categories_3_3_0();
            self::migrate_courses_3_3_0();
            self::migrate_enrollments_3_3_0();
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
            $query = $wpdb->prepare(
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

            $terms = $wpdb->get_results( $query, ARRAY_A ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared

		if ( empty( $terms ) ) {
			return;
		}

		foreach ( $terms as $term ) {
			$args = array(
				'id'        => (int) $term['id'],
				'name'      => sanitize_text_field( $term['name'] ),
				'parent_id' => (int) $term['parent_id'],
			);

			$response = \MooWoodle\Core\Category::update_course_category_information( $args );

            if ( $response ) {
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
        $courses = get_posts(
            array(
                'post_type'      => 'course',
                'post_status'    => 'any',
                'posts_per_page' => -1,
                'meta_key'       => 'moodle_course_id',
            )
        );

        if ( empty( $courses ) ) {
            return;
        }

        foreach ( $courses as $course ) {
            $all_meta = get_post_meta( $course->ID );

            if ( empty( $all_meta['moodle_course_id'][0] ) ) {
                continue;
            }

            $course_data = array(
                'moodle_course_id' => reset( $all_meta['moodle_course_id'] ) ?? 0,
                'shortname'        => reset( $all_meta['_course_short_name'] ) ?? '',
                'category_id'      => reset( $all_meta['_category_id'] ) ?? 0,
                'fullname'         => sanitize_text_field( $course->post_title ),
                'product_id'       => reset( $all_meta['linked_product_id'] ) ?? 0,
                'startdate'        => reset( $all_meta['_course_startdate'] ) ?? 0,
                'enddate'          => reset( $all_meta['_course_enddate'] ) ?? 0,
            );

            $new_course_id = \MooWoodle\Core\Course::update_course_information( $course_data );

            if ( ! empty( $course_data['product_id'] ) && $new_course_id ) {
                update_post_meta( $course_data['product_id'], 'linked_course_id', $new_course_id );
                wp_delete_post( $course->ID, true );
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

            $moodle_course_id = $product->get_meta( 'moodle_course_id', true );
            $linked_course_id = $product->get_meta( 'linked_course_id', true );

            $course = \MooWoodle\Core\Course::get_course_information(
                array( 'moodle_course_id' => $moodle_course_id )
            );

            $course = reset( $course );
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

            \MooWoodle\Enrollment::update_enrollment_information( $enrollment_data );        }
    }
}
