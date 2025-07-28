import { __ } from '@wordpress/i18n';

export default {
    id: 'store-location',
    priority: 3,
    name: __( ' Store Location', 'multivendorx' ),
    desc: __(
        'Configure visibility of store address & map.',
        'multivendorx'
    ),
    icon: 'adminlib-storefront',
    submitUrl: 'settings',
    modal: [
        {
            key: 'enable_store_map_for_vendor',
            type: 'checkbox',
            label: __( 'Store location', 'multivendorx' ),
            desc: __(
                "Enable or disable the option for displaying the store’s physical location on the store page. <li> ' shops.",
                'multivendorx'
            ),
            options: [
                {
                    key: 'enable_store_map_for_vendor',
                    value: 'enable_store_map_for_vendor',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'choose_map_api',
            type: 'select',
            defaulValue: 'google_map_set',
            label: __( 'Location Provider', 'multivendorx' ),
            desc: __( 'Select prefered location provider', 'multivendorx' ),
            options: [
                {
                    key: 'google_map_set',
                    label: __( 'Google map', 'multivendorx' ),
                    value: __( 'google_map_set', 'multivendorx' ),
                },
                {
                    key: 'mapbox_api_set',
                    label: __( 'Mapbox map', 'multivendorx' ),
                    value: __( 'mapbox_api_set', 'multivendorx' ),
                },
            ],
            dependent: {
                key: 'enable_store_map_for_vendor',
                set: true,
            },
        },
        {
            key: 'google_api_key',
            type: 'text',
            label: __( 'Google Map API key', 'multivendorx' ),
            desc: __(
                '<a href="https://developers.google.com/maps/documentation/javascript/get-api-key#get-an-api-key" target="_blank">Click here to generate key</a>',
                'multivendorx'
            ),
            dependent: {
                key: 'choose_map_api',
                set: true,
                value: 'google_map_set',
            },
        },
        {
            key: 'mapbox_api_key',
            type: 'text',
            label: __( 'Mapbox access token', 'multivendorx' ),
            desc: __(
                '<a href="https://docs.mapbox.com/help/getting-started/access-tokens/" target="_blank">Click here to generate access token</a>',
                'multivendorx'
            ),
            dependent: {
                key: 'choose_map_api',
                set: true,
                value: 'mapbox_api_set',
            },
        },
        {
            key: 'store_address_input',
            type: 'textarea',
            label: __( 'Store Address Input', 'multivendorx' ),
            desc: __( 'Enter the full store address. This information may be displayed on the vendor’s store page and used for shipping or location purposes.', 'multivendorx' ),
            placeholder: __( '123 Main Street, City, State, ZIP Code', 'multivendorx' ),
        },
        {
            key: 'radius_search_unit',
            type: 'setting-toggle',
            label: __( 'Radius Search - Unit', 'multivendorx' ),
            desc: __(
                'Select the unit of measurement for distance-based search filters on the store or product locator.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'kilometers',
                    label: __( 'Kilometers', 'multivendorx' ),
                    value: 'kilometers',
                },
                {
                    key: 'miles',
                    label: __( 'Miles', 'multivendorx' ),
                    value: 'miles',
                },
            ],
        },
        {
            key: 'radius_search_min_distance',
            type: 'number',
            label: __( 'Radius Search - Minimum Distance', 'multivendorx' ),
            desc: __( 'Set the minimum allowable distance (in selected unit) for radius-based search filters.', 'multivendorx' ),
        },
        {
            key: 'radius_search_max_distance',
            type: 'number',
            label: __( 'Radius Search - Maximum Distance', 'multivendorx' ),
            desc: __( 'Set the maximum allowable distance (in selected unit) for radius-based search filters.', 'multivendorx' ),
        },
        {
            key: 'map_zoom_level',
            type: 'number',
            label: __( 'Map Zoom Level', 'multivendorx' ),
            desc: __( 'Define the default zoom level of the map shown on the store or vendor page. Higher values zoom in closer.', 'multivendorx' ),
        }
                        
    ],
};