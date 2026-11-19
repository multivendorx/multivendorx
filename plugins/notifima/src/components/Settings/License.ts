import { createElement } from 'react';
import { __ } from '@wordpress/i18n';
import LicensePanel from '../License/LicensePanel';

/**
 * Settings → License. Formerly Notifima Pro's own "License" submenu. The form comes from Notifima Pro
 * (`appLocalizer.pro_data.license`, built by LicenseManager::get_settings_form_data()) and posts to options.php
 * exactly as the old page did; without Pro the tab says what Pro adds and how to get it.
 */
export default {
	id: 'license',
	priority: 4,
	headerTitle: __('License', 'notifima'),
	headerDescription: __(
		'Activate Notifima Pro on this site with your license key.',
		'notifima'
	),
	headerIcon: 'lock',
	hideSettingHeader: true,
	submitUrl: 'settings',
	modal: [],
	PanelComponent: () => createElement(LicensePanel),
};
