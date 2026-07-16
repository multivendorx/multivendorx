/* global appLocalizer */
import React, { useState } from 'react';
import 'zyra/build/index.css';
import { ExpandablePanelUI } from 'zyra';
import { __ } from '@wordpress/i18n';
import img from '../../assets/images/catalogx-logo.png';

const SetupWizard: React.FC = () => {
	// Required state for ExpandablePanel
	const [value, setValue] = useState({
		product_enquiry: {
			enquiry_user_permission: 'everyone',
			is_enable_out_of_stock: 'all_products',
		},
		quotation_requests: {
			quote_user_permission: 'everyone',
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
			id: 'product_enquiry',
			label: __(
				'Set up product enquiries',
				'catalogx'
			),
			icon: 'marketplace',
			desc: __(
				'Choose how customers can submit enquiries for your products.',
				'catalogx'
			),
			countBtn: true,
			isWizardMode: true,
			openForm: true,
			formFields: [
				{
					key: 'enquiry_user_permission',
					type: 'choice-toggle',

					label: __(
						'Restrict product enquiries for logged-in users only',
						'catalogx'
					),

					desc: __(
						'Only authenticated customers can send enquiries.',
						'catalogx'
					),

					options: [
						{
							key: 'logged_in_only',
							label: __('Logged in only', 'catalogx'),
							value: 'logged_in_only',
						},
						{
							key: 'everyone',
							label: __('Everyone', 'catalogx'),
							value: 'everyone',
						},
					],
				},
				{
					key: 'is_enable_out_of_stock',
					type: 'choice-toggle',

					label: __(
						'Enquiry for out-of-stock products only',
						'catalogx'
					),

					desc: __(
						'Limit enquiries to products currently unavailable for purchase.',
						'catalogx'
					),

					options: [
						{
							key: 'all_products',
							label: __('All products', 'catalogx'),
							value: 'all_products',
						},
						{
							key: 'is_enable_out_of_stock',
							label: __('Out-of-stock products only', 'catalogx'),
							value: 'is_enable_out_of_stock',
						},
					],
				},
				{
					key: 'wizardButtons',
					type: 'button',
					position: 'right',
					options: [
						{
							label: __('Next', 'catalogx'),
							action: 'next',
						},
					],
				},
			],
		},
		{
			id: 'quotation_requests',
			label: __('Set up quotation requests', 'catalogx'),
			icon: 'setting',
			desc: __('Allow customers to request quotations and define how long quotes remain valid.', 'catalogx'),
			countBtn: true,
			isWizardMode: true,
			openForm: true,
			formFields: [
				{
					key: 'quote_user_permission',
					type: 'choice-toggle',

					label: __(
						'Who can request quotations',
						'catalogx'
					),

					desc: __(
						'Control whether quotation requests are available to all visitors or only logged-in users.',
						'catalogx'
					),

					options: [
						{
							key: 'logged_in_only',
							label: __('Logged in only', 'catalogx'),
							value: 'logged_in_only',
						},
						{
							key: 'everyone',
							label: __('Everyone', 'catalogx'),
							value: 'everyone',
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
			id: 'enquiry_form_tabs',
			label: __('Build your enquiry form', 'catalogx'),
			icon: 'setting',
			desc: __('Customize the information customers provide when submitting enquiries and quote requests.', 'catalogx'),
			countBtn: true,
			isWizardMode: true,
			openForm: true,
			formFields: [
				{
					key: 'free_enquiry_form',
					type: 'button',
					name: __('Setup', 'catalogx'),
					label: __('Setup', 'catalogx'),
					onClick: () => {
						window.open(
							`${appLocalizer.admin_url}admin.php?page=catalogx#&tab=settings&subtab=enquiry-form-customization`,
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

	const updateSetting = (key: string, data) => {
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
						`This quick setup wizard will help you configure enquiries and quotations for your products. It shouldn't take longer than two minutes.`,
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
