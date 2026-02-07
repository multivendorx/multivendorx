import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import { MultiCalendarInput, Table, TableCell, useModules } from 'zyra';
import {
	ColumnDef,
	RowSelectionState,
	PaginationState,
} from '@tanstack/react-table';
import OrderDetails from './order-details';
import AddOrder from './addOrder';
import { formatCurrency, formatTimeAgo, formatWcShortDate, toWcIsoDate } from '../services/commonFunction';
import { QueryProps, TableRow } from '@/services/type';

// Type declarations
type OrderStatus = {
	key: string;
	name: string;
	count: number;
};
type FilterData = {
	searchAction?: string;
	searchField?: string;
	category?: any;
	categoryFilter?: any;
	stock_status?: string;
	productType?: string;
};
export interface RealtimeFilter {
	name: string;
	render: (
		updateFilter: (key: string, value: any) => void,
		filterValue: any
	) => React.ReactNode;
}

const Orders: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [totalRows, setTotalRows] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const { modules } = useModules();
	const location = useLocation();
	const [data, setData] = useState<any[]>([]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
	const [pageCount, setPageCount] = useState(0);
	const [orderStatus, setOrderStatus] = useState<OrderStatus[]>([]);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [dateFilter, setDateFilter] = useState<{
		start_date: Date;
		end_date: Date;
	}>({
		start_date: new Date(
			new Date().getFullYear(),
			new Date().getMonth() - 1,
			1
		),
		end_date: new Date(),
	});
	const bulkSelectRef = React.useRef<HTMLSelectElement>(null);
	const hash = location.hash.replace(/^#/, '') || '';

	const isViewOrder = hash.includes('view');
	const isAddOrder = hash.includes('add');

	const fetchOrderById = async (orderId: string | number) => {
		try {
			const res = await axios.get(
				`${appLocalizer.apiUrl}/wc/v3/orders/${orderId}`,
				{
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					params: {
						meta_key: 'multivendorx_store_id',
						value: appLocalizer.store_id,
					}
				}
			);

			const order = res.data;

			setSelectedOrder(order);

		} catch (error) {
			setSelectedOrder(null);
		}
	};

	useEffect(() => {
		if (!isViewOrder) {
			setSelectedOrder(null);
			return;
		}

		const orderId = hash.split('view/')[1];
		if (!orderId) return;

		const foundOrder = data?.find(
			(o) => o.id.toString() === orderId.toString()
		);

		if (foundOrder) {
			setSelectedOrder(foundOrder);
		} else {
			fetchOrderById(orderId);
		}
	}, [hash, data]);


	const selectedOrderIds = Object.keys(rowSelection)
		.map((key) => {
			const index = Number(key);
			return data && data[index] ? data[index].id : null;
		})
		.filter((id): id is number => id !== null);

	const BulkAction: React.FC = () => {
		const handleBulkActionChange = async (action: string) => {
			if (!action || selectedOrderIds.length === 0) {
				return;
			}
			// Change order status
			try {
				await Promise.all(
					selectedOrderIds.map((orderId) =>
						axios.put(
							`${appLocalizer.apiUrl}/wc/v3/orders/${orderId}`,
							{ status: action },
							{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
						)
					)
				);

				setRowSelection({});
				fetchOrderStatusCounts();
				requestData(pagination.pageSize, pagination.pageIndex + 1);
			} catch (err) {
				console.error(err);
			} finally {
				if (bulkSelectRef.current) {
					bulkSelectRef.current.value = '';
				}
			}
		};

		const downloadSelectedCSV = () => {
			if (selectedOrderIds.length === 0) {
				alert('No orders selected for export');
				return;
			}

			const selectedOrders = data.filter((order) =>
				selectedOrderIds.includes(order.id)
			);

			const csvRows: string[] = [];
			csvRows.push('Order ID,Customer,Email,Total,Status,Date');

			selectedOrders.forEach((order) => {
				const customer = order.billing?.first_name
					? `${order.billing.first_name} ${order.billing.last_name || ''
					}`
					: 'Guest';
				const email = order.billing?.email || '';
				const total = order.total || '';
				const status = order.status || '';
				const date = order.date_created || '';

				csvRows.push(
					`"${order.id}","${customer}","${email}","${total}","${status}","${date}"`
				);
			});

			const csvString = csvRows.join('\n');
			const blob = new Blob([csvString], {
				type: 'text/csv;charset=utf-8;',
			});
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = `selected_orders_${appLocalizer.store_id
				}_${new Date().toISOString()}.csv`;
			link.click();
			URL.revokeObjectURL(link.href);
		};

		return (
			<>
				<div className="action-item">
					<i className="adminfont-form"></i>
					<select
						name="action"
						ref={bulkSelectRef}
						onChange={(e) => handleBulkActionChange(e.target.value)}
					>
						<option value="">
							{__('Bulk Actions', 'multivendorx')}
						</option>
						<option value="completed">
							{__('Completed', 'multivendorx')}
						</option>
						<option value="processing">
							{__('Processing', 'multivendorx')}
						</option>
						<option value="pending">
							{__('Pending', 'multivendorx')}
						</option>
						<option value="on-hold">
							{__('On Hold', 'multivendorx')}
						</option>
						<option value="cancelled">
							{__('Cancelled', 'multivendorx')}
						</option>
						<option value="refunded">
							{__('Refunded', 'multivendorx')}
						</option>
						<option value="failed">
							{__('Failed', 'multivendorx')}
						</option>
					</select>
				</div>
				<div className="action-item">
					<button
						type="button"
						className="admin-btn"
						onClick={downloadSelectedCSV}
					>
						<i className="adminfont-download"></i>
						{__('Download CSV', 'multivendorx')}
					</button>
				</div>
			</>
		);
	};

	const exportAllOrders = async () => {
		try {
			let allOrders: any[] = [];
			let page = 1;
			const perPage = 100; // WooCommerce API max per page

			// Fetch all pages
			while (true) {
				const res = await axios.get(
					`${appLocalizer.apiUrl}/wc/v3/orders`,
					{
						headers: { 'X-WP-Nonce': appLocalizer.nonce },
						params: {
							per_page: perPage,
							page,
							meta_key: 'multivendorx_store_id',
							value: appLocalizer.store_id,
						},
					}
				);

				allOrders = allOrders.concat(res.data);

				const totalPages = parseInt(
					res.headers['x-wp-totalpages'] || '1'
				);
				if (page >= totalPages) {
					break;
				}
				page++;
			}

			if (allOrders.length === 0) {
				alert('No orders found to export');
				return;
			}

			// Convert orders to CSV
			const csvRows: string[] = [];
			csvRows.push('Order ID,Customer,Email,Total,Status,Date'); // Header

			allOrders.forEach((order) => {
				const customer = order.billing?.first_name
					? `${order.billing.first_name} ${order.billing.last_name || ''
					}`
					: 'Guest';
				const email = order.billing?.email || '';
				const total = order.total || '';
				const status = order.status || '';
				const date = order.date_created || '';

				csvRows.push(
					[order.id, customer, email, total, status, date]
						.map((field) => `"${field}"`)
						.join(',')
				);
			});

			const csvString = csvRows.join('\n');

			// Trigger download
			const blob = new Blob([csvString], {
				type: 'text/csv;charset=utf-8;',
			});
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = `orders_${appLocalizer.store_id
				}_${new Date().toISOString()}.csv`;
			link.click();
			URL.revokeObjectURL(link.href);
		} catch (err) {
			console.error('Failed to export all orders:', err);
			alert('Failed to export orders, check console for details');
		}
	};

	const fetchOrderStatusCounts = async () => {
		try {
			const statuses = [
				'all',
				'pending',
				'processing',
				'on-hold',
				'completed',
				'cancelled',
				'refunded',
				'failed',
				'trash',
			];

			if (modules.includes('marketplace-refund')) {
				statuses.push('refund-requested');
			}

			const counts: OrderStatus[] = await Promise.all(
				statuses.map(async (status) => {
					const params: any = {
						per_page: 1,
						meta_key: 'multivendorx_store_id',
						value: appLocalizer.store_id,
					};
					if (status !== 'all') {
						params.status = status;
					}

					const res = await axios.get(
						`${appLocalizer.apiUrl}/wc/v3/orders`,
						{
							headers: { 'X-WP-Nonce': appLocalizer.nonce },
							params,
						}
					);

					const total = parseInt(res.headers['x-wp-total'] || '0');

					return {
						key: status,
						name:
							status === 'all'
								? __('All', 'multivendorx')
								: status.charAt(0).toUpperCase() +
								status.slice(1),
						count: total,
					};
				})
			);

			// Filter out zero-count statuses except "all"
			const filteredCounts = counts.filter(
				(status) => status.count > 0
			);
			setOrderStatus(filteredCounts);
		} catch (error) {
			console.error('Failed to fetch order status counts:', error);
		}
	};

	// Fetch dynamic order status counts for typeCounts filter
	useEffect(() => {
		fetchOrderStatusCounts();
	}, []);

	function requestData(
		rowsPerPage = 10,
		currentPage = 1,
		startDate = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
		endDate = new Date(),
		extraParams: any = {}
	) {
		setData(null);

		const params: any = {
			page: currentPage,
			row: rowsPerPage,
			after: startDate.toISOString(),
			before: endDate.toISOString(),
			meta_key: 'multivendorx_store_id',
			value: appLocalizer.store_id,
			...extraParams,
		};

		axios({
			method: 'GET',
			url: `${appLocalizer.apiUrl}/wc/v3/orders`,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params,
		})
			.then((response) => {
				setData(response.data);
				const total = parseInt(response.headers['x-wp-total'] || '0');
				setTotalRows(total);
				setPageCount(Math.ceil(total / rowsPerPage));
			})
			.catch(() => {
				setData([]);
				setTotalRows(0);
				setPageCount(0);
			});
	}

	// Handle pagination and filter changes
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

		const params: any = {
			page: currentPage,
			row: rowsPerPage,
			after: date.start_date.toISOString(),
			before: date.end_date.toISOString(),
			meta_key: 'multivendorx_store_id',
			value: appLocalizer.store_id,
		};

		// Search field
		if (filterData.searchField) {
			const searchValue = filterData.searchField.trim();
			if (filterData.searchAction) {
				params.search = searchValue;
			} else {
				params.search = searchValue;
			}
		}

		// Add categoryFilter filter
		if (filterData.categoryFilter && filterData.categoryFilter !== 'all') {
			params.status = filterData.categoryFilter;
		}
		requestData(rowsPerPage, currentPage, date.start_dat, date.end_date, params);
	};

	// Fetch orders
	useEffect(() => {
		const currentPage = pagination.pageIndex + 1;
		const rowsPerPage = pagination.pageSize;

		if (hash === 'refund-requested') {
			// call API with refund-requested filter
			requestApiForData(rowsPerPage, currentPage, {
				categoryFilter: 'refund-requested',
			});
		} else {
			// normal API call
			requestData(rowsPerPage, currentPage);
		}
	}, [pagination]);

	const columns: ColumnDef<any>[] = [
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
			id: 'number',
			accessorKey: 'number',
			accessorFn: (row) => parseFloat(row.number || '0'),
			enableSorting: true,
			header: __('Order ID', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell>
					<span
						className="link"
						onClick={() => {
							// Open order in view mode (same as View action)
							setSelectedOrder(row.original);
							window.location.hash = `view/${row.original.id}`;
						}}
					>
						#{row.original.number}
					</span>
				</TableCell>
			),
		},
		{
			header: __('Customer', 'multivendorx'),
			cell: ({ row }) => {
				const { billing } = row.original;
				const name =
					billing?.first_name || billing?.last_name
						? `${billing.first_name || ''} ${billing.last_name || ''
						}`
						: billing?.email || __('Guest', 'multivendorx');
				return <TableCell>{name}</TableCell>;
			},
		},
		{
			id: 'date_created',
			accessorKey: 'date_created',
			enableSorting: true,
			header: __('Date', 'multivendorx'),
			cell: ({ row }) => {
				return <TableCell>{formatTimeAgo(row.original.date_created)}</TableCell>;
			},
		},
		{
			header: __('Status', 'multivendorx'),
			cell: ({ row }) => {
				return <TableCell type="status" status={row.original.status} />;
			},
		},
		{
			header: __('Total Earning', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell>{formatCurrency(row.original.commission_total)}</TableCell>
			),
		},
		{
			id: 'total',
			accessorKey: 'total',
			accessorFn: (row) => parseFloat(row.total || '0'),
			enableSorting: true,
			header: __('Total', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell>{formatCurrency(row.original.total)}</TableCell>
			),
		},
		{
			header: __('Action', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell
					type="action-dropdown"
					rowData={row.original}
					header={{
						actions: [
							// Conditionally include the "View" button
							...(appLocalizer.edit_order_capability
								? [
									{
										label: __('View', 'multivendorx'),
										icon: 'adminfont-eye',
										onClick: (rowData) => {
											setSelectedOrder(rowData);
											window.location.hash = `view/${rowData.id}`;
										},
										hover: true,
									},
								]
								: []),
							{
								label: __('Download', 'multivendorx'),
								icon: 'adminfont-download',
								onClick: (rowData) => {
									window.location.href = `?page=multivendorx#&tab=stores&edit/${rowData.id}`;
								},
							},
							{
								label: __('Copy URL', 'multivendorx'),
								icon: 'adminfont-vendor-form-copy',
								onClick: (rowData) => {
									navigator.clipboard.writeText(
										window.location.href
									);
								},
							},
							{
								label: __('Shipping', 'multivendorx'),
								icon: 'adminfont-shipping',
								onClick: (rowData) => {
									window.location.href = `?page=multivendorx#&tab=stores&edit/${rowData.id}`;
								},
							},
							{
								label: __('PDF', 'multivendorx'),
								icon: 'adminfont-pdf',
								onClick: (rowData) => {
									window.location.href = `?page=multivendorx#&tab=stores&edit/${rowData.id}`;
								},
								hover: true,
							},
						],
					}}
				/>
			),
		},
	];

	const headers = [
		{
			key: 'id',
			label: __('Order ID', 'multivendorx'),
		},
		{
			key: 'customer',
			label: __('Customer', 'multivendorx'),
		},
		{
			key: 'date_created',
			label: __('Date', 'multivendorx'),
			isSortable: true,
		},
		{
			key: 'status',
			label: __('Status', 'multivendorx'),
		},
		{
			key: 'commission_total',
			label: __('Total Earning', 'multivendorx'),
		},
		{
			key: 'total',
			label: __('Total', 'multivendorx'),
		},
	];
	const filters = [
		{
			key: 'created_at',
			label: 'Created Date',
			type: 'date',
		},
	];
	const buttonActions = [
		{
			label: 'Download CSV',
			icon: 'download',
			onClickWithQuery: (query: QueryProps) => {
				downloadOrdersCSV(query);
			},
		},
	];
	const downloadOrdersCSV = (query: QueryProps) => {
		setIsLoading(true);

		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/orders`, {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
				params: {
					per_page: 100,
					page: 1,
					search: query.searchValue,
					orderby: query.orderby || 'date',
					order: query.order || 'desc',
					meta_key: 'multivendorx_store_id',
					value: appLocalizer.store_id,
					after: query.filter?.created_at?.startDate
						? toWcIsoDate(query.filter.created_at.startDate, 'start')
						: undefined,
					before: query.filter?.created_at?.endDate
						? toWcIsoDate(query.filter.created_at.endDate, 'end')
						: undefined,
				},
			})
			.then((response) => {
				const orders = Array.isArray(response.data)
					? response.data
					: [];

				const csvData = orders.map((order: any) => ({
					Order_ID: order.id,
					Store: order.store_name || '',
					Amount: order.total,
					Commission: order.commission_total || 0,
					Status: order.status,
					Date: formatWcShortDate(order.date_created),
				}));

				downloadCSV({
					data: csvData,
					filename: 'orders-report.csv',
					headers: {
						Order_ID: 'Order ID',
						Store: 'Store',
						Amount: 'Amount',
						Commission: 'Commission',
						Status: 'Status',
						Date: 'Date',
					},
				});

				setIsLoading(false);
			})
			.catch((error) => {
				console.error('CSV download failed:', error);
				setIsLoading(false);
			});
	};

	const fetchData = (query: QueryProps) => {
		setIsLoading(true);

		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/orders`, {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
				params: {
					page: query.page,
					per_page: query.per_page,
					search: query.searchValue,
					orderby: query.orderby || 'date',
					order: query.order || 'desc',
					meta_key: 'multivendorx_store_id',
					value: appLocalizer.store_id,
					after: query.filter?.created_at?.startDate
						? toWcIsoDate(query.filter.created_at.startDate, 'start')
						: undefined,
					before: query.filter?.created_at?.endDate
						? toWcIsoDate(query.filter.created_at.endDate, 'end')
						: undefined,
				},
			})
			.then((response) => {
				const orders = Array.isArray(response.data)
					? response.data
					: [];

				setRowIds(orders.map((o: any) => o.id));

				const mappedRows: TableRow[][] = orders.map((order: any) => [
					{
						display: {< span
							className="link"
							onClick={() => {
	// Open order in view mode (same as View action)
	setSelectedOrder(order);
	window.location.hash = `view/${order.id}`;
}}
						>
							#{ order.number }
						</span >},
value: order.id,
					},
{
	display: { order.billing?.first_name || order.billing?.last_name ? `${order.billing.first_name || ''} ${order.billing.last_name || ''}` : order.billing?.email || __('Guest', 'multivendorx') },
	value: order.id || '',
					},
{
	display: formatWcShortDate(order.date_created),
		value: order.date_created,
					},
{
	display: order.status,
		value: order.status,
					},
{
	display: formatCurrency(order.commission_total || 0),
		value: order.commission_total || 0,
					},
{
	display: formatCurrency(order.total),
		value: order.total,
					},

				]);

setRows(mappedRows);
setTotalRows(Number(response.headers['x-wp-total']) || 0);
setIsLoading(false);
			})
			.catch ((error) => {
	console.error('Order fetch failed:', error);
	setRows([]);
	setTotalRows(0);
	setIsLoading(false);
});
	};


