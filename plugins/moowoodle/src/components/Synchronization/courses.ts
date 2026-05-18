import { __ } from '@wordpress/i18n';

export default {
	id: 'synchronize-course',
	priority: 10,
	headerTitle: __('Courses Synchronization', 'moowoodle'),
	headerDescription: __(
		'Fetch Moodle courses & generate products on demand.',
		'moowoodle'
	),
	headerIcon: 'bulk-course-sync',
	submitUrl: 'settings',
	modal: [
		{
			key: 'sync_course_options',
			type: 'checkbox',
			settingDescription: __(
				'Moodle course information is synchronized with WordPress products through categories, IDs, images, and groups.',
				'moowoodle'
			),
			label: __('Course information mapping', 'moowoodle'),
			selectDeselect: true,
			options: [
				{
					key: 'sync_courses_category',
					label: __('Course categories', 'moowoodle'),
					hints: __(
						'Scan the entire Moodle course category structure and synchronize it with the WordPress category listings.',
						'moowoodle'
					),
					value: 'sync_courses_category',
				},
				{
					key: 'sync_courses_sku',
					label: __('Course ID number - Product SKU', 'moowoodle'),
					hints: __(
						'Retrieves the course ID number and assigns it as the product SKU.',
						'moowoodle'
					),
					value: 'sync_courses_sku',
					proSetting: true,
				},
				{
					key: 'sync_image',
					label: __('Course image', 'moowoodle'),
					hints: __(
						'Copies course images and sets them as WooCommerce product images.',
						'moowoodle'
					),
					value: 'sync_image',
					proSetting: true,
				},
				{
					key: 'sync_group',
					label: __('Course group', 'moowoodle'),
					hints: __(
						'Moodle course groups are fetched and linked with products.',
						'moowoodle'
					),
					value: 'sync_group',
					proSetting: true,
				},
			],
		},
		{
			key: 'section',
			type: 'section',
			title: __('Product synchronization options', 'moowoodle'),
		},
		{
			key: 'product_sync_option',
			type: 'checkbox',
			settingDescription: __(
				'Course information from Moodle is used to generate new products or refresh existing ones in WordPress.',
				'moowoodle'
			),
			label: __('Course & product synchronization', 'moowoodle'),
			selectDeselect: true,
			options: [
				{
					key: 'create',
					label: __('Create new products along with', 'moowoodle'),
					hints: __(
						'This will additionally create new products based on Moodle courses fetched, if they do not already exist in WordPress.',
						'moowoodle'
					),
					value: 'create',
				},
				{
					key: 'update',
					label: __(
						'Update existing products along with',
						'moowoodle'
					),
					hints: __(
						'Update product information based on Moodle course data. <br><span class="highlighted-part">Caution: This will overwrite all existing product details with those from Moodle course details.</span>',
						'moowoodle'
					),
					value: 'update',
				},
			],
		},
		{
			key: 'section',
			type: 'section',
			title: __('On-demand synchronization', 'moowoodle'),
		},
		{
			key: 'sync_course_btn',
			label: __('On-demand course', 'moowoodle'),
			settingDescription: __(
				'Courses are fetched from Moodle and synchronized with WordPress, ensuring product details remain updated.',
				'moowoodle'
			),
			type: 'sequential-task-executor',
			buttonText: __('Synchronize courses now!', 'moowoodle'),
			buttonIcon: 'bulk-course-sync',
			apilink: 'synchronization',
			parameter: 'course',
			interval: 2500,
			successMessage: __(
				'Courses synchronized successfully!',
				'moowoodle'
			),
			failureMessage: __('Failed to synchronize courses.', 'moowoodle'),
			desc: __(
				"Initiate the immediate synchronization of all courses from Moodle to WordPress.<br><span class='highlighted-part'><br>With the 'Course & product synchronization' option, you have the ability to specify whether you want to create new products or update existing products.<br>Through the 'Course information mapping' feature, you gain the flexibility to define which specific course data gets imported from Moodle, like course ID number/course images etc. By default we will fetch only the category of the product.</span>",
				'moowoodle'
			),
		},
	],
};
