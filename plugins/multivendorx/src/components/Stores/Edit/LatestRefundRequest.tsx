/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { formatCurrency, formatWordpressDate } from '@/services/commonFunction';
import { getApiLink, TableCard } from 'zyra';
import { QueryProps, TableHeader, TableRow } from '@/services/type';

interface LatestRefundRequestProps {
	store_id: number;
}

const LatestRefundRequest: React.FC<LatestRefundRequestProps> = ({
	store_id,
}) => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const fetchData = (query: QueryProps) => {
		if (!store_id) return;
		setIsLoading(true);

		axios
			.get(getApiLink(appLocalizer, 'refund'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: query.paged || 1,
					row: 3,
					store_id: store_id,
					orderBy: 'date',
					order: 'desc',
				},
			})
			.then((response) => {
				const items = response.data || [];

				const mappedRows: any[][] = items.map((item: any) => [
					{
						type: 'card',
						display: `#${item.order_id}`,
						value: item.order_id,
						data: {
							name: `#${item.order_id}`,
							link: `${appLocalizer.site_url.replace(
								/\/$/,
								''
							)}/wp-admin/post.php?post=${item.order_id}&action=edit`
						}
					},
					{
						type: 'card',
						display: item.customer_name,
						value: item.customer_name,
						data: {
							name: item.customer_name,
							link: item.customer_edit_link,
						}
					},
					{ display: formatCurrency(item.currency_symbol, item.amount), value: item.amount },
					{ display: item.reason, value: item.reason },
					{ display: item.status, value: item.status },
					{ display: formatWordpressDate(item.date), value: item.date },
				]);

				setRows(mappedRows);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error('Failed to fetch announcements', error);
				setRows([]);
				setIsLoading(false);
			});
	};

	const headers: TableHeader[] = [
		{
			key: 'order_id',
			label: 'Order',
		},
		{
			key: 'customer',
			label: 'Customer',
		},
		{
			key: 'amount',
			label: 'Refund Amount',
		},
		{
			key: 'reason',
			label: 'Refund Reason',
		},
		{
			key: 'status',
			label: 'Status',
		},
		{
			key: 'date',
			label: 'Date',
		}
	];

	return <>

		<TableCard
			headers={headers}
			rows={rows}
			isLoading={isLoading}
			onQueryUpdate={fetchData}
		/>
	</>
};

export default LatestRefundRequest;
