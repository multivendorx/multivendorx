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
import { SettingsNavigatorComponent } from '@zyra/components';
import ShowProPopup from '../Popup/Popup';
import { useLocation, Link } from 'react-router-dom';

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
                    <InputRenderer
                        settings={settingModal}
                        setting={setting}
                        updateSetting={updateSetting}
                        appLocalizer={appLocalizer}
                        modules={modules}
                        Popup={ShowProPopup}
                    />
                ) : (
                    <>{__('Loading...', 'catalogx')}</>
                )}
            </>
        );
    };

    return (
        <SettingProvider>
            <SettingsNavigatorComponent
                settingContent={settingsArray}
                currentSetting={location.get('subtab') as string}
                getForm={GetForm}
                prepareUrl={(subTab: string) =>
                    `?page=catalogx#&tab=settings&subtab=${subTab}`
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
