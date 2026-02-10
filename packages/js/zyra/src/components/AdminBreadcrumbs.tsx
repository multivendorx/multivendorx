//External Dependencies
import React from 'react';
import { AdminButtonUI } from './UI/AdminButton';

interface button {
    label: string;
    onClick: () => void;
    iconClass: string;
    className: string;
}

interface AdminBreadcrumbsProps<T> {
    activeTabIcon?: string;
    tabTitle?: string;
    submenuRender?: boolean;
    variant?: 'default' | 'compact' | 'card';
    hideTitle?: boolean;
    hideBreadcrumb?: boolean;
    renderBreadcrumb?: () => React.ReactNode;
    renderMenuItems?: (items: T[]) => React.ReactNode;
    tabContent?: T[];
    buttons?: button[];
    goPremiumLink?: string;
    description?: string;
    customContent?: React.ReactNode;
    action?: React.ReactNode;
}

const AdminBreadcrumbs = <T,>({
    activeTabIcon = '',
    tabTitle = '',
    submenuRender = false,
    variant = 'default',
    renderBreadcrumb,
    renderMenuItems,
    tabContent = [],
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
                                    {activeTabIcon && (
                                        <i className={activeTabIcon}></i>
                                    )}
                                    {tabTitle}
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
                {renderMenuItems && tabContent.length > 0 && (
                    <div className="tabs-wrapper">
                        {submenuRender && (
                            <>
                                {activeTabIcon && (
                                    <i className={activeTabIcon}></i>
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
                            {renderMenuItems(tabContent)}
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
