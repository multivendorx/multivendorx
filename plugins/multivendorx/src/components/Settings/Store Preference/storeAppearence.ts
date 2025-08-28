import { __ } from '@wordpress/i18n';

export default {
    id: 'store-appearance',
    priority: 5,
    name: __('Appearance', 'multivendorx'),
    desc: __(
        "Control how stores look and feel on your marketplace",
        'multivendorx'
    ),
    icon: 'adminlib-clock2',
    submitUrl: 'settings',
    modal: [
        {
            key: 'mvx_new_dashboard_site_logo',
            type: 'file',
            label: __('Branding logo', 'multivendorx'),
            size: 'small',
            desc: __('Upload brand image as logo', 'multivendorx'),
        },
        {
            key: 'section',
            type: 'section',
            hint: __(
                'Store customization',
                'multivendorx'
            ),
        },
        {
            key: 'store_color_settings',
            type: 'color-setting',
            label: 'Dashboard color scheme',
            desc: 'Set the color theme for store dashboards - the admin interface stores use to manage their business',
            showPreview: true,
            predefinedOptions: [
                {
                    key: 'purple_pulse',
                    label: 'Purple Pulse',
                    value: 'purple_pulse',
                    colors: {
                        themeColor: '#3c1f5d',
                        buttonBg: '#5b3488ff',
                        buttonHoverBg: '#7b3eb8',
                    },
                },
                {
                    key: 'majestic_orange',
                    label: 'Majestic Orange',
                    value: 'majestic_orange',
                    colors: {
                        themeColor: '#0D9394',
                        buttonBg: '#14b8b8ff',
                        buttonHoverBg: '#077575ff',
                    },
                },
                {
                    key: 'ocean',
                    label: 'Ocean',
                    value: 'ocean',
                    colors: {
                        themeColor: '#fa1547ff',
                        buttonBg: '#f33e65ff',
                        buttonHoverBg: '#c2294aff',
                    },
                },
            ],
        }
    ],
};
