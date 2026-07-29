import { __ } from '@wordpress/i18n';

/**
 * Same declarative-tab shape as General.ts, backed by
 * `Utill::SETTINGS_DEFAULTS`'s Catalog section. `default_offering_type`/
 * `default_catalog_visibility` are not yet read anywhere else in this
 * codebase (OfferingEdit.tsx still hardcodes its own initial form state)
 * — the same "real setting, not yet consumed" gap already documented on
 * `default_offering_status` in General.ts/Utill.php.
 */
export default {
	id: 'catalog',
	priority: 1,
	headerTitle: __( 'Catalog', 'vulocart' ),
	headerIcon: 'catalog',
	submitUrl: 'settings',
	modal: [
		{
			key: 'default_offering_type',
			type: 'select',
			label: __( 'Default offering type', 'vulocart' ),
			desc: __(
				'Offering type preselected when a merchant clicks "Add New" on the Offerings screen.',
				'vulocart'
			),
			// Same raw-type-string-as-label list OfferingType::all() (PHP)
			// and OfferingEdit.tsx's own OFFERING_TYPE_OPTIONS use — kept as
			// a hand-maintained flat list rather than a shared constant
			// import, matching how OfferingEdit.tsx already duplicates it.
			options: [
				{ label: 'physical', value: 'physical' },
				{ label: 'digital', value: 'digital' },
				{ label: 'subscription', value: 'subscription' },
				{ label: 'course', value: 'course' },
				{ label: 'service', value: 'service' },
				{ label: 'membership', value: 'membership' },
				{ label: 'booking', value: 'booking' },
				{ label: 'rental', value: 'rental' },
				{ label: 'bundle', value: 'bundle' },
				{ label: 'donation', value: 'donation' },
				{ label: 'gift_card', value: 'gift_card' },
				{ label: 'license', value: 'license' },
			],
		},
		{
			key: 'default_catalog_visibility',
			type: 'select',
			label: __( 'Default catalog visibility', 'vulocart' ),
			desc: __(
				'Visibility preselected for a newly created offering.',
				'vulocart'
			),
			// Same value set as OfferingEdit.tsx's CATALOG_VISIBILITY_OPTIONS.
			options: [
				{ label: __( 'Shop and search results', 'vulocart' ), value: 'shop_and_search' },
				{ label: __( 'Shop only', 'vulocart' ), value: 'shop_only' },
				{ label: __( 'Search results only', 'vulocart' ), value: 'search_only' },
				{ label: __( 'Hidden', 'vulocart' ), value: 'hidden' },
			],
		},
		{
			key: 'low_stock_threshold',
			type: 'number',
			label: __( 'Low stock threshold', 'vulocart' ),
			minNumber: 0,
			desc: __(
				'Quantity at or below which a stock-tracked offering could be flagged as low stock.',
				'vulocart'
			),
		},
	],
};
