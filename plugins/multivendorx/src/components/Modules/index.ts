import { __ } from '@wordpress/i18n';
export default {
    category: true,
    tab:"modules",
    modules: [
        { type: 'separator', id: 'marketplace_types', label: 'Marketplace Types' },
        {
            id: 'simple',
            name: __('Simple (Downloadable & Virtual)', 'multivendorx'),
            desc: "Covers basic products such as physical goods (books, clothing) or digital items (PDFs, music, software).",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/simple-product',
            //settings_link: appLocalizer.site_url,
            req_pluging: ['woocomerce', 'wordpress'],
            pro_module: false,
            category: 'product_type'
        },
        {
            id: 'variable',
            name: __('Variable', 'multivendorx'),
            desc: "A product with variations, like different SKU, price, stock option, etc.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/variable-product',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            category: 'product_type'
        },
        {
            id: 'external',
            name: __('External', 'multivendorx'),
            desc: "List and describe products on your marketplace but sell them elsewhere.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/external-product/',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            category: 'product_type'
        },
        {
            id: 'grouped',
            name: __('Grouped', 'multivendorx'),
            desc: "A collection of simple, related products that can be purchased individually.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/grouped-product',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            category: 'product_type'
        },
        {
            id: 'booking',
            name: __('Booking', 'multivendorx'),
            desc: "Allow customers to reserve appointments, equipment, or services.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/booking-product',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            category: 'marketplace_types'
        },
        {
            id: 'appointment',
            name: __('Appointments', 'multivendorx'),
            desc: "Dedicated appointment booking functionality.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/appointment-product/',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            category: 'marketplace_types'
        },
        {
            id: 'subscription',
            name: __('Subscription', 'multivendorx'),
            desc: "Offer recurring payment options (weekly, monthly, or yearly).",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/subscription-product',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            category: 'marketplace_types'
        },
        {
            id: 'accommodation',
            name: __('Accommodation', 'multivendorx'),
            desc: "Enable customers to book overnight stays in just a few clicks.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/accommodation-product',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            category: 'marketplace_types'
        },
        {
            id: 'bundle',
            name: __('Bundle', 'multivendorx'),
            desc: "Offer product bundles, bulk discounts, or assembled kits.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/bundle-product',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            category: 'marketplace_types'
        },
        {
            id: 'auction',
            name: __('Auction', 'multivendorx'),
            desc: "Enable an auction-style selling system similar to eBay.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/auction-product',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            category: 'marketplace_types'
        },
        {
            id: 'rental-pro',
            name: __('Rental Pro', 'multivendorx'),
            desc: "Offer rental or real estate booking services.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/rental-product',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            category: 'marketplace_types'
        },
        {
            id: 'gift-card',
            name: __('Gift Cards', 'multivendorx'),
            desc: "Sell gift cards to boost sales and attract new customers.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/gift-card/',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            category: 'product_type'
        },
        { type: 'separator', id: 'seller_management', label: 'Seller Management' },
        {
            id: 'identity-verification',
            name: __('Seller Identity Verification', 'multivendorx'),
            desc: "Confirms store owner identity using documents, address proof, or social profiles.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/identity-verification/',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=settings-identity-verification'),
            pro_module: true,
            category: 'store_management'
        },
        {
            id: 'spmv',
            name: __('Single Product Multiple Vendor', 'multivendorx'),
            desc: "Allows more than one store to sell the same product with their own price and stock.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/single-product-multiple-vendors-spmv',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=spmv-pages'),
            pro_module: false,
            category: 'store_management'
        },
        {
            id: 'import-export',
            name: __('Import Export Tools', 'multivendorx'),
            desc: "Stores will be able to upload or download product lists in bulk using CSV files.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/import-export',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            category: 'store_management'
        },
        {
            id: 'store-inventory',
            name: __('Store Inventory', 'multivendorx'),
            desc: "Manages stock levels, sends low-stock alerts, and maintains a waitlist for out-of-stock products.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/store-inventory',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=settings-store-inventory'),
            pro_module: true,
            category: 'inventory_control'
        },
        {
            id: 'min-max',
            name: __('Min Max Quantities', 'multivendorx'),
            desc: "Defines the minimum or maximum number of items a customer can purchase in a single order.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/non-knowledgebase/min-max-quantities/',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=settings-min-max'),
            pro_module: false,
            category: 'inventory_control'
        },
        {
            id: 'bank-payment',
            name: __('Bank Transfer', 'multivendorx'),
            desc: "Manually transfer money directly to the store's bank account.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/direct-bank-transfer/',
            //settings_link: appLocalizer.site_url,
            pro_module: false,
            category: 'payment_management'
        },
        {
            id: 'paypal-masspay',
            name: __('PayPal Masspay', 'multivendorx'),
            desc: "Schedule payment to multiple stores at the same time.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/paypal-masspay/',
            //settings_link: appLocalizer.site_url,
            pro_module: false,
            category: 'payment_management'
        },
        {
            id: 'paypal-payout',
            name: __('PayPal Payout', 'multivendorx'),
            desc: "Send payments automatically to multiple vendors as per scheduled",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/paypal-payout',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=payment&name=payment-payout'),
            pro_module: false,
            category: 'payment_management'
        },
        {
            id: 'paypal-marketplace',
            name: __('PayPal Marketplace (Real time Split)', 'multivendorx'),
            desc: "Using split payment pay vendors instantly after a completed order",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/paypal-marketplace-real-time-split/',
            //settings_link: admin_url('admin.php?page=wc-settings&tab=checkout&section=mvx_paypal_marketplace'),
            pro_module: true,
            category: 'payment_management'
        },
        {
            id: 'stripe-connect',
            name: __('Stripe Connect', 'multivendorx'),
            desc: "Connect to vendors stripe account and make hassle-free transfers as scheduled.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/stripe-connect',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=payment&name=payment-stripe-connect'),
            pro_module: false,
            category: 'payment_management'
        },
        {
            id: 'stripe-marketplace',
            name: __('Stripe Marketplace (Real time Split)', 'multivendorx'),
            desc: "Automatically sends a store’s share immediately after a customer order is completed.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/stripe-marketplace',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=payment&name=payment-stripe-connect'),
            pro_module: true,
            category: 'payment_management'
        },
        {
            id: 'mangopay',
            name: __('Mangopay', 'multivendorx'),
            desc: "Gives the benefit of both realtime split transfer and scheduled distribution",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/mangopay',
            //settings_link: admin_url('admin.php?page=mvx-setting-admin'),
            pro_module: true,
            category: 'payment_management'
        },
        {
            id: 'razorpay',
            name: __('Razorpay', 'multivendorx'),
            desc: "For clients looking to pay multiple Indian vendors instantly",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/payment/',
            //settings_link: admin_url('admin.php?page=mvx-setting-admin'),
            pro_module: false,
            category: 'payment_management'
        },
        {
            id: 'zone-shipping',
            name: __('Zone-Wise Shipping', 'multivendorx'),
            desc: "Stores define shipping availability restricted to specific geographic zones.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/shipping-by-zone/',
            //settings_link: admin_url('admin.php?page=wc-settings&tab=shipping'),
            pro_module: false,
            category: 'shipping_management'
        },
        {
            id: 'distance-shipping',
            name: __('Distance Shipping', 'multivendorx'),
            desc: "Shipping charges calculated based on distance between store address and delivery location.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/distance-shipping',
            //settings_link: admin_url('admin.php?page=wc-settings&tab=shipping&section=mvx_product_shipping_by_distance'),
            pro_module: false,
            category: 'shipping_management'
        },
        {
            id: 'country-shipping',
            name: __('Country-Wise Shipping', 'multivendorx'),
            desc: "Stores decide which countries they ship products to.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/country-shipping',
            //settings_link: admin_url('admin.php?page=wc-settings&tab=shipping&section=mvx_product_shipping_by_country'),
            pro_module: false,
            category: 'shipping_management'
        },
        {
            id: 'weight-shipping',
            name: __('Weight Wise Shipping (using Table Rate Shipping)', 'multivendorx'),
            desc: "Shipping cost determined by weight, order value, or product quantity.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/weight-shipping',
            //settings_link: admin_url('admin.php?page=wc-settings&tab=shipping'),
            pro_module: false,
            category: 'shipping_management'
        },
        {
            id: 'per-product-shipping',
            name: __('Per Product Shipping', 'multivendorx'),
            desc: "Custom shipping charge applied to individual products.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/per-product-shipping',
            //settings_link: admin_url('admin.php?page=wc-settings&tab=shipping'),
            pro_module: true,
            category: 'shipping_management'
        },
        {
            id: 'invoice',
            name: __('Invoice & Packing slip', 'multivendorx'),
            desc: "Generates invoices and packing slips that can be printed or emailed to customers.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/invoice-packing-slip',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=settings-vendor-invoice'),
            pro_module: true,
            category: 'customer_experience'
        },
        {
            id: 'marketplace-refund',
            name: __('Marketplace Refund', 'multivendorx'),
            desc: "Customers submit refund requests, and stores review and process them directly.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/marketplace-refund',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=refund-management'),
            pro_module: false,
            category: 'customer_experience'
        },
        {
            id: 'store-location',
            name: __('Store Location', 'multivendorx'),
            desc: "Displays a store’s physical address and location map on its profile page.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/store-location',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=store'),
            pro_module: false,
            category: 'store_management'
        },
        {
            id: 'store-policy',
            name: __('Store Policy', 'multivendorx'),
            desc: "Each store publishes its own return, refund, and shipping policies.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/store-policy',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=policy'),
            pro_module: false,
            category: 'store_management'
        },
        {
            id: 'follow-store',
            name: __('Follow Store', 'multivendorx'),
            desc: "Customers follow stores to receive updates, offers, and product alerts.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/follow-store',
            //settings_link: appLocalizer.site_url,
            pro_module: false,
            category: 'store_management'
        },
        {
            id: 'store-review',
            name: __('Store Review', 'multivendorx'),
            desc: "Customers leave ratings and written reviews on store pages.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/store-review',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=review-management'),
            pro_module: false,
            category: 'store_management'
        },
        {
            id: 'business-hours',
            name: __('Business Hours', 'multivendorx'),
            desc: "Shows store opening and closing times for customers.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/business-hours/',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            category: 'store_management'
        },
        {
            id: 'mvx-blocks',
            name: __('Gutenberg Blocks', 'multivendorx'),
            desc: "Marketplace widgets made available as blocks inside the Gutenberg editor.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: '',
            //settings_link: appLocalizer.site_url,
            pro_module: false,
            category: 'integration'
        },
        {
            id: 'advertisement',
            name: __('Advertise Product', 'multivendorx'),
            desc: "Paid promotion for products within the marketplace, boosting visibility.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/advertise-product/',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=settings-advertising'),
            pro_module: true,
            category: 'marketing_tools'
        },
        {
            id: 'vacation',
            name: __('Vacation', 'multivendorx'),
            desc: "Temporarily disables sales when a store is closed, with a message shown to customers.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/vacation',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            category: 'store_management'
        },
        {
            id: 'staff-manager',
            name: __('Staff Manager', 'multivendorx'),
            desc: "Store owners add staff accounts with role-based access to manage orders, products, or support.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/staff-manager',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            category: 'store_management'
        },
        {
            id: 'wholesale',
            name: __('Wholesale', 'multivendorx'),
            desc: "Stores set wholesale prices and bulk purchase rules for selected customer groups.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/wholesale',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=settings-wholesale'),
            pro_module: true,
            category: 'marketing_tools'
        },
        {
            id: 'live-chat',
            name: __('Live Chat', 'multivendorx'),
            desc: "Customers send real-time messages to stores about products or orders.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/live-chat',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=settings-live-chat'),
            pro_module: true,
            category: 'customer_experience'
        },
        {
            id: 'store-support',
            name: __('Store Support', 'multivendorx'),
            desc: "Built-in ticketing system for customers to raise and track support requests.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/store-support/',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=settings-store-support'),
            pro_module: true,
            category: 'customer_experience'
        },
        {
            id: 'store-analytics',
            name: __('Store Analytics', 'multivendorx'),
            desc: "Reports on sales, orders, and revenue, with integration for Google Analytics.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/store-analytics',
            //settings_link: admin_url('admin.php?page=mvx-setting-admin'),
            pro_module: true,
            category: 'analytics_tools'
        },
        {
            id: 'store-seo',
            name: __('Store SEO', 'multivendorx'),
            desc: "SEO settings for store pages and products using Rank Math or Yoast SEO.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/store-seo',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=settings-seo'),
            pro_module: true,
            category: 'analytics_tools'
        },
        {
            id: 'marketplace-membership',
            name: __('Marketplace Membership', 'multivendorx'),
            desc: "Admin defines membership levels with specific capabilities for different stores.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/marketplace-memberhsip',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=settings-vendor-membership'),
            pro_module: true,
            category: 'marketplace_membership'
        },
        {
            id: 'announcement',
            name: __('Announcement', 'multivendorx'),
            desc: "Marketplace-wide notices or updates sent from admin to all stores.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/announcement/',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=work-board&name=announcement'),
            pro_module: false,
            category: 'notification'
        },
        {
            id: 'report-abuse',
            name: __('Report Abuse', 'multivendorx'),
            desc: "Customers flag products they believe are fake, misleading, or inappropriate.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/report-abuse',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=work-board&name=report-abuse'),
            pro_module: false,
            category: 'notification'
        },
        {
            id: 'knowladgebase',
            name: __('Knowledgebase', 'multivendorx'),
            desc: "Guides, tutorials, and FAQs shared with stores by the admin.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/knowledgebase/',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=work-board&name=knowladgebase'),
            pro_module: false,
            category: 'notification'
        },
        {
            id: 'elementor',
            name: __('Elementor', 'multivendorx'),
            desc: "Drag-and-drop design support for custom store pages with Elementor.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/mvx-elementor',
            //settings_link: appLocalizer.site_url,
            pro_module: false,
            category: 'integration'
        },
        {
            id: 'buddypress',
            name: __('Buddypress', 'multivendorx'),
            desc: "Adds social networking features to stores (profiles, connections, messaging).",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/mvx-buddypress',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=social'),
            pro_module: false,
            category: 'integration'
        },
        {
            id: 'wpml',
            name: __('WPML', 'multivendorx'),
            desc: "Multi-language support so products and stores can be displayed in different languages.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/mvx-wpml',
            //settings_link: appLocalizer.site_url,
            pro_module: false,
            category: 'integration'
        },
        {
            id: 'advance-custom-field',
            name: __('Advance Custom field', 'multivendorx'),
            desc: "Extra custom product fields created by admin for stores to use.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/mvx-acf',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            category: 'integration'
        },
        {
            id: 'geo-my-wp',
            name: __('GEOmyWP', 'multivendorx'),
            desc: "Adds product location data so customers can search by proximity.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/geo-my-wp',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            category: 'integration'
        },
        {
            id: 'wp-affiliate',
            name: __('WP Affiliate', 'multivendorx'),
            desc: "Affiliate program that tracks referrals and commissions for marketplace products.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/affiliate-product/',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            category: 'integration'
        },
        {
            id: 'product-addon',
            name: __('Product Addon', 'multivendorx'),
            desc: "Adds optional extras to products such as gift wrapping, engravings, or warranties.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/mvx-product-addon',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            category: 'integration'
        },
        {
            id: 'shipstation-module',
            name: __('Shipstation', 'multivendorx'),
            desc: "Integration with ShipStation for advanced shipping management and label printing.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/shipstation/',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            category: 'integration'
        },
        {
            id: 'geo-location',
            name: __('Geo Location', 'multivendorx'),
            desc: "Geo Location",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/shipstation/',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            category: 'integration'
        },
        {
            id: 'question-answer',
            name: __('Question & Answer', 'multivendorx'),
            desc: "Customers can publicly ask product questions.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/shipstation/',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            category: 'engagement'
        },
        {
            id: 'enquiry',
            name: __('Enquiry', 'multivendorx'),
            desc: "Customers can send private product inquiries.",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/shipstation/',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            category: 'engagement'
        }
    ]
}
