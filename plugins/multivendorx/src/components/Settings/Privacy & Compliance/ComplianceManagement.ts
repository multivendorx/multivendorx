/* global appLocalizer */
import { __ } from '@wordpress/i18n';

export default {
	id: 'compliance',
	priority: 2,
	headerTitle: __('Compliance Management', 'multivendorx'),
	headerDescription: __(
		'Control store access based on verification status. Ensure only compliant stores can operate fully on your marketplace.',
		'multivendorx'
	),
	headerIcon: 'compliance',
	submitUrl: 'settings',
	modal: [
		{
			key: 'store_compliance_management',
			type: 'expandable-panel',
			proSetting: true,
			modal: [
				{
					id: 'seller-verification',
					icon: 'seller-verification',
					label: 'Seller verification',
					connected: true,
					disableBtn: true,
					desc: 'Verify store identity and business legitimacy',
					moduleEnabled: 'marketplace-compliance',
					formFields: [
						{
							key: 'paid_promotion_limit',
							type: 'itemlist',
							className: 'mini-card',
							items: [
								{
									title: __(
										'Identity verification',
										'multivendorx'
									),
									desc: __(
										'Store is verified through official business documents like trade license or permit.',
										'multivendorx'
									),
									tags: `<a class="admin-btn btn-purple" href="${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=store-identity">${__('Set Up', 'multivendorx')}<i class="adminfont-arrow-right"/> </a>`,
								},
								{
									title: __(
										'Social verification',
										'multivendorx'
									),
									desc: __(
										'Store authenticity is validated using connected social media accounts.',
										'multivendorx'
									),
									tags: `<a class="admin-btn btn-purple" href="${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=store-identity">${__('Set Up', 'multivendorx')}<i class="adminfont-arrow-right"/> </a>`,
								},
								{
									title: __(
										'Email verification',
										'multivendorx'
									),
									desc: __(
										'The registered email address is verified to confirm the authenticity.',
										'multivendorx'
									),
									tags: `<a class="admin-btn btn-purple" href="${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=store-identity">${__('Set Up', 'multivendorx')}<i class="adminfont-arrow-right"/> </a>`,
								},
							],
						},
						{
							key: 'required_tasks',
							type: 'checkbox',
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
					icon: 'product',
					label: 'Product compliance',
					disableBtn: true,
					desc: 'Ensure product listings meet marketplace standards',
					moduleEnabled: 'marketplace-compliance',
					proSetting: true,
					formFields: [
						{
							key: 'prohibited_items_check',
							type: 'itemlist',
							className: 'mini-card',
							items: [
								{
									title: __(
										'Prohibited items check',
										'multivendorx'
									),
									desc: __(
										'Block restricted or banned products to maintain marketplace compliance.',
										'multivendorx'
									),
									tags: `<a class="admin-btn btn-purple" href="${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=product-compliance">${__('Set Up', 'multivendorx')}<i class="adminfont-arrow-right"/> </a>`,
								},
								{
									title: __(
										'Product images & descriptions',
										'multivendorx'
									),
									desc: __(
										'Approve product reviews before publishing to ensure quality and consistency.',
										'multivendorx'
									),
									tags: `<a class="admin-btn btn-purple" href="${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=product-compliance">${__('Set Up', 'multivendorx')}<i class="adminfont-arrow-right"/> </a>`,
								},
								{
									title: __(
										'Product authenticity certificates',
										'multivendorx'
									),
									desc: __(
										'Enforce product image and description standards for authenticity and trust.',
										'multivendorx'
									),
									tags: `<a class="admin-btn btn-purple" href="${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=product-compliance">${__('Set Up', 'multivendorx')}<i class="adminfont-arrow-right"/> </a>`,
								},
								{
									title: __(
										'Product abuse reporting',
										'multivendorx'
									),
									desc: __(
										'Handle product violation or abuse reports effectively to ensure compliance.',
										'multivendorx'
									),
									tags: `<a class="admin-btn btn-purple" href="${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=product-compliance">${__('Set Up', 'multivendorx')}<i class="adminfont-arrow-right"/> </a>`,
								},
							],
						},
						{
							key: 'non_compliance_action',
							type: 'checkbox',
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
					icon: 'verification3',
					label: 'Legal & policy',
					moduleEnabled: 'marketplace-compliance',
					proSetting: true,
					disableBtn: true,
					desc: 'Require acceptance of platform terms and policies',
					formFields: [
						{
							key: 'prohibited_items_check',
							type: 'itemlist',
							className: 'mini-card',
							items: [
								{
									title: __(
										'Terms & Conditions',
										'multivendorx'
									),
									desc: __(
										'Require stores to accept platform terms and conditions before proceeding.',
										'multivendorx'
									),
									tags: `<a class="admin-btn btn-purple" href="${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=legal-compliance">${__('Set Up', 'multivendorx')}<i class="adminfont-arrow-right"/> </a>`,
								},
								{
									title: __(
										'Privacy policy consent',
										'multivendorx'
									),
									desc: __(
										'Ensure stores acknowledge and agree to your platform’s data handling policies.',
										'multivendorx'
									),
									tags: `<a class="admin-btn btn-purple" href="${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=legal-compliance">${__('Set Up', 'multivendorx')}<i class="adminfont-arrow-right"/> </a>`,
								},
								{
									title: __(
										'Seller agreement upload',
										'multivendorx'
									),
									desc: __(
										'Collect signed seller agreements as part of the onboarding process.',
										'multivendorx'
									),
									tags: `<a class="admin-btn btn-purple" href="${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=legal-compliance">${__('Set Up', 'multivendorx')}<i class="adminfont-arrow-right"/> </a>`,
								},
								{
									title: __(
										'Return policy compliance',
										'multivendorx'
									),
									desc: __(
										'Ensure stores follow the marketplace’s standard refund and return guidelines.',
										'multivendorx'
									),
									tags: `<a class="admin-btn btn-purple" href="${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=legal-compliance">${__('Set Up', 'multivendorx')}<i class="adminfont-arrow-right"/> </a>`,
								},
							],
						},
						{
							key: 'non_compliance_action',
							type: 'checkbox',
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
					icon: 'dollar',
					label: 'Financial compliance',
					disableBtn: true,
					moduleEnabled: 'marketplace-compliance',
					proSetting: true,
					desc: 'Verify tax information and monitor transactions',
					formFields: [
						{
							key: 'paid_promotion_limit',
							type: 'itemlist',
							className: 'mini-card',
							items: [
								{
									title: __(
										'Tax information',
										'multivendorx'
									),
									desc: __(
										'Require stores to provide valid TIN, VAT, GST, EIN, or other tax identification.',
										'multivendorx'
									),
									tags: `<a class="admin-btn btn-purple" href="${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=tax-compliance">${__('Set Up', 'multivendorx')}<i class="adminfont-arrow-right"/> </a>`,
								},
								{
									title: __(
										'Bank account details',
										'multivendorx'
									),
									desc: __(
										'Collect verified bank details to ensure secure and accurate payouts.',
										'multivendorx'
									),
									tags: `<a class="admin-btn btn-purple" href="${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=tax-compliance">${__('Set Up', 'multivendorx')}<i class="adminfont-arrow-right"/> </a>`,
								},
							],
						},
						{
							key: 'non_compliance_action',
							type: 'checkbox',
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
