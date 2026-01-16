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
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Util
{

    /**
     * Fetch questions & answers for a product
     *
     * @param int    $product_id Product id.
     * @param string $search Search term.
     * @return array An array of questions with their details.
     */
    public static function get_questions($product_id, $search = '')
    {
        global $wpdb;
        $table = $wpdb->prefix . Utill::TABLES['product_qna'];

        $query  = "SELECT * FROM $table WHERE product_id=%d AND question_visibility='public'";
        $params = array($product_id);

        if ($search) {
            $query   .= ' AND (question_text LIKE %s OR answer_text LIKE %s)';
            $like     = '%' . $wpdb->esc_like($search) . '%';
            $params[] = $like;
            $params[] = $like;
        }

        return $wpdb->get_results($wpdb->prepare($query, ...$params));
    }

    /**
     * Fetch question information from database
     * Supports filtering by product, store, answer status, date, and count
     *
     * @param array $args The arguments to filter the questions.
     */
    public static function get_question_information($args)
    {
        global $wpdb;
        $where = array();

        // Filter by question IDs.
        if (isset($args['id'])) {
            $ids     = is_array($args['id']) ? $args['id'] : array($args['id']);
            $ids     = implode(',', array_map('intval', $ids));
            $where[] = "id IN ($ids)";
        }

        // Filter by product IDs.
        if (isset($args['product_ids']) && is_array($args['product_ids']) && ! empty($args['product_ids'])) {
            $product_ids = implode(',', array_map('intval', $args['product_ids']));
            $where[]     = "product_id IN ($product_ids)";
        }

        // Filter by store_id (optional).
        if (isset($args['store_id'])) {
            $where[] = 'store_id = ' . intval($args['store_id']);
        }

        if (isset($args['question_visibility'])) { // remove any tab/space.
            $where[] = "question_visibility = '" . esc_sql($args['question_visibility']) . "'";
        }

        if (! empty($args['start_date'])) {
            $where[] = "question_date >= '" . esc_sql($args['start_date']) . "'";
        }

        if (! empty($args['end_date'])) {
            $where[] = "question_date <= '" . esc_sql($args['end_date']) . "'";
        }

        // Filter by answered (has answer).
        if (! empty($args['has_answer'])) {
            $where[] = "answer_text IS NOT NULL AND answer_text != ''";
        }

        // Filter by unanswered (no answer).
        if (! empty($args['no_answer'])) {
            $where[] = "(answer_text IS NULL OR answer_text = '')";
        }

        // Filter by search term
        if (! empty($args['search'])) {
            $like = '%' . esc_sql($wpdb->esc_like($args['search'])) . '%';
            $where[] = "(question_text LIKE '$like' OR answer_text LIKE '$like')";
        }


        $table = $wpdb->prefix . Utill::TABLES['product_qna'];

        // Build query.
        if (isset($args['count'])) {
            $query = "SELECT COUNT(*) FROM $table";
        } else {
            $query = "SELECT * FROM $table";
        }

        if (! empty($where)) {
            $condition = $args['condition'] ?? ' AND ';
            $query    .= ' WHERE ' . implode($condition, $where);
        }

        // Add ORDER BY support safely.
        if (! isset($args['count']) && ! empty($args['orderBy']) && ! empty($args['order'])) {
            $allowed_columns = array(
                'question_date' => 'question_date',
                'total_votes'   => 'total_votes',
                'product_id'    => 'product_id',
                'store_id'      => 'store_id',
            );

            $column    = sanitize_text_field($args['orderBy']);
            $direction = strtolower($args['order']) === 'desc' ? 'DESC' : 'ASC';

            if (isset($allowed_columns[$column])) {
                $query .= ' ORDER BY ' . $allowed_columns[$column] . ' ' . $direction;
            }
        }

        // Limit & offset (only for data, not count).
        if (isset($args['limit']) && isset($args['offset']) && ! isset($args['count'])) {
            $query .= ' LIMIT ' . intval($args['limit']) . ' OFFSET ' . intval($args['offset']);
        }

        // Execute query.
        if (isset($args['count'])) {
            return (int) ($wpdb->get_var($query) ?? 0);
        }
        return $wpdb->get_results($query, ARRAY_A) ? $wpdb->get_results($query, ARRAY_A) : array();
    }

    /**
     * Insert a new question
     *
     * @param array $data Question data.
     * @return int|false Inserted question ID or false on failure.
     */
    public static function insert_question($data)
    {
        global $wpdb;
        $table = $wpdb->prefix . Utill::TABLES['product_qna'];

        if (empty($data['product_id']) || empty($data['question_text']) || empty($data['question_by'])) {
            return false;
        }

        $insert_data = array(
            'product_id'         => intval($data['product_id']),
            'store_id'           => intval($data['store_id']),
            'question_text'      => sanitize_textarea_field($data['question_text']),
            'question_by'        => intval($data['question_by']),
            'total_votes'        => 0,
            'voters'             => maybe_serialize(array()),
            'answer_text'        => '',
            'question_visibility' => 'private',
            'question_date'      => current_time('mysql'),
        );

        $formats = array('%d', '%d', '%s', '%d', '%d', '%s', '%s', '%s', '%s');

        $inserted = $wpdb->insert($table, $insert_data, $formats);

        if ($inserted) {
            return $wpdb->insert_id;
        }

        if (! empty($wpdb->last_error) && MultivendorX()->show_advanced_log) {
            MultiVendorX()->util->log(
                'Database operation failed',
                'ERROR',
                array('Table' => $table)
            );
        }

        return false;
    }

    /**
     * Update a question by ID
     *
     * @param int   $id   The ID of the question to be updated.
     * @param array $data The data to be updated.
     */
    public static function update_question($id, $data)
    {
        global $wpdb;

        $table = $wpdb->prefix . Utill::TABLES['product_qna'];

        if (empty($data)) {
            return false;
        }

        $update_data   = array();
        $update_format = array();

        // Update answer text.
        if (isset($data['question_text'])) {
            $update_data['question_text'] = sanitize_textarea_field($data['question_text']);
            $update_format[]              = '%s';
        }

        // Update answer text.
        if (isset($data['answer_text'])) {
            $update_data['answer_text'] = sanitize_textarea_field($data['answer_text']);
            $update_format[]            = '%s';
        }

        // Update question visibility.
        if (isset($data['question_visibility'])) {
            $update_data['question_visibility'] = sanitize_text_field($data['question_visibility']);
            $update_format[]                    = '%s';
        }

        // Update answer_by and always set current date.
        if (isset($data['answer_by'])) {
            $update_data['answer_by'] = intval($data['answer_by']);
            $update_format[]          = '%d';

            // Always set the current date/time.
            $update_data['answer_date'] = current_time('mysql');
            $update_format[]            = '%s';
        }
        if (isset($data['total_votes'])) {
            $update_data['total_votes'] = intval($data['total_votes']);
            $update_format[] = '%d';
        }

        if (isset($data['voters'])) {
            $update_data['voters'] = maybe_serialize($data['voters']);
            $update_format[] = '%s';
        }

        if (empty($update_data)) {
            return false;
        }

        $where        = array('id' => intval($id));
        $where_format = array('%d');

        $updated = $wpdb->update(
            $table,
            $update_data,
            $where,
            $update_format,
            $where_format
        );

        if (! empty($wpdb->last_error) && MultivendorX()->show_advanced_log) {
            MultiVendorX()->util->log(
                'Database operation failed',
                'ERROR',
                array('Table' => $table)
            );
        }

        return false !== $updated;
    }


    /**
     * Delete a question by ID
     *
     * @param int $id The ID of the question to be deleted.
     */
    public static function delete_question($id)
    {
        global $wpdb;

        $table = $wpdb->prefix . Utill::TABLES['product_qna'];

        $id = intval($id);
        if (! $id) {
            return false;
        }

        $deleted = $wpdb->delete(
            $table,
            array('id' => $id),
            array('%d')
        );

        // $wpdb->delete returns number of rows deleted, or false on error
        if (false === $deleted) {
            return false; // DB error.
        }

        return true; // Success, even if 0 rows (no row existed).
    }
}
