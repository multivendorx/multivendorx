/* global storesList */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiLink, MapProviderUI } from 'zyra';
import { __, sprintf } from '@wordpress/i18n';

interface StoreRow {
	id: number;
	name: string;
	store_slug: string;
	topProducts?: string[];
}

interface StoresListProps {
	orderby?: string;
	order?: string;
	perPage?: number;
	showMap?: boolean;
}

const MarketplaceStoreList: React.FC<StoresListProps> = ({
	orderby = 'name',
	order = 'asc',
	perPage = 5,
}) => {
	const [data, setData] = useState<StoreRow[] | []>([]);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [search, setSearch] = useState('');
	const [mapLocation, setMapLocation] = useState({
		location_address: '',
		location_lat: '',
		location_lng: '',
	});
	const geoSettings = storesList?.settings_databases_value?.geolocation || {};

	const mapApiKey =
		geoSettings.choose_map_api === 'google_map'
			? geoSettings.google_map_api_key
			: geoSettings.mapbox_api_key;
	const radiusConfig = geoSettings?.radius_search_distance?.[0] || {};
	const radiusMax = radiusConfig.radius_search_max_distance || 500;
	const radiusUnit = radiusConfig.radius_search_unit || 'kilometers';

	const totalPages = Math.ceil(total / perPage);

	useEffect(() => {
		axios({
			method: 'GET',
			url: getApiLink(storesList, 'store'),
			headers: { 'X-WP-Nonce': storesList.nonce },
			params: {
				page: page,
				row: perPage,
				order_by: orderby,
				order: order,
				search_value: search,
				filters: true,
				location_lat: mapLocation.location_lat,
				location_lng: mapLocation.location_lng,
				radius_max: radiusMax,
				radius_unit: radiusUnit,
				filter_status: 'active',
			},
		})
			.then((response) => {
				setData(response.data || []);
				setTotal(Number(response?.headers?.['x-wp-total']) || 0);
			})
			.catch((error) =>
				console.error('Error fetching filtered stores:', error)
			);
	}, [page, perPage, orderby, order, search, mapLocation]);
	return (
		<>
			<div className="woocommerce multivendorx-store">
				<div className="store-list-top">
					<input
						type="search"
						className="store-search-input"
						placeholder={__('Search stores...', 'multivendorx')}
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(1);
						}}
					/>
					{mapApiKey && (
						<div className="store-map">
							<MapProviderUI
								apiKey={mapApiKey}
								locationAddress={mapLocation.location_address}
								locationLat={mapLocation.location_lat}
								locationLng={mapLocation.location_lng}
								mapProvider={geoSettings.choose_map_api}
								onLocationUpdate={(loc) => setMapLocation(loc)}
								placeholderSearch={__(
									'Search location...',
									'multivendorx'
								)}
							/>
						</div>
					)}
				</div>

				<p>
					{__('Showing', 'multivendorx')} {data.length}{' '}
					{__('stores', 'multivendorx')}
				</p>

				<div className="store-list-wrapper">
					<div className="store-list">
						{data &&
							data.map((store) => (
								<div key={store.id} className="store">
									<div className="store-body">
										<div className="store-header">
											{store.store_image ? (
												<div className="store-image">
													<img
														src={store.store_image}
														alt={store.store_name}
													/>
												</div>
											) : (
												<div className="avatar">
													{store.store_name
														?.charAt(0)
														.toUpperCase()}
												</div>
											)}

											<div className="store-details">
												<h4>{store.store_name}</h4>

												<div className="review-rating">
													{store.rating !==
														undefined && (
														<div
															className="star-rating"
															role="img"
															aria-label={sprintf(
																__(
																	'Rated %s out of 5',
																	'multivendorx'
																),
																store.rating.toFixed(
																	2
																)
															)}
														>
															<span
																style={{
																	width: `${(store.rating / 5) * 100}%`,
																}}
															>
																{__(
																	'Rated',
																	'multivendorx'
																)}{' '}
																<strong className="rating">
																	{store.rating.toFixed(
																		2
																	)}
																</strong>{' '}
																{__(
																	'out of 5',
																	'multivendorx'
																)}
															</span>
														</div>
													)}
												</div>
												<div className="contact-wrapper">
													{store.phone && (
														<span>
															<i className="dashicons dashicons-phone" />{' '}
															{store.phone}
														</span>
													)}

													{store.address && (
														<span>
															<i className="dashicons dashicons-location" />
															{store.address}
														</span>
													)}
												</div>
											</div>
										</div>
									</div>

									<div className="store-footer">
										<a
											href={`${storesList.store_page_url}/${store.store_slug || ''}/`}
											className="button"
										>
											{__('View Store', 'multivendorx')}
										</a>
									</div>
								</div>
							))}

						{totalPages > 1 && (
							<nav className="woocommerce-pagination">
								<ul className="page-numbers">
									<li>
										<button
											disabled={page === 1}
											onClick={() =>
												setPage((p) => p - 1)
											}
											className="page-numbers"
										>
											{__('Previous', 'multivendorx')}
										</button>
									</li>

									<li>
										<span className="page-numbers current">
											{page}
										</span>
									</li>

									<li>
										<button
											disabled={page >= totalPages}
											onClick={() =>
												setPage((p) => p + 1)
											}
											className="page-numbers"
										>
											{__('Next', 'multivendorx')}
										</button>
									</li>
								</ul>
							</nav>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default MarketplaceStoreList;
