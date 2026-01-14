import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const StoreCouponList = ({
	store_id = '',
	store_slug = '',
	perPage = 10,
	orderby = 'date',
	order = 'DESC',
}) => {
	console.log('cl',couponList)
	const [coupons, setCoupons] = useState([]);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);

	const totalPages = Math.ceil(total / perPage);

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
						// order,
						meta_key: 'multivendorx_store_id',
						value: store_id,
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
					<h4>{coupon.code}</h4>

					<p>
						<strong>Usage Count:</strong>{' '}
						{coupon.usage_count ?? 0}
					</p>
				</div>
			))}

			<div className="pagination">
				<button
					disabled={page === 1}
					onClick={() => setPage((p) => p - 1)}
				>
					Previous
				</button>

				<span>
					Page {page} of {totalPages}
				</span>

				<button
					disabled={page >= totalPages}
					onClick={() => setPage((p) => p + 1)}
				>
					Next
				</button>
			</div>
		</div>
	);
};

export default StoreCouponList;
