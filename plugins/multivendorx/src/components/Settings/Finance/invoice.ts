import { __ } from '@wordpress/i18n';

export default {
    id: 'store-invoice',
    priority: 5,
    name: __('Invoice', 'mvx-pro'),
    desc: __('Select the PDF output mode', 'mvx-pro'),
    icon: 'adminlib-clock2',
    submitUrl: 'settings',
    modal: [
        {
            key: 'separator_content',
            type: 'section',
            desc: __( 'Set up when and how invoices are generated in your marketplace', 'multivendorx' ),
            hint: __( 'Invoice generation settings', 'multivendorx' ),
        },
        {
            key: 'mvx_tinymce_api_section',
            type: 'number',
            classes: 'vertical width-50',
            label: __( 'Invoice number format', 'multivendorx' ),            
            placeholder: 'Invoice number format',
        },
        {
            key: 'mvx_tinymce_api_section',
            type: 'number',
            classes: 'vertical width-50',
            label: __( 'Starting invoice number', 'multivendorx' ),            
            placeholder: 'Starting invoice number',
        },
        {
            key: 'commission_type',
            type: 'setting-toggle',
            label: __( 'Invoice PDF page size', 'multivendorx' ),
            classes: 'vertical width-50',
            desc: __( 'Choose the page size for generated invoice PDFs', 'multivendorx' ),
            options: [
                {
                    key: 'per_transaction',
                    label: __( 'A4 (210 × 297 mm)', 'multivendorx' ),
                    value: 'per_transaction',
                },
                {
                    key: 'per_unit',
                    label: __( 'Letter (8.5 × 11 in)', 'multivendorx' ),
                    value: 'per_unit',
                },
                {
                    key: 'per_store',
                    label: __( 'Legal (8.5 × 14 in)', 'multivendorx' ),
                    value: 'per_store',
                },
            ],
        },
        {
            key: 'commission_type',
            type: 'setting-toggle',
            label: __( 'PDF layout orientation', 'multivendorx' ),
            classes: 'vertical width-50',
            desc: __( 'Choose whether invoices are generated in portrait or landscape mode', 'multivendorx' ),
            options: [
                {
                    key: 'portrait',
                    label: __( 'Portrait', 'multivendorx' ),
                    value: 'portrait',
                },
                {
                    key: 'landscape',
                    label: __( 'Landscape', 'multivendorx' ),
                    value: 'landscape',
                },
            ],
        },
        {
            key: 'type_options',
            type: 'checkbox',
            classes: 'vertical',
            label: __( 'Automatic email delivery', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            desc: __( 'Choose how invoices are automatically sent to customers and stores', 'multivendorx' ),
            options: [
                {
                    key: 'virtual',
                    label: __( 'Attach invoices to order emails', 'multivendorx' ),
                    value: 'virtual',
                },
                {
                    key: 'Send Separate Invoice Email',
                    label: __( 'Send separate invoice email', 'multivendorx' ),
                    value: 'downloadable',
                },
                {
                    key: 'Notify Stores of Invoice Generation',
                    label: __( 'Notify stores when invoices are generated', 'multivendorx' ),
                    value: 'downloadable',
                },
                {
                    key: 'Generate Packing Slips',
                    label: __( 'Generate packing slips', 'multivendorx' ),
                    value: 'downloadable',
                },
            ],
            selectDeselect: true,
        },
        {
            key: 'separator_content',
            type: 'section',
            desc: __( 'Add legal details and tax information to invoices', 'multivendorx' ),
            hint: __( 'Legal and tax information', 'multivendorx' ),
        },
        {
            key: 'mvx_tinymce_api_section',
            type: 'number',
            classes: 'vertical width-50',
            label: __( 'GST number', 'multivendorx' ),            
            placeholder: 'Enter GST registration number',
        },
        {
            key: 'mvx_tinymce_api_section',
            type: 'number',
            classes: 'vertical width-50',
            label: __( 'Tax ID number', 'multivendorx' ),            
            placeholder: 'Enter tax ID number',
        },
        {
            key: 'separator_content',
            type: 'section',
            desc: __( 'Customize invoice design with your branding and business details', 'multivendorx' ),
            hint: __( 'Branding and information', 'multivendorx' ),
        },
        {
            key: 'company_logo',
            classes: 'vertical',
            type: 'file',
            label: __('Company logo', 'mvx-pro'),
            desc: __('Upload your company logo for invoices', 'mvx-pro'),
            height: 75,
            width: 75,
            proSetting: true,
            moduleEnabled: 'invoice',
        },
    ],
};
