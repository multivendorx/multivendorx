import { __ } from '@wordpress/i18n';

const columns = Object.entries(appLocalizer.custom_roles).map(([key, value]) => {
    return {
        key,
        label: value,
    };
});

export default {
    id: 'user-capability',
    priority: 2,
    name: __('User Capabilities', 'multivendorx'),
    desc: __('Define what each store role can access and manage within the marketplace.', 'multivendorx'),
    icon: 'adminlib-wholesale',
    submitUrl: 'settings',
    modal: [
        {
            key: 'role_access_table',
            type: 'multi-checkbox-table',
            columns: columns,
            rows: appLocalizer.capabilities,
        },
    ],
};
