import React, { useState, useEffect, useMemo, ReactNode, JSX } from 'react';
import { LinkProps } from 'react-router-dom';

// Internal Dependencies
import '../styles/web/SettingsNavigator.scss';
import AdminBreadcrumbs from './AdminBreadcrumbs';

type Content = {
    id: string;
    name: string;
    desc?: string;
    count?: string;
    headerTitle?: string;
    settingDes?: string;
    icon?: string;
    link?: string;
    hideSettingHeader?: boolean;
    proDependent?: boolean;
};

type SettingContent = {
    name?: string;
    type: 'file' | 'folder' | 'heading';
    content: Content | SettingContent[];
};

type BreadcrumbItem = { name: string; id: string; type: string };

type SettingsNavigatorProps = {
    settingContent: SettingContent[];
    currentSetting: string;
    getForm: (settingId: string) => ReactNode;
    prepareUrl: (settingId: string) => string;
    HeaderSection?: () => JSX.Element;
    Link: React.ElementType<LinkProps>;
    settingName?: string;
    onNavigate?: (url: string) => void;
    settingTitleSection?: React.ReactNode;
    appLocalizer: { khali_dabba?: boolean; shop_url?: string };
    menuIcon?: boolean;
    desc?: boolean;
    variant?: 'default' | 'compact' | 'card';
    action?: React.ReactNode;
};

// Typesafe check helpers
const isFile = (item: SettingContent): item is SettingContent & { content: Content } => item.type === 'file';
const isFolder = (item: SettingContent): item is SettingContent & { content: SettingContent[] } => item.type === 'folder';

const SettingsNavigator: React.FC<SettingsNavigatorProps> = ({
    settingContent,
    currentSetting,
    getForm,
    prepareUrl,
    HeaderSection,
    Link,
    settingName = '',
    onNavigate,
    settingTitleSection,
    appLocalizer,
    variant = 'default',
    menuIcon,
    desc,
    action
}) => {
    const [activeSetting, setActiveSetting] = useState(currentSetting);
    /**
     * Pre-calculates navigation maps for O(1) lookups during render and navigation.
     */
    const { flatContentMap, siblingLevelMap, hierarchyPathMap, folderToFirstFileMap } = useMemo(() => {
        const flatContent: Record<string, Content> = {};
        const siblings: Record<string, SettingContent[]> = {};
        const paths: Record<string, SettingContent[]> = {};
        const firstFiles: Record<string, string> = {};

        const traverse = (items: SettingContent[], currentPath: SettingContent[] = []) => {
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

        traverse(settingContent);
        return { 
            flatContentMap: flatContent, 
            siblingLevelMap: siblings, 
            hierarchyPathMap: paths, 
            folderToFirstFileMap: firstFiles 
        };
    }, [settingContent]);

    const activeSettingPath = hierarchyPathMap[activeSetting] || [];
    const activeFile = flatContentMap[activeSetting];
    const currentMenu = siblingLevelMap[activeSetting] || settingContent;
    const showSubmenu = activeSettingPath.length > 1;

    const navigate = (settingId?: string) => {
        if (!settingId || settingId === activeSetting) return;
        setActiveSetting(settingId);
        const url = prepareUrl(settingId);
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
        
        const targetItem = activeSettingPath[index - 1];
        if (!targetItem) return;

        if (isFile(targetItem)) {
            navigate(targetItem.content.id);
        } else if (isFolder(targetItem)) {
            navigate(folderToFirstFileMap[targetItem.name || '']);
        }
    };

    const renderBreadcrumbLinks = () => {
        const crumbs: BreadcrumbItem[] = [{ name: settingName, id: 'root', type: 'root' }];
        
        activeSettingPath.forEach(item => {
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

    const renderSingleMenuItem = (item: SettingContent, index: number) => {
        if (item.type === 'heading') {
            return <div key={index} className="tab-heading">{item.name}</div>;
        }

        if (isFile(item)) {
            const setting = item.content;
            return (
                <Link
                    key={setting.id}
                    to={prepareUrl(setting.id)}
                    className={`tab ${activeSetting === setting.id ? 'active-tab' : ''}`}
                    onClick={(e) => {
                        if (e.button === 0 && !e.metaKey && !e.ctrlKey) {
                            e.preventDefault();
                            navigate(setting.id);
                        }
                    }}
                >
                    <p className="tab-name">
                        {menuIcon && setting.icon && <i className={`adminfont-${setting.icon}`}></i>}
                        <span>{setting.count}</span>
                        {setting.name}
                    </p>
                    {desc && setting.desc && <div className="des">{setting.desc}</div>}
                </Link>
            );
        }

        if (isFolder(item)) {
            const firstInFolderId = folderToFirstFileMap[item.name || ''];
            const isPartOfActivePath = activeSettingPath.some(pathItem => pathItem === item);
            
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

    const renderAllMenuItems = (items: SettingContent[]) => items.map(renderSingleMenuItem);

    const renderSettingHeaderInfo = () => {
        if (!activeFile || activeFile.id === 'support' || activeFile.hideSettingHeader) return null;
        const description = activeFile.settingDes?.trim() || activeFile.desc || '';
        
        return (
            <div className="divider-wrapper">
                <div className="divider-section">
                    <div className="title">{activeFile.headerTitle ?? activeFile.name}</div>
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
        if (currentSetting) {
            setActiveSetting(currentSetting);
        } else {
            const availableSettings = Object.keys(flatContentMap);
            if (availableSettings.length > 0) {
                const firstAvailableId = availableSettings[0];
                setActiveSetting(firstAvailableId);
                const url = prepareUrl(firstAvailableId);
                window.history.replaceState(null, '', url);
            }
        }
    }, [currentSetting, flatContentMap, prepareUrl]);

    return (
        <>
            {settingTitleSection && <>{settingTitleSection}</>}

            <AdminBreadcrumbs
                settingIcon={activeFile?.icon || ''}
                headerTitle={activeFile?.headerTitle || ''}
                variant={variant}
                renderBreadcrumb={renderBreadcrumbLinks}
                renderMenuItems={() => renderAllMenuItems(settingContent)}
                settingContent={settingContent}
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
                    {renderSettingHeaderInfo()}
                    {getForm(activeSetting)}
                </div>
            </div>
        </>
    );
};

export default SettingsNavigator;