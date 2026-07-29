import { __ } from '@wordpress/i18n';

/**
 * Backed by `Utill::SETTINGS_DEFAULTS`'s Payments section. No payment
 * gateway module exists in this plugin yet (Order\Domain\Order has a
 * single lifecycle `status`, not a separate payment_status column) —
 * `default_payment_status` is descriptive of a future field, not a
 * currently-read one. `enable_manual_payment` is the one option that
 * matches what OrderService can actually do today: create an order with
 * no gateway involved at all (Rest::create_item() takes no payment
 * details), i.e. "manual"/offline payment is the only mode this plugin
 * supports right now.
 */
export default {
	id: 'payments',
	priority: 4,
	headerTitle: __( 'Payments', 'vulocart' ),
	headerIcon: 'payment',
	submitUrl: 'settings',
	modal: [
		{
			key: 'enable_manual_payment',
			type: 'checkbox',
			look: 'toggle',
			label: __( 'Enable manual/offline payment', 'vulocart' ),
			desc: __(
				'Accept orders without an online payment gateway — the only payment mode this plugin supports until a gateway module exists.',
				'vulocart'
			),
			options: [
				{ key: 'enable_manual_payment', label: '', value: 'enable_manual_payment' },
			],
		},
		{
			key: 'default_payment_status',
			type: 'select',
			label: __( 'Default payment status', 'vulocart' ),
			desc: __(
				'Payment status a new order would start at, once orders track payment status separately from fulfillment status.',
				'vulocart'
			),
			options: [
				{ label: __( 'Pending', 'vulocart' ), value: 'pending' },
				{ label: __( 'Paid', 'vulocart' ), value: 'paid' },
				{ label: __( 'Failed', 'vulocart' ), value: 'failed' },
				{ label: __( 'Refunded', 'vulocart' ), value: 'refunded' },
			],
		},
	],
};
