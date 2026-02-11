// External Dependencies
import React, { useState, useEffect, ReactNode, JSX } from 'react';
import { LinkProps } from 'react-router-dom';

// Internal Dependencies
import '../styles/web/Tabs.scss';
import AdminBreadcrumbs from './AdminBreadcrumbs';

type Content = {
    id: string;
    name: string;
    desc?: string;
    count?: string;
    tabTitle?: string;
    tabDes?: string;
    icon?: string;
    link?: string;
    hideTabHeader?: boolean;
    proDependent?: boolean;
};

type TabContent = {
    name?: string;
    type: 'file' | 'folder' | 'heading';
    content: Content | TabContent[];
};

type BreadcrumbItem = { name: string; id: string; type: string };

type SupportItem = {
    id: string;
    title: string;
    description?: string;
    link?: string;
};

type AppLocalizer = {
    khali_dabba?: boolean;
    shop_url?: string;
};

type TabsProps = {
    tabContent: TabContent[];
    currentTab: string;
    getForm: ( tabId: string ) => ReactNode;
    prepareUrl: ( tabId: string ) => string;
    HeaderSection?: () => JSX.Element;
    BannerSection?: () => JSX.Element;
    supprot: SupportItem[];
    Link: React.ElementType< LinkProps >;
    settingName?: string;
    onNavigate?: ( url: string ) => void;
    tabTitleSection?: React.ReactNode;
    appLocalizer: AppLocalizer;
    submenuRender?: boolean;
    menuIcon?: boolean;
    desc?: boolean;
    variant?: 'default' | 'compact' | 'card';
    hideBreadcrumb?: boolean;
    action?: React.ReactNode;
    hideTitle?: boolean;
    premium?: boolean;
};

// Helper functions outside component to avoid recreation on every render
const isFile = ( item: TabContent ): item is TabContent & { content: Content } => {
    return item.type === 'file';
};

const isFolder = (
    item: TabContent
): item is TabContent & { content: TabContent[] } => {
    return item.type === 'folder';
};

const findFirstFile = ( items: TabContent[] ): Content | null => {
    for ( const item of items ) {
        if ( isFile( item ) ) {
            return item.content;
        }
        if ( isFolder( item ) ) {
            const found = findFirstFile( item.content );
            if ( found ) {
                return found;
            }
        }
    }
    return null;
};

const findTabIcon = ( items: TabContent[], activeTabId: string ): string => {
    for ( const item of items ) {
        if ( isFile( item ) && item.content.id === activeTabId ) {
            return item.content.icon as string;
        }
        if ( isFolder( item ) ) {
            const icon = findTabIcon( item.content, activeTabId );
            if ( icon ) {
                return icon;
            }
        }
    }
    return '';
};

const checkIfFolderContainsTab = (
    items: TabContent[],
    activeTabId: string
): boolean => {
    return items.some( ( item ) => {
        if ( isFile( item ) ) {
            return item.content.id === activeTabId;
        }
        if ( isFolder( item ) ) {
            return checkIfFolderContainsTab( item.content, activeTabId );
        }
        return false;
    } );
};

const findTabDescription = (
    items: TabContent[],
    activeTabId: string
): ReactNode => {
    for ( const item of items ) {
        if ( isFile( item ) && item.content.id === activeTabId ) {
            const tab = item.content;
            if ( tab.id === 'support' ) {
                return null;
            }
            const desc =
                tab.tabDes && tab.tabDes.trim() ? tab.tabDes : tab.desc ?? '';
            return (
                ! tab.hideTabHeader && (
                    <div className="divider-wrapper" key={ tab.id }>
                        <div className="divider-section">
                            { tab.name && (
                                <div className="title">
                                    { tab.tabTitle ?? tab.name }
                                </div>
                            ) }
                            { tab.desc && (
                                <div
                                    className="desc"
                                    dangerouslySetInnerHTML={ { __html: desc } }
                                ></div>
                            ) }
                        </div>
                    </div>
                )
            );
        }

        if ( isFolder( item ) ) {
            const desc = findTabDescription( item.content, activeTabId );
            if ( desc ) {
                return desc;
            }
        }
    }
    return null;
};

// Helper function to search for breadcrumb path
const searchForBreadcrumbPath = (
    items: TabContent[],
    targetId: string,
    currentPath: BreadcrumbItem[]
): BreadcrumbItem[] | null => {
    for ( const item of items ) {
        if ( isFile( item ) && item.content.id === targetId ) {
            return [
                ...currentPath,
                {
                    name: item.content.name,
                    id: targetId,
                    type: 'file',
                },
            ];
        }

        if ( isFolder( item ) ) {
            const folderPath = {
                name: item.name || '',
                id: item.name || '',
                type: 'folder',
            };
            const result = searchForBreadcrumbPath( item.content, targetId, [
                ...currentPath,
                folderPath,
            ] );
            if ( result ) {
                return result;
            }
        }
    }
    return null;
};

