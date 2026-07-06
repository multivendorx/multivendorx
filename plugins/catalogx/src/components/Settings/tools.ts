import { __ } from '@wordpress/i18n';

export default {
    id: 'tools',
    priority: 7,
    headerTitle: __('System', 'catalogx'),
    headerDescription: __('Review all system logs and errors', 'catalogx'),
    headerIcon: 'paint-brush',
    submitUrl: 'settings',
    modal: [
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
