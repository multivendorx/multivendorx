/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	getApiLink,
	NavigatorHeader,
	TableCard,
	TableRow,
	QueryProps,
	CategoryCount,
} from 'zyra';
import TransactionDetailsModal from './TransactionDetailsModal';
import { downloadCSV, formatLocalDate } from '../services/commonFunction';
import ViewCommission from './viewCommission';

type TransactionRow = {
	id: number;
	date: string;
	order_details: string;
	transaction_type: string;
	payment_mode: string;
	credit: number;
	debit: number;
	balance: number;
	status: string;
};

const Transactions: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [totalRows, setTotalRows] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [categoryCounts, setCategoryCounts] = useState<
		CategoryCount[] | null
	>(null);

	const [modalTransaction, setModalTransaction] =
		useState<TransactionRow | null>(null);
	const [modalCommission, setModalCommission] =
		useState<TransactionRow | null>(null);
	const headers = {
		id: { label: __('ID', 'multivendorx'), type: 'id' },
		status: { label: __('Status', 'multivendorx'), type: 'status' },
		created_at: { label: __('Date', 'multivendorx'), type: 'date' },
		transaction_type: {
			label: __('Transaction Type', 'multivendorx'),
			render: (row) =>
				row.transaction_type?.toLowerCase() === 'commission' &&
				row.commission_id ? (
					<span
						className="link-item"
						onClick={() => setModalCommission(row)}
						style={{ cursor: 'pointer' }}
					>
						{`Commission #${row.commission_id}`}
					</span>
				) : (
					<span>
						{row.narration
							?.replace(/-/g, ' ')
							.replace(/\b\w/g, (c: string) => c.toUpperCase()) ||
							'-'}
					</span>
				),
		},
		credit: { label: __('Credit', 'multivendorx'), type: 'currency' },
		debit: { label: __('Debit', 'multivendorx'), type: 'currency' },
		balance: {
			label: __('Balance', 'multivendorx'),
			isSortable: true,
			type: 'currency',
		},
		action: {
			type: 'action',
			label: 'Action',
			csvDisplay: false,
			actions: [
				{
					label: __('View', 'multivendorx'),
					icon: 'eye',
					onClick: (row) => {
						setModalTransaction(row);
					},
				},
			],
		},
	};
	const filters = [
		{
			key: 'transactionType',
			label: 'Transaction Type',
			type: 'select',
			options: [
				{ label: __('Transaction Type', 'multivendorx'), value: '' },
				{
					label: __('Commission', 'multivendorx'),
					value: 'Commission',
				},
				{
					label: __('Withdrawal', 'multivendorx'),
					value: 'Withdrawal',
				},
				{ label: __('Refund', 'multivendorx'), value: 'Refund' },
				{ label: __('Reversed', 'multivendorx'), value: 'Reversed' },
				{
					label: __('COD received', 'multivendorx'),
					value: 'COD received',
				},
			],
		},
		{
			key: 'transactionStatus',
			label: 'Financial Transactions',
			type: 'select',
			options: [
				{
					label: __('Financial Transactions', 'multivendorx'),
					value: '',
				},
				{ label: __('Credit', 'multivendorx'), value: 'Cr' },
				{ label: __('Debit', 'multivendorx'), value: 'Dr' },
			],
		},
		{
			key: 'created_at',
			label: 'Created Date',
			type: 'date',
		},
	];

	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);
		axios
			.get(getApiLink(appLocalizer, 'transaction'), {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
				params: buildQueryParams(query),
			})
			.then((response) => {
				const transactions = Array.isArray(response.data)
					? response.data
					: [];

				const ids: number[] = transactions.map((transaction) =>
					Number(transaction.id)
				);
				setRowIds(ids);

				setRows(transactions);
				setCategoryCounts([
					{
						value: 'all',
						label: __('All', 'multivendorx'),
						count: Number(response.headers['x-wp-total']) || 0,
					},
					{
						value: 'completed',
						label: __('Completed', 'multivendorx'),
						count:
							Number(response.headers['x-wp-status-completed']) ||
							0,
					},
					{
						value: 'processed',
						label: __('Processed', 'multivendorx'),
						count:
							Number(response.headers['x-wp-status-processed']) ||
							0,
					},
					{
						value: 'upcoming',
						label: __('Upcoming', 'multivendorx'),
						count:
							Number(response.headers['x-wp-status-upcoming']) ||
							0,
					},
					{
						value: 'failed',
						label: __('Failed', 'multivendorx'),
						count:
							Number(response.headers['x-wp-status-failed']) || 0,
					},
				]);

				setTotalRows(Number(response.headers['x-wp-total']) || 0);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error('Product fetch failed:', error);
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
			});
	};
	const downloadTransactionCSV = (selectedIds: number[]) => {
		if (!selectedIds) {
			return;
		}

		axios
			.get(getApiLink(appLocalizer, 'transaction'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: { ids: selectedIds },
			})
			.then((response) => {
				const rows = response.data || [];
				downloadCSV(
					headers,
					rows,
					`selected-commissions-${formatLocalDate(new Date())}.csv`
				);
			})
			.catch((error) => {
				console.error('CSV download failed:', error);
			});
	};

	const downloadTransactionCSVByQuery = (query: QueryProps) => {
		// Call the API
		axios
			.get(getApiLink(appLocalizer, 'transaction'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: buildQueryParams(query, false),
			})
			.then((response) => {
				const rows = response.data || [];

				downloadCSV(
					headers,
					rows,
					`transaction-${formatLocalDate(new Date())}.csv`
				);
			})
			.catch((error) => {
				console.error('CSV download failed:', error);
			});
	};
	const buildQueryParams = (
		query: QueryProps,
		includePagination: boolean = true
	) => {
		const params = {
			store_id: appLocalizer.store_id,
			status: query.categoryFilter === 'all' ? '' : query.categoryFilter,
			search_value: query.searchValue,
			order_by: query.orderby,
			order: query.order,
			transaction_status: query?.filter?.transactionStatus,
			transaction_type: query?.filter?.transactionType,
			start_date: query.filter?.created_at?.startDate
				? formatLocalDate(query.filter.created_at.startDate)
				: '',
			end_date: query.filter?.created_at?.endDate
				? formatLocalDate(query.filter.created_at.endDate)
				: '',
		};

		if (includePagination) {
			params.page = query.paged || 1;
			params.row = query.per_page || 10;
		}

		return params;
	};

	const buttonActions = [
		{
			label: __('Download CSV', 'multivendorx'),
			icon: 'download',
			onClickWithQuery: downloadTransactionCSVByQuery,
		},
	];
	return (
		<>
			<NavigatorHeader
				headerTitle={__('Transactions', 'multivendorx')}
				headerDescription={__(
					'Track your earnings, withdrawals, and current balance at a glance.',
					'multivendorx'
				)}
			/>

			<TableCard
				headers={headers}
				rows={rows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={doRefreshTableData}
				search={{ placeholder: 'Search...' }}
				filters={filters}
				buttonActions={buttonActions}
				ids={rowIds}
				categoryCounts={categoryCounts}
				bulkActions={[]}
				onSelectCsvDownloadApply={downloadTransactionCSV}
				format={appLocalizer.date_format}
				currency={{
					currencySymbol: appLocalizer.currency_symbol,
					priceDecimals: appLocalizer.price_decimals,
					decimalSeparator: appLocalizer.decimal_separator,
					thousandSeparator: appLocalizer.thousand_separator,
					currencyPosition: appLocalizer.currency_position,
				}}
			/>

			{modalTransaction && (
				<TransactionDetailsModal
					transaction={modalTransaction}
					onClose={() => setModalTransaction(null)}
				/>
			)}
			{modalCommission && (
				<ViewCommission
					open={!!modalCommission}
					onClose={() => setModalCommission(null)}
					commissionId={modalCommission.commission_id}
				/>
			)}
		</>
	);
};

export default Transactions;
