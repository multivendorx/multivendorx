/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __, sprintf } from '@wordpress/i18n';
import {
	getApiLink,
	Column,
	Card,
	Container,
	FormGroupWrapper,
	FormGroup,
	ComponentStatusView,
	Skeleton,
	TableCard,
	BasicInputUI,
	AdminButtonUI,
	PopupUI,
	TextAreaUI,
	ItemList,
	TableRow,
	QueryProps,
	CategoryCount,
} from 'zyra';

import {
	downloadCSV,
	formatCurrency,
	formatLocalDate,
} from '../../services/commonFunction';
import ViewCommission from '../Commissions/ViewCommission';

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

	const [viewCommission, setViewCommission] = useState(false);
	const [selectedCommissionId, setSelectedCommissionId] = useState<
		number | null
	>(null);
	const [walletLoading, setWalletLoading] = useState(true);

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
			url: getApiLink(appLocalizer, `store/${storeId}`),
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
			url: getApiLink(appLocalizer, 'transaction'),
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
				setRecentDebits(response.data.transaction || []);
			})
			.finally(() => {
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
			url: getApiLink(appLocalizer, `transaction/${storeId}`),
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

	const headers = {
		id: { label: __('ID', 'multivendorx') },
		status: { label: __('Status', 'multivendorx'), type: 'status' },
		transaction_type: {
			label: __('Transaction Type', 'multivendorx'),
			render: (row) =>
				row.transaction_type?.toLowerCase() === 'commission' &&
				row.commission_id ? (
					<span
						className="link-item"
						onClick={() => {
							setSelectedCommissionId(row.commission_id);
							setViewCommission(true);
						}}
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
		created_at: { label: __('Date', 'multivendorx'), type: 'date' },
		credit: { label: __('Credit', 'multivendorx'), type: 'currency' },
		debit: { label: __('Debit', 'multivendorx'), type: 'currency' },
		balance: {
			label: __('Balance', 'multivendorx'),
			isSortable: true,
			type: 'currency',
		},
	};

	const doRefreshTableData = (query: QueryProps) => {
		console.log(query);
		setIsLoading(true);
		axios
			.get(getApiLink(appLocalizer, 'transaction'), {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
				params: buildQueryParams(query),
			})
			.then((response) => {
				const transactions = response.data || [];

				const ids: number[] = transactions.map((t: any) =>
					Number(t.id)
				);
				setRowIds(ids);
				setRows(transactions);
				setCategoryCounts([
					{
						value: 'all',
						label: 'All',
						count: Number(response.headers['x-wp-total']) || 0,
					},
					{
						value: 'completed',
						label: 'Completed',
						count:
							Number(response.headers['x-wp-status-completed']) ||
							0,
					},
					{
						value: 'processed',
						label: 'Processed',
						count:
							Number(response.headers['x-wp-status-processed']) ||
							0,
					},
					{
						value: 'upcoming',
						label: 'Upcoming',
						count:
							Number(response.headers['x-wp-status-upcoming']) ||
							0,
					},
					{
						value: 'vailed',
						label: 'Failed',
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
		const params: Record<string, any> = {
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
											: __(
													'No Payment Method Selected',
													'multivendorx'
												);

									return (
										<div key={txn.id} className="info-item">
											<div className="details-wrapper">
												<div className="details">
													<div className="name">
														{formattedPaymentMethod}
														<div className="admin-badge green">
															Completed
														</div>
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

											<div className="right-details">
												<div
													className={`price ${
														parseFloat(txn.debit) <
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
							<ComponentStatusView
								title={__(
									'No recent payouts transactions found.',
									'multivendorx'
								)}
							/>
						)}
					</Card>
				</Column>

				<Column grid={6}>
					<Card>
						<div className="payout-card-wrapper">
							<div className="price-wrapper">
								<div className="admin-badge green">
									{__('Ready to withdraw', 'multivendorx')}
								</div>
								<div className="price">
									{walletLoading ? (
										<Skeleton width={140} />
									) : (
										formatCurrency(wallet.available_balance)
									)}
								</div>
								<div className="desc">
									{walletLoading ? (
										<Skeleton width={250} />
									) : (
										<>
											<b>
												{' '}
												{formatCurrency(
													wallet?.thresold
												)}{' '}
											</b>
											{__(
												'minimum required to withdraw',
												'multivendorx'
											)}
										</>
									)}
								</div>
							</div>
							<Column row>
								<ItemList
									className="mini-card"
									background
									items={[
										{
											title: __(
												'Upcoming Balance',
												'multivendorx'
											),
											desc: (
												<>
													{__(
														'This amount is being processed and will be released ',
														'multivendorx'
													)}
													{wallet?.payment_schedules ? (
														<>
															{wallet.payment_schedules}{' '}
															{__(' by the admin.', 'multivendorx')}
														</>
													) : (
														<>
															{__(
																'automatically every hour.',
																'multivendorx'
															)}
														</>
													)}
												</>
											),
											value: formatCurrency(wallet.locking_balance),
										},

										...(wallet?.withdrawal_setting?.length > 0
											? [
												{
													title: __('Free Withdrawals', 'multivendorx'),
													desc: (
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
													),
													value: (
														<>
															{Math.max(
																0,
																(wallet?.withdrawal_setting?.[0]?.free_withdrawals ?? 0) -
																(wallet?.free_withdrawal ?? 0)
															)}{' '}
															<span>{__('Left', 'multivendorx')}</span>
														</>
													),
												},
											]
											: []),
									]}
								/>
							</Column>
							<AdminButtonUI
								buttons={{
									icon: 'wallet',
									text: __(
										'Disburse Payment',
										'multivendorx'
									),
									onClick: () => setRequestWithdrawal(true),
								}}
							/>
						</div>
					</Card>
				</Column>

				<PopupUI
					open={requestWithdrawal}
					onClose={() => setRequestWithdrawal(null)}
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
						<AdminButtonUI
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
						<FormGroupWrapper>
							<div className="available-balance">
								{__('Withdrawable balance', 'multivendorx')}{' '}
								<div>
									{formatCurrency(wallet.available_balance)}
								</div>
							</div>
							<FormGroup
								label={__('Payment Processor', 'multivendorx')}
								htmlFor="payment_method"
							>
								<div className="payment-method">
									{storeData?.payment_method ? (
										<div className="method">
											<i className="adminfont-bank"></i>
											{formatMethod(
												storeData.payment_method
											)}
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

							<FormGroup
								label={__('Amount', 'multivendorx')}
								htmlFor="Amount"
							>
								<BasicInputUI
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
							<FormGroup
								label={__('Note', 'multivendorx')}
								htmlFor="Note"
							>
								<TextAreaUI
									name="note"
									value={note}
									onChange={(
										e: React.ChangeEvent<HTMLTextAreaElement>
									) => setNote(e.target.value)}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</>
				</PopupUI>

				<Column>
					<div className="admin-table-wrapper admin-pt-2">
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
								decimalSeparator:
									appLocalizer.decimal_separator,
								thousandSeparator:
									appLocalizer.thousand_separator,
								currencyPosition:
									appLocalizer.currency_position,
							}}
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
