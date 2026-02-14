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

const StoreStatus: React.FC = () => {
	const location = new URLSearchParams(useLocation().hash.substring(1));
	const initialTab = location.get('tabId') || 'pending';

	const settingsArray: SettingItem[] = getAvailableSettings(
		getTemplateData('storeStatus'),
		[]
	);

	const settingContent = [
		{
			type: 'heading',
			name: 'Activation flow',
		},
		{
			type: 'file',
			content: {
				id: 'pending',
				name: 'Pending Approval',
				settingDes: 'The store is awaiting approval. Sellers can log in to their dashboard but cannot configure settings, add products, or begin selling until approved.',
				icon: 'in-progress',
			},
		},
		{
			type: 'file',
			content: {
				id: 'rejected',
				name: 'Rejected',
				settingDes: 'The store application has been rejected. Sellers can view the rejection reason and resubmit their application after addressing the issues.',
				icon: 'rejected',
			},
		},
		{
			type: 'file',
			content: {
				id: 'permanently-rejected',
				name: 'Permanently Rejected',
				settingDes: 'The store application has been permanently rejected. Sellers can view their dashboard in read-only mode but cannot make changes or reapply without admin intervention.',
				icon: 'permanently-rejected',
			},
		},
		{
			type: 'heading',
			name: 'Post-activation flow',
		},
		{
			type: 'file',
			content: {
				id: 'active',
				name: 'Active',
				settingDes: 'The store is active and fully operational. Stores have complete access to manage products, process orders, receive payouts, and configure all store settings.',
				icon: 'verification10',
			},
		},
		{
			type: 'file',
			content: {
				id: 'under-review',
				name: 'Under Review',
				settingDes: 'The store is under review due to compliance concerns. Selling is paused, payouts are held, and new product uploads are restricted until the review is complete.',
				icon: 'under-review',
			},
		},
		{
			type: 'file',
			content: {
				id: 'suspended',
				name: 'Suspended',
				settingDes: 'The store has been suspended due to policy violations. Products are hidden, payouts are frozen, and selling is disabled. Sellers can appeal through support.',
				icon: 'suspended',
			},
		},
		{
			type: 'file',
			content: {
				id: 'deactivated',
				name: 'Permanently Deactivated',
				settingDes: 'The store has been permanently deactivated. Stores have read-only access to historical data, but the storefront and its product is removed from public view and no changes can be made.',
				icon: 'rejecte',
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
			<SettingsNavigator
				settingContent={settingContent as any}
				currentSetting={initialTab}
				getForm={GetForm}
				prepareUrl={(tabid: string) =>
					`?page=multivendorx#&tab=settings&subtab=store-status&tabId=${tabid}`
				}
				appLocalizer={appLocalizer}
				settingName="Settings"
				Link={Link}
				menuIcon={true}
				variant= 'settings'
			/>
		</SettingProvider>
	);
};

export default StoreStatus;
