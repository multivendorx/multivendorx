import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';

const StoreCouponList = ({
	store_id = '',
	store_slug = '',
	perPage = 10,
	orderby = 'date',
	order = 'DESC',
}) => {
	const [coupons, setCoupons] = useState([]);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [copiedCode, setCopiedCode] = useState(null); 

	// Always keep minimum page count = 1
	const totalPages = Math.max(1, Math.ceil(total / perPage));

	// Reset page when filters change
	useEffect(() => {
		setPage(1);
	}, [store_id, store_slug, perPage, orderby, order]);

	useEffect(() => {
		if (copiedCode) {
			const timer = setTimeout(() => setCopiedCode(null), 2000);
			return () => clearTimeout(timer);
		}
	}, [copiedCode]);

	const copyToClipboard = async (code) => {
		try {
			await navigator.clipboard.writeText(code);
			setCopiedCode(code);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	};

	const fetchCoupons = useCallback(async () => {
		try {
			const response = await axios.get(
				`${couponList.apiUrl}/wc/v3/coupons`,
				{
					headers: {
						'X-WP-Nonce': couponList.nonce,
					},
					params: {
						per_page: perPage,
						page,
						orderby,
						order: order?.toLowerCase() === 'asc' ? 'asc' : 'desc',

						// Filter meta query style (WooCommerce REST doesn't always support direct meta filters)
						meta_key: 'multivendorx_store_id',
						meta_value: store_id,
						store_slug,
					},
				}
			);

			setCoupons(response.data || []);
			setTotal(Number(response.headers['x-wp-total']) || 0);
		} catch (error) {
			console.error('Failed to load coupons:', error);
		}
	}, [page, perPage, store_id, store_slug, orderby, order]);

	useEffect(() => {
		fetchCoupons();
	}, [fetchCoupons]);

	return (
		<div className="store-coupon-list">
			{coupons.map((coupon) => (
				<div key={coupon.id} className="coupon-card">
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
								style={{ cursor: 'pointer', opacity: 0.7 }}
							>
								<path
									d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z"
									fill="currentColor"
								/>
							</svg>
						)}
					</h4>

					<p>
						<strong>{__('Usage Count', 'multivendorx')}:</strong>{' '}
						{coupon.usage_count ?? 0}
					</p>
				</div>
			))}

			{/* Show pagination only when needed */}
			{total > perPage && (
				<div className="pagination">
					<button
						disabled={page === 1}
						onClick={() => setPage((p) => Math.max(1, p - 1))}
					>
						{__('Previous', 'multivendorx')}
					</button>

					<span>
						{__('Page', 'multivendorx')} {page}{' '}
						{__('of', 'multivendorx')} {totalPages}
					</span>

					<button
						disabled={page >= totalPages}
						onClick={() =>
							setPage((p) => Math.min(totalPages, p + 1))
						}
					>
						{__('Next', 'multivendorx')}
					</button>
				</div>
			)}
		</div>
	);
};

export default StoreCouponList;