/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	getApiLink,
	CommonPopup,
	TextArea,
	AdminButton,
	TableCard,
} from 'zyra';

import { formatWcShortDate, toWcIsoDate } from '@/services/commonFunction';
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

	// Reject popup state
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
				fetchData({})
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
				fetchData({});
				onUpdated?.();
			})
			.catch(console.error)
			.finally(() => setIsSubmitting(false));
	};

	const headers = [
		{ key: 'code', label: __('Code', 'multivendorx') },
		{ key: 'discount_type', label: __('Discount Type', 'multivendorx') },
		{ key: 'date', label: __('Date created', 'multivendorx'), isSortable: true, },
		{
			key: 'action',
			type: 'action',
			label: 'Action',
			actions: [
				{
					label: __('Approve', 'multivendorx'),
					icon: 'check',
					onClick: (id: number) => handleSingleAction('approve_coupon', id)
				},
				{
					label: __('Reject', 'multivendorx'),
					icon: 'close',
					onClick: (id: number) => handleSingleAction('reject_coupon', id),
					className: 'danger',
				},
			],
		},
	];

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

	const fetchData = (query: QueryProps) => {
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
				const products = Array.isArray(response.data)
					? response.data
					: [];

				const ids = products.map((p: any) => p.id);
				setRowIds(ids);

				const mappedRows: any[][] = products.map((coupon: any) => [
					{
						type: 'card',
						value: coupon.id,
						display: coupon.code,
						data: {
							name: coupon.code,
							description:`By: ${coupon.store_name}`,
							link: `${appLocalizer.site_url}/wp-admin/post.php?post=${coupon.id}&action=edit`,
						},
					},
					{
						display: `${coupon.amount} ${DISCOUNT_TYPE_LABELS[coupon.discount_type]}`,
						value: coupon.amount,
					},
					{
						display: coupon.date_created
							? formatWcShortDate(coupon.date_created)
							: '-',
						value: coupon.date_created,
					}
				]);

				setRows(mappedRows);
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
					onQueryUpdate={fetchData}
					ids={rowIds}
					search={{}}
					filters={filters}
				/>
				{/* Reject Coupon Popup */}
				{rejectPopupOpen && (
					<CommonPopup
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
							onClose: () => {
								setRejectPopupOpen(false);
								setRejectReason('');
								setIsSubmitting(false);
							},
						}}
						footer={
							<AdminButton
								buttons={[
									{
										icon: 'close',
										text: __('Cancel', 'multivendorx'),
										className: 'red',
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
										className: 'purple-bg',
										disabled: isSubmitting,
										onClick: submitReject,
									},
								]}
							/>
						}
					>
						<>
							<TextArea
								name="reject_reason"
								value={rejectReason}
								onChange={(
									e: React.ChangeEvent<HTMLTextAreaElement>
								) => setRejectReason(e.target.value)}
								placeholder="Enter reason for rejecting this coupon..."
								rows={4}
							/>
						</>
					</CommonPopup>
				)}
			</div>
		</>
	);
};

export default PendingCoupons;
