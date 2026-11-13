import { __ } from '@wordpress/i18n';

export default {
	id: 'modules',
	priority: 12,
	headerTitle: __('Modules', 'multivendorx'),
	headerDescription: __(
		'Manage marketplace features by enabling or disabling modules. Turning a module on activates its settings and workflows, while turning it off hides them from admin and stores.',
		'multivendorx'
	),
	headerIcon: 'module',
	submitUrl: 'settings',
	modal: [],
};
