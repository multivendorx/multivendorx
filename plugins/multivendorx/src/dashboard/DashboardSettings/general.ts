/* global appLocalizer */
import { __ } from '@wordpress/i18n';

const settings =
	appLocalizer.admin_settings['store-permissions']
		?.edit_store_info_activation || [];

export default {
	id: 'general',
	priority: 1,
	headerTitle: __('General', 'multivendorx'),
	headerDescription: __(
		'Update your store’s core information - name, slug, description, and buyer message',
		'multivendorx'
	),
	headerIcon: 'tools',
	submitUrl: `stores/${appLocalizer.store_id}`,
	modal: [
		{
			type: 'text',
			label: __('Name', 'multivendorx'),
			key: 'name',
			readOnly: !settings.includes('store_name'),
		},
		{
			type: 'text',
			label: __('Storefront link', 'multivendorx'),
			key: 'slug',
		},
		{
			type: 'textarea',
			label: __('Description', 'multivendorx'),
			key: 'description',
			readOnly: !settings.includes('store_description'),
		},
		// {
		// 	type: 'text',
		// 	label: __('Buyer welcome message after purchase', 'multivendorx'),
		// 	key: 'messageToBuyer',
		// },
	],
};
