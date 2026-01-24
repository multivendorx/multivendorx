/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __, sprintf } from '@wordpress/i18n';
import {
	Table,
	getApiLink,
	TableCell,
	CommonPopup,
	BasicInput,
	TextArea,
	Column,
	Card,
	Container,
	FormGroupWrapper,
	FormGroup,
	AdminButton,
	MiniCard,
	MultiCalendarInput,
	MessageState,
} from 'zyra';
import {
	ColumnDef,
	RowSelectionState,
	PaginationState,
} from '@tanstack/react-table';
import { formatCurrency, formatLocalDate } from '../../services/commonFunction';
import ViewCommission from '../Commission/viewCommission';
import { Skeleton } from '@mui/material';

type StoreRow = {
	id?: number;
	store_name?: string;
	store_slug?: string;
	status?: string;
	date?: string;
	order_details?: string;
	transaction_type?: string;
	credit?: string;
	debit?: string;
	balance?: string;
	payment_method?: string;
};

interface WalletTransactionProps {
	storeId: number | null;
	dateRange: { startDate: Date | null; endDate: Date | null };
}

export interface RealtimeFilter {
	name: string;
	render: (
		updateFilter: (key: string, value: any) => void,
		filterValue: any
	) => ReactNode;
}

type TransactionStatus = {
	key: string;
	name: string;
	count: number;
};

type FilterData = {
	searchAction?: string;
	searchField?: string;
	categoryFilter?: string;
	store?: string;
	order?: string;
	orderBy?: string;
	date?: {
		start_date: Date;
		end_date: Date;
	};
	transactionType?: string;
	transactionStatus?: string;
};

// CSV Download Button Component for Transactions (Bulk Action)
const DownloadTransactionCSVButton: React.FC<{
	selectedRows: RowSelectionState;
	data: StoreRow[] | null;
	filterData: FilterData;
	storeId: number | null;
	isLoading?: boolean;
}> = ({ selectedRows, data, filterData, storeId, isLoading = false }) => {
	const [isDownloading, setIsDownloading] = useState(false);

	const handleDownload = async () => {
		if (!storeId) {
			alert(__('Please select a store first.', 'multivendorx'));
			return;
		}

		setIsDownloading(true);
		try {
			// Get selected row IDs
			const selectedIds = Object.keys(selectedRows)
				.filter((key) => selectedRows[key])
				.map((key) => {
					const rowIndex = parseInt(key);
					return data?.[rowIndex]?.id;
				})
				.filter((id) => id !== undefined);

			// Prepare parameters for CSV download
			const params: any = {
				format: 'csv',
				store_id: storeId,
			};

			// Add date filters if present
			if (filterData?.date?.start_date) {
				params.start_date = filterData.date.start_date
					.toISOString()
					.split('T')[0];
			}
			if (filterData?.date?.end_date) {
				params.end_date = filterData.date.end_date
					.toISOString()
					.split('T')[0];
			}

			// Add transaction type filter
			if (filterData?.transactionType) {
				params.transaction_type = filterData.transactionType;
			}

			// Add transaction status filter
			if (filterData?.transactionStatus) {
				params.transaction_status = filterData.transactionStatus;
			}

			// Add status filter (Cr/Dr)
			if (filterData?.categoryFilter && filterData.categoryFilter !== 'all') {
				params.filter_status = filterData.categoryFilter;
			}

			// If specific rows are selected, send their IDs
			if (selectedIds.length > 0) {
				params.ids = selectedIds.join(',');
			} else {
				// If no rows selected, export current page data
				params.page = 1; // You might want to get current page from props
				params.row = 10; // You might want to get current page size from props
			}

			// Make API request for CSV
			const response = await axios({
				method: 'GET',
				url: getApiLink(appLocalizer, 'transaction'),
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
					Accept: 'text/csv',
				},
				params: params,
				responseType: 'blob',
			});

			// Create download link
			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement('a');
			link.href = url;

			// Generate filename with timestamp and store ID
			const timestamp = new Date().toISOString().split('T')[0];
			const context = selectedIds.length > 0 ? 'selected' : 'page';
			const filename = `transactions_${context}_store_${storeId}_${timestamp}.csv`;
			link.setAttribute('download', filename);

			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Error downloading CSV:', error);
			alert(
				__('Failed to download CSV. Please try again.', 'multivendorx')
			);
		} finally {
			setIsDownloading(false);
		}
	};

	const hasSelectedRows = Object.keys(selectedRows).some(
		(key) => selectedRows[key]
	);

	return (
		<div className="action-item">
			<button
				onClick={handleDownload}
				disabled={
					isDownloading ||
					isLoading ||
					!storeId ||
					(!hasSelectedRows && !data)
				}
				className="admin-btn"
			>
				<i className="adminfont-download"></i>
				{__('Download CSV', 'multivendorx')}
			</button>
		</div>
	);
};

