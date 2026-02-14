import { __ } from '@wordpress/i18n';

export default {
    id: 'general',
    priority: 6,
    name: __('General', 'multivendorx'),
    desc: __(
        'Set up when and how invoices are generated in your marketplace.',
        'multivendorx'
    ),
    icon: 'adminfont-invoice',
    submitUrl: 'settings',
    modal: [
        {
            key: 'company_logo',
            classes: 'vertical w-50',
            type: 'file',
            label: __('Company logo', 'multivendorx'),
            desc: __('Upload your company logo for invoices', 'multivendorx'),
            proSetting: true,
            moduleEnabled: 'invoice',
        },
        {
            key: 'company_logo',
            classes: 'vertical w-50',
            type: 'file',
            label: __('Invoice signature', 'multivendorx'),
            desc: __('Optional signature image that adds authenticity to your invoices.', 'multivendorx'),
            proSetting: true,
            moduleEnabled: 'invoice',
        },
        {
            key: 'separator_content',
            type: 'section',
            desc: __(
                'Control when invoices are automatically created based on order status.',
                'multivendorx'
            ),
            hint: __('Automatic invoice generation', 'multivendorx'),
        },
        {
            key: 'type_options',
            type: 'checkbox',
            label: __('Who receives invoices?', 'multivendorx'),
            classes: 'vertical',
            // desc: __(
            //     'Select which invoices your marketplace should generate. Most stores only need the first option.',
            //     'multivendorx'
            // ),
            options: [
                {
                    key: 'completed',
                    label: __('Completed', 'multivendorx'),
                    value: 'completed',
                    desc: __('Order is delivered and customer has received all items.', 'multivendorx')
                },
                {
                    key: 'processing',
                    label: __('Processing', 'multivendorx'),
                    value: 'processing',
                    desc: __('Payment received and order is being prepared for shipment.', 'multivendorx')
                },
                {
                    key: 'paid',
                    label: __('Paid', 'multivendorx'),
                    value: 'paid',
                    desc: __('Payment has been confirmed.', 'multivendorx')
                },
                {
                    key: 'on-hold',
                    label: __('On Hold', 'multivendorx'),
                    value: 'on-hold',
                    desc: __('Order placed on hold pending verification.', 'multivendorx')
                },
                {
                    key: 'pending-payment',
                    label: __('Pending Payment', 'multivendorx'),
                    value: 'pending-payment',
                    desc: __('Order created but awaiting payment (useful for bank transfers, checks)', 'multivendorx')
                },
            ],
            selectDeselect: true,
        },
        {
            key: 'display_customer_order',
            type: 'setting-toggle',
            classes: 'vertical full-width',
            label: __('Customers will see information for', 'multivendorx'),
            custom: true,
            options: [
                {
                    key: 'mainorder',
                    label: __('Customer Purchase Invoices (Recommended)', 'multivendorx'),
                    // desc: __('Customer receives separate emails and sees individual store orders', 'multivendorx'),
                    icon: 'adminfont-cart',
                    value: 'mainorder',
                    customHtml: `<div class="toggle-notice">
									<ul>
										<li><b> What it does: </b>  Creates invoices for customers when they buy products</li>
										<li><b> Example: </b> Customer Jane buys a product → She receives invoice #INV-001</li>
										<li><b> Use this if:</b> You want customers to get invoices for their purchases (most common) </li>
									</ul>
								</div>`
                },
                {
                    key: 'suborder',
                    icon: 'adminfont-cart',
                    label: __('Vendor Payout Statements', 'multivendorx'),
                    desc: __('Customer receives separate emails and sees individual store orders', 'multivendorx'),
                    value: 'suborder',
                    customHtml: `<div class="toggle-notice">
									<ul>
										<li><b> What it does: </b>  Creates payment statements when you pay vendors their earnings</li>
										<li><b> Example: </b> Vendor John earned $500, you take $50 commission → John receives statement showing $450 payout</li>
										<li><b> Use this if:</b> You want to document vendor payments and commissions </li>
									</ul>
								</div>`
                },
                {
                    key: 'mainnsub',
                    icon: 'adminfont-cart',
                    label: __('Marketplace Fee Invoices (Admin to Vendor)', 'multivendorx'),
                    desc: __('Customer receives multiple emails and sees all order versions', 'multivendorx'),
                    value: 'mainnsub',
                    customHtml: `<div class="toggle-notice">
									<ul>
										<li><b> What it does: </b> Creates invoices you send TO vendors for marketplace fees</li>
										<li><b> Example: </b>  You charge vendors a monthly $20 listing fee → They receive invoice for $20</li>
										<li><b> Use this if:</b> You charge vendors subscription fees, listing fees, or other platform charges </li>
									</ul>
								</div>`
                },
                {
                    key: 'wholesale',
                    icon: 'adminfont-cart',
                    label: __('Wholesale / B2B Invoices', 'multivendorx'),
                    desc: __('Customer receives multiple emails and sees all order versions', 'multivendorx'),
                    value: 'wholesale',
                    customHtml: `<div class="toggle-notice">
									<ul>
										<li><b> What it does: </b> Creates special invoices for bulk business orders</li>
										<li><b> Example: </b>  A company orders 100 units at wholesale price → They receive B2B invoice</li>
										<li><b> You have wholesale customers who buy in bulk with special terms </li>
									</ul>
								</div>`
                },
            ],
        },
        {
            key: 'separator_content',
            type: 'section',
            desc: __(
                'Set up how your invoice numbers are formatted. This helps with organization and makes invoices easier to track for accounting.',
                'multivendorx'
            ),
            hint: __('Invoice numbering', 'multivendorx'),
        },
        {
            key: 'multivendorx_tinymce_api_section',
            type: 'text',
            classes: 'vertical w-50',
            label: __('Numbering format', 'multivendorx'),
            desc: __(
                'Choose how invoice numbers increase over time.',
                'multivendorx'
            ),
            // placeholder: 'Enter GST registration number',
            moduleEnabled: 'invoice',
            size: '25rem',
            proSetting: true,
        },
        {
            key: 'multivendorx_tinymce_api_section',
            type: 'text',
            classes: 'vertical w-50',
            label: __('Starting number', 'multivendorx'),
            placeholder: 'The first invoice number (usually 1 or 1000)',
            size: '25rem',
            moduleEnabled: 'invoice',
            proSetting: true,
        },
        {
            key: 'multivendorx_tinymce_api_section',
            type: 'text',
            classes: 'vertical w-50',
            label: __('Invoice prefix', 'multivendorx'),
            placeholder: 'Text that appears before the number. Example results: INV-2026-0001, INV-MVX-0001',
            size: '25rem',
            moduleEnabled: 'invoice',
            proSetting: true,
        },
        // {
        //     key: 'commission_type',
        //     type: 'setting-toggle',
        //     classes: 'vertical w-50',
        //     label: __('Invoice numbering mode', 'multivendorx'),
        //     moduleEnabled: 'invoice',
        //     options: [
        //         {
        //             key: 'per_transaction',
        //             label: __('Global (marketplace-wide)', 'multivendorx'),
        //             value: 'per_transaction',
        //         },
        //         {
        //             key: 'per_unit',
        //             label: __('Per store (separate sequences)', 'multivendorx'),
        //             value: 'per_unit',
        //         }
        //     ],
        // },

        {
            key: 'separator_content',
            type: 'section',
            desc: __(
                'A4 is standard internationally, Letter is standard in North America',
                'multivendorx'
            ),
            hint: __('PDF format', 'multivendorx'),
        },
        {
            key: 'commission_type',
            type: 'setting-toggle',
            classes: 'vertical w-50',
            label: __('Page size', 'multivendorx'),
            moduleEnabled: 'invoice',
            options: [
                {
                    key: 'per_transaction',
                    label: __('A4 (210 × 297 mm)', 'multivendorx'),
                    value: 'per_transaction',
                },
                {
                    key: 'per_unit',
                    label: __('Letter (8.5 × 11 in)', 'multivendorx'),
                    value: 'per_unit',
                },
                {
                    key: 'per_unit',
                    label: __('Legal (8.5 × 14 in)', 'multivendorx'),
                    value: 'per_unit',
                }
            ],
        },
        {
            key: 'commission_type',
            type: 'setting-toggle',
            classes: 'vertical w-50',
            label: __('Orientation', 'multivendorx'),
            moduleEnabled: 'invoice',
            options: [
                {
                    key: 'per_transaction',
                    label: __('Portrait (Vertical)', 'multivendorx'),
                    value: 'per_transaction',
                },
                {
                    key: 'per_unit',
                    label: __('Landscape (Horizontal)', 'multivendorx'),
                    value: 'per_unit',
                }
            ],
        },
        {
            key: 'separator_content',
            type: 'section',
            desc: __(
                'Choose when and how invoices are automatically emailed to customers and vendors.',
                'multivendorx'
            ),
            hint: __('Invoice delivery via email', 'multivendorx'),
        },
        {
            key: 'type_options',
            type: 'checkbox',
            classes: 'vertical',
            label: __('When to send invoice emails  ', 'multivendorx'),

            desc: __(
                'Choose how invoices are automatically sent to customers and stores',
                'multivendorx'
            ),
            moduleEnabled: 'invoice',
            options: [
                {
                    key: 'virtual',
                    label: __(
                        'Attach to order confirmation email',
                        'multivendorx'
                    ),
                    desc: __('Include invoice PDF with the order confirmation customers already receive.', 'multivendorx'),
                    value: 'virtual',
                },
                {
                    key: 'Send Separate Invoice Email',
                    label: __('Send separate invoice email', 'multivendorx'),
                    desc: __('Dedicated email with invoice', 'multivendorx'),
                    value: 'downloadable',
                },
                {
                    key: 'Notify Stores of Invoice Generation',
                    label: __(
                        'Notify stores',
                        'multivendorx'
                    ),
                    desc: __('Send a copy to the vendor when their sale generates an invoice.', 'multivendorx'),
                    value: 'downloadable',
                },
                {
                    key: 'Generate Packing Slips',
                    label: __('Include packing slip', 'multivendorx'),
                    desc: __('Also generate and attach a packing slip with the invoice.', 'multivendorx'),
                    value: 'downloadable',
                },
            ],
            proSetting: true,
            selectDeselect: true,
        },
        {
            key: 'separator_content',
            type: 'section',
            // desc: __(
            // 	'Add legal details and tax information to invoices',
            // 	'multivendorx'
            // ),
            hint: __('Invoice Content Controls', 'multivendorx'),
        },
        {
            key: 'seller_agreement',
            type: 'textarea',
            classes: 'vertical w-50',
            label: __('Invoice footer text', 'multivendorx'),
        },
        {
            key: 'seller_agreement',
            type: 'textarea',
            classes: 'vertical w-50',
            label: __('Terms and conditions', 'multivendorx'),
        },

        {
            key: 'customer_access',
            type: 'checkbox',
            classes: 'vertical w-50',
            label: __('Customer Access', 'multivendorx'),
            desc: __(
                'Control how customers can access their invoices',
                'multivendorx'
            ),
            options: [
                {
                    key: 'my_account_download',
                    label: __('Allow download from "My Account"', 'multivendorx'),
                    desc: __('Customers can access invoices from their dashboard', 'multivendorx'),
                    value: 'my_account_download',
                },
                {
                    key: 'order_confirmation_download',
                    label: __('Allow download from order list', 'multivendorx'),
                    desc: __('Include invoice link on the order confirmation page', 'multivendorx'),
                    value: 'order_confirmation_download',
                },
            ],
            proSetting: true,
            selectDeselect: true,
        },

        {
            key: 'packing_slips',
            type: 'checkbox',
            classes: 'vertical w-50',
            label: __('Packing Slips', 'multivendorx'),
            desc: __(
                'Configure packing slip display options',
                'multivendorx'
            ),
            options: [
                {
                    key: 'include_prices',
                    label: __('Include prices on packing slips', 'multivendorx'),
                    desc: __('Show item prices on packing slips', 'multivendorx'),
                    value: 'include_prices',
                },
                {
                    key: 'use_store_address',
                    label: __('Use store address', 'multivendorx'),
                    desc: __('Use store address instead of marketplace address', 'multivendorx'),
                    value: 'use_store_address',
                },
            ],
            proSetting: true,
            selectDeselect: true,
        },


        {
            key: 'separator_content',
            type: 'section',
            desc: __(
                'Add your business registration numbers and tax IDs that must appear on invoices.',
                'multivendorx'
            ),
            hint: __('Legal and tax information', 'multivendorx'),
        },
        {
            key: 'tax_information',
            type: 'expandable-panel',
            label: __('Legal and tax information', 'multivendorx'),
            // settingDescription: __(
            //     'Define the key factors customers will use to evaluate each store.',
            //     'multivendorx'
            // ),
            // desc: __(
            //     'Give customers a fair way to share feedback! Define what they rate, like product/listing quality, delivery, or service. You’ll start with five default parameters that can be edited or removed, but make sure at least three stay active for balanced, detailed reviews.',
            //     'multivendorx'
            // ),
            addNewBtn: true,
            addNewTemplate: {
                label: 'New Tax information',
                formFields: [
                    {
                        key: 'label',
                        type: 'text',
                        label: 'Tax information',
                        placeholder: 'Enter tax information',
                    },
                ],
            },
            modal: [],
        },
        {
            key: 'multivendorx_tinymce_api_section',
            type: 'number',
            classes: 'vertical w-50',
            label: __('VAT / Tax number', 'multivendorx'),
            placeholder: 'e.g., GB123456789, DE987654321',
            desc: __('Your VAT registration (Europe) or tax ID number.', 'multivendorx'),
            moduleEnabled: 'invoice',
            proSetting: true,
        },
        {
            key: 'multivendorx_tinymce_api_section',
            type: 'number',
            classes: 'vertical w-50',
            label: __('Additional Tax ID', 'multivendorx'),
            placeholder: 'e.g., EIN, ABN, GST Number',
            desc: __('Other tax IDs: EIN (US), ABN (Australia), GST (India), etc.', 'multivendorx'),
            moduleEnabled: 'invoice',
            proSetting: true,
        },
        {
            key: 'multivendorx_tinymce_api_section',
            type: 'number',
            classes: 'vertical w-50',
            label: __('Company registration number', 'multivendorx'),
            placeholder: 'e.g., Company No. 12345678',
            desc: __('Your official company registration number.', 'multivendorx'),
            moduleEnabled: 'invoice',
            proSetting: true,
        },
        {
            key: 'multivendorx_tinymce_api_section',
            type: 'number',
            classes: 'vertical w-50',
            label: __('Trade License Number', 'multivendorx'),
            placeholder: 'e.g., License No. ABC-2024-12345',
            desc: __('Business license or permit number (if required).', 'multivendorx'),
            moduleEnabled: 'invoice',
            proSetting: true,
        },
    ],
};
