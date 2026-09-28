/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink } from '@zyra/core';
import { QueryProps, TableCard, TableRow } from '@zyra/table';
import {
	formatCurrency,
	formatDate,
	formatStatusLabel,
} from '@/services/commonFunction';

interface LatestRefundRequestProps {
	store_id: number;
}

const LatestRefundRequest: React.FC<LatestRefundRequestProps> = ({
	store_id,
}) => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const doRefreshTableData = (query: QueryProps) => {
		if (!store_id) {
			return;
		}
		setIsLoading(true);

		axios
			.get(getApiLink(appLocalizer, 'refunds'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: query.paged || 1,
					row: 3,
					store_id: store_id,
					order_by: 'date',
					order: 'desc',
				},
			})
			.then((response) => {
				const items = response.data || [];

				setRows(items);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error('Failed to fetch announcements', error);
				setRows([]);
				setIsLoading(false);
			});
	};

	const headers = {
		order_title: {
			label: __('Order', 'multivendorx'),
			type: 'info',
			iconKey: 'info_icon',
			descriptionKey: 'info_descriptions',
			badgesKey: 'info_badges',
		},
	};

	const infoRows = rows.map((row: any) => ({
		...row,
		order_title: `#${row.order_id}`,
		info_icon: 'marketplace-refund',
		info_descriptions: [
			{
				label: __('Customer', 'multivendorx'),
				icon: 'person',
				value: row.customer_name || '—',
			},
			{
				label: __('Refund Amount', 'multivendorx'),
				icon: 'dollar',
				value: formatCurrency(row.amount),
			},
			{
				label: __('Refund Reason', 'multivendorx'),
				icon: 'question',
				value: row.reason || '—',
			},
		],
		info_badges: [
			{
				text: formatStatusLabel(row.status),
				color: `badge-${row.status}`,
			},
			{ text: formatDate(row.date_created), color: 'gray' },
		],
	}));

	return (
		<>
			<TableCard
				headers={headers}
				variant="transparent"
				rows={infoRows}
				isLoading={isLoading}
				onQueryUpdate={doRefreshTableData}
				showMenu={false}
				format={appLocalizer.date_format}
				currency={{
					currencySymbol: appLocalizer.currency_symbol,
					priceDecimals: appLocalizer.price_decimals,
					decimalSeparator: appLocalizer.decimal_separator,
					thousandSeparator: appLocalizer.thousand_separator,
					currencyPosition: appLocalizer.currency_position,
				}}
			/>
		</>
	);
};

export default LatestRefundRequest;
