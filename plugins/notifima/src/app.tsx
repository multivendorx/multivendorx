import { useLocation } from 'react-router-dom';

import Settings from './components/Settings/Settings';
import SubscribersList from './components/SubscriberList/SubscribersList';
import Managestock from './components/Managestock/Managestock';
import { AdminHeader, Notice } from 'zyra';
import Brand from './assets/images/brand-logo.png';
import { __ } from '@wordpress/i18n';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';

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
		'<b>Double Opt-In:</b> Experience the power of Double Opt-In for our Stock Alert Form - Guaranteed precision in every notification!',
		'notifima'
	),
	__(
		'<b>Your Subscription Hub:</b> Subscription Dashboard - Easily monitor and download lists of out-of-stock subscribers for seamless management.',
		'notifima'
	),
	__(
		'<b>Mailchimp Bridge:</b> Seamlessly link WooCommerce out-of-stock subscriptions with Mailchimp for effective marketing.',
		'notifima'
	),
	__(
		'<b>Unsubscribe Notifications:</b> User-Initiated Unsubscribe from In-Stock Notifications.',
		'notifima'
	),
	__(
		'<b>Ban Spam Emails:</b> Email and Domain Blacklist for Spam Prevention.',
		'notifima'
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
					placeholder: __('Search...', 'notifima')
				}}
                utilityList={utilityList}
            />
            <Route />
        </>
    );
};

export default App;