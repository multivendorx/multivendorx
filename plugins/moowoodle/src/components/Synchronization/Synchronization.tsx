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

interface SettingsProps {
	id: string;
}

const Synchronization: React.FC<SettingsProps> = () => {
	const settingsArray = getAvailableSettings(getTemplateData('synchronization'), []);
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
					`?page=moowoodle#&tab=synchronization&subtab=${subTab}`
				}
				appLocalizer={appLocalizer}
				Link={Link}
				settingName={'synchronization'}
				className="admin-settings"
			/>
		</SettingProvider>
	);
};

export default Synchronization;
