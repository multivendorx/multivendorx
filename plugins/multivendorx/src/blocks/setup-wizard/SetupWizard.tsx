/* global appLocalizer */
import React, { useState } from 'react';
import 'zyra/build/index.css';
import { ExpandablePanelUI } from 'zyra';
import { __ } from '@wordpress/i18n';
import img from '../../assets/images/multivendorx-logo.png';
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
				'multivendorx'
			),
			icon: 'storefront',
			desc: __(
				'This helps us tailor features for your business.',
				'multivendorx'
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
							label: __(
								'Subscription marketplace',
								'multivendorx'
							),
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
						},
					],
				},
				{
					key: 'product_types',
					type: 'multi-select',
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
					key: 'notice_rental',
					type: 'notice',
					label: '',
					message: __(
						'Ready to unlock the full potential of your marketplace? Activate WooCommerce Rental with MultiVendorX Pro and start selling like a pro today!',
						'multivendorx'
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
						'multivendorx'
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
						'multivendorx'
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
						'multivendorx'
					),

					desc: __(
						'Choose how listings are created and sold by stores.',
						'multivendorx'
					),

					options: [
						{
							key: 'default',
							label: __('Own listing', 'multivendorx'),
							value: 'default',
						},
						{
							key: 'shared_listing',
							label: __('Shared listing', 'multivendorx'),
							value: 'shared_listing',
						},
						{
							key: 'franchise',
							label: __('Franchise', 'multivendorx'),
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
							label: __('Back', 'multivendorx'),
							color: 'red',
							action: 'back',
						},
						{
							label: __('Next', 'multivendorx'),
							action: 'next',
						},
					],
				},
			],
		},
		{
			id: 'store_setup',
			label: __('Configure Your Store', 'multivendorx'),
			icon: 'storefront',
			desc: __('How stores sell on your marketplace.', 'multivendorx'),
			countBtn: true,
			isWizardMode: true,
			openForm: true,
			formFields: [
				{
					key: 'approve_store',
					type: 'choice-toggle',

					label: __('Store registration approval', 'multivendorx'),

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
					position: 'right',
					options: [
						{
							label: __('Back', 'multivendorx'),
							action: 'back',
						},
						{
							label: __('Next', 'multivendorx'),
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
				'multivendorx'
			),
			icon: 'storefront',
			desc: __(
				'Decide how your marketplace earns money.',
				'multivendorx'
			),
			countBtn: true,
			isWizardMode: true,
			openForm: true,
			formFields: [
				{
					key: 'commission_type',
					type: 'choice-toggle',
					label: __('How commission is calculated', 'multivendorx'),
					settingDescription: __(
						'Choose how marketplace commission is applied.',
						'multivendorx'
					),
					desc: `<ul>
							<li>${__('Store order based - Calculated on the full order amount of each store.', 'multivendorx')}</li>
							<li>${__('Per item based - Applied to each product in the order.', 'multivendorx')}</li>
							</ul>`,
					options: [
						{
							key: 'store_order',
							label: __('Store order based', 'multivendorx'),
							value: 'store_order',
						},
						{
							key: 'per_item',
							label: __('Per item based', 'multivendorx'),
							value: 'per_item',
						},
					],
				},
				{
					key: 'commission_value',
					type: 'nested',
					label: __('Commission value', 'multivendorx'),
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
								preText: __('Fixed', 'multivendorx'),
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
					type: 'checkbox',
					label: __('When stores earn money', 'multivendorx'),
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
					position: 'right',
					options: [
						{
							label: __('Back', 'multivendorx'),
							action: 'back',
						},
						{
							label: __('Next', 'multivendorx'),
							action: 'next',
						},
					],
				},
			],
		},
		{
			id: 'migration',
			label: __('Migration', 'multivendorx'),
			icon: 'storefront',
			desc: __('Migration.', 'multivendorx'),
			countBtn: true,
			isWizardMode: true,
			openForm: true,
			formFields: [
				{
					key: 'notice',
					type: 'notice',
					label: '',
					// message: appLocalizer.multivendor_plugin || 'No multivendor plugin active currently',
					message: __('We found an active multivendor plugin on your site <span class="admin-badge purple">WCFM Marketplace</span>', 'multivendorx'),
					noticeType: 'info',
					display: 'notice',
				},
				{
					key: 'notice',
					type: 'notice',
					message: __("We'll copy all your data from <b>WCFM Marketplace</b> into MultivendorX. Once the import is done, <b>WCFM Marketplace</b> will be turned off automatically to prevent any conflicts. Make sure you're ready before you begin.", 'multivendorx'),
					noticeType: 'info',
					display: 'notice',
				},
				{
					key: 'paid_promotion_limit',
					label: __('Before you begin — quick checklist', 'multivendorx'),
					type: 'itemlist',
					row: false,
					className: 'checklist full-width',
					items: [
						{
							title: __('<b>Back up your database first — </b> export a full backup before starting. If anything goes wrong, you can restore it.', 'multivendorx'),
							icon: 'check-fill',
						},
						{
							title: __(
								'<b>Turn off caching plugins —</b> plugins like WP Rocket or W3 Total Cache can interfere with the import. Disable them temporarily.',
								'multivendorx'
							),
							icon: 'check-fill',
						},
						{
							title: __(
								'<b>Keep WCFM Marketplace active for now —</b>it must still be installed and enabled so we can read your existing data.',
								'multivendorx'
							),
							icon: 'check-fill',
						},
						{
							title: __(
								'<b>Use a stable internet connection —</b> dropping out mid-migration can leave your data in an incomplete state.',
								'multivendorx'
							),
							icon: 'check-fill',
						},
					],
				},
				{
					key: 'paid_promotion_limit',
					label: __('What gets migrated', 'multivendorx'),
					type: 'itemlist',
					row: false,
					className: 'feature-list',
					items: [
						{
							title: __('Vendors', 'multivendorx'),
							desc: __('All vendor accounts and profiles', 'multivendorx'),
							icon: 'storefront',
						},
						{
							title: __('Products', 'multivendorx'),
							desc: __('All products listed by vendors', 'multivendorx'),
							icon: 'single-product',
						},
						{
							title: __('Orders', 'multivendorx'),
							desc: __('Vendor-specific order history', 'multivendorx'),
							icon: 'order',
						},
						{
							title: __('Store details', 'multivendorx'),
							desc: __('Store name, logo, and settings', 'multivendorx'),
							icon: 'store-policy',
						},
						{
							title: __('Product commissions', 'multivendorx'),
							desc: __('Per-product commission rates', 'multivendorx'),
							icon: 'advertise-product',
						},	
						{
							title: __('Vendor commissions', 'multivendorx'),
							desc: __('Per-vendor commission rules', 'multivendorx'),
							icon: 'commission',
						},						
					],
				},
				{
					key: 'notice',
					type: 'notice',
					label: '',
					message: __("<b> Orders migrate separately.</b> Marketplace orders are not included in this import — they transfer automatically in the background every 5 minutes. Vendor shipping settings will need to be reconfigured manually, as MultivendorX handles shipping differently.", 'multivendorx'),
					noticeType: 'warning',
					display: 'notice',
				},
				{
					key: 'notice',
					type: 'notice',
					label: '',
					message: __("<b>Deleted records can't be recovered. </b>Orders or products that were previously deleted cannot be migrated. Also, <b>do not close or refresh this tab </b> while the migration is running.", 'multivendorx'),
					noticeType: 'error',
					display: 'notice',
				},
				{
					key: 'migrate',
					type: 'button',
					name: __('Start migration', 'multivendorx'),
					label: __('Multivendor migration', 'multivendorx'),
					apilink: 'migration',
					method: 'POST',
					action: ['import_stores', 'import_products'],
				},
				{
					key: 'wizardButtons',
					type: 'button',
					position: 'right',
					options: [
						{
							label: __('Back', 'multivendorx'),
							action: 'back',
						},
						{
							label: __('Next', 'multivendorx'),
							action: 'next',
						},
					],
				},
			],
		},
		{
			id: 'more_settings',
			label: __('Want to configure more settings?', 'multivendorx'),
			icon: 'storefront',
			desc: __(
				"You're all set with the basics! Use the quick links below to fine-tune your marketplace now — or come back later anytime.",
				'multivendorx'
			),
			countBtn: true,
			isWizardMode: true,
			openForm: true,
			formFields: [
				{
					key: 'commission_settings',
					type: 'button',
					name: __('Setup', 'multivendorx'),
					label: __('Setup', 'multivendorx'),
					desc: __(
						'Adjust commission rules and payout behavior.',
						'multivendorx'
					),
					onClick: () => {
						window.open(
							`${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=settings&subtab=commissions`,
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
							label: __('Back', 'multivendorx'),
							action: 'back',
							color: 'red',
						},
						{
							label: __('Finish', 'multivendorx'),
							action: 'next',
							redirect: `${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=modules`,
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
					{__('Welcome to the MultivendorX family!', 'multivendorx')}
				</div>
				<div className="des">
					{__(
						'Thank you for choosing MultiVendorX! This quick setup wizard will help you configure the basic settings and have your marketplace ready in no time. It’s completely optional and shouldn’t take longer than five minutes.',
						'multivendorx'
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
				onBlocked={methods.formField.option[proSetting]??''}
			/>
		</div>
	);
};

export default SetupWizard;
