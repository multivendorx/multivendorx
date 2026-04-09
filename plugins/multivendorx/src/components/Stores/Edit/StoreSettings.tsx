/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
	getApiLink,
	useModules,
	EmailsInputUI,
	MapProviderUI,
	Container,
	Column,
	Card,
	FormGroupWrapper,
	FormGroup,
	BasicInputUI,
	SelectInputUI,
	CountryCodes,
	NoticeManager,
} from 'zyra';
import { useLocation } from 'react-router-dom';
import { __ } from '@wordpress/i18n';

// Define proper interfaces
interface PhoneData {
	country_code: string;
	phone: string;
}

interface AddressData {
	location_lat: string;
	location_lng: string;
	address: string;
	city: string;
	state: string;
	country: string;
	zip: string;
	timezone: string;
}
interface StoreEmail {
	list: string[];
	primary: string;
}
interface FormData extends Partial<AddressData> {
	store_email?: StoreEmail;
	slug?: string;
	status?: string;
	country_code?: string;
	phone?: string;
	facebook?: string;
	twitter?: string;
	linkedin?: string;
	youtube?: string;
	instagram?: string;
	pinterest?: string;
	[key: string]: string | string[] | undefined;
}
interface StoreEmail {
	list: string[];
	primary: string;
}
interface StoreData {
	store_email?: StoreEmail;
	phone?: PhoneData;
	location_lat?: string;
	location_lng?: string;
	address?: string;
	city?: string;
	state?: string;
	country?: string;
	zip?: string;
	timezone?: string;
	status?: string;
	slug?: string;
	facebook?: string;
	twitter?: string;
	linkedin?: string;
	youtube?: string;
	instagram?: string;
	pinterest?: string;
	[key: string]: string | string[] | PhoneData | undefined;
}

interface MapConfig {
	provider: string | null;
	apiKey: string;
}

interface ErrorMessages {
	[key: string]: string;
}

