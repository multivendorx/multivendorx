/* global appLocalizer */
import React, { useEffect, JSX } from 'react';
import { __ } from '@wordpress/i18n';
import { getTemplateData } from '../../services/templateService';

import { InputRenderer } from '@zyra/inputs';
import {
	getAvailableSettings,
	getSettingById,
	useModules,
	SettingProvider,
	useSetting,
} from '@zyra/core';
import { NavigatorComponent } from '@zyra/components';
import ShowProPopup from '../Popup/Popup';
import { useLocation, Link } from 'react-router-dom';

interface SettingsProps {
	id: string;
}

interface SettingsFormRendererProps {
	currentTab: string;
	settingsArray: unknown[];
}

const SettingsFormRenderer: React.FC<SettingsFormRendererProps> = ({
	currentTab,
	settingsArray
}) => {
	const { setting, settingName, setSetting, updateSetting } = useSetting();
	const { modules } = useModules();
	const settingModal = getSettingById(settingsArray, currentTab);

	useEffect(() => {
		if (settingName !== currentTab) {
			setSetting(currentTab, appLocalizer.admin_settings[currentTab] || {});
		}
	}, [currentTab, settingName, setSetting]);

	useEffect(() => {
		if (settingName === currentTab) {
			appLocalizer.admin_settings[settingName] = setting;
		}
	}, [setting, settingName, currentTab]);

	return (
		<>
			{settingName === currentTab ? (
				<InputRenderer
					settings={settingModal}
					proSetting={appLocalizer.pro_settings_list}
					setting={setting}
					updateSetting={updateSetting}
					appLocalizer={appLocalizer}
					modules={modules}
					Popup={ShowProPopup}
				/>
			) : (
				<>{__('Loading...', 'moowoodle')}</>
			)}
		</>
	);
};

const Settings: React.FC<SettingsProps> = () => {
	const settingsArray = getAvailableSettings(getTemplateData('settings'), []);
	const location = new URLSearchParams(useLocation().hash.substring(1));

	// Render the dynamic form
	const GetForm = (currentTab: string | null): JSX.Element | null => {
		if (!currentTab) {
			return null;
		}

		return (
			<SettingsFormRenderer
				currentTab={currentTab}
				settingsArray={settingsArray}
			/>
		);
	};
	return (
		<SettingProvider>
			<NavigatorComponent
				settingContent={settingsArray}
				currentSetting={location.get('subtab') as string}
				getForm={GetForm}
				prepareUrl={(subTab: string) =>
					`?page=moowoodle#&tab=settings&subtab=${subTab}`
				}
				appLocalizer={appLocalizer}
				Link={Link}
				settingName={'settings'}
				className="admin-settings"
			/>
		</SettingProvider>
	);
};

export default Settings;
