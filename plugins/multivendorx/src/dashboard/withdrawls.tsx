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
	const [store, setStore] = useState<any>([]);
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
		});
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: { id: appLocalizer.store_id },
		}).then((response) => {
			setStore(response.data);
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
								onClick: () => (window.location.href = `${appLocalizer.site_url}/dashboard/wallet/transactions/`),
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
									<b>$25 (p)</b>{' '}
									{__(
										'minimum required to withdraw',
										'multivendorx'
									)}
								</div>
							</div>
							<Column row>
								<MiniCard
									background
									title={__('Upcoming Balance', 'multivendorx')}
									value={formatCurrency(data.reserve_balance)}
									description={__(
										'Pending settlement. Released soon',
										'multivendorx'
									)}
								/>
								<MiniCard
									background
									title={__('Free Withdrawals', 'multivendorx')}
									value={
										<>
											{data.locking_day} {__('Days', 'multivendorx')}{' '}
											<span>{__('Left', 'multivendorx')}</span>
										</>
									}
									description={
										<>
											{__('Then', 'multivendorx')} $5% (p) + $6(p) {__('fee', 'multivendorx')}
										</>
									}
								/>

							</Column>

							<div className="desc">
								{__(
									'Some funds locked during settlement',
									'multivendorx'
								)}
							</div>
							<div className="desc">
								{__('Auto payouts run', 'multivendorx')} 2-12-25
								(p)
							</div>

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
					<>
						<FormGroupWrapper>
							<FormGroup label={__('Amount', 'multivendorx')} htmlFor="Amount">
								<BasicInput
									type="number"
									name="amount"
									value={amount}
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
					</>
				</CommonPopup>
			)}
		</>
	);
};

export default Withdrawls;
