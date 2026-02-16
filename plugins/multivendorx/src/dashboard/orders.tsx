import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import { TableCard, useModules } from 'zyra';
import OrderDetails from './order-details';
import AddOrder from './addOrder';
import { downloadCSV, formatCurrency, toWcIsoDate } from '../services/commonFunction';
import { categoryCounts, QueryProps, TableRow } from '@/services/type';

const Orders: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [totalRows, setTotalRows] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [categoryCounts, setCategoryCounts] = useState<
		categoryCounts[] | null
	>(null);
	const { modules } = useModules();
	const location = useLocation();
	const [data, setData] = useState<any[]>([]);

	const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
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

			const counts = await Promise.all(
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
						value: status,
						label:
							status === 'all'
								? __('All', 'multivendorx')
								: status.charAt(0).toUpperCase() +
								status.slice(1),
						count: total,
					};
				})
			);
			setCategoryCounts(counts);
		} catch (error) {
			console.error('Failed to fetch order status counts:', error);
		}
	};

	// Fetch dynamic order status counts for typeCounts filter
	useEffect(() => {
		fetchOrderStatusCounts();
	}, []);

	// Fetch orders
	useEffect(() => {
		if (hash === 'refund-requested') {
			fetchData({ categoryFilter: 'refund-requested', });
		} else {
			fetchData({});
		}
	}, []);

	const bulkActions = [
		{ label: 'Pending Payment', value: 'pending' },
		{ label: 'Processing', value: 'processing' },
		{ label: 'On Hold', value: 'on-hold' },
		{ label: 'Completed', value: 'completed' },
		{ label: 'Cancelled', value: 'cancelled' },
		{ label: 'Refunded', value: 'refunded' },
		{ label: 'Failed', value: 'failed' },
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
					page: query.paged, // Changed from query.page to match your TableCard query state
					per_page: query.per_page,
					search: query.searchValue,
					status: query.categoryFilter || '',
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
				const orders = Array.isArray(response.data) ? response.data : [];

				setRowIds(orders.map((o: any) => o.id));

				const mappedRows: TableRow[][] = orders.map((order: any) => [
					{
						// FIXED: Removed extra curly braces/brackets around JSX
						display: (
							<span
								className="link"
								onClick={() => {
									setSelectedOrder(order);
									window.location.hash = `view/${order.id}`;
								}}
							>
								#{order.number}
							</span>
						),
						value: order.id,
					},
					{
						// FIXED: billing logic and string formatting
						display: (order.billing?.first_name || order.billing?.last_name)
							? `${order.billing.first_name || ''} ${order.billing.last_name || ''}`.trim()
							: (order.billing?.email || __('Guest', 'multivendorx')),
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
			.catch((error) => {
				console.error('Order fetch failed:', error);
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
			});
	};

	const handleBulkAction = async (
		action: string,
		selectedIds: number[]
	) => {
		if (!action || selectedIds.length === 0) return;

		try {
			const updatePayload = {
				update: selectedIds.map((id) => ({
					id,
					status: action,
				})),
			};

			await axios.post(
				`${appLocalizer.apiUrl}/wc/v3/orders/batch`,
				updatePayload,
				{
					headers: {
						'X-WP-Nonce': appLocalizer.nonce,
					},
				}
			);

			fetchData({});
		} catch (err) {
			console.error(err);
		}
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
						bulkActions={bulkActions}
						onBulkActionApply={(action: string, selectedIds: []) => {
							handleBulkAction(action, selectedIds)
						}}
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
