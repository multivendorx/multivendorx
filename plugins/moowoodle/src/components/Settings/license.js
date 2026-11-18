import { createElement } from 'react';
import { __ } from '@wordpress/i18n';
import LicensePanel from '../License/LicensePanel';
/**
 * Settings → License. Formerly MooWoodle Pro's own "License" submenu. The form comes from MooWoodle Pro
 * (`appLocalizer.pro_data.license`, built by LicenseManager::get_settings_form_data()) and posts to options.php
 * exactly as the old page did; without Pro the tab says how to get it.
 */
export default {
    id: 'license',
    priority: 4,
    headerTitle: __('License', 'moowoodle'),
    headerDescription: __('Activate MooWoodle Pro on this site with your license key.', 'moowoodle'),
    headerIcon: 'lock',
    hideSettingHeader: true,
    submitUrl: 'settings',
    modal: [],
    PanelComponent: () => createElement(LicensePanel),
};
//# sourceMappingURL=license.js.map