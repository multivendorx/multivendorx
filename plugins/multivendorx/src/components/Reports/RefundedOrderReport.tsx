import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { ExportCSV, getApiLink, TableCard } from 'zyra';
import axios from 'axios';
import { formatCurrency, formatLocalDate,  } from '../../services/commonFunction';
import { QueryProps, TableRow } from '@/services/type';

const RefundedOrderReport: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [totalRows, setTotalRows] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [store, setStore] = useState([]);

	// Fetch store list and total refunds on mount
	useEffect(() => {
		axios
			.get(getApiLink(appLocalizer, 'store'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: { options: true },
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

	const headers = [
		{
			key: 'order_id',
			label: __('Order', 'multivendorx'),
			isSortable: true,
		},
		{
			key: 'customer',
			label: __('Customer', 'multivendorx'),
		},
		{
			key: 'store',
			label: __('Store', 'multivendorx'),
		},
		{
			key: 'amount',
			label: __('Refund Amount', 'multivendorx'),
		},
		{
			key: 'customer_reason',
			label: __('Refund Reason', 'multivendorx'),
		},
		{
			key: 'status',
			label: __('Status', 'multivendorx'),
		},
		{
			key: 'date',
			label: __('Date', 'multivendorx'),
			isSortable: true,
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

	const refundColumns = (refund: any) => ({
		[__('Order', 'multivendorx')]: refund.order_id ?? '',
		[__('Customer', 'multivendorx')]: refund.customer_name?.trim() ?? '',
		[__('Store', 'multivendorx')]: refund.store_name?.trim() ?? '',
		[__('Refund Amount', 'multivendorx')]: refund.amount ?? '',
		[__('Refund Reason', 'multivendorx')]: refund.customer_reason ?? '',
		[__('Status', 'multivendorx')]: refund.status ?? '',
		[__('Date', 'multivendorx')]: refund.date ?? '',
	});	

	const buttonActions = [
		{
		  label: __('Download CSV', 'multivendorx'),
		  icon: 'download',
	  
		  onClickWithQuery: (query: QueryProps) => ExportCSV({
			url: getApiLink(appLocalizer, 'refund'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			filename:
				query.filter?.created_at?.startDate &&
				query.filter?.created_at?.endDate
				  ? `refunds-${formatLocalDate(query.filter.created_at.startDate)}-${formatLocalDate(query.filter.created_at.endDate)}.csv`
				  : `refunds-${formatLocalDate(new Date())}.csv`,
	  
			paramsBuilder: ({
			  page: 1,
			  per_page: 100,
			  searchAction: query.searchAction || 'order_id',
			  searchValue: query.searchValue,
			  orderby: query.orderby || 'date',
			  order: query.order || 'desc',
			  store_id: query.filter?.store_id,
	  
			  startDate: query.filter?.created_at?.startDate
				? formatLocalDate(query.filter.created_at.startDate)
				: undefined,
	  
			  endDate: query.filter?.created_at?.endDate
				? formatLocalDate(query.filter.created_at.endDate)
				: undefined,
			}),
	  
			columns: refundColumns,
		  }),
		},
	];

	const fetchData = (query: QueryProps) => {
		setIsLoading(true);

		axios
			.get(getApiLink(appLocalizer, 'refund'), {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
				params: {
					page: query.page,
					per_page: query.per_page,
					searchAction:query.searchAction || 'order_id',
					searchValue: query.searchValue,
					orderby: query.orderby || 'date',
					order: query.order || 'desc',
					store_id: query.filter?.store_id,
					startDate: query.filter?.created_at?.startDate
						? formatLocalDate(query.filter.created_at.startDate)
						: undefined,
					endDate: query.filter?.created_at?.endDate
						? formatLocalDate(query.filter.created_at.endDate)
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
						display: `#${order.order_id}`,
						value: order.order_id,
						type: 'card',
						data: {
							link: `${appLocalizer.site_url}/wp-admin/post.php?post=${order.order_id}&action=edit`,
							name: `#${order.order_id}`
						},
					},
					{
						display: order.customer_name?.trim(),
						value: order.id,
						type: 'card',
						data: {
							link: order.customer_edit_link,
							name: order.customer_name?.trim()
						},
					},
					{
						display: order.store_name?.trim() || '-',
						value: order.store_id,
						type: 'card',
						data: {
							link: order.store_id
								? `${window.location.origin}/wp-admin/admin.php?page=multivendorx#&tab=stores&edit/${order.store_id}/&subtab=store-overview`
								: '#',
							name: order.store_name?.trim() || '-',
						},
					},					
					{
						display: formatCurrency(order.amount),
						value: order.amount,
					},
					{
						display: order.customer_reason || '-',
						value: order.customer_reason || '',
					},
					{
						display: order.status,
						value: order.status,
						type: 'status',
					},
					{
						display: order.date,
						value: order.date,
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

	return (
		<>
			<TableCard
				headers={headers}
				rows={rows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={fetchData}
				search={{
					placeholder: 'Search Products...',
					options: [
						{ label: 'Order ID', value: 'order_id' },
						{ label: 'Customer', value: 'customer' },
					],
				}}
				filters={filters}
				buttonActions={buttonActions}
				rowIds={rowIds}
				format={appLocalizer.date_format}
			/>
		</>
	);
};

export default RefundedOrderReport;
