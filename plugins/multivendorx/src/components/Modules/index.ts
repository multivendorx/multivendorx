import { __ } from '@wordpress/i18n';
export default {
	category: true,
	tab: 'modules',
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
			docLink:
				'https://multivendorx.com/docs/knowledgebase/booking-product',
			reqPluging: [
				{
					name: 'WooCommerce Bookings',
					slug: 'woocommerce-bookings/woocommerce-bookings.php',
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
			docLink:
				'https://multivendorx.com/docs/knowledgebase/appointment-product/',
			//settingsLink: appLocalizer.site_url,
			proModule: true,
			reqPluging: [
				{
					name: 'WooCommerce Appointments',
					slug: 'woocommerce-appointments/woocommerce-appointments.php',
					link: 'https://bookingwp.com/plugins/woocommerce-appointments/',
				},
			],
			category: ['marketplace_types', 'product_types'],
		},
		{
			id: 'subscription',
			name: __('Subscription', 'multivendorx'),
			desc: 'Offer recurring payment options (weekly, monthly, or yearly).',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/subscription-product',
			//settingsLink: appLocalizer.site_url,
			proModule: true,
			reqPluging: [
				{
					name: 'WooCommerce Subscriptions',
					slug: 'woocommerce-subscriptions/woocommerce-subscriptions.php',
					link: 'https://woocommerce.com/products/woocommerce-subscriptions/',
				},
			],
			category: ['marketplace_types', 'product_types'],
		},
		{
			id: 'accommodation',
			name: __('Accommodation', 'multivendorx'),
			desc: 'Enable customers to book overnight stays in just a few clicks.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/accommodation-product',
			//settingsLink: appLocalizer.site_url,
			proModule: true,
			reqPluging: [
				{
					name: 'WooCommerce Bookings',
					slug: 'woocommerce-bookings/woocommerce-bookings.php',
					link: 'https://woocommerce.com/products/woocommerce-bookings/',
				},
				{
					name: 'WooCommerce Accommodation Bookings',
					slug: 'woocommerce-accommodation-bookings/woocommerce-accommodation-bookings.php',
					link: 'https://woocommerce.com/products/woocommerce-accommodation-bookings/',
				},
			],
			category: ['marketplace_types', 'product_types'],
		},
		{
			id: 'bundle',
			name: __('Bundle', 'multivendorx'),
			desc: 'Offer product bundles, bulk discounts, or assembled kits.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/bundle-product',
			proModule: true,
			reqPluging: [
				{
					name: 'Product Bundles',
					slug: 'woocommerce-product-bundles/woocommerce-product-bundles.php',
					link: 'https://woocommerce.com/products/product-bundles/',
				},
			],
			category: 'product_types',
		},
		{
			id: 'auction',
			name: __('Auction', 'multivendorx'),
			desc: 'Enable an auction-style selling system similar to eBay.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/auction-product',
			proModule: true,
			reqPluging: [
				{
					name: 'WooCommerce Simple Auctions',
					slug: 'woocommerce-simple-auctions/woocommerce-simple-auctions.php',
					link: 'https://codecanyon.net/item/woocommerce-simple-auctions-wordpress-auctions/6811382',
				},
				{
					name: 'YITH WooCommerce Auctions',
					slug: 'yith-woocommerce-auctions/init.php',
					link: 'https://yithemes.com/themes/plugins/yith-woocommerce-auctions/',
				},
			],
			category: ['marketplace_types', 'product_types'],
		},
		{
			id: 'rental-pro',
			name: __('Rental Pro', 'multivendorx'),
			desc: 'Offer rental or real estate booking services.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/rental-product',
			proModule: true,
			reqPluging: [
				{
					name: 'RnB WooCommerce Booking & Rental',
					slug: 'woocommerce-rental-and-booking/redq-rental-and-bookings.php',
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
			docLink:
				'https://multivendorx.com/docs/knowledgebase/simple-product',
			proModule: false,
			category: 'product_types',
		},
		{
			id: 'variable',
			name: __('Variable', 'multivendorx'),
			desc: 'A product with variations, like different SKU, price, stock option, etc.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/variable-product',
			proModule: true,
			category: 'product_types',
		},
		{
			id: 'external',
			name: __('External', 'multivendorx'),
			desc: 'List and describe products on your marketplace but sell them elsewhere.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/external-product/',
			proModule: true,
			category: 'product_types',
		},
		{
			id: 'grouped',
			name: __('Grouped', 'multivendorx'),
			desc: 'A collection of simple, related products that can be purchased individually.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/grouped-product',
			proModule: true,
			category: 'product_types',
		},
		{
			id: 'gift-card',
			name: __('Gift Cards', 'multivendorx'),
			desc: 'Sell gift cards to boost sales and attract new customers.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/gift-card/',
			proModule: true,
			reqPluging: [
				{
					name: 'YITH WooCommerce Gift Cards',
					slug: 'yith-woocommerce-gift-cards/init.php',
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
			docLink:
				'https://multivendorx.com/docs/knowledgebase/single-product-multiple-vendors-spmv',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=general`,
			proModule: false,
			category: 'store_management',
			miniModule: true,
		},
		{
			id: 'import-export',
			name: __('Import Export Tools', 'multivendorx'),
			desc: 'Stores will be able to upload or download product lists in bulk using CSV files.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/import-export',
			proModule: true,
			category: 'store_management',
		},
		{
			id: 'store-policy',
			name: __('Store Policy', 'multivendorx'),
			desc: 'Each store publishes its own return, refund, and shipping policies.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/store-policy',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=policy`,
			proModule: false,
			category: 'store_management',
		},
		{
			id: 'follow-store',
			name: __('Follow Store', 'multivendorx'),
			desc: 'Customers follow stores to receive updates, offers, and product alerts.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/follow-store',
			proModule: false,
			category: ['store_management', 'customer_experience'],
		},
		{
			id: 'store-review',
			name: __('Store Review', 'multivendorx'),
			desc: 'Customers leave ratings and written reviews on store pages.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/store-review',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=store-reviews`,
			proModule: false,
			category: ['store_management', 'customer_experience'],
		},
		{
			id: 'business-hours',
			name: __('Business Hours', 'multivendorx'),
			desc: 'Shows store opening and closing times for customers.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/business-hours/',
			proModule: true,
			category: 'store_management',
			miniModule: true,
		},
		{
			id: 'vacation',
			name: __('Vacation', 'multivendorx'),
			desc: 'Temporarily disables sales when a store is closed, with a message shown to customers.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/vacation',
			proModule: true,
			category: 'store_management',
		},
		{
			id: 'staff-manager',
			name: __('Staff Manager', 'multivendorx'),
			desc: 'Store owners add staff accounts with role-based access to manage orders, products, or support.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/staff-manager',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=user-permissions`,
			proModule: true,
			category: 'store_management',
			miniModule: true,
		},
		{
			id: 'privacy',
			name: __('Privacy', 'multivendorx'),
			desc: 'Hide sensitive store information from customers, including contact details, location, or other specified data.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/NA',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=privacy`,
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
			docLink:
				'https://multivendorx.com/docs/knowledgebase/paypal-marketplace-real-time-split/',
			//settingsLink: admin_url('admin.php?page=wc-settings&tab=checkout&section=mvx_paypal_marketplace'),
			proModule: true,
			category: 'payment_management',
			miniModule: true,
		},
		{
			id: 'stripe-marketplace',
			name: __('Stripe Marketplace', 'multivendorx'),
			desc: 'Automatically sends a store’s share immediately after a customer order is completed.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/stripe-marketplace',
			//settingsLink: admin_url('admin.php?page=mvx#&submenu=payment&name=payment-stripe-connect'),
			proModule: true,
			category: 'payment_management',
			miniModule: true,
		},
		// {
		// 	id: 'mangopay',
		// 	name: __('Mangopay', 'multivendorx'),
		// 	desc: 'Gives the benefit of both realtime split transfer and scheduled distribution',
		// 	docLink: 'https://multivendorx.com/docs/knowledgebase/mangopay',
		// 	//settingsLink: admin_url('admin.php?page=mvx-setting-admin'),
		// 	proModule: true,
		// 	category: 'payment_management',
		// },
		{
			id: 'razorpay',
			name: __('Razorpay', 'multivendorx'),
			desc: 'For clients looking to pay multiple Indian stores instantly',
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
			docLink:
				'https://multivendorx.com/docs/knowledgebase/distance-shipping',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=shipping`,
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
			docLink:
				'https://multivendorx.com/docs/knowledgebase/weight-shipping',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=shipping`,
			proModule: false,
			reqPluging: [
				{
					name: 'Table Rate Shipping',
					slug: 'woocommerce-table-rate-shipping/woocommerce-table-rate-shipping.php',
					link: 'https://woocommerce.com/products/table-rate-shipping/',
				},
			],
			category: 'shipping_management',
		},
		{
			id: 'per-product-shipping',
			name: __('Per Product Shipping', 'multivendorx'),
			desc: 'Custom shipping charge applied to individual products.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/per-product-shipping',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=shipping`,
			proModule: true,
			reqPluging: [
				{
					name: 'Per Product Shipping for WooCommerce',
					slug: 'woocommerce-per-product-shipping/woocommerce-per-product-shipping.php',
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
			docLink:
				'https://multivendorx.com/docs/knowledgebase/invoice-packing-slip',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=invoices`,
			proModule: true,
			category: 'customer_experience',
			miniModule: true,
		},
		{
			id: 'live-chat',
			name: __('Live Chat', 'multivendorx'),
			desc: 'Customers send real-time messages to stores about products or orders.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/live-chat',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=live-chat`,
			proModule: true,
			category: 'customer_experience',
		},
		{
			id: 'store-support',
			name: __('Store Support', 'multivendorx'),
			desc: 'Built-in ticketing system for customers to raise and track support requests.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/store-support/',
			proModule: true,
			category: 'customer_experience',
		},
		{
			id: 'question-answer',
			name: __('Question & Answer', 'multivendorx'),
			desc: 'Customers can publicly ask product questions.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/NA',
			proModule: false,
			category: 'customer_experience',
		},
		{
			id: 'enquiry',
			name: __('Enquiry', 'multivendorx'),
			desc: 'Customers can send private product inquiries.',
			//docLink: 'https://multivendorx.com/docs/knowledgebase/NA',
			reqPluging: [
				{
					name: 'CatalogX',
					slug: 'woocommerce-catalog-enquiry/woocommerce-catalog-enquiry.php',
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
			docLink:
				'https://multivendorx.com/docs/knowledgebase/marketplace-refund',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=refunds`,
			proModule: false,
			category: ['store_management', 'customer_experience'],
		},
		{ type: 'separator', id: 'analytics_tools', label: 'Marketing Tools' },
		{
			id: 'store-analytics',
			name: __('Store Analytics', 'multivendorx'),
			desc: 'Reports on sales, orders, and revenue, with integration for Google Analytics.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/store-analytics',
			proModule: true,
			category: ['analytics_tools', 'store_management'],
		},
		{
			id: 'search-discovery',
			name: __('Search & Discovery', 'multivendorx'),
			desc: 'SEO settings for store pages and products using Rank Math or Yoast SEO.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/store-seo',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=seo`,
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
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=intelligence`,
			docLink:
				'https://multivendorx.com/docs/knowledgebase/marketplace-intelligence',
			category: 'marketplace_boosters',
		},
		{
			id: 'marketplace-compliance',
			name: __('Compliance', 'multivendorx'),
			desc: 'Ensure stores meet marketplace requirements with automated policy checks.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/NA',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=compliance`,
						category: 'marketplace_boosters',
		},
		{
			id: 'marketplace-membership',
			name: __('Marketplace Membership', 'multivendorx'),
			desc: 'Admin defines membership levels with specific capabilities for different stores.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/marketplace-memberhsip',
			proModule: true,
			category: 'marketplace_boosters',
		},

		{
			id: 'facilitator',
			name: __('Facilitator', 'multivendorx'),
			desc: 'Share commission on a sale between the store and another designated user. Each participant receives their assigned portion automatically.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/NA',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=facilitator`,
			proModule: true,
			category: 'marketplace_boosters',
			miniModule: true,
		},
		{
			id: 'marketplace-fee',
			name: __('Marketplace Fee', 'multivendorx'),
			desc: 'Set and manage platform fees for each order or store to cover operational costs',
			docLink: 'https://multivendorx.com/docs/knowledgebase/NA',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=store-commissions`,
			proModule: true,
			category: 'marketplace_boosters',
		},
		{
			id: 'franchises-module',
			name: __('Franchises', 'multivendorx'),
			desc: 'Enables franchise-style ordering with store-created orders, admin-product ordering, and automatic store assignment based on customer location.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/NA',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=franchises`,
			proModule: true,
			category: ['store_management', 'marketplace_boosters'],
			miniModule: true,
		},

		{
			id: 'marketplace-gateway',
			name: __('Payment Gateway Charge', 'multivendorx'),
			desc: 'Payment gateway fees are deducted from vendor commissions by the admin, ensuring platform costs are covered automatically.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/payment-gateway-charge/',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=store-commissions`,
			proModule: false,
			category: ['store_management', 'payment_management'],
		},
		{
			id: 'advertisement',
			name: __('Advertise Product', 'multivendorx'),
			desc: 'Paid promotion for products within the marketplace, boosting visibility.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/advertise-product/',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=product-advertising`,
			proModule: true,
			category: 'marketplace_boosters',
		},
		{
			id: 'wholesale',
			name: __('Wholesale', 'multivendorx'),
			desc: 'Stores set wholesale prices and bulk purchase rules for selected customer groups.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/wholesale',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=wholesale`,
			proModule: true,
			category: ['analytics_tools', 'store_management'],
			miniModule: true,
		},
		{
			id: 'store-inventory',
			name: __('Store Inventory', 'multivendorx'),
			desc: 'Manages stock levels, sends low-stock alerts, and maintains a waitlist for out-of-stock products.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/store-inventory',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=inventory`,
			proModule: true,
			category: 'marketplace_boosters',
			miniModule: true,
		},
		{
			id: 'min-max',
			name: __('Min Max', 'multivendorx'),
			desc: 'Defines the minimum or maximum number of items a customer can purchase in a single order.',
			docLink:
				'https://multivendorx.com/docs/non-knowledgebase/min-max-quantities/',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=min-max`,
			proModule: false,
			category: 'marketplace_boosters',
			miniModule: true,
		},
		{ type: 'separator', id: 'notification', label: 'Notification' },
		{
			id: 'announcement',
			name: __('Announcement', 'multivendorx'),
			desc: 'Marketplace-wide notices or updates sent from admin to all stores.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/announcement/',
			proModule: false,
			category: ['notification', 'marketplace_boosters'],
			reloadOnChange: true,
		},
		{
			id: 'knowledgebase',
			name: __('Knowledgebase', 'multivendorx'),
			desc: 'Guides, tutorials, and FAQs shared with stores by the admin.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/knowledgebase/',
			proModule: false,
			category: 'notification',
			reloadOnChange: true,
		},
		{ type: 'separator', id: 'integration', label: 'Integration' },
		{
			id: 'elementor',
			name: __('Elementor', 'multivendorx'),
			desc: 'Drag-and-drop design support for custom store pages with Elementor.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/mvx-elementor',
			proModule: false,
			reqPluging: [
				{
					name: 'Elementor Website Builder',
					slug: 'elementor/elementor.php',
					link: 'https://wordpress.org/plugins/elementor/',
				},
				{
					name: 'Elementor Pro',
					slug: 'elementor-pro/elementor-pro.php',
					link: 'https://elementor.com/pricing/',
				},
			],
			category: 'integration',
		},
		{
			id: 'buddypress',
			name: __('Buddypress', 'multivendorx'),
			desc: 'Adds social networking features to stores (profiles, connections, messaging).',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/mvx-buddypress',
			proModule: false,
			reqPluging: [
				{
					name: 'BuddyPress',
					slug: 'buddypress/class-buddypress.php',
					link: 'https://wordpress.org/plugins/buddypress/',
				},
			],
			category: 'integration',
		},
		{
			id: 'wpml',
			name: __('WPML', 'multivendorx'),
			desc: 'Multi-language support so products and stores can be displayed in different languages.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/mvx-wpml',
			proModule: false,
			reqPluging: [
				{
					name: 'WPML',
					slug: 'sitepress-multilingual-cms/sitepress.php',
					link: 'https://wpml.org/',
				},
				{
					name: 'WooCommerce Multilingual',
					slug: 'woocommerce-multilingual/wpml-woocommerce.php',
					link: 'https://wordpress.org/plugins/woocommerce-multilingual/',
				},
			],
			category: 'integration',
		},
		{
			id: 'advance-custom-field',
			name: __('Advance Custom field', 'multivendorx'),
			desc: 'Extra custom product fields created by admin for stores to use.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/mvx-acf',
			proModule: true,
			reqPluging: [
				{
					name: 'Advanced Custom Fields',
					slug: 'advanced-custom-fields/acf.php',
					link: 'https://wordpress.org/plugins/advanced-custom-fields/',
				},
			],
			category: 'integration',
		},
		{
			id: 'geo-my-wp',
			name: __('GEOmyWP', 'multivendorx'),
			desc: 'Lets stores pinpoint their location on an interactive map, making it easy for customers to discover nearby stores',
			docLink: 'https://multivendorx.com/docs/knowledgebase/geo-my-wp',
			proModule: true,
			reqPluging: [
				{
					name: 'GEOmyWP',
					slug: 'geo-my-wp/geo-my-wp.php',
					link: 'https://wordpress.org/plugins/geo-my-wp/',
				},
			],
			category: 'integration',
		},
		{
			id: 'wp-affiliate',
			name: __('WP Affiliate', 'multivendorx'),
			desc: 'Affiliate program that tracks referrals and commissions for marketplace products.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/affiliate-product/',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=affiliate`,
			proModule: true,
			reqPluging: [
				{
					name: 'AffiliateWP',
					slug: 'affiliate-wp/affiliate-wp.php',
					link: 'https://affiliatewp.com/',
				},
			],
			category: 'integration',
		},
		{
			id: 'product-addon',
			name: __('Product Addon', 'multivendorx'),
			desc: 'Adds optional extras to products such as gift wrapping, engravings, or warranties.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/mvx-product-addon',
			proModule: true,
			reqPluging: [
				{
					name: 'Product AddOns',
					slug: 'woocommerce-product-addons/woocommerce-product-addons.php',
					link: 'https://woocommerce.com/products/product-add-ons/',
				},
			],
			category: 'integration',
		},
		{
			id: 'shipstation-module',
			name: __('Shipstation', 'multivendorx'),
			desc: 'Integration with ShipStation for advanced shipping management and label printing.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/shipstation/',
			proModule: true,
			category: ['integration', 'Shipping management'],
		},
		{
			id: 'geo-location',
			name: __('Geo Location', 'multivendorx'),
			desc: 'Lets stores pinpoint their location on an interactive map, making it easy for customers to discover nearby stores and shop locally.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/store-location/',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=geolocation`,
			proModule: false,
			category: 'store_management',
		},
	],
};
