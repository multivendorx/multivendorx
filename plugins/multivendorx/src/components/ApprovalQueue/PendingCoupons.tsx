/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	getApiLink,
	TableCard,
	AdminButtonUI,
	PopupUI,
	TextAreaUI,
} from 'zyra';

import { toWcIsoDate } from '@/services/commonFunction';
import { QueryProps, TableRow } from '@/services/type';

const DISCOUNT_TYPE_LABELS: Record<string, string> = {
	percent: __('Percentage discount', 'multivendorx'),
	fixed_cart: __('Fixed cart discount', 'multivendorx'),
	fixed_product: __('Fixed product discount', 'multivendorx'),
};

const PendingCoupons: React.FC<{ onUpdated?: () => void }> = ({
	onUpdated,
}) => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [rejectPopupOpen, setRejectPopupOpen] = useState(false);
	const [rejectReason, setRejectReason] = useState('');
	const [rejectCouponId, setRejectCouponId] = useState<number | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [store, setStore] = useState<any[] | null>(null);

	useEffect(() => {
		axios
			.get(getApiLink(appLocalizer, 'store'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((response) => {
				const options =
					(response.data || []).map((store: any) => ({
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
		if (!couponId) {
			return;
		}

		if (action === 'reject_coupon') {
			setRejectCouponId(couponId);
			setRejectPopupOpen(true);
			return;
		}

		const statusUpdate = action === 'approve_coupon' ? 'publish' : null;
		if (!statusUpdate) {
			return;
		}

		axios
			.put(
				`${appLocalizer.apiUrl}/wc/v3/coupons/${couponId}`,
				{ status: statusUpdate },
				{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
			)
			.then(() => {
				doRefreshTableData({})
				onUpdated?.();
			})
			.catch(console.error);
	};

	const submitReject = () => {
		if (!rejectCouponId || isSubmitting) {
			return;
		}

		setIsSubmitting(true);

		axios
			.put(
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
				doRefreshTableData({});
				onUpdated?.();
			})
			.catch(console.error)
			.finally(() => setIsSubmitting(false));
	};

	const headers = {
		code: {
			label: __('Code', 'multivendorx'),
		},
		store_name: {
			label: __('Store', 'multivendorx'),
		},
		discount_type: {
			label: __('Discount Type', 'multivendorx'),
		},
		amount: {
			label: __('Amount', 'multivendorx'),
			type:'currency'
		},
		date_created: {
			label: __('Date created', 'multivendorx'),
			isSortable: true,
			type:'date'
		},
		action: {
			type: 'action',
			label: 'Action',
			actions: [
				{
					label: __('Approve', 'multivendorx'),
					icon: 'check',
					onClick: (row) => handleSingleAction('approve_coupon', id),
				},
				{
					label: __('Reject', 'multivendorx'),
					icon: 'close',
					onClick: (row) => handleSingleAction('reject_coupon', id),
					className: 'danger',
				},
			],
		},
	};


	const filters = [
		{
			key: 'store_id',
			label: 'Stores',
			type: 'select',
			options: store,
		},
		{
			key: 'created_at',
			label: 'Created Date',
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
					orderby: query.orderby,
					order: query.order,
					meta_key: 'multivendorx_store_id',
					value: query?.filter?.store_id,
					after: query.filter?.created_at?.startDate
						? toWcIsoDate(query.filter.created_at.startDate, 'start')
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

				const ids = coupons.map((p: any) => p.id);
				setRowIds(ids);

				setRows(coupons);
				setTotalRows(
					Number(response.headers['x-wp-total']) || 0
				);
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
						currencyPosition: appLocalizer.currency_position
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
							<AdminButtonUI
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
											? __('Submitting...', 'multivendorx')
											: __('Reject', 'multivendorx'),
										disabled: isSubmitting,
										onClick: submitReject,
									},
								]}
							/>
						}
					>
						<>
							<TextAreaUI
								name="reject_reason"
								value={rejectReason}
								onChange={(value: string) => setRejectReason(value)}
								placeholder="Enter reason for rejecting this coupon..."
								rows={4}
							/>
						</>
					</PopupUI>
				)}
			</div>
		</>
	);
};

export default PendingCoupons;
