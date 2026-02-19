import { __ } from '@wordpress/i18n';

export default {
    id: 'business-address',
    headerTitle: __('Business Address', 'multivendorx'),
    headerDescription: __(
        'Provide your business address, city, zip code, country, state, and timezone to ensure accurate order and location settings.',
        'multivendorx'
    ),
    headerIcon: 'form-address',
    submitUrl: `store/${appLocalizer.store_id}`,
    modals: []
}