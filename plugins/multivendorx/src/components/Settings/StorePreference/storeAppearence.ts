import { __ } from '@wordpress/i18n';
import template1 from '../../../assets/images/template/store/template1.jpg';
import template2 from '../../../assets/images/template/store/template2.jpg';
import template3 from '../../../assets/images/template/store/template3.jpg';

export default {
    id: 'store-appearance',
    priority: 5,
    name: __('Appearance', 'multivendorx'),
    desc: __(
        "Control how stores look and feel on your marketplace.",
        'multivendorx'
    ),
    icon: 'adminlib-appearance',
    submitUrl: 'settings',
    modal: [
        {
            key: 'mvx_new_dashboard_site_logo',
            type: 'file',
            label: __('Branding logo', 'multivendorx'),
            size: 'small',
            settingDescription: __('Upload your brand logo for the Store Dashboard. If not added, the site name will be shown.', 'multivendorx'),
        },
        {
            key: 'section',
            type: 'section',
            hint: __(
                'Store customizer',
                'multivendorx'
            ),
            desc: __("Control how your store looks and feels. Set the banner style, logo placement, and customize the dashboard color scheme to match your brand identity.",'multivendorx'),
        },
        {
            key: 'store_color_settings',
            type: 'color-setting',
            label: 'Shop banner section',
            settingDescription: 'Choose how the store’s shop page appears, including banner, logo, and description.',
            images: [
                {
                    key: 'template1',
                    label: 'Neo Frame',
                    img: template1,
                    value: 'template1',
                },
                {
                    key: 'template2',
                    label: 'Elegant Wave',
                    img: template2,
                    value: 'template2',
                },
                {
                key: 'template3',
                label: 'Classic Vibe',
                img: template3,
                value: 'template3',
                }
                // {
                //     key: 'template3',
                //     label: 'Classic Vibe',
                //     img: template3,
                //     value: 'template3',
                // },
                
                // {
                //     key: 'template3',
                //     label: 'Modern Glow',
                //     img: template3,
                //     value: 'template3',
                // },
            ],
        },
        {
            key: 'store_color_settings',
            type: 'color-setting',
            label: 'Dashboard color scheme',
            settingDescription: 'Choose a dashboard color scheme from predefined sets or customize your own. Each scheme defines the button style, and hover effects for a consistent look.',
            showPreview: true,
            predefinedOptions: [
                {
                    key: 'orchid_bloom',
                    label: 'Orchid Bloom',
                    value: 'orchid_bloom',
                    colors: {
                        themeColor: '#3c1f5d',
                        buttonBg: '#5b3488ff',
                        buttonHoverBg: '#7b3eb8',
                    },
                },
                {
                    key: 'emerald_edge',
                    label: 'Emerald Edge',
                    value: 'emerald_edge',
                    colors: {
                        themeColor: '#2ecc71',       
                        buttonBg: '#27ae60',
                        buttonHoverBg: '#1e8449',
                    },
                },
                {
                    key: 'solar_ember',
                    label: 'Solar Ember',
                    value: 'solar_ember',
                    colors: {
                        themeColor: '#e67e22',       // Orange
                        buttonBg: '#d35400',
                        buttonHoverBg: '#ba4a00',
                    },
                },
                {
                    key: 'crimson_blaze',
                    label: 'Crimson Blaze',
                    value: 'crimson_blaze',
                    colors: {
                        themeColor: '#e74c3c',       // Red
                        buttonBg: '#c0392b',
                        buttonHoverBg: '#922b21',
                    },
                },
                {
                    key: 'golden_ray',
                    label: 'Golden Ray',
                    value: 'golden_ray',
                    colors: {
                        themeColor: '#f1c40f',       // Yellow
                        buttonBg: '#f39c12',
                        buttonHoverBg: '#d68910',
                    },
                },
                {
                    key: 'obsidian_night',
                    label: 'Obsidian Night',
                    value: 'obsidian_night',
                    colors: {
                        themeColor: '#2c3e50',       // Black/Dark Gray
                        buttonBg: '#1c2833',
                        buttonHoverBg: '#17202a',
                    },
                },

            ],
        }
    ],
};
