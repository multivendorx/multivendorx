import { __ } from '@wordpress/i18n';

/**
 * Informational only — VuloPilot doesn't have its own capability system
 * yet (every REST route here checks the built-in `manage_options`
 * capability; the `manage_vulopilot` capability ARCHITECTURE.md's
 * cross-cutting design section describes is aspirational, not built).
 * Rather than fabricate role/permission toggles with nothing real behind
 * them, this tab is honest about what exists today.
 */
export default {
	id: 'permissions',
	priority: 2,
	headerTitle: __('Permissions', 'vulopilot'),
	headerIcon: 'admin-users',
	submitUrl: 'settings',
	modal: [
		{
			key: 'permissions_notice',
			type: 'notice',
			label: '',
			noticeType: 'info',
			message: __(
				'VuloPilot doesn\'t have its own roles/permissions system yet — every screen and REST endpoint here requires the site\'s built-in "manage_options" capability (site administrators).',
				'vulopilot'
			),
		},
	],
};
