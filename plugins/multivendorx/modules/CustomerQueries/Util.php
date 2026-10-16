<?php
/**
 * MultiVendorX Util class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\CustomerQueries;

use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Questions Answers Util class
 *
 * @class       Util class
 * @version     5.0.0
 * @author      MultiVendorX
 */
class Util {


    /**
     * Fetch question information from database
     * Supports filtering by product, store, answer status, date, and count
     *
     * @param array $args The arguments to filter the questions.
     */
    public static function query_questions( $args ) {
        global $wpdb;
        $table = $wpdb->prefix . Utill::TABLES['customer_queries'];

        // Each condition is a 1/0 term (flag AND test) summed in SQL; a row matches when enough terms hit:
        // every enabled filter for AND, at least one for OR, none required when nothing is set.
        $question_ids = array_merge( array( 0 ), array_map( 'intval', (array) ( $args['id'] ?? 0 ) ) ); // 0 keeps IN () valid for an empty list.
        $product_ids  = array_merge( array( 0 ), array_map( 'intval', (array) ( $args['product_ids'] ?? 0 ) ) );
        $has_ids      = isset( $args['id'] ) ? 1 : 0;
        $has_products = ( ! empty( $args['product_ids'] ) && is_array( $args['product_ids'] ) ) ? 1 : 0;
        $enabled      = $has_ids + $has_products;
        $term_values  = array( $has_ids, $has_products );

        $value_filters = array(
            'store_id'            => isset( $args['store_id'] ),
            'question_visibility' => isset( $args['question_visibility'] ),
            'start_date'          => ! empty( $args['start_date'] ),
            'end_date'            => ! empty( $args['end_date'] ),
        );
        foreach ( $value_filters as $filter_key => $is_set ) {
            $enabled      += (int) $is_set;
            $term_values[] = (int) $is_set;
            $term_values[] = 'store_id' === $filter_key ? intval( $args[ $filter_key ] ?? 0 ) : (string) ( $args[ $filter_key ] ?? '' );
        }

        $has_answer     = ! empty( $args['has_answer'] ) ? 1 : 0;
        $no_answer      = ! empty( $args['no_answer'] ) ? 1 : 0;
        $has_search     = ! empty( $args['search'] ) ? 1 : 0;
        $search_pattern = '%' . $wpdb->esc_like( (string) ( $args['search'] ?? '' ) ) . '%';
        $enabled       += $has_answer + $no_answer + $has_search;
        $term_values    = array_merge( $term_values, array( $has_answer, $no_answer, $has_search, $search_pattern, $search_pattern ) );

        $required      = ( 'OR' === strtoupper( trim( $args['condition'] ?? 'AND' ) ) ) ? min( 1, $enabled ) : $enabled;
        $term_values[] = $required;

        if ( isset( $args['count'] ) ) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            return (int) ( $wpdb->get_var(
                $wpdb->prepare(
                    'SELECT COUNT(*) FROM %i
                    WHERE (
                        IF( %d = 1 AND id IN (' . esc_sql( implode( ',', $question_ids ) ) . '), 1, 0 )
                        + IF( %d = 1 AND product_id IN (' . esc_sql( implode( ',', $product_ids ) ) . '), 1, 0 )
                        + IF( %d = 1 AND store_id = %d, 1, 0 )
                        + IF( %d = 1 AND question_visibility = %s, 1, 0 )
                        + IF( %d = 1 AND question_date >= %s, 1, 0 )
                        + IF( %d = 1 AND question_date <= %s, 1, 0 )
                        + IF( %d = 1 AND answer_text IS NOT NULL AND answer_text != \'\', 1, 0 )
                        + IF( %d = 1 AND ( answer_text IS NULL OR answer_text = \'\' ), 1, 0 )
                        + IF( %d = 1 AND ( question_text LIKE %s OR answer_text LIKE %s ), 1, 0 )
                    ) >= %d',
                    $table,
                    ...$term_values
                )
            ) ?? 0 );
        }

        // Ordering needs both order_by and order; otherwise rows come back by id.
        $allowed_columns = array( 'question_date', 'total_votes', 'product_id', 'store_id' );
        $column          = sanitize_text_field( $args['order_by'] ?? '' );
        $has_order       = ( ! empty( $args['order'] ) && in_array( $column, $allowed_columns, true ) ) ? 1 : 0;
        $sort_desc       = ( $has_order && strtolower( $args['order'] ) === 'desc' ) ? 1 : 0;
        $column          = $has_order ? $column : 'id';
        $has_limit       = isset( $args['limit'] ) && isset( $args['offset'] );
        $limit           = $has_limit ? intval( $args['limit'] ) : PHP_INT_MAX;
        $offset          = $has_limit ? intval( $args['offset'] ) : 0;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $results = $wpdb->get_results(
            $wpdb->prepare(
                'SELECT * FROM %i
                WHERE (
                    IF( %d = 1 AND id IN (' . esc_sql( implode( ',', $question_ids ) ) . '), 1, 0 )
                    + IF( %d = 1 AND product_id IN (' . esc_sql( implode( ',', $product_ids ) ) . '), 1, 0 )
                    + IF( %d = 1 AND store_id = %d, 1, 0 )
                    + IF( %d = 1 AND question_visibility = %s, 1, 0 )
                    + IF( %d = 1 AND question_date >= %s, 1, 0 )
                    + IF( %d = 1 AND question_date <= %s, 1, 0 )
                    + IF( %d = 1 AND answer_text IS NOT NULL AND answer_text != \'\', 1, 0 )
                    + IF( %d = 1 AND ( answer_text IS NULL OR answer_text = \'\' ), 1, 0 )
                    + IF( %d = 1 AND ( question_text LIKE %s OR answer_text LIKE %s ), 1, 0 )
                ) >= %d
                ORDER BY CASE WHEN %d = 1 THEN %i END DESC, %i ASC
                LIMIT %d OFFSET %d',
                $table,
                ...array_merge( $term_values, array( $sort_desc, $column, $column, $limit, $offset ) )
            ),
            ARRAY_A
        );

        return $results ? $results : array();
    }

    /**
     * Insert a new question
     *
     * @param array $question_data Question data.
     * @return int|false Inserted question ID or false on failure.
     */
    public static function insert_question( $question_data ) {
        global $wpdb;
        $table = $wpdb->prefix . Utill::TABLES['customer_queries'];

        if ( empty( $question_data['product_id'] ) || empty( $question_data['question_text'] ) || empty( $question_data['question_by'] ) ) {
            return false;
        }

        $insert_data = array(
            'product_id'          => intval( $question_data['product_id'] ),
            'store_id'            => intval( $question_data['store_id'] ),
            'question_text'       => sanitize_textarea_field( $question_data['question_text'] ),
            'question_by'         => intval( $question_data['question_by'] ),
            'total_votes'         => 0,
            'voters'              => maybe_serialize( array() ),
            'answer_text'         => '',
            'question_visibility' => 'private',
            'question_date'       => current_time( 'mysql' ),
        );

        $formats = array( '%d', '%d', '%s', '%d', '%d', '%s', '%s', '%s', '%s' );

        $inserted = $wpdb->insert( $table, $insert_data, $formats );// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching

        if ( $inserted ) {
            return $wpdb->insert_id;
        }

        if ( ! empty( $wpdb->last_error ) && MultiVendorX()->show_advanced_log ) {
            MultiVendorX()->util->log(
                'Database operation failed',
                'ERROR',
                array( 'Table' => $table )
            );
        }

        return false;
    }

    /**
     * Update a question by ID
     *
     * @param int   $id                The ID of the question to be updated.
     * @param array $fields_to_update  The data to be updated.
     */
    public static function update_question( $id, $fields_to_update ) {
        global $wpdb;

        $table = $wpdb->prefix . Utill::TABLES['customer_queries'];

        if ( empty( $fields_to_update ) ) {
            return false;
        }

        $update_data   = array();
        $update_format = array();

        // Update answer text.
        if ( isset( $fields_to_update['question_text'] ) ) {
            $update_data['question_text'] = sanitize_textarea_field( $fields_to_update['question_text'] );
            $update_format[]              = '%s';
        }

        // Update answer text.
        if ( isset( $fields_to_update['answer_text'] ) ) {
            $update_data['answer_text'] = sanitize_textarea_field( $fields_to_update['answer_text'] );
            $update_format[]            = '%s';
        }

        // Update question visibility.
        if ( isset( $fields_to_update['question_visibility'] ) ) {
            $update_data['question_visibility'] = sanitize_text_field( $fields_to_update['question_visibility'] );
            $update_format[]                    = '%s';
        }

        // Update answer_by and always set current date.
        if ( isset( $fields_to_update['answer_by'] ) ) {
            $update_data['answer_by'] = intval( $fields_to_update['answer_by'] );
            $update_format[]          = '%d';

            // Always set the current date/time.
            $update_data['answer_date'] = current_time( 'mysql' );
            $update_format[]            = '%s';
        }
        if ( isset( $fields_to_update['total_votes'] ) ) {
            $update_data['total_votes'] = intval( $fields_to_update['total_votes'] );
            $update_format[]            = '%d';
        }

        if ( isset( $fields_to_update['voters'] ) ) {
            $update_data['voters'] = maybe_serialize( $fields_to_update['voters'] );
            $update_format[]       = '%s';
        }

        if ( empty( $update_data ) ) {
            return false;
        }

        $where        = array( 'id' => intval( $id ) );
        $where_format = array( '%d' );
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $updated = $wpdb->update(
            $table,
            $update_data,
            $where,
            $update_format,
            $where_format
        );

        if ( ! empty( $wpdb->last_error ) && MultiVendorX()->show_advanced_log ) {
            MultiVendorX()->util->log(
                'Database operation failed',
                'ERROR',
                array( 'Table' => $table )
            );
        }

        return false !== $updated;
    }


    /**
     * Delete a question by ID
     *
     * @param int $id The ID of the question to be deleted.
     */
    public static function delete_question( $id ) {
        global $wpdb;

        $table = $wpdb->prefix . Utill::TABLES['customer_queries'];

        $id = intval( $id );
        if ( ! $id ) {
            return false;
        }
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $deleted = $wpdb->delete(
            $table,
            array( 'id' => $id ),
            array( '%d' )
        );
        // $wpdb->delete returns number of rows deleted, or false on error
        if ( false === $deleted ) {
            return false; // DB error.
        }

        return true; // Success, even if 0 rows (no row existed).
    }
}
