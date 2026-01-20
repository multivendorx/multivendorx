interface DashboardTemplateProps {
    colors: {
        colorPrimary: string;
        colorSecondary: string;
        colorAccent: string;
        colorSupport: string;
    };
    isPreview?: boolean;
}

const DashboardTemplate: React.FC<DashboardTemplateProps> = ({
    colors,
}) => {
    function withAlpha(hex: string, alpha: number): string {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    const theme = {
        accent: colors.colorAccent,
        accentSecondary: colors.colorSecondary,
        support: colors.colorSupport,
        cardBg: '#ffffff',
        accentSoft: withAlpha(colors.colorAccent, 0.15),
        supportSoft: withAlpha(colors.colorSupport, 0.15),
    };
    return (
        <div
            className="dashboard-preview-wrapper"
        >
            <div className="left-wrapper">
                <div className="logo-wrapper">
                    <div
                        className="logo"
                        style={{ color: theme.accent }}
                    >
                        MultivendorX
                    </div>
                    <i className="adminfont-menu"></i>
                </div>
                <ul className="dashboard-tabs">
                    <li className="tab-name active">
                        <a
                            className="tab"
                            style={{
                                color: '#fff',
                                background: theme.accent,
                            }}                            
                        >
                            <i className="adminfont-module"></i>
                            Dashboard
                        </a>
                    </li>

                    <li className="tab-name ">
                        <a className="tab">
                            <i className="adminfont-single-product"></i>
                            Products
                        </a>
                        <i className="admin-arrow adminfont-pagination-right-arrow"></i>
                    </li>

                    <li className="tab-name ">
                        <a className="tab">
                            <i className="adminfont-sales"></i>
                            Sales
                        </a>
                        <i className="admin-arrow adminfont-pagination-right-arrow"></i>
                    </li>

                    <ul className="subtabs">
                        <li>
                            <a>Order</a>
                        </li>
                        <li>
                            <a>Refund</a>
                        </li>
                        <li>
                            <a>Commissions</a>
                        </li>
                    </ul>

                    <li className="tab-name ">
                        <a className="tab">
                            <i className="adminfont-coupon"></i>
                            Coupons
                        </a>
                        <i className="admin-arrow adminfont-pagination-right-arrow"></i>
                    </li>

                    <li className="tab-name ">
                        <a href="#" className="tab">
                            <i className="adminfont-wallet"></i>
                            Wallet
                        </a>
                        <i className="admin-arrow adminfont-pagination-right-arrow"></i>
                    </li>

                    <li className="tab-name ">
                        <a href="#" className="tab">
                            <i className="adminfont-customer-service"></i>
                            Store Support
                        </a>
                        <i className="admin-arrow adminfont-pagination-right-arrow"></i>
                    </li>

                    <li className="tab-name ">
                        <a href="#" className="tab">
                            <i className="adminfont-report"></i>
                            Stats / Report
                        </a>
                        <i className="admin-arrow adminfont-pagination-right-arrow"></i>
                    </li>
                    <li className="tab-name ">
                        <a href="#" className="tab">
                            <i className="adminfont-resources"></i>
                            Resources
                        </a>
                        <i className="admin-arrow adminfont-pagination-right-arrow"></i>
                    </li>
                </ul>
            </div>

            { /* Content Area */ }
            <div className="tab-wrapper">
                <div className="top-navbar">
                    <div className="navbar-leftside"></div>
                    <div className="navbar-rightside">
                        <ul className="navbar-right">
                            <li>
                                <div className="adminfont-icon adminfont-moon"></div>
                            </li>
                            <li>
                                <div className="adminfont-icon adminfont-product-addon"></div>
                            </li>
                            <li>
                                <div className="adminfont-icon adminfont-storefront"></div>
                            </li>
                            <li>
                                <div className="adminfont-icon adminfont-notification"></div>
                            </li>
                            <li>
                                <div className="adminfont-icon adminfont-crop-free"></div>
                            </li>

                            <li className="dropdown login-user">
                                <a
                                    href=""
                                    className="dropdown-toggle"
                                >
                                    <div
                                        className="avatar-wrapper"
                                        style={{ backgroundColor: theme.accent }}
                                    >
                                        <i className="adminfont-person"></i>
                                    </div>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="tab-content-wrapper">
                    <div className="title-wrapper">
                        <div className="left-section">
                            <div className="title">
                                Good Morning, Store owner!
                            </div>
                            <div className="des"></div>
                        </div>
                        <div
                            className="dashboard-btn"
                            style={{ background: theme.accent }}
                        >
                            Add new
                        </div>
                    </div>

                    <div className="dashboard-card-wrapper">
                        <div
                            className="item"
                            style={ {
                                background: theme.cardBg,
                            } }
                        >
                            <div className="details">
                                <div className="price"></div>
                                <div className="des"></div>
                            </div>
                            <div
                                className="icon-wrapper"
                                style={ {
                                    background: theme.accent,
                                } }
                            >
                                <i className="adminfont-dollar"></i>
                            </div>
                        </div>
                        <div
                            className="item"
                            style={ {
                                background: theme.cardBg,
                            } }
                        >
                            <div className="details">
                                <div className="price"></div>
                                <div className="des"></div>
                            </div>
                            <div
                                className="icon-wrapper"
                                style={{ background: theme.accentSecondary }}
                            >
                                <i className="adminfont-order"></i>
                            </div>
                        </div>
                        <div
                            className="item"
                            style={ {
                                background: theme.cardBg,
                            } }
                        >
                            <div className="details">
                                <div className="price"></div>
                                <div className="des"></div>
                            </div>
                            <div
                                className="icon-wrapper"
                                style={ {
                                    background:
                                        theme.support,
                                } }
                            >
                                <i className="adminfont-store-seo"></i>
                            </div>
                        </div>
                        <div
                            className="item"
                            style={ {
                                background: theme.supportSoft,
                            } }
                        >
                            <div className="details">
                                <div className="price"></div>
                                <div className="des"></div>
                            </div>
                            <div
                                className="icon-wrapper"
                                style={ {
                                    background:
                                        theme.support,
                                } }
                            >
                                <i className="adminfont-commission"></i>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-row">
                        <div className="section column-8">
                            <div className="section-header">
                                <div className="title"></div>
                            </div>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className="section column-4">
                            <div className="section-header">
                                <div className="title"></div>
                            </div>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>

                    <div className="dashboard-row">
                        <div className="section column-4">
                            <div className="section-header">
                                <div className="title"></div>
                            </div>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className="section column-8">
                            <div className="section-header">
                                <div className="title"></div>
                            </div>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardTemplate;