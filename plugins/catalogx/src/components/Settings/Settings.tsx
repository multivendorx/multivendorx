/* global appLocalizer */
import Brand from '../../assets/images/Brand.png';
import BrandSmall from '../../assets/images/Brand-small.png';
import React, { useEffect, JSX } from 'react';
import { __ } from '@wordpress/i18n';

// Services
import { getTemplateData } from '../../services/templateService';
// Utils
import {
    getAvailableSettings,
    getSettingById,
    SettingContent,
    AdminForm,
    Banner,
    Tabs,
    useModules,
    SettingProvider,
    useSetting,
    type SettingContextType,
} from 'zyra';
import ShowPopup from '../Popup/Popup';
import { useLocation, Link } from 'react-router-dom';

// Types
type SettingItem = Record< string, any >;

interface SettingsProps {
    id: string;
}

interface Products {
    title: string;
    description: string;
}

const supportLink = [
    {
        title: __( 'Get in touch with Support', 'catalogx' ),
        icon: 'adminfont-mail',
        description: __(
            'Reach out to the support team for assistance or guidance.',
            'catalogx'
        ),
        link: 'https://catalogx.com/support/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx',
    },
    {
        title: __( 'Explore Documentation', 'catalogx' ),
        icon: 'adminfont-submission-message',
        description: __(
            'Understand the plugin and its settings.',
            'catalogx'
        ),
        link: 'https://catalogx.com/docs/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx',
    },
    {
        title: __( 'Contribute Here', 'catalogx' ),
        icon: 'adminfont-support',
        description: __( 'To participate in product enhancement.', 'catalogx' ),
        link: 'https://github.com/multivendorx/catalogx/issues',
    },
];

const Settings: React.FC< SettingsProps > = () => {
    const settingsArray: SettingItem[] = getAvailableSettings(
        getTemplateData(),
        []
    );
    const location = new URLSearchParams( useLocation().hash.substring( 1 ) );
    // Render the dynamic form
    const GetForm = ( currentTab: string | null ): JSX.Element | null => {
        const {
            setting,
            settingName,
            setSetting,
            updateSetting,
        }: SettingContextType = useSetting();
        const { modules } = useModules();

        if ( ! currentTab ) return null;
        const settingModal = getSettingById( settingsArray as any, currentTab );

        // Ensure settings context is initialized
        if ( settingName !== currentTab ) {
            setSetting(
                currentTab,
                appLocalizer.settings_databases_value[ currentTab ] || {}
            );
        }

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect( () => {
            if ( settingName === currentTab ) {
                appLocalizer.settings_databases_value[ settingName ] = setting;
            }
        }, [ setting, settingName, currentTab ] );

        return (
            <>
                { settingName === currentTab ? (
                    <AdminForm
                        settings={ settingModal as SettingContent }
                        proSetting={ appLocalizer.settings_databases_value }
                        setting={ setting }
                        updateSetting={ updateSetting }
                        appLocalizer={ appLocalizer }
                        modules={ modules }
                        Popup={ ShowPopup }
                    />
                ) : (
                    // <>Hii There</>
                    <>Loading...</>
                ) }
            </>
        );
    };

    return (
        <SettingProvider>
            <Tabs
                tabData={ settingsArray as any }
                currentTab={ location.get( 'subtab' ) as string }
                getForm={ GetForm }
                prepareUrl={ ( subTab: string ) =>
                    `?page=catalogx#&tab=settings&subtab=${ subTab }`
                }
                appLocalizer={ appLocalizer }
                brandImg={ Brand }
                smallbrandImg={ BrandSmall }
                supprot={ supportLink }
                Link={ Link }
            />
        </SettingProvider>
    );
};

export default Settings;
