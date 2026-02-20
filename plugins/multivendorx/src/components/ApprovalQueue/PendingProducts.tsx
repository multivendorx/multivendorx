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
import { formatCurrency, toWcIsoDate } from '@/services/commonFunction';
import { QueryProps, TableRow } from '@/services/type';

const PendingProducts: React.FC<{ onUpdated?: () => void }> = ({
	onUpdated,
}) => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [rejectPopupOpen, setRejectPopupOpen] = useState(false);
	const [rejectReason, setRejectReason] = useState('');
	const [rejectProductId, setRejectProductId] = useState<number | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false); // prevent multiple clicks
	const [store, setStore] = useState<any[] | null>(null);

	useEffect(() => {
		axios
			.get(getApiLink(appLocalizer, 'store'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((response) => {
				const options = (response.data || []).map((store: any) => ({
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

	const handleSingleAction = (action: string, productId: number) => {
		if (!productId) {
			return;
		}

		if (action === 'reject_product') {
			setRejectProductId(productId);
			setRejectPopupOpen(true);
			return;
		}

		const statusUpdate = action === 'approve_product' ? 'publish' : null;
		if (!statusUpdate) {
			return;
		}

		axios
			.post(
				`${appLocalizer.apiUrl}/wc/v3/products/${productId}`,
				{ status: statusUpdate },
				{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
			)
			.then(() => {
				onUpdated?.();
				doRefreshTableData({});
			})
			.catch(console.error);
	};

	const submitReject = () => {
		if (!rejectProductId || isSubmitting) {
			return;
		}

		setIsSubmitting(true);

		axios
			.post(
				`${appLocalizer.apiUrl}/wc/v3/products/${rejectProductId}`,
				{
					status: 'draft',
					meta_data: [
						{ key: '_reject_note', value: rejectReason || '' }, // allow empty string
					],
				},
				{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
			)
			.then(() => {
				setRejectPopupOpen(false);
				setRejectReason('');
				setRejectProductId(null);
				doRefreshTableData({});
				onUpdated?.();
			})
			.catch(console.error)
			.finally(() => setIsSubmitting(false)); // enable button again
	};

	const headers = {
		name: {
			label: __('Product', 'multivendorx'),
		},
		category: {
			label: __('Category', 'multivendorx'),
			render: (row: any) =>
				row.categories?.map((c: any) => c.name).join(', ') || '-',
		},
		price: {
			label: __('Price', 'multivendorx'),
			type: 'currency',
		},
		date_created: {
			label: __('Date', 'multivendorx'),
			isSortable: true,
			type: 'date',
		},
		action: {
			type: 'action',
			label: 'Action',
			actions: [
				{
					label: __('Approve', 'multivendorx'),
					icon: 'check',
					onClick: (row) =>
						handleSingleAction('approve_product', row.id),
				},
				{
					label: __('Reject', 'multivendorx'),
					icon: 'close',
					onClick: (row) =>
						handleSingleAction('reject_product', row.id),
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
			.get(`${appLocalizer.apiUrl}/wc/v3/products`, {
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
				const products = Array.isArray(response.data)
					? response.data
					: [];

				const ids = products.map((p: any) => p.id);
				setRowIds(ids);

				setRows(products);
				setTotalRows(Number(response.headers['x-wp-total']) || 0);
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
			{/* Reject Product Popup */}
			{rejectPopupOpen && (
				<PopupUI
					open={rejectPopupOpen}
					onClose={() => {
						setRejectPopupOpen(false);
						setRejectReason('');
						setIsSubmitting(false);
					}}
					width={31.25}
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
						<div className="form-group">
							<TextAreaUI
								name="reject_reason"
								value={rejectReason}
								onChange={(value: string) =>
									setRejectReason(value)
								}
								placeholder="Enter reason for rejecting this product..."
								rows={4}
							/>
						</div>
					</>
				</PopupUI>
			)}
		</>
	);
};

export default PendingProducts;
