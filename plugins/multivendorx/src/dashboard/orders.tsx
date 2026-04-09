/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import {
	PopupUI,
	TableCard,
	useModules,
	TableRow,
	QueryProps,
	CategoryCount,
	NavigatorHeader,
	ButtonInputUI,
	getApiLink,
	SelectInputUI,
	BasicInputUI,
	FormGroup,
} from 'zyra';
import {
	downloadCSV,
	formatLocalDate,
	toWcIsoDate,
	dashNavigate,
	formatCurrency,
} from '../services/commonFunction';
import { pdf } from '@react-pdf/renderer';
// import StoreInvoicePDF from '@/assets/template/invoicePdf/Invoice-1';

const fetchOrderById = async (orderId: number) => {
  const res = await axios.get(
    `${appLocalizer.apiUrl}/wc/v3/orders/${orderId}`,
    {
      headers: { 'X-WP-Nonce': appLocalizer.nonce },
    }
  );

  return res.data;
};

const Orders: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [totalRows, setTotalRows] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [categoryCounts, setCategoryCounts] = useState<
		CategoryCount[] | null
	>(null);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [tracking, setTracking] = useState(false);
	const [trackingOrderId, setTrackingOrderId] = useState(false);
	const [message, setMessage] = useState('');
	const { modules } = useModules();
	const location = useLocation();
	const navigate = useNavigate();
	const hash = location.hash.replace(/^#/, '') || '';
	const privacy =
		appLocalizer.settings_databases_value?.privacy?.[
			'customer_information_access'
		];

	const exportAllOrders = () => {
		let allOrders = [];
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
			const params = {
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
			doRefreshTableData({ categoryFilter: 'refund-requested' });
		} else {
			doRefreshTableData({});
		}
	}, []);

	const bulkActions = [
		{ label: __('Pending Payment', 'multivendorx'), value: 'pending' },
		{ label: __('Processing', 'multivendorx'), value: 'processing' },
		{ label: __('On Hold', 'multivendorx'), value: 'on-hold' },
		{ label: __('Completed', 'multivendorx'), value: 'completed' },
		{ label: __('Cancelled', 'multivendorx'), value: 'cancelled' },
		{ label: __('Refunded', 'multivendorx'), value: 'refunded' },
		{ label: __('Failed', 'multivendorx'), value: 'failed' },
	];

	const privacyHeaders = privacy?.includes('name')
		? {
				customer: {
					label: __('Customer', 'multivendorx'),
					render: (row) =>
						row.billing?.first_name
							? `${row.billing.first_name} ${row.billing.last_name || ''}`
							: 'Guest',
				},
			}
		: {};

	const headers = {
		id: {
			label: __('Order ID', 'multivendorx'),
			render: (row) => (
				<span
					onClick={() =>
						dashNavigate(navigate, [
							'orders',
							'view',
							String(row.id),
						])
					}
					className="link-item"
				>
					#{row.id}
				</span>
			),
		},

		...privacyHeaders,

		date_created: {
			label: __('Date', 'multivendorx'),
			type: 'date',
		},

		status: {
			label: __('Status', 'multivendorx'),
			type: 'status',
		},

		total: {
			label: __('Total', 'multivendorx'),
			type: 'currency',
		},

		action: {
			type: 'action',
			label: 'Action',
			actions: [
				...(appLocalizer.edit_order_capability
					? [
							{
								label: __('View', 'multivendorx'),
								icon: 'eye',
								onClick: (row) => {
									dashNavigate(navigate, [
										'orders',
										'view',
										String(row.id),
									]);
								},
							},
						]
					: []),

				{
					label: __('Download', 'multivendorx'),
					icon: 'download',
					onClick: async (row) => {
						try {
							// 1. Fetch order
							const order = await fetchOrderById(row.id);

							// 2. Map order → invoice rows
							const invoiceRows = order.line_items.map((item) => ({
								description: item.name,
								qty: item.quantity,
								price: formatCurrency(item.price),
								amount: formatCurrency(item.total),
							}));
							console.log('Order Object:', order);
							// 3. Generate PDF blob
							const blob = await pdf(
								// <StoreInvoicePDF
								// 	invoiceRows={invoiceRows}
								// 	order = {order}
								// 	colors={{
								// 		colorPrimary: appLocalizer.settings_databases_value?.invoices?.test.invoice_template.colors.colorPrimary || '#000',
								// 		colorSecondary: appLocalizer.settings_databases_value?.invoices?.test.invoice_template.colors.colorSecondary || '#ccc',
								// 		colorAccent: appLocalizer.settings_databases_value?.invoices?.test.invoice_template.colors.colorAccent || '#000',
								// 		colorSupport: appLocalizer.settings_databases_value?.invoices?.test.invoice_template.colors.colorSupport || '#999',
								// 	}}
								// />
							).toBlob();

							// 4. Create download link
							const url = URL.createObjectURL(blob);

							const link = document.createElement('a');
							link.href = url;
							link.download = `invoice-${row.id}.pdf`;
							document.body.appendChild(link);
							link.click();
							document.body.removeChild(link);

							URL.revokeObjectURL(url);

						} catch (error) {
							console.error('Invoice download failed:', error);
						}
					},
				},

				{
					label: __('Copy URL', 'multivendorx'),
					icon: 'vendor-form-copy',
					onClick: () => {
						navigator.clipboard.writeText(window.location.href);
					},
				},

				{
					label: __('Shipping', 'multivendorx'),
					icon: 'shipping',
					onClick: (row) => {
						setTracking(true);
						setTrackingOrderId(row.id);
					},
				},

				{
					label: __('PDF', 'multivendorx'),
					icon: 'pdf',
					onClick: (row) => {
						window.location.href = `?page=multivendorx#&tab=stores&edit/${row.id}`;
					},
				},
			],
		},
	};
	const filters = [
		{
			key: 'created_at',
			label: 'Created Date',
			type: 'date',
		},
	];

	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);

		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/orders`, {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
				params: buildOrderQueryParams(query),
			})
			.then((response) => {
				const orders = Array.isArray(response.data)
					? response.data
					: [];
				setRowIds(orders.map((o) => o.id));

				setRows(orders);
				setTotalRows(Number(response.headers['x-wp-total']) || 0);
				setIsLoading(false);
			})
			.catch(() => {
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
			});
	};

	const handleBulkAction = (action: string, selectedIds: number[]) => {
		if (!action || selectedIds.length === 0) {
			return;
		}

		const updatePayload = {
			update: selectedIds.map((id) => ({
				id,
				status: action,
			})),
		};

		axios
			.post(`${appLocalizer.apiUrl}/wc/v3/orders/batch`, updatePayload, {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
			})
			.then(() => {
				doRefreshTableData({});
			})
			.catch((err) => {
				console.error('Error performing bulk action:', err);
			});
	};

	const buildOrderQueryParams = (
		query: QueryProps,
		includePagination: boolean = true
	) => {
		const params = {
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
		};

		if (includePagination) {
			params.page = query.page || 1;
			params.per_page = query.per_page || 10;
		}

		return params;
	};

	const [formData, setFormData] = useState({
		provider: '',
		tracking_date: '',
		tracking_url: '',
		tracking_id: '',
	});

	const fetchOrder = () => {
		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/orders/${trackingOrderId}`, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((res) => {
				const meta = (key: string) =>
					res.data.meta_data.find((m) => m.key === key)?.value ?? '';
				setFormData({
					provider: meta(
						appLocalizer.order_meta['shipping_provider']
					),
					tracking_date: meta(
						appLocalizer.order_meta['tracking_date']
					),
					tracking_url: meta(appLocalizer.order_meta['tracking_url']),
					tracking_id: meta(appLocalizer.order_meta['tracking_id']),
				});
			});
	};

	useEffect(() => {
		if (!trackingOrderId) {
			return;
		}

		fetchOrder();
	}, [trackingOrderId]);

	const handleChange = (key, value) => {
		setFormData((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const handleTracking = () => {
		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `tracking`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: {
				...formData,
				order_id: trackingOrderId,
			},
		}).then(() => {
			setTracking(false);
		});
	};

	const providers =
		appLocalizer.settings_databases_value.shipping.shipping_providers || [];

	const formattedProviders = providers.map((provider) => ({
		value: provider,
		label: provider
			.replace(/[-_]/g, ' ')
			.replace(/\b\w/g, (char) => char.toUpperCase()),
	}));

	const downloadCSVByQuery = (query: QueryProps) => {
		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/orders`, {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
				params: buildOrderQueryParams(query, false),
			})
			.then((response) => {
				const rows = response.data || [];

				downloadCSV(
					headers,
					rows,
					`order-${formatLocalDate(new Date())}.csv`
				);
			})
			.catch((error) => {
				console.error('CSV download failed:', error);
			});
	};
	const buttonActions = [
		{
			label: __('Download CSV', 'multivendorx'),
			icon: 'download',
			onClickWithQuery: downloadCSVByQuery,
		},
	];

	return (
		<>
			<NavigatorHeader
				headerTitle={__('Orders', 'multivendorx')}
				headerDescription={__(
					'View, track, and manage all your store orders and earnings in one place.',
					'multivendorx'
				)}
				buttons={[
					// {
					// 	label: __('Export', 'multivendorx'),
					// 	icon: 'export',
					// 	onClick: exportAllOrders,
					// },
					{
						label: __('Add New', 'multivendorx'),
						icon: 'plus',
						onClick: () => {
							dashNavigate(navigate, ['orders', 'add']);
						},
					},
				]}
			/>
			<TableCard
				headers={headers}
				rows={rows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={doRefreshTableData}
				search={{
					placeholder: __('Search...', 'multivendorx'),
					size: 10,
					options: [
						{ label: __('All', 'multivendorx'), value: 'all' },
						{
							label: __('Order Id', 'multivendorx'),
							value: 'order_id',
						},
						{
							label: __('Products', 'multivendorx'),
							value: 'products',
						},
						{
							label: __('Customer Email', 'multivendorx'),
							value: 'customer_email',
						},
						{
							label: __('Customer', 'multivendorx'),
							value: 'customer',
						},
					],
				}}
				filters={filters}
				buttonActions={buttonActions}
				ids={rowIds}
				categoryCounts={categoryCounts}
				bulkActions={bulkActions}
				onBulkActionApply={(action: string, selectedIds: []) => {
					handleBulkAction(action, selectedIds);
				}}
				format={appLocalizer.date_format}
				currency={{
					currencySymbol: appLocalizer.currency_symbol,
					priceDecimals: appLocalizer.price_decimals,
					decimalSeparator: appLocalizer.decimal_separator,
					thousandSeparator: appLocalizer.thousand_separator,
					currencyPosition: appLocalizer.currency_position,
				}}
			/>

			<PopupUI
				position="lightbox"
				open={confirmOpen}
				onClose={() => setConfirmOpen(false)}
				width={31.25}
			>
				{message}
			</PopupUI>

			{tracking && (
				<PopupUI
					open={tracking}
					onClose={() => setTracking(false)}
					width={31.25}
					height={40}
					header={{
						icon: 'tools',
						title: __('Tracking', 'multivendorx'),
					}}
					footer={
						<ButtonInputUI
							buttons={[
								{
									icon: 'close',
									text: __('Cancel', 'multivendorx'),
									color: 'red',
									onClick: () => {
										setTracking(false);
									},
								},
								{
									icon: 'cross',
									color: 'purple',
									text: __('Send', 'multivendorx'),
									onClick: handleTracking,
								},
							]}
						/>
					}
				>
					<FormGroup
						cols={2}
						label={__('Shipping Providers', 'multivendorx-pro')}
						htmlFor="title"
					>
						<SelectInputUI
							type="single-select"
							name="provider"
							value={formData.provider || ''}
							options={formattedProviders}
							onChange={(selected) =>
								handleChange('provider', selected)
							}
						/>
					</FormGroup>
					<FormGroup
						cols={2}
						label={__('Date', 'multivendorx-pro')}
						htmlFor="title"
					>
						<BasicInputUI
							type="date"
							value={formData.tracking_date}
							onChange={(value: any) =>
								handleChange('date', value)
							}
						/>
					</FormGroup>
					<FormGroup
						cols={2}
						label={__('Tracking URL', 'multivendorx-pro')}
						htmlFor="title"
					>
						<BasicInputUI
							type="text"
							value={formData.tracking_url}
							onChange={(value: any) =>
								handleChange('tracking_url', value)
							}
						/>
					</FormGroup>
					<FormGroup
						cols={2}
						label={__('Tracking Number', 'multivendorx-pro')}
						htmlFor="title"
					>
						<BasicInputUI
							type="text"
							value={formData.tracking_id}
							onChange={(value: any) =>
								handleChange('tracking_id', value)
							}
						/>
					</FormGroup>
				</PopupUI>
			)}
		</>
	);
};

export default Orders;
