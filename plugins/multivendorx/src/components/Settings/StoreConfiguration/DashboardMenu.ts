import { __ } from '@wordpress/i18n';

export default {
	id: 'dashboard-menu',
	priority: 4,
	headerTitle: __('Dashboard Menu', 'multivendorx'),
	headerDescription: __(
		'Choose which menus to show or hide in the store dashboard and arrange their display order.',
		'multivendorx'
	),
	headerIcon: 'menu-manager',
	submitUrl: 'settings',
	modal: [
		{
			key: 'menu_manager',
			type: 'endpoint-editor',
			apiLink: 'endpoints',
		},
	],
};
