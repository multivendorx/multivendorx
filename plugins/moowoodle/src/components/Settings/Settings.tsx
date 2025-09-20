/* global appLocalizer */
import Brand from '../../assets/images/brand.png';
import BrandSmall from '../../assets/images/brand-small.png';
import React, { useEffect, JSX } from 'react';
import { __ } from '@wordpress/i18n';
// Services
import { getTemplateData } from '../../services/templateService';
// Utils
import {
    getAvailableSettings,
    getSettingById,
    SettingContent,
    Support,
    AdminForm,
    Banner,
    Tabs,
    useModules,
    useSetting,
    SettingProvider,
} from 'zyra';

import ShowProPopup from '../Popup/Popup';
import { useLocation, Link } from 'react-router-dom';

// Types
type SettingItem = Record< string, any >;

interface SettingsProps {
    id: string;
}

const faqs = [
    {
        question: __(
            'How do I resolve a timeout error when WordPress connects with Moodle?',
            'moowoodle'
        ),
        answer: __(
            'When encountering a timeout error during WordPress-Moodle communication, adjust timeout settings in your server configuration to accommodate longer communication durations.',
            'moowoodle'
        ),
        open: true,
    },
    {
        question: __(
            'How can I troubleshoot connection errors during Test connection?',
            'moowoodle'
        ),
        answer: __(
            'Navigate to the "Log" menu, where you can use the "Log" feature to troubleshoot connectivity issues between your store and Moodle. This tool helps identify necessary changes for resolution.',
            'moowoodle'
        ),
        open: false,
    },
    {
        question: __(
            "Why aren't my customers receiving enrollment emails?",
            'moowoodle'
        ),
        answer: __(
            'Install a plugin like Email Log to check if New Enrollment emails are logged. If logged, your email functionality is working fine; if not, contact your email server administrator for assistance.',
            'moowoodle'
        ),
        open: false,
    },
    {
        question: __(
            'Can I set course expiration dates using MooWoodle?',
            'moowoodle'
        ),
        answer: __(
            'Course-related functionalities, including setting expiration dates, are managed within Moodle itself; MooWoodle does not control these aspects.',
            'moowoodle'
        ),
        open: false,
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
        // get the setting context
        const { setting, settingName, setSetting, updateSetting } =
            useSetting();
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

        // Special component
        if ( currentTab === 'support' ) {
            return (
                <Support
                    title="Thank you for using MooWoodle"
                    subTitle="We want to help you enjoy a wonderful experience with all of our products."
                    url={ appLocalizer.video_url }
                    faqData={ faqs }
                />
            );
        }

        return (
            <>
                { settingName === currentTab ? (
                    <AdminForm
                        settings={ settingModal as SettingContent }
                        proSetting={ appLocalizer.pro_settings_list }
                        setting={ setting }
                        updateSetting={ updateSetting }
                        appLocalizer={ appLocalizer }
                        modules={ modules }
                        Popup={ ShowProPopup }
                    />
                ) : (
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
                    `?page=moowoodle#&tab=settings&subtab=${ subTab }`
                }
                appLocalizer={ appLocalizer }
                brandImg={ Brand }
                smallbrandImg={ BrandSmall }
                Link={ Link }
                settingName={ 'Settings' }
            />
        </SettingProvider>
    );
};

export default Settings;
