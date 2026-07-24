import { __ } from '@wordpress/i18n';

export default {
	id: 'accessibility',
	priority: 4,
	headerTitle: __('Accessibility', 'vulopilot'),
	headerIcon: 'universal-access-alt',
	submitUrl: 'settings',
	modal: [
		{
			key: 'enable_accessibility_scanning',
			type: 'checkbox',
			look: 'toggle',
			label: __('Enable accessibility scanning', 'vulopilot'),
			desc: __(
				'Turns every category "accessibility" scanner on or off.',
				'vulopilot'
			),
			options: [
				{ key: 'enabled', label: '', value: 'enabled' },
			],
		},
	],
};
