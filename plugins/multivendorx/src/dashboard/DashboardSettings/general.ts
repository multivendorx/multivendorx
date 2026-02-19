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
    submitUrl: `store/${appLocalizer.store_id}`,
    modal: [
        {
			key: 'product_page_chat',
			type: 'setting-toggle',
			label: __('Chat button position', 'multivendorx'),
			desc: __(
				'Choose where the chat button will appear on product/listing pages.',
				'multivendorx'
			),
			options: [
				{
					key: 'add_to_cart_button',
					label: __('Next to Add to Cart button', 'multivendorx'),
					value: 'add_to_cart_button',
				},
				{
					key: 'store_info',
					label: __('Inside Store details tab', 'multivendorx'),
					value: 'store_info',
				},
				{
					key: 'none',
					label: __('Both', 'multivendorx'),
					value: 'none',
				},
			],
		},
    ],
};
