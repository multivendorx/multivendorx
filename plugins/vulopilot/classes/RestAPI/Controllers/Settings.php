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
 * No per-field type/sanitization allowlist here — matches the sibling
 * free plugins' own Settings controllers (multivendorx/catalogx/moowoodle,
 * see their own RestAPI/Controllers/Settings.php), which likewise store
 * whatever `{ setting }` the client sends with no server-side field-type
 * validation. The only thing this class still does beyond that baseline
 * is merge into the existing option rather than replace it outright,
 * which is a consequence of the single-flat-option storage above, not a
 * sanitization layer.
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
        return rest_ensure_response( $this->get_stored_settings() );
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

        $updated = array_merge( $this->get_stored_settings(), $tab_fields );

        update_option( Utill::VULOPILOT_SETTINGS_KEY, $updated );

        $response = array(
            'success' => true,
            'message' => __( 'Settings saved.', 'vulopilot' ),
        );

        // Editing llms.txt's content is meant to take effect immediately,
        // not just on the next dynamic /llms.txt request — write the real
        // file straight away so "View live file" reflects this save
        // without the admin needing to trigger anything else. Reported
        // honestly: a locked-down host where ABSPATH isn't writable still
        // saves the setting (the virtual /llms.txt route still serves it),
        // it just can't also write the static file.
        if ( array_key_exists( 'llms_txt_content', $tab_fields ) ) {
            $response['file_saved'] = VuloPilot()->llms_txt_generator->write_file( $updated['llms_txt_content'] );
        }

        return rest_ensure_response( $response );
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
     * (same posture as update_item()) rather than replacing wholesale.
     *
     * @param \WP_REST_Request $request Full details about the request.
     * @return \WP_REST_Response|\WP_Error
     */
    public function import_settings( $request ) {
        $payload = $request->get_param( 'settings' );

        if ( ! is_array( $payload ) ) {
            return new \WP_Error( 'vulopilot_invalid_import', __( 'That file doesn\'t look like a valid VuloPilot settings export.', 'vulopilot' ), array( 'status' => 400 ) );
        }

        $current = array_merge( $this->get_stored_settings(), $payload );

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

        $settings = wp_parse_args( is_array( $saved ) ? $saved : array(), Utill::VULOPILOT_SETTINGS_DEFAULTS );

        // Sites that saved a checkbox setting before this option's defaults
        // moved to zyra's own wire shape still have a raw PHP boolean
        // sitting in the stored option for that key — normalize it here
        // rather than reintroducing a per-key type allowlist. This is
        // driven by the value's own PHP type, not a field-by-field
        // registry, so it stays consistent with dropping FIELD_TYPES: no
        // setting other than a checkbox has ever stored a real boolean.
        // The wire shape's "on" sentinel is the field's own key (matching
        // every checkbox field's `options: [{ key, value }]` in the *.ts
        // settings configs, e.g. `enable_seo_scanning`'s sole option is
        // `{ key: 'enable_seo_scanning', value: 'enable_seo_scanning' }`),
        // not a shared 'enabled' literal — so `$key` itself is correct here.
        foreach ( $settings as $key => $value ) {
            if ( is_bool( $value ) ) {
                $settings[ $key ] = $value ? array( $key ) : array();
            }
        }

        // 'llms_txt_content' can't live in VULOPILOT_SETTINGS_DEFAULTS as
        // anything but '' (a class const array can't call a method) — so
        // an admin who has never customized it yet sees the real
        // auto-generated content here, not a blank textarea, without that
        // ever being persisted until they actually edit and save it.
        if ( empty( $settings['llms_txt_content'] ) ) {
            $settings['llms_txt_content'] = VuloPilot()->llms_txt_generator->generate();
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
