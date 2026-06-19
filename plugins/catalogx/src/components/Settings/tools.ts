import { __ } from '@wordpress/i18n';

export default {
    id: 'tools',
    priority: 8,
    headerTitle: __('System', 'catalogx'),
    headerDescription: __('Review all system logs and errors', 'catalogx'),
    headerIcon: 'paint-brush',
    submitUrl: 'settings',
    modal: [
        {
            key: 'catalogx_log',
            type: 'log',
            classes: 'log-section',
            apiLink: 'logs',
            fileName: 'error.txt',
            label: __('Logs', 'catalogx'),
        },
        {
            key: 'custom_css_product_page',
            type: 'textarea',
            desc: __(
                'Put your custom css here, to customize the enquiry form.',
                'catalogx'
            ),
            label: __('Addional CSS', 'catalogx'),
        },
    ],
};
