//External Dependencies
import React, { useEffect, useState } from 'react';

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
    tabData?: T[];
    buttons?: button[];
    premium?: boolean;
    goPremium?: boolean;
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
    tabData = [],
    buttons = [],
    premium = true,
    goPremium = false,
    goPremiumLink,
    description,
    customContent,
    hideBreadcrumb = false,
    hideTitle = false,
    action,
}: AdminBreadcrumbsProps<T>) => {
    const [notices, setNotices] = useState<string[]>([]);

    useEffect(() => {
        const captureNotices = () => {
            const noticeNodes = document.querySelectorAll(
                '#screen-meta + .wrap .notice, #wpbody-content .notice'
            );

            if (noticeNodes.length > 0) {
                const htmlArray: string[] = [];
                noticeNodes.forEach((node) => {
                    htmlArray.push(node.outerHTML);
                    node.remove(); // remove from DOM so we control rendering
                });
                setNotices(htmlArray);
            }
        };

        captureNotices();
    }, []);

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
                            {!hideTitle && (
                                <div className="title">
                                    {activeTabIcon && (
                                        <i className={activeTabIcon}></i>
                                    )}
                                    {tabTitle}
                                </div>
                            )}
                            <div className="buttons">
                                {buttons && buttons.map((button, index) => {
                                    return (
                                        <div
                                            className={button.className}
                                            onClick={button.onClick}
                                        >
                                            <i className={button.iconClass}></i>
                                            {button.label}
                                        </div>
                                    );
                                })}
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
                        {!hideBreadcrumb && (
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
                {renderMenuItems && tabData.length > 0 && (
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
                            {renderMenuItems(tabData)}
                        </div>
                        {!submenuRender && goPremium && premium && (
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

            { /* render multiple notices */}
            {!submenuRender &&
                notices.length > 0 &&
                notices.map((html, i) => (
                    <div
                        key={i}
                        className="wp-admin-notice"
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                ))}
        </>
    );
};

export default AdminBreadcrumbs;
