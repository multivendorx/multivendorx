import { __ } from '@wordpress/i18n';
import SampleProduct from '../../assets/images/sample-product.jpg';

export default {
    id: 'enquiry-catalog-customization',
    priority: 2,
    name: __( 'Product Page Builder', 'catalogx' ),
    desc: __(
        'Drag-and-drop to create and customize single product page elements.',
        'catalogx'
    ),
    icon: 'adminlib-web-page-website',
    submitUrl: 'settings',
    modal: [
        {
            key: 'catalog_customizer',
            type: 'catalog-customizer',
            desc: __( 'Catalog Customizer', 'catalogx' ),
            classes: 'catalog-customizer-wrapper',
            image: SampleProduct,
        },
    ],
};
