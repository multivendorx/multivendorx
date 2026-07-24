import { __ } from '@wordpress/i18n';

/**
 * Informational only — VuloPilot Pro's license gating/activation flow
 * (License\LicenseManager, `check_pro_active()`) isn't built yet, per
 * VuloPilotPro.php's own docblock (ARCHITECTURE.md's "What's deliberately
 * NOT here yet"). Rather than fabricate a license-key field with no
 * activation flow behind it, this tab is honest about what exists today.
 */
export default {
	id: 'pro-upgrade',
	priority: 3,
	headerTitle: __('License & Pro Upgrade', 'vulopilot'),
	headerIcon: 'star-filled',
	submitUrl: 'settings',
	modal: [
		{
			key: 'pro_upgrade_notice',
			type: 'notice',
			label: '',
			noticeType: 'info',
			message: __(
				'VuloPilot Pro licensing/activation isn\'t available yet — there\'s nothing to enter a license key for on this install. Check back in a future update.',
				'vulopilot'
			),
		},
	],
};
