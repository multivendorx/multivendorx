/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	Table,
	TableCell,
	CommonPopup,
	TextArea,
	getApiLink,
	MultiCalendarInput,
} from 'zyra';
import {
	ColumnDef,
	RowSelectionState,
	PaginationState,
} from '@tanstack/react-table';
import { formatWcShortDate } from '@/services/commonFunction';

type StoreRow = {
	id?: number;
	store_name?: string;
	store_slug?: string;
	status?: string;
	name?: string;
	images?: { src: string }[];
	categories?: { name: string }[];
	sku?: string;
	price?: string;
	price_html?: string;
};

type FilterData = {
	searchAction?: string;
	searchField?: string;
	typeCount?: any;
	store?: string;
	date?: { start_date?: Date; end_date?: Date };
	orderBy?: string;
	order?: string;
};

export interface RealtimeFilter {
	name: string;
	render: (
		updateFilter: (key: string, value: any) => void,
		filterValue: any
	) => React.ReactNode;
}

const PendingProducts: React.FC<{ onUpdated?: () => void }> = ({
	onUpdated,
}) => {
	const [data, setData] = useState<StoreRow[] | null>(null);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [totalRows, setTotalRows] = useState<number>(0);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [pageCount, setPageCount] = useState(0);

	// Reject popup state
	const [rejectPopupOpen, setRejectPopupOpen] = useState(false);
	const [rejectReason, setRejectReason] = useState('');
	const [rejectProductId, setRejectProductId] = useState<number | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false); // prevent multiple clicks
	const [store, setStore] = useState<any[] | null>(null);
	const [dateFilter, setDateFilter] = useState<FilterDate>({
		start_date: new Date(
			new Date().getFullYear(),
			new Date().getMonth() - 1,
			1
		),
		end_date: new Date(),
	});
	useEffect(() => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'store'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		})
			.then((response) => {
				setStore(response.data.stores);
			})
			.catch(() => {
				setStore([]);
			});
	}, []);

	const formatDateToISO8601 = (date: Date) => date.toISOString().slice(0, 19);

	const requestData = (
		rowsPerPage: number,
		currentPage: number,
		store = '',
		orderBy = '',
		order = '',
		startDate?: Date,
		endDate?: Date
	) => {
		const now = new Date();
		const formattedStartDate = formatDateToISO8601(
			startDate ||
			new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
		);
		const formattedEndDate = formatDateToISO8601(endDate || now);

		setData(null);

		const params: any = {
			page: currentPage,
			per_page: rowsPerPage,
			meta_key: 'multivendorx_store_id',
			status: 'pending',
			after: formattedStartDate,
			before: formattedEndDate,
			_fields:
				'id,name,sku,price,price_html,status,images,categories,meta_data,store_name,store_slug,date_created',
		};

		//Add `store` only if not empty
		if (store) {
			params.value = store;
		}
		if (orderBy) {
			params.orderby = orderBy; // e.g. 'date', 'title', 'price'
		}
		if (order) {
			params.order = order; // 'asc' or 'desc'
		}
		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/products`, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params,
			})
			.then((response) => {
				const totalCount =
					parseInt(response.headers['x-wp-total'], 10) || 0;
				setTotalRows(totalCount);
				setPageCount(Math.ceil(totalCount / pagination.pageSize));
				setData(response.data || []);
			})
			.catch(() => setData([]));
	};

	useEffect(() => {
		const currentPage = pagination.pageIndex + 1;
		requestData(pagination.pageSize, currentPage);
	}, [pagination]);

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
				requestData(pagination.pageSize, pagination.pageIndex + 1);
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
				requestData(pagination.pageSize, pagination.pageIndex + 1);
				onUpdated?.();
			})
			.catch(console.error)
			.finally(() => setIsSubmitting(false)); // enable button again
	};

	const requestApiForData = (
		rowsPerPage: number,
		currentPage: number,
		filterData: FilterData
	) => {
		const date = filterData?.date || {
			start_date: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
			end_date: new Date(),
		};
		setDateFilter(date);
		requestData(
			rowsPerPage,
			currentPage,
			filterData?.store,
			filterData?.orderBy,
			filterData?.order,
			date?.start_date,
			date?.end_date
		);
	};

	// Columns
	const columns: ColumnDef<StoreRow>[] = [
		{
			id: 'select',
			header: ({ table }) => (
				<input
					type="checkbox"
					checked={table.getIsAllRowsSelected()}
					onChange={table.getToggleAllRowsSelectedHandler()}
				/>
			),
			cell: ({ row }) => (
				<input
					type="checkbox"
					checked={row.getIsSelected()}
					onChange={row.getToggleSelectedHandler()}
				/>
			),
		},
		{
			header: __('Product', 'multivendorx'),
			cell: ({ row }) => {
				const product = row.original;
				const image = product.images?.[0]?.src;
				const storeName = row.original.store_name || [];
				return (
					<TableCell title={product.name || ''}>
						<a
							href={`${appLocalizer.site_url}/wp-admin/post.php?post=${product.id}&action=edit`}
							target="_blank"
							rel="noreferrer"
							className="product-wrapper"
						>
							{image ? (
								<img src={image} alt={product.name} />
							) : (
								<i className="item-icon adminfont-multi-product"></i>
							)}
							<div className="details">
								<span className="title">
									{product.name || '-'}
								</span>
								{product.sku && (
									<span className="des">
										SKU: {product.sku}{' '}
									</span>
								)}
								<div className="des">By: {storeName}</div>
							</div>
						</a>
					</TableCell>
				);
			},
		},
		{
			header: __('Category', 'multivendorx'),
			cell: ({ row }) => {
				const categories = row.original.categories || [];
				const categoryNames =
					categories.map((c) => c.name).join(', ') || '-';
				return (
					<TableCell title={categoryNames}>{categoryNames}</TableCell>
				);
			},
		},
		{
			header: __('Price', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.price || ''}>
					{row.original.price_html ? (
						<span
							dangerouslySetInnerHTML={{
								__html: row.original.price_html,
							}}
						/>
					) : (
						'-'
					)}
				</TableCell>
			),
		},
		{
			id: 'date',
			accessorKey: 'date',
			enableSorting: true,
			header: __('Date Created', 'multivendorx'),
			cell: ({ row }) => {
				return <TableCell title={formatted}>{formatWcShortDate(row.original?.date_created)}</TableCell>;
			},
		},
		{
			header: __('Action', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.status || ''}>
					<span
						className="admin-btn btn-purple"
						onClick={() => {
							handleSingleAction(
								'approve_product',
								row.original.id!
							);
						}}
					>
						<i className="adminfont-check"></i> {__('Approve', 'multivendorx')}
					</span>

					<span
						className="admin-btn btn-red"
						onClick={() =>
							handleSingleAction(
								'reject_product',
								row.original.id!
							)
						}
					>
						<i className="adminfont-close"></i>{__('Reject', 'multivendorx')}
					</span>
				</TableCell>
			),
		},
	];

	const realtimeFilter: RealtimeFilter[] = [
		{
			name: 'store',
			render: (
				updateFilter: (key: string, value: string) => void,
				filterValue: string | undefined
			) => (
				<div className="   group-field">
					<select
						name="store"
						onChange={(e) =>
							updateFilter(e.target.name, e.target.value)
						}
						value={filterValue || ''}
						className="basic-select"
					>
						<option value="">All Store</option>
						{store?.map((s: any) => (
							<option key={s.id} value={s.id}>
								{s.store_name.charAt(0).toUpperCase() +
									s.store_name.slice(1)}
							</option>
						))}
					</select>
				</div>
			),
		},
		{
			name: 'date',
			render: (updateFilter) => (
				<div className="right">
					<MultiCalendarInput
						value={{
							startDate: dateFilter.start_date!,
							endDate: dateFilter.end_date!,
						}}
						onChange={(range: DateRange) => {
							const next = {
								start_date: range.startDate,
								end_date: range.endDate,
							};

							setDateFilter(next);
							updateFilter('date', next);
						}}
					/>
				</div>
			),
		},
	];

	return (
		<>
			<Table
				data={data}
				columns={columns as ColumnDef<Record<string, any>, any>[]}
				rowSelection={rowSelection}
				onRowSelectionChange={setRowSelection}
				defaultRowsPerPage={10}
				pageCount={pageCount}
				pagination={pagination}
				onPaginationChange={setPagination}
				handlePagination={requestApiForData}
				perPageOption={[10, 25, 50]}
				totalCounts={totalRows}
				realtimeFilter={realtimeFilter}
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
