import { __ } from '@wordpress/i18n';

export default {
    id: 'system-status',
    priority: 2,
    name: __( 'System Status', 'multivendorx' ),
    desc: __(
        'Controls how stores are onboarded and what access they get.',
        'multivendorx'
    ),
    icon: 'adminlib-general-tab',
    submitUrl: 'settings',
    modal: [   
        {
            key: "system_information",
            type: "system-info",
            classes: "system-info-section",
            apiLink: "system-info",
            copyButtonLabel: "Copy System Info to Clipboard",
            copiedLabel: "Copied!", 
        },         
        {
            key: 'multivendorx_adv_log',
            type: 'log',
            classes: 'log-section',
            apiLink: 'logs',
            fileName: 'error.txt',
        },
        
    ],
};
