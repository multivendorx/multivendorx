/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	CommonPopup,
	TextArea,
	getApiLink,
	TableCard,
} from 'zyra';
import { formatCurrency, formatWcShortDate, toWcIsoDate } from '@/services/commonFunction';
import { QueryProps, TableRow } from '@/services/type';

const PendingProducts: React.FC<{ onUpdated?: () => void }> = ({
	onUpdated,
}) => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);

	// Reject popup state
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
				fetchData({})
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
				fetchData({});
				onUpdated?.();
			})
			.catch(console.error)
			.finally(() => setIsSubmitting(false)); // enable button again
	};

	const headers = [
		{ key: 'product', label: __('Product', 'multivendorx') },
		{ key: 'category', label: __('Category', 'multivendorx') },
		{ key: 'price', label: __('Price', 'multivendorx') },
		{ key: 'date', label: __('Date', 'multivendorx'), isSortable: true, },
		{
			key: 'action',
			type: 'action',
			label: 'Action',
			actions: [
				{
					label: __('Approve', 'multivendorx'),
					icon: 'check',
					onClick: (id: number) => handleSingleAction('approve_product', id)
				},
				{
					label: __('Reject', 'multivendorx'),
					icon: 'close',
					onClick: (id: number) => handleSingleAction('reject_product', id),
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

				const mappedRows: any[][] = products.map((product: any) => [
					{
						type: 'product',
						value: product.id,
						display: product.name,
						data: {
							id: product.id,
							name: product.name,
							sku: product.sku,
							image: product.images?.[0]?.src || '',
							link: `${appLocalizer.site_url}/wp-admin/post.php?post=${product.id}&action=edit`,
						},
					},
					{
						display: product.categories?.map((cat: any) => cat.name).join(', ') || '—',
						value: product.categories?.map((cat: any) => cat.name).join(', ') || '',
					},
					{
						display: formatCurrency(product.price),
						value: product.price,
					},
					{
						display: product.date_created
							? formatWcShortDate(product.date_created)
							: '-',
						value: product.date_created,
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
			{/* Reject Product Popup */}
			{rejectPopupOpen && (
				<CommonPopup
					open={rejectPopupOpen}
					onClose={() => {
						setRejectPopupOpen(false);
						setRejectReason('');
						setIsSubmitting(false);
					}}
					width="31.25rem"
					header={
						<>
							<div className="title">
								<i className="adminfont-cart"></i>
								{__('Reason', 'multivendorx')}
							</div>
							<i
								onClick={() => {
									setRejectPopupOpen(false);
									setRejectReason('');
									setIsSubmitting(false);
								}}
								className="icon adminfont-close"
							></i>
						</>
					}
					footer={
						<>
							<div
								className="admin-btn btn-red"
								onClick={() => {
									setRejectPopupOpen(false);
									setRejectReason('');
									setIsSubmitting(false);
								}}
							>
								{__('Cancel', 'multivendorx')}

							</div>
							<button
								className="admin-btn btn-purple"
								onClick={submitReject}
								disabled={isSubmitting} // prevent multiple clicks
							>
								{isSubmitting
									? __('Submitting...', 'multivendorx')
									: __('Reject', 'multivendorx')}
							</button>
						</>
					}
				>
					<>
						<div className="form-group">
							<TextArea
								name="reject_reason"
								value={rejectReason}
								onChange={(
									e: React.ChangeEvent<HTMLTextAreaElement>
								) => setRejectReason(e.target.value)}
								placeholder="Enter reason for rejecting this product..."
								rows={4}
							/>
						</div>
					</>
				</CommonPopup>
			)}
		</>
	);
};

export default PendingProducts;
