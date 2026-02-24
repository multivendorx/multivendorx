import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { getApiLink } from 'zyra';
import { __ } from '@wordpress/i18n';

const StoreQuickInfo: React.FC<{}> = () => {
	const [rating, setRatings] = useState<number | null>(null);
	const [totalProducts, setTotalProducts] = useState<number | null>(null);
	const storeDetails = StoreInfo.storeDetails;

	useEffect(() => {
		const fetchRating = async () => {
			try {
				const response = await axios.get(
					getApiLink(StoreInfo, `review/${storeDetails.storeId}`),
					{
						headers: { 'X-WP-Nonce': StoreInfo.nonce },
						params: { storeId: storeDetails.storeId },
					}
				);
				setRatings(Number(response.data) || 0);
			} catch (err) {
				console.error('Failed to fetch rating', err);
			}
		};

		const fetchTotalProducts = async () => {
			try {
				const response = await axios.get(
					`${StoreInfo.apiUrl}/wc/v3/products`,
					{
						headers: { 'X-WP-Nonce': StoreInfo.nonce },
						params: {
							per_page: 1,
							meta_key: 'multivendorx_store_id',
							value: storeDetails.storeId,
						},
					}
				);

				const total = parseInt(
					response.headers['x-wp-total'] || '0',
					10
				);

				setTotalProducts(total);
			} catch (err) {
				console.error('Failed to fetch total products', err);
			}
		};

		if (StoreInfo.activeModules?.includes('store-review')) {
			fetchRating();
		}

		fetchTotalProducts();
	}, [storeDetails.storeId]);

	return (
		<div className="store-card">
			<div className="store-header">
				<div className="store-avatar">
					{storeDetails.storeLogo ? (
						<img src={storeDetails.storeLogo} alt="Store Avatar" />
					) : storeDetails.storeName ? (
						<span>
							{storeDetails.storeName.slice(0, 2).toUpperCase()}
						</span>
					) : null}
				</div>

				<div className="store-info">
					{storeDetails.storeName && (
						<h3 className="store-name">{storeDetails.storeName}</h3>
					)}
					{storeDetails.storeEmail && (
						<p className="store-email">{storeDetails.storeEmail}</p>
					)}

					{rating !== null && (
						<div className="store-rating">
							<span className="stars">★★★★★</span>
							<span className="rating-number">{rating}</span>
						</div>
					)}
				</div>
			</div>

			<div className="store-stats">
				{totalProducts !== null && (
					<div className="stat-item">
						<div className="stat-number">{totalProducts}</div>
						<div className="stat-label">{__('Products', 'multivendorx')}</div>
					</div>
				)}

				{rating !== null && (
					<div className="stat-item">
						<div className="stat-number">{rating}</div>
						<div className="stat-label">{__('Rating', 'multivendorx')}</div>
					</div>
				)}

				{storeDetails.totalSales !== undefined && (
					<div className="stat-item">
						<div className="stat-number">
							{storeDetails.totalSales}
						</div>
						<div className="stat-label">{__('Sales', 'multivendorx')}</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default StoreQuickInfo;