// Export All CSV Button Component for Transactions - Downloads ALL filtered data
const ExportAllTransactionCSVButton: React.FC<{
	filterData: FilterData;
	storeId: number | null;
}> = ({ filterData, storeId }) => {
	const [isDownloading, setIsDownloading] = useState(false);

	const handleExportAll = async () => {
		if (!storeId) {
			alert(__('Please select a store first.', 'multivendorx'));
			return;
		}

		setIsDownloading(true);
		try {
			// Prepare parameters for CSV download - NO pagination params
			const params: any = {
				format: 'csv',
				store_id: storeId,
			};

			// Add date filters if present
			if (filterData?.date?.start_date) {
				params.start_date = filterData.date.start_date
					.toISOString()
					.split('T')[0];
			}
			if (filterData?.date?.end_date) {
				params.end_date = filterData.date.end_date
					.toISOString()
					.split('T')[0];
			}

			// Add transaction type filter
			if (filterData?.transactionType) {
				params.transaction_type = filterData.transactionType;
			}

			// Add transaction status filter
			if (filterData?.transactionStatus) {
				params.transaction_status = filterData.transactionStatus;
			}

			// Add status filter (Cr/Dr)
			if (filterData?.categoryFilter && filterData.categoryFilter !== 'all') {
				params.filter_status = filterData.categoryFilter;
			}

			// Make API request for CSV
			const response = await axios({
				method: 'GET',
				url: getApiLink(appLocalizer, 'transaction'),
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
					Accept: 'text/csv',
				},
				params: params,
				responseType: 'blob',
			});

			// Create download link
			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement('a');
			link.href = url;

			// Generate filename with timestamp and store ID
			const timestamp = new Date().toISOString().split('T')[0];
			const filename = `transactions_all_store_${storeId}_${timestamp}.csv`;
			link.setAttribute('download', filename);

			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Error downloading CSV:', error);
			alert(
				__('Failed to download CSV. Please try again.', 'multivendorx')
			);
		} finally {
			setIsDownloading(false);
		}
	};

	return (
		<button
			onClick={handleExportAll}
			disabled={isDownloading || !storeId}
			className="admin-btn btn-purple-bg"
		>
			<span className="adminfont-download"></span>
			Download CSV
		</button>
	);
};

// Bulk Actions Component for Transactions
const TransactionBulkActions: React.FC<{
	selectedRows: RowSelectionState;
	data: StoreRow[] | null;
	filterData: FilterData;
	storeId: number | null;
	onActionComplete?: () => void;
}> = ({ selectedRows, data, filterData, storeId, onActionComplete }) => {
	return (
		<div>
			<DownloadTransactionCSVButton
				selectedRows={selectedRows}
				data={data}
				filterData={filterData}
				storeId={storeId}
			/>
		</div>
	);
};

