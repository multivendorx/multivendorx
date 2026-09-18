import { __ } from '@wordpress/i18n';

export default {
    id: 'tools',
    priority: 7,
    headerTitle: __('System', 'catalogx'),
    headerDescription: __('Review all system logs and errors', 'catalogx'),
    groupBySections: true,
    hideSettingHeader: true,
    headerIcon: 'paint-brush',
    submitUrl: 'settings',
    modal: [
        {
            key: 'section',
            type: 'section',
            icon: 'paint-brush',
            title: __('System', 'catalogx'),
            desc: __(
                'Review all system logs and errors',
                'catalogx'
            ),
        },
        {
            key: 'catalogx_log',
            type: 'log',
            classes: 'log-section full-width',
            apiLink: 'logs',
            fileName: 'error.txt',
        },
        {
            key: 'section',
            type: 'section',
            icon: 'paint-brush',
            title: __('Additional CSS', 'catalogx'),
            desc: __(
                'Add custom CSS to customize the appearance of the enquiry form.',
                'catalogx'
            ),
        },
        {
            key: 'custom_css_product_page',
            type: 'textarea',
            label: __('Custom CSS', 'catalogx'),
            desc: __(
                'Enter your custom CSS here to customize the enquiry form.',
                'catalogx'
            ),
        },
    ],
};
