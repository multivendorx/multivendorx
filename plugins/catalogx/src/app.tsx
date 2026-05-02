import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import Settings from './components/Settings/Settings';
import Modules from './components/Modules/Modules';
import QuoteRequests from './components/QuoteRequests/quoteRequests';
import EnquiryMessages from './components/EnquiryMessages/enquiryMessages';
import WholesaleUser from './components/WholesaleUser/wholesaleUser';
import Rules from './components/Rules/Rules';
import gif from './assets/images/product-page-builder.gif';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { AdminHeader, GuidedTourProvider, Notice, initializeModules } from 'zyra';
import { __ } from '@wordpress/i18n';
import Brand from './assets/images/Brand.png';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import HelpSupport from './components/HelpSupport/HelpSupport';
import { getTourSteps } from './components/Tour/Tours';

const disableBody = ( target: any ) => disableBodyScroll( target );
const enableBody = ( target: any ) => enableBodyScroll( target );
localStorage.setItem( 'force_catalogx_context_reload', 'true' );
interface Products {
    title: string;
    description: string;
}

const Route = () => {
    const currentTab = new URLSearchParams( useLocation().hash );
    return (
        <>
            { currentTab.get( 'tab' ) === 'dashboard' && ( <AdminDashboard /> ) }
            { currentTab.get( 'tab' ) === 'settings' && (
                <Settings id={ 'settings' } />
            ) }
            { currentTab.get( 'tab' ) === 'modules' && <Modules /> }
            { currentTab.get( 'tab' ) === 'quote-requests' && (
                <QuoteRequests />
            ) }
            { currentTab.get( 'tab' ) === 'wholesale-users' && (
                <WholesaleUser />
            ) }
            { currentTab.get( 'tab' ) === 'enquiry-messages' && (
                <EnquiryMessages />
            ) }
            { currentTab.get( 'tab' ) === 'rules' && <Rules /> }
            { currentTab.get( 'tab' ) === 'help-support' && ( <HelpSupport /> ) }
        </>
    );
};
const bannerItem = [
	__(
		'<b>Double Opt-In:</b> Experience the power of Double Opt-In for our Stock Alert Form - guaranteed precision in every notification!',
		'catalogx'
	),
	__(
		'<b>Your Subscription Hub:</b> Subscription Dashboard - easily monitor and download lists of out-of-stock subscribers for seamless management.',
		'catalogx'
	),
	__(
		'<b>Mailchimp Bridge:</b> Seamlessly link WooCommerce out-of-stock subscriptions with Mailchimp for effective marketing.',
		'catalogx'
	),
	__(
		'<b>Unsubscribe Notifications:</b> Allow users to unsubscribe from in-stock notifications whenever they want.',
		'catalogx'
	),
	__(
		'<b>Ban Spam Emails:</b> Prevent spam using email and domain blacklists.',
		'catalogx'
	),
];
const App = () => {
    const currentTabParams = new URLSearchParams( useLocation().hash );
    document
        .querySelectorAll( '#toplevel_page_catalogx>ul>li>a' )
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

    const handleSelectChange = ( val: string ) => {
        setSelectValue( val );
    };

    // --- INIT MODULES ---
    useEffect( () => {
        initializeModules( appLocalizer, 'catalogx', 'free', 'modules' );
    }, [] );

    return (
        <>
            {/* shivam  dynamic banner close */}
            {/* {!isBannerDismissed && ( */}
				<Notice
					uniqueKey="banner"
					type="banner"
					validity="lifetime"
					displayPosition="banner"
					message={bannerItem}
					actionLabel="Upgrade Now"
				/>
			{/* )} */}
            <AdminHeader
				brandImg={Brand}
				// results={results}
				// onQueryUpdate={handleSearchChange}
				// onResultClick={handleResultClick}
				free={appLocalizer.free_version}
				// pro={appLocalizer.pro_data.version}
				// utilityList={utilityList}
			/>
            <GuidedTourProvider
				appLocalizer={appLocalizer}
				steps={getTourSteps(appLocalizer)}
			/>
            <Route />
        </>
    );
};

export default App;
