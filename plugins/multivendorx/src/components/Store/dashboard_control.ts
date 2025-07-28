import { __ } from '@wordpress/i18n';

export default {
    id: 'dashboard-control',
    priority: 7,
    name: __( 'Dashboard Control', 'multivendorx' ),
    desc: __(
        'Manage store owner dashboard layout',
        'multivendorx'
    ),
    icon: 'adminlib-storefront',
    submitUrl: 'settings',
    modal: [
        {
            key: 'customize_dashboard_menu',
            type: 'checkbox',
            label: __( 'Customize Dashboard Menu', 'multivendorx' ),
            desc: __( 'Enable this to allow vendors or admins to customize the vendor dashboard menu.', 'multivendorx' ),
            options: [
                {
                    key: 'customize_dashboard_menu',
                    value: 'customize_dashboard_menu',
                },
            ],
            look: 'toggle',
        }        
    ]    
};