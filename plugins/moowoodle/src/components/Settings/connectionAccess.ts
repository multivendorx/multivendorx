/* global appLocalizer */
import { FontSizePicker } from '@wordpress/block-editor';
import { __, sprintf } from '@wordpress/i18n';

export default {
	id: 'connection-access',
	priority: 1,
	headerTitle: __('Connection & Access', 'moowoodle'),
	headerDescription: __(
		'Effortlessly configure and verify your WordPress-Moodle connection.',
		'moowoodle'
	),
	headerIcon: 'setting',
	submitUrl: 'settings',
	modal: [
		{
			key: 'moodle_url',
			type: 'text',
			desc: __(
				'Provide the URL of your Moodle site where the course will be hosted. Students will receive access to the course content on that site.',
				'moowoodle'
			),
			size: 25,
			label: __('Moodle site URL', 'moowoodle'),
		},
		{
			key: 'moodle_access_token',
			type: 'text',
			size: 25,
			label: __('Moodle access token', 'moowoodle'),
			desc: sprintf(
				/* translators: %s: URL to Moodle token page */
				__(
					'Enter Moodle access token. You can generate the access token from <a href="%s" target="_blank" rel="noreferrer">here</a>. <br>Navigation: Dashboard → Site administration → Server → Manage tokens.',
					'moowoodle'
				),
				appLocalizer.moodle_site_url + 'admin/webservice/tokens.php'
			),
		},
		{
			key: 'test_connection',
			type: 'sequential-task-executor',
			apilink: 'test-connection',
			action: 'get_site_info',
			buttonText: 'Start Test',
			buttonIcon: 'centralized-connections',
			interval: 2500,
			successMessage: __('Connection test passed!', 'moowoodle'),
			failureMessage: __('Connection test failed!', 'moowoodle'),
			label: __('MooWoodle test connection', 'moowoodle'),
			tasks: [
				{
					action: 'get_site_info',
					message: __('Connecting to Moodle', 'moowoodle'),
				},
				{
					action: 'get_courses',
					message: __('Courses Fetch', 'moowoodle'),
				},
				{
					action: 'get_categories',
					message: __('Category Fetch', 'moowoodle'),
				},
				{
					action: 'create_users',
					message: __('User Creation', 'moowoodle'),
				},
				{
					action: 'get_users',
					message: __('User Fetch', 'moowoodle'),
				},
				{
					action: 'update_users',
					message: __('User Update', 'moowoodle'),
					previousResponseData: ['get_users'],
				},
				{
					action: 'enroll_users',
					message: __('User Enroll', 'moowoodle'),
					previousResponseData: ['get_users', 'get_courses'],
				},
				{
					action: 'unenroll_users',
					message: __('User Unenroll', 'moowoodle'),
					previousResponseData: ['get_users', 'get_courses'],
				},
				{
					action: 'delete_users',
					message: __('User Remove', 'moowoodle'),
					previousResponseData: ['get_users'],
				},
			],
		},
		{
			key: 'moowoodle_sso_enable',
			type: 'checkbox',
			desc: __(
				'Enabling this option allows users to access Moodle courses directly, bypassing the need for login.',
				'moowoodle'
			),
			label: __('Single Sign On', 'moowoodle'),
			options: [
				{
					key: 'moowoodle_sso_enable',
					value: 'moowoodle_sso_enable',
				},
			],
			proSetting: true,
			look: 'toggle',
		},
		{
			key: 'moowoodle_sso_secret_key',
			type: 'text',
			desc: sprintf(
				/* translators: %s: URL to Moodle SSO settings page */
				__(
					'Generate a unique SSO secret key (must be at least 8 characters) and copy it. Then, go to your Moodle site and paste the copied SSO key <a href="%s" target="_blank" rel="noreferrer">there</a>.',
					'moowoodle'
				),
				appLocalizer.moodle_site_url +
					'admin/settings.php?section=authsettingmoowoodle'
			),
			size: '50%',
			label: __('SSO secret key', 'moowoodle'),
			proSetting: true,
			generate: true,
			dependent: {
				key: 'moowoodle_sso_enable', // parent dependent key
				set: true,
				value: 'moowoodle_sso_enable', // updated value
			},
			classes: 'copy-btn',
			afterElement: {
				key: 'moowoodle_sso_secret_key',
				type: 'random-input-key-generator',
				textType: 'post',
				length: 8,
			},
		},
	],
};
