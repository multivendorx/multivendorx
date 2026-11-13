# Settings system

## Storage

See [DATABASE](DATABASE.md)'s "Settings storage" section — one `wp_options` row per tab, keyed in `Util::MOOWOODLE_SETTINGS`, read/written through `MooWoodle()->setting` (`classes/Setting.php`).

## Declarative config, not hand-built forms

Both the **Settings** tab and the separate **Synchronization** tab are built the same way: a plain TS object per sub-tab under `src/components/Settings/*.ts` or `src/components/Synchronization/*.ts` — an array of `{ key, type, label, settingDescription, options, dependent, proSetting, ... }` field descriptors, rendered by Zyra's `InputRenderer`. `src/services/templateService.ts`'s `getTemplateData()` discovers the files via `require.context` and feeds them to Zyra's `NavigatorComponent` — the same pattern `multivendorx` and `catalogx` use.

## Real tabs today

| Tab | File | Covers |
|---|---|---|
| Connection & Access | `Settings/connectionAccess.ts` | Moodle site URL, access token, test connection; Single Sign-On (mostly Pro) |
| Course & Enrollment | `Settings/courseEnrollment.ts` | Shop-page course duration display, "My Course" menu position, classroom/group purchase and seat reassignment (Pro), gifting (Pro), registration email notice |
| System & Logs | `Settings/systemAndLogs.ts` | Connection timeout, automatic sync frequency, advanced logging |

**Note:** `Util::MOOWOODLE_SETTINGS` registers six logical setting groups (`notification`, `synchronize-course`, `synchronize-user`, `connection-access`, `course-enrollment`, `system-logs`), but only three have a dedicated **Settings** tab UI today — `notification` is folded into Course & Enrollment's registration-email toggle rather than its own tab. Don't assume a 1:1 mapping between the constant list and the visible tab list without checking both.

The separate **Synchronization** admin page (its own top-level menu item, not a Settings sub-tab) has its own three sub-tabs:

| Sub-tab | File | Covers |
|---|---|---|
| Courses | `Synchronization/courses.ts` | Course field mapping (categories, SKU, image, group — mostly Pro), whether new products are created alongside synced courses, on-demand course handling |
| Cohorts | `Synchronization/cohort.ts` | Cohort↔product synchronization — Pro |
| Users | `Synchronization/user.ts` | Sync direction, role mapping, profile field mapping, real-time profile sync — mostly Pro |

A field marked `proSetting: true` renders but is disabled/overlaid with an upgrade prompt when the license isn't active (`Util::is_khali_dabba()` on the PHP side, `appLocalizer.khali_dabba` on the JS side) — it is **not** hidden entirely.

## Adding a new settings tab

Add a new `.ts` file under `src/components/Settings/` or `src/components/Synchronization/`, exporting the same `{ id, priority, headerTitle, modal: [...] }` shape — `templateService.ts`'s `require.context` scan picks it up automatically. Register the backing option key in `Util::MOOWOODLE_SETTINGS` so `MooWoodle()->setting` knows to load/save it.
