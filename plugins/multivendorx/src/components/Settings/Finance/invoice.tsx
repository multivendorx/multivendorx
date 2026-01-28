// /* global appLocalizer */
import React, { useEffect, useState, JSX } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { SettingProvider, useSetting } from '../../../contexts/SettingContext';
import { getTemplateData } from '../../../services/templateService';
import {
	getAvailableSettings,
	getSettingById,
	AdminForm,
	Tabs,
	useModules,
} from 'zyra';

// Types
type SettingItem = Record<string, any>;

const Invoice: React.FC = () => {
	const location = new URLSearchParams(useLocation().hash.substring(1));
	const initialTab = location.get('tabId') || 'general';

	const settingsArray: SettingItem[] = getAvailableSettings(
		getTemplateData('invoice'),
		[]
	);

	const tabData = [
		{
			type: 'file',
			content: {
				id: 'general',
				name: 'General',
				desc: 'The store is awaiting approval. Sellers can log in to their dashboard but cannot configure settings, add products, or begin selling until approved.',
				// hideTabHeader: true,
				icon: 'in-progress',
			},
		},
		{
			type: 'file',
			content: {
				id: 'customer-invoice',
				name: 'Customer Invoice',
				desc: 'The store is awaiting approval. Sellers can log in to their dashboard but cannot configure settings, add products, or begin selling until approved.',
				// hideTabHeader: true,
				icon: 'in-progress',
			},
		},
		{
			type: 'file',
			content: {
				id: 'marketplace-fee-invoice',
				name: 'Marketplace Fee Invoice',
				desc: 'The store is awaiting approval. Sellers can log in to their dashboard but cannot configure settings, add products, or begin selling until approved.',
				// hideTabHeader: true,
				icon: 'in-progress',
			},
		},
		{
			type: 'file',
			content: {
				id: 'store-invoice',
				name: 'Store Invoice',
				desc: 'The store is awaiting approval. Sellers can log in to their dashboard but cannot configure settings, add products, or begin selling until approved.',
				// hideTabHeader: true,
				icon: 'in-progress',
			},
		},
		{
			type: 'file',
			content: {
				id: 'store-subscription',
				name: 'Store Subscription',
				desc: 'The store is awaiting approval. Sellers can log in to their dashboard but cannot configure settings, add products, or begin selling until approved.',
				// hideTabHeader: true,
				icon: 'in-progress',
			},
		},	
		{
			type: 'file',
			content: {
				id: 'admin-invoice',
				name: 'Admin Invoice',
				desc: 'The store is awaiting approval. Sellers can log in to their dashboard but cannot configure settings, add products, or begin selling until approved.',
				// hideTabHeader: true,
				icon: 'in-progress',
			},
		},
		{
			type: 'file',
			content: {
				id: 'packing-slip',
				name: 'Packing Slip',
				desc: 'The store is awaiting approval. Sellers can log in to their dashboard but cannot configure settings, add products, or begin selling until approved.',
				// hideTabHeader: true,
				icon: 'in-progress',
			},
		},		
	];

	const GetForm = (currentTab: string | null): JSX.Element | null => {
		const { setting, settingName, setSetting, updateSetting } =
			useSetting();
		const { modules } = useModules();
		const [storeTabSetting, setStoreTabSetting] = useState<any>(null);

		if (!currentTab) {
			return null;
		}

		const settingModal = getSettingById(settingsArray as any, currentTab);

		// Initialize settings for current tab
		if (settingName !== currentTab) {
			setSetting(
				currentTab,
				appLocalizer.settings_databases_value[currentTab] || {}
			);
		}

		useEffect(() => {
			if (settingName === currentTab) {
				appLocalizer.settings_databases_value[settingName] = setting;
			}
		}, [setting, settingName, currentTab]);

		return settingName === currentTab ? (
			<AdminForm
				settings={settingModal as any}
				proSetting={appLocalizer.pro_settings_list}
				setting={setting}
				updateSetting={updateSetting}
				appLocalizer={appLocalizer}
				modules={modules}
				storeTabSetting={storeTabSetting}
			/>
		) : (
			<>Loading...</>
		);
	};

	return (
		<SettingProvider>
			<Tabs
				tabData={tabData as any}
				currentTab={initialTab}
				getForm={GetForm}
				prepareUrl={(subTab: string) =>
					`?page=multivendorx#&tab=settings&subtab=${subTab}`
				}
				appLocalizer={appLocalizer}
				supprot={[]}
				Link={Link}
				hideTitle={true}
				hideBreadcrumb={true}
				premium={false}
			/>
		</SettingProvider>
	);
};

export default Invoice;
