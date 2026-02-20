import { __ } from '@wordpress/i18n';

export default {
	id: 'social-media',
	priority: 10,
	headerTitle: __('Social Media', 'multivendorx'),
	headerDescription: __(
		'Add your store’s social media links to help buyers connect with you across platforms.',
		'multivendorx'
	),
	headerIcon: 'cohort',
	submitUrl: `store/${appLocalizer.store_id}`,
	modal: [
		// Facebook
		{
			type: 'text',
			key: 'facebook',
			icon: 'facebook-fill',
			label: __('Facebook', 'multivendorx'),
		},

		// X / Twitter
		{
			type: 'text',
			key: 'twitter',
			icon: 'twitter',
			label: __('X', 'multivendorx'),
		},

		// LinkedIn
		{
			type: 'text',
			key: 'linkedin',
			icon: 'linkedin-border',
			label: __('LinkedIn', 'multivendorx'),
		},

		// YouTube
		{
			type: 'text',
			key: 'youtube',
			icon: 'adminfont-youtube',
			label: __('YouTube', 'multivendorx'),
		},

		// Instagram
		{
			type: 'text',
			key: 'instagram',
			icon: 'mail',
			label: __('Instagram', 'multivendorx'),
		},

		// Pinterest
		{
			type: 'text',
			key: 'pinterest',
			icon: 'mail',
			label: __('Pinterest', 'multivendorx'),
		},
	],
};
