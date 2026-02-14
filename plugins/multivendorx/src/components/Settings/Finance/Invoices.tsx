// /* global appLocalizer */
import React, { useEffect, useState, JSX } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { SettingProvider, useSetting } from '../../../contexts/SettingContext';
import { getTemplateData } from '../../../services/templateService';
import {
	getAvailableSettings,
	getSettingById,
	RenderComponent,
	useModules,
	SettingsNavigator,
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

	const settingContent = [
		{
			type: 'file',
			content: {
				id: 'general',
				headerTitle: 'General',
				headerDescription: 'The store is awaiting approval. Sellers can log in to their dashboard but cannot configure settings, add products, or begin selling until approved.',
				// hideSettingHeader: true,
				headerIcon: 'in-progress',
			},
		},
		{
			type: 'file',
			content: {
				id: 'customer-invoice',
				headerTitle: 'Customer Invoice',
				headerDescription: 'The store is awaiting approval. Sellers can log in to their dashboard but cannot configure settings, add products, or begin selling until approved.',
				// hideSettingHeader: true,
				headerIcon: 'in-progress',
			},
		},
		{
			type: 'file',
			content: {
				id: 'marketplace-fee-invoice',
				headerTitle: 'Marketplace Fee Invoice',
				headerDescription: 'The store is awaiting approval. Sellers can log in to their dashboard but cannot configure settings, add products, or begin selling until approved.',
				// hideSettingHeader: true,
				headerIcon: 'in-progress',
			},
		},
		{
			type: 'file',
			content: {
				id: 'store-invoice',
				headerTitle: 'Store Invoice',
				headerDescription: 'The store is awaiting approval. Sellers can log in to their dashboard but cannot configure settings, add products, or begin selling until approved.',
				// hideSettingHeader: true,
				headerIcon: 'in-progress',
			},
		},
		{
			type: 'file',
			content: {
				id: 'store-subscription',
				headerTitle: 'Store Subscription',
				headerDescription: 'The store is awaiting approval. Sellers can log in to their dashboard but cannot configure settings, add products, or begin selling until approved.',
				// hideSettingHeader: true,
				headerIcon: 'in-progress',
			},
		},
		{
			type: 'file',
			content: {
				id: 'admin-invoice',
				headerTitle: 'Admin Invoice',
				headerDescription: 'The store is awaiting approval. Sellers can log in to their dashboard but cannot configure settings, add products, or begin selling until approved.',
				// hideSettingHeader: true,
				headerIcon: 'in-progress',
			},
		},
		{
			type: 'file',
			content: {
				id: 'packing-slip',
				headerTitle: 'Packing Slip',
				headerDescription: 'The store is awaiting approval. Sellers can log in to their dashboard but cannot configure settings, add products, or begin selling until approved.',
				// hideSettingHeader: true,
				headerIcon: 'in-progress',
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
			<RenderComponent
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
			<div className="horizontal-tabs">
				<SettingsNavigator
					settingContent={settingContent as any}
					currentSetting={initialTab}
					getForm={GetForm}
					prepareUrl={(tabid: string) =>
						`?page=multivendorx#&tab=settings&subtab=invoice&tabId=${tabid}`
					}
					settingName="Settings"
					Link={Link}
					menuIcon={true}
				/>
			</div>
		</SettingProvider>
	);
};

export default Invoice;
