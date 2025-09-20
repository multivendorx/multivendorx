import { useLocation } from 'react-router-dom';

import Settings from './components/Settings/Settings';
import Synchronization from './components/Synchronization/Synchronization';
import Cohort from './components/Cohort/Cohort';
import Enrollment from './components/Enrollment/Enrollment';
import Courses from './components/Courses/Courses';
import { AdminHeader, Banner } from 'zyra';
import { useState } from 'react';
import { searchIndex, SearchItem } from './searchIndex';
import Brand from './assets/images/brand.png';
import { __ } from '@wordpress/i18n';

interface Products {
    title: string;
    description: string;
    icon?: string;
}
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
        icon: __( 'adminlib-support', 'moowoodle' ),
    },
    {
        title: __( 'Convenient Single Sign-On login', 'moowoodle' ),
        description: __(
            'SSO enables students to access their purchased courses without the need to log in separately to the Moodle site.',
            'moowoodle'
        ),
        icon: __( 'adminlib-support', 'moowoodle' ),
    },
    {
        title: __( 'Steady Income through Course Subscriptions', 'moowoodle' ),
        description: __(
            'Generate consistent revenue by offering courses with subscription-based model.',
            'moowoodle'
        ),
        icon: __( 'adminlib-support', 'moowoodle' ),
    },
    {
        title: __( 'Synchronize Courses in Bulk', 'moowoodle' ),
        description: __(
            'Effortlessly synchronize multiple courses at once, ideal for managing large course catalogs.',
            'moowoodle'
        ),
        icon: __( 'adminlib-support', 'moowoodle' ),
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
        icon: __( 'adminlib-support', 'moowoodle' ),
    },
];

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

    const handleSelectChange = ( value: string ) => {
        setSelectValue( value );

        // Re-run search for current query whenever dropdown changes
        if ( query.trim() ) {
            handleSearchChange( query );
        } else {
            setResults( [] );
        }
    };

    const handleResultClick = ( item: SearchItem ) => {
        window.location.hash = item.link;
        setQuery( '' );
        setResults( [] );
    };
    return (
        <>
            <Banner
                products={ products }
                isPro={ appLocalizer.khali_dabba }
                proUrl={ appLocalizer.shop_url }
                tag="Why Premium"
                buttonText="View Pricing"
                bgCode="#852aff"
                textCode="#fff"
                btnCode="#fff"
                btnBgCode="#e35047"
            />
            <AdminHeader
                brandImg={ Brand }
                query={ query }
                results={ results }
                onSearchChange={ handleSearchChange }
                onResultClick={ handleResultClick }
                onSelectChange={ handleSelectChange }
                selectValue={ selectValue }
                free={ appLocalizer.free_version }
                pro={ appLocalizer.pro_data.version }
                showProfile={ true }
                chatUrl={ appLocalizer.chat_url }
                managePlanUrl={ appLocalizer.pro_data.manage_plan_url }
            />
            <Route />
        </>
    );
};

export default App;
