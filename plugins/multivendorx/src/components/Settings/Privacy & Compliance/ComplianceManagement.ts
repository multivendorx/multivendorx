import { __ } from '@wordpress/i18n';

export default {
	id: 'non-compliance',
	priority: 2,
	name: __('Compliance Management', 'mvx-pro'),
	desc: __(
		'Control store access based on verification status. Ensure only compliant stores can operate fully on your marketplace.',
		'mvx-pro'
	),
	icon: 'adminfont-compliance',
	submitUrl: 'settings',
	modal: [
		{
			key: 'store_compliance_management',
			type: 'expandable-panel',
			modal: [
				{
					id: 'seller-verification',
					icon: 'adminfont-seller-verification',
					label: 'Seller verification',
					connected: true,
					disableBtn: true,					 
					desc: 'Verify store identity and business legitimacy',
					moduleEnabled: 'marketplace-compliance',
					proSetting: true,
					formFields: [
						{
							key: 'enable_advertisement_in_subscription',
							type: 'setup',
							title: 'Identity verification',
							des: 'Store is verified through official business documents like trade license or permit.',
							link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=identity-verification`,
						},
						{
							key: 'display_advertised_product_on_top',
							type: 'setup',
							title: 'Social verification',
							des: 'Store authenticity is validated using connected social media accounts.',
							link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=identity-verification`,
						},
						{
							key: 'out_of_stock_visibility',
							type: 'setup',
							title: 'Email verification',
							des: 'The registered email address is verified to confirm the authenticity.',
							link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=identity-verification`,
						},
						{
							key: 'required_tasks',
							type: 'multi-checkbox',
							label: __('Non-Compliance action', 'multivendorx'),
							 
							options: [
								{
									key: 'block_dashboard_access',
									label: __(
										'Block dashboard access',
										'multivendorx'
									),
									value: 'block_dashboard_access',
									desc: __(
										'Prevents the store from accessing its dashboard until verification is completed.',
										'multivendorx'
									),
								},
								{
									key: 'hide_store_from_view',
									label: __(
										'Hide store from view',
										'multivendorx'
									),
									value: 'hide_store_from_view',
									desc: __(
										'Hides the store from customers until verification is completed.',
										'multivendorx'
									),
								},
								{
									key: 'disable_product',
									label: __(
										'Disable product upload',
										'multivendorx'
									),
									value: 'disable_product',
									desc: __(
										'Temporarily disables product sales and order fulfillment while the review is in progress.',
										'multivendorx'
									),
								},
							],
							selectDeselect: true,
						},
					],
				},
				{
					id: 'product-compliance',
					icon: 'adminfont-product',
					label: 'Product compliance',
					disableBtn: true,
					desc: 'Ensure product listings meet marketplace standards',
					moduleEnabled: 'marketplace-compliance',
					proSetting: true,
					formFields: [
						{
							key: 'prohibited_items_check',
							type: 'setup',
							title: 'Prohibited items check',
							des: 'Block restricted or banned products to maintain marketplace compliance.',
							link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=product-compliance`,
						},
						{
							key: 'product_images_descriptions',
							type: 'setup',
							title: 'Product images & descriptions',
							des: 'Approve product reviews before publishing to ensure quality and consistency.',
							link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=product-compliance`,
						},
						{
							key: 'product_authenticity_certificates',
							type: 'setup',
							title: 'Product authenticity certificates',
							des: 'Enforce product image and description standards for authenticity and trust.',
							link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=product-compliance`,
						},
						{
							key: 'product_abuse_reporting',
							type: 'setup',
							title: 'Product abuse reporting',
							des: 'Handle product violation or abuse reports effectively to ensure compliance.',
							link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=product-compliance`,
						},
						{
							key: 'non_compliance_action',
							type: 'multi-checkbox',
							label: __('Non-Compliance action', 'multivendorx'),
							 
							options: [
								{
									key: 'disable_product',
									label: __(
										'Disable product upload',
										'multivendorx'
									),
									value: 'disable_product',
									desc: __(
										'Temporarily disables product sales and order fulfillment while the review is in progress.',
										'multivendorx'
									),
								},
								{
									key: 'set_store_as_pending',
									label: __(
										'Set store as pending',
										'multivendorx'
									),
									value: 'SetStoreAsPending',
									desc: __(
										'Moves the store to a pending status, preventing further activity until compliance issues are resolved.',
										'multivendorx'
									),
								},
								{
									key: 'notify_admin_only',
									label: __(
										'Notify admin only',
										'multivendorx'
									),
									value: 'NotifyAdmin',
									desc: __(
										'Sends a notification to the admin about the compliance issue without restricting the store’s activity.',
										'multivendorx'
									),
								},
							],
							selectDeselect: true,
						},
					],
				},
				{
					id: 'legal-policy',
					icon: 'adminfont-verification3',
					label: 'Legal & policy',
					moduleEnabled: 'marketplace-compliance',
					proSetting: true,
					disableBtn: true,
					desc: 'Require acceptance of platform terms and policies',
					formFields: [
						{
							key: 'terms_conditions',
							type: 'setup',
							title: 'Terms & Conditions',
							des: 'Require vendors to accept platform terms and conditions before proceeding.',
							link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=legal-compliance`,
						},
						{
							key: 'privacy_policy_consent',
							type: 'setup',
							title: 'Privacy policy consent',
							des: 'Ensure vendors acknowledge and agree to your platform’s data handling policies.',
							link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=legal-compliance`,
						},
						{
							key: 'seller_agreement_upload',
							type: 'setup',
							title: 'Seller agreement upload',
							des: 'Collect signed seller agreements as part of the onboarding process.',
							link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=legal-compliancen`,
						},
						{
							key: 'return_policy_compliance',
							type: 'setup',
							title: 'Return policy compliance',
							des: 'Ensure vendors follow the marketplace’s standard refund and return guidelines.',
							link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=legal-compliance`,
						},
						{
							key: 'non_compliance_action',
							type: 'multi-checkbox',
							label: __('Non-Compliance action', 'multivendorx'),
							 
							options: [
								{
									key: 'block_store_access',
									label: __(
										'Block store access',
										'multivendorx'
									),
									value: 'BlockStoreAccess',
									desc: __(
										'Prevents the store from accessing its account until compliance issues are resolved.',
										'multivendorx'
									),
								},
								{
									key: 'restrict_marketplace_features',
									label: __(
										'Restrict features',
										'multivendorx'
									),
									value: 'RestrictMarketplaceFeatures',
									desc: __(
										'Limits specific store features while still allowing basic access.',
										'multivendorx'
									),
								},
								{
									key: 'notify_admin_only',
									label: __(
										'Notify admin only',
										'multivendorx'
									),
									value: 'NotifyAdmin',
									desc: __(
										'Alerts the admin about the compliance issue without restricting the stores activity.',
										'multivendorx'
									),
								},
							],
							selectDeselect: true,
						},
					],
				},
				{
					id: 'financial-compliance',
					icon: 'adminfont-dollar',
					label: 'Financial compliance',
					disableBtn: true,
					moduleEnabled: 'marketplace-compliance',
					proSetting: true,
					desc: 'Verify tax information and monitor transactions',
					formFields: [
						{
							key: 'tax_information',
							type: 'setup',
							title: 'Tax information',
							des: 'Require vendors to provide valid TIN, VAT, GST, EIN, or other tax identification.',
							link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=tax-compliance`,
						},
						{
							key: 'bank_account_details',
							type: 'setup',
							title: 'Bank account details',
							des: 'Collect verified bank details to ensure secure and accurate payouts.',
							link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=tax-compliance`,
						},
						{
							key: 'non_compliance_action',
							type: 'multi-checkbox',
							label: __('Non-Compliance action', 'multivendorx'),
							 
							options: [
								{
									key: 'disable_payouts',
									label: __(
										'Disable payouts',
										'multivendorx'
									),
									value: 'DisablePayouts',
									desc: __(
										'Suspends payout processing. Earnings will be released once the store successfully clears the review.',
										'multivendorx'
									),
								},
								{
									key: 'notify_admin_only',
									label: __(
										'Notify admin only',
										'multivendorx'
									),
									value: 'NotifyAdmin',
									desc: __(
										'Sends a notification to the admin about the compliance issue without restricting the store’s activity.',
										'multivendorx'
									),
								},
							],
							selectDeselect: true,
						},
					],
				},
			],
		},
	],
};
