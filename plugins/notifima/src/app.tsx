import { useLocation } from 'react-router-dom';

import Settings from './components/Settings/Settings';
import SubscribersList from './components/SubscriberList/SubscribersList';
import ManageStock from './components/Managestock/Managestock';
import { AdminHeader, Notice } from 'zyra';
import Brand from './assets/images/brand-logo.png';
import { __ } from '@wordpress/i18n';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import HelpSupport from './components/HelpSupport/HelpSupport';

const Route = () => {
    const currentTab = new URLSearchParams( useLocation().hash );
    return (
        <>
            { currentTab.get( 'tab' ) === 'dashboard' && (
                <AdminDashboard />
            ) }
            { currentTab.get( 'tab' ) === 'settings' && (
                <Settings id={ 'settings' } />
            ) }
            { currentTab.get( 'tab' ) === 'subscribers-list' && (
                <SubscribersList />
            ) }
            { currentTab.get( 'tab' ) === 'inventory-manager' && (
                <ManageStock />
            ) }
             { currentTab.get( 'tab' ) === 'help-support' && (
                <HelpSupport />
            ) }
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
const App = () => {
    const currentTabParams = new URLSearchParams( useLocation().hash );
    document
        .querySelectorAll( '#toplevel_page_notifima>ul>li>a' )
        .forEach( ( menuItem ) => {
            const menuItemUrl = new URL(
                ( menuItem as HTMLAnchorElement ).href
            );
            const menuItemHashParams = new URLSearchParams(
                menuItemUrl.hash.substring( 1 )
            );

            if ( menuItem.parentNode ) {
                ( menuItem.parentNode as HTMLElement ).classList.remove(
                    'current'
                );
            }
            if (
                menuItemHashParams.get( 'tab' ) ===
                currentTabParams.get( 'tab' )
            ) {
                ( menuItem.parentNode as HTMLElement ).classList.add(
                    'current'
                );
            }
        } );

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
						window.location.href = appLocalizer.pro_url;
					}}
				/>
			{/* )} */}
            <AdminHeader
				brandImg={Brand}
				free={appLocalizer.free_version}
			/>
            <Route />
        </>
    );
};

export default App;
