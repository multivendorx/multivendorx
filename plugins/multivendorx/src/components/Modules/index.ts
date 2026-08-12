/* global appLocalizer */
import { __ } from '@wordpress/i18n';
export default {
	category: true,
	tab: 'modules',
	modules: [
		{
			type: 'separator',
			id: 'marketplace_types',
			label: __('Marketplace Types', 'multivendorx'),
		},
		{
			id: 'booking',
			name: __('Booking', 'multivendorx'),
			desc: 'Allow customers to reserve appointments, equipment, or services.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/booking-product/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			reqPluging: [
				{
					name: 'WooCommerce Bookings',
					slug: 'woocommerce-bookings/woocommerce-bookings.php',
					link: 'https://woocommerce.com/products/woocommerce-bookings/',
				},
			],
			proModule: true,
			proFeatures: [
				__('Set availability rules by date and time slot', 'multivendorx'),
				__('Approve or auto-confirm incoming bookings', 'multivendorx'),
				__('Sync bookings to Google Calendar', 'multivendorx'),
			],
			category: ['marketplace_types', 'product_types'],
		},
		{
			id: 'appointments',
			name: __('Appointments', 'multivendorx'),
			desc: 'Dedicated appointment booking functionality.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/appointment-product/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			//settingsLink: appLocalizer.site_url,
			proModule: true,
			reqPluging: [
				{
					name: 'WooCommerce Appointments',
					slug: 'woocommerce-appointments/woocommerce-appointments.php',
					link: 'https://bookingwp.com/plugins/woocommerce-appointments/',
				},
			],
			proFeatures: [
				__('Interactive calendar for customers to pick a time', 'multivendorx'),
				__('Assign appointments to staff or resources', 'multivendorx'),
				__('Built-in rescheduling and cancellation controls', 'multivendorx'),
			],
			category: ['marketplace_types', 'product_types'],
		},
		{
			id: 'subscription',
			name: __('Subscription', 'multivendorx'),
			desc: `Allow sellers to sell subscription-based products, powered by MultiVendorX.</br></br><div class="ui-notice type-info display-notice"><i class="admin-font adminfont-info"></i><div class="notice-details"><div class="notice-desc">Switch to <a href="https://woocommerce.com/products/woocommerce-subscriptions/" target="_blank" rel="noopener noreferrer">WooCommerce Subscriptions</a> anytime.</div></div></div>`, docLink:
				'https://multivendorx.com/docs/knowledgebase/subscription-product/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			//settingsLink: appLocalizer.site_url,
			proModule: true,
			reqPluging: [
				{
					name: 'WooCommerce Subscriptions',
					slug: 'woocommerce-subscriptions/woocommerce-subscriptions.php',
					link: 'https://woocommerce.com/products/woocommerce-subscriptions/',
				},
			],
			forceActivate: true,
			proFeatures: [
				__('Recurring billing on fixed or custom cycles', 'multivendorx'),
				__('Customers manage active plans from their account', 'multivendorx'),
				__('Automatic renewal and expiry notifications', 'multivendorx'),
			],
			category: ['marketplace_types', 'product_types'],
			enableModules: ['variable'],
		},
		{
			id: 'accommodation',
			name: __('Accommodation', 'multivendorx'),
			desc: 'Enable customers to book overnight stays in just a few clicks.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/accommodation-product/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
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
			proFeatures: [
				__('Check-in and check-out date management', 'multivendorx'),
				__('Nightly pricing with seasonal rate rules', 'multivendorx'),
				__('Real-time room and property inventory', 'multivendorx'),
			],
			category: ['marketplace_types', 'product_types'],
			enableModules: ['booking'],
		},
		{
			id: 'bundle',
			name: __('Bundle', 'multivendorx'),
			desc: 'Offer product bundles, bulk discounts, or assembled kits.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/bundle-product/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			proModule: true,
			reqPluging: [
				{
					name: 'Product Bundles',
					slug: 'woocommerce-product-bundles/woocommerce-product-bundles.php',
					link: 'https://woocommerce.com/products/product-bundles/',
				},
			],
			proFeatures: [
				__('Combine multiple products into one purchasable kit', 'multivendorx'),
				__('Bundle-level discounts applied automatically', 'multivendorx'),
				__('Stock tracked across all bundled items', 'multivendorx'),
			],
			category: 'product_types',
		},
		{
			id: 'auction',
			name: __('Auction', 'multivendorx'),
			desc: 'Enable an auction-style selling system similar to eBay.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/auction-product/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			proModule: true,
			reqPluging: [
				{
					name: 'YITH WooCommerce Auctions',
					slug: 'yith-woocommerce-auctions-premium/init.php',
					link: 'https://yithemes.com/themes/plugins/yith-woocommerce-auctions/',
				},
			],
			proFeatures: [
				__('Starting and hidden reserve price controls', 'multivendorx'),
				__('Timed auctions with automatic winner selection', 'multivendorx'),
				__('Commission applied automatically on completed sales', 'multivendorx'),
			],
			category: ['marketplace_types', 'product_types'],
		},
		{
			id: 'rental-pro',
			name: __('Rental Pro', 'multivendorx'),
			desc: 'Offer rental or real estate booking services.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/rental-product/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			proModule: true,
			reqPluging: [
				{
					name: 'RnB WooCommerce Booking & Rental',
					slug: 'woocommerce-rental-and-booking/redq-rental-and-bookings.php',
					link: 'https://codecanyon.net/item/rnb-woocommerce-rental-booking-system/14835145?ref=redqteam',
				},
			],
			proFeatures: [
				__('Hourly, daily, or weekly rental durations', 'multivendorx'),
				__('Inventory blocked automatically to prevent double-booking', 'multivendorx'),
				__('Optional security deposit collection', 'multivendorx'),
			],
			category: ['marketplace_types', 'product_types'],
		},
		{ type: 'separator', id: 'product_types', label: __('Product Types', 'multivendorx') },
		{
			id: 'simple',
			name: __('Simple', 'multivendorx'),
			desc: 'Covers basic products such as physical goods (books, clothing) or digital items (PDFs, music, software).',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/simple-product/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			proModule: false,
			freeFeatures: [
				__('Best fit for straightforward physical or digital goods', 'multivendorx'),
				__('Standard pricing and stock tracking', 'multivendorx'),
				__('Fastest product type to set up', 'multivendorx'),
			],
			category: 'product_types',
		},
		{
			id: 'variable',
			name: __('Variable', 'multivendorx'),
			desc: 'A product with variations, like different SKU, price, stock option, etc.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/variable-product/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			proModule: false,
			freeFeatures: [
				__('Offer size, color, or format options on one listing', 'multivendorx'),
				__('Each variation keeps its own price and stock', 'multivendorx'),
				__('Customers choose options before checkout', 'multivendorx'),
			],
			category: 'product_types',
		},
		{
			id: 'external',
			name: __('External', 'multivendorx'),
			desc: 'List and describe products on your marketplace but sell them elsewhere.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/external-product/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			proModule: false,
			freeFeatures: [
				__('Sends buyers to another site to complete checkout', 'multivendorx'),
				__('Useful for affiliate or drop-ship style listings', 'multivendorx'),
				__('No inventory tracked on your marketplace', 'multivendorx'),
			],
			category: 'product_types',
		},
		{
			id: 'grouped',
			name: __('Grouped', 'multivendorx'),
			desc: 'A collection of simple, related products that can be purchased individually.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/grouped-product/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			proModule: false,
			freeFeatures: [
				__('Bundles related simple products under one listing', 'multivendorx'),
				__('Customers buy items individually or as a set', 'multivendorx'),
				__('Good fit for curated product collections', 'multivendorx'),
			],
			category: 'product_types',
		},
		{
			id: 'gift-card',
			name: __('Gift Cards', 'multivendorx'),
			desc: 'Sell gift cards to boost sales and attract new customers.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/gift-card/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			proModule: true,
			reqPluging: [
				{
					name: 'YITH WooCommerce Gift Cards',
					slug: 'yith-woocommerce-gift-cards/init.php',
					link: 'https://wordpress.org/plugins/yith-woocommerce-gift-cards/',
				},
			],
			proFeatures: [
				__('Sell digital gift cards customers redeem later', 'multivendorx'),
				__('Balance automatically applied at checkout', 'multivendorx'),
				__('Encourages repeat visits from redemption', 'multivendorx'),
			],
			category: 'product_types',
		},
		{
			type: 'separator',
			id: 'store_management',
			label: __('Store Management', 'multivendorx'),
		},
		{
			id: 'shared-listing',
			name: __('Shared Listing', 'multivendorx'),
			desc: 'Allows more than one store to sell the same product with their own price and stock.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/single-product-multiple-vendors-spmv/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=onboarding`,
			proModule: false,
			freeFeatures: [
				__('Multiple stores list the same product independently', 'multivendorx'),
				__('Customers compare price and stock across sellers', 'multivendorx'),
				__('Control which store\'s offer appears first', 'multivendorx'),
			],
			category: 'store_management',
			miniModule: true,
		},
		{
			id: 'import-export',
			name: __('Import Export Tools', 'multivendorx'),
			desc: 'Stores will be able to upload or download product lists in bulk using CSV files.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/import-export/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			proModule: true,
			proFeatures: [
				__('Bulk upload or update products via CSV', 'multivendorx'),
				__('Export full catalogs for backup or migration', 'multivendorx'),
				__('Speeds up large catalog changes', 'multivendorx'),
			],
			category: 'store_management',
		},
		{
			id: 'media-library',
			name: __('Media Library', 'multivendorx'),
			desc: 'All uploaded media files can be viewed, organized, and managed from one place by the store.',
			proModule: false,
			freeFeatures: [
				__('Central library for images and files per store', 'multivendorx'),
				__('Reuse existing media on new listings', 'multivendorx'),
				__('Organized view of everything a store has uploaded', 'multivendorx'),
			],
			category: 'store_management',
		},
		{
			id: 'store-policy',
			name: __('Store Policy', 'multivendorx'),
			desc: 'Each store publishes its own return, refund, and shipping policies.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/store-policy/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=policies`,
			proModule: false,
			freeFeatures: [
				__('Set marketplace-wide policy defaults', 'multivendorx'),
				__('Stores publish their own policy pages', 'multivendorx'),
				__('Displayed directly on the store profile', 'multivendorx'),
			],
			category: 'store_management',
		},
		{
			id: 'follow-store',
			name: __('Follow Store', 'multivendorx'),
			desc: 'Customers follow stores to receive updates, offers, and product alerts.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/follow-store/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			proModule: false,
			freeFeatures: [
				__('Customers follow the stores they like', 'multivendorx'),
				__('Automatic alerts on new products and offers', 'multivendorx'),
				__('Builds repeat traffic for individual stores', 'multivendorx'),
			],
			category: ['store_management', 'customer_experience'],
		},
		{
			id: 'store-review',
			name: __('Store Review', 'multivendorx'),
			desc: 'Customers leave ratings and written reviews on store pages.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/store-review/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=store-reviews`,
			proModule: false,
			freeFeatures: [
				__('Ratings and written reviews on store pages', 'multivendorx'),
				__('Custom review criteria like delivery experience', 'multivendorx'),
				__('Feedback visible to future shoppers', 'multivendorx'),
			],
			category: ['store_management', 'customer_experience'],
		},
		{
			id: 'business-hours',
			name: __('Business Hours', 'multivendorx'),
			desc: 'Shows store opening and closing times for customers.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/business-hours/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			proModule: true,
			proFeatures: [
				__('Display opening and closing times per store', 'multivendorx'),
				__('Weekly schedule widget on the store page', 'multivendorx'),
				__('Sets clear expectations on response time', 'multivendorx'),
			],
			category: 'store_management',
			miniModule: true,
		},
		{
			id: 'vacation',
			name: __('Vacation', 'multivendorx'),
			desc: 'Temporarily disables sales when a store is closed, with a message shown to customers.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/vacation?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			proModule: true,
			proFeatures: [
				__('Pause a store temporarily with a custom notice', 'multivendorx'),
				__('Optionally disable add-to-cart while away', 'multivendorx'),
				__('Schedule vacation dates on a calendar in advance', 'multivendorx'),
			],
			category: 'store_management',
		},
		{
			id: 'staff-manager',
			name: __('Staff Manager', 'multivendorx'),
			desc: 'Store owners add staff accounts with role-based access to manage orders, products, or support.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/staff-manager/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=user-permissions`,
			proModule: true,
			proFeatures: [
				__('Add unlimited staff accounts per store', 'multivendorx'),
				__('Role-based access to orders, products, or support', 'multivendorx'),
				__('Dedicated dashboard scoped to staff permissions', 'multivendorx'),
			],
			category: 'store_management',
			miniModule: true,
		},
		{
			id: 'privacy',
			name: __('Policies', 'multivendorx'),
			desc: 'Hide sensitive store information from customers, including contact details, location, or other specified data.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/store-policy/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=privacy`,
			proModule: false,
			freeFeatures: [
				__('Hide contact details, location, or other store info', 'multivendorx'),
				__('Control what customer data stores can access', 'multivendorx'),
				__('Overrides available per store where needed', 'multivendorx'),
			],
			category: 'store_management',
		},
		{
			type: 'separator',
			id: 'payment_management',
			label: __('Payment Management', 'multivendorx'),
		},

		{
			id: 'paypal-marketplace',
			name: __('PayPal Marketplace', 'multivendorx'),
			desc: 'Using split payment pay stores instantly after a completed order',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/paypal-marketplace-real-time-split/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			//settingsLink: admin_url('admin.php?page=wc-settings&tab=checkout&section=mvx_paypal_marketplace'),
			proModule: true,
			proFeatures: [
				__('Real-time split payments via PayPal', 'multivendorx'),
				__('Store\'s share released the moment an order completes', 'multivendorx'),
				__('Removes the manual payout step', 'multivendorx'),
			],
			category: 'payment_management',
			miniModule: true,
			reloadOnChange: true,
		},
		{
			id: 'stripe-marketplace',
			name: __('Stripe Marketplace', 'multivendorx'),
			desc: 'Automatically sends a store’s share immediately after a customer order is completed.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/stripe-marketplace?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			//settingsLink: admin_url('admin.php?page=mvx#&submenu=payment&name=payment-stripe-connect'),
			proModule: true,
			proFeatures: [
				__('Instant split payments using Stripe Connect', 'multivendorx'),
				__('Funds routed to stores automatically at checkout', 'multivendorx'),
				__('Reduces manual payout processing', 'multivendorx'),
			],
			category: 'payment_management',
			miniModule: true,
			reloadOnChange: true,
		},
		// {
		// 	id: 'razorpay',
		// 	name: __('Razorpay', 'multivendorx'),
		// 	desc: 'For clients looking to pay multiple Indian stores instantly',
		// 	docLink: 'https://multivendorx.com/docs/knowledgebase/payment/',
		// 	//settingsLink: admin_url('admin.php?page=mvx-setting-admin'),
		// 	proModule: false,
		// 	category: 'payment_management',
		// },
		{
			type: 'separator',
			id: 'shipping_management',
			label: __('Shipping Management', 'multivendorx'),
		},
		{
			id: 'store-shipping',
			name: __('Store Shipping', 'multivendorx'),
			desc: 'Shipping charges calculated based on distance between store address and delivery location.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/distance-shipping/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=shipping`,
			proModule: false,
			freeFeatures: [
				__('Each store sets its own shipping methods and zones', 'multivendorx'),
				__('Delivery pricing configured independently per store', 'multivendorx'),
				__('No shared shipping rules required', 'multivendorx'),
			],
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
				'https://multivendorx.com/docs/knowledgebase/weight-shipping/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=shipping`,
			proModule: true,
			reqPluging: [
				{
					name: 'Table Rate Shipping',
					slug: 'woocommerce-table-rate-shipping/woocommerce-table-rate-shipping.php',
					link: 'https://woocommerce.com/products/table-rate-shipping/',
				},
			],
			proFeatures: [
				__('Shipping cost scales with weight or order value', 'multivendorx'),
				__('Rules can combine quantity, destination, and price', 'multivendorx'),
				__('Works alongside table rate shipping', 'multivendorx'),
			],
			category: 'shipping_management',
		},
		{
			id: 'per-product-shipping',
			name: __('Per Product Shipping', 'multivendorx'),
			desc: 'Custom shipping charge applied to individual products.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/per-product-shipping/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=shipping`,
			proModule: true,
			reqPluging: [
				{
					name: 'Per Product Shipping for WooCommerce',
					slug: 'woocommerce-shipping-per-product/woocommerce-shipping-per-product.php',
					link: 'https://woocommerce.com/products/per-product-shipping/',
				},
			],
			proFeatures: [
				__('Set a shipping charge on individual products', 'multivendorx'),
				__('Overrides marketplace-wide shipping defaults', 'multivendorx'),
				__('Useful for oversized or special-handling items', 'multivendorx'),
			],
			category: 'shipping_management',
		},
		{
			id: 'printful',
			name: __('Printful', 'multivendorx'),
			desc: 'Automated product syncing, order fulfillment, and shipping are enabled for all stores via Printful.',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=printful`,
			proModule: true,
			proFeatures: [
				__('Print-on-demand fulfillment synced automatically', 'multivendorx'),
				__('Orders route to Printful without manual entry', 'multivendorx'),
				__('Shipping and tracking handled by Printful', 'multivendorx'),
			],
			category: 'shipping_management',
		},
		{
			type: 'separator',
			id: 'customer_experience',
			label: __('Customer Experience', 'multivendorx'),
		},
		{
			id: 'invoice',
			name: __('Invoice & Packing slip', 'multivendorx'),
			desc: 'Generates invoices and packing slips that can be printed or emailed to customers.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/invoice-packing-slip/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=invoices`,
			proModule: true,
			proFeatures: [
				__('Auto-generate invoices and packing slips per order', 'multivendorx'),
				__('Custom branding on invoice templates', 'multivendorx'),
				__('Downloadable and emailed to customers automatically', 'multivendorx'),
			],
			category: 'customer_experience',
			miniModule: true,
		},
		{
			id: 'live-chat',
			name: __('Live Chat', 'multivendorx'),
			desc: 'Customers send real-time messages to stores about products or orders.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/live-chat/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=live-chat`,
			proModule: true,
			proFeatures: [
				__('Real-time messaging between customers and stores', 'multivendorx'),
				__('Optional integrations with WhatsApp or Messenger', 'multivendorx'),
				__('Chat history saved for later reference', 'multivendorx'),
			],
			category: 'customer_experience',
		},
		{
			id: 'store-support',
			name: __('Store Support', 'multivendorx'),
			desc: 'Built-in ticketing system for customers to raise and track support requests.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/store-support/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			proModule: true,
			proFeatures: [
				__('Ticketing system for customer issues', 'multivendorx'),
				__('Stores track and resolve requests from one queue', 'multivendorx'),
				__('Support history stays tied to each order', 'multivendorx'),
			],
			category: 'customer_experience',
		},
		{
			id: 'customer-queries',
			name: __('Customer Queries', 'multivendorx'),
			desc: 'Customers can publicly ask product questions.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/customer-queries/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			proModule: false,
			freeFeatures: [
				__('Shoppers post public questions on product pages', 'multivendorx'),
				__('Stores answer directly to build buyer confidence', 'multivendorx'),
				__('Answers stay visible to future visitors', 'multivendorx'),
			],
			category: 'customer_experience',
		},
		// {
		// 	id: 'enquiry',
		// 	name: __('Enquiry', 'multivendorx'),
		// 	desc: 'Customers can send private product inquiries.',
		// 	//docLink: 'https://multivendorx.com/docs/knowledgebase/NA',
		// 	reqPluging: [
		// 		{
		// 			name: 'CatalogX',
		// 			slug: 'woocommerce-catalog-enquiry/woocommerce-catalog-enquiry.php',
		// 			link: 'https://catalogx.com/?utm_source=multivendorx&utm_medium=pluginsettings&utm_campaign=multivendorx',
		// 		},
		// 	],
		// 	proModule: true,
		// 	category: 'customer_experience',
		// },
		{
			id: 'marketplace-refund',
			name: __('Marketplace Refund', 'multivendorx'),
			desc: 'Customers submit refund requests, and stores review and process them directly.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/marketplace-refund/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=refunds`,
			proModule: false,
			freeFeatures: [
				__('Customers submit refund requests with photo evidence', 'multivendorx'),
				__('Stores approve, reject, or auto-process claims', 'multivendorx'),
				__('Refund eligibility rules by order status', 'multivendorx'),
			],
			category: ['store_management', 'customer_experience'],
		},
		{ type: 'separator', id: 'analytics_tools', label: __('Marketing Tools', 'multivendorx') },
		{
			id: 'store-analytics',
			name: __('Store Analytics', 'multivendorx'),
			desc: 'Reports on sales, orders, and revenue, with integration for Google Analytics.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/store-analytics/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			proModule: false,
			freeFeatures: [
				__('Google Analytics integration at the store level', 'multivendorx'),
				__('Sales, order, and revenue reports per store', 'multivendorx'),
				__('SEO-friendly rich results in search listings', 'multivendorx'),
			],
			category: ['analytics_tools', 'store_management'],
		},
		{
			id: 'search-discovery',
			name: __('Search & Discovery', 'multivendorx'),
			desc: 'SEO settings for store pages and products using Rank Math or Yoast SEO.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/search-discovery/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=search-discovery`,
			proModule: true,
			proFeatures: [
				__('Per-product SEO titles, meta text, and keywords', 'multivendorx'),
				__('Yoast or Rank Math integration for stores', 'multivendorx'),
				__('Open Graph settings for better social sharing', 'multivendorx'),
			],
			category: ['analytics_tools', 'store_management'],
		},
		{
			type: 'separator',
			id: 'marketplace_boosters',
			label: __('Marketplace Boosters', 'multivendorx'),
		},
		{
			id: 'intelligence',
			name: __('Intelligence', 'multivendorx'),
			desc: 'Let stores create high-converting product descriptions and images instantly using AI.',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=intelligence`,
			docLink:
				'https://multivendorx.com/docs/knowledgebase/marketplace-intelligence/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			proModule: false,
			freeFeatures: [
				__('Generate product titles and descriptions with AI', 'multivendorx'),
				__('Choose between OpenAI, Gemini, or OpenRouter', 'multivendorx'),
				__('Speeds up new listing creation for stores', 'multivendorx'),
			],
			category: 'marketplace_boosters',
		},
		{
			id: 'marketplace-compliance',
			name: __('Marketplace Compliance', 'multivendorx'),
			desc: 'Ensure stores meet marketplace requirements with automated policy checks.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/marketplace-compliance/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=compliance`,
			proModule: true,
			proFeatures: [
				__('Verified and featured store badges build trust', 'multivendorx'),
				__('Identity, address, and social profile verification', 'multivendorx'),
				__('Automated checks against marketplace requirements', 'multivendorx'),
			],
			category: 'marketplace_boosters',
		},
		{
			id: 'marketplace-membership',
			name: __('Marketplace Membership', 'multivendorx'),
			desc: 'Admin defines membership levels with specific capabilities for different stores.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/marketplace-memberhsip/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			proModule: true,
			proFeatures: [
				__('Free, one-time, or recurring membership plans', 'multivendorx'),
				__('Gate features and categories by plan tier', 'multivendorx'),
				__('Automatic renewals and access control at expiry', 'multivendorx'),
			],
			category: 'marketplace_boosters',
			reloadOnChange: true,
		},

		{
			id: 'facilitator',
			name: __('Facilitator', 'multivendorx'),
			desc: 'Share commission on a sale between the store and another designated user. Each participant receives their assigned portion automatically.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/facilitator/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=facilitator`,
			proModule: true,
			proFeatures: [
				__('Assign facilitators to share commission on a sale', 'multivendorx'),
				__('Automatic payout splits between participants', 'multivendorx'),
				__('Facilitators track wallet balance and history', 'multivendorx'),
			],
			category: 'marketplace_boosters',
			miniModule: true,
		},
		{
			id: 'marketplace-fee',
			name: __('Marketplace Fee', 'multivendorx'),
			desc: 'Set and manage platform fees for each order or store to cover operational costs',
			docLink: 'https://multivendorx.com/docs/knowledgebase/marketplace-fee/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=commissions`,
			proModule: false,
			freeFeatures: [
				__('Fixed, percentage, or combined platform fee models', 'multivendorx'),
				__('Charge at checkout or deduct from vendor earnings', 'multivendorx'),
				__('Applied automatically to every order or store', 'multivendorx'),
			],
			category: 'marketplace_boosters',
		},
		{
			id: 'franchises',
			name: __('Franchises', 'multivendorx'),
			desc: 'Enables franchise-style ordering with store-created orders, admin-product ordering, and automatic store assignment based on customer location.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/franchises/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=onboarding`,
			proModule: true,
			proFeatures: [
				__('Franchise-style ordering across multiple locations', 'multivendorx'),
				__('Admin-controlled product assignment by store', 'multivendorx'),
				__('Automatic routing based on customer location', 'multivendorx'),
			],
			category: ['store_management', 'marketplace_boosters'],
			miniModule: true,
		},

		{
			id: 'payment-gateway-charge',
			name: __('Payment Gateway Charge', 'multivendorx'),
			desc: 'Payment gateway fees are deducted from vendor commissions by the admin, ensuring platform costs are covered automatically.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/payment-gateway-charge/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=commissions`,
			proModule: false,
			freeFeatures: [
				__('Decide who absorbs payment processing fees', 'multivendorx'),
				__('Split gateway costs between admin and vendor', 'multivendorx'),
				__('Applied automatically at checkout', 'multivendorx'),
			],
			category: ['store_management', 'payment_management'],
		},
		{
			id: 'product-advertising',
			name: __('Product Advertising', 'multivendorx'),
			desc: 'Paid promotion for products within the marketplace, boosting visibility.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/advertise-product/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=product-advertising`,
			proModule: true,
			proFeatures: [
				__('Paid promotional slots to boost product visibility', 'multivendorx'),
				__('Control placement duration and featured status', 'multivendorx'),
				__('Mix of free and paid promotion options', 'multivendorx'),
			],
			category: 'marketplace_boosters',
		},
		{
			id: 'wholesale',
			name: __('Wholesale', 'multivendorx'),
			desc: 'Stores set wholesale prices and bulk purchase rules for selected customer groups.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/wholesale/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=wholesale`,
			proModule: true,
			proFeatures: [
				__('Separate wholesale pricing for approved buyers', 'multivendorx'),
				__('Custom application form for wholesale access', 'multivendorx'),
				__('Approve buyers automatically or manually', 'multivendorx'),
			],
			category: ['analytics_tools', 'store_management'],
			miniModule: true,
		},
		{
			id: 'store-inventory',
			name: __('Store Inventory', 'multivendorx'),
			desc: 'Manages stock levels, sends low-stock alerts, and maintains a waitlist for out-of-stock products.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/store-inventory/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=store-inventory`,
			proModule: true,
			proFeatures: [
				__('Low-stock and out-of-stock alerts per product', 'multivendorx'),
				__('Configurable stock thresholds trigger warnings', 'multivendorx'),
				__('Waitlist customers for restocked items', 'multivendorx'),
			],
			category: 'marketplace_boosters',
			miniModule: true,
		},
		{
			id: 'min-max',
			name: __('Min Max', 'multivendorx'),
			desc: 'Defines the minimum or maximum number of items a customer can purchase in a single order.',
			docLink:
				'https://multivendorx.com/docs/non-knowledgebase/min-max-quantities/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=min-max`,
			proModule: false,
			freeFeatures: [
				__('Set minimum and maximum order quantities', 'multivendorx'),
				__('Cap total order value per checkout', 'multivendorx'),
				__('Rules apply per-product or store-wide', 'multivendorx'),
			],
			category: 'marketplace_boosters',
			miniModule: true,
		},
		{ type: 'separator', id: 'notification', label: __('Notification', 'multivendorx') },
		{
			id: 'announcement',
			name: __('Announcement', 'multivendorx'),
			desc: 'Marketplace-wide notices or updates sent from admin to all stores.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/announcement/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			proModule: false,
			freeFeatures: [
				__('Broadcast marketplace-wide notices to all stores', 'multivendorx'),
				__('Built-in taskboard for tracking store to-dos', 'multivendorx'),
				__('Direct messaging channel between admin and stores', 'multivendorx'),
			],
			category: ['notification', 'marketplace_boosters'],
			reloadOnChange: true,
		},
		{
			id: 'knowledgebase',
			name: __('Knowledgebase', 'multivendorx'),
			desc: 'Guides, tutorials, and FAQs shared with stores by the admin.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/knowledgebase/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			proModule: false,
			freeFeatures: [
				__('Central library of guides and tutorials for stores', 'multivendorx'),
				__('Reduces support tickets with self-serve docs', 'multivendorx'),
				__('Update articles anytime from the dashboard', 'multivendorx'),
			],
			category: 'notification',
			reloadOnChange: true,
		},
		{ type: 'separator', id: 'integration', label: __('Integration', 'multivendorx') },
		{
			id: 'elementor',
			name: __('Elementor', 'multivendorx'),
			desc: 'Drag-and-drop design support for custom store pages with Elementor.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/mvx-elementor/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
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
			freeFeatures: [
				__('Design custom store pages visually', 'multivendorx'),
				__('No coding needed for store page layouts', 'multivendorx'),
				__('Works alongside existing Elementor templates', 'multivendorx'),
			],
			category: 'integration',
		},
		{
			id: 'buddy-press',
			name: __('BuddyPress', 'multivendorx'),
			desc: 'Adds social networking features to stores (profiles, connections, messaging).',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/mvx-buddypress/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			proModule: true,
			reqPluging: [
				{
					name: 'BuddyPress',
					slug: 'buddypress/bp-loader.php',
					link: 'https://wordpress.org/plugins/buddypress/',
				},
			],
			proFeatures: [
				__('Store and customer profile pages', 'multivendorx'),
				__('Connections and messaging between marketplace users', 'multivendorx'),
				__('Adds a social layer on top of stores', 'multivendorx'),
			],
			category: 'integration',
		},
		{
			id: 'wpml',
			name: __('WPML', 'multivendorx'),
			desc: 'Multi-language support so products and stores can be displayed in different languages.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/mvx-wpml/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			proModule: true,
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
			proFeatures: [
				__('Products and store pages in multiple languages', 'multivendorx'),
				__('Language switcher on the storefront', 'multivendorx'),
				__('Works with WooCommerce Multilingual', 'multivendorx'),
			],
			category: 'integration',
		},
		{
			id: 'advance-custom-field',
			name: __('Advance Custom field', 'multivendorx'),
			desc: 'Extra custom product fields created by admin for stores to use.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/mvx-acf/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			proModule: true,
			reqPluging: [
				{
					name: 'Advanced Custom Fields',
					slug: 'advanced-custom-fields/acf.php',
					link: 'https://wordpress.org/plugins/advanced-custom-fields/',
				},
			],
			proFeatures: [
				__('Admin-defined custom fields for product listings', 'multivendorx'),
				__('Stores fill in extra structured details', 'multivendorx'),
				__('Built on Advanced Custom Fields', 'multivendorx'),
			],
			category: 'integration',
		},
		{
			id: 'wp-affiliate',
			name: __('WP Affiliate', 'multivendorx'),
			desc: 'Affiliate program that tracks referrals and commissions for marketplace products.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/affiliate-product/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=affiliate`,
			proModule: true,
			reqPluging: [
				{
					name: 'AffiliateWP',
					slug: 'affiliate-wp/affiliate-wp.php',
					link: 'https://affiliatewp.com/',
				},
			],
			proFeatures: [
				__('Affiliate links tracked per product or store', 'multivendorx'),
				__('Commission payouts for referred sales', 'multivendorx'),
				__('Choose who absorbs affiliate commission cost', 'multivendorx'),
			],
			category: 'integration',
		},
		{
			id: 'product-addon',
			name: __('Product Addon', 'multivendorx'),
			desc: 'Adds optional extras to products such as gift wrapping, engravings, or warranties.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/mvx-product-addon/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			proModule: true,
			reqPluging: [
				{
					name: 'Product AddOns',
					slug: 'woocommerce-product-addons/woocommerce-product-addons.php',
					link: 'https://woocommerce.com/products/product-add-ons/',
				},
			],
			proFeatures: [
				__('Optional extras like gift wrap or engraving', 'multivendorx'),
				__('Priced separately and added at checkout', 'multivendorx'),
				__('Configured per product by the store', 'multivendorx'),
			],
			category: 'integration',
		},
		{
			id: 'ship-station',
			name: __('ShipStation', 'multivendorx'),
			desc: 'Integration with ShipStation for advanced shipping management and label printing.',
			docLink: 'https://multivendorx.com/docs/knowledgebase/shipstation/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			proModule: true,
			proFeatures: [
				__('Sync orders to ShipStation for fulfillment', 'multivendorx'),
				__('Print shipping labels in bulk', 'multivendorx'),
				__('Automatic tracking updates back to the order', 'multivendorx'),
			],
			category: ['integration', 'Shipping management'],
		},
		{
			id: 'geo-location',
			name: __('Geo Location', 'multivendorx'),
			desc: 'Lets stores pinpoint their location on an interactive map, making it easy for customers to discover nearby stores and shop locally.',
			docLink:
				'https://multivendorx.com/docs/knowledgebase/store-location/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=multivendorx',
			settingsLink: `${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=geolocation`,
			proModule: false,
			freeFeatures: [
				__('Store locations shown on an interactive map', 'multivendorx'),
				__('Customers search and filter by distance', 'multivendorx'),
				__('Works with Google Maps or Mapbox', 'multivendorx'),
			],
			category: 'store_management',
		},
	],
};