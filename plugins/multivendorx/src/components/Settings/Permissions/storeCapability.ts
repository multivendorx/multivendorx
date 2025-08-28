import { __ } from '@wordpress/i18n';

const capabilityOptions = Object.entries(appLocalizer.capabilities).map(([key, group]) => {
    return {
        key,
        type: 'checkbox',
        label: group.label,
        desc: group.desc,
        options: Object.entries(group.capability).map(([capKey, capLabel]) => ({
            key: capKey,
            label: capLabel,
            value: capKey,
        })),
        selectDeselect: true,
    };
});

export default {
    id: 'store-capability',
    priority: 1,
    name: __('Store Capabilities', 'multivendorx'),
    desc: __('Control which features and actions are available to each store role.', 'multivendorx'),
    icon: 'adminlib-wholesale',
    submitUrl: 'settings',
    modal: capabilityOptions,
};
