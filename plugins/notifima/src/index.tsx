/* global appLocalizer */
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import App from './app';
import DeactivationPopup from './components/DeactivationPopup/DeactivationPopup';
import { configureZyra } from '@zyra/core';

// appLocalizer is only localized onto this bundle on Notifima's own settings page
// (Admin::enqueue_admin_assets) - on the Plugins screen (DeactivationPopup's mount point),
// referencing the bare, undeclared global would throw a ReferenceError and abort this whole
// script before the popup's own mount code below ever ran.
if ( typeof appLocalizer !== 'undefined' ) {
    configureZyra( appLocalizer );
}

const adminWrapper = document.getElementById( 'admin-main-wrapper' );
if ( adminWrapper ) {
    render(
        <BrowserRouter>
            <App />
        </BrowserRouter>,
        adminWrapper
    );
}

// Plugins-screen deactivation popup - separate mount point, printed only on that page
// (Tracker::wrap_deactivate_link), never alongside admin-main-wrapper.
const deactivationPopupRoot = document.getElementById( 'notifima-deactivation-popup' );
if ( deactivationPopupRoot ) {
    render( <DeactivationPopup />, deactivationPopupRoot );
}
