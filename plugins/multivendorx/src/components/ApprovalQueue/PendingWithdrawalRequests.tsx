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

	const headers = {
		store_name: {
			label: __('Store', 'multivendorx'),
		},
		status: {
			label: __('Status', 'multivendorx'),
			type: 'status'
		},
		withdraw_amount: {
			label: __('Withdraw Amount', 'multivendorx'),
			type: 'currency'
		},
		action: {
			type: 'action',
			label: __('Action', 'multivendorx'),
			actions: [
				{
					label: __('Approve', 'multivendorx'),
					icon: 'check',
					onClick: (row: any) => handleSingleAction('approve', row),
				},
				{
					label: __('Reject', 'multivendorx'),
					icon: 'close',
					className: 'danger',
					onClick: (row: any) => handleSingleAction('reject', row),
				},
			]
		},
	};


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

				setRows(stores);
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
				currency={{
					currencySymbol: appLocalizer.currency_symbol,
					priceDecimals: appLocalizer.price_decimals,
					decimalSeparator: appLocalizer.decimal_separator,
					thousandSeparator: appLocalizer.thousand_separator,
					currencyPosition: appLocalizer.currency_position
				}}
			/>
		</div>
	);
};

export default PendingWithdrawal;
