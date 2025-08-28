import { __ } from '@wordpress/i18n';

export default {
    id: 'database-tools',
    priority: 1,
    name: __( 'Database Tools', 'multivendorx' ),
    desc: __(
        'Controls how stores are onboarded and what access they get.',
        'multivendorx'
    ),
    icon: 'adminlib-general-tab',
    submitUrl: 'settings',
    modal: [     
        {
            key: 'transients',
            type: 'button',
            name:__('Clear Transients', 'multivendorx'),
            label: __( 'MultivendorX Vendors Transients', 'multivendorx' ),
            desc: __(
                'This button clears all vendor dashboards transient cache',
                'multivendorx'
            ),
        },
        {
            key: 'visitor',
            type: 'button',
            name: __( 'Reset Database', 'multivendorx' ),
            label: __( 'Reset Visitors Stats Table', 'multivendorx' ),
            desc: __(
                'Use this tool to clear all the table data of MultivendorX visitors stats',
                'multivendorx'
            ),
        },
        {
            key: 'migrate_order',
            type: 'button',
            name: __( 'Order Migrate', 'multivendorx' ),
            label: __( 'Regenerate Suborders', 'multivendorx' ),
            desc: __(
                'With this tool, you can create missing sub orders',
                'multivendorx'
            ),
        },
        {
            key: 'migrate',
            type: 'button',
            name: __( 'Multivendor Migrate', 'multivendorx' ),
            label: __( 'Multivendor Migration', 'multivendorx' ),
            desc: __(
                'With this tool, you can transfer valuable data from your previous marketplace',
                'multivendorx'
            ),
        },
        {
            key: 'default_pages',
            type: 'button',
            name: __( 'Create default MultiVendorX Page', 'multivendorx' ),
            label: __( 'MultiVendorX Page', 'multivendorx' ),
            desc: __(
                'This tool will install all the missing MultiVendorX pages. Pages already defined and set up will not be replaced',
                'multivendorx'
            ),
        },
        
    ],
};
