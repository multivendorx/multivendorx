import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	AdminButton,
	Column,
	CommonPopup,
	Container,
	FormGroup,
	FormGroupWrapper,
	getApiLink,
	MultiCalendarInput,
	Table,
	TableCell,
	TextArea,
} from 'zyra';
import {
	ColumnDef,
	RowSelectionState,
	PaginationState,
} from '@tanstack/react-table';
import { formatCurrency, formatWcShortDate, truncateText } from '../../services/commonFunction';

interface StoreRow {
	id: number;
	store_name: string;
	store_id?: string;
	amount: string;
	commission_amount: string;
	date: string;
	status: string;
	currency_symbol: string;
	reason?: string;
	refund_images?: string[];
	refund_products?: number[];
	addi_info?: string;
}

export interface RealtimeFilter {
	name: string;
	render: (
		updateFilter: (key: string, value: any) => void,
		filterValue: any
	) => React.ReactNode;
}

type FilterData = {
	searchAction?: string;
	searchField?: string;
	store_id?: string;
	orderBy?: any;
	order?: any;
	date?: any;
};

interface Props {
	onUpdated?: () => void;
}

const PendingRefund: React.FC<Props> = ({ onUpdated }) => {
	const [data, setData] = useState<StoreRow[]>([]);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [totalRows, setTotalRows] = useState<number>(0);
	const [pageCount, setPageCount] = useState<number>(0);
	const [store, setStore] = useState<any[]>([]);
	const [popupOpen, setPopupOpen] = useState(false);
	const [formData, setFormData] = useState({ content: '' });
	const [viewOrder, setViewOrder] = useState<StoreRow | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [dateFilter, setDateFilter] = useState<FilterDate>({
		start_date: new Date(
			new Date().getFullYear(),
			new Date().getMonth() - 1,
			1
		),
		end_date: new Date(),
	});
	/**
	 * Fetch store list on mount
	 */
	useEffect(() => {
		// Fetch store list
		axios
			.get(getApiLink(appLocalizer, 'store'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((response) => setStore(response.data.stores || []))
			.catch(() => {
				setStore([]);
			});

		// Fetch total orders count
		axios({
			method: 'GET',
			url: `${appLocalizer.apiUrl}/wc/v3/orders`,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				meta_key: 'multivendorx_store_id',
				status: 'refund-requested',
				page: 1,
				per_page: 1,
			},
		})
			.then((response) => {
				const total = Number(response.headers['x-wp-total']) || 0;
				setTotalRows(total);
				setPageCount(Math.ceil(total / pagination.pageSize));
			})
	}, []);

	useEffect(() => {
		const currentPage = pagination.pageIndex + 1;
		const rowsPerPage = pagination.pageSize;
		requestData(rowsPerPage, currentPage);
		setPageCount(Math.ceil(totalRows / rowsPerPage));
	}, []);

	/**
	 * Fetch data from backend (WooCommerce Orders)
	 */
	const requestData = (
		rowsPerPage :number,
		currentPage :number,
		searchField = '',
		store_id = '',
		orderBy = '',
		order = '',
		startDate = new Date( new Date().getFullYear(), new Date().getMonth() - 1, 1),
		endDate = new Date()
	) => {
		setData(null);

		//Base WooCommerce query params
		const params: any = {
			page: currentPage,
			per_page: rowsPerPage,
			meta_key: 'multivendorx_store_id',
			value: store_id,
			search: searchField,
			status: 'refund-requested',
		};

		//Add Date Filtering - only if both are valid Date objects
		if (startDate && endDate) {
			// Convert to UTC ISO8601 format (WooCommerce expects this)
			params.after = startDate.toISOString();
			params.before = endDate.toISOString();
		}

		//Add Sorting
		if (orderBy) {
			params.orderby = orderBy;
			params.order = order || 'asc';
		}

		axios({
			method: 'GET',
			url: `${appLocalizer.apiUrl}/wc/v3/orders`,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params,
		})
			.then((response) => {
				const orders: StoreRow[] = response.data.map((order: any) => {
					const metaData = order.meta_data || [];

					//Extract store ID
					const storeMeta = metaData.find(
						(meta: any) => meta.key === 'multivendorx_store_id'
					);
					const store_id = storeMeta ? storeMeta.value : null;
					//Extract refund reason
					const reasonMeta = metaData.find(
						(meta: any) =>
							meta.key === appLocalizer.order_meta['customer_refund_reason']
					);

					const addiInfoMeta = metaData.find(
						(meta: any) =>
							meta.key === appLocalizer.order_meta['customer_refund_addi_info']
					);

					const imageMeta = metaData.find(
						(meta: any) =>
							meta.key === appLocalizer.order_meta['customer_refund_product_imgs']
					);

					const productMeta = metaData.find(
						(meta: any) =>
							meta.key === appLocalizer.order_meta['customer_refund_product']
					);

					return {
						id: order.id,
						store_id,
						store_name: order.store_name || '-',
						amount: formatCurrency(order.total),
						commission_amount: order.commission_amount
							? formatCurrency(order.commission_amount)
							: '-',
						date: new Date(order.date_created).toLocaleDateString(),
						status: order.status,
						currency_symbol: order.currency_symbol,

						reason: reasonMeta?.value || '',
						addi_info: addiInfoMeta?.value || '',
						refund_images: imageMeta?.value || [],
						refund_products: productMeta?.value || [],
					};

				});

				setData(orders);
			})
			.catch((error) => {
				setData([]);
			});
	};

	/**
	 * Handle pagination & filter
	 */
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
			filterData?.searchField,
			filterData?.store_id,
			filterData?.orderBy,
			filterData?.order,
			date?.start_date,
			date?.end_date
		);
	};

	/**
	 * Realtime Filters
	 */
	const realtimeFilter: RealtimeFilter[] = [
		{
			name: 'store_id',
			render: (updateFilter, filterValue) => (
				<div className="group-field">
					<select
						name="store_id"
						onChange={(e) =>
							updateFilter(e.target.name, e.target.value)
						}
						value={filterValue || ''}
						className="basic-select"
					>
						<option value="">
							{__('All Stores', 'multivendorx')}
						</option>
						{store.map((s: any) => (
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

	const searchFilter: RealtimeFilter[] = [
		{
			name: 'searchField',
			render: (updateFilter, filterValue) => (
				<div className="search-section">
					<input
						name="searchField"
						type="text"
						placeholder={__('Search', 'multivendorx')}
						onChange={(e) =>
							updateFilter(e.target.name, e.target.value)
						}
						value={filterValue || ''}
						className="basic-select"
					/>
					<i className="adminfont-search"></i>
				</div>
			),
		},
	];

	const handleCloseForm = () => {
		setPopupOpen(false);
		setViewOrder(null);
		setFormData({ content: '' });
	};

	const handleChange = (e: any) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async () => {
		if (!viewOrder?.id || isSubmitting) {
			return;
		}

		setIsSubmitting(true);

		try {
			const orderId = viewOrder.id;
			//Add order note
			await axios({
				method: 'POST',
				url: `${appLocalizer.apiUrl}/wc/v3/orders/${orderId}/notes`,
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				data: {
					note: formData.content,
					customer_note: false,
				},
			});

			//Update order status + meta
			await axios({
				method: 'PUT',
				url: `${appLocalizer.apiUrl}/wc/v3/orders/${orderId}`,
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				data: {
					status: 'processing',
					meta_data: [
						{
							key: '_customer_refund_order',
							value: 'refund_rejected',
						},
					],
				},
			});

			handleCloseForm();
			requestData(pagination.pageSize, pagination.pageIndex + 1);
			onUpdated?.();
		} catch (err) {
			console.log(err)
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleViewDetails = (row: StoreRow) => {
		setViewOrder(row);
		setPopupOpen(true);
	};

	/**
	 * Table Columns
	 */
	const columns: ColumnDef<StoreRow>[] = [
		{
			header: __('Order', 'multivendorx'),
			cell: ({ row }) => {
				const id = row.original.id;
				const url = `${appLocalizer.site_url.replace(
					/\/$/,
					''
				)}/wp-admin/post.php?post=${id}&action=edit`;
				return (
					<TableCell title={''}>
						<a href={url} target="_blank" rel="noopener noreferrer">
							#{id}
						</a>
					</TableCell>
				);
			},
		},
		{
			header: __('Store', 'multivendorx'),
			cell: ({ row }) => {
				const { store_id, store_name } = row.original;
				const baseUrl = `${window.location.origin}/wp-admin/admin.php?page=multivendorx#&tab=stores`;
				const storeLink = store_id
					? `${baseUrl}&edit/${store_id}/&subtab=store-overview`
					: '#';

				return (
					<TableCell title={store_name || ''}>
						{store_id ? (
							<a
								href={storeLink}
								target="_blank"
								rel="noopener noreferrer"
								className="text-purple-600 hover:underline"
							>
								{store_name || '-'}
							</a>
						) : (
							store_name || '-'
						)}
					</TableCell>
				);
			},
		},
		{
			header: __('Amount', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={'amount'}>{row.original.amount}</TableCell>
			),
		},
		{
			header: __('Commission', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={'commission'}>
					{row.original.commission_amount}
				</TableCell>
			),
		},
		{
			header: __('Refund Reason', 'multivendorx'),
			cell: ({ row }: any) => (
				<TableCell title={row.original.reason || ''}>
					{truncateText(row.original.reason, 30)}
				</TableCell>
			),
		},
		{
			id: 'date',
			accessorKey: 'date',
			enableSorting: true,
			header: __('Date', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={'title'}>{formatWcShortDate(row.original.date)}</TableCell>
			),
		},
		{
			header: __('Action', 'multivendorx'),
			cell: ({ row }) => {
				const orderId = row.original.id;
				const orderUrl = `${appLocalizer.site_url.replace(
					/\/$/,
					''
				)}/wp-admin/post.php?post=${orderId}&action=edit`;

				return (
					<TableCell
						title={'action'}
						type="action-dropdown"
						rowData={row.original}
						header={{
							actions: [
								{
									label: __('View Details', 'multivendorx'),
									icon: 'adminfont-preview',
									onClick: () => handleViewDetails(row.original),
									hover: true,
								},
								{
									label: __('Reject', 'multivendorx'),
									icon: 'adminfont-close',
									onClick: () => {
										setViewOrder(row.original);
										handleSubmit();
									},
									hover: true,
								},
							],
						}}
					/>
				);
			},
		},
	];

	return (
		<>
			<Container general>
				<Column>
					<Table
						data={data}
						columns={columns as ColumnDef<Record<string, any>, any>[]}
						rowSelection={rowSelection}
						onRowSelectionChange={setRowSelection}
						defaultRowsPerPage={pagination.pageSize}
						pageCount={pageCount}
						pagination={pagination}
						onPaginationChange={setPagination}
						handlePagination={requestApiForData}
						perPageOption={[10, 25, 50]}
						realtimeFilter={realtimeFilter}
						searchFilter={searchFilter}
						totalCounts={totalRows}
					/>
					<CommonPopup
						open={popupOpen}
						onClose={handleCloseForm}
						width="40rem"
						height="80%"
						header={{
							icon: 'announcement',
							title: __('Refund Request Details', 'multivendorx'),
							description: __('Review refund details before taking action.', 'multivendorx'),
							onClose: handleCloseForm,
						}}

						footer={
							<AdminButton
								buttons={[
									{
										icon: 'external-link',
										text: __('View order to release funds', 'multivendorx'),
										className: 'yellow-bg',
										onClick: () => {
											if (!viewOrder) return;
											window.open(
												`${appLocalizer.site_url.replace(/\/$/, '')}/wp-admin/post.php?post=${viewOrder.id}&action=edit`,
												'_blank'
											);
										},
									},
									{
										icon: 'save',
										text: __('Reject', 'multivendorx'),
										className: 'purple-bg',
										onClick: handleSubmit,
										disabled: isSubmitting,
									},
								]}
							/>
						}
					>
						<>
							<FormGroupWrapper>
								<FormGroup label={__('Refund Reason', 'multivendorx')}>
									<div className="refund-reason-box">
										{viewOrder?.reason || '-'}
									</div>
								</FormGroup>
								<FormGroup label={__('Additional Information', 'multivendorx')}>
									<div className="refund-additional-info">
										{viewOrder?.addi_info || '-'}
									</div>
								</FormGroup>
								{viewOrder?.refund_images?.length > 0 && (
									<FormGroup label={viewOrder.refund_images.length === 1 ? 'Attachment' : 'Attachments'}>
										<div className="refund-attachment-list">
											{viewOrder.refund_images.map((img, index) => (
												<a
													key={index}
													href={img}
													target="_blank"
													rel="noopener noreferrer"
													className="refund-attachment-item"
												>
													<div className="attachment-thumb">
														<img src={img} alt={__('Refund attachment', 'multivendorx')} />
													</div>
													<div className="attachment-name">
														{__('Attachment', 'multivendorx')} {index + 1}
													</div>
												</a>
											))}
										</div>
									</FormGroup>
								)}
								<FormGroup label={__('Reject Message', 'multivendorx')} htmlFor="content">
									<TextArea
										name="content"
										value={formData.content}
										onChange={handleChange}
										usePlainText={false}
										tinymceApiKey={
											appLocalizer.settings_databases_value[
											'marketplace'
											]['tinymce_api_section'] ?? ''
										}
									/>
								</FormGroup>
							</FormGroupWrapper>
						</>
					</CommonPopup>
				</Column>
			</Container>
		</>
	);
};

export default PendingRefund;
