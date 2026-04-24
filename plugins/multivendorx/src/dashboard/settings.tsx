/* global appLocalizer */
import React, { useEffect, useState } from 'react';
// Context
import { SettingProvider, useSetting } from '../contexts/SettingContext';
// Services
import { getTemplateData } from '../services/templateService';
// Utils
import {
	getAvailableSettings,
	getSettingById,
	RenderComponent,
	useModules,
	SettingsNavigator,
} from 'zyra';
import ShowProPopup from '../components/Popup/Popup';
import ShippingDelivery from './settings/ShippingDelivery';
import BusinessAddress from './DashboardSettings/BusinessAddress';
import { __ } from '@wordpress/i18n';
import ShipStation from './settings/ShipStation';

interface SettingsProps {
	id: string;
}

const settings: React.FC<SettingsProps> = () => {
	const { modules } = useModules();

	const allSettings = getAvailableSettings(
		getTemplateData('dashboardSettings'),
		[]
	);

	const settingsArray = allSettings.filter((setting) => {
		if (setting.content?.hide) {
			return false;
		}
		if (setting.content.module) {
			return modules.includes(setting.content.module);
		}
		return true;
	});

	const [successMsg, setSuccessMsg] = useState<string | null>(null);

	useEffect(() => {
		if (successMsg) {
			const timer = setTimeout(() => setSuccessMsg(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [successMsg]);

	const SimpleLink = ({ to, children, onClick, className }) => (
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

	const GetForm = (currentTab: string | null): React.ReactElement | null => {
		// get the setting context
		const { setting, settingName, setSetting, updateSetting } =
			useSetting();
		const { modules } = useModules();

		if (!currentTab) {
			return null;
		}

		const settingModal = getSettingById(settingsArray, currentTab);

		useEffect(() => {
			if (setting?.country) {
				appLocalizer.all_store_meta = {
					...appLocalizer.all_store_meta,
					state: '',
				};
			}
		}, [setting?.country]);

		// Ensure settings context is initialized
		if (settingName !== currentTab) {
			setSetting(currentTab, appLocalizer.all_store_meta || {});
		}

		useEffect(() => {
			if (settingName === currentTab) {
				appLocalizer.all_store_meta = setting;
			}
		}, [setting, settingName, currentTab]);

		if (currentTab === 'shipping') {
			return <ShippingDelivery />;
		}
		if (currentTab === 'business-address') {
			return <BusinessAddress />;
		}

		if (currentTab === 'ship-station') {
			return <ShipStation />;
		}

		return (
			<>
				{settingName === currentTab ? (
					<RenderComponent
						settings={settingModal}
						proSetting={appLocalizer.pro_settings_list}
						setting={setting}
						updateSetting={updateSetting}
						appLocalizer={appLocalizer}
						modules={modules}
						Popup={ShowProPopup}
					/>
				) : (
					<>{__('Loading...', 'multivendorx')}</>
				)}
			</>
		);
	};

	return (
		<>
			<SettingProvider>
				<SettingsNavigator
					settingContent={settingsArray}
					currentSetting={currentTab}
					getForm={GetForm}
					prepareUrl={prepareUrl}
					appLocalizer={appLocalizer}
					variant="settings"
					Link={SimpleLink}
					menuIcon={true}
					className="admin-settings"
				/>
			</SettingProvider>
		</>
	);
};

export default settings;
