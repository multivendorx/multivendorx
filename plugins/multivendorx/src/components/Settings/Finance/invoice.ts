import { __ } from '@wordpress/i18n';
import template1 from '../../../assets/images/template/store/template1.jpg';
import template2 from '../../../assets/images/template/store/template2.jpg';
import template3 from '../../../assets/images/template/store/template3.jpg';

export default {
    id: 'store-invoice',
    priority: 5,
    name: __('Invoice & Taxation', 'mvx-pro'),
    desc: __('Set up when and how invoices are generated in your marketplace.', 'mvx-pro'),
    icon: 'adminlib-clock',
    submitUrl: 'settings',
    modal: [
        {
            key: 'mvx_tinymce_api_section',
            type: 'number',
            classes: 'vertical width-50',
            label: __( 'Invoice number format', 'multivendorx' ),            
            placeholder: 'Invoice number format',
            //proSetting:true
        },
        {
            key: 'mvx_tinymce_api_section',
            type: 'number',
            classes: 'vertical width-50',
            label: __( 'Starting invoice number', 'multivendorx' ),            
            placeholder: 'Starting invoice number',
            //proSetting:true
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
            //proSetting:true
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
            //proSetting:true
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
            //proSetting:true,
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
            //proSetting:true
        },
        {
            key: 'mvx_tinymce_api_section',
            type: 'number',
            classes: 'vertical width-50',
            label: __( 'Tax ID number', 'multivendorx' ),            
            placeholder: 'Enter tax ID number',
            //proSetting:true
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
            size: 'small',
            proSetting: true,
            moduleEnabled: 'invoice',
        },
        {
            key: 'store_color_settings',
            type: 'color-setting',
            label: 'Dashboard color scheme',
            settingDescription: 'Choose a dashboard color scheme from predefined sets or customize your own. Each scheme defines the button style, and hover effects for a consistent look.',
            images: [
                {
                    key: 'template1',
                    label: 'Outer Space',
                    img: template1,
                    value: 'template1',
                },
                {
                    key: 'template2',
                    label: 'Green Lagoon',
                    img: template2,
                    value: 'template2',
                },
                {
                    key: 'template3',
                    label: 'Old West',
                    img: template3,
                    value: 'template3',
                },
            ],
        },
    ],
};
