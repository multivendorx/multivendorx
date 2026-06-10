import { __ } from '@wordpress/i18n';
export default {
    id: 'extra',
    priority: 4,
    headerTitle: __( 'Extra', 'catalogx' ),
    headerDescription: __(
        'Set up sales flow and catalog mode with integrated enquiry and quotation management.',
        'catalogx'
    ),
    headerIcon: 'cart',
    submitUrl: 'settings',
    modal: [
        {
            key: 'display_pdf',
            type: 'multi-checkbox-table',
            storeSetting: true,
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
                    type: 'checkbox',
                    moduleEnabled: 'enquiry',
                },
                {
                    key: 'quote_pdf_permission',
                    label: __( 'Quote', 'catalogx' ),
                    type: 'checkbox',
                    moduleEnabled: 'quote',
                },
            ],
            proSetting: true,
        },
    ],
};
