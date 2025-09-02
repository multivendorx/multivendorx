<?php

namespace MultiVendorX\Commission;

use MultiVendorX\Utill;

defined('ABSPATH') || exit;

/**
 * MultiVendorX Commission class
 *
 * @version		PRODUCT_VERSION
 * @package		MultiVendorX
 * @author 		MultiVendorX
 */

class CommissionUtil {

    /**
     * Get a single commission row from databse by using commission id.
     * Return stdClass object represent a single row.
     * @param   mixed $id
     * @return  array | object | \stdClass
     */
    public static function get_commission_db( $id ) {
        global $wpdb;
        $commission = $wpdb->get_row(
            $wpdb->prepare( "SELECT * FROM `" . $wpdb->prefix . Utill::TABLES['commission'] . "` WHERE ID = %d", $id )
        );
        return $commission ?? new \stdClass();
    }

    /**
     * Get the commission object of Commission class.
     * @param   int $id Commission ID
     * @return  Commission Commission Object
     */
    public static function get_commission( $id ) {
        return new Commission( $id );
    }

    /**
     * Get array of commission object or count based on filter.
     * 
     * @param   array $filter
     * @param   bool  $object  Default true. If false function returns raw DB rows or IDs.
     * @param   bool  $count   Default false. If true function returns total count instead of records.
     * 
     * @return  array|int  Array of Commission objects, raw results, or integer count.
     */
    public static function get_commissions( $filter = [], $object = true, $count = false ) {
        global $wpdb;
    
        // Remove the fields key from filter if object is set
        if ( $object && isset( $filter['fields'] ) ) {
            unset( $filter['fields'] );
        }
    
        // Handle fields separately if present in filter
        if ( isset( $filter['fields'] ) && is_array( $filter['fields'] ) && ! $count ) {
            $fields = implode( ", ", $filter['fields'] );
        } else {
            $fields = $count ? "COUNT(*) as total" : "*";
        }
    
        // Handle limit and offset separately
        $page       = $filter['page'] ?? 0;
        $perpage    = $filter['perpage'] ?? 0;
    
        unset( $filter['page'], $filter['perpage'] );
    
        // Prepare predicate
        $predicate = [];
        foreach ( $filter as $column => $value ) {
            if ( is_array( $value ) ) {
                if ( isset($value['compare']) && $value['compare'] === "BETWEEN" ) {
                    $start_value = Utill::add_single_quots( $value['value'][0] );
                    $end_value   = Utill::add_single_quots( $value['value'][1] ); 
                    $predicate[] = "{$column} BETWEEN {$start_value} AND {$end_value}";
                }
                if ( isset($value['compare']) && ( $value['compare'] === "IN" || $value['compare'] === "NOT IN" ) ) {
                    $compare    = $value['compare'];
                    $in_touple  = " (" . implode( ', ', array_map( [Utill::class, 'add_single_quots'], $value['value'] ) ) . ") ";
                    $predicate[] = "{$column} {$compare} {$in_touple}";
                }
            } else {
                $value       = Utill::add_single_quots( $value );
                $predicate[] = "{$column} = {$value}";
            }
        }
    
        // Prepare query
        $query = "SELECT {$fields} FROM `" . $wpdb->prefix . Utill::TABLES['commission'] . "`";
    
        if ( ! empty( $predicate ) ) {
            $query .= " WHERE " . implode( " AND ", $predicate );
        }
    
        // Pagination support
        if ( ! $count && $page && $perpage && $perpage != -1 ) {
            $limit  = $perpage;
            $offset = ( $page - 1 ) * $perpage;
            $query .= " LIMIT {$limit} OFFSET {$offset}";
        }
    
        // If count query requested
        if ( $count ) {
            return (int) $wpdb->get_var( $query ) ?? 0;
        }
    
        // Database query for commissions
        $commissions = $wpdb->get_results( $query );
    
        // If return type is not object of Commission class return raw results
        if ( ! $object ) {
            return $commissions;
        }
    
        // Return array of Commission objects
        return array_map( function( $commission ) {
            return new Commission( $commission );
        }, $commissions );
    }
    
}