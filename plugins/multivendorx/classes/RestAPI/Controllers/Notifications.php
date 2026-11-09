<?php
/**
 * MultiVendorX REST API Notifications controller.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\RestAPI\Controllers;

use MultiVendorX\Utill;
use MultiVendorx\Store\Store;
use MultiVendorX\Store\StoreUtil;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX REST API Notifications controller.
 *
 * @class       Notifications class
 * @version     5.0.0
 * @author      MultiVendorX
 */
class Notifications extends \WP_REST_Controller {


    /**
     * Route base.
     *
     * @var string
     */
    protected $rest_base = 'notifications';

    /**
     * Register the routes for notifications.
     */
    public function register_routes() {
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_items' ),
                    'permission_callback' => array( $this, 'multivendorx_get_items_permissions_check' ),
                ),
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array( $this, 'update_items' ),
                    'permission_callback' => array( $this, 'multivendorx_permissions_check' ),
                ),
            )
        );

        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_item' ),
                    'permission_callback' => array( $this, 'multivendorx_permissions_check' ),
                    'args'                => array(
                        'id' => array( 'required' => true ),
                    ),
                ),
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array( $this, 'update_item' ),
                    'permission_callback' => array( $this, 'multivendorx_permissions_check' ),
                ),
            )
        );

        // Shared vulomail email-template contract — additive aliases only.
        // `notifications`/`notifications/{id}` above stay exactly as they
        // are (the activity-notification feed and store-dashboard headers
        // already depend on that exact shape); these routes exist purely
        // so an external consumer like vulomail can read/write the same
        // per-event channel content without having to know multivendorx's
        // own overloaded `events`/`header` query-param convention.
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/email-templates',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_email_templates' ),
                    'permission_callback' => array( $this, 'multivendorx_get_items_permissions_check' ),
                ),
            )
        );

        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/email-templates/(?P<id>[\d]+)',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_item' ),
                    'permission_callback' => array( $this, 'multivendorx_permissions_check' ),
                    'args'                => array(
                        'id' => array( 'required' => true ),
                    ),
                ),
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array( $this, 'update_item' ),
                    'permission_callback' => array( $this, 'multivendorx_permissions_check' ),
                ),
            )
        );

        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/email-events',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_email_templates' ),
                    'permission_callback' => array( $this, 'multivendorx_get_items_permissions_check' ),
                ),
            )
        );
    }

    /**
     * Shared vulomail contract — `GET /email-templates` and
     * `GET /email-events` (same event list; `email-events` exists as its
     * own route so a caller that only wants the catalog, not full
     * per-event channel content, has a stable name to call either way).
     *
     * @param object $request The request object.
     */
    public function get_email_templates( $request ) {
        if ( ! Utill::current_user_has_capability( array( 'manage_options' ) ) ) {
            return new \WP_Error(
                'rest_forbidden',
                __( 'You are not allowed to view notification event settings.', 'multivendorx' ),
                array( 'status' => 403 )
            );
        }

        // The standalone "Email Template Customizer" settings screen
        // (`email-template-customizer` tab) is a second, separate email
        // surface from Event Rules — its own `wp_option`, not a row in
        // `multivendorx_system_events` — so it isn't covered by
        // `get_formatted_events()`. Prepending it here (id 0, reserved —
        // real event ids are the table's own auto-increment, starting at
        // 1) is what makes it show up next to Event Rules' events in
        // vulomail's merged list.
        // One row for this plugin: the Email Template Customizer. Each event's email, its recipients and
        // its channels are saved here and edited on Settings > Notification > Event Rules; that screen
        // opens VuloMail's editor on one event's data (`email-templates/{id}`), so the events are not
        // repeated in VuloMail's list.
        return rest_ensure_response( array( $this->get_template_customizer_row() ) );
    }

    /**
     * The starter email templates this plugin ships (`templates/email/*.json`: id, name, previewText
     * and blocks in the legacy block format), offered in the email editor's Templates tab.
     *
     * @return array
     */
    private function get_starter_templates() {
        $templates = array();

        foreach ( (array) glob( MultiVendorX()->plugin_path . 'templates/email/*.json' ) as $file ) {
            $data = json_decode( (string) file_get_contents( $file ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents

            if ( is_array( $data ) && ! empty( $data['id'] ) && ! empty( $data['blocks'] ) ) {
                $data['name']        = __( (string) ( $data['name'] ?? '' ), 'multivendorx' ); // phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText
                $data['previewText'] = __( (string) ( $data['previewText'] ?? '' ), 'multivendorx' ); // phpcs:ignore WordPress.WP.I18n.NonSingularStringLiteralText
                $templates[]         = $data;
            }
        }

        // Every event's own default email, so any event can be set back to (or started from) another's.
        foreach ( (array) MultiVendorX()->notifications->default_events() as $key => $event ) {
            if ( empty( $event['name'] ) || empty( $event['email_body'] ) ) {
                continue;
            }

            $templates[] = array(
                'id'          => 'event-' . sanitize_key( (string) $key ),
                'name'        => $event['name'],
                'previewText' => (string) ( $event['email_subject'] ?? '' ),
                'email_body'  => $event['email_body'],
            );
        }

        return $templates;
    }

    /**
     * The one list row representing the "Email Template Customizer"
     * screen's own template (currently just the Sales Report email) —
     * same `{id, event, description, ...}` shape `get_formatted_events()`
     * rows use, so it renders in vulomail's list identically.
     *
     * @return array
     */
    private function get_template_customizer_row() {
        return array(
            'id'            => 0,
            'icon'          => 'search-discovery',
            'event'         => __( 'Email Template Customizer', 'multivendorx' ),
            'description'   => __( 'Standalone marketplace email template, not tied to a specific event.', 'multivendorx' ),
            'tag'           => 'template',
            'category'      => 'template',
            'recipients'    => array(),
            'channels'      => array(
                'mail'   => true,
                'sms'    => false,
                'system' => false,
            ),
            'email_subject' => null,
        );
    }

    /**
     * Reads the Email Template Customizer's own stored (or default-seeded)
     * template — same `{ emailTemplates: [{id, name, blocks}],
     * activeEmailTemplateId }` shape `EmailBuilderFieldComponent` already
     * saves via the generic `POST /settings` route
     * (`classes/RestAPI/Controllers/Settings.php::update_item()`), which
     * derives this exact option name from `settingName`.
     *
     * @return array {id, name, blocks}
     */
    private function get_template_customizer_template() {
        $stored = get_option( Utill::MULTIVENDORX_SETTINGS['email-template-customizer'], array() );
        $saved  = $stored['email_templates']['emailTemplates'][0] ?? null;

        if ( ! empty( $saved['blocks'] ) ) {
            return $saved;
        }

        // Nothing saved yet. The settings screen's own JS-side default
        // (`field.emailTemplates`'s full `salesReport` preset, with its
        // stat-tile columns) isn't reachable from PHP, so this is a
        // lighter real starting point rather than duplicating that whole
        // block tree here — a blank canvas would otherwise look like
        // nothing loaded at all when this popup first opens.
        return array(
            'id'     => 'store-registration',
            'name'   => __( 'Sales Report', 'multivendorx' ),
            'blocks' => array(
                array(
                    'id'   => 'default-heading',
                    'type' => 'heading',
                    'text' => __( 'Hi {storeName},', 'multivendorx' ),
                ),
                array(
                    'id'   => 'default-text',
                    'type' => 'richtext',
                    'text' => __( "Here's how your store performed on {siteName} this week.", 'multivendorx' ),
                ),
            ),
        );
    }

    /**
     * Writes the Email Template Customizer's template back to its own
     * option, same shape `update_item()` (`Settings.php`) already uses.
     *
     * @param array $blocks Legacy email blocks, as `legacyEmailAdapter.ts` shapes them.
     * @return void
     */
    private function save_template_customizer_template( $blocks ) {
        $template = $this->get_template_customizer_template();

        update_option(
            Utill::MULTIVENDORX_SETTINGS['email-template-customizer'],
            array(
                'email_templates' => array(
                    'emailTemplates'         => array(
                        array(
                            'id'     => $template['id'],
                            'name'   => $template['name'],
                            'blocks' => $blocks,
                        ),
                    ),
                    'activeEmailTemplateId' => $template['id'],
                ),
            )
        );
    }

    /**
     * Builds the formatted event/notification list shared by the legacy
     * `GET notifications?events=1` branch and the `email-templates` /
     * `email-events` routes.
     *
     * @return array
     */
    private function get_formatted_events() {
        $results = MultiVendorX()->notifications->get_all_events();

        $formated_notifications = array();

        foreach ( $results as $row ) {
            $custom_emails = ! empty( $row->custom_emails )
                ? json_decode( $row->custom_emails, true )
                : array();

            // Build recipients array.
            $recipients = array();
            $id         = 1;

            $recipients[] = array(
                'id'        => $id++,
                'type'      => 'Store',
                'label'     => 'Store',
                'enabled'   => (bool) $row->store_enabled,
                'canDelete' => false,
            );

            $recipients[] = array(
                'id'        => $id++,
                'type'      => 'Admin',
                'label'     => 'Admin',
                'enabled'   => (bool) $row->admin_enabled,
                'canDelete' => false,
            );

            if ( $row->customer_enabled ) {
                $recipients[] = array(
                    'id'        => $id++,
                    'type'      => 'Customer',
                    'label'     => 'Customer',
                    'enabled'   => (bool) $row->customer_enabled,
                    'canDelete' => false,
                );
            }

            // Add any custom emails.
            foreach ( $custom_emails as $email ) {
                $recipients[] = array(
                    'id'        => $id++,
                    'type'      => 'extra',
                    'label'     => $email,
                    'enabled'   => true,
                    'canDelete' => true,
                );
            }

            $channels = array(
                'mail'   => (bool) $row->email_enabled,
                'sms'    => (bool) $row->sms_enabled,
                'system' => (bool) $row->system_enabled,
            );

            $formated_notifications[] = array(
                'id'            => (int) $row->id,
                'icon'          => str_replace( '_', '-', $row->system_action ),
                // Name of this event's email in VuloMail's template registry.
                'template'      => \MultiVendorX\Integrations\VuloMailTemplates::template_name( $row->system_action ),
                'event'         => $row->event_name,
                'description'   => $row->description,
                'tag'           => $row->tag,
                'category'      => $row->category,
                'recipients'    => $recipients,
                'channels'      => $channels,
                'email_subject' => $row->email_subject,
            );
        }

        return $formated_notifications;
    }

    /**
     * Get items permissions.
     *
     * @param object $request Request data.
     */
    public function multivendorx_get_items_permissions_check( $request ) {
        return Utill::current_user_has_capability( array( 'manage_options', 'edit_stores' ) );
    }

    /**
     * Check permission for notification REST API requests.
     *
     * @param object $request WP_REST_Request object.
     * @return true|\WP_Error
     */
    public function multivendorx_permissions_check( $request ) {
        return Utill::current_user_has_capability( array( 'manage_options' ) );
    }

    /**
     * Get all notifications.
     *
     * @param object $request WP_REST_Request object.
     */
    public function get_items( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error.
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log( $error );
            }

            return $error;
        }

        try {
            $header_notifications = $request->get_param( 'header' );
            $events_notifications = $request->get_param( 'events' );
            $type                 = $request->get_param( 'type' );
            $store_id             = $request->get_param( 'store_id' );

            $response = rest_ensure_response( array() );

            if ( $header_notifications ) {
                if ( ! StoreUtil::current_user_can_manage_store( $store_id ) ) {
                    return new \WP_Error(
                        'rest_forbidden',
                        __( 'You are not allowed to view this store\'s notifications.', 'multivendorx' ),
                        array( 'status' => 403 )
                    );
                }

                $all_count = MultiVendorX()->notifications->get_all_notifications(
                    array(
                        'count'    => true,
                        'store_id' => ! empty( $store_id ) ? $store_id : '',
                    )
                );

                $response->header( 'X-WP-Total', (int) $all_count );

                $args = array(
                    'limit'    => 10,
                    'offset'   => 0,
                    'category' => $type,
                    'store_id' => ! empty( $store_id ) ? $store_id : '',
                );

                $results = MultiVendorX()->notifications->get_all_notifications( $args );

                $formated_notifications = array();

                foreach ( $results as $index => $row ) {
                    $formated_notifications[] = array(
                        'id'      => (int) $row['id'],
                        'icon'    => 'cart admin-color' . ( $index + 1 ),
                        'title'   => $row['title'],
                        'message' => $row['message'],
                        'time'    => $this->time_ago( $row['created_at'] ),
                    );
                }

                $response->set_data( $formated_notifications );
                return $response;
            }

            if ( $events_notifications ) {
                // Event configuration is marketplace-wide, not a store's own data.
                if ( ! Utill::current_user_has_capability( array( 'manage_options' ) ) ) {
                    return new \WP_Error(
                        'rest_forbidden',
                        __( 'You are not allowed to view notification event settings.', 'multivendorx' ),
                        array( 'status' => 403 )
                    );
                }

                return rest_ensure_response( $this->get_formatted_events() );
            }
            // Store users can only access their own store's notifications.
            if ( ! StoreUtil::current_user_can_manage_store( $store_id ) ) {
                return new \WP_Error(
                    'rest_forbidden',
                    __( 'You are not allowed to view this store\'s notifications.', 'multivendorx' ),
                    array( 'status' => 403 )
                );
            }

            $all_count = MultiVendorX()->notifications->get_all_notifications(
                array(
                    'count'    => true,
                    'category' => $request->get_param( 'notification' ) ? 'notification' : 'activity',
                    'store_id' => ! empty( $store_id ) ? $store_id : '',
                )
            );

            $response->header( 'X-WP-Total', (int) $all_count );

            $limit      = max( intval( $request->get_param( 'row' ) ), 10 );
            $page       = max( intval( $request->get_param( 'page' ) ), 1 );
            $offset     = ( $page - 1 ) * $limit;
            $start_date = $request->get_param( 'start_date' );
            $end_date   = $request->get_param( 'end_date' );
            $start_date = $start_date ? gmdate( 'Y-m-d H:i:s', strtotime( $start_date ) ) : '';
            $end_date   = $end_date ? gmdate( 'Y-m-d H:i:s', strtotime( $end_date ) ) : '';

            $args = array(
                'limit'      => $limit,
                'offset'     => $offset,
                'category'   => $request->get_param( 'notification' ) ? 'notification' : 'activity',
                'store_id'   => ! empty( $store_id ) ? $store_id : '',
                'start_date' => $start_date ? $start_date : null,
                'end_date'   => $end_date ? $end_date : null,
            );

            $all_notifications = MultiVendorX()->notifications->get_all_notifications( $args );

            $notifications = array();

            foreach ( $all_notifications as $notification ) {
                $store           = new Store( (int) $notification['store_id'] );
                $notifications[] = apply_filters(
                    'multivendorx_stores',
                    array(
                        'store_id'       => (int) $notification['store_id'],
                        'store_name'     => $store->get( Utill::STORE_SETTINGS_KEYS['name'] ),
                        'type'           => $notification['type'],
                        'title'          => $notification['title'],
                        'message'        => $notification['message'],
                        'created_at'     => Utill::multivendorx_rest_prepare_date_response( $notification['created_at'] ),
                        'created_at_gmt' => Utill::multivendorx_rest_prepare_date_response( $notification['created_at'], true ),
                    )
                );
            }

            $response->set_data( $notifications );
            return $response;
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error(
                'server_error',
                __( 'Unexpected server error', 'multivendorx' ),
                array( 'status' => 500 )
            );
        }
    }
    /**
     * Update items based on the sync notifications setting.
     *
     * This method checks the 'sync_notifications' setting and performs
     * the appropriate action:
     * - 'sync_only_new_entry': deletes all existing events and inserts new system events.
     * - 'sync_existing_entry': syncs all existing events.
     *
     * @param WP_REST_Request $request The REST API request object.
     *
     * @return void
     */
    public function update_items( $request ) {
        $sync_notifications = MultiVendorX()->setting->get_setting( 'sync_notifications', '' );

        if ( 'sync_only_new_entry' === $sync_notifications ) {
            MultiVendorX()->notifications->delete_all_events();
            MultiVendorX()->notifications->insert_system_events( true );
        }

        if ( 'sync_existing_entry' === $sync_notifications ) {
            MultiVendorX()->notifications->sync_events();
        }
    }

    /**
     * Calculate time difference between current time and given datetime.
     *
     * @param string $datetime Datetime in MySQL format.
     */
    public function time_ago( $datetime ) {
        if ( empty( $datetime ) ) {
            return '';
        }

        $timestamp = strtotime( $datetime );
        $diff      = time() - $timestamp;

        if ( $diff < 60 ) {
            return $diff . ' seconds ago';
        } elseif ( $diff < 3600 ) {
            return floor( $diff / 60 ) . ' minutes ago';
        } elseif ( $diff < 86400 ) {
            return floor( $diff / 3600 ) . ' hours ago';
        } elseif ( $diff < 604800 ) {
            return floor( $diff / 86400 ) . ' days ago';
        } else {
            return gmdate( 'M j, Y', $timestamp );
        }
    }

    /**
     * Update an existing notification.
     *
     * @param object $request The request object.
     */
    public function update_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error.
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log( $error );
            }

            return $error;
        }
        try {
            global $wpdb;
            $notification_data = $request->get_param( 'notifications' );

            $is_read      = $request->get_param( 'is_read' );
            $is_dismissed = $request->get_param( 'is_dismissed' );
            $id           = $request->get_param( 'id' );
            $form_data    = $request->get_param( 'formData' );

            if ( ! empty( $form_data ) && isset( $form_data['legacy_blocks'] ) && 0 === (int) ( $form_data['id'] ?? -1 ) ) {
                $this->save_template_customizer_template( $form_data['legacy_blocks'] );

                return rest_ensure_response(
                    array(
                        'success' => true,
                    )
                );
            }

            if ( ! empty( $form_data ) ) {
                $data = array(
                    'email_subject'  => $form_data['email_subject'],
                    'email_body'     => $form_data['email_body'],
                    'sms_content'    => $form_data['sms_content'],
                    'system_message' => $form_data['system_message'],
                );

                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $updated = $wpdb->update( "{$wpdb->prefix}" . Utill::TABLES['system_events'], $data, array( 'id' => $form_data['id'] ), array( '%s', '%s', '%s', '%s' ), array( '%d' ) );

                return rest_ensure_response(
                    array(
                        'success' => true,
                    )
                );
            }

            if ( $is_dismissed ) {
                $data = array(
                    'is_dismissed' => $is_dismissed,
                );

                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $updated = $wpdb->update( "{$wpdb->prefix}" . Utill::TABLES['notifications'], $data, array( 'id' => $id ), null, array( '%s' ) );

                return rest_ensure_response(
                    array(
                        'success' => true,
                    )
                );
            }

            if ( $is_read ) {
                $data = array(
                    'is_read' => $is_read,
                );

                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $updated = $wpdb->update( "{$wpdb->prefix}" . Utill::TABLES['notifications'], $data, array( 'id' => $id ), null, array( '%s' ) );

                return rest_ensure_response(
                    array(
                        'success' => true,
                    )
                );
            }

            if ( empty( $notification_data ) || ! is_array( $notification_data ) ) {
                return new \WP_Error( 'invalid_data', __( 'Invalid notification data', 'multivendorx' ), array( 'status' => 400 ) );
            }

            foreach ( $notification_data as $notification ) {
                $id = intval( $notification['id'] );

                $channels = $notification['channels'] ?? array();
                if ( ! empty( $channels ) ) {
                    $email_enabled  = $channels['mail'] ?? false;
                    $sms_enabled    = $channels['sms'] ?? false;
                    $system_enabled = $channels['system'] ?? false;
                }

                $store_enabled = 0;
                $admin_enabled = 0;
                $custom_emails = array();

                if ( ! empty( $notification['recipients'] ) && is_array( $notification['recipients'] ) ) {
                    foreach ( $notification['recipients'] as $recipient ) {
                        if ( 'Store' === $recipient['type'] ) {
                            $store_enabled = $recipient['enabled'] ?? false;
                        } elseif ( 'Admin' === $recipient['type'] ) {
                            $admin_enabled = $recipient['enabled'] ?? false;
                        } elseif ( 'extra' === $recipient['type'] ) {
                            $custom_emails[] = sanitize_email( $recipient['label'] );
                        }
                    }
                }

                $custom_emails_json = ! empty( $custom_emails ) ? wp_json_encode( $custom_emails ) : null;

                $update_data = array(
                    'email_enabled'  => $email_enabled,
                    'sms_enabled'    => $sms_enabled,
                    'system_enabled' => $system_enabled,
                    'store_enabled'  => $store_enabled,
                    'admin_enabled'  => $admin_enabled,
                    'custom_emails'  => $custom_emails_json,
                );

                $where = array( 'id' => $id );
                // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                $updated = $wpdb->update( "{$wpdb->prefix}" . Utill::TABLES['system_events'], $update_data, $where, null, array( '%d' ) );
            }

            if ( $updated ) {
                return rest_ensure_response(
                    array(
                        'success' => true,
                        'message' => __( 'Notification(s) updated successfully.', 'multivendorx' ),
                    )
                );
            }
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    /**
     * Get a single notification by ID.
     *
     * @param object $request The request object.
     */
    public function get_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error.
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log( $error );
            }

            return $error;
        }
        try {
            $id = (int) $request->get_param( 'id' );

            if ( 0 === $id ) {
                $template = $this->get_template_customizer_template();
                return rest_ensure_response(
                    array(
                        array_merge(
                            $this->get_template_customizer_row(),
                            array(
                                'legacy_blocks' => $template['blocks'],
                                'templates'     => $this->get_starter_templates(),
                            )
                        ),
                    )
                );
            }

            $results = MultiVendorX()->notifications->get_all_events( $id );

            // Starter email templates for the editor's Templates tab.
            if ( is_array( $results ) && isset( $results[0] ) && is_array( $results[0] ) ) {
                $templates = $this->get_starter_templates();

                foreach ( $results as $index => $row ) {
                    $results[ $index ]['templates'] = $templates;
                }
            }

            return rest_ensure_response( $results );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }
}