interface StateOption {
	label: string;
	value: string;
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

interface StoreSettingsProps {
	id: string | null;
	data: StoreData | null;
	onUpdate: (data: Record<string, string>) => void;
}

const StoreSettings: React.FC<StoreSettingsProps> = ({
	id,
	data,
	onUpdate,
}) => {
	const [formData, setFormData] = useState<FormData>({});
	const [stateOptions, setStateOptions] = useState<StateOption[]>([]);
	const [errorMsg, setErrorMsg] = useState<ErrorMessages>({});
	const [mapConfig, setMapConfig] = useState<MapConfig>({
		provider: null,
		apiKey: '',
	});
	const [newAddress, setNewAddress] = useState<LocationData | null>(null);

	const statusOptions = [
		{ label: __('Under Review', 'multivendorx'), value: 'under_review' },
		{ label: __('Suspended', 'multivendorx'), value: 'suspended' },
		{ label: __('Active', 'multivendorx'), value: 'active' },
		{
			label: __('Permanently Deactivated', 'multivendorx'),
			value: 'deactivated',
		},
	];

	const { modules } = useModules();
	const settings = appLocalizer.settings_databases_value;

	const [addressData, setAddressData] = useState<AddressData>({
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
		if (!newAddress) {
			return;
		}
		if (!stateOptions.length) {
			return;
		}

		const foundState = stateOptions.find(
			(item) =>
				item.label.split(' ')[0] === newAddress.state?.split(' ')[0] ||
				item.value === newAddress.state
		);

		const resolvedLocation = {
			...newAddress,
			state: foundState ? foundState.value : newAddress.state,
		};

		applyLocation(resolvedLocation);
		setNewAddress(null);
	}, [stateOptions, newAddress]);

	// Load map configuration
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

	// Load store data
	useEffect(() => {
		if (!id || !appLocalizer || !data) {
			return;
		}

		setFormData((prev) => ({
			...prev,
			...data,
			country_code: data.phone?.country_code || '',
			phone: data.phone?.phone || '',
		}));

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
	}, [data, id]);

	useEffect(() => {
		if (formData.country) {
			fetchStatesByCountry(formData.country);
		}
	}, [formData.country]);

	const location = useLocation();

	useEffect(() => {
		const highlightId = (location.state as { highlightTarget?: string })
			?.highlightTarget;
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

	// === SAVE FUNCTION ===
	const saveEmails = (emailList: string[], primary: string) => {
		const updated = {
			...formData,
			store_email: {
				list: emailList,
				primary: primary,
			},
		};
		setFormData(updated);
		autoSave(updated);
	};

	const handleAddressChange = (name: keyof AddressData, value: string) => {
		const newAddressData = {
			...addressData,
			[name]: value,
		};

		setAddressData(newAddressData);

		const updatedFormData = {
			...formData,
			[name]: value,
		};

		setFormData(updatedFormData);
		autoSave(updatedFormData);
	};

	const applyLocation = (locationData: LocationData) => {
		setAddressData((prev) => ({ ...prev, ...locationData }));

		const updatedFormData = { ...formData, ...locationData };
		setFormData(updatedFormData);
		autoSave(updatedFormData);
	};

	const handleLocationUpdate = (locationData: LocationData) => {
		setNewAddress(locationData);

		if (locationData.country) {
			fetchStatesByCountry(locationData.country);
		}
	};

	const handleCountryChange = (value: string | string[]) => {
		if (!value || Array.isArray(value)) {
			return;
		}

		const updated = {
			...formData,
			country: value,
			state: '',
		};

		setFormData(updated);
		autoSave(updated);
		fetchStatesByCountry(value);
	};

	const handleStateChange = (value: string | string[]) => {
		if (!value || Array.isArray(value)) {
			return;
		}

		const updated = {
			...formData,
			state: value,
		};

		setFormData(updated);
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

	const checkSlugExists = async (slug: string): Promise<boolean> => {
		try {
			const response = await axios.get<{ exists: boolean }>(
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
			console.error(err);
			return false;
		}
	};

	const handleChange = (name: string, value: string) => {
		const updated = { ...formData, [name]: value };
		setFormData(updated);

		if (name === 'slug') {
			const cleanValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');

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
				if (!cleanValue.trim()) {
					setErrorMsg((prev) => ({
						...prev,
						slug: __('Slug cannot be blank', 'multivendorx'),
					}));
					return;
				}

				const exists = await checkSlugExists(cleanValue);

				if (exists) {
					setErrorMsg((prev) => ({
						...prev,
						slug: `Slug "${cleanValue}" already exists.`,
					}));
					return;
				}

				setErrorMsg((prev) => ({ ...prev, slug: '' }));
				autoSave(updated);
				onUpdate({ slug: cleanValue });
			})();

			return;
		}

		if (name === 'phone' || name === 'country_code') {
			const phoneData = {
				country_code: updated.country_code || '',
				phone: updated.phone || '',
			};

			const isValidPhone = /^[0-9]{6,15}$/.test(updated.phone || '');

			if (isValidPhone || updated.phone === '') {
				autoSave({ phone: phoneData });
				setErrorMsg((prev) => ({ ...prev, phone: '' }));
			} else {
				setErrorMsg((prev) => ({
					...prev,
					phone: __('Invalid phone number', 'multivendorx'),
				}));
			}
			return;
		}

		autoSave(updated);
	};

	const autoSave = (updatedData: Record<string, unknown>) => {
		if (!id) {
			return;
		}

		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		})
			.then(() => {
				NoticeManager.add({
					title: __('Success', 'multivendorx'),
					message: __('Store saved successfully!', 'multivendorx'),
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
			<Container>
				<Column grid={8}>
					{/* Contact Information */}
					<Card title={__('Contact information', 'multivendorx')}>
						<FormGroupWrapper>
							<FormGroup
								label={__('Store email(s)', 'multivendorx')}
								desc={
									<>
										<b>{__('Tip:', 'multivendorx')}</b>
										{__(
											'You can add multiple email addresses. All added emails will receive notifications.',
											'multivendorx'
										)}
										<br />
										<b>
											{__(
												'Primary email:',
												'multivendorx'
											)}
										</b>
										{__(
											'Click the star icon to set an email as primary. This email will appear on your storefront, and all other email IDs will be hidden from display.',
											'multivendorx'
										)}
									</>
								}
							>
								<EmailsInputUI
									value={data?.store_email?.list || []}
									primary={data?.store_email?.primary || ''}
									enablePrimary={true}
									onChange={(list, primary) => saveEmails(list, primary)}
								/>
							</FormGroup>

							<FormGroup
								label={__('Phone', 'multivendorx')}
								notice={errorMsg.phone}
							>
								<SelectInputUI
									type="single-select"
									name="country_code"
									size="10rem"
									value={formData.country_code || ''}
									options={CountryCodes}
									onChange={(selected) =>
										handleChange(
											'country_code',
											selected as string
										)
									}
								/>
								<BasicInputUI
									name="phone"
									type="number"
									size="12rem"
									value={formData.phone || ''}
									onChange={(value) =>
										handleChange('phone', value)
									}
								/>
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
						</FormGroupWrapper>
					</Card>
					{/* Communication Address */}
					<Card title={__('Communication address', 'multivendorx')}>
						<FormGroupWrapper>
							<FormGroup
								label={__('Address *', 'multivendorx')}
								htmlFor="address"
							>
								<BasicInputUI
									name="address"
									value={addressData.address}
									onChange={(value) =>
										handleAddressChange('address', value)
									}
								/>
							</FormGroup>

							<FormGroup
								cols={2}
								label={__('City', 'multivendorx')}
								htmlFor="City"
							>
								<BasicInputUI
									name="city"
									value={addressData.city}
									onChange={(value) =>
										handleAddressChange('city', value)
									}
								/>
							</FormGroup>
							<FormGroup
								cols={2}
								label={__('Zip code', 'multivendorx')}
								htmlFor="zip"
							>
								<BasicInputUI
									name="zip"
									value={addressData.zip}
									onChange={(value) =>
										handleAddressChange('zip', value)
									}
								/>
							</FormGroup>

							{/* Country and State */}
							<FormGroup
								cols={2}
								label={__('Country', 'multivendorx')}
								htmlFor="country"
							>
								<SelectInputUI
									name="country"
									value={formData.country || ''}
									options={appLocalizer.country_list || []}
									onChange={handleCountryChange}
								/>
							</FormGroup>
							<FormGroup
								cols={2}
								label={__('State', 'multivendorx')}
								htmlFor="state"
							>
								<SelectInputUI
									name="state"
									value={formData.state || ''}
									options={stateOptions}
									onChange={handleStateChange}
								/>
							</FormGroup>
							{/* Map Component */}
							<FormGroup>{renderMapComponent()}</FormGroup>
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
					<Card
						id="store-status"
						title={__('Manage store status', 'multivendorx')}
					>
						<FormGroupWrapper>
							<FormGroup
								label={__('Current status', 'multivendorx')}
								desc={__('Learn what permissions each status provides, visit Store satus settings', 'multivendorx')}
							>
								<SelectInputUI
									name="status"
									value={formData.status || ''}
									options={statusOptions}
									onChange={(value) => {
										if (!value || Array.isArray(value)) {
											return;
										}
										const updated = {
											...formData,
											status: value,
										};
										onUpdate({ status: value });
										setFormData(updated);
										autoSave(updated);
									}}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</Card>
					{/* Manage Storefront Link */}
					<Card
						id="store-slug"
						title={__('Manage storefront link', 'multivendorx')}
					>
						<FormGroupWrapper>
							<FormGroup
								label={__(
									'Current storefront link',
									'multivendorx'
								)}
								notice={errorMsg.slug}
							>
								<BasicInputUI
									name="slug"
									value={formData.slug || ''}
									onChange={(val) =>
										handleChange('slug', val)
									}
								/>
								<div className="settings-metabox-description slug">
									{__('Store URL', 'multivendorx')} :{' '}
									<a
										className="link-item"
										target="_blank"
										rel="noopener noreferrer"
										href={`${appLocalizer.store_page_url}${formData.slug || ''}`}
									>
										{`${appLocalizer.store_page_url}${formData.slug || ''}`}{' '}
										<i className="adminfont-external"></i>
									</a>
								</div>
							</FormGroup>
						</FormGroupWrapper>
					</Card>

					{/* Social Information */}
					<Card title={__('Social information', 'multivendorx')}>
						{(
							[
								'facebook',
								'twitter',
								'linkedin',
								'youtube',
								'instagram',
								'pinterest',
							] as const
						).map((network) => {
							const iconClass = `${network} ${network}`;
							const defaultUrl = `https://${network === 'twitter' ? 'x' : network}.com/`;

							return (
								<FormGroupWrapper key={network}>
									<FormGroup
										icon={iconClass}
										label={
											network === 'twitter'
												? 'X'
												: network
													.charAt(0)
													.toUpperCase() +
												network.slice(1)
										}
									>
										<BasicInputUI
											name={network}
											value={
												formData[network]?.trim() ||
												defaultUrl
											}
											onChange={(val: string) =>
												handleChange(network, val)
											}
										/>
									</FormGroup>
								</FormGroupWrapper>
							);
						})}
					</Card>
				</Column>
			</Container>
		</>
	);
};

export default StoreSettings;
