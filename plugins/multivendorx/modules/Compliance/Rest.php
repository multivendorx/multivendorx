<?php

/**
 * Modules class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Compliance;

use MultiVendorX\Compliance\Util;
use MultiVendorX\Utill;

defined('ABSPATH') || exit;

/**
 * MultiVendorX REST Compliance Controller.
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
    protected $rest_base = 'report-abuse';

    /**
     * Constructor.
     */
    public function __construct()
    {
        add_action('rest_api_init', array($this, 'register_routes'), 10);
    }

    /**
     * Register the routes for compliance.
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
     * Check whether a given request has access to read items.
     *
     * @param object $request Full data about the request.
     */
    public function get_items_permissions_check($request)
    {
        return current_user_can('read') || current_user_can('edit_stores');
    }

    /**
     * Check whether a given request has access to create items.
     *
     * @param object $request Full data about the request.
     */
    public function create_item_permissions_check($request)
    {
        return current_user_can('create_stores');
    }

    /**
     * Check whether a given request has access to update items.
     *
     * @param object $request Full data about the request.
     */
    public function update_item_permissions_check($request)
    {
        return current_user_can('edit_stores');
    }


    /**
     * Retrieve a collection of items.
     *
     * @param object $request Full details about the request.
     */
    public function get_items($request)
    {
        // Verify nonce.
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
            $limit  = max(intval($request->get_param('row')), 10);
            $page   = max(intval($request->get_param('page')), 1);
            $offset = ($page - 1) * $limit;

            // Get filters.
            $store_id   = $request->get_param('store_id');
            $dates = Utill::normalize_date_range(
                $request->get_param('start_date'),
                $request->get_param('end_date')
            );
            $order_by   = $request->get_param('orderBy') ? $request->get_param('orderBy') : 'created_at';
            $order      = strtoupper($request->get_param('order')) === 'ASC' ? 'ASC' : 'DESC';

            // Count only.
            if ($request->get_param('count')) {
                $total_count = Util::get_report_abuse_information(array('count' => true));
                return rest_ensure_response((int) $total_count);
            }

            // Prepare args.
            $args = array(
                'limit'    => $limit,
                'offset'   => $offset,
                'order_by' => $order_by,
                'order'    => $order,
            );

            if ('' !== isset($store_id) && $store_id) {
                $args['store_ids'] = array(intval($store_id));
            }

            if (! empty($dates['start_date']) && ! empty($dates['end_date'])) {
                $args['date_range'] = array(
                    'start' => $dates['start_date'],
                    'end'   => $dates['end_date'],
                );
            }

            // Fetch reports.
            $reports = Util::get_report_abuse_information($args);

            $formatted = array_map(
                function ($r) {
                    $store      = new \MultiVendorX\Store\Store($r['store_id']);
                    $store_name = $store->data['name'] ?? '';

                    $product       = wc_get_product($r['product_id']);
                    $product_name  = $product ? $product->get_name() : '';
                    $product_link  = $product ? get_permalink($product->get_id()) : '';
                    $product_sku   = $product ? $product->get_sku() : '';
                    $product_image = $product ? wp_get_attachment_image_url($product->get_image_id(), 'thumbnail') : '';

                    return array(
                        'ID'            => (int) $r['ID'],
                        'store_id'      => (int) $r['store_id'],
                        'store_name'    => $store_name,
                        'product_id'    => (int) $r['product_id'],
                        'product_name'  => $product_name,
                        'product_link'  => $product_link,
                        'product_sku'   => $product_sku,
                        'product_image' => $product_image,
                        'name'          => $r['name'],
                        'email'         => $r['email'],
                        'reason'        => $r['message'],
                        'created_at'    => $r['created_at'],
                        'updated_at'    => $r['updated_at'],
                    );
                },
                $reports
            );

            return rest_ensure_response($formatted);
        } catch (\Exception $e) {
            MultiVendorX()->util->log($e);

            return new \WP_Error('server_error', __('Unexpected server error', 'multivendorx'), array('status' => 500));
        }
    }

    /**
     * Create a single item.
     *
     * @param object $request Full details about the request.
     */
    public function create_item($request)
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
    }

    /**
     * Retrieve a single item.
     *
     * @param object $request Full details about the request.
     */
    public function get_item($request)
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
            return rest_ensure_response($data);
        } catch (\Exception $e) {
            MultiVendorX()->util->log($e);

            return new \WP_Error('server_error', __('Unexpected server error', 'multivendorx'), array('status' => 500));
        }
    }

    /**
     * Update a single item.
     *
     * @param object $request Full details about the request.
     */
    public function update_item($request)
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
            return rest_ensure_response(array('success' => true));
        } catch (\Exception $e) {
            MultiVendorX()->util->log($e);

            return new \WP_Error('server_error', __('Unexpected server error', 'multivendorx'), array('status' => 500));
        }
    }

    /**
     * Delete a single item.
     *
     * @param object $request Full details about the request.
     */
    public function delete_item($request)
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
            // Get report ID.
            $id = absint($request->get_param('id'));
            if (! $id) {
                return new \WP_Error(
                    'invalid_id',
                    __('Invalid report ID', 'multivendorx'),
                    array('status' => 400)
                );
            }

            // Fetch the report.
            $report = reset(Util::get_report_abuse_information(array('id' => $id)));
            if (! $report) {
                return new \WP_Error(
                    'not_found',
                    __('Report not found', 'multivendorx'),
                    array('status' => 404)
                );
            }

            // Delete via Util helper.
            $deleted = Util::delete_report_abuse($id);

            if (! $deleted) {
                return new \WP_Error(
                    'delete_failed',
                    __('Failed to delete report', 'multivendorx'),
                    array('status' => 500)
                );
            }

            return rest_ensure_response(array('success' => true));
        } catch (\Exception $e) {
            MultiVendorX()->util->log($e);

            return new \WP_Error('server_error', __('Unexpected server error', 'multivendorx'), array('status' => 500));
        }
    }
}
