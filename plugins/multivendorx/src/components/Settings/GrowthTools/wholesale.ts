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
            settingDescription: __('Decide how wholesale buyers are approved before they can access bulk pricing.','multivendorx'),
			desc: __('<ul><li>Automatic:Any user registering as a wholesale buyer is instantly approved without admin review.</li><li>Manual-Admin must review and approve each wholesale buyer request before access is granted.</li></ul>', 'mvx-pro'),
            options: [
                {
                    key: 'automatic',
                    label: __('Automatic', 'multivendorx'),
                    value: 'automatic',
                },
                {
                    key: 'manual',
                    label: __('Manual', 'multivendorx'),
                    value: 'manual',
                },
            ],
            //proSetting:true
        },
        {
            key: 'wholesale_price_access',
            type: 'setting-toggle',
            label: __('Wholesale price access', 'multivendorx'),
            settingDescription: __('Choose which users can see wholesale pricing in store catalogs.','multivendorx'),
	      	desc: __('<ul><li>All registered users – Every logged-in customer can see wholesale prices, regardless of approval status.</li><li>Approved wholesale buyers only – Only users approved as wholesale buyers can see wholesale prices.</li></ul>', 'mvx-pro'),
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
            settingDescription: __('Control whether wholesale prices are shown alongside retail prices or separately.','multivendorx'),
			desc: __('<ul><li>Show with retail prices – Display both retail and wholesale prices side by side, so buyers can compare.</li><li>Show wholesale price only – Replace retail pricing with wholesale pricing for eligible buyers.</li></ul>', 'mvx-pro'),
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
