<?php
/**
 * Modules class file.
 *
 * @package VuloCart
 */

namespace VuloCart\RestAPI\Controllers;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Modules REST controller.
 *
 * `GET`/`POST /vulocart/v1/modules` — this exact shape (not a richer
 * per-module object, not separate `/activate`/`/deactivate` sub-routes)
 * is what @multivendorx/zyra's `ModuleGridComponent`/`initializeModules()`
 * actually call, verified against zyra's real build output and against
 * `vulopilot`'s own `Controllers/Settings.php::get_modules()`/
 * `set_modules()`, which implements the same contract: `GET` returns a
 * flat array of active module ids, `POST` takes `{ id, action }`
 * (`action` is `'activate'`|`'deactivate'`). The *available* module list
 * with names/descriptions/categories is static frontend config
 * (src/modules-config.ts) zyra's component takes as a prop — this
 * controller only ever reports/changes which ids are active.
 *
 * @class       Modules class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Modules extends \WP_REST_Controller {

    /**
     * REST base for this controller's routes.
     *
     * @var string
     */
    protected $rest_base = 'modules';

    /**
     * Registers this controller's REST routes.
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            VuloCart()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_items' ),
                    'permission_callback' => array( $this, 'permissions_check' ),
                ),
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'set_modules' ),
                    'permission_callback' => array( $this, 'permissions_check' ),
                ),
            )
        );
    }

    /**
     * Checks whether the current user can view/activate/deactivate modules.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return bool
     */
    public function permissions_check( $request ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found
        return current_user_can( 'manage_options' );
    }

    /**
     * Every currently active module's id — zyra's `initializeModules()`/
     * `useModules()` expect this exact flat-array shape.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response
     */
    public function get_items( $request ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found
        return rest_ensure_response( VuloCart()->modules->get_active_modules() );
    }

    /**
     * Activates or deactivates one module — the request shape zyra's
     * `ModuleGridComponent` actually sends (`{ id, action }`).
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function set_modules( $request ) {
        $module_id = sanitize_key( (string) $request->get_param( 'id' ) );
        $action    = sanitize_key( (string) $request->get_param( 'action' ) );

        if ( '' === $module_id ) {
            return new \WP_Error(
                'vulocart_missing_module_id',
                esc_html__( 'No module id given.', 'vulocart' ),
                array( 'status' => 400 )
            );
        }

        $result = 'activate' === $action
            ? VuloCart()->modules->activate_modules( array( $module_id ) )
            : VuloCart()->modules->deactivate_modules( array( $module_id ) );

        return rest_ensure_response( $result );
    }
}
