import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import Settings from './components/Settings/Settings';
import Modules from './components/Modules/Modules';
import QuoteRequests from './components/QuoteRequests/quoteRequests';
import EnquiryMessages from './components/EnquiryMessages/enquiryMessages';
import WholesaleUser from './components/WholesaleUser/wholesaleUser';
import Rules from './components/Rules/Rules';
import HeaderNotification from './components/Notifications/HeaderNotifications';
import { searchIndex, SearchItem } from './searchIndex';
import gif from './assets/images/product-page-builder.gif';
import { TourProvider } from '@reactour/tour';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { AdminHeader, Banner, Tour, initializeModules } from 'zyra';
import { __ } from '@wordpress/i18n';
import Brand from './assets/images/Brand.png';

const disableBody = (target: any) => disableBodyScroll(target);
const enableBody = (target: any) => enableBodyScroll(target);
localStorage.setItem('force_catalogx_context_reload', 'true');
interface Products {
    title: string;
    description: string;
}

const Route = () => {
    const currentTab = new URLSearchParams(useLocation().hash);
    return (
        <>
            {currentTab.get('tab') === 'settings' && (
                <Settings id={'settings'} />
            )}
            {currentTab.get('tab') === 'modules' && <Modules />}
            {currentTab.get('tab') === 'quote-requests' && <QuoteRequests />}
            {currentTab.get('tab') === 'wholesale-users' && <WholesaleUser />}
            {currentTab.get('tab') === 'enquiry-messages' && (
                <EnquiryMessages />
            )}
            {currentTab.get('tab') === 'rules' && <Rules />}
        </>
    );
};
const products: Products[] = [
    {
        title: __('Double Opt-In', 'catalogx'),
        description: __(
            'Experience the power of Double Opt-In for our Stock Alert Form - Guaranteed precision in every notification!',
            'catalogx'
        ),
    },
    {
        title: __('Your Subscription Hub', 'catalogx'),
        description: __(
            'Subscription Dashboard - Easily monitor and download lists of out-of-stock subscribers for seamless management.',
            'catalogx'
        ),
    },
    {
        title: __('Mailchimp Bridge', 'catalogx'),
        description: __(
            'Seamlessly link WooCommerce out-of-stock subscriptions with Mailchimp for effective marketing.',
            'catalogx'
        ),
    },
    {
        title: __('Unsubscribe Notifications', 'catalogx'),
        description: __(
            'User-Initiated Unsubscribe from In-Stock Notifications.',
            'catalogx'
        ),
    },
    {
        title: __('Ban Spam Emails', 'catalogx'),
        description: __(
            'Email and Domain Blacklist for Spam Prevention.',
            'catalogx'
        ),
    },
];
const App = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [selectValue, setSelectValue] = useState('');
    const tourSteps = [];

    const currentTabParams = new URLSearchParams(useLocation().hash);
    document
        .querySelectorAll('#toplevel_page_catalogx>ul>li>a')
        .forEach((menuItem) => {
            const menuItemUrl = new URL((menuItem as HTMLAnchorElement).href);
            const menuItemHashParams = new URLSearchParams(
                menuItemUrl.hash.substring(1)
            );

            if (menuItem.parentNode) {
                (menuItem.parentNode as HTMLElement).classList.remove(
                    'current'
                );
            }
            if (menuItemHashParams.get('tab') === currentTabParams.get('tab')) {
                (menuItem.parentNode as HTMLElement).classList.add('current');
            }
        });

    const handleSearchChange = (value: string) => {
        setQuery(value);

        if (!value.trim()) {
            setResults([]);
            return;
        }

        const lowerValue = value.toLowerCase();

        const filtered = searchIndex.filter((item) => {
            // Filter by dropdown selection
            if (selectValue !== 'all' && item.tab !== selectValue) {
                return false;
            }

            // Case-insensitive search
            const name = item.name?.toLowerCase() || '';
            const desc = item.desc?.toLowerCase() || '';
            return name.includes(lowerValue) || desc.includes(lowerValue);
        });

        setResults(filtered);
    };

    const handleSelectChange = (value: string) => {
        setSelectValue(value);

        if (query.trim()) {
            handleSearchChange(query);
        } else {
            setResults([]);
        }
    };

    const handleResultClick = (item: SearchItem) => {
        window.location.hash = item.link;
        setQuery('');
        setResults([]);
    };

    const profileItems = [
        {
            title: "What's New",
            icon: 'adminfont-new',
            link: 'https://multivendorx.com/latest-release/?utm_source=settings&utm_medium=plugin&utm_campaign=promotion',
            targetBlank: true,
        },
        {
            title: 'Get Support',
            icon: 'adminfont-customer-support',
            link: 'https://multivendorx.com/support-forum/?utm_source=settings&utm_medium=plugin&utm_campaign=promotion',
            targetBlank: true,
        },
        {
            title: 'Community',
            icon: 'adminfont-global-community',
            link: 'https://multivendorx.com/community/?utm_source=settings&utm_medium=plugin&utm_campaign=promotion',
            targetBlank: true,
        },
        {
            title: 'Documentation',
            icon: 'adminfont-book',
            link: 'https://multivendorx.com/docs/knowledgebase/?utm_source=settings&utm_medium=plugin&utm_campaign=promotion',
            targetBlank: true,
        },
        {
            title: 'Request a Feature',
            icon: 'adminfont-blocks',
            link: 'https://github.com/multivendorx/multivendorx/issues',
            targetBlank: true,
        },
        {
            title: 'Import Dummy Data',
            icon: 'adminfont-import',
            link: 'https://multivendorx.com/docs/knowledgebase/importing-dummy-data/?utm_source=settings&utm_medium=plugin&utm_campaign=promotion',
            targetBlank: true,
        },
    ];

    // --- INIT MODULES ---
    useEffect(() => {
        initializeModules(appLocalizer, 'catalogx', 'free', 'modules');
    }, []);

    return (
        <>
            <Banner
                products={products}
                isPro={appLocalizer.khali_dabba}
                proUrl={appLocalizer.pro_url}
                tag="Why Premium"
                buttonText="View Pricing"
                bgCode="#852aff" // backgroud color
                textCode="#fff" // text code
                btnCode="#fff" // button color
                btnBgCode="#e35047" // button backgroud color
            />
            <AdminHeader
                brandImg={Brand}
                query={query}
                results={results}
                onSearchChange={handleSearchChange}
                onResultClick={handleResultClick}
                onSelectChange={handleSelectChange}
                selectValue={selectValue}
                free={appLocalizer.freeVersion}
                pro={appLocalizer.pro_data}
                showDropdown={true}
                dropdownOptions={[
                    { value: 'all', label: 'Modules & Settings' },
                    { value: 'modules', label: 'Modules' },
                    { value: 'settings', label: 'Settings' },
                ]}
                notifications={<HeaderNotification type="notification" />}
                showNotifications={true}
                activities={<HeaderNotification type="activity" />}
                showActivities={true}
                showMessages={false}
                showProfile={false}
                
            />

            {tourSteps.length > 0 && (
                <TourProvider
                    steps={tourSteps}
                    afterOpen={disableBody}
                    beforeClose={enableBody}
                    disableDotsNavigation={true}
                    showNavigation={false}
                    showCloseButton={false}
                >
                    <Tour
                        appLocalizer={(window as any).appLocalizer}
                        gif={gif}
                    />
                </TourProvider>
            )}
            <Route />
        </>
    );
};

export default App;
