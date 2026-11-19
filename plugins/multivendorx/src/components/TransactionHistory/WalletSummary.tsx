import React from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { CardComponent, SkeletonComponent } from '@zyra/components';
import { formatCurrency, formatDate } from '../../services/commonFunction';
import './wallet-summary.scss';

/** The store wallet as `GET transactions/{store_id}` returns it, as far as the summary reads it. */
export interface StoreWallet {
	available_balance?: number | string;
	locking_balance?: number | string;
	reserve_balance?: number | string;
	threshold?: number | string;
	payment_schedules?: string;
	free_withdrawal?: number | string;
	withdrawal_setting?: {
		free_withdrawals?: number | string;
		withdrawal_percentage?: number | string;
		withdrawal_fixed?: number | string;
	}[];
}

/** A completed withdrawal (`transactions?transactionType=Withdrawal`), newest first. */
export interface StorePayout {
	debit?: number | string;
	created_at?: string;
	payment_method?: string;
}

interface WalletSummaryProps {
	wallet: StoreWallet;
	lastPayout?: StorePayout;
	isLoading: boolean;
	onPayOut: () => void;
}

/** "stripe-connect" → "Stripe Connect". */
const formatMethod = (method?: string): string =>
	(method ?? '')
		.replace(/[-_]/g, ' ')
		.replace(/\b\w/g, (char) => char.toUpperCase());

/**
 * Transaction history → Wallet: what the store can be paid now, with the one action that pays it, then a row of the
 * figures that explain that amount (still clearing, held in reserve, the payout minimum, and the last payout). A figure
 * with nothing to show reads "—" with a line saying why, rather than a bold "None".
 */
const WalletSummary: React.FC<WalletSummaryProps> = ({
	wallet,
	lastPayout,
	isLoading,
	onPayOut,
}) => {
	const available = Number(wallet.available_balance) || 0;
	const clearing = Number(wallet.locking_balance) || 0;
	const reserve = Number(wallet.reserve_balance) || 0;
	const minimum = Number(wallet.threshold) || 0;
	const withdrawalRule = wallet.withdrawal_setting?.[0];
	const freeWithdrawals = Number(withdrawalRule?.free_withdrawals) || 0;
	const freeLeft = Math.max(
		0,
		freeWithdrawals - (Number(wallet.free_withdrawal) || 0)
	);

	let balanceHint = __(
		'Nothing to pay out yet. Earnings move here once they clear.',
		'multivendorx'
	);
	if (available > 0 && minimum > available) {
		balanceHint = sprintf(
			/* translators: %s: minimum payout amount, e.g. "$50.00". */
			__('Below the %s payout minimum.', 'multivendorx'),
			formatCurrency(minimum)
		);
	} else if (available > 0) {
		balanceHint = __('Ready to pay out to this store.', 'multivendorx');
	}

	const stats = [
		{
			icon: 'clock',
			label: __('Clearing', 'multivendorx'),
			value: formatCurrency(clearing),
			isEmpty: clearing <= 0,
			hint: wallet.payment_schedules
				? sprintf(
						/* translators: %s: payout schedule, e.g. "weekly". */
						__('Released to the balance %s', 'multivendorx'),
						wallet.payment_schedules
					)
				: __('Released to the balance every hour', 'multivendorx'),
		},
		{
			icon: 'lock',
			label: __('Reserve', 'multivendorx'),
			value: reserve > 0 ? formatCurrency(reserve) : '—',
			isEmpty: reserve <= 0,
			hint:
				reserve > 0
					? __('Held back from every payout', 'multivendorx')
					: __('No reserve is held back', 'multivendorx'),
		},
		{
			icon: 'wallet-open',
			label: __('Payout minimum', 'multivendorx'),
			value: minimum > 0 ? formatCurrency(minimum) : '—',
			isEmpty: minimum <= 0,
			hint:
				minimum > 0
					? __('Smallest amount the store can withdraw', 'multivendorx')
					: __('Any amount can be paid out', 'multivendorx'),
		},
		freeWithdrawals > 0
			? {
					icon: 'bank-payment',
					label: __('Free withdrawals left', 'multivendorx'),
					value: sprintf(
						/* translators: 1: free withdrawals left, 2: free withdrawals allowed. */
						__('%1$d of %2$d', 'multivendorx'),
						freeLeft,
						freeWithdrawals
					),
					isEmpty: false,
					hint: sprintf(
						/* translators: 1: fee percentage, 2: fixed fee amount. */
						__('Then %1$s%% + %2$s per withdrawal', 'multivendorx'),
						Number(withdrawalRule?.withdrawal_percentage) || 0,
						formatCurrency(Number(withdrawalRule?.withdrawal_fixed) || 0)
					),
				}
			: {
					icon: 'calendar',
					label: __('Last payout', 'multivendorx'),
					value: lastPayout
						? formatCurrency(Math.abs(Number(lastPayout.debit) || 0))
						: '—',
					isEmpty: !lastPayout,
					hint: lastPayout
						? [
								formatDate(lastPayout.created_at),
								formatMethod(lastPayout.payment_method),
							]
								.filter(Boolean)
								.join(' · ')
						: __('No payouts to this store yet', 'multivendorx'),
				},
	];

	return (
		<CardComponent className="mvx-wallet">
			<div className="mvx-wallet-hero">
				<span className="mvx-wallet-hero-icon" aria-hidden="true">
					<i className="adminfont-wallet" />
				</span>
				<div className="mvx-wallet-hero-text">
					<span className="mvx-wallet-label">
						{__('Available to pay out', 'multivendorx')}
					</span>
					<strong className="mvx-wallet-amount">
						{isLoading ? (
							<SkeletonComponent width={8} />
						) : (
							formatCurrency(available)
						)}
					</strong>
					<p className="mvx-wallet-hint">
						{isLoading ? <SkeletonComponent width={14} /> : balanceHint}
					</p>
				</div>
				<button
					type="button"
					className="admin-btn btn-purple mvx-wallet-payout"
					onClick={onPayOut}
					disabled={isLoading || available <= 0}
				>
					<i className="adminfont-wallet" aria-hidden="true" />
					{__('Pay out store', 'multivendorx')}
				</button>
			</div>

			<dl className="mvx-wallet-stats">
				{stats.map((stat) => (
					<div className="mvx-wallet-stat" key={stat.label}>
						<dt>
							<span className="mvx-wallet-stat-icon" aria-hidden="true">
								<i className={`adminfont-${stat.icon}`} />
							</span>
							{stat.label}
						</dt>
						<dd
							className={`mvx-wallet-stat-value${stat.isEmpty ? ' is-empty' : ''}`}
						>
							{isLoading ? <SkeletonComponent width={5} /> : stat.value}
						</dd>
						<dd className="mvx-wallet-stat-hint">{stat.hint}</dd>
					</div>
				))}
			</dl>

			{freeWithdrawals > 0 && lastPayout && (
				<p className="mvx-wallet-foot">
					<i className="adminfont-calendar" aria-hidden="true" />
					{sprintf(
						/* translators: 1: last payout amount, 2: its date. */
						__('Last payout: %1$s on %2$s', 'multivendorx'),
						formatCurrency(Math.abs(Number(lastPayout.debit) || 0)),
						formatDate(lastPayout.created_at)
					)}
				</p>
			)}
		</CardComponent>
	);
};

export default WalletSummary;
