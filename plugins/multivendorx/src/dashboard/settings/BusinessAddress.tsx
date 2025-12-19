import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { BasicInput, getApiLink, GoogleMap, Mapbox, SelectInput, SuccessNotice, useModules } from 'zyra';
import { __ } from '@wordpress/i18n';
import { useLocation } from 'react-router-dom';

declare global {
	interface Window {
		google: any;
		mapboxgl: any;
		MapboxGeocoder: any;
	}
}

interface FormData {
	[key: string]: string;
}

const BusinessAddress = (
) => {
	const id = (window as any).appLocalizer?.store_id;
	const [formData, setFormData] = useState<FormData>({});
	const [successMsg, setSuccessMsg] = useState<string | null>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [mapProvider, setMapProvider] = useState('');
	const [apiKey, setApiKey] = useState('');
	const [stateOptions, setStateOptions] = useState<
		{ label: string; value: string }[]
	>([]);
	const appLocalizer = (window as any).appLocalizer;
	const settings = appLocalizer.settings_databases_value;

	const [addressData, setAddressData] = useState({
		location_address: '',
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

	const [pendingLocation, setPendingLocation] = useState<any>(null);

	useEffect(() => {
		if (!pendingLocation) return;
		if (!stateOptions.length) return;
	
		const foundState = stateOptions.find(
			(item) =>
				item.label.split(' ')[0] === pendingLocation.state ||
				item.value === pendingLocation.state
		);
	
		const resolvedLocation = {
			...pendingLocation,
			state: foundState ? foundState.value : pendingLocation.state,
		};
	
		applyLocation(resolvedLocation);
		setPendingLocation(null);
	}, [stateOptions]);

	const applyLocation = (locationData: any) => {
		setAddressData((prev) => ({ ...prev, ...locationData }));
	
		const updatedFormData = { ...formData, ...locationData };
		setFormData(updatedFormData);
		autoSave(updatedFormData);
	};	

	const handleLocationUpdate = (locationData: any) => {
		if (mapProvider === 'mapbox_api_set') {
			setPendingLocation(locationData);
	
			// ensure states are loading
			if (locationData.country) {
				fetchStatesByCountry(locationData.country);


			}
			return;
		}
		applyLocation(locationData);
	};

	// Get REST API base URL
	useEffect(() => {
		if (!settings?.geolocation) return;
	
		const provider = settings.geolocation.choose_map_api;
	
		setMapProvider(provider);
	
		if (provider === 'google_map_set') {
			setApiKey(settings.geolocation.google_api_key || '');
		} else if (provider === 'mapbox_api_set') {
			setApiKey(settings.geolocation.mapbox_api_key || '');
		}
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
					location_address:
						data.location_address || data.address || '',
					location_lat: data.location_lat || '',
					location_lng: data.location_lng || '',
					address: data.address || data.location_address || '',
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
			} catch (error: any) {
				console.error('Error loading store data:', error);
				setErrorMsg('Failed to load store data');
				// Initialize with empty structure
				setAddressData({
					location_address: '',
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
		if (successMsg) {
			const timer = setTimeout(() => setSuccessMsg(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [successMsg]);

	useEffect(() => {
		if (formData.country) {
			fetchStatesByCountry(formData.country);
		}
	}, [formData.country]);

	const location = useLocation();

	useEffect(() => {
		const highlightId = location.state?.highlightTarget;
		if (highlightId) {
			const target = document.getElementById(highlightId);

			if (target) {
				target.scrollIntoView({ behavior: 'smooth', block: 'center' });
				target.classList.add('highlight');
				const handleClick = () => {
					target.classList.remove('highlight');
					document.removeEventListener('click', handleClick);
				};
				setTimeout(() => {
					document.addEventListener('click', handleClick);
				}, 100);
			}
		}
	}, [location.state]);

	const handleAddressChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;

		const newAddressData = {
			...addressData,
			[name]: value,
		};

		setAddressData(newAddressData);

		// Also update formData to maintain consistency
		const updatedFormData = {
			...formData,
			[name]: value,
		};

		setFormData(updatedFormData);
		autoSave(updatedFormData);
	};

	// Handle country select change (from old code)
	const handleCountryChange = (newValue: any) => {
		if (!newValue || Array.isArray(newValue)) {
			return;
		}

		const updated = {
			...formData,
			country: newValue.value,
			state: '', // reset state when country changes
		};

		setFormData(updated);
		setAddressData((prev) => ({ ...prev, country: newValue.label }));

		autoSave(updated);
		fetchStatesByCountry(newValue.value);
	};

	// Handle state select change (from old code)
	const handleStateChange = (newValue: any) => {
		if (!newValue || Array.isArray(newValue)) {
			return;
		}

		const updated = {
			...formData,
			state: newValue.value,
		};

		setFormData(updated);
		setAddressData((prev) => ({ ...prev, state: newValue.label }));

		autoSave(updated);
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
	const autoSave = (updatedData: any) => {
		if (!id) {
			return;
		}
		// Format email data for backend
		const formattedData = { ...updatedData };

		axios({
			method: 'PUT',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: formattedData,
		})
			.then((res) => {
				if (res.data.success) {
					setSuccessMsg('Store saved successfully!');
				}
			})
			.catch((error) => {
				console.error('Save error:', error);
			});
	};

	const renderMapComponent = () => {
		if (!modules.includes('geo-location') || !apiKey) {
			return null;
		}
	
		const commonProps = {
			apiKey,
			locationAddress: addressData.location_address,
			locationLat: addressData.location_lat,
			locationLng: addressData.location_lng,
			onLocationUpdate: handleLocationUpdate,
			labelSearch: __('Search for a location'),
			labelMap: __('Drag or click on the map to choose a location'),
			instructionText: __('Enter a search term or drag/drop a pin on the map.'),
			placeholderSearch: __('Search for a location...'),
		};
	
		switch (settings.geolocation.choose_map_api) {
			case 'google_map_set':
				return <GoogleMap {...commonProps} />;
	
			case 'mapbox_api_set':
				return <Mapbox {...commonProps} />;
	
			default:
				return null;
		}
	};

	return (
		<>
			<SuccessNotice message={successMsg} />

			{errorMsg && <div className="error-message">{errorMsg}</div>}

			{/* Address Field */}
			<div className="card-body">
				<div className="form-group-wrapper">
					<div className="form-group">
						<label htmlFor="location_address">
							{__('Address *')}
						</label>
						<BasicInput
							name="location_address"
							value={addressData.location_address}
							wrapperClass="setting-form-input"
							descClass="settings-metabox-description"
							onChange={handleAddressChange}
						/>
					</div>
				</div>

				<div className="form-group-wrapper">
					<div className="form-group">
						<label htmlFor="city">{__('City')}</label>
						<BasicInput
							name="city"
							value={addressData.city}
							wrapperClass="setting-form-input"
							descClass="settings-metabox-description"
							onChange={handleAddressChange}
						/>
					</div>
					<div className="form-group">
						<label htmlFor="zip">
							{__('Zip code')}
						</label>
						<BasicInput
							name="zip"
							value={addressData.zip}
							wrapperClass="setting-form-input"
							descClass="settings-metabox-description"
							onChange={handleAddressChange}
						/>
					</div>
				</div>

				{/* Country and State */}
				<div className="form-group-wrapper">
					<div className="form-group">
						<label htmlFor="country">
							{__('Country')}
						</label>
						<SelectInput
							name="country"
							value={formData.country}
							options={
								appLocalizer.country_list || []
							}
							type="single-select"
							onChange={handleCountryChange}
						/>
					</div>
					<div className="form-group">
						<label htmlFor="state">{__('State')}</label>
						<SelectInput
							name="state"
							value={formData.state}
							options={stateOptions}
							type="single-select"
							onChange={handleStateChange}
						/>
					</div>
				</div>
			</div>

			{/* Map Component */}
			{renderMapComponent()}
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
		</>
	);
};

export default BusinessAddress;
