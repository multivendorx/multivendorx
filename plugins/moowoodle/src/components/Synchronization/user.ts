/* global appLocalizer */
import { __ } from '@wordpress/i18n';
import wordpressLogo from '@/assets/images/wordPress-to-moodle.png';
import moodleLogo from '@/assets/images/moodle-to-wordpress.png';
const nestedFields = [
	{
		key: 'wordpress',
		type: 'select',
		size: 8,
		options: [
			{
				key: 'firstname',
				label: 'First name',
				value: 'firstname',
			},
			{
				key: 'lastname',
				label: 'Last name',
				value: 'lastname',
			},
			{
				key: 'username',
				label: 'User name',
				value: 'username',
			},
			{
				key: 'password',
				label: 'Password',
				value: 'password',
			},
		],
		afterElement: {
			type: 'preposttext',
			textType: 'post',
			postText: '⇌',
		},
	},
	{
		key: 'moodle',
		type: 'select',
		size: 8,
		options: [
			{
				key: 'firstname',
				label: 'First name',
				value: 'firstname',
			},
			{
				key: 'lastname',
				label: 'Last name',
				value: 'lastname',
			},
			{
				key: 'username',
				label: 'User name',
				value: 'username',
			},
			{
				key: 'password',
				label: 'Password',
				value: 'password',
			},
		],
	},
];
export default {
	id: 'synchronize-user',
	priority: 20,
	headerTitle: __('Users Synchronization', 'moowoodle'),
	headerDescription: __(
		'Synchronization on demand with automatic, real-time updates.',
		'moowoodle'
	),
	headerIcon: 'supervised-user-circle',
	submitUrl: 'settings',
	proDependent: true,
	modal: [
		{
			key: 'user_sync_direction',
			type: 'choice-toggle',
			desc: __(
				"The synchronization flow specifies the direction of data transfer. To enable two-way synchronization, select both directions. This applies to existing users as well. With 'Real-time profile synchronization', user profile information will sync immediately whenever users update their profiles.<br><br> <span class='highlighted-part'>User uniqueness will be checked based on email. If the user exists in the other system, their profile information will be synchronized; otherwise, a new user will be created. <br>Synchronizing user information fails if the same username is found in another instance but linked to a different email address.</span>",
				'moowoodle'
			),
			label: __('Synchronization flow between sites', 'moowoodle'),
			options: [
				{
					key: 'wordpress_to_moodle',
					value: 'wordpress_to_moodle',
					label: 'WordPress to Moodle',
					img: wordpressLogo,
				},
				{
					key: 'moodle_to_wordpress',
					value: 'moodle_to_wordpress',
					label: 'Moodle to WordPress',
					img: moodleLogo,
				},
			],
			multiSelect: true,
			proSetting: true,
		},
		{
			key: 'wordpress_user_role',
			type: 'checkbox',
			desc: __(
				'Users from the chosen roles will be added or updated in Moodle.',
				'moowoodle'
			),
			label: __('WordPress user role to synchronize', 'moowoodle'),
			options: Object.entries(appLocalizer.wp_user_roles).map(
				([key, label]) => {
					return {
						key,
						label,
						value: key,
						proSetting: true,
					};
				}
			),
			selectDeselect: true,
			dependent: {
				key: 'user_sync_direction',
				value: 'wordpress_to_moodle',
			},
		},
		{
			key: 'moodle_user_role',
			type: 'checkbox',
			desc: __(
				'Users from the chosen roles will be added or updated in WordPress.',
				'moowoodle'
			),
			label: __('Moodle user role to synchronize', 'moowoodle'),
			options: Object.entries(appLocalizer.md_user_roles).map(
				([key, label]) => {
					return {
						key,
						label,
						value: key,
						proSetting: true,
					};
				}
			),
			selectDeselect: true,
			dependent: {
				key: 'user_sync_direction',
				value: 'moodle_to_wordpress',
			},
		},
		{
			key: 'user_sync_options',
			type: 'nested',
			label: __('Profile information mapping', 'moowoodle'),
			rowClass: 'single-multi-line',
			mapping: true,
			addButtonLabel: __('Add New', 'moowoodle'),
			deleteButtonLabel: __('Remove', 'moowoodle'),
			desc: __(
				"Define the user profile information mapping between WordPress and Moodle. Add multiple rows above to define all the profile data you wish to map. Any remaining profile field will be excluded from the synchronization process.<br>User will be created based on their e-mail id, hence email id can't be mapped.",
				'moowoodle'
			),
			nestedFields,
		},
		{
			key: 'realtime_user_sync',
			type: 'checkbox',
			desc: __(
				'If enabled, the real-time profile update scheduler will initiate based on the "synchronization flow" settings.<br>When a new user is added or updates their profile information, it will be synchronized between WordPress to Moodle, or vice versa, according to the profile information mapping settings above, based on the specified direction.',
				'moowoodle'
			),
			label: __('Real-Time profile synchronization', 'moowoodle'),
			options: [
				{
					key: 'realtime_user_sync',
					label: __('', 'moowoodle'),
					value: 'realtime_user_sync',
				},
			],
			look: 'toggle',
			proSetting: true,
		},
		{
			key: 'sync_user_btn',
			label: 'On-demand course',
			settingDescription:
				'Courses are fetched from Moodle and synchronized with WordPress, ensuring product details remain updated.',
			type: 'sequential-task-executor',
			buttonText: 'Synchronize users now!',
			buttonIcon: 'bulk-course-sync',
			apilink: 'synchronization',
			parameter: 'user',
			interval: 2500,
			successMessage: 'Users synchronized successfully!',
			failureMessage: 'Failed to synchronize users.',
			desc: "Initiate the immediate synchronization of all users from Moodle to WordPress.<br><span class='highlighted-part'><br>With the 'User & product synchronization' option, you have the ability to specify whether you want to create new products, update existing products.<br>Through the 'User information mapping' feature, you gain the flexibility to define which specific user data gets imported from Moodle, like user ID number/user images etc. By default we will fetch only the category of the product.</span>",
		},
	],
};
