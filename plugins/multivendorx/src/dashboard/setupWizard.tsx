/* global appLocalizer */
import React, { useState, useRef } from 'react';
import 'zyra/build/index.css';
import { ExpandablePanelUI } from 'zyra';
import { __ } from '@wordpress/i18n';

interface WizardData {
	marketplace_setup: {
		store_selling_mode: string;
		[key: string]: unknown;
	};
	commission_setup: {
		disbursement_order_status: string[];
		[key: string]: unknown;
	};
	store_setup: {
		approve_store: string;
		[key: string]: unknown;
	};
	[key: string]: unknown;
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
	const settingChanged = useRef(false);

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
			icon: 'storefront',
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
					key: 'store_country',
					type: 'select',
					label: __('Country', 'multivendorx'),
					options: [
						{
							label: __('United States', 'multivendorx'),
							value: 'us',
						},
						{
							label: __('United Kingdom', 'multivendorx'),
							value: 'uk',
						},
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
			label: __('Payout Method', 'multivendorx'),
			icon: 'storefront',
			desc: __('Choose how you receive earnings', 'multivendorx'),
			countBtn: true,
			isWizardMode: true,
			openForm: true,
			formFields: [
				{
					key: 'bank_transfer',
					type: 'button',
					name: __('Setup', 'multivendorx'),
					label: __('Bank Transfer', 'multivendorx'),
					desc: __(
						'Click to configure',
						'multivendorx'
					),
					onClick: () => {
						window.open(
							`${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=settings&subtab=commissions`
						);
					},
				},
				{
					key: 'paypal',
					type: 'button',
					name: __('Setup', 'multivendorx'),
					label: __('PayPal', 'multivendorx'),
					desc: __(
						'Click to configure',
						'multivendorx'
					),
					onClick: () => {
						window.open(
							`${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=settings&subtab=commissions`
						);
					},
				},
				{
					key: 'stripe',
					type: 'button',
					name: __('Setup', 'multivendorx'),
					label: __('Stripe', 'multivendorx'),
					desc: __(
						'Click to configure',
						'multivendorx'
					),
					onClick: () => {
						window.open(
							`${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=settings&subtab=commissions`
						);
					},
				},
				{
					key: 'other_methods',
					type: 'button',
					name: __('Setup', 'multivendorx'),
					label: __('Other Methods', 'multivendorx'),
					desc: __(
						'Click to configure',
						'multivendorx'
					),
					onClick: () => {
						window.open(
							`${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=settings&subtab=commissions`
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
			label: __('Store Policies', 'multivendorx'),
			icon: 'storefront',
			desc: __('Set your selling rules.', 'multivendorx'),
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
			label: __('Identity Verification', 'multivendorx'),
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
			label: __('First Product', 'multivendorx'),
			icon: 'storefront',
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
							redirect: `${appLocalizer.dashboard_slug}/dashboard/`,
						},
					],
				},
			],
		},
	];
	
	const updateSetting = (key: string, data: WizardData) => {
		setValue(data);
	};

	return (
		<div className="wizard-container">
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
			<ExpandablePanelUI
				key={inputField.key}
				name={inputField.key}
				apilink={String(inputField.apiLink)}
				appLocalizer={appLocalizer}
				methods={methods}
				value={value}
				onChange={(data) => {
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
	);
};

export default SetupWizard;
