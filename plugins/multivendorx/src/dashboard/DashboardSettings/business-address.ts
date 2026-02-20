import { __ } from '@wordpress/i18n';

export default {
    id: 'business-address',
    priority: 4,
    headerTitle: __('Business Address', 'multivendorx'),
    headerDescription: __(
        'Provide your business address, city, zip code, country, state, and timezone to ensure accurate order and location settings.',
        'multivendorx'
    ),
    headerIcon: 'location',
    submitUrl: `store/${appLocalizer.store_id}`,
    modals: [
        {
            type: 'text',
            name: 'address',
            label: __('Address *', 'multivendorx'),
            required: true,
            placeholder: __('Enter your street address', 'multivendorx')
        },
        {
            type: 'text',
            name: 'city',
            label: __('City', 'multivendorx'),
            placeholder: __('Enter city name', 'multivendorx')
        },
        {
            type: 'number',
            name: 'zip',
            label: __('Zip code', 'multivendorx'),
            placeholder: __('Enter zip/postal code', 'multivendorx')
        },
        {
            type: 'select',
            name: 'country',
            label: __('Country', 'multivendorx'),
            options: [],
            placeholder: __('Select country', 'multivendorx')
        },
        {
            type: 'select',
            name: 'state',
            label: __('State', 'multivendorx'),
            options: [], // This will be populated dynamically based on selected country
            dependsOn: {
                field: 'country',
            }
        },
        {
            type: 'custom',
            name: 'map_component',
            render: 'MapComponent' // This would need to be registered in your FIELD_REGISTRY
        },
        {
            type: 'hidden',
            name: 'location_lat'
        },
        {
            type: 'hidden',
            name: 'location_lng'
        }
    ]
};