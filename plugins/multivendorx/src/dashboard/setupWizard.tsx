import React, { useState, useRef } from 'react';
import 'zyra/build/index.css';
import { ExpandablePanelGroupUI } from 'zyra';
import { __ } from '@wordpress/i18n';
// import img from '../../assets/images/multivendorx-logo.png';

const SetupWizard: React.FC = () => {
	// Required state for ExpandablePanelGroup
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
	const settingChanged = useRef(false);

	const appLocalizer = window.appLocalizer;

	const inputField = {
		key: 'setup_wizard',
		proSetting: false,
		apiLink: 'settings',
		moduleEnabled: true,
		dependentSetting: '',
		dependentPlugin: '',
		modal: [],
		buttonEnable: true,
	};

	const methods = [
		{
			id: 'marketplace_setup',
			label: __('Store Profile', 'multivendorx'),
			icon: 'adminfont-storefront',
			desc: __('Set up how your store appears', 'multivendorx'),
			countBtn: true,
			isWizardMode: true,
			openForm: true,
			formFields: [
				{
					key: 'store_name',
					type: 'text',
					label: __('Store name', 'multivendorx'),
					desc: __(
						'The name shown on your store page and product listings.',
						'multivendorx'
					),
				},
				{
					key: 'store_description',
					type: 'textarea',
					label: __('Store description', 'multivendorx'),
					desc: __(
						'Describe your store to help customers understand your business.',
						'multivendorx'
					),
				},
				{
					key: 'store_dashboard_site_logo',
					type: 'attachment',
					label: __('Store logo', 'multivendorx'),
					size: 'small',
				},
				{
					key: 'store_dashboard_banner',
					type: 'attachment',
					label: __('Banner image (optional)', 'multivendorx'),
					size: 'small',
				},
				{
					key: 'contact_phone',
					type: 'text',
					label: __('Contact phone', 'multivendorx'),
				},
				{
					key: 'timezone_mode',
					type: 'setting-toggle',
					label: __('Timezone', 'multivendorx'),
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
					type: 'buttons',
					options: [
						{
							label: __('Back', 'multivendorx'),
							action: 'back',
							btnClass: 'admin-btn btn-red',
						},
						{
							label: __('Next', 'multivendorx'),
							action: 'next',
							btnClass: 'admin-btn btn-purple',
						},
					],
				},
			],
		},
		{
			id: 'store_setup',
			label: __('Business Location', 'multivendorx'),
			icon: 'adminfont-storefront',
			desc: __('Confirm your operating address', 'multivendorx'),
			countBtn: true,
			isWizardMode: true,
			openForm: true,
			formFields: [
				{
					key: 'store_country',
					type: 'select',
					label: __('Country', 'multivendorx'),
					options: [
						{ label: __('United States', 'multivendorx'), value: 'us' },
						{ label: __('United Kingdom', 'multivendorx'), value: 'uk' },
						{ label: __('Canada', 'multivendorx'), value: 'ca' },
						{ label: __('Australia', 'multivendorx'), value: 'au' },
					],
				},
				{
					key: 'store_address',
					type: 'textarea',
					label: __('Address', 'multivendorx'),
				},
				{
					key: 'store_city',
					type: 'text',
					label: __('City', 'multivendorx'),
				},
				{
					key: 'store_postcode',
					type: 'text',
					label: __('Postcode / ZIP', 'multivendorx'),
				},
				{
					key: 'wizardButtons',
					type: 'buttons',
					options: [
						{
							label: __('Back', 'multivendorx'),
							action: 'back',
							btnClass: 'admin-btn btn-red',
						},
						{
							label: __('Next', 'multivendorx'),
							action: 'next',
							btnClass: 'admin-btn btn-purple',
						},
					],
				},
			],
		},
		{
			id: 'commission_setup',
			label: __('Payout Method', 'multivendorx'),
			icon: 'adminfont-storefront',
			desc: __('Choose how you receive earnings', 'multivendorx'),
			countBtn: true,
			isWizardMode: true,
			openForm: true,
			formFields: [
				{
					key: 'bank_transfer',
					type: 'setup',
					title: __('Bank Transfer', 'multivendorx'),
					desc: __('Click to configure', 'multivendorx'),
					hideCheckbox: true,
					link: `${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=settings&subtab=store-commissions`,
				},
				{
					key: 'paypal',
					type: 'setup',
					title: __('PayPal', 'multivendorx'),
					desc: __('Click to configure', 'multivendorx'),
					hideCheckbox: true,
					link: `${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=settings&subtab=store-commissions`,
				},
				{
					key: 'stripe',
					type: 'setup',
					title: __('Stripe', 'multivendorx'),
					desc: __('Click to configure', 'multivendorx'),
					hideCheckbox: true,
					link: `${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=settings&subtab=store-commissions`,
				},
				{
					key: 'other_methods',
					type: 'setup',
					title: __('Other Methods', 'multivendorx'),
					desc: __('Click to configure', 'multivendorx'),
					hideCheckbox: true,
					link: `${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=settings&subtab=store-commissions`,
				},
				{
					key: 'wizardButtons',
					type: 'buttons',
					options: [
						{
							label: __('Back', 'multivendorx'),
							action: 'back',
							btnClass: 'admin-btn btn-red',
						},
						{
							label: __('Next', 'multivendorx'),
							action: 'next',
							btnClass: 'admin-btn btn-purple',
						},
					],
				},
			],
		},
		{
			id: 'more_settings',
			label: __('Store Policies', 'multivendorx'),
			icon: 'adminfont-storefront',
			desc: __('Set your selling rules', 'multivendorx'),
			countBtn: true,
			isWizardMode: true,
			openForm: true,
			formFields: [
				{
					key: 'refund_policy',
					type: 'textarea',
					label: __('Refund & return policy', 'multivendorx'),
				},
				{
					key: 'shipping_terms',
					type: 'textarea',
					label: __('Shipping terms', 'multivendorx'),
				},
				{
					key: 'store_terms',
					type: 'textarea',
					label: __('Store terms and conditions', 'multivendorx'),
				},
				{
					key: 'wizardButtons',
					type: 'buttons',
					options: [
						{
							label: __('Back', 'multivendorx'),
							action: 'back',
							btnClass: 'admin-btn btn-red',
						},
						{
							label: __('Next', 'multivendorx'),
							action: 'next',
							btnClass: 'admin-btn btn-purple',
						},
					],
				},
			],
		},
		{
			id: 'identity_verification',
			label: __('Identity Verification', 'multivendorx'),
			icon: 'adminfont-storefront',
			desc: __('Verify your store details', 'multivendorx'),
			countBtn: true,
			isWizardMode: true,
			openForm: true,
			formFields: [
				{
					key: 'government_id',
					type: 'file',
					label: __('Government-issued ID', 'multivendorx'),
					size: 'small',
				},
				{
					key: 'address_proof',
					type: 'file',
					label: __('Business address proof', 'multivendorx'),
					size: 'small',
				},
				{
					key: 'tax_document',
					type: 'file',
					label: __('Registration or tax documents', 'multivendorx'),
					size: 'small',
				},
				{
					key: 'wizardButtons',
					type: 'buttons',
					options: [
						{
							label: __('Back', 'multivendorx'),
							action: 'back',
							btnClass: 'admin-btn btn-red',
						},
						{
							label: __('Next', 'multivendorx'),
							action: 'next',
							btnClass: 'admin-btn btn-purple',
						},
					],
				},
			],
		},
		{
			id: 'first_product',
			label: __('First Product', 'multivendorx'),
			icon: 'adminfont-storefront',
			desc: __('Add at least one item', 'multivendorx'),
			countBtn: true,
			isWizardMode: true,
			openForm: true,
			formFields: [
				{
					key: 'product_title',
					type: 'text',
					label: __('Product title', 'multivendorx'),
				},
				{
					key: 'product_description',
					type: 'textarea',
					label: __('Product description', 'multivendorx'),
				},
				{
					key: 'product_price',
					type: 'number',
					label: __('Price', 'multivendorx'),
				},
				{
					key: 'product_inventory',
					type: 'number',
					label: __('Inventory', 'multivendorx'),
				},
				{
					key: 'product_images',
					type: 'file',
					label: __('Product images', 'multivendorx'),
					size: 'small',
				},
				{
					key: 'wizardButtons',
					type: 'buttons',
					options: [
						{
							label: __('Back', 'multivendorx'),
							action: 'back',
							btnClass: 'admin-btn btn-red',
						},
						{
							label: __('Finish', 'multivendorx'),
							action: 'next',
							btnClass: 'admin-btn btn-purple',
							redirect: `${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=modules`,
						},
					],
				},
			],
		},
	];

	const updateSetting = (key: string, data: any) => {
		setValue(data);
	};

	const hasAccess = () => true;

	return (
		<div className="wizard-container">
			<div>
				<div className="welcome-wrapper">
					<h4 className="wizard-title">
						{__('Welcome to the MultivendorX family!', 'multivendorx')}
					</h4>
					<div className="des">
						{__(
							'Thank you for choosing MultiVendorX! This quick setup wizard will help you configure the basic settings and have your marketplace ready in no time. It’s completely optional and shouldn’t take longer than five minutes.',
							'multivendorx'
						)}
					</div>
				</div>
				<ExpandablePanelGroupUI
					key={inputField.key}
					name={inputField.key}
					apilink={String(inputField.apiLink)}
					appLocalizer={appLocalizer}
					methods={methods}
					value={value}
					onChange={(data: any) => {
						settingChanged.current = true;
						updateSetting(inputField.key, data);
					}}
					isWizardMode={true}
					canAccess={true}
				/>

				{/* <div className="welcome-wrapper">
                    <div className="wizard-title">! Well Done</div>
                    <div className="des">Thank you for choosing MultiVendorX!</div>
                </div> */}
			</div>
		</div>
	);
};

export default SetupWizard;
