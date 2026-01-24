import { __ } from '@wordpress/i18n';
export default {
	category: true,
	tab: 'modules',
	description:
		'Manage marketplace features by enabling or disabling modules. Turning a module on activates its settings and workflows, while turning it off hides them from admin and stores.',
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
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/booking-product',
			req_pluging: [
				{
					name: 'WooCommerce Booking',
					link: 'https://woocommerce.com/products/woocommerce-bookings/',
				},
			],
			pro_module: true,
			category: ['marketplace_types', 'product_types'],
		},
		{
			id: 'appointment',
			name: __('Appointments', 'multivendorx'),
			desc: 'Dedicated appointment booking functionality.',
			icon: 'adminfont-appointments',
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/appointment-product/',
			//settings_link: appLocalizer.site_url,
			pro_module: true,
			req_pluging: [
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
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/subscription-product',
			//settings_link: appLocalizer.site_url,
			pro_module: true,
			req_pluging: [
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
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/accommodation-product',
			//settings_link: appLocalizer.site_url,
			pro_module: true,
			req_pluging: [
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
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/bundle-product',
			pro_module: true,
			req_pluging: [
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
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/auction-product',
			pro_module: true,
			req_pluging: [
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
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/rental-product',
			//settings_link: appLocalizer.site_url,
			pro_module: true,
			req_pluging: [
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
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/simple-product',
			//settings_link: appLocalizer.site_url,
			pro_module: false,
			category: 'product_types',
		},
		{
			id: 'variable',
			name: __('Variable', 'multivendorx'),
			desc: 'A product with variations, like different SKU, price, stock option, etc.',
			icon: 'adminfont-variable',
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/variable-product',
			//settings_link: appLocalizer.site_url,
			pro_module: true,
			category: 'product_types',
		},
		{
			id: 'external',
			name: __('External', 'multivendorx'),
			desc: 'List and describe products on your marketplace but sell them elsewhere.',
			icon: 'adminfont-external',
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/external-product/',
			//settings_link: appLocalizer.site_url,
			pro_module: true,
			category: 'product_types',
		},
		{
			id: 'grouped',
			name: __('Grouped', 'multivendorx'),
			desc: 'A collection of simple, related products that can be purchased individually.',
			icon: 'adminfont-grouped',
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/grouped-product',
			//settings_link: appLocalizer.site_url,
			pro_module: true,
			category: 'product_types',
		},
		{
			id: 'gift-card',
			name: __('Gift Cards', 'multivendorx'),
			desc: 'Sell gift cards to boost sales and attract new customers.',
			icon: 'adminfont-gift-card',
			doc_link: 'https://multivendorx.com/docs/knowledgebase/gift-card/',
			//settings_link: appLocalizer.site_url,
			pro_module: true,
			req_pluging: [
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
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/single-product-multiple-vendors-spmv',
			settings_link: `${appLocalizer.plugin_url}settings&subtab=general`,
			pro_module: false,
			category: 'store_management',
		},
		{
			id: 'import-export',
			name: __('Import Export Tools', 'multivendorx'),
			desc: 'Stores will be able to upload or download product lists in bulk using CSV files.',
			icon: 'adminfont-import-export',
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/import-export',
			pro_module: true,
			category: 'store_management',
		},
		{
			id: 'store-policy',
			name: __('Store Policy', 'multivendorx'),
			desc: 'Each store publishes its own return, refund, and shipping policies.',
			icon: 'adminfont-store-policy',
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/store-policy',
			settings_link: `${appLocalizer.plugin_url}settings&subtab=policy`,
			pro_module: false,
			category: 'store_management',
		},
		{
			id: 'follow-store',
			name: __('Follow Store', 'multivendorx'),
			desc: 'Customers follow stores to receive updates, offers, and product alerts.',
			icon: 'adminfont-follow-store',
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/follow-store',
			pro_module: false,
			category: ['store_management', 'customer_experience'],
		},
		{
			id: 'store-review',
			name: __('Store Review', 'multivendorx'),
			desc: 'Customers leave ratings and written reviews on store pages.',
			icon: 'adminfont-store-review',
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/store-review',
			settings_link: `${appLocalizer.plugin_url}settings&subtab=review-management`,
			pro_module: false,
			category: ['store_management', 'customer_experience'],
		},
		{
			id: 'business-hours',
			name: __('Business Hours', 'multivendorx'),
			desc: 'Shows store opening and closing times for customers.',
			icon: 'adminfont-business-hours',
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/business-hours/',
			pro_module: true,
			category: 'store_management',
		},
		{
			id: 'vacation',
			name: __('Vacation', 'multivendorx'),
			desc: 'Temporarily disables sales when a store is closed, with a message shown to customers.',
			icon: 'adminfont-vacation',
			doc_link: 'https://multivendorx.com/docs/knowledgebase/vacation',
			pro_module: true,
			category: 'store_management',
		},
		{
			id: 'staff-manager',
			name: __('Staff Manager', 'multivendorx'),
			desc: 'Store owners add staff accounts with role-based access to manage orders, products, or support.',
			icon: 'adminfont-staff-manager',
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/staff-manager',
			settings_link: `${appLocalizer.plugin_url}settings&subtab=user-capability`,
			pro_module: true,
			category: 'store_management',
		},
		{
			id: 'privacy',
			name: __('Privacy', 'multivendorx'),
			desc: 'Hide sensitive store information from customers, including contact details, location, or other specified data.',
			icon: 'adminfont-privacy',
			doc_link: 'https://multivendorx.com/docs/knowledgebase/NA',
			settings_link: `${appLocalizer.plugin_url}settings&subtab=privacy`,
			pro_module: false,
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
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/paypal-marketplace-real-time-split/',
			//settings_link: admin_url('admin.php?page=wc-settings&tab=checkout&section=mvx_paypal_marketplace'),
			pro_module: true,
			category: 'payment_management',
		},
		{
			id: 'stripe-marketplace',
			name: __('Stripe Marketplace', 'multivendorx'),
			desc: 'Automatically sends a store’s share immediately after a customer order is completed.',
			icon: 'adminfont-stripe-marketplace',
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/stripe-marketplace',
			//settings_link: admin_url('admin.php?page=mvx#&submenu=payment&name=payment-stripe-connect'),
			pro_module: true,
			category: 'payment_management',
		},
		{
			id: 'mangopay',
			name: __('Mangopay', 'multivendorx'),
			desc: 'Gives the benefit of both realtime split transfer and scheduled distribution',
			icon: 'adminfont-mangopay',
			doc_link: 'https://multivendorx.com/docs/knowledgebase/mangopay',
			//settings_link: admin_url('admin.php?page=mvx-setting-admin'),
			pro_module: true,
			category: 'payment_management',
		},
		{
			id: 'razorpay',
			name: __('Razorpay', 'multivendorx'),
			desc: 'For clients looking to pay multiple Indian stores instantly',
			icon: 'adminfont-razorpay',
			doc_link: 'https://multivendorx.com/docs/knowledgebase/payment/',
			//settings_link: admin_url('admin.php?page=mvx-setting-admin'),
			pro_module: false,
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
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/distance-shipping',
			settings_link: `${appLocalizer.plugin_url}settings&subtab=shipping`,
			pro_module: false,
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
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/weight-shipping',
			settings_link: `${appLocalizer.plugin_url}settings&subtab=shipping`,
			pro_module: false,
			req_pluging: [
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
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/per-product-shipping',
			//settings_link: '${appLocalizer.plugin_url}settings&subtab=single-product-multiple-store',
			pro_module: true,
			req_pluging: [
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
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/invoice-packing-slip',
			settings_link: `${appLocalizer.plugin_url}settings&subtab=store-invoice`,
			pro_module: true,
			category: 'customer_experience',
		},
		{
			id: 'live-chat',
			name: __('Live Chat', 'multivendorx'),
			desc: 'Customers send real-time messages to stores about products or orders.',
			icon: 'adminfont-live-chat',
			doc_link: 'https://multivendorx.com/docs/knowledgebase/live-chat',
			settings_link: `${appLocalizer.plugin_url}settings&subtab=live-chat`,
			pro_module: true,
			category: 'customer_experience',
		},
		{
			id: 'customer-support',
			name: __('Customer Support', 'multivendorx'),
			desc: 'Built-in ticketing system for customers to raise and track support requests.',
			icon: 'adminfont-customer-support',
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/store-support/',
			pro_module: true,
			category: 'customer_experience',
		},
		{
			id: 'question-answer',
			name: __('Question & Answer', 'multivendorx'),
			desc: 'Customers can publicly ask product questions.',
			icon: 'adminfont-question-answer',
			doc_link: 'https://multivendorx.com/docs/knowledgebase/NA',
			pro_module: false,
			category: 'customer_experience',
		},
		{
			id: 'enquiry',
			name: __('Enquiry', 'multivendorx'),
			desc: 'Customers can send private product inquiries.',
			icon: 'adminfont-enquiry',
			doc_link: 'https://multivendorx.com/docs/knowledgebase/NA',
			req_pluging: [
				{
					name: 'CatalogX',
					link: 'https://catalogx.com/?utm_source=multivendorx&utm_medium=pluginsettings&utm_campaign=multivendorx',
				},
			],
			pro_module: true,
			category: 'customer_experience',
		},
		{
			id: 'marketplace-refund',
			name: __('Marketplace Refund', 'multivendorx'),
			desc: 'Customers submit refund requests, and stores review and process them directly.',
			icon: 'adminfont-marketplace-refund',
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/marketplace-refund',
			settings_link: `${appLocalizer.plugin_url}settings&subtab=order-actions-refunds`,
			pro_module: false,
			category: ['store_management', 'customer_experience'],
		},
		{ type: 'separator', id: 'analytics_tools', label: 'Marketing Tools' },
		{
			id: 'store-analytics',
			name: __('Store Analytics', 'multivendorx'),
			desc: 'Reports on sales, orders, and revenue, with integration for Google Analytics.',
			icon: 'adminfont-store-analytics',
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/store-analytics',
			pro_module: true,
			category: ['analytics_tools', 'store_management'],
		},
		{
			id: 'store-seo',
			name: __('Store SEO', 'multivendorx'),
			desc: 'SEO settings for store pages and products using Rank Math or Yoast SEO.',
			icon: 'adminfont-store-seo',
			doc_link: 'https://multivendorx.com/docs/knowledgebase/store-seo',
			settings_link: `${appLocalizer.plugin_url}settings&subtab=seo`,
			pro_module: true,
			category: ['analytics_tools', 'store_management'],
		},
		{
			type: 'separator',
			id: 'marketplace_boosters',
			label: 'Marketplace Boosters',
		},
		{
			id: 'marketplace-compliance',
			name: __('Compliance', 'multivendorx'),
			desc: 'Ensure stores meet marketplace requirements with automated policy checks.',
			icon: 'adminfont-compliance',
			doc_link: 'https://multivendorx.com/docs/knowledgebase/NA',
			settings_link: `${appLocalizer.plugin_url}settings&subtab=non-compliance`,
			// pro_module: true,
			category: 'marketplace_boosters',
		},
		{
			id: 'marketplace-membership',
			name: __('Marketplace Membership', 'multivendorx'),
			desc: 'Admin defines membership levels with specific capabilities for different stores.',
			icon: 'adminfont-marketplace-membership',
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/marketplace-memberhsip',
			pro_module: true,
			category: 'marketplace_boosters',
		},
		{
			id: 'facilitator',
			name: __('Facilitator', 'multivendorx'),
			desc: 'Share commission on a sale between the store and another designated user. Each participant receives their assigned portion automatically.',
			icon: 'adminfont-facilitator',
			doc_link: 'https://multivendorx.com/docs/knowledgebase/NA',
			settings_link: `${appLocalizer.plugin_url}settings&subtab=facilitator`,
			pro_module: true,
			category: 'marketplace_boosters',
		},
		{
			id: 'marketplace-fee',
			name: __('Marketplace Fee', 'multivendorx'),
			desc: 'Set and manage platform fees for each order or store to cover operational costs',
			icon: 'adminfont-marketplace-fee',
			doc_link: 'https://multivendorx.com/docs/knowledgebase/NA',
			settings_link: `${appLocalizer.plugin_url}settings&subtab=store-commissions`,
			pro_module: true,
			category: 'marketplace_boosters',
		},
		{
			id: 'franchises-module',
			name: __('Franchises', 'multivendorx'),
			desc: 'Enables franchise-style ordering with store-created orders, admin-product ordering, and automatic store assignment based on customer location.',
			icon: 'adminfont-franchises-module',
			doc_link: 'https://multivendorx.com/docs/knowledgebase/NA',
			settings_link: `${appLocalizer.plugin_url}settings&subtab=franchises`,
			pro_module: true,
			category: ['store_management', 'marketplace_boosters'],
		},

		{
			id: 'marketplace-gateway',
			name: __('Payment Gateway Charge', 'multivendorx'),
			desc: 'Payment gateway fees are deducted from vendor commissions by the admin, ensuring platform costs are covered automatically.',
			icon: 'adminfont-marketplace-gateway',
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/payment-gateway-charge/',
			settings_link: `${appLocalizer.plugin_url}settings&subtab=store-commissions`,
			pro_module: false,
			category: ['store_management', 'payment_management'],
		},
		{
			id: 'advertisement',
			name: __('Advertise Product', 'multivendorx'),
			desc: 'Paid promotion for products within the marketplace, boosting visibility.',
			icon: 'adminfont-advertisement',
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/advertise-product/',
			settings_link: `${appLocalizer.plugin_url}settings&subtab=advertising`,
			pro_module: true,
			category: 'marketplace_boosters',
		},
		{
			id: 'wholesale',
			name: __('Wholesale', 'multivendorx'),
			desc: 'Stores set wholesale prices and bulk purchase rules for selected customer groups.',
			icon: 'adminfont-wholesale',
			doc_link: 'https://multivendorx.com/docs/knowledgebase/wholesale',
			settings_link: `${appLocalizer.plugin_url}settings&subtab=wholesale`,
			pro_module: true,
			category: ['analytics_tools', 'store_management'],
		},
		{
			id: 'store-inventory',
			name: __('Store Inventory', 'multivendorx'),
			desc: 'Manages stock levels, sends low-stock alerts, and maintains a waitlist for out-of-stock products.',
			icon: 'adminfont-store-inventory',
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/store-inventory',
			settings_link: `${appLocalizer.plugin_url}settings&subtab=store-inventory`,
			pro_module: true,
			category: 'marketplace_boosters',
		},
		{
			id: 'min-max',
			name: __('Min Max', 'multivendorx'),
			desc: 'Defines the minimum or maximum number of items a customer can purchase in a single order.',
			icon: 'adminfont-min-max',
			doc_link:
				'https://multivendorx.com/docs/non-knowledgebase/min-max-quantities/',
			settings_link: `${appLocalizer.plugin_url}settings&subtab=min-max`,
			pro_module: false,
			category: 'marketplace_boosters',
		},
		{ type: 'separator', id: 'notification', label: 'Notification' },
		{
			id: 'announcement',
			name: __('Announcement', 'multivendorx'),
			desc: 'Marketplace-wide notices or updates sent from admin to all stores.',
			icon: 'adminfont-announcement',
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/announcement/',
			pro_module: false,
			category: ['notification', 'marketplace_boosters'],
			reloadOnChange: true
		},
		{
			id: 'knowledgebase',
			name: __('Knowledgebase', 'multivendorx'),
			desc: 'Guides, tutorials, and FAQs shared with stores by the admin.',
			icon: 'adminfont-book',
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/knowledgebase/',
			pro_module: false,
			category: 'notification',
			reloadOnChange: true
		},
		{ type: 'separator', id: 'integration', label: 'Integration' },
		{
			id: 'elementor',
			name: __('Elementor', 'multivendorx'),
			desc: 'Drag-and-drop design support for custom store pages with Elementor.',
			icon: 'adminfont-elementor',
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/mvx-elementor',
			pro_module: false,
			req_pluging: [
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
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/mvx-buddypress',
			pro_module: false,
			req_pluging: [
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
			doc_link: 'https://multivendorx.com/docs/knowledgebase/mvx-wpml',
			pro_module: false,
			req_pluging: [
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
			doc_link: 'https://multivendorx.com/docs/knowledgebase/mvx-acf',
			pro_module: true,
			req_pluging: [
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
			doc_link: 'https://multivendorx.com/docs/knowledgebase/geo-my-wp',
			pro_module: true,
			req_pluging: [
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
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/affiliate-product/',
			settings_link: `${appLocalizer.plugin_url}settings&subtab=affiliate`,
			pro_module: true,
			req_pluging: [
				{ name: 'Affiliate WP', link: 'https://affiliatewp.com/' },
			],
			category: 'integration',
		},
		{
			id: 'product-addon',
			name: __('Product Addon', 'multivendorx'),
			desc: 'Adds optional extras to products such as gift wrapping, engravings, or warranties.',
			icon: 'adminfont-product-addon',
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/mvx-product-addon',
			pro_module: true,
			req_pluging: [
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
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/shipstation/',
			pro_module: true,
			category: ['integration', 'Shipping management'],
		},
		{
			id: 'geo-location',
			name: __('Geo Location', 'multivendorx'),
			desc: 'Lets stores pinpoint their location on an interactive map, making it easy for customers to discover nearby stores and shop locally.',
			icon: 'adminfont-geo-location',
			doc_link:
				'https://multivendorx.com/docs/knowledgebase/store-location/',
			settings_link: `${appLocalizer.plugin_url}settings&subtab=geolocation`,
			pro_module: false,
			category: 'store_management',
		},
	],
};
