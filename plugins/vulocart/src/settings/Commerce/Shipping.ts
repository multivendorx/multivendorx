import { __ } from '@wordpress/i18n';

/**
 * Backed by `Utill::SETTINGS_DEFAULTS`'s Shipping section — a
 * marketplace-wide default, distinct from OfferingEdit.tsx's per-offering
 * shipping fields (weight/dimensions/shipping class), which already exist
 * and are real. `flat_rate_shipping_cost` is not yet added to an order's
 * total — Order\Domain\Order's own docblock already documents `total`
 * === `subtotal` until a shipping/tax module exists.
 */
export default {
	id: 'shipping',
	priority: 5,
	headerTitle: __( 'Shipping', 'vulocart' ),
	headerIcon: 'shipping',
	submitUrl: 'settings',
	modal: [
		{
			key: 'enable_shipping',
			type: 'checkbox',
			look: 'toggle',
			label: __( 'Enable shipping', 'vulocart' ),
			desc: __(
				'Whether shippable offering types (Physical, Rental, Bundle) show shipping fields at all.',
				'vulocart'
			),
			options: [
				{ key: 'enable_shipping', label: '', value: 'enable_shipping' },
			],
		},
		{
			key: 'default_shipping_class',
			type: 'select',
			label: __( 'Default shipping class', 'vulocart' ),
			desc: __(
				'Shipping class preselected for a new shippable offering.',
				'vulocart'
			),
			// Same value set as OfferingEdit.tsx's SHIPPING_CLASS_OPTIONS.
			options: [
				{ label: __( 'Standard', 'vulocart' ), value: 'standard' },
				{ label: __( 'Fragile', 'vulocart' ), value: 'fragile' },
				{ label: __( 'Oversized', 'vulocart' ), value: 'oversized' },
				{ label: __( 'Free shipping', 'vulocart' ), value: 'free_shipping' },
			],
			dependent: { key: 'enable_shipping', set: true },
		},
		{
			key: 'flat_rate_shipping_cost',
			type: 'number',
			label: __( 'Flat rate shipping cost', 'vulocart' ),
			minNumber: 0,
			desc: __(
				'A single flat shipping charge, once order totals account for shipping.',
				'vulocart'
			),
			dependent: { key: 'enable_shipping', set: true },
		},
	],
};
