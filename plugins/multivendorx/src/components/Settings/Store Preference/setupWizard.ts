import { __ } from '@wordpress/i18n';
import google from '../../../assets/images/google.png';

export default {
    id: 'geo-location',
    priority: 3,
    name: 'Geo Location',
    desc: __(
        'Help customers easily find nearby vendors and products with location-based search. Configure map providers to control how location search works across your marketplace.',
        'multivendorx'
    ),
    icon: 'adminlib-form-section',
    submitUrl: 'settings',
    modal: [
        {
            key: 'radius_search_unit',
            type: 'setting-toggle',
            label: __( 'Show map', 'multivendorx' ),
            desc: __(
                'Select the unit of measurement for distance-based search filters on the store or product locator.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'both',
                    label: __( 'Both', 'multivendorx' ),
                    value: 'both',
                },
                {
                    key: 'store_lisiting',
                    label: __( 'Store lisiting', 'multivendorx' ),
                    value: 'store_lisiting',
                },
                {
                    key: 'shop_page',
                    label: __( 'Shop page', 'multivendorx' ),
                    value: 'shop_page',
                },
            ],
        },
        {
            key: 'choose_map_api',
            type: 'setting-toggle',
            defaulValue: 'google_map_set',
            label: __( 'Map provider', 'multivendorx' ),
            desc: __( 'Select the map service that will power location features and maps across the site. Different providers may require an API key.', 'multivendorx' ),
            options: [
                {
                    key: 'google_map_set',
                    label: __( 'Google map', 'multivendorx' ),
                    value: __( 'google_map_set', 'multivendorx' ),
                    img: google,
                },
                {
                    key: 'mapbox_api_set',
                    label: __( 'Mapbox map', 'multivendorx' ),
                    value: __( 'mapbox_api_set', 'multivendorx' ),
                    img: google,
                },
            ],
        },
        {
            key: 'google_api_key',
            type: 'text',
            label: __( 'Google map API key', 'multivendorx' ),
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
            key: 'radius_search_distance',
            type: 'multi-number',
            label: __( 'Location search', 'multivendorx' ),
            desc: __( 'Help customers find nearby stores with location-based search.', 'multivendorx' ),
            options: [
                {
                    key: 'radius_search_min_distance',
                    label: __( 'Min', 'multivendorx' ),
                    type: 'number',
                },
                {
                    key: 'radius_search_max_distance',
                    label: __( 'Max', 'multivendorx' ),
                    type: 'number',
                },
                {
                    key: 'radius_search_unit',
                    type: 'radio',
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
            ],
        },    
    ],
};
