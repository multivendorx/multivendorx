import { __ } from '@wordpress/i18n';

export default {
    id: 'menu-manager',
    priority: 2,
    name: __( 'Menu Manager', 'multivendorx' ),
    desc: __(
        'Control public visibility of store and seller info',
        'multivendorx'
    ),
    icon: 'adminlib-storefront',
    submitUrl: 'settings',
    modal: [
        {
            key: 'vendor_dashboard_page',
            type: 'select',
            label: __( 'Vendor Dashboard page', 'multivendorx' ),
            desc: __(
                'Select the page on which you have inserted <code>[vendor_registration]</code> shortcode.This is the page where new vendors can sign up.',
                'multivendorx'
            ),
            options: appLocalizer.vendor_dashboard_pages,
        },
        {
            key: 'menu_manager',
            label: __( 'Menu manager', 'multivendorx' ),
            type: 'endpoint-editor',
            apiLink: 'endpoints'
        },
    ]    
};