/* global couponList */
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { formatDate } from '@/services/commonFunction';
const previewCoupons = [
	{
		id: 1,
		code: 'SAVE10',
		amount: '10',
		discount_type: 'percent',
		date_expires: '2026-12-31',
	},
	{
		id: 2,
		code: 'WELCOME20',
		amount: '20',
		discount_type: 'percent',
		date_expires: '2026-10-01',
	},
	{
		id: 3,
		code: 'FLAT50',
		amount: '50',
		discount_type: 'fixed_cart',
		date_expires: null,
	},
];
const StoreCouponList = ({
	perPage = 5,
	orderby = 'date',
	order = 'DESC',
	storeId,
	isPreview = false,
}) => {
	const [coupons, setCoupons] = useState([]);
	const [page, setPage] = useState(1);
	const [copiedCode, setCopiedCode] = useState(null);

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
		navigator.clipboard.writeText(code).then(() => {
			setCopiedCode(code);
		});
	};

	const fetchCoupons = useCallback(() => {
		const params = {
			per_page: perPage,
			page,
			orderby,
			order: order?.toLowerCase() === 'asc' ? 'asc' : 'desc',
			meta_key: 'multivendorx_store_id',
		};

		if(storeId){
			params.value = storeId;
		}
		
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
			.catch(() => {
				setCoupons([]);
			});
	}, [page, perPage, orderby, order]);

	useEffect(() => {
		if (isPreview) {
			setCoupons(previewCoupons);
			return;
		}

		fetchCoupons();
	}, [fetchCoupons, isPreview]);

	//If no coupons → render nothing
	if (!coupons.length) {
		return null;
	}

	return (
		<div className="store-coupon-list">
			<h3>{__('Coupons', 'multivendorx')}</h3>

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
								<span>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20px"
										height="20px"
										viewBox="0 0 24 24"
										fill="none"
									>
										<g id="Interface">
											<path
												id="Vector"
												d="M7 12L11.9497 16.9497L22.5572 6.34326M2.0498 12.0503L6.99955 17M17.606 6.39355L12.3027 11.6969"
												stroke="#000000"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</g>
									</svg>
								</span>
							) : (
								<span
									role="button"
									onClick={() => copyToClipboard(coupon.code)}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20px"
										height="20px"
										viewBox="0 0 24 24"
										fill="none"
									>
										<path
											fill-rule="evenodd"
											clip-rule="evenodd"
											d="M21 8C21 6.34315 19.6569 5 18 5H10C8.34315 5 7 6.34315 7 8V20C7 21.6569 8.34315 23 10 23H18C19.6569 23 21 21.6569 21 20V8ZM19 8C19 7.44772 18.5523 7 18 7H10C9.44772 7 9 7.44772 9 8V20C9 20.5523 9.44772 21 10 21H18C18.5523 21 19 20.5523 19 20V8Z"
											fill="#0F0F0F"
										/>
										<path
											d="M6 3H16C16.5523 3 17 2.55228 17 2C17 1.44772 16.5523 1 16 1H6C4.34315 1 3 2.34315 3 4V18C3 18.5523 3.44772 19 4 19C4.55228 19 5 18.5523 5 18V4C5 3.44772 5.44772 3 6 3Z"
											fill="#0F0F0F"
										/>
									</svg>
								</span>
							)}
						</h4>

						{coupon?.date_expires && (
							<p>
								<strong>{__('Expires', 'multivendorx')}:</strong>{' '}
								{formatDate(coupon.date_expires)}
							</p>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default StoreCouponList;
