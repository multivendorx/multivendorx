import { __ } from '@wordpress/i18n';

export default {
    id: 'seo',
    priority: 8,
    headerTitle: __('SEO', 'multivendorx'),
    headerDescription: __(
        'Define your store’s policies so customers clearly understand your shipping, refund, and return terms.',
        'multivendorx'
    ),
    headerIcon: 'privacy',
    submitUrl: `store/${appLocalizer.store_id}`,
    modal: [
        {
            type: 'text',
            key: 'shop_title',
            label: __('Shop Title', 'multivendorx'),
            placeholder: __('Enter SEO Shop Title', 'multivendorx')
        },
        {
            type: 'text',
            key: 'shop_meta_keywords',
            label: __('Shop Meta Keywords', 'multivendorx'),
            placeholder: __('Enter Shop Meta Keywords', 'multivendorx')
        },
        {
            type: 'textarea',
            key: 'meta_description',
            label: __('Meta Description', 'multivendorx'),
            placeholder: __('Enter Meta Description', 'multivendorx')
        },
    ],
};
