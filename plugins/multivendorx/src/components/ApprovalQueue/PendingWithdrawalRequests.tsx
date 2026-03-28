/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	ButtonInputUI,
	getApiLink,
	QueryProps,
	TableCard,
	TableRow,
} from 'zyra';
import { useRef } from '@wordpress/element';
import { getUrl, setSession } from '@/services/commonFunction';

const PendingWithdrawal: React.FC<object> = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const firstLoadRef = useRef(true);

	const handleSingleAction = (action: string, row) => {
		if (!row?.id) {
			return;
		}

		axios({
			method: 'POST',
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
				firstLoadRef.current = true;
				doRefreshTableData({});
			})
			.catch(console.error);
	};

	const headers = {
		store_name: {
			label: __('Store', 'multivendorx'),
			render: (row) => (
				<a
					href={getUrl(row.store_id, 'store', 'edit')}
					target="_blank"
					rel="noopener noreferrer"
					className="link-item"
				>
					{row.store_name}
				</a>
			),
		},
		status: {
			label: __('Status', 'multivendorx'),
			type: 'status',
		},
		withdraw_amount: {
			label: __('Withdraw Amount', 'multivendorx'),
			type: 'currency',
		},
		action: {
			label: __('Action', 'multivendorx'),
			render: (row: any) => {
				return (
					<ButtonInputUI
						buttons={[
							{
								icon: 'check',
								text: __('Approve', 'multivendorx'),
								color: 'purple',
								onClick: () =>
                        			handleSingleAction('approve', row),
							},
							{
								icon: 'close',
								text: __('Reject', 'multivendorx'),
								color: 'red',
								onClick: () =>
									handleSingleAction('reject', row),
							},
						]}
					/>
				);
			},
		},
	};

	const doRefreshTableData = (query: QueryProps) => {
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
				const stores = Array.isArray(response.data)
					? response.data
					: [];

				const ids = stores.map((s) => s.id);
				setRowIds(ids);
				setRows(stores);
				const total = Number(response.headers['x-wp-total']) || 0;
				setTotalRows(total);
				onCountChange?.(total);
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
				onQueryUpdate={doRefreshTableData}
				ids={rowIds}
				format={appLocalizer.date_format}
				currency={{
					currencySymbol: appLocalizer.currency_symbol,
					priceDecimals: appLocalizer.price_decimals,
					decimalSeparator: appLocalizer.decimal_separator,
					thousandSeparator: appLocalizer.thousand_separator,
					currencyPosition: appLocalizer.currency_position,
				}}
			/>
		</div>
	);
};

export default PendingWithdrawal;
