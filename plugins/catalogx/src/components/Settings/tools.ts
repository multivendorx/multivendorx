import { __ } from '@wordpress/i18n';

export default {
    id: 'tools',
    priority: 90,
    headerTitle: __( 'Tools', 'catalogx' ),
    headerDescription: __( 'Review all system logs and errors', 'catalogx' ),
    headerIcon: 'paint-brush',
    submitUrl: 'settings',
    modal: [
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
