import { __ } from '@wordpress/i18n';

/**
 * Settings → License. Formerly MultiVendorX Pro's own "License" submenu. The form comes from MultiVendorX Pro
 * (`appLocalizer.pro_data.license`, built by LicenseManager::get_settings_form_data()) and posts to options.php
 * exactly as the old page did; without Pro the tab says how to get it. Settings.tsx draws it (LicensePanel).
 */
export default {
	id: 'license',
	priority: 15,
	headerTitle: __('License', 'multivendorx'),
	headerDescription: __(
		'Activate MultiVendorX Pro on this site with your license key.',
		'multivendorx'
	),
	headerIcon: 'lock',
	hideSettingHeader: true,
	submitUrl: 'settings',
	modal: [],
};
