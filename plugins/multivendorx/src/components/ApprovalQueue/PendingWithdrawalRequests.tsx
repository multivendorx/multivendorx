/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink } from '@zyra/core';
import { ButtonInput } from '@zyra/inputs';
import { QueryProps, TableCard, TableRow } from '@zyra/table';
import {
	formatCurrency,
	formatStatusLabel,
	getUrl,
} from '@/services/commonFunction';
import ListGate from '../Popup/ListGate';
import useNoRecordsYet from '../Popup/useNoRecordsYet';
import { SAMPLE_WITHDRAWALS } from '../Popup/sampleRows';

const PendingWithdrawal: React.FC<object> = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);

	const handleSingleAction = (action: string, row) => {
		if (!row?.id) {
			return;
		}

		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `transactions/${row.id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: {
				withdraw: true,
				action,
				amount: row.withdraw_amount,
				store_id: row.id,
			},
		})
			.then(() => {
				doRefreshTableData({});
			})
			.catch(console.error);
	};

	const headers = {
		store_name: {
			label: __('Store', 'multivendorx'),
			type: 'info',
			iconKey: 'info_icon',
			titleLinkKey: 'info_link',
			descriptionKey: 'info_descriptions',
			badgesKey: 'info_badges',
		},
		action: {
			label: __('Action', 'multivendorx'),
			render: (row: any) => {
				return (
					<ButtonInput
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
			.get(getApiLink(appLocalizer, 'stores'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: query.paged,
					row: query.per_page,
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
				window.multivendorxStore?.setCount('withdrawal', total);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error('Pending withdrawal fetch failed:', error);
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
			});
	};

	/** A record as a table row; the sample rows go through it too, so they look like real ones. */
	const toInfoRow = (row: any) => ({
		...row,
		info_icon: 'wallet',
		info_link: getUrl(row.store_id, 'store', 'edit'),
		info_descriptions: [
			{
				label: __('Withdraw Amount', 'multivendorx'),
				icon: 'dollar',
				value: formatCurrency(row.withdraw_amount),
			},
		],
		info_badges: [
			{
				text: formatStatusLabel(row.status),
				color: `badge-${row.status}`,
			},
		],
	});
	const infoRows = rows.map(toInfoRow);

	const sampleRowsData = SAMPLE_WITHDRAWALS;
	const { props: gatedProps, hasNoRecords } = useNoRecordsYet({
		rows: infoRows,
		isLoading,
		onQueryUpdate: doRefreshTableData,
	});

	return (
		<ListGate
			feature={{
				title: __('Withdrawal requests', 'multivendorx'),
				description: '',
				icon: 'wallet',
			}}
			sample={
				<TableCard
					headers={headers}
					variant="transparent"
					format={appLocalizer.date_format}
					currency={{
						currencySymbol: appLocalizer.currency_symbol,
						priceDecimals: appLocalizer.price_decimals,
						decimalSeparator: appLocalizer.decimal_separator,
						thousandSeparator: appLocalizer.thousand_separator,
						currencyPosition: appLocalizer.currency_position,
					}}
					rows={sampleRowsData.map(toInfoRow)}
					totalRows={sampleRowsData.length}
				/>
			}
			isEmpty={hasNoRecords}
			empty={{
				heading: __('No withdrawal requests', 'multivendorx'),
				description: __(
					'Stores ask to be paid what is in their wallet. Each request waits here until you approve it.',
					'multivendorx'
				),
				actions: (
					<>
						<a
							className="mvx-locked-button"
							href={'#&tab=settings&subtab=payouts'}
						>
							{__('Payout settings', 'multivendorx')}
						</a>
						<a
							className="mvx-locked-link"
							href={'#&tab=transaction-history'}
						>
							{__('Transaction history', 'multivendorx')}
						</a>
					</>
				),
				note: __(
					'A preview with sample requests. Real ones show here.',
					'multivendorx'
				),
			}}
		>
			<TableCard
				headers={headers}
				variant="transparent"
				rows={infoRows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={gatedProps.onQueryUpdate}
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
		</ListGate>
	);
};

export default PendingWithdrawal;
