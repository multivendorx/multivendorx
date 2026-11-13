import { __ } from '@wordpress/i18n';

export default {
    id: 'tools',
    priority: 7,
    headerTitle: __('System', 'catalogx'),
    headerDescription: __('Review all system logs and errors', 'catalogx'),
    groupBySections: true,
    hideSettingHeader: true,
    headerIcon: 'desktop-pc-valuation',
    submitUrl: 'settings',
    modal: [
        {
            key: 'section',
            type: 'section',
            icon: 'desktop-pc-valuation',
            title: __('System', 'catalogx'),
            desc: __(
                'Logs, diagnostics - for troubleshooting, not day-to-day configuration.',
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
            icon: 'css',
            title: __('Additional CSS', 'catalogx'),
            desc: __(
                'Add custom CSS to customize the appearance of the enquiry form.',
                'catalogx'
            ),
        },
        {
            key: 'custom_css_product_page',
            type: 'textarea',
            desc: __(
                'Enter your custom CSS here to customize the enquiry form.',
                'catalogx'
            ),
        },
    ],
};
