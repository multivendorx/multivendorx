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
		icon: 'adminlib-general-tab', // optional icon class
		link: 'https://example.com/video/general-settings',
	},
	docs: {
		icon: 'adminlib-general-tab', // optional icon class
		link: 'https://example.com/docs/general-settings',
	},
	icon: 'adminlib-view-files',
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
			hint: __('Customer order notifications', 'multivendorx'),
		},
		{
			key: 'sms_gateway_selector',
			type: 'setting-toggle',
			label: __('Order emails customers receives', 'multivendorx'),
			settingDescription: __(
				'Choose how order confirmation emails should be sent. ',
				'multivendorx'
			),
			desc: __(
				'In a multivendor setup, a <b>Main Order</b> is the parent order placed by the customer, while <b>Sub-orders</b> are created for each store.<br/><br/><b>Enabling the Main Order is recommended</b>, as it allows you to send a single email that includes the Main Order and all related Sub-orders. Alternatively, you can send separate emails for the Main Order and each Sub-order.',
				'multivendorx'
			),



			options: [
				{
					key: 'mainorder',
					label: __('Main order', 'multivendorx'),
					value: 'mainorder',
				},
				{
					key: 'suborder',
					label: __('Sub-orders Only', 'multivendorx'),
					value: 'suborder',
				},
				{
					key: 'mainnsub',
					label: __('Main & Sub order together', 'multivendorx'),
					value: '',
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
				'Get your <a href= "https://www.tiny.cloud/blog/how-to-get-tinymce-cloud-up-in-less-than-5-minutes/" target= "_blank">TinyMCE API key</a> and paste it here, to unlock visual editing tools across the marketplace. Admin and stores can easily format text, add links, lists, and other styling to their store descriptions, announcements, knowledge base posts, and product details-no coding needed.',
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
			optionLabel: ['Shortcodes', 'Description', 'Arguments'],
			icon: 'adminlib-general-tab',
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
						'Displays the store dashboard where stores manage products, orders, earnings, and store settings.',
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
							description:
								'Decide how the store list is sorted',
							accepted: 'name, category, registered (Default = registered)',
							default: '[marketplace_stores orderby = "registered"]',
						},
						{
							attribute: 'order',
							description: 'Decide the sorting direction (Default = DESC)',
							accepted: 'number',
							default: '[marketplace_stores order = "DESC"]',
						},
					],
				},
				{
					key: 'marketplace_products',
					label: '[marketplace_products]',
					name: 'Show store products',
					desc: __(
						'Displays all products added by a store. Use this to create store-specific product listing pages.',
						'multivendorx'
					),
					arguments: [
						{
							attribute: 'store',
							description:
								'Display products from a specific store. You can use Store ID, store slug, vendor email, or username. Leave empty to show products from all stores.',
							accepted: 'store_id, store name, email, or username (Default = store name)',
							default: '[marketplace_products store = "john-store"]',
						},
						{
							attribute: 'perpage',
							description: 'Set how many products appear per page.',
							accepted: 'Any number (Default = 12)',
							default: '[marketplace_products perpage = "12"]',
						},
						{
							attribute: 'columns',
							description: 'Decide how many products appear in one row.',
							accepted: 'Any number (Default = 12)',
							default: '[marketplace_products columns = "4"]',
						}, 
						{
							attribute: 'filter',
							description: 'Choose which type of products to display. Options: all, recent (new arrivals), featured, sale (discounted), top_rated, best_selling.',
							accepted:
								'all, recent, featured, sale, top_rated, best_selling (Default = featured)',
							default: '[marketplace_products filter = "featured"]',
						},
						{
							attribute: 'sort',
							description: 'Quick preset sorting for common scenarios. Options: latest, oldest, rating (highest rated), popularity (most sold), title (alphabetical). Overrides orderby and order if set.',
							accepted:
								'latest, oldest, rating, popularity, title (Default = latest)',
							default: '[marketplace_products sort = "latest"]',
						},
						{
							attribute: 'orderby',
							description:
								'Choose the field used for sorting when no preset order is selected.',
							accepted: 'title, date, rating (Default = title)',
							default: '[marketplace_products orderby= "title"]',
						},
						{
							attribute: 'order',
							description: 'Set sorting direction',
							accepted: 'ASC, DESC (Default = ASC)',
							default: '[marketplace_products order= "ASC"]',
						},
						{
							attribute: 'category',
							description:
								'Show products from specific categories. Enter category slugs separated by commas. Leave empty to include all categories.',
							accepted: 'Category short names, separated by commas',
							default: '[marketplace_products category= "clothing,shoes"]',
						},
						{
							attribute: 'operator',
							description:
								'Define how selected categories should be matched.',
							accepted: 'IN (Any of the), NOT IN (All of the), AND (None of the)',
							default: '[marketplace_products category= "clothing,accessories" operator = "AND"]',
						},
					],
				},
				{
					key: 'store_coupons',
					label: '[store_coupons]',
					name: 'Show store coupons',
					desc: __(
						'Displays coupons created by a store along with their usage details. Useful for stores to track coupon performance.',
						'multivendorx'
					),
				},
			],
		},
	],
};
