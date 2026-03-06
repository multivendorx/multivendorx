import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { formatDate } from '@/services/commonFunction';

const StoreCouponList = ({
	perPage = 10,
	orderby = 'date',
	order = 'DESC',
}) => {
	const [coupons, setCoupons] = useState([]);
	const [page, setPage] = useState(1);
	const [copiedCode, setCopiedCode] = useState(null);
	const [loading, setLoading] = useState(false);

	// Reset page when filters change
	useEffect(() => {
		setPage(1);
	}, [perPage, orderby, order]);

	useEffect(() => {
		if (copiedCode) {
			const timer = setTimeout(() => setCopiedCode(null), 2000);
			return () => clearTimeout(timer);
		}
	}, [copiedCode]);

	const copyToClipboard = (code) => {
		navigator.clipboard
			.writeText(code)
			.then(() => {
				setCopiedCode(code);
			})
			.catch((err) => {
				console.error('Failed to copy:', err);
			});
	};

	const fetchCoupons = useCallback(() => {
		setLoading(true);

		const params = {
			per_page: perPage,
			page,
			orderby,
			order: order?.toLowerCase() === 'asc' ? 'asc' : 'desc',
			meta_key: 'multivendorx_store_id',
		};

		if (couponList?.storeDetails?.storeId) {
			params.value = couponList.storeDetails.storeId;
		}

		axios
			.get(`${couponList.apiUrl}/wc/v3/coupons`, {
				headers: {
					'X-WP-Nonce': couponList.nonce,
				},
				params,
			})
			.then((response) => {
				setCoupons(response.data || []);
			})
			.catch((error) => {
				console.error('Failed to load coupons:', error);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [page, perPage, orderby, order]);

	useEffect(() => {
		fetchCoupons();
	}, [fetchCoupons]);

	return (
		<div className="store-coupon-list">
			<h3>{__('Coupons', 'multivendorx')}</h3>

			{loading && <p>{__('Loading coupons...', 'multivendorx')}</p>}

			{!loading && coupons.length > 0 ? (
				<>
					{coupons.map((coupon) => {
						const discountLabel =
							coupon.discount_type === 'percent'
								? `${coupon.amount}%`
								: `${coupon.amount}`;

						return (
							<div key={coupon.id} className="coupon-card">
								<p>
									{discountLabel}{' '}
									{__('off on all orders', 'multivendorx')}
								</p>

								<h4>
									{coupon.code}

									{copiedCode === coupon.code ? (
										<svg
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M4 12.6111L8.92308 17.5L20 6.5"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									) : (
										<svg
											aria-label={__('Copy coupon code', 'multivendorx')}
											title={__('Copy coupon code', 'multivendorx')}
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
											onClick={() => copyToClipboard(coupon.code)}
										>
											<path
												d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z"
												fill="currentColor"
											/>
										</svg>
									)}
								</h4>

								<p>
									<strong>{__('Expires', 'multivendorx')}:</strong>{' '}
									{formatDate(coupon.date_expires)}
								</p>
							</div>
						);
					})}
				</>
			) : (
				!loading && <p>{__('No coupons found', 'multivendorx')}</p>
			)}
		</div>
	);
};

export default StoreCouponList;