/* global appLocalizer */
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
	BasicInputUI,
	FormGroup,
	FormGroupWrapper,
	getApiLink,
	MapProviderUI,
	Notice,
	NoticeManager,
	SelectInputUI,
	useModules,
} from 'zyra';
import { __ } from '@wordpress/i18n';

declare global {
	interface Window {
		google: Record<string, unknown>;
		mapboxgl: Record<string, unknown>;
		MapboxGeocoder: Record<string, unknown>;
	}
}

interface FormData {
	[key: string]: string;
}
interface LocationData {
	address?: string;
	city?: string;
	state?: string;
	country?: string;
	zip?: string;
	location_lat?: string;
	location_lng?: string;
	timezone?: string;
	[key: string]: string | undefined;
}

const BusinessAddress = () => {
	const id = appLocalizer?.store_id;
	const [formData, setFormData] = useState<FormData>({});
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [mapConfig, setMapConfig] = useState<{
		provider: string | null;
		apiKey: string;
	}>({ provider: 'null', apiKey: '' });
	const [stateOptions, setStateOptions] = useState<
		{ label: string; value: string }[]
	>([]);
	const settings = appLocalizer.settings_databases_value;

	const [addressData, setAddressData] = useState({
		location_lat: '',
		location_lng: '',
		address: '',
		city: '',
		state: '',
		country: '',
		zip: '',
		timezone: '',
	});
	const { modules } = useModules();

	const [newAddress, setNewAddress] = useState<LocationData | null>(null);

	useEffect(() => {
		if (!newAddress || !stateOptions.length) {
			return;
		}

		const foundState = stateOptions.find(
			(item) =>
				item.label.split(' ')[0] === newAddress.state.split(' ')[0] ||
				item.value === newAddress.state
		);

		const resolvedLocation = {
			...newAddress,
			state: foundState ? foundState.value : newAddress.state,
		};

		applyLocation(resolvedLocation);
		setNewAddress(null);
	}, [stateOptions]);

	const applyLocation = (locationData: LocationData) => {
		setAddressData((prev) => ({ ...prev, ...locationData }));

		const updatedFormData = { ...formData, ...locationData };
		setFormData(updatedFormData);
		autoSave(updatedFormData);
	};

	const handleLocationUpdate = (locationData: LocationData) => {
		setNewAddress(locationData);

		// ensure states are loading
		if (locationData.country) {
			fetchStatesByCountry(locationData.country);
		}
		return;
	};

	// Get REST API base URL
	useEffect(() => {
		if (!settings?.geolocation) {
			return;
		}

		const provider = settings.geolocation.choose_map_api;
		const apiKey = settings.geolocation[`${provider}_api_key`] || '';

		setMapConfig({
			provider: provider || null,
			apiKey: apiKey,
		});
	}, [settings]);

	// Load initial data
	useEffect(() => {
		if (!id) {
			console.error('No store ID found');
			setErrorMsg('No store ID available');
			return;
		}

		const loadStoreData = async () => {
			try {
				const endpoint = getApiLink(appLocalizer, `store/${id}`);

				const res = await axios.get(endpoint, {
					headers: {
						'X-WP-Nonce': appLocalizer.nonce,
					},
				});

				const data = res.data || {};

				// Use the same structure as admin side
				const formattedData = {
					location_lat: data.location_lat || '',
					location_lng: data.location_lng || '',
					address: data.address || '',
					city: data.city || '',
					state: data.state || '',
					country: data.country || '',
					zip: data.zip || '',
					timezone: data.timezone || '',
				};

				setAddressData(formattedData);
				setFormData(data); // Also set formData for country/state management

				// Fetch states if country is already set
				if (data.country) {
					fetchStatesByCountry(data.country);
				}
			} catch (error) {
				console.error('Error loading store data:', error);
				setErrorMsg('Failed to load store data');
				// Initialize with empty structure
				setAddressData({
					location_lat: '',
					location_lng: '',
					address: '',
					city: '',
					state: '',
					country: '',
					zip: '',
					timezone: '',
				});
			}
		};

		loadStoreData();
	}, [id]);

	useEffect(() => {
		if (formData.country) {
			fetchStatesByCountry(formData.country);
		}
	}, [formData.country]);

	const handleAddressChange = (key: string, value: string) => {
		const newAddressData = {
			...addressData,
			[key]: value,
		};

		setAddressData(newAddressData);

		// Also update formData to maintain consistency
		const updatedFormData = {
			...formData,
			[key]: value,
		};

		setFormData(updatedFormData);
		autoSave(updatedFormData);
	};

	const fetchStatesByCountry = (countryCode: string) => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `states/${countryCode}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((res) => {
			setStateOptions(res.data || []);
		});
	};

	// Then update your autoSave function:
	const autoSave = (updatedData: Record<string, unknown>) => {
		if (
			!settings['store-permissions']?.edit_store_info_activation ||
			[].includes('store_address')
		) {
			return;
		}
		// Format email data for backend
		const formattedData = { ...updatedData };

		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: formattedData,
		})
			.then((res) => {
				 NoticeManager.add({
                    title: 'Success!',
                    message: `Store saved successfully!`,
                    type: 'success',
                    position: 'float',
                });
			})
			.catch((error) => {
				console.error('Save error:', error);
			});
	};

	const renderMapComponent = () => {
		if (
			!modules.includes('geo-location') ||
			!mapConfig.apiKey ||
			!mapConfig.provider
		) {
			return null;
		}

		return (
			<MapProviderUI
				apiKey={mapConfig.apiKey}
				locationAddress={addressData.address}
				locationLat={addressData.location_lat}
				locationLng={addressData.location_lng}
				isUserLocation={false}
				onLocationUpdate={handleLocationUpdate}
				placeholderSearch={__(
					'Search for a location...',
					'multivendorx'
				)}
				stores={null}
				mapProvider={mapConfig.provider}
			/>
		);
	};

	return (
		<>

			<FormGroupWrapper>
				{/* Address */}
				<FormGroup
					label={__('Address *', 'multivendorx')}
					htmlFor="address"
				>
					<BasicInputUI
						value={addressData.address}
						onChange={(value: string) =>
							handleAddressChange('address', value)
						}
					/>
				</FormGroup>
				{/* City */}
				<FormGroup
					cols={2}
					label={__('City', 'multivendorx')}
					htmlFor="city"
				>
					<BasicInputUI
						value={addressData.city}
						onChange={(value: string) =>
							handleAddressChange('city', value)
						}
					/>
				</FormGroup>

				{/* Zip */}
				<FormGroup
					cols={2}
					label={__('Zip code', 'multivendorx')}
					htmlFor="zip"
				>
					<BasicInputUI
						type="number"
						value={addressData.zip}
						onChange={(value: string) =>
							handleAddressChange('zip', value)
						}
					/>
				</FormGroup>

				{/* Country */}
				<FormGroup
					cols={2}
					label={__('Country', 'multivendorx')}
					htmlFor="country"
				>
					<SelectInputUI
						value={formData.country}
						options={appLocalizer.country_list || []}
						onChange={(e) =>
							handleAddressChange('country', e.value)
						}
					/>
				</FormGroup>

				{/* State */}
				<FormGroup
					cols={2}
					label={__('State', 'multivendorx')}
					htmlFor="state"
				>
					<SelectInputUI
						name="state"
						value={formData.state}
						options={stateOptions}
						onChange={(e) => handleAddressChange('state', e.value)}
					/>
				</FormGroup>

				{/* Map Component */}
				<FormGroup>{renderMapComponent()}</FormGroup>
				{/* Hidden coordinates */}
				<input
					type="hidden"
					name="location_lat"
					value={addressData.location_lat}
				/>
				<input
					type="hidden"
					name="location_lng"
					value={addressData.location_lng}
				/>
			</FormGroupWrapper>
		</>
	);
};

export default BusinessAddress;
