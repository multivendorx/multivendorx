import { __ } from '@wordpress/i18n';

export default {
	id: 'geolocation',
	priority: 8,
	name: 'Geolocation',
	desc: __(
		'Help customers discover stores and products/listings near them by enabling location-based search and maps.',
		'multivendorx'
	),
	icon: 'adminfont-location',
	submitUrl: 'settings',
	modal: [
		{
			key: 'radius_search_unit',
			type: 'setting-toggle',
			label: __('Show map on', 'multivendorx'),
			settingDescription: __(
				'Decide where the store map should appear.',
				'multivendorx'
			),
			desc: __(
				'<ul><li>Store listing - Display a map on the page that lists all stores, showing their locations for easier discovery.</li><li>Shop page - Display a map on the store’s shop page showing the store’s location.</li><li>Both - Show the map on both pages for maximum visibility.</li></ul>',
				'multivendorx'
			),
			options: [
				{
					key: 'store_lisiting',
					label: __('Store lisiting', 'multivendorx'),
					value: 'store_lisiting',
				},
				{
					key: 'shop_page',
					label: __('Shop page', 'multivendorx'),
					value: 'shop_page',
				},
				{
					key: 'both',
					label: __('Both', 'multivendorx'),
					value: 'both',
				},
			],
			moduleEnabled: 'geo-location',
		},
		{
			key: 'choose_map_api',
			type: 'setting-toggle',
			defaulValue: 'google_map_set',
			label: __('Map provider', 'multivendorx'),
			settingDescription: __(
				'Choose the service that powers your maps and location search.',
				'multivendorx'
			),
			desc: __(
				'<ul><li>Google Map - reliable and widely used, requires a Google API key.<li>Mapbox - customizable map provider, may also require an API key.</li></ul>',
				'multivendorx'
			),
			options: [
				{
					key: 'google_map_set',
					label: __('Google', 'multivendorx'),
					value: __('google_map_set', 'multivendorx'),
					icon: 'adminfont-google',
				},
				{
					key: 'mapbox_api_set',
					label: __('Mapbox', 'multivendorx'),
					value: __('mapbox_api_set', 'multivendorx'),
					icon: 'adminfont-mapbox',
				},
			],
			moduleEnabled: 'geo-location',
		},
		{
			key: 'google_api_key',
			type: 'text',
			label: __('Google map API key', 'multivendorx'),
			desc: __(
				'<a href="https://developers.google.com/maps/documentation/javascript/get-api-key#get-an-api-key" target="_blank">Click here to generate key.</a>',
				'multivendorx'
			),
			moduleEnabled: 'geo-location',
			dependent: {
				key: 'choose_map_api',
				set: true,
				value: 'google_map_set',
			},
		},
		{
			key: 'mapbox_api_key',
			type: 'text',
			label: __('Mapbox access token', 'multivendorx'),
			desc: __(
				'<a href="https://docs.mapbox.com/help/getting-started/access-tokens/" target="_blank">Click here to generate access token.</a>',
				'multivendorx'
			),
			moduleEnabled: 'geo-location',
			dependent: {
				key: 'choose_map_api',
				set: true,
				value: 'mapbox_api_set',
			},
		},
		{
			key: 'radius_search_distance',
			type: 'nested',
			label: 'Location search',
			single: true,
			settingDescription: __(
				'Define how customers can control their search radius when looking for nearby stores.',
				'multivendorx'
			),
			desc: __(
				'<ul><li>Minimum distance - set the smallest possible radius a customer can select. For example, if set to 1 km, customers cannot search for anything closer than 1 km.<li>Maximum distance - set the largest radius available for search. For example, setting it to 500 km allows customers to expand their search across a wider region.</li><li>Units - decide whether distances are measured in kilometers or miles, depending on your store’s target region.</li></ul>',
				'multivendorx'
			),
			moduleEnabled: 'geo-location',
			nestedFields: [
				{
					key: 'radius_search_min_distance',
					preInsideText: __('Min', 'multivendorx'),
					type: 'number',
				},
				{
					key: 'radius_search_max_distance',
					preInsideText: __('Max', 'multivendorx'),
					type: 'number',
				},

				{
					key: 'radius_search_unit',
					type: 'select',
					options: [
						{
							key: 'kilometers',
							label: __('Kilometers', 'multivendorx'),
							value: 'kilometers',
						},
						{
							key: 'miles',
							label: __('Miles', 'multivendorx'),
							value: 'miles',
						},
					],
				},
			],
		},
	],
};
