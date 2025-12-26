import { __ } from '@wordpress/i18n';

export default {
	id: 'development-tools',
	priority: 3,
	name: __('Developer Tools', 'multivendorx'),
	desc: __(
		'Site errors and events are logged for easy troubleshooting.',
		'multivendorx'
	),
	icon: 'adminlib-database',
	submitUrl: 'settings',
	modal: [
		{
			key: 'transients',
			type: 'button',
			name: __('Clear transients', 'multivendorx'),
			label: __('MultivendorX stores transients', 'multivendorx'),
			desc: __(
				'Clear all store dashboards transient cache.',
				'multivendorx'
			),
		},
		{
			key: 'visitor',
			type: 'button',
			name: __('Reset database', 'multivendorx'),
			label: __('Reset visitors stats table', 'multivendorx'),
			desc: __(
				'Clear all the table data of MultivendorX visitors stats.',
				'multivendorx'
			),
		},
		{
			key: 'default_pages',
			type: 'button',
			name: __('Create default MultiVendorX Page', 'multivendorx'),
			label: __('MultiVendorX page', 'multivendorx'),
			desc: __(
				'This tool will install all the missing MultiVendorX pages. Pages already defined and set up will not be replaced.',
				'multivendorx'
			),
			apilink: 'status',
			method: 'GET'
		},
		{
			key: 'multivendorx_adv_log',
			type: 'checkbox',
			label: __('Developer log', 'moowoodle'),
			desc: __(
				'View system logs related to MultiVendorX to help identify errors, warnings, and debugging information.',
				'multivendorx'
			),
			options: [
				{
					key: 'multivendorx_adv_log',
					value: 'multivendorx_adv_log',
				},
			],
			look: 'toggle',
		},
		{
			key: 'separator_content',
			type: 'section',
			hint: __('Version Control', 'multivendorx'),
			desc: __('', 'multivendorx'),
		},
		{
			key: 'store_registration_page',
			type: 'select',
			label: __('Rollback version', 'multivendorx'),
			desc: __(
				'Choose the previous MultiVendorX version you want to switch to.<br>Use this option if you are facing issues after an update and need to restore an earlier version.',
				'multivendorx'
			),
			className: 'select-class',
			size: '30rem',
			options: [
				{
					key: 'kilometers',
					label: __('5.0.0', 'multivendorx'),
					value: 'kilometers',
				},
			],
		},
		{
			key: 'separator_content',
			type: 'section',
			hint: __('Custom CSS', 'multivendorx'),
			desc: __('', 'multivendorx'),
		},
		{
			key: 'custom_css_product_page',
			type: 'textarea',
			desc: __(
				'Add your own CSS here to modify and style the dashboard to match your preferences.',
				'multivendorx'
			),
			label: __('Addional CSS', 'multivendorx'),
		},
		{
			key: 'separator_content',
			type: 'section',
			wrapperClass: 'divider-wrapper red',
			hint: __('Danger Zone', 'multivendorx'),
			desc: __('', 'multivendorx'),
		},
		{
			key: 'clear_notifications',
			type: 'number',
			wrapperClass: 'red-text',
			label: __('Clear notifications', 'multivendorx'),
			postInsideText: __('days', 'multivendorx')
		},
		{
			key: 'separator_content',
			type: 'section',
			hint: __('Sync event table', 'multivendorx'),
			desc: __('', 'multivendorx'),
		},
		{
			key: 'sync_notifications',
			type: 'setting-toggle',
			label: __('Sync Notifications', 'multivendorx'),
			options: [
				{
					key: 'sync_only_new_entry',
					label: __('New Entry', 'multivendorx'),
					value: 'sync_only_new_entry',
				},
				{
					key: 'sync_existing_entry',
					label: __('Existing + New Entry', 'multivendorx'),
					value: 'sync_existing_entry',
				},
			],
		},
		{
			key: 'override_existing_fields',
			type: 'checkbox',
			label: __('Override Existing Fields', 'multivendorx'),
			class: 'mvx-toggle-checkbox',
			options: [
				{
					key: 'override_notifiers',
					label: __('Notifiers', 'multivendorx'),
					value: 'override_notifiers',
				},
				{
					key: 'override_custom',
					label: __('Custom Emails', 'multivendorx'),
					value: 'override_custom',
				},
				{
					key: 'override_email_content',
					label: __('Email Content', 'multivendorx'),
					value: 'override_email_content',
				},
				{
					key: 'override_sms_content',
					label: __('SMS Content', 'multivendorx'),
					value: 'override_sms_content',
				},
				{
					key: 'override_system_content',
					label: __('System Content', 'multivendorx'),
					value: 'override_system_content',
				},
			],
			selectDeselect: true,
			dependent: {
				key: 'sync_notifications',
				set: true,
				value: 'sync_existing_entry',
			},
		},
		{
			key: 'sync_table',
			type: 'button',
			name: __('Sync Table', 'multivendorx'),
			label: __('Sync Table', 'multivendorx'),
			apilink: 'notifications',
			method: 'POST',
			dependent: {
				key: 'sync_notifications',
				set: true,
			},
		},
	],
}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                