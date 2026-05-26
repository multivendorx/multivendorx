<?php
/**
 * MultiVendorX Store class
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Store;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Main Store class
 *
 * @version     5.0.0
 * @package     MultiVendorX
 * @author      MultiVendorX
 */
class Store {

    /**
     * Store ID.
     *
     * @var int
     */
    protected $id = 0;

    /**
     * Store data.
     *
     * @var array
     */
    protected $data = array();

    /**
     * Store meta data.
     *
     * @var array
     */
    protected $meta_data = array();

    /**
     * Container for store classes.
     *
     * @var array
     */
    private $container = array();

    /**
     * Cache loaded stores.
     *
     * @var array
     */
    protected static $store_cache = array();

    /**
     * Constructor.
     *
     * @param int $store_id Store ID.
     */
    public function __construct( $store_id = 0 ) {

        $this->init_classes();

        if ( $store_id > 0 ) {
            $this->load( $store_id );
        }
    }

    public function exists() {
        return ! empty( $this->id ) && $this->id > 0;
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

    /**
     * Load store data from the database.
     *
     * @param int $store_id Store ID.
     */
    public function load( $store_id ) {
        global $wpdb;

        $store_id = (int) $store_id;
        if ( $store_id <= 0 ) {
            return false;
        }

        // Already loaded in current object.
        if ( $this->id === $store_id && ! empty( $this->data ) ) {
            return true;
        }

        // Static cache.
        if ( isset( self::$store_cache[ $store_id ] ) ) {
            $cached = self::$store_cache[ $store_id ];

            $this->id        = $cached['id'];
            $this->data      = $cached['data'];
            $this->meta_data = $cached['meta_data'];

            return true;
        }

        $table = $wpdb->prefix . Utill::TABLES['store'];

        $sql = $wpdb->prepare(
            "SELECT * FROM {$table} WHERE ID = %d LIMIT 1",
            $store_id
        );

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $row = $wpdb->get_row( $sql, ARRAY_A );
        if ( ! empty( $wpdb->last_error ) && MultiVendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( $wpdb->last_error, 'ERROR' );
        }

        if ( empty( $row ) ) {
            $this->id        = 0;
            $this->data      = array();
            $this->meta_data = array();

            return false;
        }

        $this->id   = (int) $row['ID'];
        $this->data = $row;
        // Load meta once.
        $this->meta_data = $this->get_all_meta();

        // Save cache.
        self::$store_cache[ $store_id ] = array(
            'id'        => $this->id,
            'data'      => $this->data,
            'meta_data' => $this->meta_data,
        );

        return true;
    }

    /**
     * Get store ID.
     */
    public function get_id() {
        return $this->id;
    }

    /**
     * Get store data.
     *
     * @param string $key Data key.
     */
    public function get( $key ) {
        return $this->data[ $key ] ?? null;
    }

    /**
     * Set store data.
     *
     * @param string $key   Data key.
     * @param mixed  $value Data value.
     */
    public function set( $key, $value ) {
        $this->data[ $key ] = $value;
    }

    /**
     * Save store data to the database.
     *
     * @return int Store ID.
     */
    public function save() {
        global $wpdb;

        $table = esc_sql( $wpdb->prefix . Utill::TABLES['store'] );

        $data = array(
            Utill::STORE_SETTINGS_KEYS['name']        => $this->data['name'] ?? '',
            Utill::STORE_SETTINGS_KEYS['slug']        => $this->data['slug'] ?? sanitize_title( $this->data['name'] ?? '' ),
            Utill::STORE_SETTINGS_KEYS['description'] => $this->data['description'] ?? '',
            Utill::STORE_SETTINGS_KEYS['who_created'] => $this->data['who_created'] ?? 'admin',
            Utill::STORE_SETTINGS_KEYS['status']      => $this->data['status'] ?? 'active',
        );

        $formats = array( '%s', '%s', '%s', '%s', '%s' );

        if ( $this->id > 0 ) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->update( $table, $data, array( 'ID' => $this->id ), $formats, array( '%d' ) );
        } else {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->insert( $table, $data, $formats );
            $this->id = $wpdb->insert_id;
        }

        if ( ! empty( $wpdb->last_error ) && MultiVendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }

        return $this->id;
    }

    /**
     * Get store meta value.
     *
     * @param string $key    Meta key to look up.
     * @param bool   $single Whether to return a single value or an array of values.
     *
     * @return mixed Meta value(s) or null.
     */
    public function get_meta( $key, $single = true ) {
        if ( ! isset( $this->meta_data[ $key ] ) ) {
            return $single ? null : array();
        }

        $value = $this->meta_data[ $key ];

        if ( $single ) {
            return $value;
        }

        return is_array( $value ) ? $value : array( $value );
    }

