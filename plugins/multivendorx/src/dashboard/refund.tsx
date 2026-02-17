/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	getApiLink,
	TableCard,
} from 'zyra';

import { formatCurrency, formatLocalDate, formatWordpressDate } from '@/services/commonFunction';
import { QueryProps, TableRow } from '@/services/type';

const Refund: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);

	const headers = [
		{ key: 'order_id', label: __('Order', 'multivendorx'), isSortable: true },
		{ key: 'customer_name', label: __('Customer', 'multivendorx') },
		{ key: 'amount', label: __('Refund Amount', 'multivendorx') },
		{ key: 'customer_reason', label: __('Refund Reason', 'multivendorx') },
		{ key: 'status', label: __('Status', 'multivendorx') },
		{ key: 'date', label: __('Date', 'multivendorx') },
	];

	const filters = [
		{
			key: 'created_at',
			label: 'Created Date',
			type: 'date',
		},
	];

	const fetchData = (query: QueryProps) => {
		setIsLoading(true);
		axios
			.get(getApiLink(appLocalizer, 'refund'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: query.paged || 1,
					row: query.per_page || 10,
					status: query.categoryFilter || '',
					searchAction: query.searchAction || 'order_id',
					searchValue: query.searchValue || '',
					storeId: appLocalizer.store_id,
					startDate: query.filter?.created_at?.startDate
						? formatLocalDate(query.filter.created_at.startDate)
						: '',
					endDate: query.filter?.created_at?.endDate
						? formatLocalDate(query.filter.created_at.endDate)
						: '',
					orderBy: query.orderby,
					order: query.order,
				},
			})
			.then((response) => {
				const items = response.data || [];
				const ids = items
					.filter((item: any) => item?.review_id != null)
					.map((item: any) => item.review_id);

				setRowIds(ids);

				const mappedRows: any[][] = items.map((item: any) => [
					{
						value: item.order_id,
						display: item.order_id || '-',
						type: 'card',
						data: {
							name: `#${item.order_id}`,
							link: `/dashboard/sales/orders/#view/${item.order_id}`,
						},
					},
					{
						value: item.customer_name,
						display: item.customer_name?.trim(),
					},
					{
						value: item.amount,
						display: formatCurrency(item.amount),
					},
					{
						value: item.customer_reason,
						display: item.customer_reason,
					},
					{
						value: item.status,
						display: item.status,
					},
					{
						value: item.date,
						display: formatWordpressDate(item.date),
					}
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

	return (
		<>
			<div className="page-title-wrapper">
				<div className="page-title">
					<div className="title">{__('Refund', 'multivendorx')}</div>
					<div className="des">
						{__(
							'Manage and process refund requests from customers.',
							'multivendorx'
						)}
					</div>
				</div>
			</div>
			<TableCard
				headers={headers}
				rows={rows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={fetchData}
				ids={rowIds}
				search={{
					placeholder: 'Search...',
					options: [
						{ label: 'Order Id', value: 'order_id' },
						{ label: 'Customer', value: 'customer' },
					],
				}}
				filters={filters}
			/>
		</>
	);
};

export default Refund;
