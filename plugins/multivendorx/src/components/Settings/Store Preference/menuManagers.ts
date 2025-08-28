import { __ } from '@wordpress/i18n';

export default {
    id: 'menu-manager',
    priority: 4,
    name: __( 'Menu Manager', 'multivendorx' ),
    desc: __(
        'Decide which menus vendors see in their dashboard and arrange their order.',
        'multivendorx'
    ),
    icon: 'adminlib-storefront',
    submitUrl: 'settings',
    modal: [
       {
            key: 'menu_manager',
            label: __( 'Menu manager', 'multivendorx' ),
            type: 'endpoint-editor',
            apiLink: 'endpoints'
        },
    ]    
};