	/**
	 * Get all meta data for this store.
	 *
	 * @return array Key-value array of all store meta.
	 */
    public function get_all_meta() {
        global $wpdb;

        // Return cached meta.
        if ( ! empty( $this->meta_data ) ) {
            return $this->meta_data;
        }

        if ( ! $this->id ) {
            return array();
        }

        $table = $wpdb->prefix . Utill::TABLES['store_meta'];

        $sql = $wpdb->prepare(
            "SELECT meta_key, meta_value FROM {$table} WHERE store_id = %d",
            $this->id
        );

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $rows = $wpdb->get_results( $sql, ARRAY_A );

        $meta = array();

        foreach ( $rows as $row ) {
            $meta[ $row['meta_key'] ] = maybe_unserialize( $row['meta_value'] );
        }

        $this->meta_data = $meta;
        return $this->meta_data;
    }

	/**
	 * Get store data
	 *
	 * @return array Store data array
	 */
	public function get_data() {
		return $this->data;
	}
	/**
	 * Update store meta value.
	 *
	 * @param string $key   Meta key to update.
	 * @param mixed  $value Value to assign to the meta key.
	 */
	public function update_meta( $key, $value ) {
		global $wpdb;

		$table = $wpdb->prefix . Utill::TABLES['store_meta'];

		if ( is_array( $value ) || is_object( $value ) ) {
			$value = maybe_serialize( $value );
		}

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$exists = $wpdb->get_var( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->prepare(
                "SELECT ID FROM {$table} WHERE store_id = %d AND meta_key = %s",
                $this->id,
                $key
            )
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared

		if ( $exists ) {
			$wpdb->update( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.SlowDBQuery.slow_db_query_meta_value
				$table,
				array( 'meta_value' => $value ), // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
				array( 'ID' => $exists ),
				array( '%s' ),
				array( '%d' )
			);
		} else {
			$wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
				$table,
				array(
					'store_id' => $this->id,
					'meta_key' => $key, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
                'meta_value'   => $value, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
				),
				array( '%d', '%s', '%s' )
			);
		}

		if ( ! empty( $wpdb->last_error ) && MultiVendorX()->show_advanced_log ) {
			MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
		}
	}

    /**
     * Magic method to access container items.
     *
     * @param string $class Class name.
     */
    public function __get( $class ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound
        if ( property_exists( $this, $class ) ) {
            return $this->$class;
        }
        if ( array_key_exists( $class, $this->container ) ) {
            return $this->container[ $class ];
        }

        return new \WP_Error( sprintf( 'Call to unknown class %s.', $class ) );
    }

    /**
     * Get store by ID, slug, or name.
     *
     * @param mixed  $value Store ID, slug, name, product_id, status or user_id.
     * @param string $type  Lookup type: id|slug|name|product|primary_owner|user.
     *
     * @return self|array|null Store instance, array of stores, or null.
     */
    public static function get_store( $value, $type = 'id' ) {
        global $wpdb;

        if ( empty( $value ) ) {
            return null;
        }

        $cache_key = $type . ':' . $value;

        // Return from cache.
        if ( isset( self::$store_cache[ $cache_key ] ) ) {
            return self::$store_cache[ $cache_key ];
        }

        if ( 'id' === $type ) {
            $store                           = new self( (int) $value );
            self::$store_cache[ $cache_key ] = $store->exists() ? $store : null;
            return self::$store_cache[ $cache_key ];
        }

        $table       = esc_sql( $wpdb->prefix . Utill::TABLES['store'] );
        $store_users = esc_sql( $wpdb->prefix . Utill::TABLES['store_users'] );

        try {
            switch ( $type ) {
                case 'slug':
                    $query = $wpdb->prepare(
                        "SELECT ID FROM {$table} WHERE slug = %s LIMIT 1",
                        $value
                    );

                    $id = $wpdb->get_var( $query ); // phpcs:ignore

                    if ( ! $id ) {
                        self::$store_cache[ $cache_key ] = null;
                        return null;
                    }

                    $store                           = new self( (int) $id );
                    self::$store_cache[ $cache_key ] = $store->exists() ? $store : null;
                    return self::$store_cache[ $cache_key ];

                case 'product':
                    $product_id = (int) $value;
					$store_id   = (int) get_post_meta(
						$product_id,
						Utill::POST_META_SETTINGS['store_id'],
						true
					);

                    if ( ! $store_id ) {
                        return null;
                    }
                    $store                           = new self( $store_id );
                    self::$store_cache[ $cache_key ] = $store->exists() ? $store : null;
                    return self::$store_cache[ $cache_key ];

                case 'name':
                    $like = '%' . $wpdb->esc_like( $value ) . '%';

                    $results = $wpdb->get_col(
                        $wpdb->prepare(
                            "SELECT ID FROM {$table} WHERE name LIKE %s AND status = %s",
                            $like,
                            'active'
                        )
                    ); // phpcs:ignore

                    if ( empty( $results ) ) {
                        self::$store_cache[ $cache_key ] = array();
                        return array();
                    }

                    $stores = array_map(
                        fn( $id ) => new self( (int) $id ),
                        $results
                    );

                    self::$store_cache[ $cache_key ] = $stores;
                    return $stores;

                case 'primary_owner':
                    $status = sanitize_text_field( $value );
					// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
					$stores = $wpdb->get_results( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
						$wpdb->prepare(
                            "SELECT * FROM $table WHERE who_created = %d AND status = %s",
                            MultiVendorX()->current_user_id,
                            $status
						),
						ARRAY_A
					);
					// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
                    self::$store_cache[ $cache_key ] = $stores ? $stores : array();
                    return self::$store_cache[ $cache_key ];

                case 'user':
                    $user_id           = (int) $value;
					$excluded_statuses = array( 'permanently_rejected', 'deactivated' );
					$placeholders      = implode( ', ', array_fill( 0, count( $excluded_statuses ), '%s' ) );
					$params            = array_merge( array( $user_id ), $excluded_statuses );

					// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
					$sql = "
                        SELECT
                            su.store_id AS id,
                            s.name AS name
                        FROM {$store_users} su
                        INNER JOIN {$table} s ON s.ID = su.store_id
                        WHERE su.user_id = %d
                        AND s.status NOT IN ($placeholders)
                    ";

					$result = $wpdb->get_results( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                        $wpdb->prepare( $sql, $params ), // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
                        ARRAY_A
					);

                    self::$store_cache[ $cache_key ] = $result ? $result : array();
                    return self::$store_cache[ $cache_key ];

                default:
                    return null;
            }
        } catch ( \Exception $e ) {
            if ( MultiVendorX()->show_advanced_log ) {
                MultiVendorX()->util->log( $e->getMessage(), 'ERROR' );
            }
        }

        return null;
    }

