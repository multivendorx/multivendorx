import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import { PopupUI, TableCard, useModules } from 'zyra';
import OrderDetails from './orderDetails';
import AddOrder from './addOrder';
import { formatCurrency, toWcIsoDate } from '../services/commonFunction';
import { categoryCounts, QueryProps, TableRow } from '@/services/type';

const Orders: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [totalRows, setTotalRows] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [categoryCounts, setCategoryCounts] = useState<
		categoryCounts[] | null
	>(null);
	const [orderLookup, setOrderLookup] = useState<Record<number, any>>({});
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [message, setMessage] = useState('');
	const { modules } = useModules();
	const location = useLocation();

	const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
	const hash = location.hash.replace(/^#/, '') || '';

	const isViewOrder = hash.includes('view');
	const isAddOrder = hash.includes('add');

	const fetchOrderById = (orderId: string | number) => {
		axios
			.get(
				`${appLocalizer.apiUrl}/wc/v3/orders/${orderId}`,
				{
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					params: {
						meta_key: 'multivendorx_store_id',
						value: appLocalizer.store_id,
					},
				}
			)
			.then((res) => {
				const order = res.data;
				setSelectedOrder(order);
			})
			.catch(() => {
				setSelectedOrder(null);
			});
	};

	useEffect(() => {
		if (!isViewOrder) {
			setSelectedOrder(null);
			return;
		}

		const orderId = hash.split('view/')[1];
		if (!orderId) return;

		const foundOrder = orderLookup[orderId];

		if (foundOrder) {
			setSelectedOrder(foundOrder);
		} else {
			fetchOrderById(orderId);
		}
	}, [hash]);


	const exportAllOrders = () => {
		let allOrders: any[] = [];
		let page = 1;
		const perPage = 100;

		const fetchPage = () => {
			return axios
				.get(`${appLocalizer.apiUrl}/wc/v3/orders`, {
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					params: {
						per_page: perPage,
						page,
						meta_key: 'multivendorx_store_id',
						value: appLocalizer.store_id,
					},
				})
				.then((res) => {
					allOrders = allOrders.concat(res.data);

					const totalPages = parseInt(
						res.headers['x-wp-totalpages'] || '1'
					);

					if (page < totalPages) {
						page++;
						return fetchPage(); // recursively fetch next page
					}
				});
		};

		fetchPage()
			.then(() => {
				if (allOrders.length === 0) {
					setMessage('No orders found to export');
					setConfirmOpen(true);
					return;
				}

				const csvRows: string[] = [];
				csvRows.push('Order ID,Customer,Email,Total,Status,Date');

				allOrders.forEach((order) => {
					const customer = order.billing?.first_name
						? `${order.billing.first_name} ${order.billing.last_name || ''}`
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

				const blob = new Blob([csvString], {
					type: 'text/csv;charset=utf-8;',
				});
				const link = document.createElement('a');
				link.href = URL.createObjectURL(blob);
				link.download = `orders_${appLocalizer.store_id}_${new Date().toISOString()}.csv`;
				link.click();
				URL.revokeObjectURL(link.href);
			})
			.catch((err) => {
				console.error('Error exporting orders:', err);
			});
	};

	const fetchOrderStatusCounts = () => {
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

		const requests = statuses.map((status) => {
			const params: any = {
				per_page: 1,
				meta_key: 'multivendorx_store_id',
				value: appLocalizer.store_id,
			};

			if (status !== 'all') {
				params.status = status;
			}

			return axios
				.get(`${appLocalizer.apiUrl}/wc/v3/orders`, {
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					params,
				})
				.then((res) => {
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
				});
		});

		Promise.all(requests)
			.then((counts) => {
				setCategoryCounts(counts);
			})
			.catch((error) => {
				console.error('Error fetching order status counts:', error);
			});
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
		{
			key: 'action',
			type: 'action',
			label: 'Action',
			actions: [
				...(appLocalizer.edit_order_capability
					? [
						{
							label: __('View', 'multivendorx'),
							icon: 'eye',
							onClick: (id: number) => {
								setSelectedOrder(orderLookup[id]);
								window.location.hash = `view/${id}`;
							},
						},
					]
					: []),
				{
					label: __('Download', 'multivendorx'),
					icon: 'download',
					onClick: (id: number) => {
						window.location.href = `?page=multivendorx#&tab=stores&edit/${id}`;
					},
				},
				{
					label: __('Copy URL', 'multivendorx'),
					icon: 'eye',
					onClick: (id: number) => {
						navigator.clipboard.writeText(
							window.location.href
						);
					},
				},
				{
					label: __('Shipping', 'multivendorx'),
					icon: 'eye',
					onClick: (id: number) => {
						window.location.href = `?page=multivendorx#&tab=stores&edit/${id}`;
					},
				},
				{
					label: __('PDF', 'multivendorx'),
					icon: 'eye',
					onClick: (id: number) => {
						window.location.href = `?page=multivendorx#&tab=stores&edit/${id}`;
					},
				},
			],
		},
	];
	const filters = [
		{
			key: 'created_at',
			label: 'Created Date',
			type: 'date',
		},
	];
	
	const orderColumns = (order: any) => ({
		[__('Order ID', 'multivendorx')]: order.id ?? '',
		[__('Customer', 'multivendorx')]:
			order.billing?.first_name || order.billing?.last_name
				? `${order.billing.first_name || ''} ${order.billing.last_name || ''}`.trim()
				: order.billing?.email || __('Guest', 'multivendorx'),
		[__('Date', 'multivendorx')]: order.date_created? formatWcShortDate(order.date_created) : '',
		[__('Status', 'multivendorx')] : order.status ?? '',
		[__('Total Earning', 'multivendorx')] : order.commission_total ?? '',
		[__('Total', 'multivendorx')] : order.total ?? '',
	});	
	const buttonActions = [
		{
			label: __('Download CSV', 'multivendorx'),
			icon: 'download',
	
			onClickWithQuery: (query: QueryProps) =>
				ExportCSV({
					url: getApiLink(appLocalizer, 'orders'),
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
	
					filename:
						query.filter?.created_at?.startDate &&
						query.filter?.created_at?.endDate
							? `orders-${formatWcShortDate(
									query.filter.created_at.startDate
							  )}-${formatWcShortDate(
									query.filter.created_at.endDate
							  )}.csv`
							: `orders-${formatWcShortDate(new Date())}.csv`,
	
					paramsBuilder: {
						page: 1,
						per_page: 100,
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
	
					columns: orderColumns,
				}),
		},
	];	
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
					status: query.categoryFilter === 'all' ? '' : query.categoryFilter,
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

				const lookup: Record<number, any> = {};
				orders.forEach((order: any) => {
					lookup[order.id] = order;
				});

				setOrderLookup(lookup);

				setRowIds(orders.map((o: any) => o.id));

				const mappedRows: TableRow[][] = orders.map((order: any) => [
					{
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
						display: (order.billing?.first_name || order.billing?.last_name)
							? `${order.billing.first_name || ''} ${order.billing.last_name || ''}`.trim()
							: (order.billing?.email || __('Guest', 'multivendorx')),
						value: order.id || '',
					},
					{
						display: (order.date_created),
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
			.catch(() => {
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
			});
	};

	const handleBulkAction = (
	action: string,
	selectedIds: number[]
) => {
	if (!action || selectedIds.length === 0) return;

	const updatePayload = {
		update: selectedIds.map((id) => ({
			id,
			status: action,
		})),
	};

	axios
		.post(
			`${appLocalizer.apiUrl}/wc/v3/orders/batch`,
			updatePayload,
			{
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
			}
		)
		.then(() => {
			fetchData({});
		})
		.catch((err) => {
			console.error('Error performing bulk action:', err);
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

			<PopupUI
				position="lightbox"
				open={confirmOpen}
				onClose={() => setConfirmOpen(false)}
				width={31.25}
			>
				{message}
			</PopupUI>
		</>
	);
};

export default Orders;
