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

        $conditions = array();
        $values     = array();

        if ( isset( $args['id'] ) ) {
            $ids          = array_map( 'intval', (array) $args['id'] );
            $placeholders = implode( ',', array_fill( 0, count( $ids ), '%d' ) );
            $conditions[] = 'id IN (' . $placeholders . ')';
            $values       = array_merge( $values, $ids );
        }

        if ( ! empty( $args['product_ids'] ) && is_array( $args['product_ids'] ) ) {
            $ids          = array_map( 'intval', $args['product_ids'] );
            $placeholders = implode( ',', array_fill( 0, count( $ids ), '%d' ) );
            $conditions[] = 'product_id IN (' . $placeholders . ')';
            $values       = array_merge( $values, $ids );
        }

        if ( isset( $args['store_id'] ) ) {
            $conditions[] = 'store_id = %d';
            $values[]     = intval( $args['store_id'] );
        }

        if ( isset( $args['question_visibility'] ) ) {
            $conditions[] = 'question_visibility = %s';
            $values[]     = (string) $args['question_visibility'];
        }

        if ( ! empty( $args['start_date'] ) ) {
            $conditions[] = 'question_date >= %s';
            $values[]     = (string) $args['start_date'];
        }

        if ( ! empty( $args['end_date'] ) ) {
            $conditions[] = 'question_date <= %s';
            $values[]     = (string) $args['end_date'];
        }

        if ( ! empty( $args['has_answer'] ) ) {
            $conditions[] = "answer_text IS NOT NULL AND answer_text != ''";
        }

        if ( ! empty( $args['no_answer'] ) ) {
            $conditions[] = "( answer_text IS NULL OR answer_text = '' )";
        }

        if ( ! empty( $args['search'] ) ) {
            $conditions[] = '( question_text LIKE %s OR answer_text LIKE %s )';
            $search       = '%' . $wpdb->esc_like( (string) $args['search'] ) . '%';
            $values[]     = $search;
            $values[]     = $search;
        }

        $join      = ( 'OR' === strtoupper( trim( $args['condition'] ?? 'AND' ) ) ) ? ' OR ' : ' AND ';
        $where_sql = $conditions ? ' WHERE ' . implode( $join, $conditions ) : '';

        if ( isset( $args['count'] ) ) {
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
            return (int) ( $wpdb->get_var(
                $wpdb->prepare(
                    'SELECT COUNT(*) FROM %i' . $where_sql,
                    $table,
                    ...$values
                )
            ) ?? 0 );
        }

        // Ordering needs both order_by and order; otherwise rows come back by id.
        $allowed_columns = array( 'question_date', 'total_votes', 'product_id', 'store_id' );
        $column          = sanitize_text_field( $args['order_by'] ?? '' );
        $column          = in_array( $column, $allowed_columns, true ) ? $column : 'id';
        $order_dir       = ( ! empty( $args['order'] ) && 'desc' === strtolower( $args['order'] ) ) ? 'DESC' : 'ASC';
        $has_limit       = isset( $args['limit'] ) && isset( $args['offset'] );
        $limit           = $has_limit ? intval( $args['limit'] ) : PHP_INT_MAX;
        $offset          = $has_limit ? intval( $args['offset'] ) : 0;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared
        $results = $wpdb->get_results(
            $wpdb->prepare(
                'SELECT * FROM %i' . $where_sql . ' ORDER BY %i ' . $order_dir . ' LIMIT %d OFFSET %d',
                $table,
                ...array_merge( $values, array( $column, $limit, $offset ) )
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
