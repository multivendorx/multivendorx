/* global appLocalizer */
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
	groupBySections: true,
	hideSettingHeader: true,
	submitUrl: 'settings',
	modal: [
		{
			key: 'section',
			type: 'section',
			icon: 'setting',
			title: __('Connection', 'moowoodle'),
			desc: __(
				'Point this site at your Moodle instance and confirm the two can reach each other.',
				'moowoodle'
			),
		},
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
					failureMessage: __('Failed to connect to Moodle.', 'moowoodle'),
				},
				{
					action: 'get_courses',
					message: __('Courses Fetch', 'moowoodle'),
					failureMessage: __('Failed to fetch courses.', 'moowoodle'),
				},
				{
					action: 'get_categories',
					message: __('Category Fetch', 'moowoodle'),
					failureMessage: __('Failed to fetch categories.', 'moowoodle'),
				},
				{
					action: 'create_users',
					message: __('User Creation', 'moowoodle'),
					failureMessage: __(
						'Failed to create the test user.',
						'moowoodle'
					),
				},
				{
					action: 'get_users',
					message: __('User Fetch', 'moowoodle'),
					failureMessage: __('Failed to get the test user.', 'moowoodle'),
				},
				{
					action: 'update_users',
					message: __('User Update', 'moowoodle'),
					failureMessage: __(
						'Failed to update the test user. Verify that Moodle SMTP/email settings are configured correctly.',
						'moowoodle'
					),
					previousResponseData: ['get_users'],
				},
				{
					action: 'enroll_users',
					message: __('User Enroll', 'moowoodle'),
					failureMessage: __(
						'Failed to enroll the test user. Verify that Moodle SMTP/email settings are configured correctly.',
						'moowoodle'
					),
					previousResponseData: ['get_users', 'get_courses'],
				},
				{
					action: 'unenroll_users',
					message: __('User Unenroll', 'moowoodle'),
					failureMessage: __('Failed to unenroll user.', 'moowoodle'),
					previousResponseData: ['get_users', 'get_courses'],
				},
				{
					action: 'delete_users',
					message: __('User Remove', 'moowoodle'),
					failureMessage: __('Failed to delete user.', 'moowoodle'),
					previousResponseData: ['get_users'],
				},
			],
		},
				{
			key: 'section',
			type: 'section',
			icon: 'setting',
			title: __('Single sign-on', 'moowoodle'),
			desc: __(
				'Let logged-in WordPress users open their Moodle courses without signing in again.',
				'moowoodle'
			),
		},
		{
			key: 'moowoodle_sso_enable',
			type: 'checkbox',
			desc: __(
				'Buyers go straight from "My Course" into Moodle, no separate login.',
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
