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

type TabsProps = {
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
};

// Helper functions
const isFile = (item: TabContent): item is TabContent & { content: Content } => {
    return item.type === 'file';
};

const isFolder = (item: TabContent): item is TabContent & { content: TabContent[] } => {
    return item.type === 'folder';
};

// Find path to a tab (breadcrumb path)
function findTabPath(items: TabContent[], targetId: string, path: TabContent[] = []): TabContent[] | null {
    for (const item of items) {
        if (isFile(item) && item.content.id === targetId) {
            return [...path, item];
        }
        if (isFolder(item)) {
            const found = findTabPath(item.content, targetId, [...path, item]);
            if (found) return found;
        }
    }
    return null;
}

// Find first file in items
function findFirstFile(items: TabContent[]): Content | null {
    for (const item of items) {
        if (isFile(item)) return item.content;
        if (isFolder(item)) {
            const found = findFirstFile(item.content);
            if (found) return found;
        }
    }
    return null;
}

// Get folder contents if active tab is inside it
function getFolderContents(items: TabContent[], activeTabId: string): TabContent[] {
    // Find the folder that contains the active tab
    for (const item of items) {
        if (isFolder(item)) {
            const path = findTabPath(item.content, activeTabId);
            if (path) {
                // This folder contains the active tab, return its contents
                return item.content;
            }
        }
    }
    return items; // Return root items if no folder found
}

const Tabs: React.FC<TabsProps> = ({
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
}) => {
    const [activeTab, setActiveTab] = useState(currentTab);

    // Get breadcrumb path for current tab
    const tabPath = findTabPath(tabContent, activeTab) || [];

    // Build breadcrumb items
    const breadcrumbs: BreadcrumbItem[] = [
        { name: settingName, id: 'root', type: 'root' }
    ];

    tabPath.forEach(item => {
        if (isFolder(item)) {
            breadcrumbs.push({
                name: item.name || '',
                id: item.name || '',
                type: 'folder'
            });
        } else if (isFile(item)) {
            breadcrumbs.push({
                name: item.content.name,
                id: item.content.id,
                type: 'file'
            });
        }
    });

    // Get current menu items to display
    const currentMenu = getFolderContents(tabContent, activeTab);

    // Check if we should show submenu (when inside a folder)
    const showSubmenu = tabPath.length > 1; // More than just the file itself

    // Navigation
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
            const firstFile = findFirstFile(tabContent);
            if (firstFile) navigate(firstFile.id);
            return;
        }

        const targetItem = tabPath[index - 1];
        if (!targetItem) return;

        if (isFile(targetItem)) {
            navigate(targetItem.content.id);
        }

        if (isFolder(targetItem)) {
            const firstFile = findFirstFile(targetItem.content);
            if (firstFile) navigate(firstFile.id);
        }
    };

    // Render breadcrumb links
    const renderBreadcrumbLinks = () =>
        breadcrumbs.map((crumb, index) => (
            <span key={index}>
                {index > 0 && ' / '}
                <Link
                    to={crumb.type === 'file' ? prepareUrl(crumb.id) : '#'}
                    onClick={(e) => handleBreadcrumbClick(index, e)}
                >
                    {crumb.name}
                </Link>
            </span>
        ));

    // Render single menu item
    const renderSingleMenuItem = (item: TabContent, index: number) => {
        if (item.type === 'heading') {
            return (
                <div key={`heading-${item.name}-${index}`} className="tab-heading">
                    {item.name}
                </div>
            );
        }

        if (isFile(item)) {
            const tab = item.content;
            if (!tab.id || !tab.name) return null;

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
                        {menuIcon && tab.icon && (
                            <i className={`adminfont-${tab.icon}`}></i>
                        )}
                        <span>{tab.count}</span>
                        {tab.name}
                    </p>
                    {desc && tab.desc && <div className="des">{tab.desc}</div>}
                </Link>
            );
        }

        if (isFolder(item)) {
            const folderItems = item.content;
            if (folderItems.length === 0) return null;

            const firstFile = findFirstFile(folderItems);

            const isActive = findTabPath(folderItems, activeTab) !== null;

            return (
                <Link
                    key={`folder-${item.name || ''}-${index}`}
                    to={firstFile ? prepareUrl(firstFile.id) : '#'}
                    className={`tab ${isActive ? 'active-tab' : ''}`}
                    onClick={(e) => {
                        if (firstFile && e.button === 0 && !e.metaKey && !e.ctrlKey) {
                            e.preventDefault();
                            navigate(firstFile.id);
                        }
                    }}
                >
                    <p className="tab-name">{item.name}</p>
                </Link>
            );
        }

        return null;
    };

    // Render all menu items
    const renderAllMenuItems = (items: TabContent[]) =>
        items.map(renderSingleMenuItem);

    // Get active tab description
    const getActiveTabInfo = (key = ''): string | ReactNode => {
        const path = findTabPath(tabContent, activeTab);
        if (!path) return null;

        const fileItem = path.find(isFile);
        if (!fileItem || !isFile(fileItem)) return null;

        const tab = fileItem.content;
        if (tab.id === 'support' || tab.hideTabHeader) return null;

        if (key === 'icon') return tab.icon ?? '';
        if (key === 'name') return tab.name ?? '';

        const description = tab.tabDes?.trim() || tab.desc || '';
        return (
            <div className="divider-wrapper">
                <div className="divider-section">
                    {tab.name && (
                        <div className="title">
                            {tab.tabTitle ?? tab.name}
                        </div>
                    )}
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

    // Initialize active tab
    useEffect(() => {
        if (currentTab) {
            setActiveTab(currentTab);
        } else {
            const firstFile = findFirstFile(tabContent);
            if (firstFile) {
                navigate(firstFile.id);
            }
        }
    }, [currentTab, tabContent]);

    const tabIcon = getActiveTabInfo('icon');
    const parentTab = getActiveTabInfo('name');
    return (
        <>
            {tabTitleSection && <>{tabTitleSection}</>}

            <AdminBreadcrumbs
                activeTabIcon={tabIcon}
                tabTitle={parentTab}
                variant={variant}
                renderBreadcrumb={renderBreadcrumbLinks}
                renderMenuItems={renderAllMenuItems}
                tabContent={tabContent}
                goPremiumLink={!appLocalizer.khali_dabba ? appLocalizer.shop_url : ''}
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
                    {getActiveTabInfo()}
                    {getForm(activeTab)}
                </div>
            </div>
        </>
    );
};

export default Tabs;