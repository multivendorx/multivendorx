import { useLocation } from 'react-router-dom';

import Settings from './components/Settings/Settings';
import SubscribersList from './components/SubscriberList/SubscribersList';
import { AdminHeader, Notice } from 'zyra';
import Brand from './assets/images/brand-logo.png';
import { __ } from '@wordpress/i18n';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import Managestock from './components/Managestock/Managestock';

const Route = () => {
    const currentTab = new URLSearchParams(useLocation().hash);
    return (
        <>
            {currentTab.get('tab') === 'dashboard' && (
                <AdminDashboard />
            )}
            {currentTab.get('tab') === 'settings' && (
                <Settings id={'settings'} />
            )}
            {currentTab.get('tab') === 'subscribers-list' && (
                <SubscribersList />
            )}
            {currentTab.get('tab') === 'inventory-manager' && (
                <Managestock />
            )}
        </>
    );
};
const bannerItem = [
	__(
		'<b>Automated user and course synchronization with scheduler:</b> Utilize personalized scheduling options to synchronize users and courses between WordPress and Moodle.',
		'moowoodle'
	),
	__(
		'<b>Convenient Single Sign-On login:</b> SSO enables students to access their purchased courses without the need to log in separately to the Moodle site.',
		'moowoodle'
	),
	__(
		'<b>Steady Income through Course Subscriptions:</b> Generate consistent revenue by offering courses with subscription-based model.',
		'moowoodle'
	),
	__(
		'<b>Synchronize Courses in Bulk:</b> Effortlessly synchronize multiple courses at once, ideal for managing large course catalogs.',
		'moowoodle'
	),
	__(
		'<b>Automatic User Synchronization for Moodle™ and WordPress:</b>Syncs users between Moodle™ and WordPress for seamless account management across both platforms.',
		'moowoodle'
	),
];
const profileItems = [
		{
			title: __("What's New", 'notifima'),
			icon: 'new',
			link: 'https://multivendorx.com/latest-release/?utm_source=settings&utm_medium=plugin&utm_campaign=promotion',
			targetBlank: true,
		},
		{
			title: __('Get Support', 'notifima'),
			icon: 'customer-support',
			link: 'https://multivendorx.com/support-forum/?utm_source=settings&utm_medium=plugin&utm_campaign=promotion',
			targetBlank: true,
		},
		{
			title: __('Community', 'notifima'),
			icon: 'global-community',
			link: 'https://multivendorx.com/community/?utm_source=settings&utm_medium=plugin&utm_campaign=promotion',
			targetBlank: true,
		},
		{
			title: __('Documentation', 'notifima'),
			icon: 'knowledgebase',
			link: 'https://multivendorx.com/docs/knowledgebase/?utm_source=settings&utm_medium=plugin&utm_campaign=promotion',
			targetBlank: true,
		}
	];
const utilityList = [
    {
        toggleIcon: 'admin-icon adminfont-user-circle',
        tooltipName: __('Support', 'notifima'),
        tooltipPosition: 'end',
        items: profileItems,
    },
];
const App = () => {
    const currentTabParams = new URLSearchParams(useLocation().hash);
    document
        .querySelectorAll('#toplevel_page_notifima>ul>li>a')
        .forEach((menuItem) => {
            const menuItemUrl = new URL(
                (menuItem as HTMLAnchorElement).href
            );
            const menuItemHashParams = new URLSearchParams(
                menuItemUrl.hash.substring(1)
            );

            if (menuItem.parentNode) {
                (menuItem.parentNode as HTMLElement).classList.remove(
                    'current'
                );
            }
            if (
                menuItemHashParams.get('tab') ===
                currentTabParams.get('tab')
            ) {
                (menuItem.parentNode as HTMLElement).classList.add(
                    'current'
                );
            }
        });

    return (
        <>
            {/* {!isBannerDismissed && ( */}
            <Notice
                uniqueKey="banner"
                type="banner"
                validity="lifetime"
                displayPosition="banner"
                message={bannerItem}
                actionLabel="Upgrade Now"
                onAction={() => {
                    window.location.assign(appLocalizer.pro_url);
                }}
            />
            {/* )} */}
            <AdminHeader
                brandImg={Brand}
                free={appLocalizer.free_version}
                pro={appLocalizer.pro_data.version}
                search={{
					placeholder: __('Search...', 'multivendorx')
				}}
                utilityList={utilityList}
            />
            <Route />
        </>
    );
};

export default App;
