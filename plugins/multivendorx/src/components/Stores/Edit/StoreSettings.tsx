import { useEffect, useState } from 'react';
import axios from 'axios';
import {
	getApiLink,
	SuccessNotice,
	useModules,
	EmailsInput,
	GoogleMap,
	Mapbox,
	Container,
	Column,
	Card,
	FormGroupWrapper,
	FormGroup,
	BasicInputUI,
	SelectInputUI,
	CountryCodes,
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
		eOrName:
			| React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
			| string,
		valueArg?: string
	) => {
		let name: string;
		let value: string;
		if (typeof eOrName !== 'string') {
			name = eOrName.target.name;
			value = eOrName.target.value;
		}
		else {
			name = eOrName;
			value = valueArg ?? '';
		}
		if (name === 'phone') {
			const code = formData.country_code || '';
			// Allow typing naturally, normalize AFTER
			const updated = {
				...formData,
				phone: value,
			};
			setFormData(updated);
			const normalized = ensurePhonePrefix(code, value);
			const isValidPhone = /^\+?[0-9\s\-]{7,15}$/.test(normalized);
			if (isValidPhone || normalized === '') {
				autoSave({ ...updated, phone: normalized });
				setErrorMsg((p) => ({ ...p, phone: '' }));
			} else {
				setErrorMsg((p) => ({
					...p,
					phone: __('Invalid phone number', 'multivendorx'),
				}));
			}
		
			return;
		}
		if (name === 'slug') {
			const clean = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
			setFormData((prev) => ({ ...prev, slug: clean }));
			if (clean !== value.toLowerCase()) {
				setErrorMsg((p) => ({
					...p,
					slug: __('Special characters are not allowed.', 'multivendorx'),
				}));
				return;
			}
			(async () => {
				const trimmed = clean.trim();
				if (!trimmed) {
					setErrorMsg((p) => ({
						...p,
						slug: __('Slug cannot be blank', 'multivendorx'),
					}));
					return;
				}
				const exists = await checkSlugExists(trimmed);
				if (exists) {
					setErrorMsg((p) => ({
						...p,
						slug: `Slug "${trimmed}" already exists.`,
					}));
					return;
				}
				setErrorMsg((p) => ({ ...p, slug: '' }));
				const updated = { ...formData, slug: trimmed };
				autoSave(updated);
				onUpdate({ slug: trimmed });
			})();
			return;
		}
		const updated = {
			...formData,
			[name]: value,
		};
		setFormData(updated);
		if (name !== 'email') {
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

	const ensurePhonePrefix = (code: string, phone: string) => {
		if (!code) return phone || '';
	
		const raw = phone || '';
	
		// If already starts with correct code → keep typing
		if (raw.startsWith(code)) return raw;
	
		// Remove ONLY old prefix (not entire number)
		const withoutOldPrefix = raw.replace(/^\+\d{1,4}/, '');
	
		return code + withoutOldPrefix;
	};	

	useEffect(() => {
		if (!data) return;
	
		setFormData((prev) => {
			const code = data.country_code || '';
			const phone = ensurePhonePrefix(code, data.phone || '');
	
			return {
				...prev,
				...data,
				country_code: code,
				phone,
			};
		});
	}, [data]);
	

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
							<SelectInputUI
								name="country_code"
								value={formData.country_code}
								options={CountryCodes}
								onChange={(selected: { value: string }) => {
									setFormData((prev) => {
										const newPhone = ensurePhonePrefix(
											selected.value,
											prev.phone || ''
										);

										const updated = {
											...prev,
											country_code: selected.value,
											phone: newPhone,
										};

										autoSave(updated);
										return updated;
									});
								}}
							/>

							<BasicInputUI
								name="phone"
								type="text"
								value={formData.phone}
								onChange={(val) => handleChange('phone', val as string)}
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
								<BasicInputUI
									name="address"
									value={addressData.address}
									onChange={handleAddressChange}
								/>
							</FormGroup>

							<FormGroup cols={2} label={__('City', 'multivendorx')} htmlFor="City">
								<BasicInputUI
									name="city"
									value={addressData.city}
									onChange={handleAddressChange}
								/>
							</FormGroup>
							<FormGroup cols={2} label={__('Zip code', 'multivendorx')} htmlFor="zip">
								<BasicInputUI
									name="zip"
									value={addressData.zip}
									onChange={handleAddressChange}
								/>
							</FormGroup>

							{/* Country and State */}
							<FormGroup cols={2} label={__('Country', 'multivendorx')} htmlFor="country">
								<SelectInputUI
									name="country"
									value={formData.country}
									options={
										appLocalizer.country_list || []
									}
									onChange={handleCountryChange}
								/>
							</FormGroup>
							<FormGroup cols={2} label={__('State', 'multivendorx')} htmlFor="state">
								<SelectInputUI
									name="state"
									value={formData.state}
									options={stateOptions}
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
									<SelectInputUI
										name="status"
										value={formData.status}
										options={statusOptions}
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
									<BasicInputUI
										name="slug"
										value={formData.slug}
										onChange={(val) => handleChange('slug', val as string)}
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
										<BasicInputUI
											name={network}
											value={
												formData[network]?.trim() ||
												defaultUrl
											}
											onChange={(val) => handleChange(network, val as string)}
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
