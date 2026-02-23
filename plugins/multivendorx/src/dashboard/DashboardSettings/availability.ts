import { __ } from '@wordpress/i18n';

export default {
    id: 'availability',
    priority: 3,
    headerTitle: __('Availability', 'multivendorx'),
    headerDescription: __(
        'Manage your store’s shipping method, pricing rules, and location-based rates.',
        'multivendorx'
    ),
    headerIcon: 'availability',
    submitUrl: `store/${appLocalizer.store_id}`,
    modal: [
        // Calendar Input
        {
            type: 'date',
            key: 'date_range',
            format: 'YYYY-MM-DD',
            multiple: true,
            showInput: false,
        },
        {
            key: 'calendar_info',
            type: 'blocktext',
            blocktext: __(
                'Selected dates will automatically pause order acceptance and display your custom notification message to customers.', 'multivendorx'
            ),
        },
        {
            key: 'separator_category_specific',
            type: 'section',
            desc: __(
                'Automatically block purchases on public holidays',
                'multivendorx'
            ),
            title: __(
                'Holiday Automation',
                'multivendorx'
            ),
        },
        {
            key: 'block_purchases_on_holidays',
            type: 'checkbox',
            label: 'Block purchases on holidays',
            desc: 'Automatically close your store on recognized public holidays',
            options: [
                {
                    key: 'block_purchases_on_holidays',
                    value: 'block_purchases_on_holidays',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'block_purchases_on_holidays_checklist',
            label: ' ',
            type: 'itemlist', 
            items: [ 
                {
                    title: __('Christmas Day (2026-12-25)', 'multivendorx'),
                    icon: 'check adminfont-icon-yes',
                },
                {
                    title: __('New Years Day (2026-01-01)', 'multivendorx'),
                    icon: 'check adminfont-icon-yes',
                },
                {
                    title: __('Independence Day (2026-07-04)', 'multivendorx'),
                    icon: 'check adminfont-icon-yes',
                },
            ],
            className: 'checklist',
            dependent: {
                key: 'block_purchases_on_holidays',
                set: true,
            },
        },
        {
            key: 'separator_category_specific',
            type: 'section',
            desc: __(
                'Customize how customers are informed',
                'multivendorx'
            ),
            title: __(
                'Customer Notifications',
                'multivendorx'
            ),
        },
        // Add to Cart Button Text
        {
            type: 'text',
            key: 'add_to_cart_text',
            label: __('"Add to Cart" Button Text', 'multivendorx'),
        },

        // Notification Message
        {
            type: 'textarea',
            key: 'notification_message',
            label: __('Notification Message', 'multivendorx'),
        },

        // Quick Presets Toggle
        {
            type: 'setting-toggle',
            key: 'quick_presets',
            label: __('Quick presets', 'multivendorx'),
            options: [
                {
                    key: '1d',
                    value: '1d',
                    label: __('1d', 'multivendorx'),
                    desc: __('Same', 'multivendorx')
                },
                {
                    key: '3d',
                    value: '3d',
                    label: __('3d', 'multivendorx'),
                    desc: __('Short', 'multivendorx')
                },
                {
                    key: '7d',
                    value: '7d',
                    label: __('7d', 'multivendorx'),
                    desc: __('1 week', 'multivendorx')
                },
                {
                    key: '14d',
                    value: '14d',
                    label: __('14d', 'multivendorx'),
                    desc: __('2 week', 'multivendorx')
                },
                {
                    key: '30d',
                    value: '30d',
                    label: __('30d', 'multivendorx'),
                    desc: __('1 month', 'multivendorx')
                }
            ]
        },

        // Notify Via Toggle
        {
            type: 'setting-toggle',
            key: 'notify_via',
            label: __('Notify via', 'multivendorx'),
            options: [
                {
                    key: 'store_banner',
                    value: 'store_banner',
                    icon: 'storefront',
                    label: __('Store banner', 'multivendorx')
                },
                {
                    key: 'email',
                    value: 'email',
                    icon: 'mail',
                    label: __('Email', 'multivendorx')
                },
                {
                    key: 'sms',
                    value: 'sms',
                    icon: 'messaging',
                    label: __('SMS', 'multivendorx')
                }
            ]
        }
    ],
};
