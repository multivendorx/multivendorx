import { __ } from '@wordpress/i18n';

export default {
    id: 'ship-station',
    priority: 8,
    headerTitle: __('Ship Station', 'multivendorx-pro'),
    headerDescription: __(
        'Manage your store’s shipping method, pricing rules, and location-based rates.',
        'multivendorx-pro'
    ),
    module: 'ship-station',
    headerIcon: 'shipstation',
    submitUrl: `store/${appLocalizer.store_id}`,
    modal: [],
};
