import { createElement } from 'react';
import { __ } from '@wordpress/i18n';
import LicensePanel from '../License/LicensePanel';

/**
 * Settings → License. Formerly CatalogX Pro's own "License" submenu. The form comes from CatalogX Pro
 * (`appLocalizer.pro_data.license`, built by LicenseManager::get_settings_form_data()) and posts to options.php
 * exactly as the old page did; without Pro the tab says how to get it.
 */
export default {
	id: 'license',
	priority: 13,
	headerTitle: __('License', 'catalogx'),
	headerDescription: __(
		'Activate CatalogX Pro on this site with your license key.',
		'catalogx'
	),
	headerIcon: 'lock',
	hideSettingHeader: true,
	submitUrl: 'settings',
	modal: [],
	PanelComponent: () => createElement(LicensePanel),
};
