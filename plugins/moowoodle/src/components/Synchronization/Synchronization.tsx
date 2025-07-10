/* global appLocalizer */
import Brand from '../../assets/images/Brand.png';
import BrandSmall from '../../assets/images/Brand-small.png';
import { useLocation, Link } from 'react-router-dom';
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
    SettingContent,
    AdminForm,
    Banner,
    Tabs,
} from 'zyra';
import { useModules } from '../../contexts/ModuleContext';
import ShowProPopup from '../Popup/Popup';

// Types
type SettingItem = Record<string, any>;

interface SettingsProps {
    id: string;
}

const supportLink = [
    {
        title: __('Get in touch with Support', 'moowoodle'),
        icon: 'adminlib-mail',
        description: __(
            'Reach out to the support team for assistance or guidance.',
            'moowoodle'
        ),
        link: 'https://dualcube.com/forums/?utm_source=wordpress.org&utm_medium=freelandingpage&utm_campaign=MooWoodleFree',
    },
    {
        title: __('Explore Documentation', 'moowoodle'),
        icon: 'adminlib-submission-message',
        description: __('Understand the plugin and its settings.', 'moowoodle'),
        link: 'https://dualcube.com/knowledgebase/?utm_source=wordpress.org&utm_medium=freelandingpage&utm_campaign=MooWoodleFree',
    },
    {
        title: __('Contribute Here', 'moowoodle'),
        icon: 'adminlib-support',
        description: __('Participate in product enhancement.', 'moowoodle'),
        link: 'https://github.com/multivendorx/multivendorx/issues',
    },
];

interface Products {
    title: string;
    description: string;
}

const products: Products[] = [
    {
        title: __(
            'Automated user and course synchronization with scheduler',
            'moowoodle'
        ),
        description: __(
            'Utilize personalized scheduling options to synchronize users and courses between WordPress and Moodle.',
            'moowoodle'
        ),
    },
    {
        title: __('Convenient Single Sign-On login', 'moowoodle'),
        description: __(
            'SSO enables students to access their purchased courses without the need to log in separately to the Moodle site.',
            'moowoodle'
        ),
    },
    {
        title: __('Steady Income through Course Subscriptions', 'moowoodle'),
        description: __(
            'Generate consistent revenue by offering courses with subscription-based model.',
            'moowoodle'
        ),
    },
    {
        title: __('Synchronize Courses in Bulk', 'moowoodle'),
        description: __(
            'Effortlessly synchronize multiple courses at once, ideal for managing large course catalogs.',
            'moowoodle'
        ),
    },
    {
        title: __(
            'Automatic User Synchronization for Moodle™ and WordPress',
            'moowoodle'
        ),
        description: __(
            'Synchronizes user accounts between Moodle™ and WordPress, ensuring consistent user management across both platforms without manual intervention.',
            'moowoodle'
        ),
    },
];

const Synchronization: React.FC<SettingsProps> = () => {
    const settingsArray: SettingItem[] = getAvailableSettings(
        getTemplateData('synchronizations'),
        []
    );

    // get current browser location
    const location = new URLSearchParams(useLocation().hash);

    const getBanner = () => {
        return (
            <Banner
                products={products}
                isPro={appLocalizer.khali_dabba}
                proUrl={appLocalizer.shop_url}
                tag="Why Premium"
                buttonText="View Pricing"
                bgCode="#0a3981" // background color
                textCode="#fff" // text code
                btnCode="#fff" // button color
                btnBgCode="#ff9843" // button background color
            />
        );
    };

    // Render the dynamic form
    const GetForm = (currentTab: string | null): JSX.Element | null => {
        // get the setting context
        const { setting, settingName, setSetting, updateSetting } =
            useSetting();
        const { modules } = useModules();

        if (!currentTab) return null;
        const settingModal = getSettingById(settingsArray as any, currentTab);

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
                    <AdminForm
                        settings={settingModal as SettingContent}
                        proSetting={appLocalizer.pro_settings_list}
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
        <>
            <SettingProvider>
                <Tabs
                    tabData={settingsArray as any}
                    currentTab={location.get('subtab') as string}
                    getForm={GetForm}
                    BannerSection={getBanner}
                    prepareUrl={(subTab: string) =>
                        `?page=moowoodle#&tab=synchronization&subtab=${subTab}`
                    }
                    appLocalizer={appLocalizer}
                    brandImg={Brand}
                    smallbrandImg={BrandSmall}
                    supprot={supportLink}
                    Link={Link}
                />
            </SettingProvider>
        </>
    );
};

export default Synchronization;
