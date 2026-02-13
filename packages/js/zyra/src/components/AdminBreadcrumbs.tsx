//External Dependencies
import React from 'react';
import { AdminButtonUI } from './AdminButton';

interface button {
    label: string;
    onClick: () => void;
    iconClass: string;
    className: string;
}

interface AdminBreadcrumbsProps<T> {
    settingIcon?: string;
    headerTitle?: string;
    submenuRender?: boolean;
    variant?: 'default' | 'compact' | 'card';
    hideTitle?: boolean;
    hideBreadcrumb?: boolean;
    renderBreadcrumb?: () => React.ReactNode;
    renderMenuItems?: (items: T[]) => React.ReactNode;
    settingContent?: T[];
    buttons?: button[];
    goPremiumLink?: string;
    description?: string;
    customContent?: React.ReactNode;
    action?: React.ReactNode;
}

const AdminBreadcrumbs = <T,>({
    settingIcon = '',
    headerTitle = '',
    submenuRender = false,
    variant = 'default',
    renderBreadcrumb,
    renderMenuItems,
    settingContent = [],
    buttons = [],
    goPremiumLink,
    description,
    customContent,
    action,
}: AdminBreadcrumbsProps<T>) => {

    return (
        <>
            <div
                className={`${submenuRender ? 'horizontal-title-section' : 'title-section'
                    }`}
                data-template={variant}
            >
                {!submenuRender && (
                    <>
                        <div
                            className={
                                submenuRender
                                    ? 'horizontal-title-wrapper'
                                    : 'title-wrapper'
                            }
                        >
                            {variant === 'default' && (
                                <div className="title">
                                    {settingIcon && (
                                        <i className={settingIcon}></i>
                                    )}
                                    {headerTitle}
                                </div>
                            )}
                            <div className="buttons">
                                {buttons && (
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

                            </div>

                            {customContent && (
                                <div className="custom-content">
                                    {customContent}
                                </div>
                            )}
                        </div>

                        {description && (
                            <div className="description">{description}</div>
                        )}
                        {variant === 'default' && (
                            <>
                                {renderBreadcrumb && (
                                    <div className="breadcrumbs">
                                        {renderBreadcrumb()}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
                {renderMenuItems && settingContent.length > 0 && (
                    <div className="tabs-wrapper">
                        {submenuRender && (
                            <>
                                {settingIcon && (
                                    <i className={settingIcon}></i>
                                )}
                            </>
                        )}
                        <div
                            className={
                                submenuRender
                                    ? 'horizontal-tabs-item'
                                    : 'tabs-item'
                            }
                        >
                            {renderMenuItems(settingContent)}
                        </div>
                        {!submenuRender && goPremiumLink && (
                            <a
                                href={goPremiumLink}
                                className="tab pro-btn"
                            >
                                <i className="adminfont-pro-tag"></i> Upgrade
                                <i className="adminfont-arrow-right"></i>
                            </a>
                        )}
                        {action && (
                            <div className="action-wrapper">{action}</div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default AdminBreadcrumbs;
