import { __ } from '@wordpress/i18n';

export default {
	id: 'security',
	priority: 1,
	headerTitle: __('Security', 'vulopilot'),
	headerIcon: 'shield',
	submitUrl: 'settings',
	modal: [
		{
			key: 'enable_rest_api_scanner',
			type: 'checkbox',
			look: 'toggle',
			label: __('Check for anonymous REST API user exposure', 'vulopilot'),
			desc: __(
				'Makes a real, unauthenticated request to this site\'s own /wp/v2/users endpoint during each scan to check whether it exposes usernames. Turn off if your firewall/WAF flags this request.',
				'vulopilot'
			),
			options: [
				{ key: 'enabled', label: '', value: 'enabled' },
			],
		},
	],
};
