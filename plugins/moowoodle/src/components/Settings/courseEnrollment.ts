/* global appLocalizer */
import { __, sprintf } from '@wordpress/i18n';

export default {
	id: 'course-enrollment',
	priority: 2,
	headerTitle: __('Course & Enrollment', 'moowoodle'),
	headerDescription: __(
		'Control how course information appears to customers',
		'moowoodle'
	),
	headerIcon: 'cart',
	submitUrl: 'settings',
	modal: [
		{
			key: 'start_end_date',
			type: 'checkbox',
			desc: __(
				'When enabled, the course duration, such as the start and end dates, will be visible on the shop page.',
				'moowoodle'
			),
			label: __("Display course duration in 'Shop Page'", 'moowoodle'),
			options: [
				{
					key: 'start_end_date',
					label: __('', 'moowoodle'),
					value: 'start_end_date',
				},
			],
			look: 'toggle',
		},
		{
			key: 'my_courses_priority',
			type: 'select',
			desc: __(
				"'<b>My Course</b>' menu will appear beneath the selected menu on the WooCommerce 'My Account' page of customer dashboard.",
				'moowoodle'
			),
			size: 25,
			label: __("Endpoint menu position - 'My Course'", 'moowoodle'),
			options: Object.entries(appLocalizer.account_menu).map(
				([key, label], index) => {
					return {
						key: index,
						label: label,
						value: index,
					};
				}
			),
		},
		{
			key: 'section',
			type: 'section',
			title: __('Enrollment & seat management', 'moowoodle'),
			desc: __(
				'Configure how buyers enroll and manage course seats',
				'moowoodle'
			),
		},
		{
			key: 'bulk_access_enable',
			type: 'checkbox',
			desc: __(
				'Allow buyers (e.g., teachers or managers) to purchase multiple seats and assign them to users.',
				'moowoodle'
			),
			label: __('Classroom mode / group purchase', 'moowoodle'),
			options: [
				{
					key: 'bulk_access_enable',
					value: 'bulk_access_enable',
				},
			],
			proSetting: true,
			look: 'toggle',
		},
		{
			key: 'seat_reassignment',
			type: 'checkbox',
			desc: __(
				'Enable buyers to remove users and reassign seats when needed - great for managing rotating teams or classrooms.',
				'moowoodle'
			),
			label: __('Seat reassignment', 'moowoodle'),
			options: [
				{
					key: 'seat_reassignment',
					value: 'seat_reassignment',
				},
			],
			proSetting: true,
			look: 'toggle',
		},
		{
			key: 'gift_someone',
			type: 'checkbox',
			desc: __(
				"Let buyers gift a course by entering someone else's details during checkout.",
				'moowoodle'
			),
			label: __('Gift someone', 'moowoodle'),
			options: [
				{
					key: 'gift_someone',
					value: 'gift_someone',
				},
			],
			proSetting: true,
			look: 'toggle',
		},
		{
			key: 'section',
			type: 'section',
			title: __('User notifications', 'moowoodle'),
			desc: __(
				'Manage emails sent to new and existing users',
				'moowoodle'
			),
		},
		{
			key: 'moowoodle_create_user_custom_mail',
			type: 'checkbox',
			desc: sprintf(
				/* translators: %s: URL to WooCommerce email settings */
				__(
					'If enabled, default WordPress new user registration emails will be disabled for both admin and user. <br>You can personalize the content of the MooWoodle New User email from <a href="%s" target="_blank" rel="noreferrer">here.</a>',
					'moowoodle'
				),
				appLocalizer.wc_email_url
			),
			label: __('Disable new user registration email', 'moowoodle'),
			options: [
				{
					key: 'moowoodle_create_user_custom_mail',
					value: 'moowoodle_create_user_custom_mail',
				},
			],
			look: 'toggle',
		},
	],
};
