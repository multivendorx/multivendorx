import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { getApiLink } from 'zyra';
import { useLocation, useNavigate } from 'react-router-dom';
import Notifications from './dashboard/notifications';
import "./hooksFilters";

const Dashboard = () => {
    const [menu, setMenu] = useState({});
    const [openSubmenus, setOpenSubmenus] = useState({});
    const [storeData, setStoreData] = useState({});
    const [currentTab, setCurrentTab] = useState('');
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [noPermission, setNoPermission] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    const loadComponent = (key) => {
        if (!endpoints || endpoints.length === 0) {
            return;
        }

        try {
            const activeEndpoint = endpoints.find(ep => ep.tab === key);

            if (activeEndpoint?.filename) {
                const CustomComponent = require(`./dashboard/${activeEndpoint.filename}.tsx`).default;
                return <CustomComponent />;
            }

            const DefaultComponent = require(`./dashboard/${key}.tsx`).default;
            return <DefaultComponent />;

        } catch {
            return <div>404 not found</div>;
        }
    };

    useEffect(() => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        })
        .then((res: any) => {
            const data = res.data || {};
            setStoreData(data)
        })
    }, [appLocalizer.store_id]);

    useEffect(() => {
        axios({
            url: getApiLink(appLocalizer, 'endpoints'),
            method: 'GET',
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        }).then((res) => {
            setMenu(res.data || {});
        });
    }, []);

    const hasCapability = (capability:any) => {
        if (!capability) return true;

        const userCaps = appLocalizer.current_user?.allcaps || {};

        if (Array.isArray(capability)) {
            return capability.some(cap => userCaps[cap] === true);
        }

        return userCaps[capability] === true;
    };

    useEffect(() => {
            if (!currentTab) return;
    
            let capability = null;
    
            for (const [key, item] of Object.entries(menu)) {
                if (key === currentTab) {
                    capability = item.capability;
                    break;
                }
    
                const sub = item.submenu?.find(s => s.key === currentTab);
                if (sub) {
                    capability = sub.capability;
                    break;
                }
            }
    
            setNoPermission(!hasCapability(capability));
    
        }, [currentTab, menu]);

    const endpoints = useMemo(() => {
        const list = [];

        Object.entries(menu).forEach(([key, item]) => {
            list.push({
                tab: key,
                filename: item.filename || key
            });

            item.submenu?.forEach((sub) => {
                list.push({
                    tab: sub.key,
                    filename: sub.filename || sub.key
                });
            });
        });

        return list;
    }, [menu]);

    const getBasePath = () => {
        const sitePath = new URL(appLocalizer.site_url).pathname;
        return sitePath.replace(/\/$/, '');
    };

    const getCurrentTabFromURL = () => {
        const slug = appLocalizer.dashboard_slug;
        const base = getBasePath();

        if (appLocalizer.permalink_structure) {
            let path = location.pathname
                .replace(base, '')
                .replace(`/${slug}/`, '')
                .replace(/^\/+|\/+$/g, '');

            const parts = path.split('/');
            return parts[0] || '';
        }

        const query = new URLSearchParams(location.search);
        return query.get('segment') || '';
    };

    useEffect(() => {
        const tab = getCurrentTabFromURL() || endpoints[0]?.tab || '';
        setCurrentTab(tab);
    }, [location.pathname, location.search, endpoints]);


    // Handle Tab Navigation
    const handleTabClick = (tab) => {
        const base = getBasePath();
        if (appLocalizer.permalink_structure) {
            navigate(`${base}/${appLocalizer.dashboard_slug}/${tab}/`);
        } else {
            navigate(
                `${base}/?page_id=${appLocalizer.dashboard_page_id}&segment=${tab}`
            );
        }
    };

    useEffect(() => {
        const open = {};

        Object.entries(menu).forEach(([key, item]) => {
            if (!item.submenu?.length) return;

            const isParentActive = currentTab === key;
            const isChildActive = item.submenu.some((s) => s.key === currentTab);

            if (isParentActive || isChildActive) {
                open[key] = true;
            }
        });

        setOpenSubmenus(open);
    }, [currentTab, menu]);

    const toggleSubmenu = (key) => {
        setOpenSubmenus((prev) => {
            const updated = {};

            Object.keys(menu).forEach((menuKey) => {
                updated[menuKey] = menuKey === key ? !prev[key] : false;
            });

            return updated;
        });
    };

    const store_dashboard_logo =
        appLocalizer.settings_databases_value['store-appearance']
            ?.store_dashboard_site_logo || '';

    const availableStores = appLocalizer.store_ids.filter(store => {
        return appLocalizer.active_store
            ? store.id !== String(appLocalizer.active_store)
            : true;
    });

    const switchStore = (storeId) => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `store/${storeId}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {action: 'switch'}
        })
            .then((res: any) => {
                window.location.assign(res.data.redirect);
            })
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.warn(`Error attempting fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };


    // Toggle user dropdown
    const toggleUserDropdown = (e) => {
        e.stopPropagation();
        setShowUserDropdown(prev => !prev);
        setShowNotifications(false);
    };

    // Toggle notifications
    const toggleNotifications = (e) => {
        e.stopPropagation();
        setShowNotifications(prev => !prev);
        setShowUserDropdown(false); 
    };

    // Close all dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setShowUserDropdown(false);
            setShowNotifications(false);
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    return (
        <div id="store-dashboard">
            
            <div className="dashboard-tabs-wrapper">
                
                <div className="logo-wrapper">
                    {store_dashboard_logo ? (
                        <img src={store_dashboard_logo} alt="Site Logo" />
                    ) : (
                        <span className="site-name">{appLocalizer.site_name}</span>
                    )}
                </div>

                {storeData.status == "active" && (
                    <div className="dashboard-tabs">
                        <ul>
                            {Object.entries(menu).map(([key, item]) => {
                                if (!item.name) return null;

                                const hasSubmenu = item.submenu?.length > 0;

                                const isParentActive = currentTab === key;
                                const isOpen = openSubmenus[key] || false;

                                return (
                                    <li
                                        key={key}
                                        className={`tab-name ${isParentActive ? 'active' : ''}`}
                                    >
                                        <a
                                            className="tab"
                                            href={hasSubmenu ? '#' : appLocalizer.permalink_structure
                                                                        ? `/${appLocalizer.dashboard_slug}/${key}`
                                                                        : `/?page_id=${appLocalizer.dashboard_page_id}&segment=${key}`}
                                            onClick={(e) => {
                                                e.preventDefault();

                                                if (hasSubmenu) {
                                                    toggleSubmenu(key);
                                                } else {
                                                    handleTabClick(key);
                                                }
                                            }}
                                        >
                                            <i className={item.icon}></i>
                                            <span>{item.name}</span>

                                            {hasSubmenu && (
                                                <i
                                                    className={`admin-arrow adminlib-pagination-right-arrow ${
                                                        isOpen ? 'rotate' : ''
                                                    }`}
                                                ></i>
                                            )}
                                        </a>

                                        {hasSubmenu && (
                                            <ul
                                                className={`subtabs ${
                                                        isOpen ? 'open' : ''
                                                    }`}

                                                
                                            >
                                                {item.submenu.map((sub) => {
                                                    const subActive = currentTab === sub.key;

                                                    return (
                                                        <li
                                                            key={sub.key}
                                                            className={subActive ? 'active' : ''}
                                                        >
                                                            <a
                                                                // href={`?segment=${sub.key}`}
                                                                href={
                                                                    appLocalizer.permalink_structure
                                                                        ? `/${appLocalizer.dashboard_slug}/${sub.key}`
                                                                        : `/?page_id=${appLocalizer.dashboard_page_id}&segment=${sub.key}`
                                                                }
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleTabClick(sub.key);
                                                                }}
                                                            >
                                                                {sub.name}
                                                            </a>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>

            <div className="dashboard-content tab-wrapper">
                <div className="top-navbar-wrapper">
                    <div className="top-navbar">
                        <div className="navbar-leftside">
                            <i className='adminlib-menu toggle-menu-icon'></i>
                        </div>
                        <div className="navbar-rightside">
                            <ul className="navbar-right">
                                <li>
                                    <div className="adminlib-icon adminlib-vendor-form-add"></div>
                                </li>
                                <li>
                                    <div className="adminlib-icon adminlib-storefront"></div>
                                </li>
                                <li>
                                    <div
                                        className="adminlib-icon notification adminlib-notification"
                                        onClick={toggleNotifications}
                                    ></div>

                                    {showNotifications && (
                                        <Notifications />
                                    )}
                                </li>
                                <li id="fullscreenToggle" onClick={toggleFullscreen}>
                                    <div className="adminlib-icon adminlib-crop-free"></div>
                                </li>

                                <li className="dropdown login-user">
                                    <div className="avatar-wrapper" onClick={toggleUserDropdown}>
                                        <i className="adminlib-icon adminlib-person"></i>
                                    </div>
                                    {showUserDropdown && (
                                        <div className="dropdown-menu">

                                            <div className="dropdown-header">
                                                <div className="user-card">
                                                    <div className="user-avatar">
                                                        <img 
                                                            src={appLocalizer.current_user_image}
                                                            alt={appLocalizer.current_user?.data?.display_name}
                                                            width={48}
                                                            height={48}
                                                        />
                                                    </div>

                                                    <div className="user-info">
                                                        <span
                                                            className="user-name">{appLocalizer.current_user?.data?.display_name}</span>
                                                        <span
                                                            className="user-email">{appLocalizer.current_user?.data?.user_email}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="dropdown-body">
                                                <ul>
                                                    <li>
                                                        <a href="#">
                                                            <i className="adminlib-person"></i>
                                                            My Profile
                                                        </a>
                                                    </li>

                                                    <li>
                                                        <a href="#">
                                                            <i className="adminlib-setting"></i>
                                                            Account Setting
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>

                                            {availableStores.length > 0 && (
                                                <>
                                                <div className="dropdown-header">
                                                    <h3><i className="adminlib-switch-store"></i>Switch stores</h3>
                                                </div>

                                                <div className="store-wrapper">
                                                    <ul>
                                                        {availableStores.map((store) => (
                                                            <li key={store.id}>
                                                                <a
                                                                    href="#"
                                                                    className="switch-store"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        switchStore(store.id);
                                                                    }}
                                                                >
                                                                    <i className="adminlib-storefront"></i>
                                                                    {store?.name}
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                </>
                                            )}

                                            <div className="footer">
                                                <a className="admin-btn btn-red" href={appLocalizer.user_logout_url}>
                                                    <i className="adminlib-import"></i> Sign Out
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </li>

                            </ul>
                        </div>
                    </div>
                </div>
                
                {/* <div className="content-wrapper">{loadComponent(currentTab)}</div> */}
                <div className="content-wrapper">
                    {storeData.length > 0 && storeData.status !== "active" ? (
                        <div className="permission-wrapper">
                            <i className="adminlib-info red"></i>
                            <div className="title">
                                {storeData.status === "pending"
                                    ? appLocalizer.settings_databases_value['pending']?.pending_msg
                                    : storeData.status === "suspended"
                                    ? appLocalizer.settings_databases_value['suspended']?.suspended_msg
                                    : storeData.status === "under_review"
                                    ? appLocalizer.settings_databases_value['under-review']?.under_review_msg
                                    : storeData.status === "rejected"
                                    ? 
                                    <>
                                        {appLocalizer.settings_databases_value['rejected']?.rejected_msg}
                                        {" "}
                                        <a 
                                            href={appLocalizer.registration_page} 
                                            className="reapply-link"
                                            target='__blank'
                                        >
                                            Click here to reapply.
                                        </a>
                                    </>
                                    : "No active store select for this user."
                                }
                            </div>
                            <div className="admin-btn btn-purple">Contact Admin</div>
                        </div>

                    ) : 

                    noPermission ? (
                        <div className="permission-wrapper">
                            <i className="adminlib-info red"></i>
                            <div className="title">You do not have permission to access this page.</div>
                            <div className="admin-btn btn-purple">Contact Admin</div>
                        </div>

                    ) : (
                        loadComponent(currentTab)
                    )}

                </div>
            </div>
        </div>
    );
};

export default Dashboard;