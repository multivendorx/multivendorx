import { __ } from '@wordpress/i18n';

export default {
	id: 'single-product-multiple-store',
	priority: 3,
	name: __('Store selling mode', 'multivendorx'),
	desc: __(
		'',
		'multivendorx'
	),
	icon: 'adminlib-spmv',
	submitUrl: 'settings',
	modal: [
		{
			key: 'store_selling_mode',
			type: 'setting-toggle',
			label: __('Store Selling Mode', 'multivendorx'),
			desc: __('Decide how stores are allowed to sell products in your marketplace:<ul><li><strong>Shared product listing</strong> - Stores can copy existing products and sell them alongside new products they create.</li><li><strong>Franchise</strong> - Franchise stores can sell only their own products and products created by the admin.</li><li><strong>Default</strong> - Stores can sell only their own products, following standard marketplace rules.</li></ul>','multivendorx'),
options: [
				{
					key: 'single_product_multiple_vendor',
					label: __('Shared product listing', 'multivendorx'),
					value: 'single_product_multiple_vendor',
					desc: __('Stores can copy existing products and sell them alongside new products they create.', 'multivendorx'),
				},
				{
					key: 'franchise',
					label: __('Franchise', 'multivendorx'),
					value: 'franchise',
					desc: __('Franchise stores can sell only their own products and admin products.', 'multivendorx'),
				},
				{
					key: 'default',
					label: __('Default', 'multivendorx'),
					value: 'default',
					desc: __('Stores can sell only their own products unless other modes are enabled.', 'multivendorx'),
				},
			],
		},
		{
			key: 'section',
			type: 'section',
			hint: __('Shared Product Listing', 'multivendorx'),
			desc: __(
				'Manage how multiple vendors (stores) can list and sell the same product in your marketplace.',
				'multivendorx'
			),
			dependent: {
				key: 'store_selling_mode',
				set: true,
				value: 'single_product_multiple_vendor',
			},
		},
		{
			key: 'singleproductmultistore_show_order',
			type: 'setting-toggle',
			label: __(
				'Shared product listing  product priority',
				'multivendorx'
			),
			desc: __(
				'Choose which version of shared product will be shown as the main listing on the shop page (e.g., top-rated store, min / max priced product).',
				'multivendorx'
			),
			dependent: {
				key: 'store_selling_mode',
				set: true,
				value: 'single_product_multiple_vendor',
			},
			options: [
				{
					key: 'min-price',
					label: __('Lowest price', 'multivendorx'),
					value: __('min-price', 'multivendorx'),
				},
				{
					key: 'max-price',
					label: __('Highest price', 'multivendorx'),
					value: __('max-price', 'multivendorx'),
				},
				{
					key: 'top-rated-store',
					label: __('Top rated store', 'multivendorx'),
					value: __('top-rated-store', 'multivendorx'),
				},
				{
					key: 'top-rated-store',
					label: __('Based on nearby location', 'multivendorx'),
					value: __('based-on-nearby-location', 'multivendorx'),
				},
			],
		},
		{
			key: 'moreoffers_display_position',
			type: 'setting-toggle',
			label: __('More offers display position', 'multivendorx'),
			desc: __(
				'Decide where additional offers by other stores should be displayed on the single product page to make them visible to customers.',
				'multivendorx'
			),
			dependent: {
				key: 'store_selling_mode',
				set: true,
				value: 'single_product_multiple_vendor',
			},
			postText: __(' single page product tabs.', 'multivendorx'),
			options: [
				{
					key: 'none',
					label: __('None', 'multivendorx'),
					value: 'none',
				},
				{
					key: 'above-tabs',
					label: __('Above', 'multivendorx'),
					value: 'above-tabs',
				},
				{
					key: 'inside-tabs',
					label: __('Inside', 'multivendorx'),
					value: 'inside-tabs',
				},
				{
					key: 'after-tabs',
					label: __('After', 'multivendorx'),
					value: 'after-tabs',
				},
			],
		},
		{
			key: 'section',
			type: 'section',
			hint: __('Franchise', 'multivendorx'),
			desc: __(
				'Franchise mode lets you run multiple branch stores under one brand. Use these settings to control how customer orders are routed to franchise stores.',
				'multivendorx'
			),
			dependent: {
				key: 'store_selling_mode',
				set: true,
				value: 'franchise',
			},
		},
		{
			key: 'store_assignment_method',
			type: 'setting-toggle',
			label: __('Store assignment method', 'multivendorx'),
			desc: __(
				'Select whether franchise stores can sell only their own products or also include admin-created products.',
				'multivendorx'
			),
			options: [
				{
					key: 'nearest_store',
					label: __('Nearest store', 'multivendorx'),
					value: 'nearest_store',
					desc: __(
						'Automatically assign orders to the closest eligible franchise store based on the customer’s delivery address. Best suited for physical or region-based fulfillment.',
						'multivendorx'
					),
				},
				{
					key: 'manual_assignment',
					label: __('Manual assignment', 'multivendorx'),
					value: 'manual_assignment',
					desc: __(
						'Orders remain unassigned until an admin manually selects a franchise store.',
						'multivendorx'
					),
				},
			],
			dependent: {
				key: 'store_selling_mode',
				set: true,
				value: 'franchise',
			},
		},
		{
			key: 'location_restriction',
			type: 'setting-toggle',
			label: __('Location restriction', 'multivendorx'),
			desc: __(
				'Choose which part of the customer’s address is matched with store locations when automatically assigning an order to the nearest store.',
				'multivendorx'
			),
			dependent: {
				key: 'store_assignment_method',
				set: true,
				value: 'nearest_store',
			},
			options: [
				{
					key: 'city',
					label: __('City', 'multivendorx'),
					value: 'city',
				},
				{
					key: 'state',
					label: __('State', 'multivendorx'),
					value: 'state',
				},
				{
					key: 'postal_code',
					label: __('Postal code', 'multivendorx'),
					value: 'postal_code',
				},
			],
		},
		{
			key: 'section',
			type: 'section',
			hint: __('Order creation', 'multivendorx'),
			desc: __(
				'Specifies order creation and management rules for franchise stores.',
				'multivendorx'
			),		
		},
		{
			key: 'products_available_for_franchise_orders',
			type: 'setting-toggle',
			label: __('Products available for franchise orders', 'multivendorx'),
			desc: __(
				'Choose how customer orders should be assigned to franchise stores.',
				'multivendorx'
			),
			options: [
				{
					key: 'store_products_only',
					label: __('Store products only', 'multivendorx'),
					value: 'store_products_only',
					desc: __(
						'Automatically assign orders to the closest eligible franchise store based on the customer’s delivery address. Best suited for physical or region-based fulfillment.',
						'multivendorx'
					),
				},
				{
					key: 'store_and_admin_products',
					label: __('Store and admin products', 'multivendorx'),
					value: 'store_and_admin_products',
					desc: __(
						'Orders remain unassigned until an admin manually selects a franchise store.',
						'multivendorx'
					),
				},
			],
		},
		{
			key: 'store_price_override',
			type: 'checkbox',
			label: __('Store price override', 'multivendorx'),
			desc: __(
				'Allow franchise stores to adjust the selling price of admin products to match local market conditions.',
				'multivendorx'
			),
			options: [
				{
					key: 'enabled',
					value: 'enabled',
				},
			],
			look: 'toggle',
			dependent: {
				key: 'store_assignment_method',
				set: true,
				value: 'store_and_admin_products',
			},
		},
	],
};