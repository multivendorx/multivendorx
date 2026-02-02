import { useEffect, useState } from 'react';
import axios from 'axios';
import {
	BasicInput,
	getApiLink,
	SuccessNotice,
	SelectInput,
	useModules,
	EmailsInput,
	GoogleMap,
	Mapbox,
	Container,
	Column,
	Card,
	FormGroupWrapper,
	FormGroup,
} from 'zyra';
import { useLocation } from 'react-router-dom';
import { __ } from '@wordpress/i18n';

interface FormData {
	[key: string]: string;
}

const StoreSettings = ({
	id,
	data,
	onUpdate,
}: {
	id: string | null;
	data: any;
	onUpdate: any;
}) => {
	const [formData, setFormData] = useState<FormData>({});
	const statusOptions = [
		{ label: 'Under Review', value: 'under_review' },
		{ label: 'Suspended', value: 'suspended' },
		{ label: 'Active', value: 'active' },
		{ label: 'Permanently Deactivated', value: 'deactivated' },
	];

	const [stateOptions, setStateOptions] = useState<
		{ label: string; value: string }[]
	>([]);
	const [successMsg, setSuccessMsg] = useState<string | null>(null);
	const [errorMsg, setErrorMsg] = useState<{ [key: string]: string }>({});

	// Map states
	const [apiKey, setApiKey] = useState('');
	const appLocalizer = (window as any).appLocalizer;
	const { modules } = useModules();
	// === ADD THESE STATES (replace old ones) ===
	const [emails, setEmails] = useState<string[]>([]); // All emails
	const [primaryEmail, setPrimaryEmail] = useState<string>(''); // Which one is starred
	const settings = appLocalizer.settings_databases_value;
	const [newAddress, setNewAddress] = useState<any>(null);

	useEffect(() => {
		if (!newAddress) return;
		if (!stateOptions.length) return;

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

	// === LOAD EMAILS FROM BACKEND ===
	useEffect(() => {
		let parsedEmails = [];

		try {
			parsedEmails = data.emails ? JSON.parse(data.emails) : [];
		} catch (e) {
			console.error('Invalid email JSON', e);
			parsedEmails = [];
		}

		if (Array.isArray(parsedEmails)) {
			setEmails(parsedEmails);
			setPrimaryEmail(data.primary_email || parsedEmails[0] || '');
		}
	}, [data]);

	// === SAVE FUNCTION ===
	const saveEmails = (emailList: string[], primary: string) => {
		const updated = {
			...formData,
			primary_email: primary,
			emails: emailList,
		};
		setFormData(updated);
		autoSave(updated);
	};

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

	useEffect(() => {
		if (!settings?.geolocation) return;

		const provider = settings.geolocation.choose_map_api;

		if (provider === 'google_map_set') {
			setApiKey(settings.geolocation.google_api_key || '');
		} else if (provider === 'mapbox_api_set') {
			setApiKey(settings.geolocation.mapbox_api_key || '');
		}
	}, [settings]);

	// Load store data
	useEffect(() => {
		if (!id || !appLocalizer) {
			console.error('Missing store ID or appLocalizer');
			return;
		}

		// Set all form data
		setFormData((prev) => ({ ...prev, ...data }));

		// Set address-specific data
		setAddressData({
			location_lat: data.location_lat || '',
			location_lng: data.location_lng || '',
			address: data.address || '',
			city: data.city || '',
			state: data.state || '',
			country: data.country || '',
			zip: data.zip || '',
			timezone: data.timezone || '',
		});
	}, [data]);

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

	const applyLocation = (locationData: any) => {
		setAddressData((prev) => ({ ...prev, ...locationData }));

		const updatedFormData = { ...formData, ...locationData };
		setFormData(updatedFormData);
		autoSave(updatedFormData);
	};

	const handleLocationUpdate = (locationData: any) => {
		setNewAddress(locationData);

		// ensure states are loading
		if (locationData.country) {
			fetchStatesByCountry(locationData.country);
		}
		return;
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

	const checkSlugExists = async (slug: string) => {
		try {
			const response = await axios.get(
				getApiLink(appLocalizer, 'store'),
				{
					params: {
						slug,
						id: id,
					},
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
				}
			);
			return response.data.exists;
		} catch (err) {
			return false;
		}
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		const updated = { ...formData, [name]: value };
		setFormData(updated);

		if (name === 'slug') {
			const cleanValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');

			const updated = { ...formData, slug: cleanValue };
			setFormData(updated);

			if (cleanValue !== value.toLowerCase()) {
				setErrorMsg((prev) => ({
					...prev,
					slug: __(
						'Special characters are not allowed.',
						'multivendorx'
					),
				}));
				return;
			}

			(async () => {
				const trimmedValue = cleanValue.trim();
				if (!trimmedValue) {
					setErrorMsg((prev) => ({
						...prev,
						slug: __('Slug cannot be blank', 'multivendorx'),
					}));
					return;
				}
				const exists = await checkSlugExists(trimmedValue);

				if (exists) {
					setErrorMsg((prev) => ({
						...prev,
						slug: `Slug "${trimmedValue}" already exists.`,
					}));
					return;
				}
				setErrorMsg((prev) => ({ ...prev, slug: '' }));
				autoSave(updated);
				onUpdate({ slug: trimmedValue });
			})();

			return;
		} else if (name === 'phone') {
			const isValidPhone = /^\+?[0-9\s\-]{7,15}$/.test(value);
			if (isValidPhone || value == '') {
				autoSave(updated);
				setErrorMsg((prev) => ({ ...prev, phone: '' }));
			} else {
				setErrorMsg((prev) => ({
					...prev,
					phone: __('Invalid phone number', 'multivendorx'),
				}));
			}
		} else if (name !== 'email') {
			autoSave(updated);
		}
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
			locationAddress: addressData.address,
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
			<Container>
				<Column grid={8}>
					{/* Contact Information */}
					<Card title={__('Contact information', 'multivendorx')}>
						<FormGroup label={__('Store email(s)', 'multivendorx')}>
							<EmailsInput
								value={emails}
								primary={primaryEmail}
								enablePrimary={true}
								onChange={(list, primary) =>
									saveEmails(list, primary)
								}
							/>
							<div className="settings-metabox-description">
								<b>{__('Tip:')}</b>{' '}
								{__(
									'You can add multiple email addresses. All added emails will receive notifications.'
								)}{' '}
								<br />
								<b>{__('Primary email:')}</b>{' '}
								{__(
									'Click the star icon to set an email as primary. This email will appear on your storefront, and all other email IDs will be hidden from display.'
								)}
							</div>
						</FormGroup>

						<FormGroup label={__('Phone', 'multivendorx')}>
							<BasicInput
								name="phone"
								type="number"
								value={formData.phone}
								 
								descClass="settings-metabox-description"
								onChange={handleChange}
							/>
							{errorMsg.phone && (
								<p className="invalid-massage">
									{errorMsg.phone}
								</p>
							)}
						</FormGroup>
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
					</Card>
					{/* Communication Address */}
					<Card title={__('Communication address', 'multivendorx')}>
						<FormGroupWrapper>
							<FormGroup label={__('Address *', 'multivendorx')} htmlFor="address">
								<BasicInput
									name="address"
									value={addressData.address}
									 
									descClass="settings-metabox-description"
									onChange={handleAddressChange}
								/>
							</FormGroup>

							<FormGroup cols={2} label={__('City', 'multivendorx')} htmlFor="City">
								<BasicInput
									name="city"
									value={addressData.city}
									 
									descClass="settings-metabox-description"
									onChange={handleAddressChange}
								/>
							</FormGroup>
							<FormGroup cols={2} label={__('Zip code', 'multivendorx')} htmlFor="zip">
								<BasicInput
									name="zip"
									value={addressData.zip}
									 
									descClass="settings-metabox-description"
									onChange={handleAddressChange}
								/>
							</FormGroup>

							{/* Country and State */}
							<FormGroup cols={2} label={__('Country', 'multivendorx')} htmlFor="country">
								<SelectInput
									name="country"
									value={formData.country}
									options={
										appLocalizer.country_list || []
									}
									type="single-select"
									onChange={handleCountryChange}
								/>
							</FormGroup>
							<FormGroup cols={2} label={__('State', 'multivendorx')} htmlFor="state">
								<SelectInput
									name="state"
									value={formData.state}
									options={stateOptions}
									type="single-select"
									onChange={handleStateChange}
								/>
							</FormGroup>
							{/* Map Component */}
							{renderMapComponent()}
						</FormGroupWrapper>
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
					</Card>
				</Column>
				<Column grid={4}>
					{/* Manage Store Status */}
					<div id="store-status" className="card-content">
						<div className="card-header">
							<div className="left">
								<div className="title">
									{__('Manage store status', 'multivendorx')}
								</div>
							</div>
						</div>
						<div className="card-body">
							<FormGroupWrapper>
								<FormGroup label={__('Current status', 'multivendorx')}>
									<SelectInput
										name="status"
										value={formData.status}
										options={statusOptions}
										type="single-select"
										onChange={(newValue: any) => {
											if (
												!newValue ||
												Array.isArray(newValue)
											) {
												return;
											}
											const updated = {
												...formData,
												status: newValue.value,
											};
											onUpdate({ status: newValue.value });
											setFormData(updated);
											autoSave(updated);
										}}
									/>
								</FormGroup>
							</FormGroupWrapper>
						</div>
					</div>
					{/* Manage Storefront Link */}
					<div id="store-slug" className="card-content">
						<div className="card-header">
							<div className="left">
								<div className="title">
									{__(
										'Manage storefront link',
										'multivendorx'
									)}
								</div>
							</div>
						</div>
						<div className="card-body">
							<FormGroupWrapper>
								<FormGroup label={__('Current storefront link', 'multivendorx')}>
									<BasicInput
										name="slug"
										 
										descClass="settings-metabox-description"
										value={formData.slug}
										onChange={handleChange}
									/>
									<div className="settings-metabox-description slug">
										{__('Store URL', 'multivendorx')} :{' '}
										<a
											className="link-item"
											target="_blank"
											rel="noopener noreferrer"
											href={`${appLocalizer.store_page_url}${formData.slug}`}
										>
											{`${appLocalizer.store_page_url}${formData.slug}`}{' '}
											<i className="adminfont-external"></i>
										</a>
									</div>
									{errorMsg.slug && (
										<p className="invalid-massage">
											{errorMsg.slug}
										</p>
									)}
								</FormGroup>
							</FormGroupWrapper>
						</div>
					</div>

					{/* Social Information */}
					<Card title={__('Social information', 'multivendorx')}>
						{[
							'facebook',
							'twitter',
							'linkedin',
							'youtube',
							'instagram',
							'pinterest',
						].map((network) => {
							const iconClass = `adminfont-${network} ${network}`;
							const defaultUrl = `https://${network === 'twitter' ? 'x' : network}.com/`;

							return (
								<FormGroupWrapper>
									<div className="form-group">
										<label htmlFor={network}>
											<i className={iconClass}></i>
											{network === 'twitter'
												? 'X'
												: network
													.charAt(0)
													.toUpperCase() +
												network.slice(1)}
										</label>
										<BasicInput
											name={network}
											 
											descClass="settings-metabox-description"
											value={
												formData[network]?.trim() ||
												defaultUrl
											}
											onChange={handleChange}
										/>
									</div>
								</FormGroupWrapper>
							);
						})}
					</Card>
				</Column>
			</Container >
		</>
	);
};

export default StoreSettings;
