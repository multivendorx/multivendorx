import React from 'react';

interface ButtonConfig {
    label?: string;
    onClick?: () => void;
    iconClass?: string;
    className?: string;
}

interface AdminBreadcrumbsProps {
    activeTabIcon?: string;
    parentTabName?: string;
    renderBreadcrumb?: () => React.ReactNode;
    renderMenuItems?: (items: any[]) => React.ReactNode;
    tabData?: any[];
    buttons?: (ButtonConfig | React.ReactNode)[];
    goPremium?: boolean
    goPremiumLink?:string
}

const AdminBreadcrumbs: React.FC<AdminBreadcrumbsProps> = ({
    activeTabIcon = '',
    parentTabName = '',
    renderBreadcrumb,
    renderMenuItems,
    tabData = [],
    buttons = [],
    goPremium = false,
    goPremiumLink
}) => {
    return (
        <div className="title-section">
            <div className="title-wrapper">
                <div className="title">
                    {activeTabIcon && <i className={activeTabIcon}></i>}
                    {parentTabName}
                </div>

                <div className="buttons">
                    {buttons.length > 0 &&
                        buttons.map((btn, index) => {
                            if (React.isValidElement(btn)) return <React.Fragment key={index}>{btn}</React.Fragment>;

                            const { label, onClick, iconClass, className } = btn as ButtonConfig;
                            return (
                                <button
                                    key={index}
                                    className={`breadcrumb-btn ${className || ''}`}
                                    onClick={onClick}
                                >
                                    {iconClass && <i className={iconClass}></i>}
                                    {label}
                                </button>
                            );
                        })}
                </div>
            </div>

            {renderBreadcrumb && <div className="breadcrumbs-menu">{renderBreadcrumb()}</div>}

            {renderMenuItems && tabData.length > 0 && (
                <div id="top-level-tab-lists" className="current-tab-lists">
                    <div className="current-tab-lists-container">
                        {renderMenuItems(tabData)}
                    </div>
                    {goPremium && (<a href={goPremiumLink} className="menu-item pro-btn">
                            <i className="adminlib-pro-tag"></i> Upgrade<i className="adminlib-arrow-right"></i>
                    </a>)}
                </div>
            )}
        </div>
    );
};

export default AdminBreadcrumbs;
