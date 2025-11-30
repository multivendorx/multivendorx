<?php

namespace MultiVendorX\Store;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Main Store class
 *
 * @version     PRODUCT_VERSION
 * @package     MultiVendorX
 * @author      MultiVendorX
 */
class Store {

    protected $id        = 0;
    protected $data      = array();
    protected $meta_data = array();

    private $container = array();

    public function __construct( $store_id = 0 ) {

        $this->init_classes();

        if ( $store_id > 0 ) {
            $this->load( $store_id );
        }
    }

    /**
     * Initialize all Store classes.
     */
    public function init_classes() {
        $this->container = array(
            'rewrites'  => new Rewrites(),
            'storeutil' => new StoreUtil(),
        );
    }

    public function load( $store_id ) {
        global $wpdb;
        $table = "{$wpdb->prefix}" . Utill::TABLES['store'];

        $row = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM $table WHERE ID = %d",
                $store_id,
            ),
            ARRAY_A
        );

        if ( $row ) {
            $this->id        = $row['ID'];
            $this->data      = $row;
            $this->meta_data = $this->get_all_meta();
        }
    }

    public function get_id() {
        return $this->id;
    }

    public function get( $key ) {
        return $this->data[ $key ] ?? null;
    }

    public function set( $key, $value ) {
        $this->data[ $key ] = $value;
    }

    public function save() {
        global $wpdb;
        $table = "{$wpdb->prefix}" . Utill::TABLES['store'];

        $data = array(
            'name'        => $this->data['name'] ?? '',
            'slug'        => $this->data['slug'] ?? sanitize_title( $this->data['name'] ?? '' ),
            'description' => $this->data['description'] ?? '',
            'who_created' => $this->data['who_created'] ?? 'admin',
            'status'      => $this->data['status'] ?? 'active',
        );

        $formats = array( '%s', '%s', '%s', '%s', '%s' );

        if ( $this->id > 0 ) {
            $wpdb->update( $table, $data, array( 'ID' => $this->id ), $formats, array( '%d' ) );
        } else {
            $wpdb->insert( $table, $data, $formats );
            $this->id = $wpdb->insert_id;
        }

        return $this->id;
    }


    public function get_meta( $key, $single = true ) {

        global $wpdb;
        $table = "{$wpdb->prefix}" . Utill::TABLES['store_meta'];

        if ( $single ) {
            return ( $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT meta_value FROM $table WHERE store_id = %d AND meta_key = %s LIMIT 1",
                    $this->id,
                    $key
                )
            ) );
        } else {
            $values = $wpdb->get_col(
                $wpdb->prepare(
                    "SELECT meta_value FROM $table WHERE store_id = %d AND meta_key = %s",
                    $this->id,
                    $key
                )
            );
            return $values;
        }
    }

    public function get_all_meta() {
        global $wpdb;
        $table = "{$wpdb->prefix}" . Utill::TABLES['store_meta'];

        $rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT meta_key, meta_value FROM $table WHERE store_id = %d",
                $this->id
            ),
            ARRAY_A
        );

        $meta = array();
        foreach ( $rows as $row ) {
            $meta[ $row['meta_key'] ] = $row['meta_value'];
        }

        return $meta;
    }

    public function update_meta( $key, $value ) {
        global $wpdb;
        $table = "{$wpdb->prefix}" . Utill::TABLES['store_meta'];

        if ( is_array( $value ) || is_object( $value ) ) {
            $value = wp_json_encode( $value );
        }

        $exists = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT ID FROM $table WHERE store_id = %d AND meta_key = %s",
                $this->id,
                $key
            )
        );

        if ( $exists ) {
            $wpdb->update(
                $table,
                array( 'meta_value' => $value ),
                array( 'ID' => $exists ),
                array( '%s' ),
                array( '%d' )
            );
        } else {
            $wpdb->insert(
                $table,
                array(
                    'store_id'   => $this->id,
                    'meta_key'   => $key,
                    'meta_value' => $value,
                ),
                array( '%d', '%s', '%s' )
            );
        }
    }

    public function __get( $class ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound
        if ( property_exists( $this, $class ) ) {
            return $this->$class;
        }
        if ( array_key_exists( $class, $this->container ) ) {
            return $this->container[ $class ];
        }

        return new \WP_Error( sprintf( 'Call to unknown class %s.', $class ) );
    }

    public static function get_store_by_id( $id ) {
        return $id ? new self( $id ) : null;
    }

    public static function get_store_by_slug( $slug ) {
        global $wpdb;
        $table = "{$wpdb->prefix}" . Utill::TABLES['store'];

        $id = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT ID FROM $table WHERE slug = %s LIMIT 1",
                $slug
            )
        );

        return $id ? new self( $id ) : null;
    }

    // public static function store_slug_exists($slug) {
    // global $wpdb;
    // $table = "{$wpdb->prefix}"  . Utill::TABLES['store'];

    // $exists = $wpdb->get_var(
    // $wpdb->prepare("SELECT COUNT(*) FROM {$table} WHERE slug = %s", $slug)
    // );
    // return $exists;
    // }

    public static function store_slug_exists( $slug, $exclude_id = 0 ) {
        global $wpdb;
        $table = "{$wpdb->prefix}" . Utill::TABLES['store'];

        if ( $exclude_id ) {
            $query = $wpdb->prepare(
                "SELECT COUNT(*) FROM {$table} WHERE slug = %s AND id != %d",
                $slug,
                $exclude_id
            );
        } else {
            $query = $wpdb->prepare(
                "SELECT COUNT(*) FROM {$table} WHERE slug = %s",
                $slug
            );
        }

        $exists = (int) $wpdb->get_var( $query );

        return $exists > 0;
    }


    public static function get_store_by_name( $name ) {
        global $wpdb;
        if ( empty( $name ) ) {
			return false;
        }

        $table   = "{$wpdb->prefix}" . Utill::TABLES['store'];
        $like    = '%' . $wpdb->esc_like( $name ) . '%';
        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$table} WHERE name LIKE %s AND status = %s",
                $like,
                'active'
            ),
            ARRAY_A
        );

        $stores = array();
        if ( ! empty( $results ) ) {
            foreach ( $results as $row ) {
                $stores[] = new self( (int) $row['ID'] );
            }
        }

        return $stores;
    }

    /**
     * Delete a store meta key.
     *
     * @param string $key Meta key to delete.
     */
    public function delete_meta( $key ) {
        global $wpdb;
        $table = "{$wpdb->prefix}" . Utill::TABLES['store_meta'];

        $wpdb->delete(
            $table,
            array(
                'store_id' => $this->id,
                'meta_key' => $key,
            ),
            array( '%d', '%s' )
        );
    }

    public function delete_all_meta() {
        global $wpdb;
        $table = "{$wpdb->prefix}" . Utill::TABLES['store_meta'];

        $deleted = $wpdb->delete(
            $table,
            array( 'store_id' => (int) $this->id ),
            array( '%d' )
        );

        return $deleted !== false;
    }


    public function delete_store_completely() {
        global $wpdb;

        $store_id = (int) $this->id;

        if ( $store_id <= 0 ) {
            return false;
        }

        // Table names
        $store_table       = "{$wpdb->prefix}" . Utill::TABLES['store'];
        $store_users_table = "{$wpdb->prefix}" . Utill::TABLES['store_users'];
        $store_meta_table  = "{$wpdb->prefix}" . Utill::TABLES['store_meta'];

        // Run deletions
        $wpdb->delete( $store_meta_table, array( 'store_id' => $store_id ), array( '%d' ) );
        $wpdb->delete( $store_users_table, array( 'store_id' => $store_id ), array( '%d' ) );
        $wpdb->delete( $store_table, array( 'ID' => $store_id ), array( '%d' ) );

        return true;
    }
}
