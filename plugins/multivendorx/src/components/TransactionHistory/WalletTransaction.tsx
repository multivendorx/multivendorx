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
	ButtonInputUI,
	PopupUI,
	TextAreaUI,
	TableRow,
	QueryProps,
	CategoryCount,
	ItemListUI,
} from 'zyra';

import {
	downloadCSV,
	formatCurrency,
	formatDate,
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
	const [wallet, setWallet] = useState([]);
	const [recentDebits, setRecentDebits] = useState([]);
	const [storeData, setStoreData] = useState(null);
	const [requestWithdrawal, setRequestWithdrawal] = useState(false);
	const [amount, setAmount] = useState<number>(0);
	const [note, setNote] = useState('');

	const [viewCommission, setViewCommission] = useState(false);
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
				setRecentDebits(response.data || []);
			})
			.finally(() => {
				setWalletLoading(false);
			})
			.catch((error) => {
				setRecentDebits([]);
				console.error(error);
			});
	}, [storeId]);

	const handleWithdrawal = () => {
		const newErrors = {};

		if (!storeData?.payment_method || storeData.payment_method === '') {
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
			url: getApiLink(appLocalizer, `transaction/${storeId}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: {
				disbursement: true,
				amount,
				store_id: storeId,
				note,
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
		id: { label: __('ID', 'multivendorx'), type: 'id' },
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
			label: 'Transaction Type',
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
				<Column fullHeight grid={6}>
					<Card title="Recent payouts">
						{recentDebits.length > 0 ? (
							<ItemListUI
								className="mini-card"
								items={recentDebits.slice(0, 5).map((txn) => {
									const hasPaymentMethod = !!txn.payment_method;
									// Format payment method nicely (e.g., "stripe-connect" -> "Stripe Connect")
									const formattedPaymentMethod = txn.payment_method
										? txn.payment_method
											.replace(/[-_]/g, ' ') // replace - and _ with spaces
											.replace(/\b\w/g, (char) => char.toUpperCase()) // capitalize each word
										: __('No payment method configured', 'multivendorx');

									return {
										title: formattedPaymentMethod,
										desc: formatDate(txn.created_at),
										tags: (
											<>
												{hasPaymentMethod && (
													<div className="admin-badge green">
														{__('Completed', 'multivendorx')}
													</div>
												)}
												<div
													className={`price ${
														parseFloat(txn.debit) < 0
															? 'color-red'
															: 'color-green'
													}`}
												>
													{formatCurrency(txn.debit)}
												</div>
											</>
										),
									};
								})}
							/>
						) : (
							<ComponentStatusView
								title={__('No recent payouts transactions found.', 'multivendorx')}
							/>
						)}
					</Card>
				</Column>

				<Column fullHeight grid={6}>
					<Card>
						<div className="payout-card-wrapper">
							<div className="price-wrapper">
								<div className="admin-badge green">
									{__('Ready to withdraw', 'multivendorx')}
								</div>
								<div className="price">
									{walletLoading ? (
										<Skeleton width={8.75} />
									) : (
										formatCurrency(wallet.available_balance)
									)}
								</div>
								<div className="desc">
									{walletLoading ? (
										<Skeleton width={15.625} />
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
								<div className="desc">
									{walletLoading ? (
										<Skeleton width={15.625} />
									) : (
										<>
											<b>
												{' '}
												{formatCurrency(
													wallet?.reserve_balance
												)}{' '}
											</b>
											{__(
												'reserve balance',
												'multivendorx'
											)}
										</>
									)}
								</div>
							</div>
							<Column row>
								<ItemListUI
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
															{
																wallet.payment_schedules
															}{' '}
															{__(
																' by the admin.',
																'multivendorx'
															)}
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
											value: formatCurrency(
												wallet.locking_balance
											),
										},

										...(wallet?.withdrawal_setting?.length >
										0
											? [
													{
														title: __(
															'Free Withdrawals',
															'multivendorx'
														),
														desc: (
															<>
																{__(
																	'Then',
																	'multivendorx'
																)}{' '}
																{Number(
																	wallet
																		?.withdrawal_setting?.[0]
																		?.withdrawal_percentage
																) || 0}
																% +{' '}
																{formatCurrency(
																	Number(
																		wallet
																			?.withdrawal_setting?.[0]
																			?.withdrawal_fixed
																	) || 0
																)}{' '}
																{__(
																	'fee',
																	'multivendorx'
																)}
															</>
														),
														value: (
															<>
																{Math.max(
																	0,
																	(wallet
																		?.withdrawal_setting?.[0]
																		?.free_withdrawals ??
																		0) -
																		(wallet?.free_withdrawal ??
																			0)
																)}{' '}
																<span>
																	{__(
																		'Left',
																		'multivendorx'
																	)}
																</span>
															</>
														),
													},
												]
											: []),
									]}
								/>
							</Column>
							<ButtonInputUI
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
						<ButtonInputUI
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
								notice={errors.payment}
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
								notice={errors.amount}
							>
								<BasicInputUI
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
							</FormGroup>
							<FormGroup
								label={__('Note', 'multivendorx')}
								htmlFor="Note"
							>
								<TextAreaUI
									name="note"
									value={note}
									onChange={(value) => setNote(value)}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</>
				</PopupUI>

				<Column>
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
