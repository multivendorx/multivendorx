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

	const totalPages = Math.ceil(total / perPage);

	useEffect(() => {
		if (isEditor) return;

		const fetchCoupons = async () => {
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
							order,
							meta_key: 'multivendorx_store_id',
							value: StoreInfo?.storeDetails?.storeId,
						},
					}
				);

				setCoupons(response.data || []);
				setTotal(Number(response.headers['x-wp-total']) || 0);
			} catch (error) {
				console.error(__('Failed to load coupons', 'multivendorx'), error);
			}
		};

		fetchCoupons();
	}, [isEditor, page, perPage, orderby, order]);

	return (
		<div className="store-coupon-list">
			<h3>{__('Coupons', 'multivendorx')}</h3>
			{coupons.length > 0 ? (
				<>
					{coupons.map((coupon) => (
						<div key={coupon.id} className="coupon-card">
							<h4>{coupon.code}</h4>

							<p>
								<strong>
									{__('Usage Count', 'multivendorx')}:
								</strong>{' '}
								{coupon.usage_count ?? 0}
							</p>
						</div>
					))}

					<div className="pagination">
						<button
							disabled={page === 1}
							onClick={() => setPage((p) => p - 1)}
						>
							{__('Previous', 'multivendorx')}
						</button>

						<span>
							{__('Page', 'multivendorx')} {page}{' '}
							{__('of', 'multivendorx')} {totalPages}
						</span>

						<button
							disabled={page >= totalPages}
							onClick={() => setPage((p) => p + 1)}
						>
							{__('Next', 'multivendorx')}
						</button>
					</div>
				</>
			) : (
				<p>{__('No coupons found', 'multivendorx')}</p>
			)}
		</div>
	);	
};

export default StoreCouponList;