const WalletTransaction: React.FC<WalletTransactionProps> = ({
	storeId,
	dateRange,
}) => {
	const [data, setData] = useState<StoreRow[] | null>(null);
	const [wallet, setWallet] = useState<any[]>([]);
	const [recentDebits, setRecentDebits] = useState<any[]>([]);
	const [storeData, setStoreData] = useState<any>(null);
	const [requestWithdrawal, setRequestWithdrawal] = useState(false);
	const [validationErrors, setValidationErrors] = useState<{
		amount?: string;
		paymentMethod?: string;
	}>({});
	const [amount, setAmount] = useState<number>(0);
	const [note, setNote] = useState<any | ''>('');
	const [paymentMethod, setPaymentMethod] = useState<any | ''>('');

	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [totalRows, setTotalRows] = useState<number>(0);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [pageCount, setPageCount] = useState(0);
	const [transactionStatus, setTransactionStatus] = useState<
		TransactionStatus[] | null
	>(null);
	const [currentFilterData, setCurrentFilterData] = useState<FilterData>({});
	const [viewCommission, setViewCommission] = useState(false);
	const [selectedCommissionId, setSelectedCommissionId] = useState<
		number | null
	>(null);
	const [walletLoading, setWalletLoading] = useState(true);
	const [dateFilter, setDateFilter] = useState<{
		start_date: Date;
		end_date: Date;
	}>({
		start_date: new Date(
			new Date().getFullYear(),
			new Date().getMonth() - 1,
			1
		),
		end_date: new Date(),
	});

	// Add search filter with export button
	const actionButton: RealtimeFilter[] = [
		{
			name: 'actionButton',
			render: () => (
				<>
					<ExportAllTransactionCSVButton
						filterData={currentFilterData}
						storeId={storeId}
					/>
				</>
			),
		},
	];

	// 🔹 Fetch data from backend
	function requestData(
		rowsPerPage: number,
		currentPage: number,
		categoryFilter = '',
		transactionType = '',
		transactionStatus = '',
		orderBy = '',
		order = '',
		startDate = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
		endDate = new Date(),
		searchFiled = ''
	) {
		if (!storeId) {
			return;
		}

		setData(null);

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'transaction'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				page: currentPage,
				row: rowsPerPage,
				store_id: storeId,
				startDate: startDate ? formatLocalDate(startDate) : '',
				endDate: endDate ? formatLocalDate(endDate) : '',
				status: categoryFilter == 'all' ? '' : categoryFilter,
				transaction_status: transactionStatus,
				transaction_type: transactionType,
				orderBy,
				order,
				searchFiled
			},
		})
			.then((response) => {
				setData(response.data.transaction || []);
				setTotalRows(response.data.all || 0);
				setPageCount(Math.ceil(response.data.all / pagination.pageSize));

				const statuses = [
					{ key: 'all', name: 'All', count: response.data.all || 0 },
					{
						key: 'Completed',
						name: 'Completed',
						count: response.data.completed || 0,
					},
					{
						key: 'Processed',
						name: 'Processed',
						count: response.data.processed || 0,
					},
					{
						key: 'Upcoming',
						name: 'Upcoming',
						count: response.data.upcoming || 0,
					},
					{
						key: 'Failed',
						name: 'Failed',
						count: response.data.failed || 0,
					},
				];

				// keep only items whose count is NOT zero
				const filteredStatuses = statuses.filter(
					(item) => item.count !== 0
				);

				setTransactionStatus(filteredStatuses);
			})
			.catch(() => setData([]));
	}

	// 🔹 Handle pagination & date changes
	useEffect(() => {
		const currentPage = pagination.pageIndex + 1;
		requestData(pagination.pageSize, currentPage);
		setPageCount(Math.ceil(totalRows / pagination.pageSize));
	}, [storeId]);

	const requestApiForData = (
		rowsPerPage: number,
		currentPage: number,
		filterData: FilterData
	) => {
		const date = filterData?.date || {
			start_date: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
			end_date: new Date(),
		};
		setDateFilter(date);
		setCurrentFilterData(filterData);
		requestData(
			rowsPerPage,
			currentPage,
			filterData?.categoryFilter,
			filterData?.transactionType,
			filterData?.transactionStatus,
			filterData?.orderBy,
			filterData?.order,
			date?.start_date,
			date?.end_date,
			filterData.searchField,
		);
	};

	// 🔹 Column definitions with Status sorting
	const columns: ColumnDef<StoreRow>[] = [
		{
			id: 'select',
			header: ({ table }) => (
				<input
					type="checkbox"
					checked={table.getIsAllRowsSelected()}
					onChange={table.getToggleAllRowsSelectedHandler()}
				/>
			),
			cell: ({ row }) => (
				<input
					type="checkbox"
					checked={row.getIsSelected()}
					onChange={row.getToggleSelectedHandler()}
				/>
			),
		},
		{
			header: __('ID', 'multivendorx'),
			cell: ({ row }) => <TableCell>#{row.original.id}</TableCell>,
		},
		{
			header: __('Status', 'multivendorx'),
			cell: ({ row }) => {
				return <TableCell type="status" status={row.original.status} />;
			},
		},
		{
			header: __('Transaction Type', 'multivendorx'),
			cell: ({ row }) => {
				const type = row.original.transaction_type?.toLowerCase();
				const commissionId = row.original?.commission_id;
				const formatText = (text: string) =>
					text
						?.replace(/-/g, ' ')
						?.replace(/\b\w/g, (c: string) => c.toUpperCase()) || '-';

				let displayValue = '-';
				let content: string = displayValue;

				// Commission Transaction (clickable)
				if (type === 'commission') {
					displayValue = `Commission #${commissionId}`;
					content = commissionId ? (
						<span
							className="link-item"
							onClick={() => {
								setSelectedCommissionId(commissionId);
								setViewCommission(true);
							}}
						>
							{displayValue}
						</span>
					) : (
						displayValue
					);
				} else if (row.original.transaction_type) {
					displayValue = formatText(row.original.narration);
					content = displayValue;
				}

				return <TableCell title={displayValue}>{content}</TableCell>;
			},
		},
		{
			id: 'date',
			accessorKey: 'date',
			enableSorting: true,
			header: __('Date', 'multivendorx'),
			cell: ({ row }) => {
				const rawDate = row.original.date;
				let formattedDate = '-';
				if (rawDate) {
					const dateObj = new Date(rawDate);
					formattedDate = new Intl.DateTimeFormat('en-US', {
						month: 'short',
						day: 'numeric',
						year: 'numeric',
					}).format(dateObj);
				}
				return (
					<TableCell title={formattedDate}>{formattedDate}</TableCell>
				);
			},
		},
		{
			header: __('Credit', 'multivendorx'),
			cell: ({ row }) => {
				const credit = row.original.credit;
				return (
					<TableCell>
						{credit ? formatCurrency(credit) : '-'}
					</TableCell>
				);
			},
		},
		{
			header: __('Debit', 'multivendorx'),
			cell: ({ row }) => {
				const debit = row.original.debit;
				return (
					<TableCell>{debit ? formatCurrency(debit) : '-'}</TableCell>
				);
			},
		},
		{
			header: __('Balance', 'multivendorx'),
			cell: ({ row }) => {
				const balance = row.original.balance;
				return (
					<TableCell>
						{balance ? formatCurrency(balance) : '-'}
					</TableCell>
				);
			},
		},
	];

	const realtimeFilter: RealtimeFilter[] = [
		{
			name: 'transactionType',
			render: (
				updateFilter: (key: string, value: string) => void,
				filterValue: string | undefined
			) => (
				<div className="group-field">
					<select
						name="transactionType"
						onChange={(e) =>
							updateFilter(e.target.name, e.target.value)
						}
						value={filterValue || ''}
						className="basic-select"
					>
						<option value="">
							{__('Transaction Type', 'multivendorx')}
						</option>
						<option value="Commission">
							{__('Commission', 'multivendorx')}
						</option>
						<option value="Withdrawal">
							{__('Withdrawal', 'multivendorx')}
						</option>
						<option value="Refund">
							{__('Refund', 'multivendorx')}
						</option>
						<option value="Reversed">
							{__('Reversed', 'multivendorx')}
						</option>
						<option value="COD received">
							{__('COD received', 'multivendorx')}
						</option>
					</select>
				</div>
			),
		},
		{
			name: 'transactionStatus',
			render: (
				updateFilter: (key: string, value: string) => void,
				filterValue: string | undefined
			) => (
				<div className="group-field">
					<select
						name="transactionStatus"
						onChange={(e) =>
							updateFilter(e.target.name, e.target.value)
						}
						value={filterValue || ''}
						className="basic-select"
					>
						<option value="">
							{__('Financial Transactions', 'multivendorx')}
						</option>
						<option value="Cr">
							{__('Credit', 'multivendorx')}
						</option>
						<option value="Dr">
							{__('Debit', 'multivendorx')}
						</option>
					</select>
				</div>
			),
		},
		{
			name: 'date',
			render: (updateFilter) => (
				<MultiCalendarInput
					value={{
						startDate: dateFilter.start_date,
						endDate: dateFilter.end_date,
					}}
					onChange={(range: { startDate: Date; endDate: Date }) => {
						const next = {
							start_date: range.startDate,
							end_date: range.endDate,
						};

						setDateFilter(next);
						updateFilter('date', next);
					}}
				/>
			),
		},
	];
	const searchFilter: RealtimeFilter[] = [
		{
			name: 'searchField',
			render: (updateFilter, filterValue) => (
				<>
					<div className="search-section">
						<input
							name="searchField"
							type="text"
							placeholder={__('Search', 'multivendorx')}
							onChange={(e) => {
								updateFilter(e.target.name, e.target.value);
							}}
							value={filterValue || ''}
							className="basic-input"
						/>
						<i className="adminfont-search"></i>
					</div>
				</>
			),
		},
	];
	// 🔹 Fetch wallet/transaction overview whenever store changes
	useEffect(() => {
		if (!storeId) {
			return;
		}
		setWalletLoading(true);
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `transaction/${storeId}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((response) => {
			setWallet(response?.data || {});
			setAmount(response?.data.available_balance);
		}).finally(() => {
			setWalletLoading(false);
		});

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `store/${storeId}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((response) => {
			setStoreData(response.data || {});
		}).finally(() => {
			setWalletLoading(false);
		});

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'transaction'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				page: 1,
				row: 3,
				store_id: storeId,
				filter_status: 'Dr',
				transaction_type: 'Withdrawal',
				orderBy: 'created_at',
				order: 'DESC',
				status: 'Completed'
			},
		})
			.then((response) => {
				setRecentDebits(response.data.transaction || []);
			}).finally(() => {
				setWalletLoading(false);
			})
			.catch((error) => {
				setRecentDebits([]);
			});
	}, [storeId]);

	const handleWithdrawal = () => {
		// Clear all old errors first
		setValidationErrors({});

		const newErrors: { amount?: string; paymentMethod?: string } = {};
		// Amount validations
		if (!amount || amount <= 0) {
			newErrors.amount = 'Please enter a valid amount.';
		} else if (amount > (wallet.available_balance ?? 0)) {
			newErrors.amount = `Amount cannot be greater than available balance (${formatCurrency(
				wallet.available_balance
			)})`;
		}

		// Payment method validation
		if (!storeData.payment_method) {
			newErrors.paymentMethod = 'Please select a payment processor.';
		}

		// If any validation errors exist, show them and stop
		if (Object.keys(newErrors).length > 0) {
			setValidationErrors(newErrors);
			return;
		}

		// Submit request
		axios({
			method: 'PUT',
			url: getApiLink(
				appLocalizer,
				`transaction/${storeId}`
			),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: {
				disbursement: true,
				amount,
				store_id: storeId,
				method: paymentMethod,
				note,
			},
		})
			.then((res) => {
				if (res.data.success) {
					setRequestWithdrawal(false);
					setTimeout(() => {
						window.location.reload();
					}, 200);
				} else if (res.data?.message) {
				}
			})
			.catch((err) => {
				console.error(err);
			});
	};

	const AmountChange = (value: number) => {
		setAmount(value);
	};

	const formatMethod = (method) => {
		if (!method) {
			return '';
		}
		return method
			.replace(/-/g, ' ') // stripe-connect → stripe connect
			.replace(/\b\w/g, (c) => c.toUpperCase()); // Stripe connect → Stripe Connect
	};

	const freeLeft =
		wallet?.withdrawal_setting?.[0]?.free_withdrawals -
		wallet?.free_withdrawal;
	const percentage = Number(
		wallet?.withdrawal_setting?.[0]?.withdrawal_percentage || 0
	);
	const fixed = Number(
		wallet?.withdrawal_setting?.[0]?.withdrawal_fixed || 0
	);

	// fee calculation
	const fee = amount * (percentage / 100) + fixed;
	return (
		<>
			<Container>
				<Column grid={6}>
					<Card title="Recent payouts">
						{recentDebits.length > 0 ? (
							<>
								{recentDebits.slice(0, 5).map((txn) => {
									// Format payment method nicely (e.g., "stripe-connect" -> "Stripe Connect")
									const formattedPaymentMethod =
										txn.payment_method
											? txn.payment_method
												.replace(/[-_]/g, ' ') // replace - and _ with spaces
												.replace(/\b\w/g, (char) =>
													char.toUpperCase()
												) // capitalize each word
											: __('No Payment Method Selected', 'multivendorx');

									return (
										<div key={txn.id} className="info-item">
											<div className="details-wrapper">
												<div className="details">
													<div className="name">
														{formattedPaymentMethod}
														<div className="admin-badge green">Completed</div>
													</div>
													<div className="des">
														{new Date(
															txn.date
														).toLocaleDateString(
															'en-US',
															{
																month: 'short',
																day: '2-digit',
																year: 'numeric',
															}
														)}
													</div>
												</div>
											</div>

											<div
												className="right-details"
											>
												<div
													className={`price ${parseFloat(txn.debit) <
														0
														? 'color-red'
														: 'color-green'
														}`}
												>
													{formatCurrency(txn.debit)}
												</div>
											</div>
										</div>
									);
								})}
							</>
						) : (
							<MessageState title={__('No recent payouts transactions found.', 'multivendorx')} />
						)}
					</Card>
				</Column>

				<Column grid={6}>
					<Card>
						<div className="payout-card-wrapper">
							<div className="price-wrapper">
								<div className="admin-badge green">
									{__(
										'Ready to withdraw',
										'multivendorx'
									)}
								</div>
								<div className="price">
									{walletLoading ? (
										<Skeleton variant="text" width={140} height={60} />
									) : (
										formatCurrency(wallet.available_balance)
									)}
								</div>
								<div className="desc">
									{walletLoading ? (
										<Skeleton variant="text" width={250} height={20} />
									) : (
										<>
											<b> {formatCurrency(wallet?.thresold)} </b>
											{__('minimum required to withdraw', 'multivendorx')}
										</>
									)}
								</div>
							</div>
							<Column row>
								<MiniCard background
									title={__('Upcoming Balance', 'multivendorx')}
									value={formatCurrency(wallet.locking_balance)}
									isLoading={walletLoading}
									description={
										<>
											{__('This amount is being processed and will be released ', 'multivendorx')}
											{wallet?.payment_schedules ? (
												<>
													{wallet.payment_schedules} {__(' by the admin.', 'multivendorx')}
												</>
											) : (
												<>
													{__('automatically every hour.', 'multivendorx')}
												</>
											)}
										</>
									}
								/>

								{wallet?.withdrawal_setting?.length > 0 && (
									<MiniCard background
										title={__('Free Withdrawals', 'multivendorx')}

										value={
											<>
												{Math.max(
													0,
													(wallet?.withdrawal_setting?.[0]?.free_withdrawals ?? 0) -
													(wallet?.free_withdrawal ?? 0)
												)}{' '}
												<span>{__('Left', 'multivendorx')}</span>
											</>
										}
										description={
											<>
												{__('Then', 'multivendorx')}{' '}
												{Number(
													wallet?.withdrawal_setting?.[0]
														?.withdrawal_percentage
												) || 0}
												% +{' '}
												{formatCurrency(
													Number(
														wallet?.withdrawal_setting?.[0]
															?.withdrawal_fixed
													) || 0
												)}{' '}
												{__('fee', 'multivendorx')}
											</>
										}
									/>

								)}
							</Column>
							<AdminButton
								buttons={
									{
										icon: 'wallet',
										text: __('Disburse Payment', 'multivendorx'),
										className: 'purple-bg',
										onClick: () => setRequestWithdrawal(true),
									}}
							/>
						</div>
					</Card>
				</Column>

				<CommonPopup
					open={requestWithdrawal}
					onClose={() => setRequestWithdrawal(null)}
					width="28.125rem"
					height="75%"
					header={{
						icon: 'wallet',
						title: __('Disburse payment', 'multivendorx'),
						description: __(
							'Release earnings to your stores in a few simple steps - amount, payment processor, and an optional note.',
							'multivendorx'
						),
					}}
					footer={
						<AdminButton
							buttons={[
								{
									icon: 'wallet',
									text: __('Disburse', 'multivendorx'),
									className: 'purple',
									onClick: handleWithdrawal,
								},
							]}
						/>
					}

				>
					<>
						{/* start left section */}
						<FormGroupWrapper>
							<div className="available-balance">
								{__('Withdrawable balance', 'multivendorx')}{' '}
								<div>
									{formatCurrency(wallet.available_balance)}
								</div>
							</div>
							<FormGroup label={__('Payment Processor', 'multivendorx')} htmlFor="payment_method">
								<div className="payment-method">
									{storeData?.payment_method ? (
										<div className="method">
											<i className="adminfont-bank"></i>
											{formatMethod(storeData.payment_method)}
										</div>
									) : (
										<span>
											{__(
												'No payment method saved',
												'multivendorx'
											)}
										</span>
									)}
								</div>
							</FormGroup>

							<FormGroup label={__('Amount', 'multivendorx')} htmlFor="Amount">
								<BasicInput
									type="number"
									name="amount"
									value={amount}
									onChange={(e: any) =>
										AmountChange(Number(e.target.value))
									}
								/>

								<div className="free-wrapper">
									{wallet?.withdrawal_setting?.length > 0 &&
										wallet?.withdrawal_setting?.[0]
											?.free_withdrawals ? (
										<>
											{freeLeft > 0 ? (
												<span>
													{sprintf(
														__(
															'Burning 1 out of %s free withdrawals',
															'multivendorx'
														),
														freeLeft
													)}
												</span>
											) : (
												<span>
													{__(
														'Free withdrawal limit reached',
														'multivendorx'
													)}
												</span>
											)}
											<span>
												{__('Total:', 'multivendorx')}{' '}
												{formatCurrency(amount || 0)}
											</span>
											<span>
												{__('Fee:', 'multivendorx')}{' '}
												{formatCurrency(fee)}
											</span>
										</>
									) : (
										<span>
											{__(
												'Actual withdrawal:',
												'multivendorx'
											)}{' '}
											{formatCurrency(amount || 0)}
										</span>
									)}
								</div>

								{validationErrors.amount && (
									<div className="invalid-massage">
										{validationErrors.amount}
									</div>
								)}
							</FormGroup>
							<FormGroup label={__('Note', 'multivendorx')} htmlFor="Note">
								<TextArea
									name="note"
									value={note}
									onChange={(
										e: React.ChangeEvent<HTMLTextAreaElement>
									) => setNote(e.target.value)}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</>
				</CommonPopup>

				<Column>
					<div className="admin-table-wrapper admin-pt-2">
						<Table
							data={data}
							columns={columns as ColumnDef<Record<string, any>, any>[]}
							rowSelection={rowSelection}
							onRowSelectionChange={setRowSelection}
							defaultRowsPerPage={10}
							pageCount={pageCount}
							pagination={pagination}
							onPaginationChange={setPagination}
							handlePagination={requestApiForData}
							perPageOption={[10, 25, 50]}
							categoryFilter={transactionStatus as TransactionStatus[]}
							totalCounts={totalRows}
							searchFilter={searchFilter}
							realtimeFilter={realtimeFilter}
							actionButton={actionButton}
							bulkActionComp={() => (
								<TransactionBulkActions
									selectedRows={rowSelection}
									data={data}
									filterData={currentFilterData}
									storeId={storeId}
								/>
							)}
						/>
					</div>
				</Column>
			</Container>
			{viewCommission && selectedCommissionId !== null && (
				<ViewCommission
					open={viewCommission}
					onClose={() => setViewCommission(false)}
					commissionId={selectedCommissionId}
				/>
			)}
		</>
	);
};

export default WalletTransaction;
