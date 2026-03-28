/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	getApiLink,
	TableCard,
	ButtonInputUI,
	PopupUI,
	TextAreaUI,
	TableRow,
	QueryProps,
	InfoItem,
} from 'zyra';

import { getUrl, setSession, toWcIsoDate } from '@/services/commonFunction';
import { useRef } from '@wordpress/element';
type StoreOption = {
	label: string;
	value: number;
};
const PendingCoupons: React.FC<object> = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [rejectPopupOpen, setRejectPopupOpen] = useState(false);
	const [rejectReason, setRejectReason] = useState('');
	const [rejectCouponId, setRejectCouponId] = useState<number | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [store, setStore] = useState<StoreOption[] | null>(null);
	const firstLoadRef = useRef(true);

	useEffect(() => {
		axios
			.get(getApiLink(appLocalizer, 'store'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: { options: true },
			})
			.then((response) => {
				const options = (response.data || []).map((store) => ({
					label: store.store_name,
					value: store.id,
				}));

				setStore(options);
				setIsLoading(false);
			})
			.catch(() => {
				setStore([]);
				setIsLoading(false);
			});
	}, []);

	const handleSingleAction = (action: string, couponId: number) => {
		if (!couponId && !action) {
			return;
		}

		if (action === 'reject') {
			setRejectCouponId(couponId);
			setRejectPopupOpen(true);
			return;
		}

		axios
			.post(
				`${appLocalizer.apiUrl}/wc/v3/coupons/${couponId}`,
				{ status: action },
				{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
			)
			.then(() => {
				firstLoadRef.current = true;
				doRefreshTableData({});
			})
			.catch(console.error);
	};

	const submitReject = () => {
		if (!rejectCouponId || isSubmitting) {
			return;
		}

		setIsSubmitting(true);

		axios
			.post(
				`${appLocalizer.apiUrl}/wc/v3/coupons/${rejectCouponId}`,
				{
					status: 'draft',
					meta_data: [
						{ key: '_reject_note', value: rejectReason || '' },
					],
				},
				{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
			)
			.then(() => {
				setRejectPopupOpen(false);
				setRejectReason('');
				setRejectCouponId(null);
				firstLoadRef.current = true;
				doRefreshTableData({});
			})
			.catch(console.error)
			.finally(() => setIsSubmitting(false));
	};

	const headers = {
		code: {
			label: __('Code', 'multivendorx'),
			render: (row) => {
				return (
					<InfoItem
						title={row.code}
						titleLink={getUrl(row.id, 'coupon') || ''}
						descriptions={[
							{
								label: __('By', 'multivendorx'),
								value: row.store_name,
							},
						]}
					/>
				);
			},
		},
		discount_type: {
			label: __('Discount Type', 'multivendorx'),
			type: 'status',
		},
		amount: {
			label: __('Amount', 'multivendorx'),
			type: 'currency',
		},
		date_created: {
			label: __('Date created', 'multivendorx'),
			type: 'date',
		},
		action: {
			label: 'Action',
			render: (row) => {
				return (
					<ButtonInputUI
						buttons={[
							{
								icon: 'check',
								text: __('Approve', 'multivendorx'),
								color: 'purple',
								onClick: () =>
									handleSingleAction('publish', row.id),
							},
							{
								icon: 'close',
								text: __('Reject', 'multivendorx'),
								color: 'red',
								onClick: () =>
									handleSingleAction('reject', row.id),
							},
						]}
					/>
				);
			},
		},
	};

	const filters = [
		{
			key: 'store_id',
			label: __('Stores', 'multivendorx'),
			type: 'select',
			options: store,
		},
		{
			key: 'created_at',
			label: __('Created Date', 'multivendorx'),
			type: 'date',
		},
	];

	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);
		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/coupons`, {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
				params: {
					page: query.paged,
					per_page: query.per_page,
					search: query.searchValue,
					orderby: 'date',
					order: 'desc',
					meta_key: 'multivendorx_store_id',
					value: query?.filter?.store_id,
					after: query.filter?.created_at?.startDate
						? toWcIsoDate(
								query.filter.created_at.startDate,
								'start'
							)
						: undefined,

					before: query.filter?.created_at?.endDate
						? toWcIsoDate(query.filter.created_at.endDate, 'end')
						: undefined,
					status: 'pending',
				},
			})
			.then((response) => {
				const coupons = Array.isArray(response.data)
					? response.data
					: [];

				const ids = coupons.map((coupon) => coupon.id);
				setRowIds(ids);

				setRows(coupons);
				setTotalRows(Number(response.headers['x-wp-total']) || 0);
				if (firstLoadRef.current) {
					setSession(
						'couponCount',
						Number(response.headers['x-wp-total']) || 0
					);
					firstLoadRef.current = false;
				}
				setIsLoading(false);
			})
			.catch((error) => {
				console.error('Product fetch failed:', error);
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
			});
	};

	return (
		<>
			<div className="admin-table-wrapper">
				<TableCard
					headers={headers}
					rows={rows}
					totalRows={totalRows}
					isLoading={isLoading}
					onQueryUpdate={doRefreshTableData}
					ids={rowIds}
					search={{}}
					filters={filters}
					format={appLocalizer.date_format}
					currency={{
						currencySymbol: appLocalizer.currency_symbol,
						priceDecimals: appLocalizer.price_decimals,
						decimalSeparator: appLocalizer.decimal_separator,
						thousandSeparator: appLocalizer.thousand_separator,
						currencyPosition: appLocalizer.currency_position,
					}}
				/>
				{/* Reject Coupon Popup */}
				{rejectPopupOpen && (
					<PopupUI
						open={rejectPopupOpen}
						onClose={() => {
							setRejectPopupOpen(false);
							setRejectReason('');
							setIsSubmitting(false);
						}}
						width="31.25rem"
						header={{
							icon: 'cart',
							title: __('Reason', 'multivendorx'),
						}}
						footer={
							<ButtonInputUI
								buttons={[
									{
										icon: 'close',
										text: __('Cancel', 'multivendorx'),
										color: 'red',
										onClick: () => {
											setRejectPopupOpen(false);
											setRejectReason('');
											setIsSubmitting(false);
										},
									},
									{
										icon: 'cross',
										text: isSubmitting
											? __(
													'Submitting...',
													'multivendorx'
												)
											: __('Reject', 'multivendorx'),
										disabled: isSubmitting,
										onClick: submitReject,
									},
								]}
							/>
						}
					>
						<TextAreaUI
							name="reject_reason"
							value={rejectReason}
							onChange={(value: string) => setRejectReason(value)}
							placeholder={__(
								'Enter reason for rejecting this coupon...',
								'multivendorx'
							)}
							rows={4}
						/>
					</PopupUI>
				)}
			</div>
		</>
	);
};

export default PendingCoupons;
