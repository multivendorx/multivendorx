/* global appLocalizer */
import { __ } from '@wordpress/i18n';

export default {
	id: 'overview',
	priority: 1,
	headerTitle: __('Overview', 'multivendorx'),
	settingTitle: 'Marketplace pages configuration',
	headerDescription: __(
		'Configure the essential system pages required for your marketplace - including store registration, store dashboard.',
		'multivendorx'
	),
	headerIcon: 'view-files',
	submitUrl: 'settings',
	modal: [
		{
			key: 'store_registration_page',
			type: 'select',
			label: __('Store registration page', 'multivendorx'),
			desc: __(
				'Choose the page with [store_registration] shortcode, this is where stores sign up.',
				'multivendorx'
			),
			size: 30,
			options: appLocalizer.pages_list,
		},
		{
			key: 'store_dashboard_page',
			type: 'select',
			label: __('Store dashboard page', 'multivendorx'),
			desc: __(
				'The page with [marketplace_store] shortcode will act as the store’s control center.',
				'multivendorx'
			),
			size: 30,
			options: appLocalizer.pages_list,
		},
		{
			key: 'store_url',
			type: 'text',
			label: __('Storefront base ', 'multivendorx'),
			desc: __(
				'Set a custom base for your store URL. For example, in the URL: https://yourdomain.com/store/sample-store/, the default word [store] can be replaced with any name you define here.',
				'multivendorx'
			),
			size: 8,
			beforeElement: {
				type: 'preposttext',
				textType: 'pre',
				preText: appLocalizer.site_url + '/',
			},
			afterElement: {
				type: 'preposttext',
				textType: 'post',
				postText: '/sample-store/',
			},
		},
		{
			key: 'section',
			type: 'section',
			title: __(
				'Customer-facing order presentation & invoicing',
				'multivendorx'
			),
		},
		{
			key: 'display_customer_order',
			type: 'choice-toggle',
			label: __('Customers will see information for', 'multivendorx'),
			custom: true,
			settingDescription: __(
				'Choose which order statuses will send customers email notifications, PDF invoices, and display order details in their account.',
				'multivendorx'
			),
			desc: __(
				'In a multivendor setup, a <b>Main Order</b> is the parent order placed by the customer, while <b>Sub-orders</b> are created for each store.<br/><b>Enabling the Main Order is recommended</b>, as it allows you to send a single email that includes the Main Order and all related Sub-orders. Alternatively, you can send separate emails for the Main Order and each Sub-order.',
				'multivendorx'
			),
			options: [
				{
					key: 'mainorder',
					label: __('Main Order (Combined)', 'multivendorx'),
					desc: __(
						'Customers receive one combined order and one invoice for their entire purchase.',
						'multivendorx'
					),
					icon: 'cart',
					value: 'mainorder',
					customHtml: `<div class="choice-toggle-notice">
					<div><strong>Best for: </strong> Marketplaces that want a simple checkout and order experience for customers.</div>
				</div>`,
				},
				{
					key: 'suborders',
					label: __('Sub-Orders (Per Store)', 'multivendorx'),
					desc: __(
						'Customers receive separate orders and invoices for each store they buy from.',
						'multivendorx'
					),
					icon: 'order',
					value: 'suborders',
					customHtml: `<div class="choice-toggle-notice">
					<div><strong>Best for: </strong> Marketplaces where each store manages its own orders and invoices.</div>
				</div>`,
				},
				{
					key: 'main_sub',
					label: __(
						'Main + Sub Orders (Combined + Store)',
						'multivendorx'
					),
					desc: __(
						'Customers receive both a single marketplace order and individual store orders with invoices.',
						'multivendorx'
					),
					icon: 'order-completed',
					value: 'main_sub',
					customHtml: `<div class="choice-toggle-notice">
					<div><strong>Best for: </strong> Marketplaces that want full transparency for both marketplace and store purchases.</div>
				</div>`,
				},
			],
		},
		{
			key: 'section',
			type: 'section',
			title: __(
				'Enable content styling tools for stores',
				'multivendorx'
			),
		},
		{
			key: 'tinymce_api_section',
			type: 'text',
			label: __('Tinymce API', 'multivendorx'),
			desc: __(
				'Get your <a href= "https://www.tiny.cloud/blog/how-to-get-tinymce-cloud-up-in-less-than-5-minutes/" target= "_blank">TinyMCE API key <i class="adminfont-external"></i></a> and paste it here, to unlock visual editing tools across the marketplace. Admin and stores can easily format text, add links, lists, and other styling to their store descriptions, announcements, knowledge base posts, and product/listing details-no coding needed.',
				'multivendorx'
			),
		},
		{
			key: 'section',
			type: 'section',
			title: __('Shortcode library', 'multivendorx'),
		},
		{
			key: 'available_shortcodes',
			type: 'shortcode-table',
			label: __('Available shortcodes', 'multivendorx'),
			optionLabel: [
				__('Shortcodes and block', 'multivendorx'),
				__('Description', 'multivendorx'),
				__('Arguments', 'multivendorx'),
				__('Example usage', 'multivendorx'),
			],
			options: [
				{
					key: 'marketplace_registration',
					label: '[marketplace_registration]',
					name: 'Marketplace registration',
					desc: __(
						'Displays the store registration form. Use this to allow new users to sign up as stores.',
						'multivendorx'
					),
				},
				{
					key: 'marketplace_dashboard',
					label: '[marketplace_dashboard]',
					name: 'Marketplace dashboard',
					desc: __(
						'Displays the store dashboard where stores manage products/listings, orders, earnings, and store settings.',
						'multivendorx'
					),
				},
				{
					key: 'marketplace_stores',
					label: '[marketplace_stores]',
					name: 'Show store lists',
					desc: __(
						'Displays a list of all registered stores with ratings. Use this to help customers discover stores.',
						'multivendorx'
					),
					arguments: [
						{
							attribute: 'order',
							description: 'Set sorting direction.',
							accepted: 'ASC, DESC (Default: ASC)',
							default: '[marketplace_stores order="ASC"]',
						},
						{
							attribute: 'per_page',
							description: 'Set how many stores appear per page.',
							accepted: 'Any number (Default: 12)',
							default: '[marketplace_stores per_page="12"]',
						},
					],
				},
				{
					key: 'marketplace_products',
					label: '[marketplace_products]',
					name: 'Show store listings',
					desc: __(
						'Displays all listings added by a store. Use this to create store-specific listings listing pages.',
						'multivendorx'
					),
					arguments: [
						{
							attribute: 'store_id',
							description:
								'Display products/listings from a specific store using Store ID or Store Slug.',
							accepted: 'Store ID',
							default: '[marketplace_products store_id="1"]',
						},

						{
							attribute: 'per_page',
							description:
								'Set how many products/listings appear per page.',
							accepted: 'Any number (Default = 12)',
							default: '[marketplace_products per_page="12"]',
						},

						{
							attribute: 'order_by',
							description:
								'Choose the field used for sorting products/listings.',
							accepted:
								'title, date, price, popularity, rating, menu_order (Default = title)',
							default: '[marketplace_products order_by="title"]',
						},

						{
							attribute: 'order',
							description: 'Set sorting direction.',
							accepted: 'ASC, DESC (Default = ASC)',
							default: '[marketplace_products order="ASC"]',
						},

						{
							attribute: 'category',
							description:
								'Show products/listings from specific categories. Use category slugs separated by commas.',
							accepted: 'Comma-separated category slugs',
							default:
								'[marketplace_products category="clothing,shoes"]',
						},

						{
							attribute: 'operator',
							description:
								'Define how multiple categories should be matched.',
							accepted: 'IN, NOT IN, AND (Default = IN)',
							default:
								'[marketplace_products category="clothing,shoes" operator="IN"]',
						},

						{
							attribute: 'product_visibility',
							description:
								'Filter products/listings based on visibility status.',
							accepted: 'visible, catalog, search, hidden',
							default:
								'[marketplace_products product_visibility="visible"]',
						},
					],
				},
				{
					key: 'marketplace_coupons',
					label: '[marketplace_coupons]',
					name: 'Show store coupons',
					desc: __(
						'Displays coupons created by a store along with their usage details.',
						'multivendorx'
					),
					arguments: [
						{
							attribute: 'store_id',
							description:
								'Display coupons from a specific store using the store ID.',
							accepted: 'Store ID',
							default: '[marketplace_coupons store_id="1"]',
						},
						{
							attribute: 'per_page',
							description:
								'Set how many coupons appear per page.',
							accepted: 'Any number (Default = 10)',
							default: '[marketplace_coupons per_page="10"]',
						},
						{
							attribute: 'order_by',
							description: 'Choose how coupons are sorted.',
							accepted:
								'date, id, title, code, modified (Default = date)',
							default: '[marketplace_coupons order_by="date"]',
						},
						{
							attribute: 'order',
							description: 'Set the sorting direction.',
							accepted: 'ASC, DESC (Default = DESC)',
							default: '[marketplace_coupons order="DESC"]',
						},
					],
				},
			],
		},
	],
};
