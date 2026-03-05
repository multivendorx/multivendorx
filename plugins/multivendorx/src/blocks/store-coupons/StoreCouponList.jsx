import { useEffect, useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';

const StoreCouponList = ({
	isEditor = false,
	perPage = 10,
	orderby = 'date',
	order = 'DESC',
}) => {
	const [coupons, setCoupons] = useState([]);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [copiedCode, setCopiedCode] = useState(null); 

	const totalPages = Math.ceil(total / perPage);

	// Normalize order for WooCommerce REST API
	const normalizedOrder =
		order?.toLowerCase() === 'asc' ? 'asc' : 'desc';

	useEffect(() => {
		if (isEditor) return;

		const fetchCoupons = async () => {
			setLoading(true);

			try {
				const response = await axios.get(
					`${StoreInfo.apiUrl}/wc/v3/coupons`,
					{
						headers: {
							'X-WP-Nonce': StoreInfo.nonce,
						},
						params: {
							per_page: perPage,
							page,
							orderby,
							order: normalizedOrder,
							meta_key: 'multivendorx_store_id',
							meta_value:
								StoreInfo?.storeDetails?.storeId,
						},
					}
				);

				setCoupons(response.data || []);
				setTotal(
					Number(response.headers['x-wp-total']) || 0
				);
			} catch (error) {
				console.error(
					__('Failed to load coupons', 'multivendorx'),
					error
				);
				setCoupons([]);
			} finally {
				setLoading(false);
			}
		};

		fetchCoupons();
	}, [isEditor, page, perPage, orderby, normalizedOrder]);

	// Reset to page 1 when sorting changes
	useEffect(() => {
		setPage(1);
	}, [orderby, normalizedOrder, perPage]);

	// Clear copied message after 2 seconds
	useEffect(() => {
		if (copiedCode) {
			const timer = setTimeout(() => {
				setCopiedCode(null);
			}, 2000);
			return () => clearTimeout(timer);
		}
	}, [copiedCode]);

	const copyToClipboard = async (code) => {
		try {
			await navigator.clipboard.writeText(code);
			setCopiedCode(code);
		} catch (err) {
			console.error('Failed to copy: ', err);
		}
	};

	const formatDate = (dateString) => {
		if (!dateString) return __('No expiry', 'multivendorx');

		const date = new Date(dateString);
		return date.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	return (
		<div className="store-coupon-list">
			<h3>{__('Coupons', 'multivendorx')}</h3>

			{loading && (
				<p>{__('Loading coupons...', 'multivendorx')}</p>
			)}

			{!loading && coupons.length > 0 ? (
				<>
					{coupons.map((coupon) => {
						const discountLabel =
							coupon.discount_type === 'percent'
								? `${coupon.amount}%`
								: `${coupon.amount}`;

						return (
							<div
								key={coupon.id}
								className="coupon-card"
							>
								<p>
									{discountLabel}{' '}
									{__('off on all orders', 'multivendorx')}
								</p>

								<h4>
									{coupon.code}

									{copiedCode === coupon.code ? (
										// Show check icon when copied
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

								{/* <p>
									<strong>
										{__('Usage Count', 'multivendorx')}:
									</strong>{' '}
									{coupon.usage_count ?? 0}
								</p> */}

								<p>
									<strong>
										{__('Expires', 'multivendorx')}:
									</strong>{' '}
									{formatDate(
										coupon.date_expires
									)}
								</p>
							</div>
						);
					})}

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="pagination">
							<button
								disabled={page === 1}
								onClick={() =>
									setPage((p) => p - 1)
								}
							>
								{__(
									'Previous',
									'multivendorx'
								)}
							</button>

							<span>
								{__('Page', 'multivendorx')} {page}{' '}
								{__('of', 'multivendorx')} {totalPages}
							</span>

							<button
								disabled={page >= totalPages}
								onClick={() =>
									setPage((p) => p + 1)
								}
							>
								{__('Next', 'multivendorx')}
							</button>
						</div>
					)}
				</>
			) : (
				!loading && (
					<p>
						{__(
							'No coupons found',
							'multivendorx'
						)}
					</p>
				)
			)}
		</div>
	);
};

export default StoreCouponList;