# Moodle connection

## One class, one method, every Moodle call

Every outbound call to a Moodle site funnel through `classes/ExternalService.php::do_request()`. There's no scattered `wp_remote_post()` elsewhere in this plugin calling Moodle directly — if you're adding a new Moodle web-service call, add it here, not inline in whichever class needs it.

```php
public function do_request( $function_key = '', $request_args = array() ) {
    $moodle_core_functions = $this->get_registered_core_functions();
    // ... validates $function_key exists, reads moodle_url + moodle_access_token
    // from MooWoodle()->setting, builds the request URL, wp_remote_post()s it.
}
```

## Registered core functions

`get_registered_core_functions()` maps a short internal key to the real Moodle web-service function name, filterable via `moowoodle_registered_core_functions`:

```php
array(
    'get_site_info'    => 'core_webservice_get_site_info',
    'get_categories'   => 'core_course_get_categories',
    'get_courses'      => 'core_course_get_courses',
    'get_moodle_users' => 'core_user_get_users',
    'create_users'     => 'core_user_create_users',
    'update_users'     => 'core_user_update_users',
    'delete_users'     => 'core_user_delete_users',
    'enrol_users'      => 'enrol_manual_enrol_users',
    'unenrol_users'    => 'enrol_manual_unenrol_users',
)
```

Add a new Moodle function by extending this list via the filter, then call it with `do_request( 'your_key', $args )` — don't hardcode a new `wsfunction` string at the call site.

## Credentials

`moodle_url` and `moodle_access_token` are read from `MooWoodle()->setting` (configured by the site owner under **Settings → Connection & Access** — see [SETTINGS-SYSTEM](SETTINGS-SYSTEM.md)). If either is empty, `do_request()` returns a `WP_Error` rather than attempting the call.

## Logging

When `MooWoodle()->show_advanced_log` is enabled, every request URL, its arguments, and the raw response are written via `MooWoodle()->util->log()` — useful when debugging why a sync silently did nothing, since Moodle web-service errors often come back as a 200 response with an `exception`/`errorcode` field in the body rather than a non-200 HTTP status.
