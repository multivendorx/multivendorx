# Settings system

## Storage

See [DATABASE](DATABASE.md)'s "Settings storage" section — one `wp_options` row per tab, keyed in `Utill::CATALOGX_SETTINGS`, read/written through `CatalogX()->setting` (`classes/Setting.php`).

## Declarative config, not hand-built forms

Each settings tab is a plain TS object under `src/components/Settings/*.ts` — an array of `{ key, type, label, settingDescription, options, dependent, proSetting, ... }` field descriptors, rendered by Zyra's `InputRenderer`. `src/services/templateService.ts`'s `getTemplateData('settings')` discovers every `.ts` file under `src/components/Settings/` via `require.context`, builds a folder tree (a `FolderPriority.ts` file in a subfolder sets that folder's sort order), and `Settings.tsx` renders the result through Zyra's `NavigatorComponent`.

Real tabs as of this writing:

| Tab (`headerTitle`) | File | Covers |
|---|---|---|
| Pages & Shortcodes | `pagesShortcodes.ts` | Which page hosts the enquiry cart / quote request / wholesale products; the shortcode reference list |
| Wholesale | `wholesale.ts` | Wholesale sign-up mode, coupon interaction, offer visibility, pricing mode — almost entirely `proSetting: true` |
| Access Rules | `exclusion.ts` | Per-feature (catalog/enquiry/quote) exclusion by role, user, product, category, tag or brand |
| System | `tools.ts` | Misc system settings, custom CSS |
| Enquiry & Quote | `customerEngagement.ts` | Store experience (catalog-only vs. buy mode), enquiry form behavior, WhatsApp enquiries, quote validity, PDF delivery |
| Email Customizer (3 files, `Email Customizer/`) | `enquiryEmailTemplate.ts`, `quoteEmailTemplate.ts`, `wholesaleEmailTemplate.ts` | Per-feature email template customization — Pro |
| Form Builder (2 files, `Form Builder/`) | `formCustomization.ts`, `wholesaleRegistration.ts` | Enquiry form field builder and wholesale registration form builder — the free tier only gets a fixed preview; the actual drag-and-drop builder is Pro |

A field marked `proSetting: true` renders but is disabled/overlaid with an upgrade prompt when the license isn't active (`Utill::is_khali_dabba()` on the PHP side, `appLocalizer.khali_dabba` on the JS side) — it is **not** hidden entirely, which matters if you're grepping for what's actually configurable in the free plugin versus what merely appears in the UI.

## Adding a new settings tab

Add a new `.ts` file under `src/components/Settings/` (or a new subfolder with its own `FolderPriority.ts` if it should sort as a group) exporting the same `{ id, priority, headerTitle, modal: [...] }` shape — no separate registration step is needed, `templateService.ts`'s `require.context` scan picks it up automatically. Register the backing option key in `Utill::CATALOGX_SETTINGS` so `CatalogX()->setting` knows to load/save it.
