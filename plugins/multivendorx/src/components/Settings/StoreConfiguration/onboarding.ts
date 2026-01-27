import { __ } from '@wordpress/i18n';

export default {
	id: 'general',
	priority: 1,
	name: __('Onboarding', 'multivendorx'),
	tabTitle: 'Approval process for new stores',
	desc: __(
		'Choose how new stores enter your marketplace, review them manually or allow instant access.',
		'multivendorx'
	),
	icon: 'adminfont-onboarding',
	submitUrl: 'settings',
	modal: [
		{
			key: 'approve_store',
			type: 'setting-toggle',
			label: __('New store registration approval', 'multivendorx'),
			desc: __(
				'Decide how you want to approve new stores for your marketplace:<ul><li>Manual approval - Admin reviews each store request and decides whether to approve or reject it before granting access to the marketplace.</li><li>Automatic approval - Stores are instantly approved, gaining dashboard access right away to upload and sell products/listings.</li></ul>',
				'multivendorx'
			),
			options: [
				{
					key: 'manually',
					label: __('Manual', 'multivendorx'),
					value: 'manually',
				},
				{
					key: 'automatically',
					label: __('Automatic', 'multivendorx'),
					value: 'automatically',
				},
			],
		},
		{
			key: 'section',
			type: 'section',
			hint: __('Setup wizard for stores', 'multivendorx'),
		},
		{
			key: 'disable_setup_wizard',
			type: 'setting-toggle',
			label: __('Guided setup wizard', 'multivendorx'),
			desc: __(
				'Help stores set up their store quickly with a guided, step-by-step process after registration. If disabled, the setup wizard will not appear.',
				'multivendorx'
			),
			options: [
				{
					key: 'enable_guided_setup',
					label: __('Enabled', 'multivendorx'),
					value: 'enable_guided_setup',
				},
				{
					key: 'skip_to_dashboard',
					label: __('Disabled', 'multivendorx'),
					value: 'skip_to_dashboard',
				},
			],
		},
		{
			key: 'onboarding_steps_configuration',
			type: 'checkbox',
			label: __('Onboarding steps', 'multivendorx'),
			 
			options: [
				{
					key: 'store_profile_setup',
					label: __('Store profile', 'multivendorx'),
					desc: __(
						'Store owners must provide: store name, business description, logo upload, basic branding information.',
						'multivendorx'
					),
					value: 'store_profile_setup',
				},
				{
					key: 'payment_information',
					label: __('Payment information', 'multivendorx'),
					desc: __(
						'Requires stores to set up, payout methods (Bank account/ PayPal / Stripe etc).',
						'multivendorx'
					),
					value: 'payment_information',
				},
				{
					key: 'shipping_configuration',
					label: __('Shipping setup', 'multivendorx'),
					desc: __(
						'Forces stores to complete: Geographic shipping zones, delivery rates and pricing. ',
						'multivendorx'
					),
					value: 'shipping_configuration',
				},
				{
					key: 'first_product_upload',
					label: __('First product/listings', 'multivendorx'),
					desc: __(
						'Mandates that store to upload at least one product/listing, complete product/listing details before going live, ensures the store is not empty when launched.',
						'multivendorx'
					),
					value: 'first_product_upload',
				},
				{
					key: 'identity_verification',
					label: __('Identity verification', 'multivendorx'),
					desc: __(
						'Requires stores to submit government-issued documents, business address verification, Know Your Customer (KYC) compliance.',
						'multivendorx'
					),
					value: 'identity_verification',
					proSetting: true,
					moduleEnabled: 'identity-verification',
				},
				{
					key: 'store_policies',
					label: __('Store policies', 'multivendorx'),
					desc: __(
						'Merchants can override refund rules, shipping terms, and general conditions.',
						'multivendorx'
					),
					value: 'store_policies',
					moduleEnabled: 'store-policy',
				},
			],
			selectDeselect: true,
			dependent: {
				key: 'disable_setup_wizard', // parent dependent key
				set: true,
				value: 'enable_guided_setup', // updated value
			},
		},
		{
			key: 'setup_wizard_introduction',
			type: 'textarea',
			label: __('Getting started message', 'multivendorx'),
			value: __(
				`Welcome aboard, [Store Name]!\nWe’ll guide you through the essential steps to launch your store on [${appLocalizer.marketplace_site}].`,
				'multivendorx'
			),
			desc: __(
				'This message appears at the beginning of the setup process to set expectations and encourage completion.',
				'multivendorx'
			),
			dependent: {
				key: 'disable_setup_wizard', // parent dependent key
				set: true,
				value: 'enable_guided_setup', // updated value
			},
		},
		{
			key: 'section',
			type: 'section',
			hint: __('How stores sell products/listings', 'multivendorx'),
		},
		{
			key: 'store_selling_mode',
			type: 'setting-toggle',
			label: __('Product listing model', 'multivendorx'),
			desc: __(
				'Decide how stores are allowed to sell products/listings in your marketplace:<ul><li><strong>Own listing</strong> - Stores can sell only their own products, following standard marketplace rules.</li><li><strong>Shared listing</strong> - Stores can copy existing products and sell them alongside new products they create.</li><li><strong>Franchise</strong> - Franchise stores can sell only their own products and products created by the admin.</li>',
				'multivendorx'
			),
			options: [
				{
					key: 'default',
					label: __('Own listing', 'multivendorx'),
					value: 'default',
				},
				{
					key: 'single_product_multiple_vendor',
					label: __('Shared listing', 'multivendorx'),
					value: 'single_product_multiple_vendor',
				},
				{
					key: 'franchise',
					label: __('Franchise', 'multivendorx'),
					value: 'franchise',
					proSetting: true,
				},
			],
		},
		{
			key: 'spmv_show_order',
			type: 'setting-toggle',
			label: __(
				'Co-listed product/listings display priority',
				'multivendorx'
			),
			dependent: {
				key: 'store_selling_mode',
				set: true,
				value: 'single_product_multiple_vendor',
			},
			desc: __(
				'Choose which version of co-listed products will be shown as the main listing on the shop page (e.g., top-rated store, min / max priced product).',
				'multivendorx'
			),
			options: [
				{
					key: 'min_price',
					label: __('Lowest price', 'multivendorx'),
					value:'min_price',
				},
				{
					key: 'max_price',
					label: __('Highest price', 'multivendorx'),
					value: 'max_price',
				},
				{
					key: 'top_rated_store',
					label: __('Top rated store', 'multivendorx'),
					value: 'top_rated_store',
				},
				{
					key: 'nearby_location',
					label: __('Based on nearby location', 'multivendorx'),
					value: 'nearby_location',
				},
			],
		},
		{
			key: 'more_offers_display_position',
			type: 'setting-toggle',
			label: __('More offers display position', 'multivendorx'),
			desc: __(
				'Decide where additional offers by other stores should be displayed on the single product/listings page to make them visible to customers.',
				'multivendorx'
			),
			dependent: {
				key: 'store_selling_mode',
				set: true,
				value: 'single_product_multiple_vendor',
			},
			postText: __(' single page product/listings tabs.', 'multivendorx'),
			options: [
				{
					key: 'none',
					label: __('None', 'multivendorx'),
					value: 'none',
				},
				{
					key: 'above',
					label: __('Above', 'multivendorx'),
					value: 'above',
				},
				{
					key: 'after',
					label: __('After', 'multivendorx'),
					value: 'after',
				},
			],
		},
		{
			key: 'store_assignment_method',
			type: 'setting-toggle',
			label: __('Franchise store assignment method', 'multivendorx'),
			desc: __(
				'Define how customer orders are assigned to franchise stores after checkout:<ul><li><strong>Nearest store</strong> - Orders are automatically assigned to the closest eligible franchise store based on the customer’s delivery address and the store’s configured "location restrictions".Best suited for physical or region-based fulfillment.</li><li><strong>Manual assignment</strong> - Orders are created without a store assignment and must be manually assigned by the admin from the backend.</li></ul>',
				'multivendorx'
			),
			dependent: {
				key: 'store_selling_mode',
				set: true,
				value: 'franchise',
			},
			options: [
				{
					key: 'nearest_store',
					label: __('Nearest store', 'multivendorx'),
					value: 'nearest_store',
				},
				{
					key: 'manual_assignment',
					label: __('Manual assignment', 'multivendorx'),
					value: 'manual_assignment',
					dependent: {
						key: 'store_selling_mode',
						set: true,
						value: 'franchise',
					},
				},
			],
		},
		{
			key: 'location_restriction',
			type: 'setting-toggle',
			label: __('Location restriction', 'multivendorx'),
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
			key: 'products_available_for_franchise_orders',
			type: 'setting-toggle',
			label: __(
				'Products available for franchise orders',
				'multivendorx'
			),
			desc: __(
				'Decide what franchise stores can do and how it affects marketplace operations:<ul><li><strong>Store Order Creation</strong> – Franchise stores can create orders manually (phone sales, walk-ins, offline transactions). These orders follow marketplace commission rules.</li><li><strong>Admin Product/listings Access</strong> – Franchise stores can order products/listings from the admin catalog for resale or restocking. </li></ul>',
				'multivendorx'
			),
			dependent: {
				key: 'store_selling_mode',
				set: true,
				value: 'franchise',
			},
			options: [
				{
					key: 'store_products_only',
					label: __('Store products/listings only', 'multivendorx'),
					value: 'store_products_only',
				},
				{
					key: 'store_and_admin_products',
					label: __('Store and admin products/listings', 'multivendorx'),
					value: 'store_and_admin_products',
				},
			],
		},
		{
			key: 'store_price_override',
			type: 'checkbox',
			label: __('Store price override', 'multivendorx'),
			options: [
				{
					key: 'enabled',
					value: 'enabled',
				},
			],
			dependent: {
				key: 'store_selling_mode',
				set: true,
				value: 'franchise',
			},
			look: 'toggle',
		},
	],
};
