import { useLocation } from 'react-router-dom';

import Settings from './components/Settings/Settings';

import Modules from './components/Modules/Modules';
import { useEffect } from 'react';
import { initializeModules } from 'zyra';
import Stores from './components/Store/Store';
 './components/Stores/Stores';
localStorage.setItem('force_multivendorx_context_reload', 'true');

const Route = () => {
    const currentTab = new URLSearchParams( useLocation().hash );
    return (
        <>
            { currentTab.get( 'tab' ) === 'marketplace' && (
                <Settings id={ 'marketplace' } />
            ) }
            { currentTab.get( 'tab' ) === 'stores' && (
                <Stores id={ 'store' } />
            ) }
            {currentTab.get('tab') === 'modules' && <Modules />}
        </>
    );
};

const App = () => {
    const currentTabParams = new URLSearchParams( useLocation().hash );
    document
        .querySelectorAll( '#toplevel_page_multivendorx>ul>li>a' )
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

        useEffect(() => {
            initializeModules(appLocalizer, 'multivendorx', 'free','modules');
        }, []);

    return (
        <>
            <Route />
        </>
    );
};

export default App;
