<?php

/**
 * MultiVendorX REST API Controller for Questions and Answers
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\QuestionsAnswers;

use MultiVendorX\QuestionsAnswers\Util;
use MultiVendorX\Utill;

defined('ABSPATH') || exit;

/**
 * MultiVendorX REST API Controller for Questions and Answers.
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Rest extends \WP_REST_Controller
{

    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'qna';

    /**
     * Constructor.
     */
    public function __construct()
    {
        add_action('rest_api_init', array($this, 'register_routes'), 10);
    }

    /**
     * Register the routes for questions and answers.
     */
    public function register_routes()
    {
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array($this, 'get_items'),
                    'permission_callback' => array($this, 'get_items_permissions_check'),
                ),
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array($this, 'create_item'),
                    'permission_callback' => array($this, 'create_item_permissions_check'),
                ),
            )
        );

        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array($this, 'get_item'),
                    'permission_callback' => array($this, 'get_items_permissions_check'),
                    'args'                => array(
                        'id' => array('required' => true),
                    ),
                ),
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array($this, 'update_item'),
                    'permission_callback' => array($this, 'update_item_permissions_check'),
                ),
                array(
                    'methods'             => \WP_REST_Server::DELETABLE,
                    'callback'            => array($this, 'delete_item'),
                    'permission_callback' => array($this, 'update_item_permissions_check'),
                    'args'                => array(
                        'id' => array('required' => true),
                    ),
                ),
            )
        );
    }

    /**
     * Get items permissions check.
     *
     * @param  object $request Full data about the request.
     */
    public function get_items_permissions_check($request)
    {
        return current_user_can('read') || current_user_can('edit_stores');
    }

    /**
     * Create permissions check.
     *
     * @param  object $request Full data about the request.
     */
    public function create_item_permissions_check($request)
    {
        return current_user_can('create_stores');
    }

    /**
     * Update permissions check.
     *
     * @param  object $request Full data about the request.
     */
    public function update_item_permissions_check($request)
    {
        return current_user_can('edit_stores');
    }


    /**
     * Get QnA items with optional pagination, date filters, and counters
     *
     * @param  object $request Full data about the request.
     */
    public function get_items($request)
    {
        $nonce = $request->get_header('X-WP-Nonce');
        if (! wp_verify_nonce($nonce, 'wp_rest')) {
            $error = new \WP_Error('invalid_nonce', __('Invalid nonce', 'multivendorx'), array('status' => 403));

            // Log the error.
            if (is_wp_error($error)) {
                MultiVendorX()->util->log($error);
            }

            return $error;
        }
        try {
            $store_id   = $request->get_param('store_id');
            $limit      = max(intval($request->get_param('row')), 10);
            $page       = max(intval($request->get_param('page')), 1);
            $offset     = ($page - 1) * $limit;
            $count      = $request->get_param('count');
            $status     = sanitize_text_field($request->get_param('status'));
            $search     = sanitize_text_field($request->get_param('searchField'));
            $orderBy    = sanitize_text_field($request->get_param('orderBy'));
            $order      = sanitize_text_field($request->get_param('order'));
            $question_visibility     = sanitize_text_field($request->get_param('question_visibility'));
            $range = Utill::normalize_date_range(
                $request->get_param('startDate'),
                $request->get_param('endDate')
            );
            $args = array();

            if ($store_id) {
                $args['store_id'] = intval($store_id);
            }

            // --- Step 3: Handle Search (Product first, fallback to Question) ---
            if (! empty($search)) {

                $product_query = new \WC_Product_Query(
                    array(
                        'limit'      => -1,
                        'return'     => 'ids',
                        's'          => $search,
                        'meta_query' => array(
                            array(
                                'key'     => '_multivendorx_store_id',
                                'compare' => 'EXISTS',
                            ),
                        ),
                    )
                );

                $matched_product_ids = $product_query->get_products();

                if (! empty($matched_product_ids)) {
                    // Product match → filter by products
                    $args['product_ids'] = $matched_product_ids;
                } else {
                    // No product match → fallback to question/answer search
                    $args['search'] = $search;
                }
            }

            // --- Step 4: Count Only Request ---
            if ($count) {
                $args['count'] = true;
                $total_count   = Util::get_question_information($args);
                return rest_ensure_response((int) $total_count);
            }

            // --- Step 5: Build Base Query Args ---
            $args['limit']  = $limit;
            $args['offset'] = $offset;

            if (! empty($range['start_date'])) {
                $args['start_date'] = $range['start_date'];
            }
            
            if (! empty($range['end_date'])) {
                $args['end_date'] = $range['end_date'];
            }

            // --- Step 6: Add Filter by Status (from frontend tabs) ---
            if ('has_answer' === $status) {
                $args['has_answer'] = true;
            } elseif ('no_answer' === $status) {
                $args['no_answer'] = true;
            }
            if ($orderBy && $order) {
                $args['orderBy'] = $orderBy;
                $args['order']   = $order;
            } else {
                $args['orderBy'] = 'question_date';
                $args['order']   = 'DESC';
            }
            if (!empty($question_visibility)) {
                $args['question_visibility']   = $question_visibility;
            }
            // --- Step 7: Fetch Question Data ---
            $questions = Util::get_question_information($args);

            // --- Step 8: Format Data ---
            $formatted = array_map(
                function ($q) {
                    $product     = wc_get_product($q['product_id']);
                    $first_name  = get_the_author_meta('first_name', $q['question_by']);
                    $last_name   = get_the_author_meta('last_name', $q['question_by']);
                    $author_name = ($first_name && $last_name)
                        ? $first_name . ' ' . $last_name
                        : get_the_author_meta('display_name', $q['question_by']);

                    $store_obj = MultivendorX()->store->get_store($q['store_id']);

                    // Get product image.
                    $product_image = '';
                    if ($product) {
                        $image_id = $product->get_image_id(); // Get featured image ID.
                        if ($image_id) {
                            $product_image = wp_get_attachment_image_url($image_id, 'thumbnail'); // or 'full'.
                        }
                    }

                    return array(
                        'id'                  => (int) $q['id'],
                        'product_id'          => (int) $q['product_id'],
                        'product_name'        => $product ? $product->get_name() : '',
                        'product_link'        => $product ? get_permalink($product->get_id()) : '',
                        'product_image'       => $product_image, // added product image.
                        'store_id'            => $q['store_id'],
                        'store_name'          => $store_obj->get('name'),
                        'question_text'       => $q['question_text'],
                        'answer_text'         => $q['answer_text'],
                        'question_by'         => (int) $q['question_by'],
                        'author_name'         => $author_name,
                        'question_date'       => $q['question_date'],
                        'answer_by'           => isset($q['answer_by']) ? (int) $q['answer_by'] : 0,
                        'answer_date'         => $q['answer_date'] ?? '',
                        'time_ago'            => human_time_diff(strtotime($q['question_date']), current_time('timestamp')) . ' ago',
                        'total_votes'         => (int) $q['total_votes'],
                        'question_visibility' => $q['question_visibility'],
                    );
                },
                $questions ? $questions : array()
            );

            // --- Step 9: Get Counters ---
            $base_args = $args;
            unset($base_args['limit'], $base_args['offset'], $base_args['has_answer'], $base_args['no_answer']);
            $base_args['count'] = true;

            $all_count = Util::get_question_information($base_args);

            $answered_args               = $base_args;
            $answered_args['has_answer'] = true;
            $answered_count              = Util::get_question_information($answered_args);

            $unanswered_args              = $base_args;
            $unanswered_args['no_answer'] = true;
            $unanswered_count             = Util::get_question_information($unanswered_args);

            // --- Step 10: Return Final Response ---
            return rest_ensure_response(
                array(
                    'items'      => $formatted,
                    'all'        => (int) $all_count,
                    'answered'   => (int) $answered_count,
                    'unanswered' => (int) $unanswered_count,
                )
            );
        } catch (\Exception $e) {
            MultiVendorX()->util->log($e);

            return new \WP_Error('server_error', __('Unexpected server error', 'multivendorx'), array('status' => 500));
        }
    }

    /**
     * Create a single question item.
     *
     * @param  object $request Full data about the request.
     */
    public function create_item($request)
    {
        $nonce = $request->get_header('X-WP-Nonce');
        if (! wp_verify_nonce($nonce, 'wp_rest')) {
            return new \WP_Error('invalid_nonce', __('Invalid nonce', 'multivendorx'), array('status' => 403));
        }
    }

    /**
     * Retrieve a single question item.
     *
     * @param  object $request Full data about the request.
     */
    public function get_item($request)
    {
        $nonce = $request->get_header('X-WP-Nonce');
        if (! wp_verify_nonce($nonce, 'wp_rest')) {
            return new \WP_Error(
                'invalid_nonce',
                __('Invalid nonce', 'multivendorx'),
                array('status' => 403)
            );
        }

        $current_user_id = get_current_user_id();
        $current_user    = wp_get_current_user();

        $id = absint($request->get_param('id'));
        if (! $id) {
            return new \WP_Error('invalid_id', __('Invalid ID', 'multivendorx'), array('status' => 400));
        }

        $q = reset(Util::get_question_information(array('id' => $id)));
        if (! $q) {
            return new \WP_Error('not_found', __('Question not found', 'multivendorx'), array('status' => 404));
        }

        // Permission check.
        if (! in_array('administrator', $current_user->roles, true)) {
            if (in_array('store_owner', $current_user->roles, true)) {
                $product = wc_get_product($q['product_id']);
                if (! $product || $product->get_author() !== $current_user_id) {
                    return new \WP_Error('forbidden', __('You are not allowed to view this question', 'multivendorx'), array('status' => 403));
                }
            } else {
                return new \WP_Error('forbidden', __('You are not allowed to view this question', 'multivendorx'), array('status' => 403));
            }
        }

        $product       = wc_get_product($q['product_id']);
        $product_name  = $product ? $product->get_name() : '';
        $product_link  = $product ? get_permalink($product->get_id()) : '';
        $product_image = $product ? wp_get_attachment_url($product->get_image_id()) : '';

        $data = array(
            'id'                  => (int) $q['id'],
            'product_id'          => (int) $q['product_id'],
            'product_name'        => $product_name,
            'product_link'        => $product_link,
            'product_image'       => $product_image,
            'question_text'       => $q['question_text'],
            'answer_text'         => $q['answer_text'],
            'question_by'         => (int) $q['question_by'],
            'author_name'         => get_the_author_meta('display_name', $q['question_by']),
            'question_date'       => $q['question_date'],
            'time_ago'            => human_time_diff(strtotime($q['question_date']), current_time('timestamp')) . ' ago',
            'total_votes'         => (int) $q['total_votes'],
            'question_visibility' => $q['question_visibility'],
        );

        return rest_ensure_response($data);
    }

    /**
     * Update a single question item.
     *
     * @param  object $request Full data about the request.
     */
    public function update_item($request)
    {
        $nonce = $request->get_header('X-WP-Nonce');
        if (! wp_verify_nonce($nonce, 'wp_rest')) {
            $error = new \WP_Error(
                'invalid_nonce',
                __('Invalid nonce', 'multivendorx'),
                array('status' => 403)
            );

            if (is_wp_error($error)) {
                MultiVendorX()->util->log($error);
            }

            return $error;
        }
        try {
            // Get question ID.
            $id = absint($request->get_param('id'));
            if (! $id) {
                return new \WP_Error(
                    'invalid_id',
                    __('Invalid question ID', 'multivendorx'),
                    array('status' => 400)
                );
            }

            // Fetch the question.
            $q = reset(Util::get_question_information(array('id' => $id)));
            if (! $q) {
                return new \WP_Error(
                    'not_found',
                    __('Question not found', 'multivendorx'),
                    array('status' => 404)
                );
            }

            // Fields that can be updated.
            $question_text = $request->get_param('question_text');
            $answer_text   = $request->get_param('answer_text');
            $visibility    = $request->get_param('question_visibility');

            $data_to_update = array();

            if (isset($answer_text)) {
                $data_to_update['question_text'] = sanitize_textarea_field($question_text);
            }

            if (isset($answer_text)) {
                $data_to_update['answer_text'] = sanitize_textarea_field($answer_text);
            }

            if (isset($visibility)) {
                $allowed = array('public', 'private', 'hidden');
                if (in_array($visibility, $allowed, true)) {
                    $data_to_update['question_visibility'] = sanitize_text_field($visibility);
                } else {
                    return new \WP_Error(
                        'invalid_visibility',
                        __('Invalid visibility value', 'multivendorx'),
                        array('status' => 400)
                    );
                }
            }

            if (empty($data_to_update)) {
                return new \WP_Error(
                    'nothing_to_update',
                    __('No valid fields to update', 'multivendorx'),
                    array('status' => 400)
                );
            }

            // Add answer_by (current user ID).
            $current_user_id = get_current_user_id();
            if ($current_user_id) {
                $data_to_update['answer_by'] = $current_user_id;
            }

            // Save via Util helper.
            $updated = Util::update_question($id, $data_to_update);

            if (! $updated) {
                return rest_ensure_response(array('success' => false));
            }

            return rest_ensure_response(
                array(
                    'success'    => true,
                    'updated_by' => $current_user_id,
                    'updated_at' => current_time('mysql'),
                )
            );
        } catch (\Exception $e) {
            MultiVendorX()->util->log($e);

            return new \WP_Error(
                'server_error',
                __('Unexpected server error', 'multivendorx'),
                array('status' => 500)
            );
        }
    }

    /**
     * Delete a single question item.
     *
     * @param  object $request Full data about the request.
     */
    public function delete_item($request)
    {
        // Verify nonce.
        $nonce = $request->get_header('X-WP-Nonce');
        if (! wp_verify_nonce($nonce, 'wp_rest')) {
            return new \WP_Error(
                'invalid_nonce',
                __('Invalid nonce', 'multivendorx'),
                array('status' => 403)
            );
        }

        // Get question ID.
        $id = absint($request->get_param('id'));
        if (! $id) {
            return new \WP_Error(
                'invalid_id',
                __('Invalid question ID', 'multivendorx'),
                array('status' => 400)
            );
        }

        // Fetch the question.
        $q = reset(Util::get_question_information(array('id' => $id)));
        if (! $q) {
            return new \WP_Error(
                'not_found',
                __('Question not found', 'multivendorx'),
                array('status' => 404)
            );
        }

        // Delete via Util helper (implement delete_question in Util).
        $deleted = Util::delete_question($id);

        if (! $deleted) {
            return new \WP_Error(
                'delete_failed',
                __('Failed to delete question', 'multivendorx'),
                array('status' => 500)
            );
        }

        return rest_ensure_response(array('success' => true));
    }
}
