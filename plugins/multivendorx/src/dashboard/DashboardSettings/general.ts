import { __ } from '@wordpress/i18n';

export default {
    id: 'general',
    priority: 1,
    headerTitle: __('General', 'multivendorx'),
    headerDescription: __(
        'Update your store’s core information - name, slug, description, and buyer message',
        'multivendorx'
    ),
    headerIcon: 'tools',
    submitUrl: 'settings',
	modal: [
				{
					type: 'text',
					name: 'name',
					label: __('Name', 'multivendorx'),
					key: 'name',
					value: '',
					

				},
				{
					type: 'text',
					name: 'slug',
					label: __('Storefront link', 'multivendorx'),
					key: 'slug',
					value: '',
					
				},
				{
					type: 'textarea',
					name: 'description',
					label: __('Description', 'multivendorx'),
					key: 'description',
					value: '',
					
				},
				{
					type: 'text',
					name: 'messageToBuyer',
					label: __('Buyer welcome message after purchase', 'multivendorx'),
					key: 'messageToBuyer',
					value: '',
				}
			]
};