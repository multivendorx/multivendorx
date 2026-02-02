import { __ } from '@wordpress/i18n';

export default {
	id: 'store-status-control',
	priority: 3,
	name: __('Store Status', 'multivendorx'),
	desc: __(
		'Control access and visibility based on store approval status. Configure how pending, denied, under review, suspended, active, and deactivated stores behave within your marketplace.',
		'multivendorx'
	),
	icon: 'adminfont-store-inventory',
	submitUrl: 'settings',
	modal: [
		{
			key: 'separator_content',
			type: 'section',
			label: __(
				'Recommended Status Flow:Pending Approval → Under Review → Active → (Suspended / Rejected / Deactivated)',
				'multivendorx'
			),
			desc: __(
				'Control how stores behave at different stages of their lifecycle. These settings determine Account capabilities and what customers see based on each stores approval status.',
				'multivendorx'
			),
		},
		{
			key: 'store_status_management',
			type: 'expandable-panel',
			modal: [
				{
					id: 'store_pending_status',
					icon: 'adminfont-store-analytics',
					label: 'Pending approval',
					connected: true,
					 
					desc: ' The store is awaiting approval. Sellers can log in to their dashboard but cannot configure settings, add products, or begin selling until approved.',
					formFields: [
						{
							key: 'pending_description',
							type: 'description',
							des: 'The store is awaiting approval. Sellers can log in to their dashboard but cannot configure settings, add products, or begin selling until approved.',
						},
						{
							key: 'pending_permissions',
							type: 'check-list',
							options: [
								{
									desc: __(
										'Can log in to dashboard',
										'multivendorx'
									),
									check: true,
								},
								{
									desc: __(
										'Modify store settings',
										'multivendorx'
									),
									check: false,
								},
								{
									desc: __(
										'Add or edit products',
										'multivendorx'
									),
									check: false,
								},
								{
									desc: __(
										'Process or fulfill orders',
										'multivendorx'
									),
									check: false,
								},
							],
						},
						{
							key: 'pending_msg',
							label: 'Message shown to pending stores:',
							type: 'text',
							des: 'What pending stores can do',
						},
					],
				},
				{
					id: 'store_rejected_status',
					icon: 'adminfont-like',
					label: 'Rejected',
					connected: true,
					 
					desc: 'The application was rejected during onboarding. Sellers can log in to view the rejection reason and reapply with updated information but cannot sell or modify store details.',
					formFields: [
						{
							key: 'rejected_description',
							type: 'description',
							//des: 'The store is awaiting approval. Sellers can log in to their dashboard but cannot configure settings, add products, or begin selling until approved.',
						},
						{
							key: 'rejected_permissions',
							type: 'check-list',
							options: [
								{
									desc: __(
										'Log in to dashboard',
										'multivendorx'
									),
									check: true,
								},
								{
									desc: __(
										'View rejection reason',
										'multivendorx'
									),
									check: true,
								},
								{
									desc: __(
										'Submit new application',
										'multivendorx'
									),
									check: true,
								},
								{
									desc: __(
										'Modify products or settings',
										'multivendorx'
									),
									check: false,
								},
								{
									desc: __(
										'Sell or fulfill orders',
										'multivendorx'
									),
									check: false,
								},
							],
						},
						{
							key: 'rejected_msg',
							label: 'Message shown to rejected stores',
							des: 'What pending stores can do',
						},
					],
				},
				{
					id: 'store_under_review_status',
					icon: 'adminfont-store-review',
					label: 'Under review',
					connected: true,
					 
					desc: 'The store is temporarily restricted while the platform reviews compliance or documentation. Selling and payouts may be paused until the review is complete.',
					formFields: [
						{
							key: 'review_description',
							type: 'description',
							//des: 'The store is awaiting approval. Sellers can log in to their dashboard but cannot configure settings, add products, or begin selling until approved.',
						},
						{
							key: 'review_allow_selling',
							type: 'setup',
							title: 'Pause selling  during review',
							des: 'Prevent stores from selling and fulfilling orders while under review.',
						},
						{
							key: 'review_withhold_payments',
							type: 'setup',
							title: 'Hold payments until review complete',
							des: 'Keep earnings on hold until the review concludes. Payments will release once compliance is cleared.',
						},
						{
							key: 'review_restrict_listings',
							type: 'setup',
							title: 'Restrict product uploads during review',
							des: 'Prevent stores from listing new products during review. Existing listings stay active unless selling is disabled.',
						},
						{
							key: 'review_msg',
							label: 'Message shown to stores under review:',
							des: 'What pending stores can do',
						},
					],
				},
				{
					id: 'store_suspended_status',
					icon: 'adminfont-error',
					label: 'Suspended',
					connected: true,
					 
					desc: 'The store’s selling privileges are revoked due to policy or compliance violations. Listings are hidden or disabled, and payments are held until reactivation or successful appeal.',
					formFields: [
						{
							key: 'suspended_description',
							type: 'description',
							des: 'The store is awaiting approval. Sellers can log in to their dashboard but cannot configure settings, add products, or begin selling until approved.',
						},
						{
							key: 'suspended_show_products',
							type: 'setup',
							title: 'Keep store visible but disable checkout',
							des: 'Displays the store and its products but prevents customers from placing new orders.Freeze all pending payments.',
						},
						{
							key: 'suspended_hold_payments',
							type: 'setup',
							title: 'Freeze all pending payments',
							des: 'Holds all earnings during suspension. Funds are released only after reinstatement or successful appeal.',
						},
						{
							key: 'suspended_msg',
							label: 'Message shown to suspended stores:',
							des: 'What pending stores can do',
						},
					],
				},
				{
					id: 'store_active_status',
					icon: 'adminfont-store-support',
					label: 'Active',
					connected: true,
					 
					desc: 'Stores are fully approved and operational. They can manage products, orders, and payouts without restrictions.',
					formFields: [
						{
							key: 'active_description',
							type: 'description',
							des: 'The store is awaiting approval. Sellers can log in to their dashboard but cannot configure settings, add products, or begin selling until approved.',
						},
						{
							key: 'active_dashboard_access',
							type: 'setup',
							title: 'Dashboard access settings',
							des: 'Control what dashboard sections and tools are available to active stores.',
							link: '#',
							hideCheckbox: true,
						},
						{
							key: 'active_msg',
							label: 'Message shown to active stores:',
							des: 'What pending stores can do',
						},
					],
				},
				{
					id: 'store_deactivated_status',
					icon: 'adminfont-identity-verification',
					label: 'Deactivated',
					connected: true,
					 
					desc: 'Stores that are permanently closed, either by admin action or upon store owner’s request.Once deactivated, the store loses all access to dashboard, storefront, and selling privileges.',
					formFields: [
						{
							key: 'deactivated_description',
							type: 'description',
							des: 'The store is awaiting approval. Sellers can log in to their dashboard but cannot configure settings, add products, or begin selling until approved.',
						},
						{
							key: 'deactivated_permissions',
							type: 'check-list',
							options: [
								{
									desc: __(
										'Log in to dashboard',
										'multivendorx'
									),
									check: false,
								},
								{
									desc: __(
										'Access selling privileges',
										'multivendorx'
									),
									check: false,
								},
								{
									desc: __(
										'View or manage product listings',
										'multivendorx'
									),
									check: false,
								},
								{
									desc: __(
										'Submit reapplication or appeal',
										'multivendorx'
									),
									check: false,
								},
								{
									desc: __(
										'Retain any marketplace privileges',
										'multivendorx'
									),
									check: false,
								},
							],
						},
						{
							key: 'deactivated_msg',
							label: 'Message shown to deactivated stores:',
							des: 'What pending stores can do',
						},
					],
				},
			],
		},
	],
};
