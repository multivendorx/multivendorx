/* global appLocalizer */
import { __ } from '@wordpress/i18n';

export default {
	id: 'social-media',
	priority: 10,
	headerTitle: __('Social Media', 'multivendorx'),
	headerDescription: __(
		'Add your store’s social media links to help buyers connect with you across platforms.',
		'multivendorx'
	),
	headerIcon: 'social-media-content',
	submitUrl: `stores/${appLocalizer.store_id}`,
	modal: [
		// Facebook
		{
			type: 'text',
			key: 'facebook',
			icon: 'facebook',
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
			icon: 'linkedin',
			label: __('LinkedIn', 'multivendorx'),
		},

		// YouTube
		{
			type: 'text',
			key: 'youtube',
			icon: 'youtube',
			label: __('YouTube', 'multivendorx'),
		},

		// Instagram
		{
			type: 'text',
			key: 'instagram',
			icon: 'instagram',
			label: __('Instagram', 'multivendorx'),
		},

		// Pinterest
		{
			type: 'text',
			key: 'pinterest',
			icon: 'pinterest',
			label: __('Pinterest', 'multivendorx'),
		},
	],
};
