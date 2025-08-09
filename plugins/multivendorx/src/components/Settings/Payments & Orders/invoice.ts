import { __ } from '@wordpress/i18n';

export default {
    id: 'store-invoice',
    priority: 4,
    name: __( 'Invoice', 'mvx-pro' ),
    desc: __( 'Select the PDF outupt mode.', 'mvx-pro' ),
    icon: 'adminlib-clock2',
    submitUrl: 'settings',
    modal: [
        {
            key: 'pdf_output',
            type: 'select',
            label: __( 'PDF Output', 'mvx-pro' ),
            desc: __( 'Select the PDF output mode.', 'mvx-pro' ),
            options: [
                {
                    key: 'download',
                    label: __( 'Download the PDF', 'mvx-pro' ),
                    value: 'download_pdf',
                },
                {
                    key: 'inline',
                    label: __( 'Open PDF in browser', 'mvx-pro' ),
                    value: 'inline_pdf',
                },
            ],
            proSetting: true,
            moduleEnabled: 'invoice',
        },
        {
            key: 'pdf_size',
            type: 'select',
            label: __( 'PDF Size', 'mvx-pro' ),
            desc: __( 'Select the PDF size.', 'mvx-pro' ),
            options: [
                {
                    key: 'a4',
                    label: __( 'A4', 'mvx-pro' ),
                    value: 'a4',
                },
                {
                    key: 'letter',
                    label: __( 'Letter', 'mvx-pro' ),
                    value: 'letter',
                },
            ],
            proSetting: true,
            moduleEnabled: 'invoice',
        },
        {
            key: 'pdf_orientation',
            type: 'select',
            label: __( 'PDF Orientation', 'mvx-pro' ),
            desc: __( 'Select the pdf orientation.', 'mvx-pro' ),
            options: [
                {
                    key: 'portrait',
                    label: __( 'Portrait', 'mvx-pro' ),
                    value: 'portrait',
                },
                {
                    key: 'landscape',
                    label: __( 'Landscape', 'mvx-pro' ),
                    value: 'landscape',
                },
            ],
            proSetting: true,
            moduleEnabled: 'invoice',
        },
        {
            key: 'attach_to_email_input',
            type: 'select',
            label: __( 'Attach to email', 'mvx-pro' ),
            desc: __( 'Select Order status to attach invoice.', 'mvx-pro' ),
            options: appLocalizer.available_emails_filtered,
            proSetting: true,
            moduleEnabled: 'invoice',
        },
        {
            key: 'choose_invoice_template',
            type: 'select',
            label: __( 'Select default invoice template', 'mvx-pro' ),
            options: [
                {
                    key: 'template1',
                    label: __( 'Template1', 'mvx-pro' ),
                    value: 'template1',
                },
                {
                    key: 'template2',
                    label: __( 'Template2', 'mvx-pro' ),
                    value: 'template2',
                },
                {
                    key: 'template3',
                    label: __( 'Template3', 'mvx-pro' ),
                    value: 'template3',
                },
                {
                    key: 'template4',
                    label: __( 'Template4', 'mvx-pro' ),
                    value: 'template4',
                },
                {
                    key: 'template5',
                    label: __( 'Template5', 'mvx-pro' ),
                    value: 'template5',
                },
            ],
            proSetting: true,
            moduleEnabled: 'invoice',
        },
        {
            key: 'invoice_template_1',
            type: 'blocktext',
            valuename: __( '', 'mvx-pro' ),
            blocktext: __(
                `<br><a target="_blank" class="mvx-preview-pdf-tpl" href="#">${ __(
                    'Click here to see preferred template view',
                    'mvx-pro'
                ) }</a>`,
                'multivendorx'
            ),
            dependent: {
                key: 'choose_invoice_template',
                value: 'template1',
            },
        },
        {
            key: 'invoice_template_2',
            type: 'blocktext',
            valuename: __( '', 'mvx-pro' ),
            blocktext: __(
                `<br><a target="_blank" class="mvx-preview-pdf-tpl" href="#">${ __(
                    'Click here to see preferred template view',
                    'mvx-pro'
                ) }</a>`,
                'multivendorx'
            ),
            dependent: {
                key: 'choose_invoice_template',
                value: 'template2',
            },
        },
        {
            key: 'invoice_template_3',
            type: 'blocktext',
            valuename: __( '', 'mvx-pro' ),
            blocktext: __(
                `<br><a target="_blank" class="mvx-preview-pdf-tpl" href="#">${ __(
                    'Click here to see preferred template view',
                    'mvx-pro'
                ) }</a>`,
                'multivendorx'
            ),
            dependent: {
                key: 'choose_invoice_template',
                value: 'template3',
            },
        },
        {
            key: 'invoice_template_4',
            type: 'blocktext',
            valuename: __( '', 'mvx-pro' ),
            blocktext: __(
                `<br><a target="_blank" class="mvx-preview-pdf-tpl" href="#">${ __(
                    'Click here to see preferred template view',
                    'mvx-pro'
                ) }</a>`,
                'multivendorx'
            ),
            dependent: {
                key: 'choose_invoice_template',
                value: 'template4',
            },
        },
        {
            key: 'invoice_template_5',
            type: 'blocktext',
            valuename: __( '', 'mvx-pro' ),
            blocktext: __(
                `<br><a target="_blank" class="mvx-preview-pdf-tpl" href="#">${ __(
                    'Click here to see preferred template view',
                    'mvx-pro'
                ) }</a>`,
                'multivendorx'
            ),
            dependent: {
                key: 'choose_invoice_template',
                value: 'template5',
            },
        },
        {
            key: 'pdf_invoice_fields',
            label: __( 'Invoice fields', 'mvx-pro' ),
            class: 'mvx-toggle-checkbox',
            type: 'checkbox',
            options: [
                {
                    key: 'is_store_add_disclaimer',
                    value: 'is_store_add_disclaimer',
                    label: __( 'Store disclaimer', 'mvx-pro' ),
                },
                {
                    key: 'is_store_add_gst_no',
                    value: 'is_store_add_gst_no',
                    label: __( 'Store GST number', 'mvx-pro' ),
                },
                {
                    key: 'is_store_add_tax_no',
                    value: 'is_store_add_tax_no',
                    label: __( 'Store TAX Number', 'mvx-pro' ),
                },
                {
                    key: 'is_store_add_digital_sign',
                    value: 'is_store_add_digital_sign',
                    label: __( 'Store Signature', 'mvx-pro' ),
                },
                {
                    key: 'is_store_add_shop_policy',
                    value: 'is_store_add_shop_policy',
                    label: __( 'Store policies', 'mvx-pro' ),
                },
                {
                    key: 'is_invoice_no',
                    value: 'is_invoice_no',
                    label: __( 'Invoice number', 'mvx-pro' ),
                },
            ],
            select_deselect: true,
            proSetting: true,
            moduleEnabled: 'invoice',
        },
        {
            key: 'invoice_no_format',
            type: 'text',
            label: __( 'Invoice number format', 'mvx-pro' ),
            desc: __(
                "Add alphanumeric invoice number prefix or use YEAR, MONTH, '-' & '/'.",
                'mvx-pro'
            ),
            proSetting: true,
            moduleEnabled: 'invoice',
        },
        {
            key: 'company_logo',
            type: 'file',
            label: __( 'Company logo', 'mvx-pro' ),
            desc: __( 'Upload brand image as logo', 'mvx-pro' ),
            height: 75,
            width: 75,
            proSetting: true,
            moduleEnabled: 'invoice',
        },
        {
            key: 'separator_content',
            type: 'section',
        },
        {
            key: 'admin_template_settings',
            type: 'blocktext',
            label: __( 'no_label', 'mvx-pro' ),
            blocktext: __( 'Admin Template Settings', 'mvx-pro' ),
        },
        {
            key: 'pdf_invoice_admin_fields',
            label: __( 'Invoice admin fields', 'mvx-pro' ),
            type: 'checkbox',
            select_deselect: true,
            options: [
                {
                    key: 'is_subtotal_admin',
                    value: 'is_subtotal_admin',
                    label: __( 'Subtotal', 'mvx-pro' ),
                },
                {
                    key: 'is_discount_admin',
                    value: 'is_discount_admin',
                    label: __( 'Discount', 'mvx-pro' ),
                },
                {
                    key: 'is_tax_admin',
                    value: 'is_tax_admin',
                    label: __( 'Tax', 'mvx-pro' ),
                },
                {
                    key: 'is_shipping_admin',
                    value: 'is_shipping_admin',
                    label: __( 'Shipping', 'mvx-pro' ),
                },
                {
                    key: 'is_payment_method_admin',
                    value: 'is_payment_method_admin',
                    label: __( 'Payment Method', 'mvx-pro' ),
                },
            ],
            proSetting: true,
            moduleEnabled: 'invoice',
        },
        {
            key: 'term_and_conditions_admin',
            type: 'textarea',
            label: __( 'Term and conditions', 'mvx-pro' ),
            desc: __( '', 'mvx-pro' ),
            proSetting: true,
            moduleEnabled: 'invoice',
        },
        {
            key: 'is_customer_note_admin',
            label: __( 'Show Customer Note', 'mvx-pro' ),
            type: 'checkbox',
            desc: __( 'Show customer note for admin PDF.', 'mvx-pro' ),
            options: [
                {
                    key: 'is_customer_note_admin',
                    value: 'is_customer_note_admin',
                },
            ],
            look: 'toggle',
            proSetting: true,
            moduleEnabled: 'invoice',
        },
        {
            key: 'admin_gst_no',
            type: 'text',
            label: __( 'GST No', 'mvx-pro' ),
            desc: __(
                'Set admin GST number for admin invoice only',
                'mvx-pro'
            ),
            proSetting: true,
            moduleEnabled: 'invoice',
        },
        {
            key: 'admin_tax_no',
            type: 'text',
            label: __( 'TAX No', 'mvx-pro' ),
            desc: __(
                'Set admin TAX number for admin invoice only',
                'mvx-pro'
            ),
            proSetting: true,
            moduleEnabled: 'invoice',
        },
        {
            key: 'admin_signature',
            type: 'file',
            label: __( 'Admin signature', 'mvx-pro' ),
            desc: __( 'Upload image as admin signature', 'mvx-pro' ),
            height: 75,
            width: 75,
            proSetting: true,
            moduleEnabled: 'invoice',
        },
        {
            key: 'separator_content',
            type: 'section',
        },
        {
            key: 'customer_template_settings',
            type: 'blocktext',
            label: __( 'no_label', 'mvx-pro' ),
            blocktext: __( 'Customer Template Settings', 'mvx-pro' ),
        },
        {
            key: 'customer_attach_to_email',
            type: 'select',
            label: __( 'Attach invoice to customer to email', 'mvx-pro' ),
            desc: __( 'Select Order status to attach invoice.', 'mvx-pro' ),
            options: appLocalizer.available_emails_filtered,
            proSetting: true,
            moduleEnabled: 'invoice',
        },
        {
            key: 'is_customer_download_invoice',
            label: __(
                'Choose Order Types for Customer Invoice Access',
                'mvx-pro'
            ),
            type: 'checkbox',
            select_deselect: true,
            options: [
                {
                    key: 'order_invoice_customer',
                    value: 'order_invoice_customer',
                    label: __( 'Main Order Invoice', 'mvx-pro' ),
                },
                {
                    key: 'suborder_invoice_customer',
                    value: 'suborder_invoice_customer',
                    label: __( 'Suborder Invoice', 'mvx-pro' ),
                },
            ],
            proSetting: true,
            moduleEnabled: 'invoice',
        },
        {
            key: 'status_to_download_invoice',
            type: 'multi-select',
            label: __(
                'Choose Order Status for Customer Invoice Access',
                'mvx-pro'
            ),
            desc: __(
                'Choose the order statuses for customer invoice downloads.',
                'mvx-pro'
            ),
            dependent: {
                key: 'is_customer_download_invoice',
                set: true,
            },
            options: appLocalizer.order_statuses,
            select_deselect: true,
            proSetting: true,
            moduleEnabled: 'invoice',
        },
        {
            key: 'pdf_invoice_customer_fields',
            label: __( 'Invoice customer fields', 'mvx-pro' ),
            type: 'checkbox',
            select_deselect: true,
            options: [
                {
                    key: 'is_subtotal_customer',
                    value: 'is_subtotal_customer',
                    label: __( 'Subtotal', 'mvx-pro' ),
                },
                {
                    key: 'is_discount_customer',
                    value: 'is_discount_customer',
                    label: __( 'Discount', 'mvx-pro' ),
                },
                {
                    key: 'is_tax_customer',
                    value: 'is_tax_customer',
                    label: __( 'Tax', 'mvx-pro' ),
                },
                {
                    key: 'is_shipping_customer',
                    value: 'is_shipping_customer',
                    label: __( 'Shipping', 'mvx-pro' ),
                },
                {
                    key: 'is_payment_method_customer',
                    value: 'is_payment_method_customer',
                    label: __( 'Payment Method', 'mvx-pro' ),
                },
            ],
            proSetting: true,
            moduleEnabled: 'invoice',
        },
        {
            key: 'term_and_conditions_customer',
            type: 'textarea',
            label: __( 'Term and conditions', 'mvx-pro' ),
            desc: __( '', 'mvx-pro' ),
            proSetting: true,
            moduleEnabled: 'invoice',
        },
        {
            key: 'is_customer_note_customer',
            label: __( 'Show Customer Note', 'mvx-pro' ),
            type: 'checkbox',
            desc: __( 'Show customer note for customer PDF.', 'mvx-pro' ),
            options: [
                {
                    key: 'is_customer_note_customer',
                    value: 'is_customer_note_customer',
                },
            ],
            look: 'toggle',
            proSetting: true,
            moduleEnabled: 'invoice',
        },
        {
            key: 'is_packing_slip_customer',
            label: __( 'Enable Packing Slip', 'mvx-pro' ),
            type: 'checkbox',
            desc: __( 'Enable packing slip.', 'mvx-pro' ),
            options: [
                {
                    key: 'is_packing_slip_customer',
                    value: 'is_packing_slip_customer',
                },
            ],
            look: 'toggle',
            proSetting: true,
            moduleEnabled: 'invoice',
        },
        {
            key: 'store_template_settings',
            type: 'blocktext',
            label: __( 'no_label', 'mvx-pro' ),
            blocktext: __( 'Store Template Settings', 'mvx-pro' ),
        },
        {
            key: 'pdf_invoice_store_fields',
            type: 'checkbox',
            select_deselect: true,
            label: __( 'Invoice Store fields', 'mvx-pro' ),
            options: [
                {
                    key: 'is_subtotal_store',
                    label: __( 'Subtotal', 'mvx-pro' ),
                    value: 'is_subtotal_store',
                },
                {
                    key: 'is_discount_store',
                    label: __( 'Discount', 'mvx-pro' ),
                    value: 'is_discount_store',
                },
                {
                    key: 'is_tax_store',
                    label: __( 'Tax', 'mvx-pro' ),
                    value: 'is_tax_store',
                },
                {
                    key: 'is_shipping_store',
                    label: __( 'Shipping', 'mvx-pro' ),
                    value: 'is_shipping_store',
                },
                {
                    key: 'is_payment_method_store',
                    label: __( 'Payment Method', 'mvx-pro' ),
                    value: 'is_payment_method_store',
                },
            ],
            proSetting: true,
            moduleEnabled: 'invoice',
        },
    ],
};
