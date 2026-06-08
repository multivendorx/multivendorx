/* global appLocalizer */
import React, { useState } from 'react';
import 'zyra/build/index.css';
import { ExpandablePanelUI } from 'zyra';
import { __, sprintf } from '@wordpress/i18n';
import img from '../../assets/images/catalogx-logo.png';
interface SettingsState {
	marketplace_setup: {
		store_selling_mode: string;
	};
	commission_setup: {
		disbursement_order_status: string[];
	};
	store_setup: {
		approve_store: string;
	};
}
const SetupWizard: React.FC = () => {
	// Required state for ExpandablePanel
	const [value, setValue] = useState({
		marketplace_setup: {
			store_selling_mode: 'default',
		},
		commission_setup: {
			disbursement_order_status: ['completed'],
		},
		store_setup: {
			approve_store: 'manually',
		},
	});

	const inputField = {
		key: 'setup_wizard',
		proSetting: false,
		apiLink: 'settings',
		modal: [],
	};

	const methods = [
		{
			id: 'marketplace_setup',
			label: __(
				'Choose what kind of marketplace you are building',
				'catalogx'
			),
			icon: 'marketplace',
			desc: __(
				'This helps us tailor features for your business.',
				'catalogx'
			),
			countBtn: true,
			isWizardMode: true,
			openForm: true,
			formFields: [
				{
					key: 'marketplace_model',
					type: 'multi-select',
					label: __(
						'What kind of marketplace you are building',
						'catalogx'
					),
					options: [
						{
							key: 'general',
							label: __('General marketplace', 'catalogx'),
							value: 'general',
						},
						{
							key: 'product',
							label: __('Product marketplace', 'catalogx'),
							value: 'product',
						},
						{
							key: 'rental',
							label: __('Rental marketplace', 'catalogx'),
							value: 'rental',
						},
						{
							key: 'auction',
							label: __('Auction marketplace', 'catalogx'),
							value: 'auction',
						},
						{
							key: 'subscription',
							label: __(
								'Subscription marketplace',
								'catalogx'
							),
							value: 'subscription',
						},
						{
							key: 'service',
							label: __('Service marketplace', 'catalogx'),
							value: 'service',
						},
						{
							key: 'mixed',
							label: __('Mixed marketplace', 'catalogx'),
							value: 'mixed',
						},
					],
				},
				{
					key: 'product_types',
					type: 'multi-select',
					label: __(
						'What kind of listings stores can create',
						'catalogx'
					),
					options: [
						{
							key: 'simple',
							label: __('Simple', 'catalogx'),
							value: 'simple',
						},
						{
							key: 'variable',
							label: __('Variable', 'catalogx'),
							value: 'variable',
						},
						{
							key: 'booking',
							label: __('Booking', 'catalogx'),
							value: 'booking',
						},
						{
							key: 'subscription',
							label: __('Subscription', 'catalogx'),
							value: 'subscription',
						},
						{
							key: 'rental',
							label: __('Rental', 'catalogx'),
							value: 'rental',
						},
						{
							key: 'auction',
							label: __('Auction', 'catalogx'),
							value: 'auction',
						},
						{
							key: 'accommodation',
							label: __('Accommodation', 'catalogx'),
							value: 'accommodation',
						},
					],
				},
				{
					key: 'notice_rental',
					type: 'notice',
					label: '',
					message: __(
						'Ready to unlock the full potential of your marketplace? Activate WooCommerce Rental with MultiVendorX Pro and start selling like a pro today!',
						'catalogx'
					),
					noticeType: 'info',
					display: 'notice',
					dependent: {
						key: 'marketplace_model',
						value: 'rental',
					},
				},

				{
					key: 'notice_auction',
					type: 'notice',
					label: '',
					message: __(
						'Ready to unlock the full potential of your marketplace? Activate WooCommerce Simple Auction with MultiVendorX Pro and start selling like a pro today!',
						'catalogx'
					),
					noticeType: 'info',
					display: 'notice',
					dependent: {
						key: 'marketplace_model',
						value: 'auction',
					},
				},
				{
					key: 'notice_subscription',
					type: 'notice',
					label: '',
					message: __(
						'Ready to unlock the full potential of your marketplace? Activate WooCommerce Subscription with MultiVendorX Pro and start selling like a pro today!',
						'catalogx'
					),
					noticeType: 'info',
					display: 'notice',
					dependent: {
						key: 'marketplace_model',
						value: 'subscription',
					},
				},
				{
					key: 'store_selling_mode',
					type: 'choice-toggle',

					label: __(
						'How stores sell on your marketplace',
						'catalogx'
					),

					desc: __(
						'Choose how listings are created and sold by stores.',
						'catalogx'
					),

					options: [
						{
							key: 'default',
							label: __('Own listing', 'catalogx'),
							value: 'default',
						},
						{
							key: 'shared_listing',
							label: __('Shared listing', 'catalogx'),
							value: 'shared_listing',
						},
						{
							key: 'franchise',
							label: __('Franchise', 'catalogx'),
							value: 'franchise',
							proSetting: true,
						},
					],
				},
				{
					key: 'wizardButtons',
					type: 'button',
					position: 'right',
					options: [
						{
							label: __('Back', 'catalogx'),
							color: 'purple-bg',
							action: 'back',
						},
						{
							label: __('Next', 'catalogx'),
							action: 'next',
						},
					],
				},
			],
		},
		{
			id: 'store_setup',
			label: __('Configure Your Store', 'catalogx'),
			icon: 'setting',
			desc: __('How stores sell on your marketplace.', 'catalogx'),
			countBtn: true,
			isWizardMode: true,
			openForm: true,
			formFields: [
				{
					key: 'approve_store',
					type: 'choice-toggle',

					label: __('Store registration approval', 'catalogx'),

					options: [
						{
							key: 'manually',
							label: __('Manual', 'catalogx'),
							value: 'manually',
						},
						{
							key: 'automatically',
							label: __('Automatic', 'catalogx'),
							value: 'automatically',
						},
					],
				},
				{
					key: 'wizardButtons',
					type: 'button',
					position: 'right',
					options: [
						{
							label: __('Back', 'catalogx'),
							color: 'purple-bg',
							action: 'back',
						},
						{
							label: __('Next', 'catalogx'),
							action: 'next',
						},
					],
				},
			],
		},
		{
			id: 'commission_setup',
			label: __(
				'How marketplace commission is calculated',
				'catalogx'
			),
			icon: 'commission',
			desc: __(
				'Decide how your marketplace earns money.',
				'catalogx'
			),
			countBtn: true,
			isWizardMode: true,
			openForm: true,
			formFields: [
				{
					key: 'commission_type',
					type: 'choice-toggle',
					label: __('How commission is calculated', 'catalogx'),
					settingDescription: __(
						'Choose how marketplace commission is applied.',
						'catalogx'
					),
					desc: `<ul>
							<li>${__('Store order based - Calculated on the full order amount of each store.', 'catalogx')}</li>
							<li>${__('Per item based - Applied to each product in the order.', 'catalogx')}</li>
							</ul>`,
					options: [
						{
							key: 'store_order',
							label: __('Store order based', 'catalogx'),
							value: 'store_order',
						},
						{
							key: 'per_item',
							label: __('Per item based', 'catalogx'),
							value: 'per_item',
						},
					],
				},
				{
					key: 'commission_value',
					type: 'nested',
					label: __('Commission value', 'catalogx'),
					single: true,
					desc: __(
						'Set global commission rates that apply to each individual item quantity. Commission will be calculated by multiplying the rate with the total number of items across all products in the order.',
						'catalogx'
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
								preText: __('Fixed', 'catalogx'),
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
							postText: __('%', 'catalogx'),
							size: '8rem',
						},
					],
				},
				{
					key: 'disbursement_order_status',
					type: 'checkbox',
					label: __('When stores earn money', 'catalogx'),
					settingDescription: __(
						'Choose when store earnings are added to their wallet.',
						'catalogx'
					),
					options: [
						{
							key: 'completed',
							label: __('Completed', 'catalogx'),
							value: 'completed',
						},
						{
							key: 'delivered',
							label: __('Delivered', 'catalogx'),
							value: 'delivered',
							proSetting: true,
						},
						{
							key: 'processing',
							label: __('Processing', 'catalogx'),
							value: 'processing',
						},
						{
							key: 'shipped',
							label: __('Shipped', 'catalogx'),
							value: 'shipped',
							proSetting: true,
						},
					],
					selectDeselect: true,
				},
				{
					key: 'wizardButtons',
					type: 'button',
					position: 'right',
					options: [
						{
							label: __('Back', 'catalogx'),
							color: 'purple-bg',
							action: 'back',
						},
						{
							label: __('Next', 'catalogx'),
							action: 'next',
						},
					],
				},
			],
		},
		...(appLocalizer.multivendor_plugin
			? [
					{
						id: 'migration',
						label: __('Migration', 'catalogx'),
						icon: 'migration',
						desc: __('Migration.', 'catalogx'),
						countBtn: true,
						isWizardMode: true,
						openForm: true,
						formFields: [
							{
								key: 'notice',
								type: 'notice',
								label: '',
								// message: appLocalizer.multivendor_plugin || 'No multivendor plugin active currently',
								message: sprintf(
									__(
										'We found an active multivendor plugin on your site <span class="admin-badge purple">%s</span>',
										'catalogx'
									),
									appLocalizer.multivendor_plugin
								),
								noticeType: 'info',
								display: 'notice',
							},
							{
								key: 'notice',
								type: 'notice',
								message: sprintf(
									__(
										"We'll copy all your data from <b>%s</b> into MultivendorX. Once the import is done, <b>%s</b> will be turned off automatically to prevent any conflicts. Make sure you're ready before you begin.",
										'catalogx'
									),
									appLocalizer.multivendor_plugin,
									appLocalizer.multivendor_plugin
								),
								noticeType: 'info',
								display: 'notice',
							},
							{
								key: 'paid_promotion_limit',
								label: __(
									'Before you begin - quick checklist',
									'catalogx'
								),
								type: 'itemlist',
								row: false,
								className: 'checklist full-width',
								items: [
									{
										title: __(
											'<b>Back up your database first — </b> export a full backup before starting. If anything goes wrong, you can restore it.',
											'catalogx'
										),
										icon: 'success',
									},
									{
										title: __(
											'<b>Turn off caching plugins —</b> plugins like WP Rocket or W3 Total Cache can interfere with the import. Disable them temporarily.',
											'catalogx'
										),
										icon: 'success',
									},
									{
										title: sprintf(
											__(
												'<b>Keep %s active for now —</b> it must still be installed and enabled so we can read your existing data.',
												'catalogx'
											),
											appLocalizer.multivendor_plugin
										),
										icon: 'success',
									},
									{
										title: __(
											'<b>Use a stable internet connection —</b> dropping out mid-migration can leave your data in an incomplete state.',
											'catalogx'
										),
										icon: 'success',
									},
								],
							},
							{
								key: 'paid_promotion_limit',
								label: __('What gets migrated', 'catalogx'),
								type: 'itemlist',
								row: false,
								className: 'feature-list',
								items: [
									{
										title: __('Vendors', 'catalogx'),
										desc: __(
											'All vendor accounts and profiles',
											'catalogx'
										),
										icon: 'storefront',
									},
									{
										title: __('Products', 'catalogx'),
										desc: __(
											'All products listed by vendors',
											'catalogx'
										),
										icon: 'single-product',
									},
									{
										title: __('Orders', 'catalogx'),
										desc: __(
											'Vendor-specific order history',
											'catalogx'
										),
										icon: 'order',
									},
									{
										title: __(
											'Store details',
											'catalogx'
										),
										desc: __(
											'Store name, logo, and settings',
											'catalogx'
										),
										icon: 'store-policy',
									},
									{
										title: __(
											'Product commissions',
											'catalogx'
										),
										desc: __(
											'Per-product commission rates',
											'catalogx'
										),
										icon: 'product-advertising',
									},
									{
										title: __(
											'Vendor commissions',
											'catalogx'
										),
										desc: __(
											'Per-vendor commission rules',
											'catalogx'
										),
										icon: 'commission',
									},
								],
							},
							{
								key: 'notice',
								type: 'notice',
								label: '',
								message: __(
									'<b> Orders migrate separately.</b> Marketplace orders are not included in this import — they transfer automatically in the background every 5 minutes. Vendor shipping settings will need to be reconfigured manually, as MultivendorX handles shipping differently.',
									'catalogx'
								),
								noticeType: 'warning',
								display: 'notice',
							},
							{
								key: 'notice',
								type: 'notice',
								label: '',
								message: __(
									"<b>Deleted records can't be recovered. </b>Orders or products that were previously deleted cannot be migrated. Also, <b>do not close or refresh this tab </b> while the migration is running.",
									'catalogx'
								),
								noticeType: 'error',
								display: 'notice',
							},
							{
								key: 'migrate',
								type: 'button',
								name: __('Start migration', 'catalogx'),
								label: __(
									'Multivendor migration',
									'catalogx'
								),
								apilink: 'migrations',
								method: 'POST',
								action: ['import_stores', 'import_products'],
							},
							{
								key: 'wizardButtons',
								type: 'button',
								position: 'right',
								options: [
									{
										label: __('Back', 'catalogx'),
										color: 'purple-bg',
										action: 'back',
									},
									{
										label: __('Next', 'catalogx'),
										action: 'next',
									},
								],
							},
						],
					},
				]
			: []),
		{
			id: 'more_settings',
			label: __('Want to configure more settings?', 'catalogx'),
			icon: 'setting-fill',
			desc: __(
				"You're all set with the basics! Use the quick links below to fine-tune your marketplace now — or come back later anytime.",
				'catalogx'
			),
			countBtn: true,
			isWizardMode: true,
			openForm: true,
			formFields: [
				{
					key: 'commission_settings',
					type: 'button',
					name: __('Setup', 'catalogx'),
					label: __('Setup', 'catalogx'),
					desc: __(
						'Adjust commission rules and payout behavior.',
						'catalogx'
					),
					onClick: () => {
						window.open(
							`${appLocalizer.admin_url}#&tab=settings&subtab=commissions`,
							'_blank'
						);
					},
				},
				{
					key: 'wizardButtons',
					type: 'button',
					position: 'right',
					options: [
						{
							label: __('Back', 'catalogx'),
							color: 'purple-bg',
							action: 'back',
						},
						{
							label: __('Finish', 'catalogx'),
							action: 'next',
							color: 'green',
							redirect: `${appLocalizer.admin_url}admin.php?page=catalogx#&tab=modules`,
						},
					],
				},
			],
		},
	];

	const updateSetting = (key: string, data: SettingsState) => {
		setValue(data);
	};

	return (
		<div className="wizard-container">
			<div className="welcome-wrapper">
				<img src={img} alt="" />
				<div className="wizard-title">
					{__('Welcome to the CatalogX family!', 'catalogx')}
				</div>
				<div className="des">
					{__(
						'Thank you for choosing CatalogX! This quick setup wizard will help you configure the basic settings and you will have your marketplace ready in no time. It’s completely optional and shouldn’t take longer than five minutes.',
						'catalogx'
					)}
				</div>
			</div>

			<ExpandablePanelUI
				key={inputField.key}
				name={inputField.key}
				apilink={String(inputField.apiLink)}
				appLocalizer={appLocalizer}
				methods={methods}
				value={value}
				onChange={(data) => {
					updateSetting(inputField.key, data);
				}}
				isWizardMode={true}
				canAccess={true}
			/>
		</div>
	);
};

export default SetupWizard;
