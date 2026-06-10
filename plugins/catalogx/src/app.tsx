import React, { useEffect, useState} from 'react';
import { useLocation } from 'react-router-dom';

import Settings from './components/Settings/Settings';
import Modules from './components/Modules/Modules';
import EnquiryMessages from './components/EnquiryMessages/enquiryMessages';
import WholesaleUser from './components/WholesaleUser/wholesaleUser.tsx';
import Rules from './components/Rules/Rules';
import { AdminHeader, GuidedTourProvider, Notice, initializeModules } from 'zyra';
import { __ } from '@wordpress/i18n';
import Brand from './assets/images/catalogx-logo.png';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import HelpSupport from './components/HelpSupport/HelpSupport';
import { getTourSteps } from './components/Tour/Tours';
import QuoteRequests from './components/QuoteRequests/QuoteRequests';
import { searchIndex, SearchItem } from './searchIndex';

localStorage.setItem( 'force_catalogx_context_reload', 'true' );

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
	const [results, setResults] = useState<SearchItem[]>([]);
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

	const isBannerDismissed =
		localStorage.getItem('banner_dismissed') === 'true';

    // --- INIT MODULES ---
    useEffect( () => {
        initializeModules( appLocalizer, 'catalogx', 'free', 'modules' );
    }, [] );

    const profileItems = [
		{
			title: __("What's New", 'catalogx'),
			icon: 'new',
			link: '#',
			targetBlank: true,
		},
		{
			title: __('Get Support', 'catalogx'),
			icon: 'customer-support',
			link: '#',
			targetBlank: true,
		},
		{
			title: __('Community', 'catalogx'),
			icon: 'global-community',
			link: '#',
			targetBlank: true,
		},
	];
    const utilityList = [
		{
			toggleIcon: 'admin-icon adminfont-user-circle',
			tooltipName: __('Support', 'catalogx'),
			tooltipPosition: 'end',
			items: profileItems,
		},
	];

	const handleQueryUpdate = ({
		searchValue,
		searchAction,
	}: {
		searchValue: string;
		searchAction?: string;
	}) => {
		if (!searchValue.trim()) {
			setResults([]);
			return;
		}

		const lower = searchValue.toLowerCase();

		const filtered = searchIndex.filter((item) => {
			// Ignore action if "all"
			if (
				searchAction &&
				searchAction !== 'all' &&
				item.tab !== searchAction
			) {
				return false;
			}

			return (
				item.name?.toLowerCase().includes(lower) ||
				item.desc?.toLowerCase().includes(lower)
			);
		});

		setResults(filtered);
	};

	const handleResultClick = (item: SearchItem) => {
		window.location.hash = item.link;
	};

    return (
        <>
            {!isBannerDismissed && (
				<Notice
					uniqueKey="banner"
					type="banner"
					validity="lifetime"
					displayPosition="banner"
					message={bannerItem}
					actionLabel={__('Upgrade Now', 'catalogx')}
					onAction={() => {
						window.location.href = appLocalizer.pro_url;
					}}
				/>
			)}
            <AdminHeader
				brandImg={Brand}
				results={results}
				search={{
					placeholder: __('Search...', 'multivendorx'),
					options: [
						{
							value: 'all',
							label: __('Modules & Settings', 'multivendorx'),
						},
						{
							value: 'modules',
							label: __('Modules', 'multivendorx'),
						},
						{
							value: 'settings',
							label: __('Settings', 'multivendorx'),
						},
					],
				}}
				onQueryUpdate={handleQueryUpdate}
				onResultClick={handleResultClick}
				free={appLocalizer.free_version}
				pro={appLocalizer.pro_data.version}
				utilityList={utilityList}
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
