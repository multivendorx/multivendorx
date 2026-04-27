import { useLocation } from 'react-router-dom';

import Settings from './components/Settings/Settings';
import Synchronization from './components/Synchronization/Synchronization';
import Cohort from './components/Cohort/Cohort';
import Enrollment from './components/Enrollment/Enrollment';
import Courses from './components/Courses/Courses';
import { useState } from 'react';
import { searchIndex, SearchItem } from './searchIndex';
import Brand from './assets/images/brand.png';
import { __ } from '@wordpress/i18n';
import { AdminHeader, Notice } from 'zyra';

const Route = () => {
    const currentTab = new URLSearchParams( useLocation().hash );
    return (
        <>
            { currentTab.get( 'tab' ) === 'settings' && (
                <Settings id={ 'settings' } />
            ) }

            { currentTab.get( 'tab' ) === 'synchronization' && (
                <Synchronization id={ 'synchronization' } />
            ) }
            { currentTab.get( 'tab' ) === 'courses' && <Courses /> }
            { currentTab.get( 'tab' ) === 'enrolments' && <Enrollment /> }
            { currentTab.get( 'tab' ) === 'cohorts' && <Cohort /> }
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
		'<b>Automatic User Synchronization for Moodle™ and WordPress:</b> Synchronizes user accounts between Moodle™ and WordPress, ensuring consistent user management across both platforms without manual intervention.',
		'moowoodle'
	),
];
const isBannerDismissed =
		localStorage.getItem('banner_dismissed') === 'true';

const App = () => {
    const currentTabParams = new URLSearchParams( useLocation().hash );
    const [ query, setQuery ] = useState( '' );
    const [ results, setResults ] = useState< SearchItem[] >( [] );
    const [ selectValue, setSelectValue ] = useState( 'all' );

    document
        .querySelectorAll( '#toplevel_page_moowoodle>ul>li>a' )
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
    // 🔹 Search handlers
    const handleSearchChange = ( value: string ) => {
        setQuery( value );

        if ( ! value.trim() ) {
            setResults( [] );
            return;
        }

        const lowerValue = value.toLowerCase();

        const filtered = searchIndex.filter( ( item ) => {
            // Filter by dropdown selection
            if ( selectValue !== 'all' && item.tab !== selectValue )
                return false;

            // Case-insensitive search
            const name = item.name?.toLowerCase() || '';
            const desc = item.desc?.toLowerCase() || '';
            return name.includes( lowerValue ) || desc.includes( lowerValue );
        } );

        setResults( filtered );
    };

    const handleResultClick = ( item: SearchItem ) => {
        window.location.hash = item.link;
        setQuery( '' );
        setResults( [] );
    };
    const profileItems = [
		{
			title: __("Manage Plan", 'moowoodle'),
			icon: 'person',
			link: 'https://dualcube.com/my-account/',
			targetBlank: true,
		},
        {
			title: __("Contact Support", 'moowoodle'),
			icon: 'user-network-icon',
			// link: 'https://dualcube.com/my-account/',
			targetBlank: true,
		}
	];
    const utilityList = [
		{
			toggleIcon: 'admin-icon adminfont-user-circle',
			tooltipName: __('Support', 'moowoodle'),
			tooltipPosition: 'end',
			items: profileItems,
		},
	];
    return (
        <>
            <AdminHeader
				brandImg={Brand}
				results={results}
				onQueryUpdate={handleSearchChange}
				onResultClick={handleResultClick}
				free={appLocalizer.free_version}
				pro={appLocalizer.pro_data.version}
				utilityList={utilityList}
			/>
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
            <Route />
        </>
    );
};

export default App;
