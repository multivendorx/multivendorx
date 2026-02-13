import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Column, Container, getApiLink, TableCard } from 'zyra';
import TransactionDetailsModal from './TransactionDetailsModal';
import { downloadCSV, formatCurrency, formatLocalDate, formatWcShortDate } from '../services/commonFunction';
import { categoryCounts, QueryProps, TableRow } from '@/services/type';

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
		categoryCounts[] | null
	>(null);
	const [transactionsById, setTransactionsById] = useState<Record<number, TransactionRow>>({});

	const [modalTransaction, setModalTransaction] = useState<TransactionRow | null>(null);

	const headers = [
		{ key: 'id', label: __('ID', 'multivendorx') },
		{ key: 'status', label: __('Status', 'multivendorx') },
		{ key: 'date', label: __('Date', 'multivendorx') },
		{ key: 'TransactionType', label: __('Transaction Type', 'multivendorx') },
		{ key: 'credit', label: __('Credit', 'multivendorx') },
		{ key: 'debit', label: __('Debit', 'multivendorx') },
		{ key: 'balance', label: __('Balance', 'multivendorx'), isSortable: true, },
		{
			key: 'action',
			type: 'action',
			label: 'Action',
			actions: [
				{
					label: __('View', 'multivendorx'),
					icon: 'edit',
					onClick: (id: number) => {
						const txn = transactionsById[id];
						if (txn) {
							setModalTransaction(txn);
						}
					},
				}
			],
		},
	];

	const filters = [
		{
			key: 'transactionType',
			label: 'Transaction Type',
			type: 'select',
			options: [
				{ label: __('Transaction Type', 'multivendorx'), value: '' },
				{ label: __('Commission', 'multivendorx'), value: 'Commission' },
				{ label: __('Withdrawal', 'multivendorx'), value: 'Withdrawal' },
				{ label: __('Refund', 'multivendorx'), value: 'Refund' },
				{ label: __('Reversed', 'multivendorx'), value: 'Reversed' },
				{ label: __('COD received', 'multivendorx'), value: 'COD received' }
			]
		},
		{
			key: 'transactionStatus',
			label: 'Financial Transactions',
			type: 'select',
			options: [
				{ label: __('Financial Transactions', 'multivendorx'), value: '' },
				{ label: __('Credit', 'multivendorx'), value: 'Cr' },
				{ label: __('Debit', 'multivendorx'), value: 'Dr' }
			]
		},
		{
			key: 'created_at',
			label: 'Created Date',
			type: 'date',
		},
	];

	const buttonActions = [
		{
			label: 'Download CSV',
			icon: 'download',
			onClickWithQuery: (query: QueryProps) => {
				downloadTransactionCSVByQuery(query);
			},
		},
	];

	const fetchData = (query: QueryProps) => {
		setIsLoading(true);
		axios
			.get(getApiLink(appLocalizer, 'transaction'), {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
				params: {
					page: query.paged,
					per_page: query.per_page,
					store_id: appLocalizer.store_id,
					status: query.categoryFilter === 'all' ? '' : query.categoryFilter,
					searchValue: query.searchValue,
					orderby: query.orderby,
					order: query.order,
					transactionStatus: query?.filter?.transactionStatus,
					transactionType: query?.filter?.transactionType,
					startDate: query.filter?.created_at?.startDate
						? formatLocalDate(query.filter.created_at.startDate)
						: '',
					endDate: query.filter?.created_at?.endDate
						? formatLocalDate(query.filter.created_at.endDate)
						: '',
				},
			})
			.then((response) => {
				const products = Array.isArray(response.data)
					? response.data
					: [];

				const ids: number[] = products.map((p: any) => Number(p.id));
				setRowIds(ids);

				const txnMap: Record<number, TransactionRow> = {};
				products.forEach((txn: any) => {
					txnMap[Number(txn.id)] = txn;
				});
				setTransactionsById(txnMap);

				const mappedRows: any[][] = products.map((product: any) => [
					{
						display: `#${product.id}`,
						value: product.id,
					},
					{
						display: product.status,
						value: product.status,
					},
					{
						display: product.date
							? formatWcShortDate(product.date)
							: '-',
						value: product.date,
					},
					{
						display: (
							product.transaction_type?.toLowerCase() === 'commission' && product.commission_id ? (
								<span
									className="link-item"
									onClick={() => {
										setSelectedCommissionId(product.commission_id);
										setViewCommission(true);
									}}
								>
									{`Commission #${product.commission_id}`}
								</span>
							) : (
								<span>
									{product.narration
										?.replace(/-/g, ' ')
										.replace(/\b\w/g, (c: string) => c.toUpperCase()) || '-'}
								</span>
							)
						),
						value: product.transaction_type,
					},
					{
						display: product.credit
							? formatCurrency(product.credit)
							: '-',
						value: product.credit,
					},
					{
						display: product.debit
							? formatCurrency(product.debit)
							: '-',
						value: product.debit,
					},
					{
						display: product.balance
							? formatCurrency(product.balance)
							: '-',
						value: product.balance,
					},
				]);

				setRows(mappedRows);
				setCategoryCounts([
					{
						value: 'all',
						label: 'All',
						count: Number(response.headers['x-wp-total']) || 0,
					},
					{
						value: 'completed',
						label: 'Completed',
						count: Number(response.headers['x-wp-status-completed']) || 0,
					},
					{
						value: 'processed',
						label: 'Processed',
						count: Number(response.headers['x-wp-status-processed']) || 0,
					},
					{
						value: 'upcoming',
						label: 'Upcoming',
						count: Number(response.headers['x-wp-status-upcoming']) || 0,
					},
					{
						value: 'vailed',
						label: 'Failed',
						count: Number(response.headers['x-wp-status-failed']) || 0,
					}
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

	const downloadTransactionCSVByQuery = (query: QueryProps) => {
		axios
			.get(getApiLink(appLocalizer, 'transaction'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					per_page: 1000, // large export
					store_id: appLocalizer.store_id,
					searchValue: query.searchValue,
					status: query.categoryFilter === 'all' ? '' : query.categoryFilter,
					orderby: query.orderby,
					order: query.order,
					transactionStatus: query?.filter?.transactionStatus,
					transactionType: query?.filter?.transactionType,
					startDate: query.filter?.created_at?.startDate
						? formatLocalDate(query.filter.created_at.startDate)
						: '',
					endDate: query.filter?.created_at?.endDate
						? formatLocalDate(query.filter.created_at.endDate)
						: '',
				},
			})
			.then((res) => {
				const data = Array.isArray(res.data) ? res.data : [];

				downloadCSV({
					data: mapTransactionsToCSV(data),
					filename: 'wallet-transactions.csv',
					headers: {
						ID: 'ID',
						Store: 'Store',
						Transaction_Type: 'Transaction Type',
						Status: 'Status',
						Order_ID: 'Order ID',
						Credit: 'Credit',
						Debit: 'Debit',
						Balance: 'Balance',
						Date: 'Date',
						Narration: 'Narration',
					},
				});
			})
	};
	const mapTransactionsToCSV = (transactions: any[]) =>
		transactions.map((txn) => ({
			ID: txn.id,
			Store: txn.store_name,
			Transaction_Type: txn.transaction_type,
			Status: txn.status,
			Order_ID: txn.order_details || '',
			Credit: txn.credit ? formatCurrency(txn.credit) : '',
			Debit: txn.debit ? formatCurrency(txn.debit) : '',
			Balance: txn.balance ? formatCurrency(txn.balance) : '',
			Date: txn.date ? formatWcShortDate(txn.date) : '',
			Narration: txn.narration || '',
		}));
	const downloadTransactionCSVByIds = (selectedIds: number[]) => {
		if (!selectedIds.length) return;

		axios
			.get(getApiLink(appLocalizer, 'transaction'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					ids: selectedIds,
				},
			})
			.then((res) => {
				const data = Array.isArray(res.data) ? res.data : [];

				downloadCSV({
					data: mapTransactionsToCSV(data),
					filename: 'selected-wallet-transactions.csv',
					headers: {
						ID: 'ID',
						Store: 'Store',
						Transaction_Type: 'Transaction Type',
						Status: 'Status',
						Order_ID: 'Order ID',
						Credit: 'Credit',
						Debit: 'Debit',
						Balance: 'Balance',
						Date: 'Date',
						Narration: 'Narration',
					},
				});
			})
	};


	return (
		<>
			<div className="page-title-wrapper">
				<div className="page-title">
					<div className="title">
						{__('Transactions', 'multivendorx')}
					</div>
					<div className="des">
						{__(
							'Track your earnings, withdrawals, and current balance at a glance.',
							'multivendorx'
						)}
					</div>
				</div>
			</div>

			<Container general>
				<Column>
					<TableCard
						headers={headers}
						rows={rows}
						totalRows={totalRows}
						isLoading={isLoading}
						onQueryUpdate={fetchData}
						search={{ placeholder: 'Search...' }}
						filters={filters}
						buttonActions={buttonActions}
						ids={rowIds}
						categoryCounts={categoryCounts}
						bulkActions={[]}
						onSelectCsvDownloadApply={(selectedIds: []) => {
							downloadTransactionCSVByIds(selectedIds)
						}}
					/>

					{modalTransaction && (
						<TransactionDetailsModal
							transaction={modalTransaction}
							onClose={() => setModalTransaction(null)}
						/>
					)}
				</Column>
			</Container>
		</>
	);
};

export default Transactions;
