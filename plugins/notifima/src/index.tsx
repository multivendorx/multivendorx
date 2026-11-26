/* global appLocalizer */
import { createRoot } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import App from './app';
import DeactivationPopup from './components/DeactivationPopup/DeactivationPopup';
import EmailLogs from './components/EmailLogs/EmailLogs';
import DeactivateConfirmPopup from './components/VuloForm/DeactivateConfirmPopup';
import { configureZyra } from '@zyra/core';

// appLocalizer is only localized onto this bundle on Notifima's own settings page
// (Admin::enqueue_admin_assets) - on the Plugins screen (DeactivationPopup's mount point),
// referencing the bare, undeclared global would throw a ReferenceError and abort this whole
// script before the popup's own mount code below ever ran.
if ( typeof appLocalizer !== 'undefined' ) {
    configureZyra( appLocalizer );
}

/**
 * Mounts the admin app into `#admin-main-wrapper` (printed by Admin::create_setting_page()).
 *
 * Runs as a jQuery ready handler, not when the script is evaluated, so Notifima Pro's bundle has always registered its
 * `addFilter()` calls (table props) before the first render reads them with `applyFilters()`, whatever order WordPress
 * prints the two scripts in.
 *
 * It must be a jQuery ready handler (queued after wp-admin/js/common.js's), not a plain `DOMContentLoaded` listener:
 * common.js moves every `.notice` after the first `.wrap h1, .wrap h2` on ready. zyra's HeaderComponent moves the
 * notices into its `.notice-wrapper.wrap`, so if React mounts first, that heading can be one inside a notice. jQuery
 * then throws a HierarchyRequestError and every notice is lost from the page.
 */
function mount() {
	const root = document.getElementById('admin-main-wrapper');

	if (root) {
		createRoot(root).render(
			<BrowserRouter>
				<App />
			</BrowserRouter>
		);
	}

	const emailLogsRoot = document.getElementById('notifima-email-logs');

	if (emailLogsRoot) {
		createRoot(emailLogsRoot).render(<EmailLogs />);
	}

	const vuloformDeactivateRoot = document.getElementById(
		'notifima-vuloform-deactivate-root'
	);

	if (vuloformDeactivateRoot) {
		createRoot(vuloformDeactivateRoot).render(<DeactivateConfirmPopup />);
	}

	// Plugins-screen deactivation popup - separate mount point, printed only on that page
	// (Tracker::wrap_deactivate_link), never alongside admin-main-wrapper.
	const deactivationPopupRoot = document.getElementById('notifima-deactivation-popup');

	if (deactivationPopupRoot) {
		createRoot(deactivationPopupRoot).render(<DeactivationPopup />);
	}
}

const { jQuery } = window as Window & {
	jQuery?: (callback: () => void) => unknown;
};

if (jQuery) {
	jQuery(mount);
} else if ('loading' === document.readyState) {
	document.addEventListener('DOMContentLoaded', mount);
} else {
	mount();
}
