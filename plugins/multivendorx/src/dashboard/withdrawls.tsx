import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink, CommonPopup, BasicInput, SuccessNotice, Card, Container, AdminButton, Column, FormGroupWrapper, FormGroup, MiniCard } from 'zyra';
import { formatCurrency, formatWcShortDate } from '../services/commonFunction';

const Withdrawls: React.FC = () => {
	const [data, setData] = useState<any>([]);
	const [amount, setAmount] = useState<number>();
	const [error, setError] = useState<string>('');
	const [message, setMessage] = useState<string>('');
	const [lastWithdraws, setLastWithdraws] = useState<any>([]);

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
	}, []);

	const handleAmountChange = (value: number) => {
		if (value > data.available_balance) {
			setError(
				`Amount cannot be greater than available balance (${data.available_balance})`
			);
		} else {
			setError('');
		}
		setAmount(value);
	};

	const handleWithdrawal = () => {
		if (amount > data.available_balance) {
			setError(
				`Amount cannot be greater than available balance (${data.available_balance})`
			);
			setRequestWithdrawal(true);
			return;
		}

		axios({
			method: 'PUT',
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
			setMessage(res.data.message);
		});
	};
	return (
		<>
			<SuccessNotice message={message} />
			<div className="page-title-wrapper">
				<div className="page-title">
					<div className="title">
						{__('Withdrawals', 'multivendorx')}
					</div>
					<div className="des">
						{__(
							'View and keep track of your withdrawals.',
							'multivendorx'
						)}
					</div>
				</div>
			</div>

			<Container >
				<Column grid={6}>
					<Card title={__('Last Withdrawal', 'multivendorx')}>
						{lastWithdraws && lastWithdraws.length > 0 ? (
							lastWithdraws.map((item: any) => (
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
										<div className="date">
											{formatWcShortDate(item.date)}
										</div>
									</div>
								</div>
							))
						) : (
							<div className="no-data">
								{__('No withdrawals found.', 'multivendorx')}
							</div>
						)}

						<AdminButton
							buttons={{
								icon: 'eye',
								text: __('View transaction history', 'multivendorx'),
								onClick: () => (window.location.href = `${appLocalizer.site_url}/dashboard/transactions/`),
								className: 'purple-bg',
							}}
						/>
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
									{formatCurrency(data.available_balance)}{' '}
								</div>
								<div className="desc">
									<b>{formatCurrency(data?.thresold)} </b>{' '}
									{__(
										'minimum required to withdraw',
										'multivendorx'
									)}
								</div>
							</div>
							<Column row>
								<MiniCard background
									title={__('Upcoming Balance', 'multivendorx')}
									value={formatCurrency(data.locking_balance)}
									description={
										<>
											{__('This amount is being processed and will be released ', 'multivendorx')}
											{data?.payment_schedules ? (
												<>
													{data.payment_schedules} {__(' by the admin.', 'multivendorx')}
												</>
											) : (
												<>
													{__('automatically every hour.', 'multivendorx')}
												</>
											)}
										</>
									}
								/>
								{data?.withdrawal_setting?.length > 0 && (
									<MiniCard background
										title={__('Free Withdrawals', 'multivendorx')}
										value={
											<>
												{(data?.withdrawal_setting?.[0]?.free_withdrawals ?? 0) -
													(data?.free_withdrawal ?? 0)}{' '}
												<span>{__('Left', 'multivendorx')}</span>
											</>
										}
										description={
											<>
												{__('Then', 'multivendorx')}{' '}
												{Number(
													data?.withdrawal_setting?.[0]
														?.withdrawal_percentage
												) || 0}
												% +{' '}
												{formatCurrency(
													Number(
														data?.withdrawal_setting?.[0]
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
								buttons={{
									icon: 'withdraw',
									text: __('Request Withdrawal', 'multivendorx'),
									onClick: () => setRequestWithdrawal(true),
									className: 'purple-bg',
								}}
							/>
						</div>
					</Card>
				</Column>
			</Container>

			{requestWithdrawal && (
				<CommonPopup
					open={requestWithdrawal}
					width="31.25rem"
					height="40%"
					onClose={() => setRequestWithdrawal(false)}
					header={{
						icon: 'wallet',
						title: __('Request Withdrawal', 'multivendorx'),
					}}
					footer={
						<>
							<AdminButton
								buttons={{
									icon: 'withdraw',
									text: __('Disburse', 'multivendorx'),
									onClick: () => handleWithdrawal(),
									className: 'purple-bg',
								}}
							/>
						</>
					}
				>
					<FormGroupWrapper>
						<FormGroup label={__('Amount', 'multivendorx')} htmlFor="Amount">
							<BasicInput
								type="number"
								name="amount"
								value={amount}
								min={0}
								max={data.available_balance}
								onChange={(e) =>
									handleAmountChange(
										Number(e.target.value)
									)
								}
							/>
							{error && (
								<p className="error-message">{error}</p>
							)}
						</FormGroup>
					</FormGroupWrapper>
				</CommonPopup>
			)}
		</>
	);
};

export default Withdrawls;
