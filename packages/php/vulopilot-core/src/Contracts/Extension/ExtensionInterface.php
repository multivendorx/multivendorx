<?php
/**
 * ExtensionInterface file.
 *
 * @package VuloPilotCore
 */

namespace VuloPilotCore\Contracts\Extension;

/**
 * The top-level contract for a VuloPilot extension — vulopilot-pro, or any
 * third-party plugin, registered via the `vulopilot_extension_sources`
 * filter (Sdk\ExtensionManager). An extension is a coherent *bundle*: it
 * doesn't scan/rule/automate/report anything itself — register() is where
 * it calls `add_filter('vulopilot_scanner_sources', ...)` and the other
 * existing per-concern filters (SCANNERS.md, RULE-ENGINE.md, ARCHITECTURE.md's
 * "Extension system = the discovery-by-filter mechanism itself") to add its
 * own scanners/rules/automation pieces/report types/AI providers. This
 * interface adds exactly what those lower-level filters don't have on
 * their own: a stable identity, a version, and a declared minimum
 * VuloPilot version so ExtensionManager can gate registration on real
 * compatibility instead of assuming every registered class is safe to run
 * against any installed core version.
 *
 * @class       ExtensionInterface interface
 * @version     1.0.0
 * @author      MultiVendorX
 */
interface ExtensionInterface {

    /**
     * @return string Unique, stable extension id.
     */
    public function get_id(): string;

    /**
     * @return string Human-readable name.
     */
    public function get_name(): string;

    /**
     * @return string This extension's own version, e.g. '1.2.0'.
     */
    public function get_version(): string;

    /**
     * @return string Lowest core VuloPilot version this extension is known to work against, e.g. '1.1.0'.
     */
    public function get_minimum_vulopilot_version(): string;

    /**
     * Called once, only after ExtensionManager has confirmed
     * get_minimum_vulopilot_version() is satisfied by the running core
     * version — everything this extension does (registering scanners,
     * rules, automation triggers/actions, report types/exporters, AI
     * providers, REST controllers, CLI commands) happens here or in
     * classes this method wires up.
     *
     * @return void
     */
    public function register(): void;
}
