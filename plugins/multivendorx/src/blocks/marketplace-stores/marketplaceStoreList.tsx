import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiLink, GoogleMap, Mapbox, useModules } from 'zyra';
import { __ } from '@wordpress/i18n';
import Select from 'react-select';

interface StoreRow {
	id: number;
	name: string;
	topProducts?: string[];
}

type Category = {
	id: number;
	name: string;
};
interface StoresListProps {
	orderby?: string;
	order?: string;
	category?: string;
	perPage?: number;
}

const MarketplaceStoreList: React.FC<StoresListProps> = ({
	orderby = '',
	order = '',
	category = '',
	perPage = 12,
}) => {
	const [data, setData] = useState<StoreRow[] | []>([]);
	const [categoryList, setCategoryList] = useState<Category[]>([]);
	const [product, setProduct] = useState<[]>([]);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const { modules } = useModules();
	const [apiKey, setApiKey] = useState('');

	const storesList = (window as any).storesList;
	const settings = storesList.settings_databases_value;

	const [isUserLocation, setIsUserLocation] = useState(false);

	useEffect(() => {
		if (!settings?.geolocation) return;

		const provider = settings.geolocation.choose_map_api;

		if (provider === 'google_map_set') {
			setApiKey(settings.geolocation.google_api_key || '');
		} else if (provider === 'mapbox_api_set') {
			setApiKey(settings.geolocation.mapbox_api_key || '');
		}
	}, [settings]);

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

	const totalPages = Math.ceil(total / perPage);

	const [filters, setFilters] = useState({
		address: '',
		distance: '',
		miles: '',
		sort: orderby,
		order: order,
		category: category,
		product: '',
		location_lat: '',
		location_lng: '',
	});

	useEffect(() => {
		axios
			.get(`${storesList.apiUrl}/wc/v3/products/categories`, {
				headers: { 'X-WP-Nonce': storesList.nonce },
			})
			.then((response) => {
				setCategoryList(response.data);
			});
	}, []);

	useEffect(() => {
		axios
			.get(`${storesList.apiUrl}/wc/v3/products`, {
				headers: { 'X-WP-Nonce': storesList.nonce },
				params: {
					per_page: 10,
					meta_key: 'multivendorx_store_id',
				},
			})
			.then((response) => {
				setProduct(response.data);
			});
	}, []);

	const loadProducts = async (inputValue: string) => {
		try {
			const response = await axios.get(
				`${storesList.apiUrl}/wc/v3/products`,
				{
					headers: { 'X-WP-Nonce': storesList.nonce },
					params: {
						per_page: 10,
						search: inputValue || undefined,
						meta_key: 'multivendorx_store_id',
					},
				}
			);

			return response.data.map((product: any) => ({
				label: product.name,
				value: product.id,
			}));
		} catch (error) {
			console.error('Product search error:', error);
			return [];
		}
	};

	useEffect(() => {
		handleSubmit();
	}, [filters, page, perPage]);

	useEffect(() => {
		setPage(1);
	}, [filters.product]);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFilters((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = () => {
		axios({
			method: 'GET',
			url: getApiLink(storesList, 'store'),
			headers: { 'X-WP-Nonce': storesList.nonce },
			params: {
				filters: {
					...filters,
					limit: perPage,
					offset: (page - 1) * perPage,
				},
			},
		})
			.then((response) => {
				setData(response.data.stores || []);
				setTotal(response.data.all || 0);
			})
			.catch((error) =>
				console.error('Error fetching filtered stores:', error)
			);
	};

	const handleLocationUpdate = (locationData: any) => {
		if (!locationData) return;

		const updatedAddress = {
			location_lat: locationData.location_lat || '',
			location_lng: locationData.location_lng || '',
			address: locationData.address || '',
			city: locationData.city || '',
			state: locationData.state || '',
			country: locationData.country || '',
			zip: locationData.zip || '',
		};

		// Update map UI
		setAddressData((prev) => ({
			...prev,
			...updatedAddress,
		}));

		// Update filters so API call works
		setFilters((prev) => ({
			...prev,
			location_lat: updatedAddress.location_lat,
			location_lng: updatedAddress.location_lng,
		}));
	};

	const requestUserLocation = () => {
		if (!navigator.geolocation) return;

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const lat = position.coords.latitude.toString();
				const lng = position.coords.longitude.toString();

				setIsUserLocation(true);

				setFilters((prev) => ({
					...prev,
					location_lat: lat,
					location_lng: lng,
				}));

				setAddressData((prev) => ({
					...prev,
					location_lat: lat,
					location_lng: lng,
					address: 'My Current Location',
				}));
			}
		);
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
			isUserLocation,
			onLocationUpdate: handleLocationUpdate,
			labelSearch: __('Search for a location'),
			labelMap: __('Drag or click on the map to choose a location'),
			instructionText: __('Enter a search term or drag/drop a pin on the map.'),
			placeholderSearch: __('Search for a location...'),
			stores: { data },
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
			{renderMapComponent()}
			<div className="">
				{/* Filter Bar */}
				<form className="woocommerce-form woocommerce-form-login login">
					<p className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
						<button className="woocommerce-button button wp-element-button" onClick={requestUserLocation}>
							Use My Current Location
						</button>
					</p>
					<div className="clear"></div>

					<p className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
						<input
							type="text"
							name="address"
							value={filters.address}
							onChange={handleInputChange}
							placeholder="Enter Address"
							className="woocommerce-Input woocommerce-Input--text input-text"
						/>
					</p>
					<div className="clear"></div>

					<p className="form-row form-row-wide">
						<p className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
							<select
								name="distance"
								value={filters.distance}
								onChange={handleInputChange}
								className=""
							>
								<option value="">Within</option>
								<option value="5">5</option>
								<option value="10">10</option>
								<option value="25">25</option>
							</select>
						</p>

						<p className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
							<select
								name="miles"
								value={filters.miles}
								onChange={handleInputChange}
								className=""
							>
								<option value="miles">Miles</option>
								<option value="km">Kilometers</option>
								<option value="nm">Nautical miles</option>
							</select>
						</p>

						<p className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">

							<select
								name="sort"
								value={filters.sort}
								onChange={handleInputChange}
								className=""
							>
								<option value="name">Select</option>
								<option value="category">By Category</option>
								<option value="shipping">By Shipping</option>
							</select>
						</p>
					</p>
				</form>

				{filters.sort == 'category' && (
					<select
						name="category"
						value={filters.category || ''}
						onChange={handleInputChange}
						className=""
					>
						<option value="">Select Category</option>
						{categoryList.map((cat) => (
							<option key={cat.id} value={cat.id}>
								{cat.name}
							</option>
						))}
					</select>
				)}
				<Select
					options={product.map((p) => ({
						label: String(p.name),
						value: p.id,
					}))}
					onInputChange={(value) => {
						loadProducts(value);
						return value;
					}}
					onChange={(selected) =>
						setFilters((prev) => ({
							...prev,
							product: selected?.value ?? '',
						}))
					}
					isClearable
				/>
				<div className="">Viewing all {data.length} stores</div>

				{/* Store Cards */}
				<div className="">
					{data &&
						data.map((store) => (
							<div key={store.id} className="">
								<div className="">
									<div className="">
										<img src={store.image} />
									</div>

									<div className="">
										<span>
											{store.phone}
										</span>
										<span>
											{store.address}
										</span>
									</div>
								</div>

								<h2 className="">{store.store_name}</h2>

								<div className="">
									<p className="">Top Products</p>
									{/* <div className="">
                {vendor.topProducts && vendor.topProducts.length > 0 ? (
                  vendor.topProducts.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="Product"
                      className=""
                    />
                  ))
                ) : (
                  <p className="">No products</p>
                )}
              </div> */}
								</div>
							</div>
						))}
				</div>


				<div className="pagination">
					<button
						disabled={page === 1}
						onClick={() => setPage((p) => p - 1)}
						className="woocommerce-button button wp-element-button"
					>
						Previous
					</button>

					<span>
						Page {page} of {totalPages}
					</span>

					<button
						disabled={page >= totalPages}
						onClick={() => setPage((p) => p + 1)}
						className="woocommerce-button button wp-element-button"
					>
						Next
					</button>
				</div>
			</div>
		</>

	);
};

export default MarketplaceStoreList;
