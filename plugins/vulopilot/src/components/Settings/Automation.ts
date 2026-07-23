import { __ } from '@wordpress/i18n';

export default {
	id: 'automation',
	priority: 4,
	headerTitle: __('Automation', 'vulopilot'),
	headerIcon: 'automation',
	submitUrl: 'settings',
	modal: [
		{
			key: 'automation_cooldown_minutes',
			type: 'number',
			label: __('Automation cooldown (minutes)', 'vulopilot'),
			minNumber: 1,
			maxNumber: 1440,
			desc: __(
				'How long an automation must wait after last firing before it can fire again — guards against the same automation re-triggering on every scan or every save of the same object.',
				'vulopilot'
			),
		},
	],
};
