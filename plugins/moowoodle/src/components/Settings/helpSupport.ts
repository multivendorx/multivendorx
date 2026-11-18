import { createElement } from 'react';
import { __ } from '@wordpress/i18n';
import HelpSupport from '../HelpSupport/HelpSupport';

/**
 * Settings → Help & Support. Formerly its own MooWoodle submenu; the old `#&tab=help-support` link opens this tab
 * (see app.tsx). The navigator prints the title, so the screen is drawn without its own header.
 */
export default {
	id: 'help-support',
	priority: 5,
	headerTitle: __('Help & Support', 'moowoodle'),
	headerDescription: __(
		'Guides, videos and the people behind MooWoodle, all in one place.',
		'moowoodle'
	),
	headerIcon: 'customer-support',
	hideSettingHeader: true,
	submitUrl: 'settings',
	modal: [],
	PanelComponent: () => createElement(HelpSupport, { embedded: true }),
};
