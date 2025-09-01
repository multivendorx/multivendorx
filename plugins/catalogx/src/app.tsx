import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import Settings from './components/Settings/Settings';
import Modules from './components/Modules/Modules';
import QuoteRequests from './components/QuoteRequests/quoteRequests';
import EnquiryMessages from './components/EnquiryMessages/enquiryMessages';
import WholesaleUser from './components/WholesaleUser/wholesaleUser';
import Rules from './components/Rules/Rules';
import gif from './assets/images/product-page-builder.gif';
import { TourProvider } from '@reactour/tour';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { AdminHeader, Banner, Tour, initializeModules } from 'zyra';
import { __ } from '@wordpress/i18n';
import Brand from './assets/images/Brand.png';

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
        </>
    );
};

const products: Products[] = [
    {
        title: __( 'Advanced Enquiries', 'catalogx' ),
        description: __( 'Rich customer-admin messaging system', 'catalogx' ),
    },
    {
        title: __( 'Dynamic Pricing', 'catalogx' ),
        description: __( 'Automated multi-tier price rules', 'catalogx' ),
    },
    {
        title: __( 'Wholesale Sales', 'catalogx' ),
        description: __( 'B2B ordering with bulk discounts', 'catalogx' ),
    },
    {
        title: __( 'Custom Quotes', 'catalogx' ),
        description: __(
            'Speed up sales with personalized quotes.',
            'catalogx'
        ),
    },
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

    useEffect( () => {
        initializeModules( appLocalizer, 'catalogx', 'free', 'modules' );
    }, [] );

    return (
        <>
            <Banner
                products={ products }
                isPro={ appLocalizer.khali_dabba }
                proUrl={ appLocalizer.pro_url }
            />
            <AdminHeader
                brandImg={ Brand }
                // results={ results }
                // free={appLocalizer.freeVersion}
            />
            <TourProvider
                steps={ [] }
                afterOpen={ disableBody }
                beforeClose={ enableBody }
                disableDotsNavigation={ true }
                showNavigation={ false }
                showCloseButton={ false }
            >
                <Tour
                    appLocalizer={ ( window as any ).appLocalizer }
                    gif={ gif }
                />
            </TourProvider>
            <Route />
        </>
    );
};

export default App;
