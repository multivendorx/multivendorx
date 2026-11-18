# Service Container Pattern

## Overview

`notifima` (like every plugin in this workspace) does **not** use a dependency-injection container library. The plugin bootstrap uses the same hand-rolled shape as every other plugin in this workspace: a singleton with a plain PHP array as its "container," accessed through PHP's magic `__get`/`__set` methods.

## The pattern

```php
// classes/Notifima.php:21-76
class Notifima {
    private static $instance = null;
    private $container = array();

    public function __construct( $file ) {
        $this->container['plugin_url']  = trailingslashit( plugins_url( '', $file ) );
        $this->container['plugin_path'] = trailingslashit( dirname( $file ) );
        $this->container['version']     = NOTIFIMA_PLUGIN_VERSION;
        $this->container['rest_namespace'] = 'notifima/v1';
        // ...

        add_action( 'woocommerce_loaded', array( $this, 'init_plugin' ) );
    }

    public function init_classes() {
        $this->container['util']       = new Utill();
        $this->container['setting']    = new Setting();
        $this->container['frontend']   = new FrontEnd();
        // ...11 total services
    }

    public function __get( $class ) {
        if ( array_key_exists( $class, $this->container ) ) {
            return $this->container[ $class ];
        }
        return new \WP_Error( sprintf( 'Call to unknown class %s.', $class ) );
    }

    public function __set( $class, $value ) {
        $this->container[ $class ] = $value;
    }

    public static function init( $file ) {
        if ( null === self::$instance ) {
            self::$instance = new self( $file );
        }
        return self::$instance;
    }
}
```

The plugin's main file calls the global accessor function (`Notifima()`) exactly once (`product_stock_alert.php`). Everywhere else, reach services through it — `Notifima()->util->log(...)`, `Notifima()->setting->get_setting(...)` — rather than instantiating classes directly.

**Behavior note**: `__get()` (`classes/Notifima.php:245-251`) returns a `\WP_Error` object for an unrecognized key, the same as the free `multivendorx` plugin's equivalent — **not** a thrown `\Exception` like `multivendorx-pro`'s bootstrap. A `\WP_Error` instance is truthy in a plain boolean check, so `Notifima()->nonexistent_service` won't fail immediately or loudly; code that doesn't `is_wp_error()`-check the result before calling a method on it will get a less-clear fatal error further downstream. Worth knowing if you're debugging a container-key typo.

## No module system

Unlike `multivendorx`/`multivendorx-pro`/`catalogx-pro`, this plugin has **no `modules/` directory and no module loader** — `init_classes()` (`classes/Notifima.php:182-196`) unconditionally instantiates all 11 services every request; there's no active/inactive gating, no `Modules::load_active_modules()` equivalent, and no filter for a sibling plugin to register additional module search paths into. If a future feature needs to be independently toggleable, that would be new infrastructure for this plugin, not something that already exists here — see the parent repo's `.claude/rules/module-architecture.md` for what that pattern looks like elsewhere in the workspace, in case it's ever adopted here.

## No JS-side module registry either

`multivendorx`'s admin app resolves its per-module dashboard components through a `require.context` scan plus a zustand-backed `useModules` registry (see that plugin's own `docs/container.md` and `docs/integration/`). `notifima`'s admin app (`src/app.tsx`) has no equivalent — it's a flat, hardcoded tab switch (see [admin/dashboard.md](admin/dashboard.md)). The only client-side extension mechanism this plugin has is the three named `@wordpress/hooks` filters documented in [integration/pro-extension-points.md](integration/pro-extension-points.md) — a much smaller surface than a full module registry, appropriate to how much smaller this plugin's admin app is.
