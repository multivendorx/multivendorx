import { __ } from '@wordpress/i18n';

const methods = appLocalizer?.all_payments
	? Object.entries(appLocalizer.all_payments).map(([_, value]) => value)
	: [];

export default {
	id: 'overview',
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
			// proSetting: true,
		},
		{
			key: 'sms_receiver_phone_number',
			type: 'text',
			label: __('Receiver phone number', 'multivendorx'),
			moduleEnabled: 'store-policy',
			beforeElement: {
				type: 'select',
				key: 'store_base_pre',
				size: '90px',
				options: [
					{ label: '+91', value: 'store' },
					{ label: '+92', value: 'shop' },
					{ label: '+93', value: 'vendor' },
				],
			},
			afterElement: {
				type: 'select',
				key: 'store_base_post',
				size: '90px',
				options: [
					{ label: '+91', value: 'store' },
					{ label: '+92', value: 'shop' },
					{ label: '+93', value: 'vendor' },
				],
			},
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
			required: true
		},
		{
			key: 'marketplace_model',
			type: 'multi-select',
			label: __(
				'What kind of marketplace you are building',
				'multivendorx'
			),
			options: [
				{
					key: 'general',
					label: __('General marketplace', 'multivendorx'),
					value: 'general',
				},
				{
					key: 'product',
					label: __('Product marketplace', 'multivendorx'),
					value: 'product',
				},
				{
					key: 'rental',
					label: __('Rental marketplace', 'multivendorx'),
					value: 'rental',
				},
				{
					key: 'auction',
					label: __('Auction marketplace', 'multivendorx'),
					value: 'auction',
				},
				{
					key: 'subscription',
					label: __('Subscription marketplace', 'multivendorx'),
					value: 'subscription',
				},
				{
					key: 'service',
					label: __('Service marketplace', 'multivendorx'),
					value: 'service',
				},
				{
					key: 'mixed',
					label: __('Mixed marketplace', 'multivendorx'),
					value: 'mixed',
				}
			],
		},
		{
            key: 'default_pages',
            type: 'button',
            name: __('Create Default MultiVendorX Page', 'multivendorx'),
            label: __('MultiVendorX page', 'multivendorx'),
            desc: __(
                'This tool will install all the missing MultiVendorX pages. Pages already defined and set up will not be replaced.',
                'multivendorx'
            ),
            apilink: 'status',
            method: 'GET'
        },
		{
			key: 'generate_key',
			type: 'text',
			label: __('Generate Key', 'multivendorx'),
			afterElement: {
				type: 'button',
				key: 'generate_button',
				name: "Generate",
				generate: true,
				responseKey: 'generate_key',
				className: 'purple-bg'
			},
		},
		{
			key: 'withdraw_type',
			type: 'setting-toggle',
			label: __('Withdrawal request approval', 'multivendorx'),
			settingDescription: __(
				'Control how withdrawl requests are handled when stores initiate withdrawals manually.',
				'multivendorx'
			),
			desc: __(
				"<strong>Depending on your chosen approval mode:</strong><br><br><strong>Automatic</strong><br> If the payment method is <em>Stripe Connect</em> or <em>PayPal Payout</em>, the withdrawal is automatically approved and transferred to the store's account as soon as it's requested. For all other payment methods, withdrawals must be processed manually.<br><strong>Example:</strong>A store's $150 commission becomes available after a 7-day clearance period. Once they request a withdrawal, Stripe instantly transfers the amount to their connected account.<br><br><strong>Manual</strong><br>The store submits a withdrawal request, and the admin must manually review and disburse the funds.<br><strong>Example:</strong> The same $150 request appears in the admin dashboard. The admin verifies the transaction and manually releases the payment.",
				'multivendorx'
			),

			options: [
				{
					key: 'automatic',
					label: __('Automatic', 'multivendorx'),
					value: 'automatic',
				},
				{
					key: 'manual',
					label: __('Manual', 'multivendorx'),
					value: 'manual',
				},
			],
		},
		{
			key: 'refund_reasons',
			type: 'expandable-panel',
			label: __('Refund reasons', 'multivendorx'),
			placeholder: __('Enter refund reasons here…', 'multivendorx'),
			settingDescription: __(
				'Add one or more reasons that stores can select when handling refund requests.',
				'multivendorx'
			),
			addNewBtn: true,
			min: 1,
			addNewTemplate: {
				label: 'New Reasons',
			},
			modal: []
		},
		{
            key: 'tax_information',
            type: 'expandable-panel',
            label: __('Legal and tax information', 'multivendorx'),
            addNewBtn: true,
            addNewTemplate: {
                label: 'New Tax information',
                formFields: [
                    {
                        key: 'label',
                        type: 'text',
                        label: 'Tax information',
                        placeholder: 'Enter tax information',
                    },
                ],
            },
            modal: [],
        },
		{
			key: 'payment_methods',
			type: 'expandable-panel',
			modal: methods,
		},
		{
			key: 'ratings_parameters',
			type: 'expandable-panel',
			label: __('Rating parameters', 'multivendorx'),
			settingDescription: __(
				'Define the key factors customers will use to evaluate each store.',
				'multivendorx'
			),
			min: 3,
			desc: __(
				'Give customers a fair way to share feedback! Define what they rate, like product/listing quality, delivery, or service. You’ll start with five default parameters that can be edited or removed, but make sure at least three stay active for balanced, detailed reviews.',
				'multivendorx'
			),
			addNewBtn: true,
			addNewTemplate: {
				label: 'New Rating Parameters',
				editableFields: {
					title: true,
					description: false,
				},
			},
			modal: [],
			proSetting: false,
		},
		{
			key: 'shipping_modules',
			type: 'expandable-panel',
			label: __('Shipping methods available to stores ', 'multivendorx'),
			desc: __(
				'See which shipping options your stores can offer to customers. Each method determines how shipping costs are calculated.',
				'multivendorx'
			),
			modal: [
				{
					id: 'zone-wise-shipping',
					icon: 'adminfont-zone-wise-shipping',
					label: 'Zone based shipping',
					disableBtn: true,
					desc: 'Stores can configure multiple shipping zones.',
					formFields: [
						{
							key: 'zones',
							type: 'clickable-list',
							label: 'Shipping Zones',
							desc: 'Create shipping zones in WooCommerce → Shipping using the ‘Add Zone’ button. Assign the shipping method ‘Store shipping’ to let each store set its own shipping costs for that zone.',
							items: appLocalizer.all_zones,
							button: {
								label: 'Add New Zone',
								url: `${appLocalizer.admin_url}admin.php?page=wc-settings&tab=shipping`,
							},
						},
						{
							key: 'default_pages',
							type: 'button',
							name: __('Set up', 'multivendorx'),
							desc: __(
								'This tool will install all the missing MultiVendorX pages. Pages already defined and set up will not be replaced.',
								'multivendorx'
							),
							link: `${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=settings&subtab=commissions`,
							beforeElement: {
								key: 'taxable',
								label: __('Charge tax on shipping cost', 'multivendorx'),
								desc: __('Shipping charges will be treated as taxable items during checkout', 'multivendorx'),
								type: 'checkbox',
								options: [
									{
										key: 'taxable',
										value: 'taxable',
									},
								],
							},
						},
						
					],
				},
				{
							id: 'marketplace_setup',
							label: 'Choose what kind of marketplace you are building',
							icon: 'adminfont-storefront',
							desc: 'This helps us tailor features for your business.',
							countBtn: true,
							isWizardMode: true,
							openForm:true,
							formFields: [
								{
									key: 'marketplace_model',
									type: 'multi-select',
									selectType: 'single-select',
									label: __(
										'What kind of marketplace you are building',
										'multivendorx'
									),
									options: [
										{
											key: 'general',
											label: __('General marketplace', 'multivendorx'),
											value: 'general',
										},
										{
											key: 'product',
											label: __('Product marketplace', 'multivendorx'),
											value: 'product',
										},
										{
											key: 'rental',
											label: __('Rental marketplace', 'multivendorx'),
											value: 'rental',
										},
										{
											key: 'auction',
											label: __('Auction marketplace', 'multivendorx'),
											value: 'auction',
										},
										{
											key: 'subscription',
											label: __('Subscription marketplace', 'multivendorx'),
											value: 'subscription',
										},
										{
											key: 'service',
											label: __('Service marketplace', 'multivendorx'),
											value: 'service',
										},
										{
											key: 'mixed',
											label: __('Mixed marketplace', 'multivendorx'),
											value: 'mixed',
										}
									],
								},
								{
									key: 'product_types',
									type: 'multi-select',
									selectType: 'multi-select',
									label: __(
										'What kind of listings stores can create',
										'multivendorx'
									),
									options: [
										{
											key: 'simple',
											label: __('Simple', 'multivendorx'),
											value: 'simple',
										},
										{
											key: 'variable',
											label: __('Variable', 'multivendorx'),
											value: 'variable',
										},
										{
											key: 'booking',
											label: __('Booking', 'multivendorx'),
											value: 'booking',
										},
										{
											key: 'subscription',
											label: __('Subscription', 'multivendorx'),
											value: 'subscription',
										},
										{
											key: 'rental',
											label: __('Rental', 'multivendorx'),
											value: 'rental',
										},
										{
											key: 'auction',
											label: __('Auction', 'multivendorx'),
											value: 'auction',
										},
										{
											key: 'accommodation',
											label: __('Accommodation', 'multivendorx'),
											value: 'accommodation',
										},
									],
								},
								{
									key: 'notice',
									type: 'blocktext',
									label: __(' ', 'multivendorx'),
									blocktext: __(
										'Ready to unlock the full potential of your marketplace? Activate Woocommerce Rental with MultiVendorX Pro and start selling like a pro today!',
										'multivendorx'
									),
									dependent: {
										key: 'marketplace_model',
										value: 'rental',
									},
								},
								{
									key: 'notice',
									type: 'blocktext',
									label: __(' ', 'multivendorx'),
									blocktext: __(
										'Ready to unlock the full potential of your marketplace? Activate Woocommerce Simple Auction with MultiVendorX Pro and start selling like a pro today!',
										'multivendorx'
									),
									dependent: {
										key: 'marketplace_model',
										value: 'auction',
									},
								},
								{
									key: 'notice',
									type: 'blocktext',
									label: __(' ', 'multivendorx'),
									blocktext: __(
										'Ready to unlock the full potential of your marketplace? Activate Woocommerce Subscription with MultiVendorX Pro and start selling like a pro today!',
										'multivendorx'
									),
									dependent: {
										key: 'marketplace_model',
										value: 'subscription',
									},
								},
								{
									key: 'store_selling_mode',
									type: 'setting-toggle',
									label: __(
										'How stores sell on your marketplace',
										'multivendorx'
									),
									desc: __('Choose how listings are created and sold by stores.', 'multivendorx'),
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
											proSetting: true
										},
									],
								},
								{
									key: 'wizardButtons',
									type: 'button',
									options: [
										{
											label: 'Back',
											action: 'back',
											btnClass: 'admin-btn btn-red',
										},
										{
											label: 'Next',
											action: 'next',
											btnClass: 'admin-btn btn-purple',
										},
									],
								},
							],
						},
						{
							id: 'store_setup',
							label: 'Configure Your Store',
							icon: 'adminfont-storefront',
							desc: 'How stores sell on your marketplace.',
							countBtn: true,
							isWizardMode: true,
							openForm:true,
							formFields: [
								{
									key: 'approve_store',
									type: 'setting-toggle',
									label: __(
										'Store registration approval',
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
									key: 'wizardButtons',
									type: 'button',
									options: [
										{
											label: 'Back',
											action: 'back',
											btnClass: 'admin-btn btn-red',
										},
										{
											label: 'Next',
											action: 'next',
											btnClass: 'admin-btn btn-purple',
										},
									],
								},
							],
						},
						{
							id: 'commission_setup',
							label: 'How marketplace commission is calculated',
							icon: 'adminfont-storefront',
							desc: 'Decide how your marketplace earns money.',
							countBtn: true,
							isWizardMode: true,
							openForm:true,
							formFields: [
								{
									key: 'commission_type',
									type: 'setting-toggle',
									label: __('How commission is calculated', 'multivendorx'),
									settingDescription: __(
										'Choose how marketplace commission is applied.',
										'multivendorx'
									),
									desc: __(
										'<ul><li>Store order based - Calculated on the full order amount of each store. Example: A customer buys from 3 stores → commission applies separately to each store’s order.</li><li>Per item based - Applied to each product in the order. Example: An order with 5 items → commission applies 5 times, once per item.</li></ul>',
										'multivendorx'
									),
									options: [
										{
											key: 'store_order',
											label: __('Store order based', 'multivendorx'),
											value: 'store_order',
										},
										{
											key: 'item',
											label: __('Per item based', 'multivendorx'),
											value: 'item',
										},
									],
								},
								{
									key: 'commission_value',
									type: 'nested',
									label: 'Commission value',
									single: true,
									desc: __(
										'Set global commission rates that apply to each individual item quantity. Commission will be calculated by multiplying the rate with the total number of items across all products in the order.',
										'multivendorx'
									),
									nestedFields: [
										{
											key: 'commission_fixed',
											type: 'number',
											preText: appLocalizer.currency_symbol,
											size: '8rem',
											beforeElement: {
												type: 'preposttext',
												textType: 'pre',
												preText: 'Fixed',
											},
											afterElement: {
												type: 'preposttext',
												textType: 'post',
												postText: '+',
											},
										},
										{
											key: 'commission_percentage',
											type: 'number',
											postText: __('%', 'multivendorx'),
											size: '8rem',
										},
									],
								},
								{
									key: 'disbursement_order_status',
									type: 'multi-checkbox',
									label: __(
										'When stores earn money',
										'multivendorx'
									),
									settingDescription: __(
										'Choose when store earnings are added to their wallet.',
										'multivendorx'
									),
									 
									options: [
										{
											key: 'completed',
											label: __('Completed', 'multivendorx'),
											value: 'completed',
										},
										{
											key: 'delivered',
											label: __('Delivered', 'multivendorx'),
											value: 'delivered',
											proSetting: true,
										},
										{
											key: 'processing',
											label: __('Processing', 'multivendorx'),
											value: 'processing',
										},
										{
											key: 'shipped',
											label: __('Shipped', 'multivendorx'),
											value: 'shipped',
											proSetting: true,
										},
									],
									selectDeselect: true,
								},
								{
									key: 'wizardButtons',
									type: 'button',
									options: [
										{
											label: 'Back',
											action: 'back',
											btnClass: 'admin-btn btn-red',
										},
										{
											label: 'Next',
											action: 'next',
											btnClass: 'admin-btn btn-purple',
										},
									],
								},
							],
						},
						{
							id: 'more_settings',
							label: 'Want to configure more settings?',
							icon: 'adminfont-storefront',
							desc: "You're all set with the basics! Use the quick links below to fine-tune your marketplace now — or come back later anytime.",
							countBtn: true,
							isWizardMode: true,
							openForm:true,
							formFields: [
								{
									key: 'commission_settings',
									type: 'setup',
									title: 'Commission settings',
									desc: 'Adjust commission rules and payout behavior.',
									hideCheckbox: true,
									link: `${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=settings&subtab=store-commissions`,
								},
								{
									key: 'commission_settings',
									type: 'setup',
									title: 'Commission settings',
									desc: 'Adjust commission rules and payout behavior.',
									hideCheckbox: true,
									link: `${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=settings&subtab=store-commissions`,
								},
								{
									key: 'commission_settings',
									type: 'setup',
									title: 'Commission settings',
									desc: 'Adjust commission rules and payout behavior.',
									hideCheckbox: true,
									link: `${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=settings&subtab=store-commissions`,
								},
								{
									key: 'commission_settings',
									type: 'setup',
									title: 'Commission settings',
									desc: 'Adjust commission rules and payout behavior.',
									hideCheckbox: true,
									link: `${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=settings&subtab=store-commissions`,
								},
								{
									key: 'wizardButtons',
									type: 'button',
									options: [
										{
											label: 'Back',
											action: 'back',
											btnClass: 'admin-btn btn-red',
										},
										{
											label: 'Finish',
											action: 'next',
											btnClass: 'admin-btn btn-purple',
											redirect: `${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=modules`,
										},
									],
								},
							],
						},
			]
		},
		
		{
            key: 'type_options',
            type: 'checkbox',
            classes: 'vertical',
            label: __('When to send invoice emails  ', 'multivendorx'),

            desc: __(
                'Choose how invoices are automatically sent to customers and stores',
                'multivendorx'
            ),
            // moduleEnabled: 'invoice',
            options: [
                {
                    key: 'virtual',
                    label: __(
                        'Attach to order confirmation email',
                        'multivendorx'
                    ),
                    desc: __('Include invoice PDF with the order confirmation customers already receive.', 'multivendorx'),
                    value: 'virtual',
            		proSetting: true,
                },
                {
                    key: 'Send Separate Invoice Email',
                    label: __('Send separate invoice email', 'multivendorx'),
                    desc: __('Dedicated email with invoice', 'multivendorx'),
                    value: 'downloadable',
                },
                {
                    key: 'Notify Stores of Invoice Generation',
                    label: __(
                        'Notify stores',
                        'multivendorx'
                    ),
                    desc: __('Send a copy to the vendor when their sale generates an invoice.', 'multivendorx'),
                    value: 'downloadable',
                },
                {
                    key: 'Generate Packing Slips',
                    label: __('Include packing slip', 'multivendorx'),
                    desc: __('Also generate and attach a packing slip with the invoice.', 'multivendorx'),
                    value: 'downloadable',
                },
            ],
            selectDeselect: true,
        },
		{
			key: 'shipping_providers',
			type: 'checkbox',
			label: __(' Shipping carriers', 'multivendorx'),
			moduleEnabled: 'store-shipping',
			settingDescription: __(
				' Choose which shipping providers stores can use. Only the carriers you enable will be available for sellers to ship their products and add tracking details. This helps keep all shipments through trusted, approved providers.',
				'multivendorx'
			),
			 
			addNewBtnText: 'Add Custom Provider',
			options: [
				{
					key: 'australia_post',
					label: __('Australia post', 'multivendorx'),
					value: 'australia_post',
					edit : true,
				},
				{
					key: 'canada_post',
					label: __('Canada post', 'multivendorx'),
					value: 'canada_post',
					edit : true,
				},
				{
					key: 'city_link',
					label: __('City link', 'multivendorx'),
					value: 'city_link',
					edit : true,
				},
				{
					key: 'dhl',
					label: __('DHL', 'multivendorx'),
					value: 'dhl',
					edit : true,
				},
				{
					key: 'fastway_south_africa',
					label: __('Fastway South Africa', 'multivendorx'),
					value: 'fastway_south_africa',
					edit : true,
				},
				{
					key: 'fedex',
					label: __('FedEx', 'multivendorx'),
					value: 'fedex',
					edit : true,
				},
				{
					key: 'ontrac',
					label: __('OnTrac', 'multivendorx'),
					value: 'ontrac',
					edit : true,
				},
				{
					key: 'polish_shipping',
					label: __('Polish shipping providers', 'multivendorx'),
					value: 'polish_shipping',
					edit : true,
				},
			],
			selectDeselect: true,
		},
		{
			key: 'taxable',
			label: __('Charge tax on shipping cost', 'multivendorx'),
			settingDescription: __(
				'Shipping charges will be treated as taxable items during checkout. Otherwise shipping costs will be tax-free.',
				'multivendorx'
			),
			desc: __('', 'multivendorx'),
			type: 'checkbox',
			moduleEnabled: 'store-shipping',
			options: [
				{
					key: 'taxable',
					value: 'taxable',
				},
			],
			look: 'toggle',
		},

		// {
		// 	key: 'section',
		// 	type: 'section',
		// 	hint: __('Customer-facing order presentation & invoicing', 'multivendorx'),
		// },
		// {
		// 	key: 'display_customer_order',
		// 	type: 'setting-toggle',
		// 	label: __('Customers will see information for', 'multivendorx'),
		// 	custom: true,
		// 	settingDescription: __(
		// 		'Choose which order statuses will send customers email notifications, PDF invoices, and display order details in their account.',
		// 		'multivendorx'
		// 	),
		// 	desc: __(
		// 		'In a multivendor setup, a <b>Main Order</b> is the parent order placed by the customer, while <b>Sub-orders</b> are created for each store.<br/><b>Enabling the Main Order is recommended</b>, as it allows you to send a single email that includes the Main Order and all related Sub-orders. Alternatively, you can send separate emails for the Main Order and each Sub-order.',
		// 		'multivendorx'
		// 	),
		// 	options: [
		// 		{
		// 			key: 'mainorder',
		// 			label: __('Main Order (Combined)', 'multivendorx'),
		// 			desc: __('Sends a single order and invoice for the entire purchase', 'multivendorx'),
		// 			icon: 'adminfont-cart',
		// 			value: 'mainorder',
		// 			customHtml: `<div class="toggle-notice">
		// 			<p><strong>What it does:</strong> Sends a single order and invoice for the entire purchase.</p>
		// 			<p><strong>Email/Invoice:</strong> One email, one receipt with your marketplace tax details.</p>
		// 			<p><strong>My Account:</strong> Shows one combined order.</p>
		// 			<p><strong>Use this if:</strong> You want a simplified, all-in-one order view for customers.</p>
		// 		</div>`
		// 		},
		// 		{
		// 			key: 'suborders',
		// 			label: __('Sub-Orders (Per Store)', 'multivendorx'),
		// 			desc: __('Sends separate orders and invoices for each store', 'multivendorx'),
		// 			icon: 'adminfont-store',
		// 			value: 'suborders',
		// 			customHtml: `<div class="toggle-notice">
		// 			<p><strong>What it does:</strong> Sends separate orders and invoices for each store.</p>
		// 			<p><strong>Email/Invoice:</strong> Separate emails and receipts with each store’s tax details.</p>
		// 			<p><strong>My Account:</strong> Shows multiple orders (one per store).</p>
		// 			<p><strong>Use this if:</strong> You want customers to see individual store orders and receipts.</p>
		// 		</div>`
		// 		},
		// 		{
		// 			key: 'main_sub',
		// 			label: __('Main + Sub Orders (Combined + Separate)', 'multivendorx'),
		// 			desc: __('Sends both a combined order and separate store orders with invoices', 'multivendorx'),
		// 			icon: 'adminfont-repeat',
		// 			value: 'main_sub',
		// 			customHtml: `<div class="toggle-notice">
		// 			<p><strong>What it does:</strong> Sends both a combined order and separate store orders with invoices.</p>
		// 			<p><strong>Email/Invoice:</strong> One email for the full order + separate emails per store; multiple receipts with marketplace and store tax details.</p>
		// 			<p><strong>My Account:</strong> Shows combined + individual orders.</p>
		// 			<p><strong>Use this if:</strong> You want full transparency for both marketplace and individual store orders.</p>
		// 		</div>`
		// 		},

		// 	],
		// },
		// {
		// 	key: 'section',
		// 	type: 'section',
		// 	hint: __('Enable content styling tools for stores', 'multivendorx'),
		// },
		// {
		// 	key: 'tinymce_api_section',
		// 	type: 'text',
		// 	label: __('Tinymce API', 'multivendorx'),
		// 	desc: __(
		// 		'Get your <a href= "https://www.tiny.cloud/blog/how-to-get-tinymce-cloud-up-in-less-than-5-minutes/" target= "_blank">TinyMCE API key</a> and paste it here, to unlock visual editing tools across the marketplace. Admin and stores can easily format text, add links, lists, and other styling to their store descriptions, announcements, knowledge base posts, and product/listing details-no coding needed.',
		// 		'multivendorx'
		// 	),
		// },
		// {
		// 	key: 'section',
		// 	type: 'section',
		// 	hint: __('Shortcode library', 'multivendorx'),
		// },
		// {
		// 	key: 'available_shortcodes',
		// 	type: 'shortcode-table',
		// 	label: __('Available shortcodes', 'multivendorx'),
		// 	desc: __('', 'multivendorx'),
		// 	optionLabel: ['Shortcodes and block library', 'Description', 'Arguments'],
		// 	icon: 'adminfont-general-tab',
		// 	options: [
		// 		{
		// 			key: 'marketplace_registration',
		// 			label: '[marketplace_registration]',
		// 			name: 'Marketplace registration',
		// 			desc: __(
		// 				'Displays the store registration form. Use this to allow new users to sign up as stores.',
		// 				'multivendorx'
		// 			),
		// 		},
		// 		{
		// 			key: 'marketplace_dashboard',
		// 			label: '[marketplace_dashboard]',
		// 			name: 'Marketplace dashboard',
		// 			desc: __(
		// 				'Displays the store dashboard where stores manage products/listings, orders, earnings, and store settings.',
		// 				'multivendorx'
		// 			),
		// 		},
		// 		{
		// 			key: 'marketplace_stores',
		// 			label: '[marketplace_stores]',
		// 			name: 'Show store lists',
		// 			desc: __(
		// 				'Displays a list of all registered stores with ratings. Use this to help customers discover stores.',
		// 				'multivendorx'
		// 			),
		// 			arguments: [
		// 				{
		// 					attribute: 'orderby',
		// 					description: 'Decide how the store list is sorted.',
		// 					accepted: 'name, category, registered (Default: registered)',
		// 					default: '[marketplace_stores orderby="registered"]',
		// 				},
		// 				{
		// 					attribute: 'order',
		// 					description: 'Set sorting direction.',
		// 					accepted: 'ASC, DESC (Default: ASC)',
		// 					default: '[marketplace_stores order="ASC"]',
		// 				},
		// 				{
		// 					attribute: 'perpage',
		// 					description: 'Set how many stores appear per page.',
		// 					accepted: 'Any number (Default: 12)',
		// 					default: '[marketplace_stores perpage="12"]',
		// 				},
		// 			],
		// 		},
		// 		{
		// 			key: 'marketplace_products',
		// 			label: '[marketplace_listings]',
		// 			name: 'Show store listings',
		// 			desc: __(
		// 				'Displays all listings added by a store. Use this to create store-specific listings listing pages.',
		// 				'multivendorx'
		// 			),
		// 			arguments: [
		// 				{
		// 					attribute: 'store',
		// 					description:
		// 						'Display products/listings from a specific store using Store ID or Store Slug.',
		// 					accepted: 'store_id, store_slug',
		// 					default: '[marketplace_products store_id="1"]',
		// 				},

		// 				{
		// 					attribute: 'perpage',
		// 					description: 'Set how many products/listings appear per page.',
		// 					accepted: 'Any number (Default = 12)',
		// 					default: '[marketplace_products perPage="12"]',
		// 				},

		// 				{
		// 					attribute: 'columns',
		// 					description: 'Decide how many products/listings appear in one row.',
		// 					accepted: 'Any number (Default = 4)',
		// 					default: '[marketplace_products columns="4"]',
		// 				},

		// 				{
		// 					attribute: 'orderby',
		// 					description:
		// 						'Choose the field used for sorting products/listings.',
		// 					accepted:
		// 						'title, date, price, popularity, rating, menu_order (Default = title)',
		// 					default: '[marketplace_products orderby="title"]',
		// 				},

		// 				{
		// 					attribute: 'order',
		// 					description: 'Set sorting direction.',
		// 					accepted: 'ASC, DESC (Default = ASC)',
		// 					default: '[marketplace_products order="ASC"]',
		// 				},

		// 				{
		// 					attribute: 'category',
		// 					description:
		// 						'Show products/listings from specific categories. Use category slugs separated by commas.',
		// 					accepted: 'Comma-separated category slugs',
		// 					default: '[marketplace_products category="clothing,shoes"]',
		// 				},

		// 				{
		// 					attribute: 'operator',
		// 					description:
		// 						'Define how multiple categories should be matched.',
		// 					accepted: 'IN, NOT IN, AND (Default = IN)',
		// 					default:
		// 						'[marketplace_products category="clothing,shoes" operator="IN"]',
		// 				},

		// 				{
		// 					attribute: 'product_visibility',
		// 					description:
		// 						'Filter products/listings based on visibility status.',
		// 					accepted: 'visible, catalog, search, hidden',
		// 					default:
		// 						'[marketplace_products product_visibility="visible"]',
		// 				},
		// 			],
		// 		},
		// 		{
		// 			key: 'marketplace-coupons',
		// 			label: '[marketplace-coupons]',
		// 			name: 'Show store coupons',
		// 			desc: __(
		// 				'Displays coupons created by a store along with their usage details.',
		// 				'multivendorx'
		// 			),
		// 			arguments: [
		// 				{
		// 					attribute: 'store_id',
		// 					description:
		// 						'Display coupons from a specific store using the store ID.',
		// 					accepted: 'Store ID',
		// 					default: '[marketplace-coupons store_id="1"]',
		// 				},
		// 				{
		// 					attribute: 'store_slug',
		// 					description:
		// 						'Display coupons from a specific store using the store slug.',
		// 					accepted: 'Store slug',
		// 					default: '[marketplace-coupons store_slug="john-store"]',
		// 				},
		// 				{
		// 					attribute: 'perPage',
		// 					description:
		// 						'Set how many coupons appear per page.',
		// 					accepted: 'Any number (Default = 10)',
		// 					default: '[marketplace-coupons perPage="10"]',
		// 				},
		// 				{
		// 					attribute: 'orderby',
		// 					description:
		// 						'Choose how coupons are sorted.',
		// 					accepted:
		// 						'date, id, title, code, modified (Default = date)',
		// 					default: '[marketplace-coupons orderby="date"]',
		// 				},
		// 				{
		// 					attribute: 'order',
		// 					description:
		// 						'Set the sorting direction.',
		// 					accepted: 'ASC, DESC (Default = DESC)',
		// 					default: '[marketplace-coupons order="DESC"]',
		// 				},
		// 			],
		// 		}
		// 	],
		// },
	],
};