const Tabs: React.FC< TabsProps > = ( {
    tabContent,
    currentTab,
    getForm,
    prepareUrl,
    HeaderSection,
    Link,
    settingName = '',
    onNavigate,
    tabTitleSection,
    appLocalizer,
    submenuRender,
    variant = 'default',
    menuIcon,
    desc,
    hideBreadcrumb,
    action,
    hideTitle,
    premium,
} ) => {
    const [ activeTab, setActiveTab ] = useState( currentTab );
    const [ menuStack, setMenuStack ] = useState< TabContent[][] >( [ tabContent ] );
    const [ breadcrumbs, setBreadcrumbs ] = useState< BreadcrumbItem[] >( [
        { name: settingName, id: 'root', type: 'root' },
    ] );

    // Build breadcrumb path for a tab
    const createBreadcrumbPath = ( targetId: string ): BreadcrumbItem[] => {
        const path = searchForBreadcrumbPath( tabContent, targetId, [] );
        return path || [];
    };

    // Build menu stack from breadcrumb path
    const createMenuStack = (
        breadcrumbPath: BreadcrumbItem[]
    ): TabContent[][] => {
        const stack = [ tabContent ];
        let currentItems = tabContent;

        for ( let i = 0; i < breadcrumbPath.length - 1; i++ ) {
            const crumb = breadcrumbPath[ i ];
            if ( crumb.type === 'folder' ) {
                const folder = currentItems.find(
                    ( item ) => isFolder( item ) && item.name === crumb.id
                );
                if ( folder && isFolder( folder ) ) {
                    currentItems = folder.content;
                    stack.push( currentItems );
                }
            }
        }
        return stack;
    };

    // Update all navigation state
    const updateNavigationState = ( tabId: string ): void => {
        const path = createBreadcrumbPath( tabId );

        if ( path.length > 0 ) {
            const fullPath = [
                { name: settingName, id: 'root', type: 'root' },
                ...path,
            ];
            setBreadcrumbs( fullPath );
            setMenuStack( createMenuStack( path ) );
        } else {
            setBreadcrumbs( [
                { name: settingName, id: 'root', type: 'root' },
            ] );
            setMenuStack( [ tabContent ] );
        }
    };

    // Switch to any tab and navigate
    const switchToTab = ( tabId: string ): void => {
        setActiveTab( tabId );
        updateNavigationState( tabId );

        // Navigate to the new URL
        const newUrl = prepareUrl( tabId );
        if ( onNavigate ) {
            onNavigate( newUrl );
        } else {
            // Fallback: use window.history if onNavigate not provided
            window.history.pushState( null, '', newUrl );
        }
    };

    // Open folder and go to first file
    const openFolderAndNavigate = ( folderItems: TabContent[] ): void => {
        if ( folderItems.length === 0 ) {
            return;
        }

        setMenuStack( ( prev ) => [ ...prev, folderItems ] );
        const firstFile = findFirstFile( folderItems );
        if ( firstFile ) {
            switchToTab( firstFile.id );
        }
    };

    // Go back to root menu
    const goToRootMenu = (): void => {
        setMenuStack( [ tabContent ] );
        setBreadcrumbs( [ { name: settingName, id: 'root', type: 'root' } ] );

        const firstFile = findFirstFile( tabContent );
        if ( firstFile ) {
            switchToTab( firstFile.id );
        } else {
            setActiveTab( '' );
        }
    };

    // Navigate to folder at breadcrumb level
    const navigateToFolderLevel = ( targetIndex: number ): void => {
        let currentItems = tabContent;

        for ( let i = 1; i <= targetIndex; i++ ) {
            const folder = currentItems.find(
                ( item ) =>
                    isFolder( item ) && item.name === breadcrumbs[ i ].id
            );
            if ( folder && isFolder( folder ) ) {
                currentItems = folder.content;
            }
        }

        setMenuStack( ( prev ) => [
            ...prev.slice( 0, targetIndex ),
            currentItems,
        ] );
        const firstFile = findFirstFile( currentItems );
        if ( firstFile ) {
            switchToTab( firstFile.id );
        }
    };

    // Handle breadcrumb clicks
    const handleBreadcrumbNavigation = (
        index: number,
        e: React.MouseEvent
    ): void => {
        e.preventDefault(); // Only prevent default here since we're handling navigation manually
        const crumb = breadcrumbs[ index ];
        if ( ! crumb ) {
            return;
        }

        if ( crumb.type === 'root' ) {
            goToRootMenu();
        } else if ( crumb.type === 'file' ) {
            switchToTab( crumb.id );
        } else if ( crumb.type === 'folder' ) {
            navigateToFolderLevel( index );
        }
    };

    // Get current tab's icon
    const getCurrentTabIcon = (): string => {
        return findTabIcon( tabContent, activeTab );
    };

    // Check if folder is currently active
    const isFolderCurrentlyActive = ( folderItems: TabContent[] ): boolean => {
        return (
            menuStack[ menuStack.length - 1 ] === folderItems ||
            checkIfFolderContainsTab( folderItems, activeTab )
        );
    };

    // Render breadcrumb links
    const renderBreadcrumbLinks = () =>
        breadcrumbs.map( ( crumb, index ) => (
            <span key={ index }>
                { index > 0 && ' / ' }
                <Link
                    to={ crumb.type === 'file' ? prepareUrl( crumb.id ) : '#' }
                    onClick={ ( e ) => handleBreadcrumbNavigation( index, e ) }
                >
                    { crumb.name }
                </Link>
            </span>
        ) );

    // Render single menu item
    const renderSingleMenuItem = ( item: TabContent, index: number ) => {
        if ( item.type === 'heading' ) {
            return (
                <div
                    key={ `heading-${ item.name }-${ index }` }
                    className="tab-heading"
                >
                    { item.name }
                </div>
            );
        }

        if ( isFile( item ) ) {
            const tab = item.content;
            if ( ! tab.id || ! tab.name ) {
                return null;
            }

            return (
                <Link
                    key={ tab.id }
                    to={ prepareUrl( tab.id ) }
                    className={ `tab ${
                        activeTab === tab.id ? 'active-tab' : ''
                    }` }
                    onClick={ ( e ) => {
                        // For file items, let the Link handle navigation naturally
                        // Only prevent default if we need to do additional processing
                        if ( e.button === 0 && ! e.metaKey && ! e.ctrlKey ) {
                            e.preventDefault();
                            switchToTab( tab.id );
                        }
                    } }
                >
                    { /* <p className="tab-name">{tab.name}</p> */ }
                    <p className="tab-name">
                        { menuIcon && tab.icon && (
                            <i className={ `adminfont-${ tab.icon }` }></i>
                        ) }
                        <span>{ tab.count }</span>
                        { tab.name }
                    </p>
                    { desc && <div className="des">{ tab.desc }</div> }
                </Link>
            );
        }

        if ( isFolder( item ) ) {
            const folderItems = item.content;
            if ( folderItems.length === 0 ) {
                return null;
            }

            const firstFile = findFirstFile( folderItems );
            const folderUrl = firstFile ? prepareUrl( firstFile.id ) : '#';
            const isActive = isFolderCurrentlyActive( folderItems );

            return (
                <Link
                    key={ `folder-${ item.name || '' }-${ index }` }
                    to={ folderUrl }
                    className={ `tab ${
                        isActive ? 'active-tab' : ''
                    }` }
                    onClick={ ( e ) => {
                        if (
                            firstFile &&
                            e.button === 0 &&
                            ! e.metaKey &&
                            ! e.ctrlKey
                        ) {
                            e.preventDefault();
                            openFolderAndNavigate( folderItems );
                        }
                    } }
                >
                    <p className="tab-name">{ item.name }</p>
                </Link>
            );
        }

        return null;
    };

    // Render all menu items
    const renderAllMenuItems = ( items: TabContent[] ) =>
        items.map( renderSingleMenuItem );

    // Get active tab description
    const getActiveTabInfo = () => findTabDescription( tabContent, activeTab );

    // Setup initial state
    useEffect( () => {
        if ( currentTab ) {
            // Update state without navigation for initial load
            setActiveTab( currentTab );
            updateNavigationState( currentTab );
        } else {
            const firstFile = findFirstFile( tabContent );
            if ( firstFile ) {
                switchToTab( firstFile.id );
            }
        }
    }, [ currentTab, tabContent ] );

    const currentMenu = menuStack[ menuStack.length - 1 ];

    const findTabName = ( items: TabContent[], activeTabId: string ): string => {
        for ( const item of items ) {
            if ( isFile( item ) && item.content.id === activeTabId ) {
                return item.content.name;
            }
            if ( isFolder( item ) ) {
                const name = findTabName( item.content, activeTabId );
                if ( name ) {
                    return name;
                }
            }
        }
        return '';
    };

    const parentTab = findTabName( tabContent, activeTab ) || '';

    const tabIcon = getCurrentTabIcon();
    return (
        <>
            { tabTitleSection && <>{ tabTitleSection }</> }

            <AdminBreadcrumbs
                activeTabIcon={tabIcon}
                tabTitle={parentTab}
                variant={variant}
                renderBreadcrumb={renderBreadcrumbLinks}
                renderMenuItems={renderAllMenuItems}
                tabContent={tabContent}
                goPremiumLink={ !appLocalizer.khali_dabba ? appLocalizer.shop_url: '' }
            />


            <div className="general-wrapper admin-settings" data-template={variant}>
                { HeaderSection && <HeaderSection /> }
                { menuStack.length > 1 && (
                    <div id="tabs-wrapper" className="tabs-wrapper">
                        <div className="tabs-item">
                            { renderAllMenuItems( currentMenu ) }
                        </div>
                    </div>
                ) }

                <div className="tab-content">
                    { getActiveTabInfo() }
                    { getForm( activeTab ) }
                </div>
            </div>
        </>
    );
};

export default Tabs;