import { __ } from '@wordpress/i18n';
export default {
    id: 'extra',
    priority: 4,
    name: __( 'Extra', 'catalogx' ),
    desc: __(
        'Set up sales flow and catalog mode with integrated enquiry and quotation management.',
        'catalogx'
    ),
    icon: 'adminfont-cart',
    submitUrl: 'settings',
    modal: [
        {
            key: 'display_pdf',
            type: 'multi-checkbox-table',
            label: __( 'Attachment', 'catalogx' ),
            classes: 'gridTable',
            rows: [
                {
                    key: 'allow_download_pdf',
                    label: __( 'Download as PDF', 'catalogx' ),
                },
                {
                    key: 'attach_pdf_to_email',
                    label: __( 'Attach with Email', 'catalogx' ),
                },
            ],
            columns: [
                {
                    key: 'enquiry_pdf_permission',
                    label: __( 'Enquiry', 'catalogx' ),
                    moduleEnabled: 'enquiry',
                },
                {
                    key: 'quote_pdf_permission',
                    label: __( 'Quote', 'catalogx' ),
                    moduleEnabled: 'quote',
                },
            ],
            proSetting: true,
        },
        {
            key: 'custom_css_product_page',
            type: 'textarea',
            desc: __(
                'Put your custom css here, to customize the enquiry form.',
                'catalogx'
            ),
            label: __( 'Addional CSS', 'catalogx' ),
        },
    ],
};
