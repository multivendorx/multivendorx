import { useEffect, useState } from 'react';
import axios from 'axios';
import { SettingsNavigator, useModules } from 'zyra';
import GeneralSettings from './settings/general';
import Appearance from './settings/Appearance';
import SocialMedia from './settings/SocialMedia';
import ContactInformation from './settings/ContactInformation';
import BusinessAddress from './settings/BusinessAddress';
import Withdrawl from './settings/withdrawl';
import Privacy from './settings/Privacy';
import Verification from './settings/Verification';
import ShippingDelivery from './settings/ShippingDelivery';
import { applyFilters } from '@wordpress/hooks';

const settings = () => {
	const [successMsg, setSuccessMsg] = useState<string | null>(null);
	const { modules } = useModules();
	const settings = appLocalizer.settings_databases_value || {};

	useEffect(() => {
		if (successMsg) {
			const timer = setTimeout(() => setSuccessMsg(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [successMsg]);


	const SimpleLink = ({ to, children, onClick, className }: any) => (
		<a href={to} onClick={onClick} className={className}>
			{children}
		</a>
	);

	const getCurrentTabFromUrl = () => {
		const hash = window.location.hash.replace(/^#/, '');
		const hashParams = new URLSearchParams(hash);
		return hashParams.get('subtab') || 'general';
	};

	const [currentTab, setCurrentTab] = useState(getCurrentTabFromUrl());

	useEffect(() => {
		const handleHashChange = () => setCurrentTab(getCurrentTabFromUrl());
		window.addEventListener('hashchange', handleHashChange);
		return () => window.removeEventListener('hashchange', handleHashChange);
	}, []);

	// Build hash URL for a given tab
	const prepareUrl = (tabId: string) => `#subtab=${tabId}`;

	const tabContent = applyFilters(
		'multivendorx_store_settings_tabs',
		[
			{
				type: 'file',
				content: {
					id: 'general',
					name: 'General',
					desc: 'Update your store’s core information - name, slug, description, and buyer message',
					icon: 'tools',
				},
			},
			{
				type: 'file',
				condition: settings?.['store-permissions'].edit_store_info_activation.includes('store_images'),
				content: {
					id: 'appearance',
					name: 'Appearance',
					desc: 'Manage your store’s profile image, banner, and video.',
					icon: 'appearance',
				},
			},
			{
				type: 'file',
				condition: settings?.['store-permissions'].edit_store_info_activation.includes('store_address'),
				content: {
					id: 'business-address',
					name: 'Business Address',
					desc: 'Provide your business address, city, zip code, country, state, and timezone to ensure accurate order and location settings.',
					icon: 'form-address',
				},
			},
			{
				type: 'file',
				condition: settings?.['store-permissions'].edit_store_info_activation.includes('store_contact'),
				content: {
					id: 'contact-information',
					name: 'Contact Information',
					desc: 'Add your store’s contact details so customers can reach you easily through phone, email.',
					icon: 'form-phone',
				},
			},
			{
				type: 'file',
				content: {
					id: 'social-media',
					name: 'Social Media',
					desc: 'Add your store’s social media links to help buyers connect with you across platforms.',
					icon: 'cohort',
				},
			},
			{
				type: 'file',
				content: {
					id: 'payout',
					name: 'Payout',
					desc: 'Enter your payment information and select the method you’d like to use for receiving store payouts.',
					icon: 'wallet-open',
				},
			},
			{
				type: 'file',
				module: 'store-policy',
				content: {
					id: 'privacy',
					name: 'Privacy',
					desc: 'Define your store’s policies so customers clearly understand your shipping, refund, and return terms.',
					icon: 'privacy',
				},
			},
			{
				type: 'file',
				module: 'store-shipping',
				content: {
					id: 'shipping',
					name: 'Shipping',
					desc: 'Manage your store’s shipping method, pricing rules, and location-based rates.',
					icon: 'shipping',
				},
			},
			{
				type: 'file',
				module: 'marketplace-compliance',
				content: {
					id: 'verification',
					name: 'Verification',
					desc: 'verification',
					icon: 'verification5',
				},
			},
		].filter(
			(tab) =>
				(!tab.module || modules.includes(tab.module)) &&
				(tab.condition === undefined || tab.condition)
		)
	);

	const getForm = (tabId: string) => {
		let form: React.ReactNode;

		switch (tabId) {
			case 'general':
				form = <GeneralSettings />;
				break;
			case 'appearance':
				form = <Appearance />;
				break;
			case 'business-address':
				form = <BusinessAddress />;
				break;
			case 'contact-information':
				form = <ContactInformation />;
				break;
			case 'social-media':
				form = <SocialMedia />;
				break;
			case 'payout':
				form = <Withdrawl />;
				break;
			case 'privacy':
				form = <Privacy />;
				break;
			case 'shipping':
				form = <ShippingDelivery />;
				break;
			case 'verification':
				form = <Verification />;
				break;
			default:
				form = null;
		}

		return (
			applyFilters(
				'multivendorx_store_settings_tab_content',
				form,
				tabId
			) ?? <div />
		);
	};

	return (
		<>
			<div className="horizontal-tabs">
				<SettingsNavigator
					tabContent={tabContent}
					currentTab={currentTab}
					getForm={getForm}
					prepareUrl={prepareUrl}
					appLocalizer={appLocalizer}
					settingName="Settings"
					Link={SimpleLink}
					submenuRender={true}
					menuIcon={true}
				/>
			</div>
		</>
	);
};

export default settings;
