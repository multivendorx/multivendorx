import { __ } from '@wordpress/i18n';

export default {
	id: 'marketplace',
	priority: 1,
	name: __('Overview', 'multivendorx'),
	tabTitle: 'Marketplace pages configuration',
	desc: __(
		'Configure the essential system pages required for your marketplace - including store registration, store dashboard.',
		'multivendorx'
	),
	video: {
		icon: 'adminfont-general-tab', // optional icon class
		link: 'https://example.com/video/general-settings',
	},
	docs: {
		icon: 'adminfont-general-tab', // optional icon class
		link: 'https://example.com/docs/general-settings',
	},
	icon: 'adminfont-view-files',
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
			size: "30rem",
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
			size: "30rem",
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
			size: '8rem',
			preText: appLocalizer.site_url + '/',
			postText: '/sample-store/',
		},
		{
			key: 'section',
			type: 'section',
			hint: __('Customer-facing order presentation & invoicing', 'multivendorx'),
		},
		{
			key: 'display_customer_order',
			type: 'setting-toggle',
			label: __('Customers will see information for', 'multivendorx'),
			custom: true,
			settingDescription: __(
				'Choose which order statuses will send customers email notifications, PDF invoices, and display order details in their account.',
				'multivendorx'
			),
			desc: __(
				'In a multivendor setup, a <b>Main Order</b> is the parent order placed by the customer, while <b>Sub-orders</b> are created for each store.<br/><br/><b>Enabling the Main Order is recommended</b>, as it allows you to send a single email that includes the Main Order and all related Sub-orders. Alternatively, you can send separate emails for the Main Order and each Sub-order.',
				'multivendorx'
			),
			options: [
				{
					key: 'mainorder',
					label: __('Main order (Show one combined order)', 'multivendorx'),
					desc: __('Customer receives separate emails and sees individual store orders', 'multivendorx'),
					icon: 'adminfont-cart',
					value: 'mainorder',
					customHtml: `<div class="toggle-notice">
									<div class="title">What happens</div>
									<ul>
										<li>Customer gets one email about their purchase</li>
										<li>One order shows in "My Account"</li>
										<li>One receipt for everything</li>
									</ul>
								</div>
								<div class="toggle-notice">
									<div class="title">Receipts & tax info</div>
									<ul>
										<li>One receipt issued by Your Marketplace with Your business tax details</li>
									</ul>
								</div>`
				},
				{
					key: 'suborder',
					icon: 'adminfont-cart',
					label: __('Sub-orders Only (Show separate orders by store)', 'multivendorx'),
					desc: __('Customer receives separate emails and sees individual store orders', 'multivendorx'),
					value: 'suborder',
					customHtml: `<div class="toggle-notice">
									<div class="title">What Happens</div>
									<ul>
										<li>Separate email from each store</li>
										<li>Multiple orders show in "My Account" (one per store)</li>
										<li>Separate receipt from each store</li>
									</ul>
								</div>
								<div class="toggle-notice">
									<div class="title">Receipts & tax info</div>
									<ul>
										<li>Multiple receipts (one from each store) issued by Each Store with Each store's tax details</li>
									</ul>
								</div>`					
				},
				{
					key: 'mainnsub',
					icon: 'adminfont-cart',
					label: __('Main & Sub order together (Show both combined + separate)', 'multivendorx'),
					desc: __('Customer receives multiple emails and sees all order versions', 'multivendorx'),
					value: '',
					customHtml: `<div class="toggle-notice">
									<div class="title">What Happens</div>
									<ul>
										<li>One email for complete order + separate emails per store</li>
										<li>Multiple orders in "My Account" (combined + individual)</li>
										<li>Multiple receipts (one from you + one from each store)</li>
									</ul>
								</div>
								<div class="toggle-notice">
									<div class="title">Receipts & tax info</div>
									<ul>
										<li>Multiple receipts (yours + all stores) issued by Your Marketplace + All Stores with Your and each store's tax details</li>
									</ul>
								</div>`
				},
			],
		},
		{
			key: 'section',
			type: 'section',
			hint: __('Enable content styling tools for stores', 'multivendorx'),
		},
		{
			key: 'tinymce_api_section',
			type: 'text',
			label: __('Tinymce API', 'multivendorx'),
			desc: __(
				'Get your <a href= "https://www.tiny.cloud/blog/how-to-get-tinymce-cloud-up-in-less-than-5-minutes/" target= "_blank">TinyMCE API key</a> and paste it here, to unlock visual editing tools across the marketplace. Admin and stores can easily format text, add links, lists, and other styling to their store descriptions, announcements, knowledge base posts, and product/listing details-no coding needed.',
				'multivendorx'
			),
		},
		{
			key: 'section',
			type: 'section',
			hint: __('Shortcode library', 'multivendorx'),
		},
		{
			key: 'available_shortcodes',
			type: 'shortcode-table',
			label: __('Available shortcodes', 'multivendorx'),
			desc: __('', 'multivendorx'),
			optionLabel: ['Shortcodes and block library', 'Description', 'Arguments'],
			icon: 'adminfont-general-tab',
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
							attribute: 'orderby',
							description: 'Decide how the store list is sorted.',
							accepted: 'name, category, registered (Default: registered)',
							default: '[marketplace_stores orderby="registered"]',
						},
						{
							attribute: 'order',
							description: 'Set sorting direction.',
							accepted: 'ASC, DESC (Default: ASC)',
							default: '[marketplace_stores order="ASC"]',
						},
						{
							attribute: 'perpage',
							description: 'Set how many stores appear per page.',
							accepted: 'Any number (Default: 12)',
							default: '[marketplace_stores perpage="12"]',
						},
					],
				},
				{
					key: 'marketplace_products',
					label: '[marketplace_listings]',
					name: 'Show store listings',
					desc: __(
						'Displays all listings added by a store. Use this to create store-specific listings listing pages.',
						'multivendorx'
					),
					arguments: [
						{
							attribute: 'store',
							description:
								'Display products/listings from a specific store using Store ID or Store Slug.',
							accepted: 'store_id, store_slug',
							default: '[marketplace_products store_id="1"]',
						},

						{
							attribute: 'perpage',
							description: 'Set how many products/listings appear per page.',
							accepted: 'Any number (Default = 12)',
							default: '[marketplace_products perPage="12"]',
						},

						{
							attribute: 'columns',
							description: 'Decide how many products/listings appear in one row.',
							accepted: 'Any number (Default = 4)',
							default: '[marketplace_products columns="4"]',
						},

						{
							attribute: 'orderby',
							description:
								'Choose the field used for sorting products/listings.',
							accepted:
								'title, date, price, popularity, rating, menu_order (Default = title)',
							default: '[marketplace_products orderby="title"]',
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
							default: '[marketplace_products category="clothing,shoes"]',
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
					key: 'marketplace-coupons',
					label: '[marketplace-coupons]',
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
							default: '[marketplace-coupons store_id="1"]',
						},
						{
							attribute: 'store_slug',
							description:
								'Display coupons from a specific store using the store slug.',
							accepted: 'Store slug',
							default: '[marketplace-coupons store_slug="john-store"]',
						},
						{
							attribute: 'perPage',
							description:
								'Set how many coupons appear per page.',
							accepted: 'Any number (Default = 10)',
							default: '[marketplace-coupons perPage="10"]',
						},
						{
							attribute: 'orderby',
							description:
								'Choose how coupons are sorted.',
							accepted:
								'date, id, title, code, modified (Default = date)',
							default: '[marketplace-coupons orderby="date"]',
						},
						{
							attribute: 'order',
							description:
								'Set the sorting direction.',
							accepted: 'ASC, DESC (Default = DESC)',
							default: '[marketplace-coupons order="DESC"]',
						},
					],
				}
			],
		},
	],
};
