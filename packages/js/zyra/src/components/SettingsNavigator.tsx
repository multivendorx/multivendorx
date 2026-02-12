import React, { useState, useEffect, useMemo, ReactNode, JSX } from 'react';
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

type SettingsNavigatorProps = {
    tabContent: TabContent[];
    currentTab: string;
    getForm: (tabId: string) => ReactNode;
    prepareUrl: (tabId: string) => string;
    HeaderSection?: () => JSX.Element;
    Link: React.ElementType<LinkProps>;
    settingName?: string;
    onNavigate?: (url: string) => void;
    tabTitleSection?: React.ReactNode;
    appLocalizer: { khali_dabba?: boolean; shop_url?: string };
    menuIcon?: boolean;
    desc?: boolean;
    variant?: 'default' | 'compact' | 'card';
    action?: React.ReactNode;
};

// Typesafe check helpers
const isFile = (item: TabContent): item is TabContent & { content: Content } => item.type === 'file';
const isFolder = (item: TabContent): item is TabContent & { content: TabContent[] } => item.type === 'folder';

const SettingsNavigator: React.FC<SettingsNavigatorProps> = ({
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
    variant = 'default',
    menuIcon,
    desc,
    action
}) => {
    const [activeTab, setActiveTab] = useState(currentTab);

    /**
     * Pre-calculates navigation maps for O(1) lookups during render and navigation.
     */
    const { flatContentMap, siblingLevelMap, hierarchyPathMap, folderToFirstFileMap } = useMemo(() => {
        const flatContent: Record<string, Content> = {};
        const siblings: Record<string, TabContent[]> = {};
        const paths: Record<string, TabContent[]> = {};
        const firstFiles: Record<string, string> = {};

        const traverse = (items: TabContent[], currentPath: TabContent[] = []) => {
            let firstFileInThisLevel: string | null = null;

            items.forEach(item => {
                if (isFile(item)) {
                    const id = item.content.id;
                    flatContent[id] = item.content;
                    siblings[id] = items;
                    paths[id] = [...currentPath, item];
                    if (!firstFileInThisLevel) firstFileInThisLevel = id;
                } else if (isFolder(item)) {
                    const folderFirstFileId = traverse(item.content, [...currentPath, item]);
                    if (folderFirstFileId) {
                        firstFiles[item.name || ''] = folderFirstFileId;
                        if (!firstFileInThisLevel) firstFileInThisLevel = folderFirstFileId;
                    }
                }
            });
            return firstFileInThisLevel;
        };

        traverse(tabContent);
        return { 
            flatContentMap: flatContent, 
            siblingLevelMap: siblings, 
            hierarchyPathMap: paths, 
            folderToFirstFileMap: firstFiles 
        };
    }, [tabContent]);

    const activeTabPath = hierarchyPathMap[activeTab] || [];
    const activeFile = flatContentMap[activeTab];
    const currentMenu = siblingLevelMap[activeTab] || tabContent;
    const showSubmenu = activeTabPath.length > 1;

    const navigate = (tabId?: string) => {
        if (!tabId || tabId === activeTab) return;
        setActiveTab(tabId);
        const url = prepareUrl(tabId);
        if (onNavigate) onNavigate(url);
        else window.history.pushState(null, '', url);
    };

    const handleBreadcrumbClick = (index: number, e: React.MouseEvent) => {
        e.preventDefault();
        if (index === 0) {
            const firstRootFile = folderToFirstFileMap['root'] || Object.keys(flatContentMap)[0];
            navigate(firstRootFile);
            return;
        }
        
        const targetItem = activeTabPath[index - 1];
        if (!targetItem) return;

        if (isFile(targetItem)) {
            navigate(targetItem.content.id);
        } else if (isFolder(targetItem)) {
            navigate(folderToFirstFileMap[targetItem.name || '']);
        }
    };

    const renderBreadcrumbLinks = () => {
        const crumbs: BreadcrumbItem[] = [{ name: settingName, id: 'root', type: 'root' }];
        
        activeTabPath.forEach(item => {
            crumbs.push({
                name: isFile(item) ? item.content.name : (item.name || ''),
                id: isFile(item) ? item.content.id : (item.name || ''),
                type: item.type
            });
        });

        return crumbs.map((crumb, index) => (
            <span key={`${crumb.id}-${index}`}>
                {index > 0 && ' / '}
                <Link 
                    to={crumb.type === 'file' ? prepareUrl(crumb.id) : '#'} 
                    onClick={(e) => handleBreadcrumbClick(index, e)}
                >
                    {crumb.name}
                </Link>
            </span>
        ));
    };

    const renderSingleMenuItem = (item: TabContent, index: number) => {
        if (item.type === 'heading') {
            return <div key={index} className="tab-heading">{item.name}</div>;
        }

        if (isFile(item)) {
            const tab = item.content;
            return (
                <Link
                    key={tab.id}
                    to={prepareUrl(tab.id)}
                    className={`tab ${activeTab === tab.id ? 'active-tab' : ''}`}
                    onClick={(e) => {
                        if (e.button === 0 && !e.metaKey && !e.ctrlKey) {
                            e.preventDefault();
                            navigate(tab.id);
                        }
                    }}
                >
                    <p className="tab-name">
                        {menuIcon && tab.icon && <i className={`adminfont-${tab.icon}`}></i>}
                        <span>{tab.count}</span>
                        {tab.name}
                    </p>
                    {desc && tab.desc && <div className="des">{tab.desc}</div>}
                </Link>
            );
        }

        if (isFolder(item)) {
            const firstInFolderId = folderToFirstFileMap[item.name || ''];
            const isPartOfActivePath = activeTabPath.some(pathItem => pathItem === item);
            
            return (
                <Link
                    key={index}
                    to={firstInFolderId ? prepareUrl(firstInFolderId) : '#'}
                    className={`tab ${isPartOfActivePath ? 'active-tab' : ''}`}
                    onClick={(e) => {
                        if (firstInFolderId && e.button === 0 && !e.metaKey && !e.ctrlKey) {
                            e.preventDefault();
                            navigate(firstInFolderId);
                        }
                    }}
                >
                    <p className="tab-name">{item.name}</p>
                </Link>
            );
        }
        return null;
    };

    const renderAllMenuItems = (items: TabContent[]) => items.map(renderSingleMenuItem);

    const renderTabHeaderInfo = () => {
        if (!activeFile || activeFile.id === 'support' || activeFile.hideTabHeader) return null;
        const description = activeFile.tabDes?.trim() || activeFile.desc || '';
        
        return (
            <div className="divider-wrapper">
                <div className="divider-section">
                    <div className="title">{activeFile.tabTitle ?? activeFile.name}</div>
                    {description && (
                        <div 
                            className="desc" 
                            dangerouslySetInnerHTML={{ __html: description }}
                        ></div>
                    )}
                </div>
            </div>
        );
    };

    useEffect(() => {
        if (currentTab) {
            setActiveTab(currentTab);
        } else {
            const availableTabs = Object.keys(flatContentMap);
            if (availableTabs.length > 0) {
                const firstAvailableId = availableTabs[0];
                setActiveTab(firstAvailableId);
                const url = prepareUrl(firstAvailableId);
                window.history.replaceState(null, '', url);
            }
        }
    }, [currentTab, flatContentMap, prepareUrl]);

    return (
        <>
            {tabTitleSection && <>{tabTitleSection}</>}

            <AdminBreadcrumbs
                activeTabIcon={activeFile?.icon || ''}
                tabTitle={activeFile?.name || ''}
                variant={variant}
                renderBreadcrumb={renderBreadcrumbLinks}
                renderMenuItems={() => renderAllMenuItems(tabContent)}
                tabContent={tabContent}
                goPremiumLink={!appLocalizer.khali_dabba ? appLocalizer.shop_url : ''}
                action={action}
            />

            <div className="general-wrapper admin-settings" data-template={variant}>
                {HeaderSection && <HeaderSection />}

                {showSubmenu && (
                    <div id="tabs-wrapper" className="tabs-wrapper">
                        <div className="tabs-item">
                            {renderAllMenuItems(currentMenu)}
                        </div>
                    </div>
                )}

                <div className="tab-content">
                    {renderTabHeaderInfo()}
                    {getForm(activeTab)}
                </div>
            </div>
        </>
    );
};

export default SettingsNavigator;