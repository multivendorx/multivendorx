<?php
/**
 * Module class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Mcp;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart MCP Module.
 *
 * Same toggleable-addon shape as VuloCart\Cart\Module/VuloCart\Order\Module
 * (module-architecture.md), but deliberately minimal — there is no MCP
 * (Model Context Protocol) server to wire yet, so `init_classes()` has
 * nothing to construct. This module's entire real effect today is:
 *
 * 1. Making "MCP" a real, toggleable entry on the Modules page
 *    (src/modules-config.ts), instead of a settings-only concept.
 * 2. Gating `src/settings/Mcp.ts`'s `mcp_api_key` field
 *    (`moduleEnabled: 'mcp'`) — that field is locked (with an
 *    "Activate MCP" popup, zyra's InputRenderer) until this module is
 *    active, which is the replacement for the "Enable MCP server"
 *    Settings toggle that used to live there and duplicated this exact
 *    on/off state.
 *
 * When a real MCP server is built, its Frontend/Rest/`src/` pieces slot
 * into this same Module.php, same as Cart's own Install/Application/
 * Infrastructure/Rest layers were added incrementally on top of this
 * identical container shape.
 *
 * @class       Module class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Module {

    /**
     * Container for this module's own class instances — empty today,
     * kept for shape-parity with every other module's Module.php so
     * adding real classes later doesn't require restructuring this file.
     *
     * @var array
     */
    private $container = array();

    /**
     * Module constructor.
     */
    public function __construct() {
        $this->init_classes();
    }

    /**
     * Nothing to construct yet — see class docblock.
     *
     * @return void
     */
    public function init_classes() {}

    /**
     * Magic getter for this module's own container.
     *
     * @param string $class_name Container key to retrieve.
     * @return mixed
     * @throws \Exception If the requested key does not exist in the container.
     */
    public function __get( $class_name ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound
        if ( array_key_exists( $class_name, $this->container ) ) {
            return $this->container[ $class_name ];
        }

        throw new \Exception( sprintf( 'Call to unknown class %s.', esc_html( $class_name ) ) );
    }
}
