<?php
/**
 * AbstractServiceProvider class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Sdk;

defined( 'ABSPATH' ) || exit;

/**
 * Optional base class an extension can use to organize its own internal
 * service wiring — the same plain-array-container-with-lazy-factories
 * shape every plugin bootstrap in this codebase already uses
 * (php-wordpress.md's singleton/container pattern), extracted into a
 * reusable base rather than every extension re-deriving it. This is
 * deliberately NOT a PHP-DI/Symfony container — that would be new
 * dependency-injection tooling the root CLAUDE.md's "Out of scope" section
 * says to flag rather than introduce silently; this is the existing
 * pattern's own logic, just given a name an SDK consumer can extend.
 *
 * Nothing in VuloPilot core resolves anything through this — it exists
 * purely for an extension's own internal use inside its register()/
 * ExtensionInterface implementation, one instance per extension, not a
 * shared application-wide container.
 *
 * @class       AbstractServiceProvider class
 * @version     1.0.0
 * @author      MultiVendorX
 */
abstract class AbstractServiceProvider {

    /**
     * @var array<string, callable>
     */
    private array $factories = array();

    /**
     * @var array<string, mixed>
     */
    private array $resolved = array();

    /**
     * Registers this provider's services — call bind() here for
     * everything the extension wants resolvable through make().
     *
     * @return void
     */
    abstract public function register(): void;

    /**
     * @param string   $id      Service id.
     * @param callable $factory Called once, lazily, the first time make() asks for $id.
     * @return void
     */
    protected function bind( string $id, callable $factory ): void {
        $this->factories[ $id ] = $factory;
    }

    /**
     * @param string $id Service id previously bind()'d.
     * @return mixed
     * @throws \InvalidArgumentException When $id was never bind()'d.
     */
    public function make( string $id ) {
        if ( array_key_exists( $id, $this->resolved ) ) {
            return $this->resolved[ $id ];
        }

        if ( ! isset( $this->factories[ $id ] ) ) {
            throw new \InvalidArgumentException( esc_html( sprintf( 'No service registered for id "%s".', $id ) ) );
        }

        $this->resolved[ $id ] = ( $this->factories[ $id ] )();

        return $this->resolved[ $id ];
    }

    /**
     * @param string $id Service id.
     * @return bool
     */
    public function has( string $id ): bool {
        return isset( $this->factories[ $id ] );
    }
}
