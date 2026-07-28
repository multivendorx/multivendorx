<?php
/**
 * ServiceContainer class file.
 *
 * @package VuloCart
 */

namespace VuloCart;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart ServiceContainer class.
 *
 * A minimal bind/make dependency-injection container — deliberately
 * distinct from VuloCart::$container (the plain array every plugin
 * bootstrap in this codebase already uses for config values and eagerly-
 * constructed service instances, see php-wordpress.md). That array is a
 * service *locator*; this class is the actual seam the vision's "storage
 * engine is replaceable" principle needs: VuloCart::init_classes() binds
 * `Domain\Asset\AssetRepositoryInterface` to a closure building
 * `Infrastructure\Database\WPDBAssetRepository`, and `Application\AssetService`
 * only ever asks this container for that interface — never `new`s the
 * concrete repository itself. Swapping the storage engine later (e.g. a
 * future non-`$wpdb` implementation) is a one-line change to that single
 * binding, not a search-and-replace across every consumer.
 *
 * Kept intentionally small — no autowiring/reflection, no tagging. The
 * rest of this codebase's services (module registries, REST dispatchers)
 * still use plain constructor injection wired by hand in init_classes(),
 * matching every sibling plugin; this container exists for the one seam
 * above, not to replace that pattern wholesale.
 *
 * @class       ServiceContainer class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ServiceContainer {

    /**
     * Registered factories, keyed by the service id (usually an interface
     * name) they resolve.
     *
     * @var array<string, callable>
     */
    private array $bindings = array();

    /**
     * Abstracts that resolve to one shared instance instead of a fresh one
     * per make() call, once resolved.
     *
     * @var array<string, bool>
     */
    private array $shared = array();

    /**
     * Already-resolved shared instances, keyed the same as $bindings.
     *
     * @var array<string, mixed>
     */
    private array $instances = array();

    /**
     * Registers a factory that runs fresh on every make() call.
     *
     * @param string   $service_id Interface or class name being bound.
     * @param callable $factory  Builds and returns a concrete instance.
     * @return void
     */
    public function bind( string $service_id, callable $factory ): void {
        $this->bindings[ $service_id ] = $factory;
        unset( $this->shared[ $service_id ], $this->instances[ $service_id ] );
    }

    /**
     * Registers a factory whose result is built once and reused for every
     * subsequent make() call — what VuloCart::init_classes() uses for
     * AssetRepositoryInterface, since a repository is safe (and cheap) to
     * share for the lifetime of one request.
     *
     * @param string   $service_id Interface or class name being bound.
     * @param callable $factory  Builds and returns a concrete instance.
     * @return void
     */
    public function singleton( string $service_id, callable $factory ): void {
        $this->bind( $service_id, $factory );
        $this->shared[ $service_id ] = true;
    }

    /**
     * Resolves a bound service id to its concrete instance.
     *
     * @param string $service_id Interface or class name to resolve.
     * @return mixed
     * @throws \Exception If nothing has been bound for $service_id.
     */
    public function make( string $service_id ) {
        if ( isset( $this->instances[ $service_id ] ) ) {
            return $this->instances[ $service_id ];
        }

        if ( ! isset( $this->bindings[ $service_id ] ) ) {
            throw new \Exception( sprintf( 'Nothing bound for %s.', esc_html( $service_id ) ) );
        }

        $instance = ( $this->bindings[ $service_id ] )();

        if ( ! empty( $this->shared[ $service_id ] ) ) {
            $this->instances[ $service_id ] = $instance;
        }

        return $instance;
    }
}
