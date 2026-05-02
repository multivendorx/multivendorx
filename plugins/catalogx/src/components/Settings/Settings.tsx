/* global appLocalizer */
import React, { useEffect, JSX } from 'react';
import { __ } from '@wordpress/i18n';

// Services
import { getTemplateData } from '../../services/templateService';
// Utils
import {
    getAvailableSettings,
    getSettingById,
    useModules,
    SettingProvider,
    useSetting,
    type SettingContextType,
    SettingsNavigator,
    RenderComponent,
} from 'zyra';
import ShowProPopup from '../Popup/Popup';
import { useLocation, Link } from 'react-router-dom';

// Types
type SettingItem = Record<string, any>;

interface SettingsProps {
    id: string;
}

const Settings: React.FC<SettingsProps> = () => {
    const settingsArray: SettingItem[] = getAvailableSettings(
        getTemplateData(),
        []
    );
    const location = new URLSearchParams(useLocation().hash.substring(1));
    // Render the dynamic form
    const GetForm = (currentTab: string | null): JSX.Element | null => {
        const {
            setting,
            settingName,
            setSetting,
            updateSetting,
        }: SettingContextType = useSetting();
        const { modules } = useModules();

        if (!currentTab) return null;
        const settingModal = getSettingById(settingsArray as any, currentTab);

        // Ensure settings context is initialized
        if (settingName !== currentTab) {
            setSetting(
                currentTab,
                appLocalizer.settings_databases_value[currentTab] || {}
            );
        }

        // eslint-disable-next-line react-hooks/rules-of-hooks
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
						proSetting={appLocalizer.settings_databases_value}
						setting={setting}
						updateSetting={updateSetting}
						appLocalizer={appLocalizer}
						modules={modules}
						Popup={ShowProPopup}
					/>
                ) : (
                    <>Loading...</>
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
