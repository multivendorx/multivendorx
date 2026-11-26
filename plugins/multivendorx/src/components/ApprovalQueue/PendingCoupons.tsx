/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink } from '@zyra/core';
import { PopupComponent } from '@zyra/components';
import { ButtonInput, TextAreaInput } from '@zyra/inputs';
import { TableCard, TableRow, QueryProps } from '@zyra/table';

import {
	formatCurrency,
	formatDate,
	formatStatusLabel,
	getUrl,
	toWcIsoDate,
} from '@/services/commonFunction';
import ListGate from '../Popup/ListGate';
import useNoRecordsYet from '../Popup/useNoRecordsYet';
import { SAMPLE_PENDING_COUPONS } from '../Popup/sampleRows';
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

	useEffect(() => {
		axios
			.get(getApiLink(appLocalizer, 'stores'), {
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
				doRefreshTableData({});
			})
			.catch(console.error)
			.finally(() => setIsSubmitting(false));
	};

	const headers = {
		code: {
			label: __('Code', 'multivendorx'),
			type: 'info',
			iconKey: 'info_icon',
			titleLinkKey: 'info_link',
			descriptionKey: 'info_descriptions',
			badgesKey: 'info_badges',
		},
		action: {
			label: __('Action', 'multivendorx'),
			render: (row) => {
				return (
					<ButtonInput
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
			label: __('Select Stores', 'multivendorx'),
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
				window.multivendorxStore?.setCount(
					'coupons',
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

	/** A record as a table row; the sample rows go through it too, so they look like real ones. */
	const toInfoRow = (row: any) => ({
		...row,
		info_icon: 'coupon',
		info_link: getUrl(row.id, 'coupon') || '',
		info_descriptions: [
			{
				label: __('By', 'multivendorx'),
				icon: 'storefront',
				value: row.store_name || '—',
			},
			{
				label: __('Amount', 'multivendorx'),
				icon: 'dollar',
				value: formatCurrency(row.amount),
			},
		],
		info_badges: [
			{
				text: formatStatusLabel(row.discount_type),
				color: `badge-${row.status}`,
			},
			{ text: formatDate(row.date_created), color: 'blue' },
		],
	});
	const infoRows = rows.map(toInfoRow);

	const sampleRowsData = SAMPLE_PENDING_COUPONS;
	const { props: gatedProps, hasNoRecords } = useNoRecordsYet({
		rows: infoRows,
		isLoading,
		onQueryUpdate: doRefreshTableData,
	});

	return (
		<>
			<ListGate
				feature={{
					title: __('Coupons awaiting review', 'multivendorx'),
					description: '',
					icon: 'coupon',
				}}
				sample={
					<TableCard
						headers={headers}
						variant="transparent"
						search={{
							placeholder: __('Search coupons…', 'multivendorx'),
						}}
						filters={filters}
						format={appLocalizer.date_format}
						currency={{
							currencySymbol: appLocalizer.currency_symbol,
							priceDecimals: appLocalizer.price_decimals,
							decimalSeparator: appLocalizer.decimal_separator,
							thousandSeparator: appLocalizer.thousand_separator,
							currencyPosition: appLocalizer.currency_position,
						}}
						rows={sampleRowsData.map(toInfoRow)}
						totalRows={sampleRowsData.length}
					/>
				}
				isEmpty={hasNoRecords}
				empty={{
					heading: __(
						'No coupons waiting for review',
						'multivendorx'
					),
					description: __(
						'When stores need approval to publish coupons, each one they create waits here until you publish or reject it.',
						'multivendorx'
					),
					actions: (
						<>
							<a
								className="mvx-locked-button"
								href={'#&tab=settings&subtab=store-permissions'}
							>
								{__('Store permissions', 'multivendorx')}
							</a>
							<a
								className="mvx-locked-link"
								href={`${appLocalizer.admin_url}edit.php?post_type=shop_coupon`}
							>
								{__('View coupons', 'multivendorx')}
							</a>
						</>
					),
					note: __(
						'A preview with sample coupons. Submissions show here.',
						'multivendorx'
					),
				}}
			>
				<TableCard
					headers={headers}
					variant="transparent"
					rows={infoRows}
					totalRows={totalRows}
					isLoading={isLoading}
					onQueryUpdate={gatedProps.onQueryUpdate}
					ids={rowIds}
					search={{
						placeholder: __('Search coupons…', 'multivendorx'),
					}}
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
			</ListGate>
			{/* Reject Coupon Popup */}
			{rejectPopupOpen && (
				<PopupComponent
					open={rejectPopupOpen}
					onClose={() => {
						setRejectPopupOpen(false);
						setRejectReason('');
						setIsSubmitting(false);
					}}
					width="31.25rem"
					className="popup-drawer"
					header={{
						icon: 'cart',
						title: __('Reason', 'multivendorx'),
					}}
					footer={
						<ButtonInput
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
					<TextAreaInput
						name="reject_reason"
						value={rejectReason}
						onChange={(value: string) => setRejectReason(value)}
						placeholder={__(
							'Enter reason for rejecting this coupon...',
							'multivendorx'
						)}
						rows={4}
					/>
				</PopupComponent>
			)}
		</>
	);
};

export default PendingCoupons;
