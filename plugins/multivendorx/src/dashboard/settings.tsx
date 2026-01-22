import { useEffect, useState } from 'react';
import axios from 'axios';
import {
	BasicInput,
	TextArea,
	FileInput,
	SelectInput,
	useModules,
	getApiLink,
	Tabs,
} from 'zyra';
import GeneralSettings from './settings/general';
import Appearance from './settings/Appearance';
import SocialMedia from './settings/SocialMedia';
import ContactInformation from './settings/ContactInformation';
import BusinessAddress from './settings/BusinessAddress';
import Withdrawl from './settings/withdrawl';
import Privacy from './settings/Privacy';
import Verification from './settings/Verification';
import ShippingDelivery from './settings/ShippingDelivery';
import LiveChat from './settings/LiveChat';

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

	const tabData = [
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
			condition: settings?.['store-capability'].edit_store_info_activation.includes('store_images'),
			content: {
				id: 'appearance',
				name: 'Appearance',
				desc: 'Manage your store’s profile image, banner, and video.',
				icon: 'appearance',
			},
		},
		{
			type: 'file',
			condition: settings?.['store-capability'].edit_store_info_activation.includes('store_address'),
			content: {
				id: 'business-address',
				name: 'Business Address',
				desc: 'Provide your business address, city, zip code, country, state, and timezone to ensure accurate order and location settings.',
				icon: 'form-address',
			},
		},
		{
			type: 'file',
			condition: settings?.['store-capability'].edit_store_info_activation.includes('store_contact'),
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
			module: 'marketplace-complianceg',
			content: {
				id: 'verification',
				name: 'Verification',
				desc: 'verification',
				icon: 'verification5',
			},
		},
		{
			type: 'file',
			module: 'live-chat',
			content: {
				id: 'livechat',
				name: 'Livechat',
				desc: 'Connect your store with live chat platforms so customers can reach you instantly for support or inquiries.',
				icon: 'live-chat',
			},
		},
	].filter(
		(tab) =>
			//Show if:
			(!tab.module || modules.includes(tab.module)) && 
			(tab.condition === undefined || tab.condition)
	);

	const getForm = (tabId: string) => {
		switch (tabId) {
			case 'general':
				return <GeneralSettings />;
			case 'appearance':
				return <Appearance />;
			case 'business-address':
				return <BusinessAddress />;
			case 'contact-information':
				return <ContactInformation />;
			case 'social-media':
				return <SocialMedia />;
			case 'payout':
				return <Withdrawl />;
			case 'privacy':
				return <Privacy />;
			case 'shipping':
				return <ShippingDelivery />;
			case 'verification':
				return <Verification />;
			case 'livechat':
				return <LiveChat />;
			default:
				return <div></div>;
		}
	};
	return (
		<>
			<div className="horizontal-tabs">
				<Tabs
					tabData={tabData}
					currentTab={currentTab}
					getForm={getForm}
					prepareUrl={prepareUrl}
					appLocalizer={appLocalizer}
					settingName="Settings"
					supprot={[]}
					Link={SimpleLink}
					submenuRender={true}
					menuIcon={true}
				/>
			</div>
		</>
	);
};

export default settings;
