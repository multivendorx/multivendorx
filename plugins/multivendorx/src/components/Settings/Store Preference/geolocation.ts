import { __ } from '@wordpress/i18n';
import google from '../../../assets/images/google.png';
import mapbox from '../../../assets/images/mapbox-logo.png';

export default {
    id: 'geo-location',
    priority: 3,
    name: 'Geo Location',
    desc: __('Help customers discover stores and products near them by enabling location-based search and maps.','multivendorx'),
    icon: 'adminlib-form-section',
    submitUrl: 'settings',
    modal: [
        {
            key: 'radius_search_unit',
            type: 'setting-toggle',
            label: __( 'Show map on', 'multivendorx' ),
			settingDescription: __('Decide where the store map should appear:','multivendorx'),
            desc: __('<ul><li>Store listing – show the map on the store listing page.</li><li>Shop page – show the map on the shop page where all products are displayed.</li><li>Both – show the map on both pages for maximum visibility.</li></ul>','multivendorx'),
            options: [
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
				{
                    key: 'both',
                    label: __( 'Both', 'multivendorx' ),
                    value: 'both',
                },
            ],
        },
        {
            key: 'choose_map_api',
            type: 'setting-toggle',
            defaulValue: 'google_map_set',
            label: __( 'Map provider', 'multivendorx' ),
			settingDescription: __('Choose the service that powers your maps and location search:','multivendorx'),
            desc: __( '<ul><li>Google Maps – reliable and widely used, requires a Google API key.<li><li>Mapbox – customizable map provider, may also require an API key.</li></ul>', 'multivendorx' ),
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
                    img: mapbox,
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
            settingDescription: __( 'Define how customers can control their search radius when looking for nearby stores. This ensures they see results that are relevant to their location.', 'multivendorx' ),
			 desc: __( '<ul><li>Minimum distance – set the smallest possible radius a customer can select. For example, if set to 1 km, customers cannot search for anything closer than 1 km.<li><li>Maximum distance – set the largest radius available for search. For example, setting it to 500 km allows customers to expand their search across a wider region.</li><li>Units – decide whether distances are measured in kilometers or miles, depending on your store’s target region.</li></ul>', 'multivendorx' ),
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
