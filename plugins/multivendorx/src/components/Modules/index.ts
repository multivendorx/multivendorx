import { __ } from '@wordpress/i18n';
export default {
	category: true,
	tab: 'modules',
	description:
		'',
	modules: [
		{
			type: 'separator',
			id: 'marketplace_types',
			label: 'Marketplace Types',
		},
		{
			id: 'booking',
			name: __('Booking', 'multivendorx'),
			desc: 'Allow customers to reserve appointments, equipment, or services.',
			icon: 'adminfont-booking',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/booking-product',
			reqPluging: [
				{
					name: 'WooCommerce Booking',
					link: 'https://woocommerce.com/products/woocommerce-bookings/',
				},
			],
			proModule: true,
			category: ['marketplace_types', 'product_types'],
		},
		{
			id: 'appointment',
			name: __('Appointments', 'multivendorx'),
			desc: 'Dedicated appointment booking functionality.',
			icon: 'adminfont-appointments',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/appointment-product/',
			//settingsLink: appLocalizer.site_url,
			proModule: true,
			reqPluging: [
				{
					name: 'WooCommerce Appointment',
					link: 'https://bookingwp.com/plugins/woocommerce-appointments/',
				},
			],
			category: ['marketplace_types', 'product_types'],
		},
		{
			id: 'subscription',
			name: __('Subscription', 'multivendorx'),
			desc: 'Offer recurring payment options (weekly, monthly, or yearly).',
			icon: 'adminfont-subscription',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/subscription-product',
			//settingsLink: appLocalizer.site_url,
			proModule: true,
			reqPluging: [
				{
					name: 'WooCommerce Subscription',
					link: 'https://woocommerce.com/products/woocommerce-subscriptions/',
				},
			],
			category: ['marketplace_types', 'product_types'],
		},
		{
			id: 'accommodation',
			name: __('Accommodation', 'multivendorx'),
			desc: 'Enable customers to book overnight stays in just a few clicks.',
			icon: 'adminfont-accommodation',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/accommodation-product',
			//settingsLink: appLocalizer.site_url,
			proModule: true,
			reqPluging: [
				{
					name: 'WooCommerce Booking',
					link: 'https://woocommerce.com/products/woocommerce-bookings/',
				},
				{
					name: 'WooCommerce Accommodation Booking',
					link: 'https://woocommerce.com/products/woocommerce-accommodation-bookings/',
				},
			],
			category: ['marketplace_types', 'product_types'],
		},
		{
			id: 'bundle',
			name: __('Bundle', 'multivendorx'),
			desc: 'Offer product bundles, bulk discounts, or assembled kits.',
			icon: 'adminfont-bundle',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/bundle-product',
			proModule: true,
			reqPluging: [
				{
					name: 'Product Bundle',
					link: 'https://woocommerce.com/products/product-bundles/',
				},
			],
			category: 'product_types',
		},
		{
			id: 'auction',
			name: __('Auction', 'multivendorx'),
			desc: 'Enable an auction-style selling system similar to eBay.',
			icon: 'adminfont-auction',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/auction-product',
			proModule: true,
			reqPluging: [
				{
					name: 'WooCommerce Simple Auction',
					link: 'https://codecanyon.net/item/woocommerce-simple-auctions-wordpress-auctions/6811382',
				},
				{
					name: 'YITH WooCommerce Auction',
					link: 'https://yithemes.com/themes/plugins/yith-woocommerce-auctions/',
				},
			],
			category: ['marketplace_types', 'product_types'],
		},
		{
			id: 'rental-pro',
			name: __('Rental Pro', 'multivendorx'),
			desc: 'Offer rental or real estate booking services.',
			icon: 'adminfont-rental-pro',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/rental-product',
			//settingsLink: appLocalizer.site_url,
			proModule: true,
			reqPluging: [
				{
					name: 'RnB WooCommerce Booking & Rental',
					link: 'https://codecanyon.net/item/rnb-woocommerce-rental-booking-system/14835145?ref=redqteam',
				},
			],
			category: ['marketplace_types', 'product_types'],
		},
		{ type: 'separator', id: 'product_types', label: 'Product Types' },
		{
			id: 'simple',
			name: __('Simple', 'multivendorx'),
			desc: 'Covers basic products such as physical goods (books, clothing) or digital items (PDFs, music, software).',
			icon: 'adminfont-simple',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/simple-product',
			//settingsLink: appLocalizer.site_url,
			proModule: false,
			category: 'product_types',
		},
		{
			id: 'variable',
			name: __('Variable', 'multivendorx'),
			desc: 'A product with variations, like different SKU, price, stock option, etc.',
			icon: 'adminfont-variable',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/variable-product',
			//settingsLink: appLocalizer.site_url,
			proModule: true,
			category: 'product_types',
		},
		{
			id: 'external',
			name: __('External', 'multivendorx'),
			desc: 'List and describe products on your marketplace but sell them elsewhere.',
			icon: 'adminfont-external',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/external-product/',
			//settingsLink: appLocalizer.site_url,
			proModule: true,
			category: 'product_types',
		},
		{
			id: 'grouped',
			name: __('Grouped', 'multivendorx'),
			desc: 'A collection of simple, related products that can be purchased individually.',
			icon: 'adminfont-grouped',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/grouped-product',
			//settingsLink: appLocalizer.site_url,
			proModule: true,
			category: 'product_types',
		},
		{
			id: 'gift-card',
			name: __('Gift Cards', 'multivendorx'),
			desc: 'Sell gift cards to boost sales and attract new customers.',
			icon: 'adminfont-gift-card',
			docLink: 'https://multivendorx.com/docs/knowledgebase/gift-card/',
			//settingsLink: appLocalizer.site_url,
			proModule: true,
			reqPluging: [
				{
					name: 'YITH WooCommerce Gift Cards',
					link: 'https://wordpress.org/plugins/yith-woocommerce-gift-cards/',
				},
			],
			category: 'product_types',
		},
		{
			type: 'separator',
			id: 'store_management',
			label: 'Store Management',
		},
		{
			id: 'shared-listing',
			name: __('Shared listing', 'multivendorx'),
			desc: 'Allows more than one store to sell the same product with their own price and stock.',
			icon: 'adminfont-spmv',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/single-product-multiple-vendors-spmv',
			settingsLink: `${appLocalizer.plugin_url}settings&subtab=general`,
			proModule: false,
			category: 'store_management',
		},
		{
			id: 'import-export',
			name: __('Import Export Tools', 'multivendorx'),
			desc: 'Stores will be able to upload or download product lists in bulk using CSV files.',
			icon: 'adminfont-import-export',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/import-export',
			proModule: true,
			category: 'store_management',
		},
		{
			id: 'store-policy',
			name: __('Store Policy', 'multivendorx'),
			desc: 'Each store publishes its own return, refund, and shipping policies.',
			icon: 'adminfont-store-policy',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/store-policy',
			settingsLink: `${appLocalizer.plugin_url}settings&subtab=policy`,
			proModule: false,
			category: 'store_management',
		},
		{
			id: 'follow-store',
			name: __('Follow Store', 'multivendorx'),
			desc: 'Customers follow stores to receive updates, offers, and product alerts.',
			icon: 'adminfont-follow-store',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/follow-store',
			proModule: false,
			category: ['store_management', 'customer_experience'],
		},
		{
			id: 'store-review',
			name: __('Store Review', 'multivendorx'),
			desc: 'Customers leave ratings and written reviews on store pages.',
			icon: 'adminfont-store-review',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/store-review',
			settingsLink: `${appLocalizer.plugin_url}settings&subtab=store-reviews`,
			proModule: false,
			category: ['store_management', 'customer_experience'],
		},
		{
			id: 'business-hours',
			name: __('Business Hours', 'multivendorx'),
			desc: 'Shows store opening and closing times for customers.',
			icon: 'adminfont-business-hours',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/business-hours/',
			proModule: true,
			category: 'store_management',
		},
		{
			id: 'vacation',
			name: __('Vacation', 'multivendorx'),
			desc: 'Temporarily disables sales when a store is closed, with a message shown to customers.',
			icon: 'adminfont-vacation',
			docLink: 'https://multivendorx.com/docs/knowledgebase/vacation',
			proModule: true,
			category: 'store_management',
		},
		{
			id: 'staff-manager',
			name: __('Staff Manager', 'multivendorx'),
			desc: 'Store owners add staff accounts with role-based access to manage orders, products, or support.',
			icon: 'adminfont-staff-manager',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/staff-manager',
			settingsLink: `${appLocalizer.plugin_url}settings&subtab=user-permissions`,
			proModule: true,
			category: 'store_management',
		},
		{
			id: 'privacy',
			name: __('Privacy', 'multivendorx'),
			desc: 'Hide sensitive store information from customers, including contact details, location, or other specified data.',
			icon: 'adminfont-privacy',
			docLink: 'https://multivendorx.com/docs/knowledgebase/NA',
			settingsLink: `${appLocalizer.plugin_url}settings&subtab=privacy`,
			proModule: false,
			category: 'store_management',
		},
		{
			type: 'separator',
			id: 'payment_management',
			label: 'Payment Management',
		},

		{
			id: 'paypal-marketplace',
			name: __('PayPal Marketplace', 'multivendorx'),
			desc: 'Using split payment pay stores instantly after a completed order',
			icon: 'adminfont-paypal-marketplace',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/paypal-marketplace-real-time-split/',
			//settingsLink: admin_url('admin.php?page=wc-settings&tab=checkout&section=mvx_paypal_marketplace'),
			proModule: true,
			category: 'payment_management',
		},
		{
			id: 'stripe-marketplace',
			name: __('Stripe Marketplace', 'multivendorx'),
			desc: 'Automatically sends a store’s share immediately after a customer order is completed.',
			icon: 'adminfont-stripe-marketplace',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/stripe-marketplace',
			//settingsLink: admin_url('admin.php?page=mvx#&submenu=payment&name=payment-stripe-connect'),
			proModule: true,
			category: 'payment_management',
		},
		{
			id: 'mangopay',
			name: __('Mangopay', 'multivendorx'),
			desc: 'Gives the benefit of both realtime split transfer and scheduled distribution',
			icon: 'adminfont-mangopay',
			docLink: 'https://multivendorx.com/docs/knowledgebase/mangopay',
			//settingsLink: admin_url('admin.php?page=mvx-setting-admin'),
			proModule: true,
			category: 'payment_management',
		},
		{
			id: 'razorpay',
			name: __('Razorpay', 'multivendorx'),
			desc: 'For clients looking to pay multiple Indian stores instantly',
			icon: 'adminfont-razorpay',
			docLink: 'https://multivendorx.com/docs/knowledgebase/payment/',
			//settingsLink: admin_url('admin.php?page=mvx-setting-admin'),
			proModule: false,
			category: 'payment_management',
		},
		{
			type: 'separator',
			id: 'shipping_management',
			label: 'Shipping Management',
		},
		{
			id: 'store-shipping',
			name: __('Store Shipping', 'multivendorx'),
			desc: 'Shipping charges calculated based on distance between store address and delivery location.',
			icon: 'adminfont-store-shipping',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/distance-shipping',
			settingsLink: `${appLocalizer.plugin_url}settings&subtab=shipping`,
			proModule: false,
			category: 'shipping_management',
		},
		{
			id: 'weight-shipping',
			name: __(
				'Weight Wise Shipping (using Table Rate Shipping)',
				'multivendorx'
			),
			desc: 'Shipping cost determined by weight, order value, or product quantity.',
			icon: 'adminfont-weight-shipping',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/weight-shipping',
			settingsLink: `${appLocalizer.plugin_url}settings&subtab=shipping`,
			proModule: false,
			reqPluging: [
				{
					name: 'Table Rate Shipping',
					link: 'https://woocommerce.com/products/table-rate-shipping/',
				},
			],
			category: 'shipping_management',
		},
		{
			id: 'per-product-shipping',
			name: __('Per Product Shipping', 'multivendorx'),
			desc: 'Custom shipping charge applied to individual products.',
			icon: 'adminfont-per-product-shipping',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/per-product-shipping',
			//settingsLink: '${appLocalizer.plugin_url}settings&subtab=single-product-multiple-store',
			proModule: true,
			reqPluging: [
				{
					name: 'Per Product Shipping for WooCommerce',
					link: 'https://woocommerce.com/products/per-product-shipping/',
				},
			],
			category: 'shipping_management',
		},
		{
			type: 'separator',
			id: 'customer_experience',
			label: 'Customer Experience',
		},
		{
			id: 'invoice',
			name: __('Invoice & Packing slip', 'multivendorx'),
			desc: 'Generates invoices and packing slips that can be printed or emailed to customers.',
			icon: 'adminfont-invoice',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/invoice-packing-slip',
			settingsLink: `${appLocalizer.plugin_url}settings&subtab=invoices`,
			proModule: true,
			category: 'customer_experience',
		},
		{
			id: 'live-chat',
			name: __('Live Chat', 'multivendorx'),
			desc: 'Customers send real-time messages to stores about products or orders.',
			icon: 'adminfont-live-chat',
			docLink: 'https://multivendorx.com/docs/knowledgebase/live-chat',
			settingsLink: `${appLocalizer.plugin_url}settings&subtab=live-chat`,
			proModule: true,
			category: 'customer_experience',
		},
		{
			id: 'store-support',
			name: __('Store Support', 'multivendorx'),
			desc: 'Built-in ticketing system for customers to raise and track support requests.',
			icon: 'adminfont-customer-support',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/store-support/',
			proModule: true,
			category: 'customer_experience',
		},
		{
			id: 'question-answer',
			name: __('Question & Answer', 'multivendorx'),
			desc: 'Customers can publicly ask product questions.',
			icon: 'adminfont-question-answer',
			docLink: 'https://multivendorx.com/docs/knowledgebase/NA',
			proModule: false,
			category: 'customer_experience',
		},
		{
			id: 'enquiry',
			name: __('Enquiry', 'multivendorx'),
			desc: 'Customers can send private product inquiries.',
			icon: 'adminfont-enquiry',
			docLink: 'https://multivendorx.com/docs/knowledgebase/NA',
			reqPluging: [
				{
					name: 'CatalogX',
					link: 'https://catalogx.com/?utm_source=multivendorx&utm_medium=pluginsettings&utm_campaign=multivendorx',
				},
			],
			proModule: true,
			category: 'customer_experience',
		},
		{
			id: 'marketplace-refund',
			name: __('Marketplace Refund', 'multivendorx'),
			desc: 'Customers submit refund requests, and stores review and process them directly.',
			icon: 'adminfont-marketplace-refund',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/marketplace-refund',
			settingsLink: `${appLocalizer.plugin_url}settings&subtab=refunds`,
			proModule: false,
			category: ['store_management', 'customer_experience'],
		},
		{ type: 'separator', id: 'analytics_tools', label: 'Marketing Tools' },
		{
			id: 'store-analytics',
			name: __('Store Analytics', 'multivendorx'),
			desc: 'Reports on sales, orders, and revenue, with integration for Google Analytics.',
			icon: 'adminfont-store-analytics',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/store-analytics',
			proModule: true,
			category: ['analytics_tools', 'store_management'],
		},
		{
			id: 'store-seo',
			name: __('Store SEO', 'multivendorx'),
			desc: 'SEO settings for store pages and products using Rank Math or Yoast SEO.',
			icon: 'adminfont-store-seo',
			docLink: 'https://multivendorx.com/docs/knowledgebase/store-seo',
			settingsLink: `${appLocalizer.plugin_url}settings&subtab=seo`,
			proModule: true,
			category: ['analytics_tools', 'store_management'],
		},
		{
			type: 'separator',
			id: 'marketplace_boosters',
			label: 'Marketplace Boosters',
		},
		{
			id: 'marketplace-intelligence',
			name: __('Intelligence', 'multivendorx'),
			desc: 'Let stores create high-converting product descriptions and images instantly using AI.',
			icon: 'adminfont-marketplace-intelligence',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/marketplace-intelligence',
			category: 'marketplace_boosters',
		},
		{
			id: 'marketplace-compliance',
			name: __('Compliance', 'multivendorx'),
			desc: 'Ensure stores meet marketplace requirements with automated policy checks.',
			icon: 'adminfont-compliance',
			docLink: 'https://multivendorx.com/docs/knowledgebase/NA',
			settingsLink: `${appLocalizer.plugin_url}settings&subtab=compliance`,
			// proModule: true,
			category: 'marketplace_boosters',
		},
		{
			id: 'marketplace-membership',
			name: __('Marketplace Membership', 'multivendorx'),
			desc: 'Admin defines membership levels with specific capabilities for different stores.',
			icon: 'adminfont-marketplace-membership',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/marketplace-memberhsip',
			proModule: true,
			category: 'marketplace_boosters',
		},
		
		{
			id: 'facilitator',
			name: __('Facilitator', 'multivendorx'),
			desc: 'Share commission on a sale between the store and another designated user. Each participant receives their assigned portion automatically.',
			icon: 'adminfont-facilitator',
			docLink: 'https://multivendorx.com/docs/knowledgebase/NA',
			settingsLink: `${appLocalizer.plugin_url}settings&subtab=facilitator`,
			proModule: true,
			category: 'marketplace_boosters',
		},
		{
			id: 'marketplace-fee',
			name: __('Marketplace Fee', 'multivendorx'),
			desc: 'Set and manage platform fees for each order or store to cover operational costs',
			icon: 'adminfont-marketplace-fee',
			docLink: 'https://multivendorx.com/docs/knowledgebase/NA',
			settingsLink: `${appLocalizer.plugin_url}settings&subtab=store-commissions`,
			proModule: true,
			category: 'marketplace_boosters',
		},
		{
			id: 'franchises-module',
			name: __('Franchises', 'multivendorx'),
			desc: 'Enables franchise-style ordering with store-created orders, admin-product ordering, and automatic store assignment based on customer location.',
			icon: 'adminfont-franchises-module',
			docLink: 'https://multivendorx.com/docs/knowledgebase/NA',
			settingsLink: `${appLocalizer.plugin_url}settings&subtab=franchises`,
			proModule: true,
			category: ['store_management', 'marketplace_boosters'],
		},

		{
			id: 'marketplace-gateway',
			name: __('Payment Gateway Charge', 'multivendorx'),
			desc: 'Payment gateway fees are deducted from vendor commissions by the admin, ensuring platform costs are covered automatically.',
			icon: 'adminfont-marketplace-gateway',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/payment-gateway-charge/',
			settingsLink: `${appLocalizer.plugin_url}settings&subtab=store-commissions`,
			proModule: false,
			category: ['store_management', 'payment_management'],
		},
		{
			id: 'advertisement',
			name: __('Advertise Product', 'multivendorx'),
			desc: 'Paid promotion for products within the marketplace, boosting visibility.',
			icon: 'adminfont-advertisement',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/advertise-product/',
			settingsLink: `${appLocalizer.plugin_url}settings&subtab=product-advertising`,
			proModule: true,
			category: 'marketplace_boosters',
		},
		{
			id: 'wholesale',
			name: __('Wholesale', 'multivendorx'),
			desc: 'Stores set wholesale prices and bulk purchase rules for selected customer groups.',
			icon: 'adminfont-wholesale',
			docLink: 'https://multivendorx.com/docs/knowledgebase/wholesale',
			settingsLink: `${appLocalizer.plugin_url}settings&subtab=wholesale`,
			proModule: true,
			category: ['analytics_tools', 'store_management'],
		},
		{
			id: 'store-inventory',
			name: __('Store Inventory', 'multivendorx'),
			desc: 'Manages stock levels, sends low-stock alerts, and maintains a waitlist for out-of-stock products.',
			icon: 'adminfont-store-inventory',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/store-inventory',
			settingsLink: `${appLocalizer.plugin_url}settings&subtab=inventory`,
			proModule: true,
			category: 'marketplace_boosters',
		},
		{
			id: 'min-max',
			name: __('Min Max', 'multivendorx'),
			desc: 'Defines the minimum or maximum number of items a customer can purchase in a single order.',
			icon: 'adminfont-min-max',
			docLink:
				'https://multivendorx.com/docs/non-knowledgebase/min-max-quantities/',
			settingsLink: `${appLocalizer.plugin_url}settings&subtab=min-max`,
			proModule: false,
			category: 'marketplace_boosters',
		},
		{ type: 'separator', id: 'notification', label: 'Notification' },
		{
			id: 'announcement',
			name: __('Announcement', 'multivendorx'),
			desc: 'Marketplace-wide notices or updates sent from admin to all stores.',
			icon: 'adminfont-announcement',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/announcement/',
			proModule: false,
			category: ['notification', 'marketplace_boosters'],
			reloadOnChange: true
		},
		{
			id: 'knowledgebase',
			name: __('Knowledgebase', 'multivendorx'),
			desc: 'Guides, tutorials, and FAQs shared with stores by the admin.',
			icon: 'adminfont-book',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/knowledgebase/',
			proModule: false,
			category: 'notification',
			reloadOnChange: true
		},
		{ type: 'separator', id: 'integration', label: 'Integration' },
		{
			id: 'elementor',
			name: __('Elementor', 'multivendorx'),
			desc: 'Drag-and-drop design support for custom store pages with Elementor.',
			icon: 'adminfont-elementor',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/mvx-elementor',
			proModule: false,
			reqPluging: [
				{
					name: 'Elementor Website Builder',
					link: 'https://wordpress.org/plugins/elementor/',
				},
				{
					name: 'Elementor Pro',
					link: 'https://elementor.com/pricing/',
				},
			],
			category: 'integration',
		},
		{
			id: 'buddypress',
			name: __('Buddypress', 'multivendorx'),
			desc: 'Adds social networking features to stores (profiles, connections, messaging).',
			icon: 'adminfont-buddypress',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/mvx-buddypress',
			proModule: false,
			reqPluging: [
				{
					name: 'BuddyPress',
					link: 'https://wordpress.org/plugins/buddypress/',
				},
			],
			category: 'integration',
		},
		{
			id: 'wpml',
			name: __('WPML', 'multivendorx'),
			desc: 'Multi-language support so products and stores can be displayed in different languages.',
			icon: 'adminfont-wpml',
			docLink: 'https://multivendorx.com/docs/knowledgebase/mvx-wpml',
			proModule: false,
			reqPluging: [
				{ name: 'WPML', link: 'https://wpml.org/' },
				{
					name: 'WooCommerce Multilingual',
					link: 'https://wordpress.org/plugins/woocommerce-multilingual/',
				},
			],
			category: 'integration',
		},
		{
			id: 'advance-custom-field',
			name: __('Advance Custom field', 'multivendorx'),
			desc: 'Extra custom product fields created by admin for stores to use.',
			icon: 'adminfont-advance-custom-field',
			docLink: 'https://multivendorx.com/docs/knowledgebase/mvx-acf',
			proModule: true,
			reqPluging: [
				{
					name: 'Advance Custom Field',
					link: 'https://wordpress.org/plugins/advanced-custom-fields/',
				},
			],
			category: 'integration',
		},
		{
			id: 'geo-my-wp',
			name: __('GEOmyWP', 'multivendorx'),
			desc: 'Lets stores pinpoint their location on an interactive map, making it easy for customers to discover nearby stores',
			icon: 'adminfont-geo-my-wp',
			docLink: 'https://multivendorx.com/docs/knowledgebase/geo-my-wp',
			proModule: true,
			reqPluging: [
				{
					name: 'GEOmyWP',
					link: 'https://wordpress.org/plugins/geo-my-wp/',
				},
			],
			category: 'integration',
		},
		{
			id: 'wp-affiliate',
			name: __('WP Affiliate', 'multivendorx'),
			desc: 'Affiliate program that tracks referrals and commissions for marketplace products.',
			icon: 'adminfont-wp-affiliate',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/affiliate-product/',
			settingsLink: `${appLocalizer.plugin_url}settings&subtab=affiliate`,
			proModule: true,
			reqPluging: [
				{ name: 'Affiliate WP', link: 'https://affiliatewp.com/' },
			],
			category: 'integration',
		},
		{
			id: 'product-addon',
			name: __('Product Addon', 'multivendorx'),
			desc: 'Adds optional extras to products such as gift wrapping, engravings, or warranties.',
			icon: 'adminfont-product-addon',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/mvx-product-addon',
			proModule: true,
			reqPluging: [
				{
					name: 'Product Addons',
					link: 'https://woocommerce.com/products/product-add-ons/',
				},
			],
			category: 'integration',
		},
		{
			id: 'shipstation-module',
			name: __('Shipstation', 'multivendorx'),
			desc: 'Integration with ShipStation for advanced shipping management and label printing.',
			icon: 'adminfont-shipstation-module',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/shipstation/',
			proModule: true,
			category: ['integration', 'Shipping management'],
		},
		{
			id: 'geo-location',
			name: __('Geo Location', 'multivendorx'),
			desc: 'Lets stores pinpoint their location on an interactive map, making it easy for customers to discover nearby stores and shop locally.',
			icon: 'adminfont-geo-location',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/store-location/',
			settingsLink: `${appLocalizer.plugin_url}settings&subtab=geolocation`,
			proModule: false,
			category: 'store_management',
		},
	],
};
