import { __ } from '@wordpress/i18n';

export default {
    id: 'menu-manager',
    priority: 8,
    name: __( 'Menu Manager', 'multivendorx' ),
    desc: __(
        'Control public visibility of store and seller info',
        'multivendorx'
    ),
    icon: 'adminlib-storefront',
    submitUrl: 'settings',
    modal: [
       
    ]    
};