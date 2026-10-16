# REST API

Namespace: `moowoodle/v1` (`MooWoodle()->rest_namespace`, set once in `classes/MooWoodle.php`). Never hardcode the string.

## Plugin-level dispatcher

`classes/RestAPI/Rest.php` builds a container of every controller and loops it on `rest_api_init` — there's no module-level REST in this plugin (no module system to split it across).

| Controller | `rest_base` | Covers |
|---|---|---|
| `Settings` | `settings` | Read/write the settings tabs |
| `Logs` | `logs`, `logs/download` | View and download the plugin's log file |
| `Synchronization` | `synchronization` | Read/write the synchronization-tab settings; trigger a sync |
| `Courses` | `courses` | List synced courses, trigger per-course/bulk sync actions |
| `MyCourses` | `my-courses` | The customer-facing "my courses" list |
| `TestConnection` | `test-connection` | Validate the configured Moodle URL/token by calling `core_webservice_get_site_info` |

## Permission pattern

Every route has a real `permission_callback`. Permission-callback method names in this plugin are prefixed `moowoodle_` (e.g. `moowoodle_permissions_check`, `moowoodle_get_items_permissions_check`, `moowoodle_create_item_permissions_check`) — a deliberate convention applied consistently across every controller, in place of `WP_REST_Controller`'s own unprefixed naming suggestion.

## Errors

Return `WP_Error` from callbacks on failure; log unexpected exceptions via `Util::server_error( $e )` rather than `error_log()` directly.

## Not REST: the Moodle side

None of the above talks to Moodle directly — they read/write WordPress-side data (settings, synced course rows, log files). The actual Moodle web-service calls go through `ExternalService::do_request()` — see [MOODLE-CONNECTION](MOODLE-CONNECTION.md). `TestConnection`'s controller is the one REST route that calls into it synchronously, to validate credentials.
