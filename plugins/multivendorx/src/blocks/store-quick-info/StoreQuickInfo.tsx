/* global StoreInfo */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { getApiLink } from '@zyra/core';
import { __ } from '@wordpress/i18n';

const StoreQuickInfo: React.FC<object> = () => {
	const [rating, setRatings] = useState<number | null>(null);
	const [ratingCount, setRatingsCount] = useState<number | null>(null);
	const [totalProducts, setTotalProducts] = useState<number | null>(null);
	const storeDetails = StoreInfo.storeDetails;

	useEffect(() => {
		const fetchRating = async () => {
			try {
				const response = await axios.get(
					getApiLink(StoreInfo, `reviews/${storeDetails.storeId}`),
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
		const fetchRatingCount = async () => {
			try {
				const response = await axios.get(
					getApiLink(StoreInfo, `reviews`),
					{
						headers: { 'X-WP-Nonce': StoreInfo.nonce },
						params: { store_id: storeDetails.storeId },
					}
				);
				setRatingsCount(Number(response.headers['x-wp-total']) || 0);
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
			fetchRatingCount();
		}

		fetchTotalProducts();
	}, [storeDetails.storeId]);

	const renderStars = (rating: number | null) => {
		if (!rating) {
			return null;
		}

		return (
			<div
				className="star-rating"
				role="img"
				aria-label={`Rated ${rating.toFixed(1)} out of 5`}
			>
				<span style={{ width: `${(rating / 5) * 100}%` }}>
					<strong className="rating">{rating.toFixed(1)}</strong>{' '}
					{__('out of 5', 'multivendorx')}
				</span>
			</div>
		);
	};

	return (
		<div className="store-card">
			<div className="store-header">
				<div className="store-avatar">
					<img
						src={
							storeDetails.storeLogo ||
							StoreInfo.default_user_avatar
						}
						alt="Store Avatar"
					/>
				</div>

				<div className="store-info">
					{storeDetails.storeName && (
						<h3 className="store-name">{storeDetails.storeName}</h3>
					)}
					{storeDetails.storeEmail && (
						<p>
							{' '}
							<span className="dashicons dashicons-email"></span>{' '}
							{storeDetails.storeEmail}
						</p>
					)}

					<div className="store-rating">
						{renderStars(rating)}
						{ratingCount !== null && (
							<span className="rating-count">
								{ratingCount > 0
									? `(${ratingCount} ${ratingCount === 1 ? __('review', 'multivendorx') : __('reviews', 'multivendorx')})`
									: __('(0 reviews)', 'multivendorx')}
							</span>
						)}
					</div>
				</div>
			</div>

			<div className="store-stats">
				{totalProducts !== null && (
					<div className="stat-item">
						<div className="stat-number">{totalProducts}</div>
						<div className="stat-label">
							{__('Products', 'multivendorx')}
						</div>
					</div>
				)}

				<div className="stat-item">
					<div className="stat-number">{ratingCount || 0}</div>
					<div className="stat-label">
						{__('Reviews', 'multivendorx')}
					</div>
				</div>
			</div>
		</div>
	);
};

export default StoreQuickInfo;
