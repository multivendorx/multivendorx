/* global appLocalizer */
import React, { useEffect, JSX } from 'react';
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
import { __ } from '@wordpress/i18n';

const StoreStatus: React.FC = () => {
	const location = new URLSearchParams(useLocation().hash.substring(1));
	const initialTab = location.get('tabId') || 'pending';
	const settingsArray = getAvailableSettings(
		getTemplateData('storeStatus'),
		[]
	);

	const settingContent = [
		{
			type: 'heading',
			content: {
				id: 'activation_flow',
				headerTitle: __('Activation flow','multivendorx'),
			},
		},
		{
			type: 'file',
			content: {
				id: 'pending',
				headerTitle: __('Pending Approval','multivendorx'),
				headerDescription:__('The store is awaiting approval. Sellers can log in to their dashboard but cannot configure settings, add products, or begin selling until approved.','multivendorx'),
				headerIcon: 'in-progress',
			},
		},
		{
			type: 'file',
			content: {
				id: 'rejected',
				headerTitle: __('Rejected','multivendorx'),
				headerDescription: __('The store application has been rejected. Sellers can view the rejection reason and resubmit their application after addressing the issues.','multivendorx'),
				headerIcon: 'rejected',
			},
		},
		{
			type: 'file',
			content: {
				id: 'permanently-rejected',
				headerTitle: __('Permanently Rejected','multivendorx'),
				headerDescription:__('The store application has been permanently rejected. Sellers can view their dashboard in read-only mode but cannot make changes or reapply without admin intervention.','multivendorx'),
				headerIcon: 'permanently-rejected',
			},
		},
		{
			type: 'heading',
			content: {
				id: 'activation_flow',
				headerTitle: __('Post-activation flow','multivendorx'),
			},
		},
		{
			type: 'file',
			content: {
				id: 'active',
				headerTitle: __('Active','multivendorx'),
				headerDescription:__('The store is active and fully operational. Stores have complete access to manage products, process orders, receive payouts, and configure all store settings.','multivendorx'),
				headerIcon: 'verification10',
			},
		},
		{
			type: 'file',
			content: {
				id: 'under-review',
				headerTitle: __('Under Review','multivendorx'),
				headerDescription:__('The store is under review due to compliance concerns. Selling is paused, payouts are held, and new product uploads are restricted until the review is complete.','multivendorx'),
				headerIcon: 'under-review',
			},
		},
		{
			type: 'file',
			content: {
				id: 'suspended',
				headerTitle: __('Suspended','multivendorx'),
				headerDescription:__('The store has been suspended due to policy violations. Products are hidden, payouts are frozen, and selling is disabled. Sellers can appeal through support.','multivendorx'),
				headerIcon: 'suspended',
			},
		},
		{
			type: 'file',
			content: {
				id: 'deactivated',
				headerTitle: __('Permanently Deactivated','multivendorx'),
				headerDescription:__('The store has been permanently deactivated. Stores have read-only access to historical data, but the storefront and its product is removed from public view and no changes can be made.','multivendorx'),
				headerIcon: 'rejecte',
			},
		},
	];

	const GetForm = (currentTab: string | null): JSX.Element | null => {
		const { setting, settingName, setSetting, updateSetting } =
			useSetting();
		const { modules } = useModules();

		if (!currentTab) {
			return null;
		}

		const settingModal = getSettingById(settingsArray, currentTab);

		// Initialize settings for current tab
		if (settingName !== currentTab) {
			setSetting(
				currentTab,
				appLocalizer.admin_settings[currentTab] || {}
			);
		}

		useEffect(() => {
			if (settingName === currentTab) {
				appLocalizer.admin_settings[settingName] = setting;
			}
		}, [setting, settingName, currentTab]);

		return settingName === currentTab ? (
			<RenderComponent
				settings={settingModal}
				proSetting={appLocalizer.pro_settings_list}
				setting={setting}
				updateSetting={updateSetting}
				appLocalizer={appLocalizer}
				modules={modules}
			/>
		) : (
			<>{__('Loading...', 'multivendorx')}</>
		);
	};

	return (
		<SettingProvider>
			<SettingsNavigator
				settingContent={settingContent}
				currentSetting={initialTab}
				getForm={GetForm}
				prepareUrl={(tabid: string) =>
					`?page=multivendorx#&tab=settings&subtab=store-status&tabId=${tabid}`
				}
				appLocalizer={appLocalizer}
				settingName="Settings"
				Link={Link}
				menuIcon={true}
				variant="settings"
			/>
		</SettingProvider>
	);
};

export default StoreStatus;
