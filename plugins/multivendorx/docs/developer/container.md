# Service Container Pattern

## Overview

`multivendorx` (like every plugin in this workspace) does **not** use a dependency-injection container library (no `league/container`, no PSR-11). Instead, the plugin bootstrap and every module is the same hand-rolled shape: a singleton with a plain PHP array as its "container," accessed through PHP's magic `__get`/`__set` methods.

## The pattern

```php
// classes/MultiVendorX.php
class MultiVendorX {
    private static $instance = null;
    private $container = array();

    public function __construct( $file ) {
        $this->container['plugin_url']     = trailingslashit( plugins_url( '', $file ) );
        $this->container['plugin_path']    = trailingslashit( dirname( $file ) );
        $this->container['version']        = MULTIVENDORX_PLUGIN_VERSION;
        $this->container['rest_namespace'] = 'multivendorx/v1';
        // ...

        add_action( 'init', array( $this, 'init_classes' ), 0 );
    }

    public function init_classes() {
        $this->container['util']     = new Utill();
        $this->container['setting']  = new Setting();
        $this->container['admin']    = new Admin();
        // ...25 total services
        do_action( 'multivendorx_loaded' );
    }

    public function __get( $class_name ) {
        if ( array_key_exists( $class_name, $this->container ) ) {
            return $this->container[ $class_name ];
        }
        return new \WP_Error( sprintf( 'Call to unknown class %s.', $class_name ) );
    }

    public function __set( $class_name, $value ) {
        $this->container[ $class_name ] = $value;
    }

    public static function init( $file ) {
        if ( null === self::$instance ) {
            self::$instance = new self( $file );
        }
        return self::$instance;
    }
}
```

The plugin's main file calls the global accessor function (`MultiVendorX()`) exactly once. Everywhere else, reach services through it — `MultiVendorX()->util->log(...)`, `MultiVendorX()->setting->get_setting(...)` — rather than instantiating classes directly.

**Behavior note**: unlike `multivendorx-pro`'s bootstrap (which `throw`s a `\Exception` for an unknown container key), this plugin's `__get()` **returns a `\WP_Error` object** for an unrecognized key instead of throwing. A `\WP_Error` instance is truthy in a plain boolean check — so `MultiVendorX()->nonexistent_service` won't immediately fail loudly; code that doesn't explicitly `is_wp_error()`-check the result before calling a method on it will get a fatal error further downstream (an ambiguous "call to a member function on WP_Error" rather than a clear "unknown class" message). Worth knowing if you're debugging a container-key typo — the failure surfaces later and less clearly than in the Pro plugin's equivalent.

## Modules follow the same shape

Every module's `Module.php` (see the parent repo's `.claude/rules/module-architecture.md` for the loading mechanism) uses the identical singleton + container shape — a module is never a special case of this pattern, just another instance of it.

## `zyra`'s module registry: the one exception

The shared `zyra` package (`multivendorx/packages/js/zyra`) has a JS-side equivalent for *client-side* module-active state — not a PHP container, but conceptually parallel: a small **zustand** store (`useModules`, `zyra/src/contexts/ModuleContext.tsx`), populated by `initializeModules(pluginName, pluginSlug, apiLink)`. It's gated behind a `localStorage` flag (`force_{pluginName}_context_reload`) rather than fetching on every page load:

```ts
export async function initializeModules(pluginName, pluginSlug, apiLink) {
    if (localStorage.getItem(`force_${pluginName}_context_reload`) === 'true') {
        const response = await axios.get(getApiLink(ZyraVariable, apiLink), {
            headers: { 'X-WP-Nonce': ZyraVariable.nonce },
        });
        if (Array.isArray(response.data)) {
            useModules.setState({ modules: response.data });
        }
        if (pluginSlug === 'pro') {
            localStorage.setItem(`force_${pluginName}_context_reload`, 'false');
        }
    }
}
```

Called once per plugin from its own `src/index.tsx` (`initializeModules('multivendorx', 'free', 'modules')`) — there is no Redux and no `@wordpress/data` store anywhere in this codebase; this zustand store is the one piece of client-side global state management outside plain React Context.
