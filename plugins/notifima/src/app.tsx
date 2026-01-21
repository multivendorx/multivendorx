import { useLocation } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import Settings from './components/Settings/Settings';
import { ModuleProvider } from './contexts/ModuleContext';
import SubscribersList from './components/SubscriberList/SubscribersList';
import ManageStock from './components/Managestock/Managestock';
import Brand from './assets/images/brand-logo.png';
import { AdminHeader, Banner } from 'zyra';
import Dashboard from './components/Dashboard/Dashboard';
import { searchIndex, SearchItem } from './searchIndex';

const Route = () => {
    const currentTab = new URLSearchParams(useLocation().hash);
    

    return (
        <>
            {currentTab.get('tab') === 'settings' && (
                <Settings id={'settings'} />
            )}
            {currentTab.get('tab') === 'dashboard' && <Dashboard />}
            {currentTab.get('tab') === 'subscribers-list' && (
                <SubscribersList />
            )}
            {currentTab.get('tab') === 'inventory-manager' && <ManageStock />}
        </>
    );
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
];

interface Products {
    title: string;
    description: string;
}

const products: Products[] = [
    {
        title: __('Double Opt-In', 'notifima'),
        description: __(
            'Experience the power of Double Opt-In for our Stock Alert Form!',
            'notifima'
        ),
    },
    {
        title: __('Your Subscription Hub', 'notifima'),
        description: __(
            'Easily monitor and download lists of out-of-stock subscribers.',
            'notifima'
        ),
    },
];

const App = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchItem[]>([]);
    const [selectValue, setSelectValue] = useState('all');
    const currentTabParams = new URLSearchParams(useLocation().hash);

    document
        .querySelectorAll('#toplevel_page_notifima>ul>li>a')
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

    // 🔹 Search handlers
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

        // Re-run search for current query whenever dropdown changes
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

    return (
        <>
            <Banner
                products={products}
                isPro={appLocalizer.khali_dabba}
                proUrl={appLocalizer.pro_url}
                tag="Why Premium"
                buttonText="View Pricing"
                bgCode="#852aff"
                textCode="#fff"
                btnCode="#fff"
                btnBgCode="#e35047"
            />
            <AdminHeader
                brandImg={Brand}
                query={query}
                results={results}
                // free={appLocalizer.freeVersion}
                // pro={appLocalizer.pro_data.version}
                free={appLocalizer.freeVersion}
                pro={appLocalizer.pro_data?.version}
                managePlanUrl={appLocalizer.pro_data?.manage_plan_url}
                onSearchChange={handleSearchChange}
                onResultClick={handleResultClick}
                onSelectChange={handleSelectChange}
                selectValue={selectValue}
                profileItems={profileItems}
            />

            <ModuleProvider
                modules={(window as any).appLocalizer?.active_modules || []}
            >
                <Route />
            </ModuleProvider>
        </>
    );
};

export default App;
