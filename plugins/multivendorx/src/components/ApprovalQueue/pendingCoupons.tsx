/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	getApiLink,
	Table,
	TableCell,
	CommonPopup,
	TextArea,
	MultiCalendarInput,
	AdminButton,
} from 'zyra';
import {
	ColumnDef,
	RowSelectionState,
	PaginationState,
} from '@tanstack/react-table';

type CouponRow = {
	store_name: string;
	id?: number;
	code?: string;
	amount?: string;
	discount_type?: string;
	status?: string;
	date_created?: string;
	meta_data?: Array<{ key: string; value: any }>;
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

const PendingCoupons: React.FC<{ onUpdated?: () => void }> = ({
	onUpdated,
}) => {
	const [data, setData] = useState<CouponRow[] | null>(null);
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
	const [rejectCouponId, setRejectCouponId] = useState<number | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [store, setStore] = useState<any[] | null>(null);

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

	useEffect(() => {
		const currentPage = pagination.pageIndex + 1;
		requestData(pagination.pageSize, currentPage);
	}, [pagination]);

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
				requestData(pagination.pageSize, pagination.pageIndex + 1);
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
				requestData(pagination.pageSize, pagination.pageIndex + 1);
				onUpdated?.();
			})
			.catch(console.error)
			.finally(() => setIsSubmitting(false));
	};

	const formatDateToISO8601 = (date: Date) => date.toISOString().slice(0, 19);

	const requestData = (
		rowsPerPage = 10,
		currentPage = 1,
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
			.get(`${appLocalizer.apiUrl}/wc/v3/coupons`, {
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

	const requestApiForData = (
		rowsPerPage: number,
		currentPage: number,
		filterData: FilterData
	) => {
		setData(null);
		requestData(
			rowsPerPage,
			currentPage,
			filterData?.store,
			filterData?.orderBy,
			filterData?.order,
			filterData?.date?.start_date,
			filterData?.date?.end_date
		);
	};

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
			render: (updateFilter, filterValue) => (
				<div className="right">
					<MultiCalendarInput
						onChange={(range: any) =>
							updateFilter('date', {
								start_date: range.startDate,
								end_date: range.endDate,
							})
						}
						value={filterValue}
					/>
				</div>
			),
		},
	];

	const columns: ColumnDef<CouponRow>[] = [
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
			header: __('Code', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original?.code ?? '-'}>
					<div className="product-wrapper">
						<div className="details">
							<span className="title">
								{row.original?.id ? (
									<a
										href={`${appLocalizer.site_url}/wp-admin/post.php?post=${row.original.id}&action=edit`}
										target="_blank"
										rel="noreferrer"
									>
										{row.original.code}
									</a>
								) : (
									(row.original?.code ?? '-')
								)}
							</span>
							<div className="des">
								By {row.original.store_name ?? '-'}
							</div>
						</div>
					</div>
				</TableCell>
			),
		},
		{
			header: __('Discount Type', 'multivendorx'),
			cell: ({ row }) => {
				const type = row.original?.discount_type;
				const formattedType =
					type === 'percent'
						? __('Percentage discount', 'multivendorx')
						: type === 'fixed_cart'
							? __('Fixed cart discount', 'multivendorx')
							: type === 'fixed_product'
								? __('Fixed product discount', 'multivendorx')
								: '-';

				return (
					<TableCell title={formattedType}>
						{row.original?.amount ?? '-'} {formattedType}
					</TableCell>
				);
			},
		},
		{
			id: 'date',
			accessorKey: 'date',
			enableSorting: true,
			header: __('Date created', 'multivendorx'),
			cell: ({ row }) => {
				const rawDate = row.original.date_created;
				const formattedDate = rawDate
					? new Intl.DateTimeFormat('en-US', {
						month: 'short',
						day: 'numeric',
						year: 'numeric',
					}).format(new Date(rawDate))
					: '-';
				return (
					<TableCell title={formattedDate}>{formattedDate}</TableCell>
				);
			},
		},
		{
			header: __('Action', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell>
					<span
						className="admin-btn btn-purple"
						onClick={() =>
							handleSingleAction(
								'approve_coupon',
								row.original.id
							)
						}
					>
						<i className="adminfont-check"></i>
						{__('Approve', 'multivendorx')}
					</span>

					<span
						className="admin-btn btn-red"
						onClick={() =>
							handleSingleAction(
								'reject_coupon',
								row.original.id
							)
						}
					>
						<i className="adminfont-close"></i>
						{__('Reject', 'multivendorx')}
					</span>
				</TableCell>
			),
		}

	];

	return (
		<>
			<div className="admin-table-wrapper">
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
					typeCounts={[]}
					totalCounts={totalRows}
					realtimeFilter={realtimeFilter}
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
