/**
 * External dependencies
 */
import { LinkProps } from 'react-router-dom';
import { useState, useEffect, ReactNode, useCallback } from 'react';

/**
 * Internal dependencies
 */
import AdminFooter, { SupportLink } from './AdminFooter';
import '../styles/web/Tabs.scss';

// Types
type TabContent = {
    id: string;
    name: string;
    desc?: string;
    icon?: string;
    link?: string;
    proDependent?: boolean;
};

type TabData = {
    name?: string;
    type: 'file' | 'folder';
    content: TabContent | TabData[];
};

type TabsProps = {
    tabData: TabData[];
    currentTab: string;
    getForm: (currentTab: string) => ReactNode;
    prepareUrl: (tabId: string) => string;
    HeaderSection?: () => JSX.Element;
    BannerSection?: () => JSX.Element;
    horizontally?: boolean;
    appLocalizer: any;
    brandImg: string;
    smallbrandImg: string;
    supprot: SupportLink[];
    Link: React.ElementType<LinkProps>;
};

type BreadcrumbItem = { name: string; id: string; type: string; };
type PathResult = { path: BreadcrumbItem[]; stack: TabData[][]; };

const Tabs: React.FC<TabsProps> = ({
    tabData, currentTab, getForm, prepareUrl, HeaderSection, BannerSection,
    horizontally, appLocalizer, brandImg, smallbrandImg, supprot, Link,
}) => {
    const [menuCol, setMenuCol] = useState(false);
    const [activeTab, setActiveTab] = useState<string>(currentTab);
    const [menuStack, setMenuStack] = useState<TabData[][]>([tabData]);
    const [breadcrumbPath, setBreadcrumbPath] = useState<BreadcrumbItem[]>([
        { name: 'All Settings', id: 'all-settings', type: 'root' },
    ]);

    const findFirstFile = useCallback((items: TabData[]): TabContent | null => {
        for (const item of items) {
            if (item.type === 'file') return item.content as TabContent;
            if (item.type === 'folder') {
                const found = findFirstFile(item.content as TabData[]);
                if (found) return found;
            }
        }
        return null;
    }, []);

    const buildPathToTab = useCallback((
        data: TabData[], tabId: string, path: BreadcrumbItem[] = [], stack: TabData[][] = [data]
    ): PathResult | null => {
        for (const item of data) {
            if (item.type === 'file') {
                const file = item.content as TabContent;
                if (file.id === tabId) {
                    return { path: [...path, { name: file.name, id: file.id, type: 'file' }], stack };
                }
            } else if (item.type === 'folder') {
                const folderItems = item.content as TabData[];
                const result = buildPathToTab(folderItems, tabId,
                    [...path, { name: item.name ?? '', id: item.name ?? '', type: 'folder' }],
                    [...stack, folderItems]
                );
                if (result) return result;
            }
        }
        return null;
    }, []);

    const updateActiveTab = useCallback((tabId: string) => {
        setActiveTab(tabId);
        window.history.pushState(null, '', prepareUrl(tabId));
    }, [prepareUrl]);

    const updateBreadcrumbAndStack = useCallback((result: PathResult | null, isTopLevel = false) => {
        if (result) {
            setMenuStack(isTopLevel ? [tabData] : result.stack);
            setBreadcrumbPath([{ name: 'All Settings', id: 'all-settings', type: 'root' }, ...result.path]);
        }
    }, [tabData]);

    const navigateToTab = useCallback((tabId: string) => {
        updateActiveTab(tabId);
        const result = buildPathToTab(tabData, tabId);
        const isTopLevelFile = tabData.some(topItem => topItem.type === 'file' && (topItem.content as TabContent).id === tabId);
        updateBreadcrumbAndStack(result, isTopLevelFile);
    }, [tabData, buildPathToTab, updateActiveTab, updateBreadcrumbAndStack]);

    const openSubmenu = useCallback((folderName: string, items: TabData[]) => {
        const hasValidChildren = items.some(item => item.type === 'file' || (item.type === 'folder' && (item.content as TabData[]).length > 0));
        if (!hasValidChildren) return;
        setMenuStack((prev) => [...prev, items]);
        const firstFile = findFirstFile(items);
        if (firstFile) {
            updateActiveTab(firstFile.id);
            const result = buildPathToTab(tabData, firstFile.id);
            updateBreadcrumbAndStack(result);
        }
    }, [findFirstFile, buildPathToTab, updateActiveTab, updateBreadcrumbAndStack, tabData]);

    const resetToRoot = useCallback(() => {
        setMenuStack([tabData]);
        setBreadcrumbPath([{ name: 'All Settings', id: 'all-settings', type: 'root' }]);
        const firstFile = findFirstFile(tabData);
        if (firstFile) {
            updateActiveTab(firstFile.id);
        } else {
            setActiveTab('');
            window.history.pushState(null, '', prepareUrl(''));
        }
    }, [tabData, findFirstFile, updateActiveTab, prepareUrl]);

    const findFolderInData = useCallback((items: TabData[], name: string): TabData[] | null => {
        for (const item of items) {
            if (item.type === 'folder' && item.name === name) return item.content as TabData[];
            if (item.type === 'folder') {
                const result = findFolderInData(item.content as TabData[], name);
                if (result) return result;
            }
        }
        return null;
    }, []);

    const goToBreadcrumb = useCallback((index: number) => {
        const crumb = breadcrumbPath[index];
        if (!crumb) return;
        if (crumb.type === 'root') { resetToRoot(); return; }
        if (crumb.type === 'folder') {
            const folderItems = findFolderInData(tabData, crumb.id);
            if (folderItems) {
                setMenuStack((prev) => [...prev.slice(0, index), folderItems]);
                const firstFile = findFirstFile(folderItems);
                if (firstFile) {
                    updateActiveTab(firstFile.id);
                    const result = buildPathToTab(tabData, firstFile.id);
                    updateBreadcrumbAndStack(result);
                }
            }
        } else {
            updateActiveTab(crumb.id);
            const result = buildPathToTab(tabData, crumb.id);
            if (result) {
                setMenuStack(result.stack);
                setBreadcrumbPath([{ name: 'All Settings', id: 'all-settings', type: 'root' }, ...result.path]);
            }
        }
    }, [breadcrumbPath, resetToRoot, findFolderInData, tabData, findFirstFile, updateActiveTab, buildPathToTab, updateBreadcrumbAndStack]);

    const renderBreadcrumb = useCallback(() => breadcrumbPath.map((crumb, index) => (
        <span key={index}>
            {index > 0 && ' / '}
            <Link to={crumb.type === 'file' ? prepareUrl(crumb.id) : '#'} onClick={(e) => { 
                e.preventDefault();
                // goToBreadcrumb(index);
             }}>
                {crumb.name}
            </Link>
        </span>
    )), [breadcrumbPath, prepareUrl, goToBreadcrumb, Link]);
    const getActiveTabIcon = useCallback((data: TabData[]): string | undefined => {
        for (const item of data) {
            if (item.type === 'file') {
                const tab = item.content as TabContent;
                if (tab.id === activeTab) return tab.icon;
            }
            if (item.type === 'folder') {
                const icon = getActiveTabIcon(item.content as TabData[]);
                if (icon) return icon;
            }
        }
        return undefined;
    }, [activeTab]);
    const checkIfFolderHasActiveTab = useCallback((items: TabData[]): boolean => {
        for (const item of items) {
            if (item.type === 'file' && (item.content as TabContent).id === activeTab) return true;
            if (item.type === 'folder' && checkIfFolderHasActiveTab(item.content as TabData[])) return true;
        }
        return false;
    }, [activeTab]);

    const renderMenuItem = useCallback((item: TabData, index: number) => {
        if (item.type === 'file') {
            const tab = item.content as TabContent;
            return (
                <div key={tab.id} className={`menu-item ${activeTab === tab.id ? 'active-current-tab' : ''}`} onClick={() => navigateToTab(tab.id)}>
                    <Link to={prepareUrl(tab.id)}>
                        <p className="menu-name">{menuCol ? null : tab.name}</p>
                    </Link>
                </div>
            );
        }
        if (item.type === 'folder') {
            const folderName = item.name ?? '';
            const folderContent = item.content as TabData[];
            const firstFile = findFirstFile(folderContent);
            const folderUrl = firstFile ? prepareUrl(firstFile.id) : '#';
            const isCurrentFolderOpen = menuStack.length > 1 && menuStack[menuStack.length - 1] === folderContent;
            const isActiveFolder = isCurrentFolderOpen || checkIfFolderHasActiveTab(folderContent);
        
            return (
                <Link
                    key={`folder-${folderName}-${index}`}
                    to={folderUrl}
                    className={`menu-item ${isActiveFolder ? 'active-current-tab' : ''}`}
                    onClick={(e) => {
                        if (firstFile && e.button === 0 && !e.metaKey && !e.ctrlKey) {
                            e.preventDefault();
                            openSubmenu(folderName, folderContent);
                        }
                    }}
                >
                    <p className="menu-name">{menuCol ? null : folderName}</p>
                </Link>
            );
        }
        
        return null;
    }, [activeTab, menuCol, navigateToTab, prepareUrl, Link, menuStack, checkIfFolderHasActiveTab, openSubmenu]);

    const renderMenuItems = useCallback((items: TabData[]) => items.map(renderMenuItem), [renderMenuItem]);

    const getTabDescription = useCallback((tabDataVal: TabData[]): JSX.Element[] => {
        return tabDataVal.flatMap(({ content, type }) => {
            if (type === 'file') {
                const tab = content as TabContent;
                return tab.id === activeTab && tab.id !== 'support' ? (
                    <div className="divider-section" key={tab.id}>
                        <div className="title">{tab.name}</div><div className="desc">{tab.desc}</div>
                    </div>
                ) : [];
            }
            if (type === 'folder') return getTabDescription(content as TabData[]);
            return [];
        });
    }, [activeTab]);

    useEffect(() => {
        if (currentTab) {
            setActiveTab(currentTab);
            const result = buildPathToTab(tabData, currentTab);
            updateBreadcrumbAndStack(result);
        } else {
            const firstFile = findFirstFile(tabData);
            if (firstFile) setActiveTab(firstFile.id);
        }
    }, [currentTab, tabData, buildPathToTab, updateBreadcrumbAndStack, findFirstFile]);

    const currentMenuItems = menuStack[menuStack.length - 1];
    const parentTabName = breadcrumbPath.length > 1 ? breadcrumbPath[breadcrumbPath.length - 2]?.name : '';
    const activeTabIcon = getActiveTabIcon(tabData);

    return (
        <>
            <div className="top-header">
                <div className="left-section">
                    <img className="brand-logo" src={menuCol ? smallbrandImg : brandImg} alt="Logo" />
                </div>
                <div className="right-section">
                    <div className="search-field">
                        <i className="adminlib-search"></i>
                        <input type="text" className="basic-input" placeholder="Search Here" />
                    </div>
                    <i className="admin-icon adminlib-storefront"></i>
                    <i className="admin-icon adminlib-storefront"></i>
                    <a href="#" className="admin-btn btn-purple">Buy Now</a>
                </div>
            </div>
            <div className="admin-breadcrumbs">
                <div className="breadcrumbs-title">
                    {activeTabIcon && <i className={activeTabIcon}></i>}
                    {parentTabName}
                </div>
                <p className="breadcrumbs-menu">{renderBreadcrumb()}</p>
                <div id="top-level-tab-lists" className="current-tab-lists">
                    <div className="current-tab-lists-container">{renderMenuItems(tabData)}</div>
                </div>
            </div>
            <div className="general-wrapper">
                {HeaderSection && <HeaderSection />}
                {BannerSection && <BannerSection />}
                <div className={`${menuCol ? 'show-menu' : ''} middle-child-container`}>
                    {menuStack.length > 1 && (
                        <div id="current-tab-lists" className="current-tab-lists">
                            <div className="current-tab-lists-container">{renderMenuItems(currentMenuItems)}</div>
                        </div>
                    )}
                    <div className="tab-content">
                        {getTabDescription(tabData)}
                        {getForm(activeTab)}
                    </div>
                </div>
                {/* <AdminFooter supportLink={supprot} /> */}
            </div>
        </>
    );
};

export default Tabs;