	/**
	 * Check whether a store with given slug exists in the database.
	 *
	 * @param string $slug       Slug to check against.
	 * @param int    $exclude_id Optional. ID of the store to exclude from search results. Default 0.
	 * @return bool True if store exists, otherwise false.
	 */
	public static function store_slug_exists( $slug, $exclude_id = 0 ) {
		global $wpdb;

		$table = $wpdb->prefix . Utill::TABLES['store'];

		if ( $exclude_id ) {
			// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$query = $wpdb->prepare(
                "SELECT COUNT(*) FROM {$table} WHERE slug = %s AND ID != %d",
                $slug,
                $exclude_id
			);
			// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		} else {
			// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$query = $wpdb->prepare(
                "SELECT COUNT(*) FROM {$table} WHERE slug = %s",
                $slug
			);
			// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		}

		$exists = (int) $wpdb->get_var( $query ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared

		if ( ! empty( $wpdb->last_error ) && MultiVendorX()->show_advanced_log ) {
			MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
		}

		return $exists > 0;
	}

    /**
     * Genearte unique slug.
     *
     * @param string $slug       Store slug.
     * @param int    $exclude_id Optional. Store ID to exclude from check.
     *
     * @return string
     */
    public static function generate_unique_store_slug( $slug, $exclude_id = 0 ) {
        $slug = sanitize_title( $slug );

        if ( ! self::store_slug_exists( $slug, $exclude_id ) ) {
            return $slug;
        }

        $base  = $slug;
        $count = 1;

        while ( self::store_slug_exists( $base . '-' . $count, $exclude_id ) ) {
            ++$count;
        }

        return $base . '-' . $count;
    }

	/**
	 * Delete a store meta key.
	 *
	 * @param string $key Meta key to delete.
	 */
	public function delete_meta( $key ) {
		global $wpdb;

		$table = $wpdb->prefix . Utill::TABLES['store_meta'];

		$wpdb->delete( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $table,
            array(
				'store_id' => (int) $this->id,
				'meta_key' => $key, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
            ),
            array( '%d', '%s' )
		);

		if ( ! empty( $wpdb->last_error ) && MultiVendorX()->show_advanced_log ) {
			MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
		}
	}

    /**
     * Delete all meta for the current store.
     *
     * @return bool
     */
    public function delete_all_meta() {
        global $wpdb;

        $table = esc_sql( $wpdb->prefix . Utill::TABLES['store_meta'] );

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $deleted = $wpdb->delete(
            $table,
            array( 'store_id' => (int) $this->id ),
            array( '%d' )
        );

        if ( ! empty( $wpdb->last_error ) && MultiVendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }

        return false !== $deleted;
    }

    /**
     * Delete the current store completely from database.
     */
    public function delete_store_completely() {
        global $wpdb;

        $store_id = (int) $this->id;

        if ( $store_id <= 0 ) {
            return false;
        }

        // Table names.
        $store_table       = "{$wpdb->prefix}" . Utill::TABLES['store'];
        $store_users_table = "{$wpdb->prefix}" . Utill::TABLES['store_users'];
        $store_meta_table  = "{$wpdb->prefix}" . Utill::TABLES['store_meta'];

        // Delete meta.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->delete( $store_meta_table, array( 'store_id' => $store_id ), array( '%d' ) );

        // Delete users.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->delete( $store_users_table, array( 'store_id' => $store_id ), array( '%d' ) );

        // Delete store.
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->delete( $store_table, array( 'ID' => $store_id ), array( '%d' ) );

        if ( ! empty( $wpdb->last_error ) && MultiVendorX()->show_advanced_log ) {
            MultiVendorX()->util->log( 'Database operation failed', 'ERROR' );
        }

        return true;
    }
}
