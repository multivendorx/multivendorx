<?php
/**
 * Module class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Cart;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Cart Module.
 *
 * The vision: an independent Cart Engine, its own toggleable module
 * (`modules/Cart/Module.php`), discovered and instantiated only by
 * VuloCart's own `Modules` loader (module-architecture.md), never
 * constructed directly anywhere in this codebase — same pattern
 * `vulocart-pro`'s Passport module already establishes, just with the
 * fuller Domain/Application/Infrastructure/Rest layering Cart's own
 * business complexity earns (unlike Passport's flatter single-Util
 * shape — module-architecture.md: "no fixed contract... decide
 * per-feature").
 *
 * No cross-module dependency to defer here (unlike Order\Module, which
 * needs Cart's own service to already exist) — `offering_service` is
 * constructed eagerly in `VuloCart::init_classes()` *before* any module
 * loads, so this module can wire everything synchronously in its own
 * constructor.
 *
 * @class       Module class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Module {

    /**
     * Container for this module's own class instances.
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
     * Constructs this module's own classes and registers its service on
     * the main plugin container (`VuloCart()->cart_service`) so sibling
     * modules (Order\Module) and the core plugin can reach it the same
     * way they reach any other core service.
     *
     * @return void
     */
    public function init_classes() {
        $this->container['install'] = new Install();

        VuloCart()->service_container->singleton(
            Domain\CartRepositoryInterface::class,
            function () {
                return new Infrastructure\WPDBCartRepository();
            }
        );

        $this->container['service'] = new Application\CartService(
            VuloCart()->service_container->make( Domain\CartRepositoryInterface::class ),
            VuloCart()->offering_service,
            VuloCart()->event_dispatcher
        );

        VuloCart()->cart_service = $this->container['service'];

        $this->container['rest']    = new Rest();
        $this->container['cleanup'] = new Application\CartCleanupScheduler( $this->container['service'] );
    }

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
