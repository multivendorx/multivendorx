import { __ } from '@wordpress/i18n';

export default {
    id: 'wholesale',
    priority: 2,
    name: __('Wholesale Trading', 'mvx-pro'),
    desc: __('Configure rules for wholesale buyers and pricing.', 'mvx-pro'),
    icon: 'adminlib-wholesale',
    submitUrl: 'settings',
    modal: [
        {
            key: 'wholesale_buyer_verification',
            type: 'setting-toggle',
            label: __('Wholesale buyer verification', 'multivendorx'),
            desc: __(
                'Decide how wholesale buyers are approved before they can access bulk pricing.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'automatic',
                    label: __('Automatic approval', 'multivendorx'),
                    value: 'automatic',
                },
                {
                    key: 'manual',
                    label: __('Manual approval', 'multivendorx'),
                    value: 'manual',
                },
            ],
            //proSetting:true
        },
        {
            key: 'wholesale_price_access',
            type: 'setting-toggle',
            label: __('Wholesale price access', 'multivendorx'),
            desc: __(
                'Choose which users can see wholesale pricing in store catalogs.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'registered',
                    label: __('All registered users', 'multivendorx'),
                    value: 'registered',
                },
                {
                    key: 'wholesale_only',
                    label: __('Approved wholesale buyers only', 'multivendorx'),
                    value: 'wholesale_only',
                },
            ],
            //proSetting:true
        },
        {
            key: 'wholesale_price_display',
            type: 'setting-toggle',
            label: __('Wholesale price display', 'multivendorx'),
            desc: __(
                'Control whether wholesale prices are shown alongside retail prices or separately.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'with_retail',
                    label: __('Show with retail prices', 'multivendorx'),
                    value: 'with_retail',
                },
                {
                    key: 'wholesale_only',
                    label: __('Show wholesale price only', 'multivendorx'),
                    value: 'wholesale_only',
                },
            ],
            //proSetting:true
        },
    ],
};
