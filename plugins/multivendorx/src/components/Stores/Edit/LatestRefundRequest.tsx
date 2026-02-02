/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { ColumnDef } from '@tanstack/react-table';
import { formatCurrency } from '@/services/commonFunction';
import { getApiLink, Table, TableCell } from 'zyra';

type RefundRow = {
	id: number;
	order_id: number;
	customer_name: string;
	store_name: string;
	amount: string;
	reason: string;
	date: string;
	status: string;
	customer_edit_link?: string;
};

interface LatestRefundRequestProps {
	store_id: number;
}

const LatestRefundRequest: React.FC<LatestRefundRequestProps> = ({
	store_id,
}) => {
	const [data, setData] = useState<RefundRow[]>([]);

	useEffect(() => {
		if (store_id) {
			requestData(3, 1, store_id);
		}
	}, [store_id]);

	// Column definitions
	const columns: ColumnDef<RefundRow>[] = [
		{
			id: 'order_id',
			accessorKey: 'order_id',
			enableSorting: true,
			header: __('Order', 'multivendorx'),
			cell: ({ row }) => {
				const orderId = row.original.order_id;
				const url = orderId
					? `${appLocalizer.site_url.replace(
							/\/$/,
							''
						)}/wp-admin/post.php?post=${orderId}&action=edit`
					: '#';

				return (
					<TableCell title={orderId ? `#${orderId}` : '-'}>
						{orderId ? (
							<a
								href={url}
								target="_blank"
								rel="noopener noreferrer"
								className="link-item"
							>
								#{orderId}
							</a>
						) : (
							'-'
						)}
					</TableCell>
				);
			},
		},
		{
			header: __('Customer', 'multivendorx'),
			cell: ({ row }) => {
				const name = row.original.customer_name?.trim();
				const link = row.original.customer_edit_link;

				return (
					<TableCell title={name || '-'}>
						{name ? (
							link ? (
								<a
									href={link}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 hover:underline"
								>
									{name}
								</a>
							) : (
								name
							)
						) : (
							'-'
						)}
					</TableCell>
				);
			},
		},
		{
			header: __('Refund Amount', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.amount || ''}>
					{formatCurrency(row.original.amount)}
				</TableCell>
			),
		},
		{
			header: __('Refund Reason', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.reason || ''}>
					{row.original.reason || '-'}
				</TableCell>
			),
		},
		{
			id: 'status',
			header: __('Status', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell type="status" status={row.original.status} />
			),
		},
		{
			header: __('Date', 'multivendorx'),
			cell: ({ row }) => {
				const date = row.original.date;
				if (!date) {
					return <TableCell>-</TableCell>;
				}

				const formattedDate = new Date(date).toLocaleDateString(
					'en-US',
					{
						year: 'numeric',
						month: 'short',
						day: 'numeric',
					}
				);

				return (
					<TableCell title={formattedDate}>{formattedDate}</TableCell>
				);
			},
		},
	];

	// Fetch data from backend
	function requestData(
		rowsPerPage = 3,
		currentPage = 1,
		store_id?: number,
		orderBy = 'date',
		order = 'desc'
	) {
		if (!store_id) {
			return;
		}

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'refund'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				page: currentPage,
				row: rowsPerPage,
				store_id,
				orderBy,
				order,
			},
		})
			.then((response) => {
				setData(response.data || []);
			})
			.catch(() => {
				setData([]);
			});
	}

	return <Table data={data} columns={columns} />;
};

export default LatestRefundRequest;
