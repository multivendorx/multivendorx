<?php
/**
 * MultiVendorX Util class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\QuestionsAnswers;
use MultiVendorX\Utill;

/**
 * MultiVendorX Questions Answers Util class
 *
 * @class       Util class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Util {

    
    /**
     * Fetch questions & answers for a product
     */
    public static function get_questions( $product_id, $search = '' ) {
        global $wpdb;
        $table = $wpdb->prefix . Utill::TABLES['product_qna'];

        $query = "SELECT * FROM $table WHERE product_id=%d AND question_visibility='public'";
        $params = [ $product_id ];

        if ( $search ) {
            $query .= " AND (question_text LIKE %s OR answer_text LIKE %s)";
            $like = '%' . $wpdb->esc_like( $search ) . '%';
            $params[] = $like;
            $params[] = $like;
        }

        return $wpdb->get_results( $wpdb->prepare( $query, ...$params ) );
    }

	public static function get_question_information( $args ) {
		global $wpdb;

		$where = array();

		if ( isset( $args['id'] ) ) {
			$ids     = is_array( $args['id'] ) ? $args['id'] : array( $args['id'] );
			$ids     = implode( ',', array_map( 'intval', $ids ) );
			$where[] = "id IN ($ids)";
		}

		$table = $wpdb->prefix . Utill::TABLES['product_qna'];

		if ( isset( $args['count'] ) ) {
			$query = "SELECT COUNT(*) FROM $table";
		} else {
			$query = "SELECT * FROM $table";
		}

		if ( ! empty( $where ) ) {
			$condition = $args['condition'] ?? ' AND ';
			$query    .= ' WHERE ' . implode( $condition, $where );
		}

		if ( isset( $args['limit'] ) && isset( $args['offset'] ) ) {
			$limit  = esc_sql( intval( $args['limit'] ) );
			$offset = esc_sql( intval( $args['offset'] ) );
			$query .= " LIMIT $limit OFFSET $offset";
		}

		if ( isset( $args['count'] ) ) {
			$results = $wpdb->get_var( $query ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
			return $results ?? 0;
		} else {
			$results = $wpdb->get_results( $query, ARRAY_A ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared
			return $results ?? array();
		}
	}
}
