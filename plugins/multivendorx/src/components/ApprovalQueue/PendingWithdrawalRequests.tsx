/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink, TableCard } from 'zyra';
import { QueryProps, TableRow } from '@/services/type';
import { formatCurrency } from '@/services/commonFunction';

interface Props {
	onUpdated?: () => void;
}

const PendingWithdrawal: React.FC<Props> = ({ onUpdated }) => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [rowMap, setRowMap] = useState<Record<number, any>>({}); // map ID → row data

	const handleSingleAction = (action: string, row: any) => {
		if (!row?.id) return;

		axios({
			method: 'PUT',
			url: getApiLink(appLocalizer, `transaction/${row.id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: {
				withdraw: true,
				action,
				amount: row.withdraw_amount,
				store_id: row.id,
			},
		})
			.then(() => {
				fetchData({});
				onUpdated?.();
			})
			.catch(console.error);
	};

	const headers = [
		{ key: 'store_name', label: __('Store', 'multivendorx') },
		{ key: 'status', label: __('Status', 'multivendorx') },
		{ key: 'withdraw_amount', label: __('Withdraw Amount', 'multivendorx') },
		{
			key: 'action',
			type: 'action',
			label: 'Action',
			actions: [
				{
					label: __('Approve', 'multivendorx'),
					icon: 'check',
					onClick: (id: number) => handleSingleAction('approve', rowMap[id])
				},
				{
					label: __('Reject', 'multivendorx'),
					icon: 'close',
					onClick: (id: number) => handleSingleAction('reject', rowMap[id]),
					className: 'danger',
				},
			],
		},
	];

	const fetchData = (query: QueryProps) => {
		setIsLoading(true);
		axios
			.get(getApiLink(appLocalizer, 'store'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: query.paged,
					per_page: query.per_page,
					pending_withdraw: true,
				},
			})
			.then((response) => {
				const stores = Array.isArray(response.data) ? response.data : [];

				const ids = stores.map((s) => s.id);
				setRowIds(ids);

				const map: Record<number, any> = {};
				stores.forEach((s) => {
					map[s.id] = s;
				});
				setRowMap(map);

				const mappedRows: any[][] = stores.map((store) => [
					{ value: store.store_name, display: store.store_name },
					{ value: store.status, display: store.status },
					{ value: store.withdraw_amount, display: formatCurrency(store.withdraw_amount) },
				]);

				setRows(mappedRows);
				setTotalRows(Number(response.headers['x-wp-total']) || 0);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error('Pending withdrawal fetch failed:', error);
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
			});
	};

	return (
		<div className="admin-table-wrapper">
			<TableCard
				headers={headers}
				rows={rows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={fetchData}
				ids={rowIds}
				format={appLocalizer.date_format}
			/>
		</div>
	);
};

export default PendingWithdrawal;
