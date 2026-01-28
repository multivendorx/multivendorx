import React from 'react';
import { __ } from '@wordpress/i18n';
import { CommonPopup, FormGroup, FormGroupWrapper } from 'zyra';
import { formatCurrency, formatWcShortDate } from '@/services/commonFunction';

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

type Props = {
	transaction: TransactionRow;
	onClose: () => void;
};

const TransactionDetailsModal: React.FC<Props> = ({ transaction, onClose }) => {
	return (
		<>
			<CommonPopup
				open={open}
				onClose={onClose}
				width="31.25rem"
				height="70%"
				header={{
					icon: 'wallet-in',
					title: __('Transaction Details', 'multivendorx'),
					description: __('Track your order commissions and watch your earnings grow.', 'multivendorx'),
				}}
			>
				<>
					<div className="heading">
						{__('Order Overview', 'multivendorx')}
					</div>

					<div className="commission-details">
						<div className="items">
							<div className="text">
								{__('Date', 'multivendorx')}
							</div>
							<div className="value">
								{formatWcShortDate(transaction.date)}
							</div>
						</div>
						<div className="items">
							<div className="text">
								{__('Order Details', 'multivendorx')}
							</div>
							<div className="value">
								{transaction.order_details ? (
									<a href={`/dashboard/orders/#view/${transaction.order_details}`}>
										#{transaction.order_details}
									</a>
								) : (
									'-'
								)}
							</div>
						</div>
						<div className="items">
							<div className="text">
								{__('Transaction Type', 'multivendorx')}
							</div>
							<div className="value">
								{transaction.transaction_type}
							</div>
						</div>
						<div className="items">
							<div className="text">
								{__('Payment Mode', 'multivendorx')}
							</div>
							<div className="value">
								{transaction.payment_mode}
							</div>
						</div>
						<div className="items">
							<div className="text">
								{__('Credit', 'multivendorx')}
							</div>
							<div className="value">
								{formatCurrency(transaction.credit)}
							</div>
						</div>
						<div className="items">
							<div className="text">
								{__('Debit', 'multivendorx')}
							</div>
							<div className="value">
								{formatCurrency(transaction.debit)}
							</div>
						</div>
						<div className="items">
							<div className="text">
								{__('Balance', 'multivendorx')}
							</div>
							<div className="value">
								{formatCurrency(transaction.balance)}

							</div>
						</div>
						<div className="items">
							<div className="text">
								{__('Status', 'multivendorx')}
							</div>
							<div className="value">
								<span
									className={`admin-badge ${transaction.status === 'Completed'
										? 'green'
										: 'red'
										}`}
								>
									{transaction.status
										? transaction.status
											.replace(/^wc-/, '') // remove prefix
											.replace(/_/g, ' ') // underscores → spaces
											.replace(/\b\w/g, (c) =>
												c.toUpperCase()
											) // capitalize
										: ''}
								</span>
							</div>
						</div>
					</div>
				</>
			</CommonPopup>
		</>
	);
};

export default TransactionDetailsModal;
