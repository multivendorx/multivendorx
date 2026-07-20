import React from 'react';
import { __ } from '@wordpress/i18n';
import {
	FormGroup,
	FormGroupWrapper,
	PopupUI,
	SectionUI,
} from '@zyra/elements';
import { formatCurrency, formatDate } from '@/services/commonFunction';

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
			<PopupUI
				open={open}
				onClose={onClose}
				width={33}
				height="70%"
				header={{
					icon: 'wallet-in',
					title: __('Transaction Details', 'multivendorx'),
					description: __(
						'Track your order commissions and watch your earnings grow.',
						'multivendorx'
					),
				}}
			>
				<>
					<SectionUI title={__('Order Overview', 'multivendorx')} />

					<FormGroupWrapper>
						<FormGroup row label={__('Date', 'multivendorx')}>
							{formatDate(transaction.created_at)}
						</FormGroup>
						<FormGroup
							row
							label={__('Order Details', 'multivendorx')}
						>
							{transaction.order_details ? (
								<a
									href={`/dashboard/orders/#view/${transaction.order_details}`}
								>
									#{transaction.order_details}
								</a>
							) : (
								'-'
							)}
						</FormGroup>
						<FormGroup
							row
							label={__('Transaction Type', 'multivendorx')}
						>
							{transaction.transaction_type}
						</FormGroup>
						<FormGroup
							row
							label={__('Payment Mode', 'multivendorx')}
						>
							{transaction.payment_mode}
						</FormGroup>
						<FormGroup row label={__('Credit', 'multivendorx')}>
							{formatCurrency(transaction.credit)}
						</FormGroup>
						<FormGroup row label={__('Debit', 'multivendorx')}>
							{formatCurrency(transaction.debit)}
						</FormGroup>
						<FormGroup row label={__('Balance', 'multivendorx')}>
							{formatCurrency(transaction.balance)}
						</FormGroup>
						<FormGroup row label={__('Status', 'multivendorx')}>
							<span
								className={`admin-badge ${
									transaction.status === 'Completed'
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
						</FormGroup>
					</FormGroupWrapper>
				</>
			</PopupUI>
		</>
	);
};

export default TransactionDetailsModal;
