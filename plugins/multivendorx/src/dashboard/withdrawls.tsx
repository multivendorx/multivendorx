/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	getApiLink,
	Card,
	Container,
	Column,
	FormGroupWrapper,
	FormGroup,
	BasicInputUI,
	ButtonInputUI,
	PopupUI,
	NavigatorHeader,
	ItemListUI,
	NoticeManager,
	TextAreaUI,
} from 'zyra';
import { formatCurrency } from '../services/commonFunction';
interface WithdrawalData {
	available_balance?: number;
	locking_balance?: number;
	thresold?: number;
	payment_schedules?: string;
	free_withdrawal?: number;
	withdrawal_setting?: Array<{
		withdrawal_percentage?: number;
		withdrawal_fixed?: number;
		free_withdrawals?: number;
	}>;
}

interface WithdrawalItem {
	id: number;
	amount: number;
	date: string;
	payment_method: string;
}
const Withdrawls: React.FC = () => {
	const [data, setData] = useState<WithdrawalData>([]);
	const [amount, setAmount] = useState<number>();
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [lastWithdraws, setLastWithdraws] = useState<WithdrawalItem[]>([]);
	const [storeData, setStoreData] = useState(null);

	const [requestWithdrawal, setRequestWithdrawal] = useState(false);

	useEffect(() => {
		axios({
			method: 'GET',
			url: getApiLink(
				appLocalizer,
				`transaction/${appLocalizer.store_id}`
			),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: { id: appLocalizer.store_id },
		}).then((response) => {
			setData(response.data || []);
			setAmount(response.data.available_balance);
		});

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'transaction'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				page: 1,
				row: 5,
				store_id: appLocalizer.store_id,
				transaction_type: 'Withdrawal',
				transaction_status: 'Completed',
				orderBy: 'created_at',
				order: 'DESC',
			},
		})
			.then((response) => {
				setLastWithdraws(response.data.transaction || []);
			})
			.catch(() => setData([]));

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		})
			.then((response) => {
				setStoreData(response.data || {});
			}).catch((err) => console.error(err));
	}, []);

	const handleAmountChange = (value: number) => {
		setAmount(value);

		setErrors(prev => ({
			...prev,
			amount: value > data.available_balance
				? `Amount cannot exceed ${data.available_balance}`
				: ''
		}));
	};

	const handleWithdrawal = () => {
		const newErrors = {};

		if (!storeData?.payment_method || storeData.payment_method === '') {
			newErrors.payment = __('Please configure a valid payment method before requesting a withdrawal.', 'multivendorx');
		}

		if (amount > data.available_balance) {
			newErrors.amount = `Amount cannot be greater than available balance (${data.available_balance})`;
		}

		setErrors(newErrors);
		
		if (Object.keys(newErrors).length > 0) {
			return;
		}
		axios({
			method: 'POST',
			url: getApiLink(
				appLocalizer,
				`transaction/${appLocalizer.store_id}`
			),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: {
				amount: amount,
				store_id: appLocalizer.store_id,
			},
		}).then((res) => {
			if (res.data.success) {
				setRequestWithdrawal(false);
			}
			NoticeManager.add({
				title: __('Great!', 'multivendorx'),
				message: res.data.message,
				type: 'success',
				position: 'float',
			});
		});
	};
	const formatMethod = (method) => {
		if (!method) {
			return '';
		}
		return method
			.replace(/-/g, ' ') // stripe-connect → stripe connect
			.replace(/\b\w/g, (c) => c.toUpperCase()); // Stripe connect → Stripe Connect
	};

	return (
		<>
			<NavigatorHeader
				headerTitle={__('Withdrawals', 'multivendorx')}
				headerDescription={__(
					'View and keep track of your withdrawals.',
					'multivendorx'
				)}
			/>

			<Container>
				<Column grid={6}>
					<Card title={__('Last Withdrawal', 'multivendorx')}>
						{lastWithdraws && lastWithdraws.length > 0 ? (
							lastWithdraws.map((item: WithdrawalItem) => (
								<div
									className="last-withdradal-wrapper"
									key={item.id}
								>
									<div className="left">
										<div className="price">
											{formatCurrency(item.amount)}
										</div>
										<div className="des">
											{item.payment_method ===
												'stripe-connect' &&
												__('Stripe', 'multivendorx')}
											{item.payment_method ===
												'bank-transfer' &&
												__(
													'Direct to Local Bank (INR)',
													'multivendorx'
												)}
											{item.payment_method ===
												'paypal-payout' &&
												__('PayPal', 'multivendorx')}
											{item.payment_method ===
												'bank-transfer'
												? __(
													'Bank Transfer',
													'multivendorx'
												)
												: ''}
										</div>
									</div>
									<div className="right">
										<div className="date">{item.date}</div>
									</div>
								</div>
							))
						) : (
							<div className="no-data">
								{__('No withdrawals found.', 'multivendorx')}
							</div>
						)}

						<ButtonInputUI
							buttons={{
								icon: 'eye',
								text: __(
									'View transaction history',
									'multivendorx'
								),
								onClick: () =>
									(window.location.href = `${appLocalizer.site_url}/dashboard/transactions/`),
							}}
						/>
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
									{formatCurrency(
										data.available_balance
									)}{' '}
								</div>
								<div className="desc">
									<b>{formatCurrency(data?.thresold)} </b>{' '}
									{__(
										'minimum required to withdraw',
										'multivendorx'
									)}
								</div>
								<div className="desc">
									<b>{formatCurrency(data?.reserve_balance)} </b>{' '}
									{__(
										'reserve balance',
										'multivendorx'
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
													{data?.payment_schedules ? (
														<>
															{
																data.payment_schedules
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
												data.locking_balance
											),
										},
									]}
								/>
								{data?.withdrawal_setting?.length > 0 && (
									<ItemListUI
										className="mini-card"
										background
										border
										items={[
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
															data
																?.withdrawal_setting?.[0]
																?.withdrawal_percentage
														) || 0}
														% +{' '}
														{formatCurrency(
															Number(
																data
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
															(data
																?.withdrawal_setting?.[0]
																?.free_withdrawals ??
																0) -
															(data?.free_withdrawal ??
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
										]}
									/>
								)}
							</Column>

							<ButtonInputUI
								buttons={{
									icon: 'withdraw',
									text: __(
										'Request Withdrawal',
										'multivendorx'
									),
									onClick: () => setRequestWithdrawal(true),
								}}
							/>
						</div>
					</Card>
				</Column>
			</Container>

			{requestWithdrawal && (
				<>
					<PopupUI
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
							<ButtonInputUI
								buttons={[
									{
										icon: 'wallet',
										text: __('Disburse', 'multivendorx'),
										color: 'purple',
										onClick: () => handleWithdrawal(),
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
										{formatCurrency(data.available_balance)}
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
										min={0}
										max={data.available_balance}
										onChange={(value) =>
											handleAmountChange(Number(value))
										}
									/>
								</FormGroup>
							</FormGroupWrapper>
						</>
					</PopupUI>
				</>
			)}
		</>
	);
};

export default Withdrawls;
