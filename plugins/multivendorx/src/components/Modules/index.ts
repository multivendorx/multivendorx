import { __ } from '@wordpress/i18n';
export default {
    category: true,
    modules: [
        { type: 'separator', id: 'marketplace_types', label: 'Marketplace Types' },
        {
            id: 'simple',
            name: __('Simple (Downloadable & Virtual)', 'multivendorx'),
            desc: "<fieldset><legend>Free</legend><span>Covers the vast majority of any tangible products you may sell or ship i.e books</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/simple-product',
            //settings_link: appLocalizer.site_url,
            pro_module: false,
            parent_category: 'marketplace_types'
        },
        {
            id: 'variable',
            name: __('Variable', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>A product with variations, like different SKU, price, stock option, etc.</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/variable-product',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            parent_category: 'marketplace_types'
        },
        {
            id: 'external',
            name: __('External', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Grants vendor the option to list and describe on admin website but sold elsewhere</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/external-product/',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            parent_category: 'marketplace_types'
        },
        {
            id: 'grouped',
            name: __('Grouped', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>A cluster of simple related products that can be purchased individually</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/grouped-product',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            parent_category: 'marketplace_types'
        },
        {
            id: 'booking',
            name: __('Booking', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Allow customers to book appointments, make reservations or rent equipment etc</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/booking-product',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            parent_category: 'marketplace_types'
        },
        {
            id: 'appointment',
            name: __('Appointments', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Allow customers to book appointments</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/appointment-product/',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            parent_category: 'marketplace_types'
        },
        {
            id: 'subscription',
            name: __('Subscription', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Let customers subscribe to your products or services and pay weekly, monthly or yearly</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/subscription-product',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            parent_category: 'marketplace_types'
        },
        {
            id: 'accommodation',
            name: __('Accommodation', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Grant your guests the ability to quickly book overnight stays in a few clicks</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/accommodation-product',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            parent_category: 'marketplace_types'
        },
        {
            id: 'bundle',
            name: __('Bundle', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Offer personalized product bundles, bulk discount packages, and assembled products.</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/bundle-product',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            parent_category: 'marketplace_types'
        },
        {
            id: 'auction',
            name: __('Auction', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Implement an auction system similar to eBay on your store</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/auction-product',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            parent_category: 'marketplace_types'
        },
        {
            id: 'rental-pro',
            name: __('Rental Pro', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Perfect for those desiring to offer rental, booking, or real state agencies or services.</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/rental-product',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            parent_category: 'marketplace_types'
        },
        {
            id: 'gift-card',
            name: __('Gift Cards', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Activate this module to offer gift cards, boosting your store's earnings and attracting fresh clientele.</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/gift-card/',
            //settings_link: appLocalizer.site_url,
            pro_module: true,
            parent_category: 'marketplace_types'
        },
        { type: 'separator', id: 'seller_management', label: 'Seller Management' },
        {
            id: 'identity-verification',
            name: __('Seller Identity Verification', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Verify vendors on the basis of Id documents, Address and Social Media Account</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/identity-verification/',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=settings-identity-verification'),
            pro_module: true,
            parent_category: 'seller_management'
        },
        {
            id: 'spmv',
            name: __('Single Product Multiple Vendor', 'multivendorx'),
            desc: "<fieldset><legend>Free</legend><span>Lets multiple vendors sell the same products</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/single-product-multiple-vendors-spmv',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=spmv-pages'),
            pro_module: false,
            parent_category: 'seller_management'
        },
        {
            id: 'import-export',
            name: __('Import Export', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Helps vendors seamlessly import or export product data using CSV etc</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/import-export',
            //settings_link: appLocalizer.site_url,
            pro_module: true
        },
        {
            id: 'store-inventory',
            name: __('Store Inventory', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Present vendors with the choice to handle normal product quantities, set low inventory and no inventory alarms and manage a subscriber list for the unavailable products.</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/store-inventory',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=settings-store-inventory'),
            pro_module: true
        },
        {
            id: 'min-max',
            name: __('Min Max Quantities', 'multivendorx'),
            desc: "<fieldset><legend>Free</legend><span>Set a minimum or maximum purchase quantity or amount for the products of your marketplace.</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/non-knowledgebase/min-max-quantities/',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=settings-min-max'),
            pro_module: false
        },
        {
            id: 'bank-payment',
            name: __('Bank Transfer', 'multivendorx'),
            desc: "<fieldset><legend>Free</legend><span>Manually transfer money directly to the vendor's bank account.</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/direct-bank-transfer/',
            //settings_link: appLocalizer.site_url,
            pro_module: false
        },
        {
            id: 'paypal-masspay',
            name: __('PayPal Masspay', 'multivendorx'),
            desc: "<fieldset><legend>Free</legend><span>Schedule payment to multiple vendors at the same time.</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/paypal-masspay/',
            //settings_link: appLocalizer.site_url,
            pro_module: false
        },
        {
            id: 'paypal-payout',
            name: __('PayPal Payout', 'multivendorx'),
            desc: "<fieldset><legend>Free</legend><span>Send payments automatically to multiple vendors as per scheduled</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/paypal-payout',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=payment&name=payment-payout'),
            pro_module: false
        },
        {
            id: 'paypal-marketplace',
            name: __('PayPal Marketplace (Real time Split)', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Using split payment pay vendors instantly after a completed order</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/paypal-marketplace-real-time-split/',
            //settings_link: admin_url('admin.php?page=wc-settings&tab=checkout&section=mvx_paypal_marketplace'),
            pro_module: true
        },
        {
            id: 'stripe-connect',
            name: __('Stripe Connect', 'multivendorx'),
            desc: "<fieldset><legend>Free</legend><span>Connect to vendors stripe account and make hassle-free transfers as scheduled.</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/stripe-connect',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=payment&name=payment-stripe-connect'),
            pro_module: false
        },
        {
            id: 'stripe-marketplace',
            name: __('Stripe Marketplace (Real time Split)', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Real-Time Split payments pays vendor directly after a completed order</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/stripe-marketplace',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=payment&name=payment-stripe-connect'),
            pro_module: true
        },
        {
            id: 'mangopay',
            name: __('Mangopay', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Gives the benefit of both realtime split transfer and scheduled distribution</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/mangopay',
            //settings_link: admin_url('admin.php?page=mvx-setting-admin'),
            pro_module: true
        },
        {
            id: 'razorpay',
            name: __('Razorpay', 'multivendorx'),
            desc: "<fieldset><legend>Free</legend><span>For clients looking to pay multiple Indian vendors instantly</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/payment/',
            //settings_link: admin_url('admin.php?page=mvx-setting-admin'),
            pro_module: false
        },
        {
            id: 'zone-shipping',
            name: __('Zone-Wise Shipping', 'multivendorx'),
            desc: "<fieldset><legend>Free</legend><span>Limit vendors to sell in selected zones</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/shipping-by-zone/',
            //settings_link: admin_url('admin.php?page=wc-settings&tab=shipping'),
            pro_module: false
        },
        {
            id: 'distance-shipping',
            name: __('Distance Shipping', 'multivendorx'),
            desc: "<fieldset><legend>Free</legend><span>Calculate Rates based on distance between the vendor store and drop location</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/distance-shipping',
            //settings_link: admin_url('admin.php?page=wc-settings&tab=shipping&section=mvx_product_shipping_by_distance'),
            pro_module: false
        },
        {
            id: 'country-shipping',
            name: __('Country-Wise Shipping', 'multivendorx'),
            desc: "<fieldset><legend>Free</legend><span>Let vendors choose and manage shipping, to countries of their choice</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/country-shipping',
            //settings_link: admin_url('admin.php?page=wc-settings&tab=shipping&section=mvx_product_shipping_by_country'),
            pro_module: false
        },
        {
            id: 'weight-shipping',
            name: __('Weight Wise Shipping (using Table Rate Shipping)', 'multivendorx'),
            desc: "<fieldset><legend>Free</legend><span>Vendors can create shipping rates based on price, weight and quantity</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/weight-shipping',
            //settings_link: admin_url('admin.php?page=wc-settings&tab=shipping'),
            pro_module: false
        },
        {
            id: 'per-product-shipping',
            name: __('Per Product Shipping', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Let vendors add shipping cost to specific products</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/per-product-shipping',
            //settings_link: admin_url('admin.php?page=wc-settings&tab=shipping'),
            pro_module: true
        },
        {
            id: 'invoice',
            name: __('Invoice & Packing slip', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Send invoice and packaging slips to vendor</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/invoice-packing-slip',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=settings-vendor-invoice'),
            pro_module: true
        },
        {
            id: 'marketplace-refund',
            name: __('Marketplace Refund', 'multivendorx'),
            desc: "<fieldset><legend>Free</legend><span>Enable customer refund requests & Let vendors manage customer refund</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/marketplace-refund',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=refund-management'),
            pro_module: false
        },
        {
            id: 'store-location',
            name: __('Store Location', 'multivendorx'),
            desc: "<fieldset><legend>Free</legend><span>If enabled customers can view a vendor's store location</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/store-location',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=store'),
            pro_module: false
        },
        {
            id: 'store-policy',
            name: __('Store Policy', 'multivendorx'),
            desc: "<fieldset><legend>Free</legend><span>Offers vendors the option to set individual store specific policies</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/store-policy',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=policy'),
            pro_module: false
        },
        {
            id: 'follow-store',
            name: __('Follow Store', 'multivendorx'),
            desc: "<fieldset><legend>Free</legend><span>Permit customers to follow store, receive updates & lets vendors keep track of customers</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/follow-store',
            //settings_link: appLocalizer.site_url,
            pro_module: false
        },
        {
            id: 'store-review',
            name: __('Store Review', 'multivendorx'),
            desc: "<fieldset><legend>Free</legend><span>Allows customers to rate and review stores and their purchased products</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/store-review',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=review-management'),
            pro_module: false
        },
        {
            id: 'business-hours',
            name: __('Business Hours', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Gives vendors the option to set and manage business timings</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/business-hours/',
            //settings_link: appLocalizer.site_url,
            pro_module: true
        },
        {
            id: 'mvx-blocks',
            name: __('Gutenberg Blocks', 'multivendorx'),
            desc: "<fieldset><legend>Free</legend><span>Lets you add widgets using Gutenberg block editor. Use the block to register our widget area on any page or post using the Gutenberg editor.</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: '',
            //settings_link: appLocalizer.site_url,
            pro_module: false
        },
        {
            id: 'advertisement',
            name: __('Advertise Product', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Enable the option of paid advertisiment by letting vendors advertise their products on your website.</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/advertise-product/',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=settings-advertising'),
            pro_module: true
        },
        {
            id: 'vacation',
            name: __('Vacation', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>On vacation mode, vendor can allow / disable sale & notify customer accordingly</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/vacation',
            //settings_link: appLocalizer.site_url,
            pro_module: true
        },
        {
            id: 'staff-manager',
            name: __('Staff Manager', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Lets vendors hire and manage staff to support store</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/staff-manager',
            //settings_link: appLocalizer.site_url,
            pro_module: true
        },
        {
            id: 'wholesale',
            name: __('Wholesale', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Set wholesale price and quantity for customers</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/wholesale',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=settings-wholesale'),
            pro_module: true
        },
        {
            id: 'live-chat',
            name: __('Live Chat', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Allows real-time messaging between vendors and customers</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/live-chat',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=settings-live-chat'),
            pro_module: true
        },
        {
            id: 'store-support',
            name: __('Store Support', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Streamline order support with vendor-customer ticketing system.</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/store-support/',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=settings-store-support'),
            pro_module: true
        },
        {
            id: 'store-analytics',
            name: __('Store Analytics', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Gives vendors detailed store report & connect to google analytics</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/store-analytics',
            //settings_link: admin_url('admin.php?page=mvx-setting-admin'),
            pro_module: true
        },
        {
            id: 'store-seo',
            name: __('Store SEO', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Lets vendors manage their store SEOs using Rank Math and Yoast SEO</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/store-seo',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=settings-seo'),
            pro_module: true
        },
        {
            id: 'marketplace-membership',
            name: __('Marketplace Membership', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Lets Admin create marketplace memberships levels and manage vendor-wise individual capablity</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/marketplace-memberhsip',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=settings-vendor-membership'),
            pro_module: true
        },
        {
            id: 'announcement',
            name: __('Announcement', 'multivendorx'),
            desc: "<fieldset><legend>Free</legend><span>Lets admin broadcast important news to sellers</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/announcement/',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=work-board&name=announcement'),
            pro_module: false
        },
        {
            id: 'report-abuse',
            name: __('Report Abuse', 'multivendorx'),
            desc: "<fieldset><legend>Free</legend><span>Lets customers report false products</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/report-abuse',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=work-board&name=report-abuse'),
            pro_module: false
        },
        {
            id: 'knowladgebase',
            name: __('Knowledgebase', 'multivendorx'),
            desc: "<fieldset><legend>Free</legend><span>Admin can share tutorials and othe vendor-specific information with vendors</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/knowledgebase/',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=work-board&name=knowladgebase'),
            pro_module: false
        },
        {
            id: 'elementor',
            name: __('Elementor', 'multivendorx'),
            desc: "<fieldset><legend>Free</legend><span>Create Sellers Pages using Elementors drag and drop feature</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/mvx-elementor',
            //settings_link: appLocalizer.site_url,
            pro_module: false
        },
        {
            id: 'buddypress',
            name: __('Buddypress', 'multivendorx'),
            desc: "<fieldset><legend>Free</legend><span>Allows stores to have a social networking feature</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/mvx-buddypress',
            //settings_link: admin_url('admin.php?page=mvx#&submenu=settings&name=social'),
            pro_module: false
        },
        {
            id: 'wpml',
            name: __('WPML', 'multivendorx'),
            desc: "<fieldset><legend>Free</legend><span>Gives vendors the option of selling their product in different languages</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/mvx-wpml',
            //settings_link: appLocalizer.site_url,
            pro_module: false
        },
        {
            id: 'advance-custom-field',
            name: __('Advance Custom field', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Allows for an on demand product field in Add Product section</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/mvx-acf',
            //settings_link: appLocalizer.site_url,
            pro_module: true
        },
        {
            id: 'geo-my-wp',
            name: __('GEOmyWP', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Offer vendor the option to attach location info along with their products</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/geo-my-wp',
            //settings_link: appLocalizer.site_url,
            pro_module: true
        },
        {
            id: 'toolset-types',
            name: __('Toolset Types', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Allows admin to create custom fields, and taxonomy for vendor's product field</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: '',
            //settings_link: appLocalizer.site_url,
            pro_module: true
        },
        {
            id: 'wp-affiliate',
            name: __('WP Affiliate', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Launch affiliate programme into your marketplace</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/affiliate-product/',
            //settings_link: appLocalizer.site_url,
            pro_module: true
        },
        {
            id: 'product-addon',
            name: __('Product Addon', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Offer add-ons like gift wrapping, special messages etc along with primary products</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/mvx-product-addon',
            //settings_link: appLocalizer.site_url,
            pro_module: true
        },
        {
            id: 'shipstation-module',
            name: __('Shipstation', 'multivendorx'),
            desc: "<fieldset><legend><i class='adminlib-pro-tab'></i> Pro</legend><span>Shipstation</span></fieldset>",
            icon: 'adminlib-dynamic-pricing',
            doc_link: 'https://multivendorx.com/docs/knowledgebase/shipstation/',
            //settings_link: appLocalizer.site_url,
            pro_module: true
        }
    ]
}
