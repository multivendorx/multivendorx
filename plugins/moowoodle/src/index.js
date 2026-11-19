import { jsx as _jsx } from "react/jsx-runtime";
/* global appLocalizer */
import { createRoot } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import App from './app';
import { configureZyra } from '@zyra/core';
configureZyra(appLocalizer);
/**
 * Mounts the admin app into `#admin-main-wrapper` (printed by Admin::create_settings_page()).
 *
 * Runs as a jQuery ready handler, not when the script is evaluated, so MooWoodle Pro's bundle has always registered its
 * `addFilter()` calls (table props, settings context) before the first render reads them with `applyFilters()`,
 * whatever order WordPress prints the two scripts in.
 *
 * It must be a jQuery ready handler (queued after wp-admin/js/common.js's), not a plain `DOMContentLoaded` listener:
 * common.js moves every `.notice` after the first `.wrap h1, .wrap h2` on ready. zyra's HeaderComponent moves the
 * notices into its `.notice-wrapper.wrap`, so if React mounts first, that heading can be one inside a notice (e.g. the
 * VuloMail notice's `<h2>`). jQuery then throws a HierarchyRequestError and every notice is lost from the page.
 */
function mount() {
    const root = document.getElementById('admin-main-wrapper');
    if (root) {
        createRoot(root).render(_jsx(BrowserRouter, { children: _jsx(App, {}) }));
    }
}
const { jQuery } = window;
if (jQuery) {
    jQuery(mount);
}
else if ('loading' === document.readyState) {
    document.addEventListener('DOMContentLoaded', mount);
}
else {
    mount();
}
//# sourceMappingURL=index.js.map