return (
	<>
		{!isViewOrder && !isAddOrder && !selectedOrder && (
			<>
				<div className="page-title-wrapper">
					<div className="page-title">
						<div className="title">
							{__('Orders', 'multivendorx')}
						</div>
						<div className="des">
							{__(
								'Manage your store information and preferences',
								'multivendorx'
							)}
						</div>
					</div>
					<div className="buttons-wrapper">
						<div
							className="admin-btn btn-purple-bg"
							onClick={exportAllOrders}
						>
							<i className="adminfont-export"></i>
							{__('Export', 'multivendorx')}
						</div>
						<div
							className="admin-btn btn-purple-bg"
							onClick={() => {
								window.location.hash = `add`;
							}}
						>
							<i className="adminfont-plus"></i>
							{__('Add New', 'multivendorx')}
						</div>
					</div>
				</div>

				<TableCard
					headers={headers}
					rows={rows}
					totalRows={totalRows}
					isLoading={isLoading}
					onQueryUpdate={fetchData}
					search={{
						placeholder: 'Search...',
						options: [
							{ label: 'All', value: 'all' },
							{ label: 'Order Id', value: 'order_id' },
							{ label: 'Products', value: 'products' },
							{ label: 'Customer Email', value: 'customer_email' },
							{ label: 'Customer', value: 'customer' },
						],
					}}
					filters={filters}
					buttonActions={buttonActions}
					ids={rowIds}
					categoryCounts={categoryCounts}
					bulkActions={[]}
				/>

			</>
		)}

		{isAddOrder && <AddOrder />}
		{isViewOrder && (
			<OrderDetails
				order={selectedOrder}
				onBack={() => {
					setSelectedOrder(null);
					window.location.hash = '';
				}}
			/>
		)}
	</>
);
};

export default Orders;
