/* global appLocalizer */
import React, { useEffect, JSX } from 'react';
import { __ } from '@wordpress/i18n';
// Context
import { SettingProvider, useSetting } from '../../contexts/SettingContext';
// Services
import { getTemplateData } from '../../services/templateService';
// Utils
import {
	getAvailableSettings,
	getSettingById,
	useModules,
	SettingsNavigator,
	RenderComponent,
} from 'zyra';
import ShowProPopup from '../Popup/Popup';
import { useLocation, Link } from 'react-router-dom';

interface SettingsProps {
	id: string;
}

const StatusAndTools: React.FC<SettingsProps> = () => {
	const settingsArray = getAvailableSettings(getTemplateData('tools'), []);
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
				appLocalizer.admin_settings[currentTab] || {}
			);
		}

		useEffect(() => {
			if (settingName === currentTab) {
				appLocalizer.admin_settings[settingName] = setting;
			}

			const storeCapability =
				appLocalizer.admin_settings['store-permissions'];

			if (storeCapability) {
				setStoreTabSetting(storeCapability);
				const userCapability =
					appLocalizer.admin_settings['user-permissions'] ||
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

				appLocalizer.admin_settings['user-permissions'] = {
					...userCapability,
					...result,
				};
			}
		}, [setting, settingName, currentTab]);

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
					`?page=multivendorx#&tab=status-tools&subtab=${subTab}`
				}
				appLocalizer={appLocalizer}
				Link={Link}
				settingName={'Status & Tools'}
				className="admin-settings"
			/>
		</SettingProvider>
	);
};

export default StatusAndTools;
