/* global appLocalizer */
import React from 'react';
import { __ } from '@wordpress/i18n';
import { ColumnComponent, ContainerComponent } from '@zyra/components';
import { TableCard } from '@zyra/table';
import LockedPreview from '../Popup/LockedPreview';
import { SAMPLE_DIRECT_TRANSACTIONS } from '../Popup/sampleRows';

/**
 * Transaction history → Direct transactions while MultiVendorX Pro isn't active: the table Pro shows
 * (multivendorx-pro/src/components/Transaction/direct-transaction.tsx, same columns), with sample rows behind the
 * "comes with MultiVendorX Pro" card.
 */
const DirectTransactionPreview: React.FC = () => {
	const headers = {
		id: { label: __('ID', 'multivendorx') },
		commission_id: { label: __('Commission Id', 'multivendorx') },
		created_at: { label: __('Date', 'multivendorx'), type: 'date' },
		order_id: { label: __('Order Id', 'multivendorx') },
		store_gateway_fee: {
			label: __('Store Gateway fee', 'multivendorx'),
			type: 'currency',
		},
		store_gross: {
			label: __('Store Amount', 'multivendorx'),
			type: 'currency',
		},
		narration: { label: __('Narration', 'multivendorx') },
	};

	return (
		<ContainerComponent>
			<ColumnComponent>
				<LockedPreview
					feature={{
						title: __('Direct transactions', 'multivendorx'),
						description: __(
							'Track every payment that goes straight to a store through Stripe Connect or PayPal Marketplace, with its order, commission and gateway fee.',
							'multivendorx'
						),
						icon: 'store-reactivated',
					}}
				>
					<TableCard
						headers={headers}
						rows={SAMPLE_DIRECT_TRANSACTIONS}
						totalRows={SAMPLE_DIRECT_TRANSACTIONS.length}
						search={{ placeholder: 'Search...' }}
						format={appLocalizer.date_format}
						currency={{
							currencySymbol: appLocalizer.currency_symbol,
							priceDecimals: appLocalizer.price_decimals,
							decimalSeparator: appLocalizer.decimal_separator,
							thousandSeparator: appLocalizer.thousand_separator,
							currencyPosition: appLocalizer.currency_position,
						}}
					/>
				</LockedPreview>
			</ColumnComponent>
		</ContainerComponent>
	);
};

export default DirectTransactionPreview;
