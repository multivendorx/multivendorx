/* global appLocalizer */
import React, { useEffect, JSX } from 'react';
import { __ } from '@wordpress/i18n';
import { SettingProvider, useSetting } from '../../contexts/SettingContext';
import { getTemplateData } from '../../services/templateService';
import {
	getAvailableSettings,
	getSettingById,
	RenderComponent,
	useModules,
	SettingsNavigator,
} from 'zyra';
import ShowProPopup from '../Popup/Popup';
import { useLocation, Link } from 'react-router-dom';
import EventRules from './Notification/EventRules.tsx';
import StoreStatus from './StoreConfiguration/StoreStatus.tsx';
import Invoice from './StoreConfiguration/Invoice';

interface SettingsProps {
	id: string;
}

const Settings: React.FC<SettingsProps> = () => {
	const settingsArray = getAvailableSettings(getTemplateData('settings'), []);
	const location = new URLSearchParams(useLocation().hash.substring(1));

	// Render the dynamic form
	const GetForm = (currentTab: string | null): JSX.Element | null => {
		// get the setting context
		const { setting, settingName, setSetting, updateSetting } =
			useSetting();
		const { modules } = useModules();

		if (!currentTab) {
			return null;
		}
		const settingModal = getSettingById(settingsArray, currentTab);
		const [storeTabSetting, setStoreTabSetting] = React.useState(null);

		// Ensure settings context is initialized
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

			const storeCapability =
				appLocalizer.settings_databases_value['store-permissions'];

			if (storeCapability) {
				setStoreTabSetting(storeCapability);
				const userCapability =
					appLocalizer.settings_databases_value['user-permissions'] ||
					{};

				// all capability arrays into one
				const storeOwnerCaps: string[] = [];
				Object.values(storeCapability).forEach((caps) => {
					if (Array.isArray(caps)) {
						storeOwnerCaps.push(...caps);
					}
				});

				const result = { store_owner: storeOwnerCaps };

				Object.entries(userCapability).forEach(([role, caps]) => {
					if (role !== 'store_owner' && Array.isArray(caps)) {
						userCapability[role] = caps.filter((cap) =>
							storeOwnerCaps.includes(cap)
						);
					}
				});

				appLocalizer.settings_databases_value['user-permissions'] = {
					...userCapability,
					...result,
				};
			}
		}, [setting, settingName, currentTab]);

		// Special component
		if (currentTab === 'event-rules') {
			return <EventRules />;
		}
		if (currentTab === 'store-status') {
			return <StoreStatus />;
		}
		if (currentTab === 'invoices') {
			return <Invoice />;
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
						storeTabSetting={storeTabSetting}
					/>
				) : (
					<>{__('Loading...', 'multivendorx')}</>
				)}
			</>
		);
	};

	return (
		<SettingProvider>
			<SettingsNavigator
				settingContent={settingsArray}
				currentSetting={location.get('subtab') as string}
				getForm={GetForm}
				prepareUrl={(subTab: string) =>
					`?page=multivendorx#&tab=settings&subtab=${subTab}`
				}
				appLocalizer={appLocalizer}
				Link={Link}
				settingName={'Settings'}
				className="admin-settings"
			/>
		</SettingProvider>
	);
};

export default Settings;
