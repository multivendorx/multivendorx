<?php
/**
 * Settings controller file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\RestAPI\Controllers;

use VuloPilot\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * GET/POST /settings backs src/pages/Settings/Settings.tsx, now built on
 * zyra's real settings framework (`InputRenderer`/`NavigatorComponent`,
 * `getAvailableSettings`/`getSettingById` from zyra's core module — see the
 * free multivendorx plugin's own `components/Settings/Settings.tsx` for the
 * pattern this mirrors). `InputRenderer` auto-saves each tab's fields as
 * `{ setting, settingName }` — a SUBSET of the full settings object, not
 * the whole thing — so update_item() merges into the existing stored
 * option rather than replacing it wholesale (the previous version's
 * `update_option()` call replaced the *entire* option with only the 2
 * keys it knew about, which would have silently wiped every other tab's
 * values the moment a second tab existed).
 *
 * Reads/writes a single wp_options row (Utill::VULOPILOT_SETTINGS_KEY),
 * not a custom table — see Utill::VULOPILOT_SETTINGS_DEFAULTS's docblock
 * for why. Also backs the Import/Export/Reset tab (a hand-built panel,
 * not an InputRenderer-driven one — see Settings.tsx's own docblock for
 * why those three actions don't fit the auto-save field pattern).
 *
 * @class       Settings controller
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Settings extends \WP_REST_Controller {

    /**
     * @var string
     */
    protected $rest_base = 'settings';

    /**
     * @var string
     */
    protected $modules_base = 'modules';

    /**
     * Field type per settings key — the single source of truth
     * update_item()/import_settings() sanitize against. `checkbox` fields
     * are stored here as real PHP booleans (simpler for every other PHP
     * consumer to read) and converted to zyra's checkbox-array wire shape
     * (`[]`/`['enabled']`) only at the REST boundary — see to_wire_format().
     *
     * @var array<string, array{type: string, options?: string[]}>
     */
    private const FIELD_TYPES = array(
        'scan_frequency'                => array(
            'type'    => 'select',
            'options' => array( 'hourly', 'daily', 'weekly' ),
        ),
        'notification_email'            => array( 'type' => 'email' ),
        'notify_on_critical_findings'   => array( 'type' => 'checkbox' ),
        'email_from_name'               => array( 'type' => 'text' ),
        'email_from_address'            => array( 'type' => 'email' ),
        'automation_cooldown_minutes'   => array( 'type' => 'number' ),
        'default_report_format'         => array(
            'type'    => 'select',
            'options' => array( 'csv', 'json', 'pdf' ),
        ),
        'default_report_period_days'    => array( 'type' => 'number' ),
        'enable_rest_api_scanner'       => array( 'type' => 'checkbox' ),
        'enable_seo_scanning'           => array( 'type' => 'checkbox' ),
        'enable_geo_scanning'           => array( 'type' => 'checkbox' ),
        'enable_accessibility_scanning' => array( 'type' => 'checkbox' ),
        'enable_woocommerce_scanning'   => array( 'type' => 'checkbox' ),
        'enable_debug_logging'          => array( 'type' => 'checkbox' ),
    );

    /**
     * @inheritDoc
     */
    public function register_routes() {
        register_rest_route(
            VuloPilot()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_items' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                ),
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array( $this, 'update_item' ),
                    'permission_callback' => array( $this, 'update_item_permissions_check' ),
                ),
            )
        );

        register_rest_route(
            VuloPilot()->rest_namespace,
            '/' . $this->rest_base . '/export',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'export_settings' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                ),
            )
        );

        register_rest_route(
            VuloPilot()->rest_namespace,
            '/' . $this->rest_base . '/import',
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'import_settings' ),
                    'permission_callback' => array( $this, 'update_item_permissions_check' ),
                ),
            )
        );

        register_rest_route(
            VuloPilot()->rest_namespace,
            '/' . $this->rest_base . '/reset',
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'reset_settings' ),
                    'permission_callback' => array( $this, 'update_item_permissions_check' ),
                ),
            )
        );

        // Enable/disable a module — mirrors the free multivendorx plugin's
        // own Settings controller (module-architecture.md), same GET/POST
        // shape zyra's ModuleGridComponent already expects.
        register_rest_route(
            VuloPilot()->rest_namespace,
            '/' . $this->modules_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'set_modules' ),
                    'permission_callback' => array( $this, 'update_item_permissions_check' ),
                ),
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_modules' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                ),
            )
        );
    }

    /**
     * @inheritDoc
     */
    public function get_items_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * @inheritDoc
     */
    public function update_item_permissions_check( $request ) {
        return current_user_can( 'manage_options' );
    }

    /**
     * @inheritDoc
     */
    public function get_items( $request ) {
        return rest_ensure_response( $this->to_wire_format( $this->get_stored_settings() ) );
    }

    /**
     * Merges one tab's fields into the stored settings — the request
     * shape zyra's `InputRenderer` actually sends (`{ setting, settingName }`,
     * see this class's own docblock), not a flat replace-everything body.
     *
     * @inheritDoc
     */
    public function update_item( $request ) {
        $tab_fields = $request->get_param( 'setting' );

        // Fall back to treating the whole body as the field set when no
        // `setting` wrapper is present (e.g. a direct API call rather than
        // InputRenderer's own auto-save) — still merged, never a wholesale
        // replace either way.
        if ( ! is_array( $tab_fields ) ) {
            $tab_fields = $request->get_json_params();
        }

        if ( ! is_array( $tab_fields ) ) {
            $tab_fields = array();
        }

        $updated = $this->get_stored_settings();

        foreach ( $tab_fields as $key => $value ) {
            if ( ! array_key_exists( $key, self::FIELD_TYPES ) ) {
                continue;
            }

            $updated[ $key ] = $this->sanitize_field( $key, $value );
        }

        update_option( Utill::VULOPILOT_SETTINGS_KEY, $updated );

        return rest_ensure_response(
            array(
                'success' => true,
                'message' => __( 'Settings saved.', 'vulopilot' ),
            )
        );
    }

    /**
     * Downloads the full stored settings object as JSON — the "Export"
     * action on the Import/Export/Reset tab.
     *
     * @param \WP_REST_Request $request Full details about the request.
     * @return void
     */
    public function export_settings( $request ) {
        nocache_headers();
        header( 'Content-Type: application/json' );
        header( 'Content-Disposition: attachment; filename="vulopilot-settings.json"' );

        echo wp_json_encode( $this->get_stored_settings(), JSON_PRETTY_PRINT ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- a JSON file download, not HTML; wp_json_encode() already produces safe, well-formed output.
        exit;
    }

    /**
     * Restores settings from a previously-exported JSON payload — merges
     * (same posture as update_item()) rather than replacing wholesale, and
     * silently drops any key that isn't in FIELD_TYPES so an edited or
     * stale export file can't inject arbitrary option keys.
     *
     * @param \WP_REST_Request $request Full details about the request.
     * @return \WP_REST_Response|\WP_Error
     */
    public function import_settings( $request ) {
        $payload = $request->get_param( 'settings' );

        if ( ! is_array( $payload ) ) {
            return new \WP_Error( 'vulopilot_invalid_import', __( 'That file doesn\'t look like a valid VuloPilot settings export.', 'vulopilot' ), array( 'status' => 400 ) );
        }

        $current = $this->get_stored_settings();

        foreach ( $payload as $key => $value ) {
            if ( ! array_key_exists( $key, self::FIELD_TYPES ) ) {
                continue;
            }

            $current[ $key ] = $this->sanitize_field( $key, $value );
        }

        update_option( Utill::VULOPILOT_SETTINGS_KEY, $current );

        return rest_ensure_response(
            array(
                'success' => true,
                'message' => __( 'Settings imported.', 'vulopilot' ),
            )
        );
    }

    /**
     * Deletes the stored option entirely, reverting every setting to
     * Utill::VULOPILOT_SETTINGS_DEFAULTS — the "Reset to defaults" action.
     *
     * @param \WP_REST_Request $request Full details about the request.
     * @return \WP_REST_Response
     */
    public function reset_settings( $request ) {
        delete_option( Utill::VULOPILOT_SETTINGS_KEY );

        return rest_ensure_response(
            array(
                'success' => true,
                'message' => __( 'Settings reset to defaults.', 'vulopilot' ),
            )
        );
    }

    /**
     * @return array<string, mixed> Stored settings, defaults filled in for anything never saved.
     */
    private function get_stored_settings(): array {
        $saved = get_option( Utill::VULOPILOT_SETTINGS_KEY, array() );

        return wp_parse_args( is_array( $saved ) ? $saved : array(), Utill::VULOPILOT_SETTINGS_DEFAULTS );
    }

    /**
     * @param string $key   A FIELD_TYPES key.
     * @param mixed  $value Raw value — either zyra's checkbox-array wire shape or a plain scalar (both from a live request or an imported export file).
     * @return mixed Sanitized value, in PHP-native form (checkbox fields become real booleans).
     */
    private function sanitize_field( string $key, $value ) {
        $type = self::FIELD_TYPES[ $key ]['type'] ?? 'text';

        switch ( $type ) {
            case 'checkbox':
                // Accepts either zyra's own wire shape (an array containing
                // 'enabled') or a plain boolean/truthy scalar, so this
                // sanitizes correctly whether the value came from
                // InputRenderer's auto-save, an imported export file, or a
                // direct API call.
                return is_array( $value ) ? in_array( 'enabled', $value, true ) : (bool) $value;

            case 'number':
                return absint( $value );

            case 'email':
                $email = sanitize_email( (string) $value );
                return is_email( $email ) ? $email : '';

            case 'select':
                $options = self::FIELD_TYPES[ $key ]['options'] ?? array();
                $value   = sanitize_key( (string) $value );
                return in_array( $value, $options, true ) ? $value : ( $options[0] ?? '' );

            case 'text':
            default:
                return sanitize_text_field( (string) $value );
        }
    }

    /**
     * @param array<string, mixed> $settings PHP-native settings (checkbox fields as real booleans).
     * @return array<string, mixed> Wire format — checkbox fields as zyra's `[]`/`['enabled']` array shape.
     */
    private function to_wire_format( array $settings ): array {
        foreach ( self::FIELD_TYPES as $key => $field ) {
            if ( 'checkbox' === $field['type'] ) {
                $settings[ $key ] = ! empty( $settings[ $key ] ) ? array( 'enabled' ) : array();
            }
        }

        return $settings;
    }

    /**
     * Activates or deactivates one module — the same request shape zyra's
     * `ModuleGridComponent` sends regardless of which plugin it's talking
     * to (`{ id, action, modules? }`), mirrored from the free multivendorx
     * plugin's own `set_modules()`.
     *
     * @param \WP_REST_Request $request Full details about the request.
     * @return \WP_REST_Response|\WP_Error
     */
    public function set_modules( $request ) {
        $module_id = sanitize_key( (string) $request->get_param( 'id' ) );
        $action    = sanitize_key( (string) $request->get_param( 'action' ) );
        $modules   = array_map( 'sanitize_key', (array) $request->get_param( 'modules' ) );

        if ( '' === $module_id && empty( $modules ) ) {
            return new \WP_Error( 'vulopilot_missing_module_id', __( 'No module id given.', 'vulopilot' ), array( 'status' => 400 ) );
        }

        if ( ! empty( $modules ) ) {
            $result = VuloPilot()->modules->activate_modules( $modules );

            return rest_ensure_response( $result );
        }

        $result = 'activate' === $action
            ? VuloPilot()->modules->activate_modules( array( $module_id ) )
            : VuloPilot()->modules->deactivate_modules( array( $module_id ) );

        return rest_ensure_response( $result );
    }

    /**
     * @return array Every currently active module's id — zyra's
     *               `initializeModules()`/`useModules()` (react-frontend.md)
     *               expect this exact flat-array shape.
     */
    public function get_modules() {
        return VuloPilot()->modules->get_active_modules();
    }
}
