import React, { useState, useEffect, useMemo, ReactNode, JSX } from 'react';
import { LinkProps } from 'react-router-dom';

// Internal Dependencies
import '../styles/web/SettingsNavigator.scss';
import { SectionUI } from './Section';
import { AdminButtonUI } from './AdminButton';

type Content = {
    id: string;
    headerTitle: string;
    headerDescription?: string;
    headerIcon?: string;
    count?: string;
    settingTitle?: string;
    settingSubTitle?: string;
    hideSettingHeader?: boolean;
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
    variant?: 'default' | 'compact' | 'card' | 'settings';
    /* - 'default': Standard settings panel layout
    * - 'compact': Icon and title compact design
    * - 'card': Card design with count, title and description
    * - 'settings': Left side settings tab design
    */
    action?: React.ReactNode;
    headerTitle?: string;
    headerDescription?: string;
    headerIcon?: string;
    showPremiumLink?: boolean;
};

interface button {
    label: string;
    onClick: () => void;
    iconClass: string;
    className: string;
}

interface NavigatorHeaderProps {
    headerIcon?: string;
    headerTitle?: string;
    headerDescription?: string;
    showPremiumLink?: string;
    buttons?: button[];
}

export const NavigatorHeader: React.FC<NavigatorHeaderProps> = ({
    headerIcon,
    headerTitle,
    headerDescription,
    showPremiumLink,
    buttons = [],
}) => {
    if (!headerTitle && !headerDescription) return null;

    return (
        <div className="title-section">
            <div className="title-wrapper">
                <div className="title">
                    {headerIcon && <i className={headerIcon}></i>}
                    {headerTitle}
                </div>

                {showPremiumLink && (
                    <a href={showPremiumLink} className="tab pro-btn">
                        <i className="adminfont-pro-tag"></i>
                        Upgrade
                        <i className="adminfont-arrow-right"></i>
                    </a>
                )}
            </div>
            
            {buttons.length > 0 && (
                <AdminButtonUI
                    buttons={buttons.map((button) => ({
                        text: button.label,
                        icon: button.iconClass?.replace('adminfont-', ''),
                        onClick: button.onClick,
                        children: (
                            <>
                                <i className={button.iconClass}></i>
                                {button.label}
                            </>
                        ),
                    }))}
                />
            )}

            {headerDescription && (
                <div className="description">
                    {headerDescription}
                </div>
            )}
        </div>
    );
};

interface BreadcrumbProps<T> {
    renderBreadcrumb?: () => React.ReactNode;
    renderMenuItems?: (items: T[]) => React.ReactNode;
    settingContent?: T[];
    customContent?: React.ReactNode;
    action?: React.ReactNode;
}

const Breadcrumb = <T,>({
    renderBreadcrumb,
    renderMenuItems,
    settingContent = [],
    customContent,
    action,
}: BreadcrumbProps<T>) => {

    return (
        <>
            {renderBreadcrumb && (
                <div className="breadcrumbs">
                    {renderBreadcrumb()}
                </div>
            )}

            {renderMenuItems && settingContent.length > 0 && (
                <div className="tabs-wrapper">
                    <div className="tabs-item">
                        {renderMenuItems(settingContent)}
                    </div>

                    {customContent && (
                        <div className="custom-content">
                            {customContent}
                        </div>
                    )}

                    {action && (
                        <div className="action-wrapper">
                            {action}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

// Typesafe check helpers
const isHeading = (item: SettingContent): item is SettingContent & { content: Content } => item.type === 'heading';
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
    action,
    headerTitle,
    headerDescription,
    headerIcon,
    showPremiumLink = false,
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
                name: isFile(item) ? item.content.headerTitle : (item.name || ''),
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

        if (isHeading(item)) {
            return <div key={index} className="tab-heading">{item.headerTitle}</div>;
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
                        {menuIcon && setting.headerIcon && <i className={`adminfont-${setting.headerIcon}`}></i>}
                        <span>{setting.count}</span>
                        {setting.headerTitle}
                    </p>
                    {variant !== 'default' && variant !== 'settings' && setting.headerDescription && (
                        <div className="des">{setting.headerDescription}</div>
                    )}
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

        return (
            <SectionUI
                hint={activeFile.settingTitle ?? activeFile.headerTitle}
                value={activeFile.settingSubTitle ?? activeFile.headerDescription}
            />
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
            <div className="settings-wrapper" data-template={variant}>
                {settingTitleSection && <>{settingTitleSection}</>}

                <NavigatorHeader
                    headerIcon={variant === 'default' ? activeFile?.headerIcon : headerIcon}
                    headerTitle={variant === 'default' ? activeFile?.headerTitle : headerTitle}
                    headerDescription={headerDescription}
                    showPremiumLink={!appLocalizer.khali_dabba && showPremiumLink ? appLocalizer.shop_url : undefined}
                />

                <Breadcrumb
                    renderBreadcrumb={variant === 'default' ? renderBreadcrumbLinks : undefined}
                    renderMenuItems={() => renderAllMenuItems(settingContent)}
                    settingContent={settingContent}
                    action={action}
                />
                <div className="general-wrapper admin-settings">
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
            </div>
        </>
    );
};

export default SettingsNavigator;