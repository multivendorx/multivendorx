/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __, sprintf } from '@wordpress/i18n';
import { getApiLink } from '@zyra/core';
import {
	ColumnComponent,
	ContainerComponent,
	FormGroupWrapperComponent,
	FormGroupComponent,
	PopupComponent,
	InformationItemComponent,
} from '@zyra/components';
import {
	TextInput,
	ButtonInput,
	TextAreaInput,
	ToggleInput,
} from '@zyra/inputs';
import { TableCard, TableRow, QueryProps, CategoryCount } from '@zyra/table';

import {
	downloadCSV,
	formatCurrency,
	formatLocalDate,
	formatStatusLabel,
	normalizeText
} from '../../services/commonFunction';
import ViewCommission from '../Commissions/ViewCommission';
import WalletSummary, { type StoreWallet } from './WalletSummary';
import ListGate from '../Popup/ListGate';
import useNoRecordsYet from '../Popup/useNoRecordsYet';
import { SAMPLE_WALLET_TRANSACTIONS } from '../Popup/sampleRows';

interface WalletTransactionProps {
	storeId: number | null;
}

const WalletTransaction: React.FC<WalletTransactionProps> = ({ storeId }) => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [totalRows, setTotalRows] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [categoryCounts, setCategoryCounts] = useState<
		CategoryCount[] | null
	>(null);
	const [wallet, setWallet] = useState<StoreWallet>({});
	const [recentDebits, setRecentDebits] = useState([]);
	const [storeData, setStoreData] = useState(null);
	const [requestWithdrawal, setRequestWithdrawal] = useState(false);
	const [amount, setAmount] = useState<number>(0);
	const [note, setNote] = useState('');

	const [viewCommission, setViewCommission] = useState(false);
	const [paymentMethod, setPaymentMethod] = useState('');
	const [selectedCommissionId, setSelectedCommissionId] = useState<
		number | null
	>(null);
	const [walletLoading, setWalletLoading] = useState(true);
	const [errors, setErrors] = useState<Record<string, string>>({});

	// 🔹 Fetch wallet/transaction overview whenever store changes
	useEffect(() => {
		if (!storeId) {
			return;
		}
		setWalletLoading(true);
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `transactions/${storeId}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		})
			.then((response) => {
				setWallet(response?.data || {});
				setAmount(response?.data.available_balance);
			})
			.finally(() => {
				setWalletLoading(false);
			});

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `stores/${storeId}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		})
			.then((response) => {
				setStoreData(response.data || {});
			})
			.finally(() => {
				setWalletLoading(false);
			});

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'transactions'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				page: 1,
				row: 3,
				store_id: storeId,
				transactionStatus: 'Dr',
				transactionType: 'Withdrawal',
				orderBy: 'created_at',
				order: 'DESC',
				status: 'Completed',
			},
		})
			.then((response) => {
				setRecentDebits(response.data || []);
			})
			.finally(() => {
				setWalletLoading(false);
			})
			.catch((error) => {
				setRecentDebits([]);
				console.error(error);
			});
		doRefreshTableData({});
	}, [storeId]);

	const handleWithdrawal = () => {
		const newErrors = {};

		if (!paymentMethod || paymentMethod === '') {
			newErrors.payment = __(
				'Please configure a valid payment method before requesting a withdrawal.',
				'multivendorx'
			);
		}

		if (amount > wallet.available_balance) {
			newErrors.amount = `Amount cannot be greater than available balance (${wallet.available_balance})`;
		}

		setErrors(newErrors);

		if (Object.keys(newErrors).length > 0) {
			return;
		}
		// Submit request
		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `transactions/${storeId}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: {
				disbursement: true,
				amount,
				store_id: storeId,
				note,
				method: paymentMethod
			},
		})
			.then((res) => {
				if (res.data.success) {
					setRequestWithdrawal(false);
					setTimeout(() => {
						window.location.reload();
					}, 200);
				}
			})
			.catch((err) => {
				console.error(err);
			});
	};

	const AmountChange = (value: number) => {
		setAmount(value);
		setErrors((prev) => ({
			...prev,
			amount:
				value > wallet.available_balance
					? `Amount cannot exceed ${wallet.available_balance}`
					: '',
		}));
	};

	const formatMethod = (method) => {
		if (!method) {
			return '';
		}
		return String(method)
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

	// Explicit palette colors per status, rather than relying on the
	// semantic `badge-${status}` classes (those statuses aren't all
	// covered by that convention, e.g. `upcoming`/`processed`).
	const transactionStatusColors: Record<string, string> = {
		completed: 'green',
		processed: 'blue',
		upcoming: 'yellow',
		failed: 'red',
	};

	const headers = {
		transaction_title: {
			label: __('Transaction', 'multivendorx'),
			// 60 left the three amount columns too little room: Balance ran past the card's edge.
			width: 46,
			render: (row: any) => {
				const isCommissionLink =
					row.transaction_type?.toLowerCase() === 'commission' &&
					row.commission_id;

				return (
					<InformationItemComponent
						title={
							isCommissionLink
								? `Commission #${row.commission_id}`
								: normalizeText(row.narration)
						}
						avatar={{ iconClass: 'wallet' }}
						onClick={
							isCommissionLink
								? () => {
										setSelectedCommissionId(
											row.commission_id
										);
										setViewCommission(true);
									}
								: undefined
						}
						badges={[
							{
								text: formatStatusLabel(row.status),
								className:
									transactionStatusColors[
										row.status?.toLowerCase()
									] ?? 'blue',
							},
						]}
					/>
				);
			},
		},
		credit: {
			label: __('Credit', 'multivendorx'),
			isSortable: true,
			type: 'currency',
		},
		debit: {
			label: __('Debit', 'multivendorx'),
			isSortable: true,
			type: 'currency',
		},
		balance: {
			label: __('Balance', 'multivendorx'),
			isSortable: true,
			type: 'currency',
		},
	};

	// The table folds these fields into one info column, so the CSV
	// export lists its columns explicitly instead of reusing `headers`.
	const csvHeaders = {
		id: { label: __('ID', 'multivendorx') },
		status: { label: __('Status', 'multivendorx') },
		transaction_type: { label: __('Transaction Type', 'multivendorx') },
		created_at: { label: __('Date', 'multivendorx') },
		credit: { label: __('Credit', 'multivendorx') },
		debit: { label: __('Debit', 'multivendorx') },
		balance: { label: __('Balance', 'multivendorx') },
	};

	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);
		axios
			.get(getApiLink(appLocalizer, 'transactions'), {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
				params: buildQueryParams(query),
			})
			.then((response) => {
				const transactions = response.data || [];

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

	const filters = [
		{
			key: 'transactionType',
			label: __('Select Transaction Type', 'multivendorx'),
			type: 'select',
			size: 13,
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
			size: 15,
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

	const downloadTransactionCSV = (selectedIds: number[]) => {
		if (!selectedIds) {
			return;
		}

		axios
			.get(getApiLink(appLocalizer, 'transactions'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: { ids: selectedIds },
			})
			.then((response) => {
				const rows = response.data || [];
				downloadCSV(
					csvHeaders,
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
			.get(getApiLink(appLocalizer, 'transactions'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: buildQueryParams(query, false),
			})
			.then((response) => {
				const rows = response.data || [];

				downloadCSV(
					csvHeaders,
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
			store_id: storeId,
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

	const methods =
		appLocalizer.admin_settings['withdrawal-methods']
			?.payment_methods
		?? [];

	const formattedMethods = Object.entries(methods)
		.filter(([key, method]) => {
			if (!method?.enable) return false;
			if (key === 'cash' || key === 'custom-gateway') return true;
			return key === storeData?.payment_method;
		})
		.map(([key]) => ({
			label: formatMethod(key),
			value: key,
			key: key,
		}));

	const { props: gatedProps, hasNoRecords } = useNoRecordsYet({
		rows,
		isLoading,
		onQueryUpdate: doRefreshTableData,
	});

	const tableProps = {
		headers,
		variant: 'transparent',
		search: { placeholder: 'Search...' },
		filters,
		format: appLocalizer.date_format,
		currency: {
			currencySymbol: appLocalizer.currency_symbol,
			priceDecimals: appLocalizer.price_decimals,
			decimalSeparator: appLocalizer.decimal_separator,
			thousandSeparator: appLocalizer.thousand_separator,
			currencyPosition: appLocalizer.currency_position,
		},
	};

	// No store at all (the site has none yet), or a store with no transactions yet: sample rows behind a card.
	const walletTable = (
		<ListGate
			feature={{
				title: __('Wallet transactions', 'multivendorx'),
				description: '',
				icon: 'wallet',
			}}
			sample={
				<TableCard
					{...tableProps}
					rows={SAMPLE_WALLET_TRANSACTIONS}
					totalRows={SAMPLE_WALLET_TRANSACTIONS.length}
				/>
			}
			isEmpty={!storeId || hasNoRecords}
			empty={
				storeId
					? {
							heading: __('No transactions yet', 'multivendorx'),
							description: __(
								'This store’s wallet records each commission it earns and each payout it receives. They show here after its first sale.',
								'multivendorx'
							),
							actions: (
								<a
									className="mvx-locked-button"
									href="#&tab=commissions"
								>
									{__('View commissions', 'multivendorx')}
								</a>
							),
							note: __(
								'A preview with sample transactions. This store’s show here once it sells.',
								'multivendorx'
							),
						}
					: {
							heading: __('No stores yet', 'multivendorx'),
							description: __(
								'Every store has a wallet: commissions in, payouts out. Its transactions show here once your first store makes a sale.',
								'multivendorx'
							),
							actions: (
								<a
									className="mvx-locked-button"
									href="#&tab=stores"
								>
									{__('Add a store', 'multivendorx')}
								</a>
							),
							note: __(
								'A preview with sample transactions. Yours show here once stores sell.',
								'multivendorx'
							),
						}
			}
		>
			<TableCard
				{...tableProps}
				rows={rows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={gatedProps.onQueryUpdate}
				buttonActions={buttonActions}
				ids={rowIds}
				categoryCounts={categoryCounts}
				bulkActions={[]}
				onSelectCsvDownloadApply={downloadTransactionCSV}
			/>
		</ListGate>
	);

	// Without a store there is no wallet to summarise: just the table preview.
	if (!storeId) {
		return (
			<ContainerComponent>
				<ColumnComponent>{walletTable}</ColumnComponent>
			</ContainerComponent>
		);
	}

	return (
		<>
			<ContainerComponent>
				<ColumnComponent>
					<WalletSummary
						wallet={wallet}
						lastPayout={recentDebits[0]}
						isLoading={walletLoading}
						onPayOut={() => setRequestWithdrawal(true)}
					/>
				</ColumnComponent>
				<PopupComponent
					open={requestWithdrawal}
					onClose={() => setRequestWithdrawal(false)}
					width={28.125}
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
						<ButtonInput
							buttons={[
								{
									icon: 'wallet',
									text: __('Disburse', 'multivendorx'),
									color: 'purple',
									onClick: handleWithdrawal,
								},
							]}
						/>
					}
				>
					<>
						{/* start left section */}
						<FormGroupWrapperComponent>
							<div className="available-balance">
								{__('Withdrawable balance', 'multivendorx')}{' '}
								<div>
									{formatCurrency(wallet.available_balance)}
								</div>
							</div>
							<FormGroupComponent
								label={__('Payment Processor', 'multivendorx')}
								htmlFor="payment_method"
								notice={errors.payment}
							>
								<div className="payment-method">
									<ToggleInput
										options={formattedMethods}
										value={paymentMethod}
										onChange={(value) => setPaymentMethod(value)}
									/>
								</div>
							</FormGroupComponent>

							<FormGroupComponent
								label={__('Amount', 'multivendorx')}
								htmlFor="Amount"
								notice={errors.amount}
							>
								<TextInput
									type="number"
									name="amount"
									value={amount}
									onChange={(value) => {
										AmountChange(Number(value));
									}}
								/>

								<div className="free-wrapper">
									{wallet?.withdrawal_setting?.length > 0 &&
										wallet?.withdrawal_setting?.[0]
											?.free_withdrawals ? (
										<>
											{freeLeft > 0 ? (
												<span>
													{sprintf(
														/* translators: %s: Number of free withdrawals left. */
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
							</FormGroupComponent>
							<FormGroupComponent
								label={__('Note', 'multivendorx')}
								htmlFor="Note"
							>
								<TextAreaInput
									name="note"
									value={note}
									onChange={(value) => setNote(value)}
								/>
							</FormGroupComponent>
						</FormGroupWrapperComponent>
					</>
				</PopupComponent>

				<ColumnComponent>{walletTable}</ColumnComponent>
			</ContainerComponent>
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
