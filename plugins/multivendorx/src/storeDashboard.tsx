import { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import { getApiLink, Popover, useModules } from 'zyra';
import { useLocation, useNavigate } from 'react-router-dom';
import Notifications from './dashboard/notifications';
import './hooksFilters';
import { __ } from '@wordpress/i18n';
import { formatTimeAgo } from './services/commonFunction';

const Dashboard = () => {
	const [menu, setMenu] = useState({});
	const [openSubmenus, setOpenSubmenus] = useState({});
	const [storeData, setStoreData] = useState(null);
	const [currentTab, setCurrentTab] = useState('');
	const [announcement, setAnnouncement] = useState<any[]>([]);
	const [showUserDropdown, setShowUserDropdown] = useState(false);
	const [showNotifications, setShowNotifications] = useState(false);
	const [showAnnouncements, setshowAnnouncements] = useState(false);
	const [noPermission, setNoPermission] = useState(false);
	const [showStoreList, setShowStoreList] = useState(false);
	const [isDarkMode, setIsDarkMode] = useState(false);
	const userDropdownRef = useRef(null);
	const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
	const [isMenuMinmize, setisMenuMinmize] = useState(false);
	const { modules } = useModules();
	const [activeType, setActiveType] = useState<'notification' | 'activity'>('notification');

	const location = useLocation();
	const navigate = useNavigate();

	const loadComponent = (key) => {
		if (!endpoints || endpoints.length === 0) {
			return;
		}

		try {
			const activeEndpoint = endpoints.find((ep) => ep.tab === key);

			if (activeEndpoint?.filename) {
				const CustomComponent = require(
					`./dashboard/${activeEndpoint.filename}.tsx`
				).default;
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
		}).then((res: any) => {
			const data = res.data || {};
			setStoreData(data || null);
		});
	}, [appLocalizer.store_id]);

	useEffect(() => {
		axios({
			url: getApiLink(appLocalizer, 'endpoints'),
			method: 'GET',
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((res) => {
			setMenu(res.data || {});
		});
		if (modules.includes('announcement')) {
			axios({
				method: 'GET',
				url: getApiLink(appLocalizer, 'announcement'),
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: 1,
					row: 4,
					store_id: appLocalizer.store_id,
					status: 'publish'
				},
			})
				.then((response) => {
					setAnnouncement(response.data.items || []);
				})
				.catch(() => { });
		}

	}, []);

	// dark mode
	useEffect(() => {
		document.body.classList.add(appLocalizer.settings_databases_value['store-appearance']
			?.store_color_settings?.selectedPalette);
		document.body.classList.toggle('dark', isDarkMode);

		return () => {
			document.body.classList.remove('dark');
		};
	}, [isDarkMode]);

	const hasCapability = (capability: any) => {
		if (!capability) {
			return true;
		}

		const userCaps = appLocalizer.current_user?.allcaps || {};

		if (Array.isArray(capability)) {
			return capability.some((cap) => userCaps[cap] === true);
		}

		return userCaps[capability] === true;
	};

	useEffect(() => {
		if (!currentTab) {
			return;
		}

		let capability = null;

		for (const [key, item] of Object.entries(menu)) {
			if (key === currentTab) {
				capability = item.capability;
				break;
			}

			const sub = item.submenu?.find((s) => s.key === currentTab);
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
				filename: item.filename || key,
			});

			item.submenu?.forEach((sub) => {
				list.push({
					tab: sub.key,
					filename: sub.filename || sub.key,
				});
			});
		});

		return list;
	}, [menu]);

	const getBasePath = () => {
		const sitePath = new URL(appLocalizer.site_url).pathname;
		return sitePath.replace(/\/$/, '');
	};

	const DEFAULT_TAB = 'dashboard';

	const getCurrentTabFromURL = () => {
		const slug = appLocalizer.dashboard_slug;
		const base = getBasePath();

		if (appLocalizer.permalink_structure) {
			let path = location.pathname
				.replace(base, '')
				.replace(`/${slug}/`, '')
				.replace(/^\/+|\/+$/g, '');

			if (!path) {
				return DEFAULT_TAB;
			}

			const parts = path.split('/');
			return parts[0] || DEFAULT_TAB;
		}

		const query = new URLSearchParams(location.search);
		const segment = query.get('segment');

		if (!segment || segment === DEFAULT_TAB) {
			return DEFAULT_TAB;
		}

		return segment;
	};

	useEffect(() => {
		const tab = getCurrentTabFromURL() || endpoints[0]?.tab || DEFAULT_TAB;
		setCurrentTab(tab);
	}, [location.pathname, location.search, endpoints]);

	useEffect(() => {
		if (currentTab !== DEFAULT_TAB) {
			return;
		}

		const base = getBasePath();

		if (appLocalizer.permalink_structure) {
			const cleanUrl = `${base}/${appLocalizer.dashboard_slug}`;

			if (location.pathname !== cleanUrl) {
				window.history.replaceState({}, '', cleanUrl);
			}
			return;
		}

		const cleanUrl = `${base}/?page_id=${appLocalizer.dashboard_page_id}`;

		if (location.search !== `?page_id=${appLocalizer.dashboard_page_id}`) {
			window.history.replaceState({}, '', cleanUrl);
		}
	}, [currentTab]);

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
			if (!item.submenu?.length) {
				return;
			}

			const isParentActive = currentTab === key;
			const isChildActive = item.submenu.some(
				(s) => s.key === currentTab
			);

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

	const availableStores = appLocalizer.store_ids.filter((store) => {
		return appLocalizer.active_store
			? store.id !== String(appLocalizer.active_store)
			: true;
	});

	const firstTwoStores = availableStores.slice(0, 2);

	const switchStore = (storeId) => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `store/${storeId}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: { action: 'switch' },
		}).then((res: any) => {
			window.location.assign(res.data.redirect);
		});
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
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (
				userDropdownRef.current &&
				!userDropdownRef.current.contains(e.target)
			) {
				setShowUserDropdown(false);
				setShowStoreList(false);
				setShowNotifications(false);
				setshowAnnouncements(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () =>
			document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const toggleUserDropdown = () => {
		setShowUserDropdown((prev) => !prev);
		setShowNotifications(false);
		setshowAnnouncements(false);
	};

	// Toggle notifications
	const toggleNotifications = (e) => {
		e.stopPropagation();
		setShowNotifications((prev) => !prev);
		setShowUserDropdown(false);
		setshowAnnouncements(false);
	};

	const toggleAnnouncements = (e) => {
		e.stopPropagation();
		setshowAnnouncements((prev) => !prev);
		setShowNotifications(false);
		setShowUserDropdown(false);
	};

	const filteredMenu = useMemo(() => {
		const result: any = {};

		Object.entries(menu).forEach(([key, item]: any) => {
			if (!hasCapability(item.capability)) {
				return;
			}

			let filteredSubmenu = undefined;

			if (item.submenu?.length) {
				filteredSubmenu = item.submenu.filter((sub) =>
					hasCapability(sub.capability)
				);

				if (filteredSubmenu.length === 0) {
					return;
				}
			}

			result[key] = {
				...item,
				submenu: filteredSubmenu,
			};
		});

		return result;
	}, [menu]);
	const announcementItems = (announcement || []).map((item, index) => ({
		title: item.title,
		icon: 'adminfont-user-network-icon',
		desc: item.content,
		className: 'notification-item',
		action: () => {

		},
	}));
	return (
		<div
			id="store-dashboard"
			className={`${isDarkMode ? 'dark' : 'light'} ${isMenuCollapsed ? 'collapsed' : ''} ${isMenuMinmize ? 'minimize' : ''}`}
		>
			<div
				className="dashboard-tabs-wrapper"
				onMouseEnter={() => {
					setisMenuMinmize(false);
				}}
				onMouseOut={() => {
					setisMenuMinmize(true);
				}}
			>
				<div className="logo-wrapper">
					{store_dashboard_logo ? (
						<img src={store_dashboard_logo} alt="Site Logo" />
					) : (
						<span className="site-name">
							{isMenuCollapsed && isMenuMinmize
								? appLocalizer.site_name.charAt(0).toUpperCase()
								: appLocalizer.site_name}
						</span>
					)}
				</div>

				{storeData?.status == 'active' && (
					<div className="dashboard-tabs">
						<ul>
							{Object.entries(filteredMenu).map(([key, item]) => {
								if (!item.name) {
									return null;
								}

								const hasSubmenu = item.submenu?.length > 0;
								const isParentActive = currentTab === key;
								const isOpen = openSubmenus[key] || false;

								return (
									<li
										key={key}
										className={`tab-name ${isParentActive ? 'active' : ''
											}`}
									>
										<a
											className="tab"
											href={
												hasSubmenu
													? '#'
													: appLocalizer.permalink_structure
														? `/${appLocalizer.dashboard_slug}/${key}`
														: `/?page_id=${appLocalizer.dashboard_page_id}&segment=${key}`
											}
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
													className={`admin-arrow adminfont-pagination-right-arrow ${isOpen ? 'rotate' : ''
														}`}
												></i>
											)}
										</a>

										{hasSubmenu && (
											<ul
												className={`subtabs ${isOpen ? 'open' : ''
													}`}
											>
												{item.submenu.map((sub) => {
													const subActive =
														currentTab === sub.key;

													return (
														<li
															key={sub.key}
															className={
																subActive
																	? 'active'
																	: ''
															}
														>
															<a
																// href={`?segment=${sub.key}`}
																href={
																	appLocalizer.permalink_structure
																		? `/${appLocalizer.dashboard_slug}/${sub.key}`
																		: `/?page_id=${appLocalizer.dashboard_page_id}&segment=${sub.key}`
																}
																onClick={(
																	e
																) => {
																	e.preventDefault();
																	handleTabClick(
																		sub.key
																	);
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
							<i
								className="adminfont-menu toggle-menu-icon"
								onClick={() => {
									setIsMenuCollapsed((prev) => {
										const next = !prev;
										setisMenuMinmize(next);
										return next;
									});
								}}
							></i>
						</div>
						<div className="navbar-rightside">
							<ul className="navbar-right">
								<li
									onClick={() =>
										setIsDarkMode((prev) => !prev)
									}
								>
									<div
										className={`adminfont-icon admin-icon dark-icon ${isDarkMode
											? 'adminfont-light'
											: 'adminfont-moon'
											}`}
									></div>
								</li>

								<li className="tooltip-wrapper bottom">
									<i className="admin-icon adminfont-product-addon"></i>
									<span className="tooltip-name">
										Add product
									</span>
								</li>
								<li className="tooltip-wrapper bottom">
									<i className="admin-icon adminfont-storefront"></i>
									<span className="tooltip-name">view storefront</span>
								</li>
								{/* <li className="tooltip-wrapper bottom">
									<i
										className="adminfont-icon notification adminfont-notification"
										onClick={toggleNotifications}
									></i>
									<span className="tooltip-name">
										Notification
									</span>

									{showNotifications && <Notifications type="notification" />}
								</li> */}
								<li className="tooltip-wrapper bottom">
								<Popover
									template="tab"
									width="24rem"
									toggleIcon="adminfont-notification"
									toggleContent={<><span className="count">0</span> <span className="tooltip-name">Notification</span></>}
									onTabChange={(tabId) => {
										setActiveType(
											tabId === 'activities' ? 'activity' : 'notification'
										);
									}}
									header={
										<div className="title">
											{__('Notifications', 'multivendorx')}
											{/* {notifications?.length > 0 && (
												<span className="admin-badge yellow">
													{notifications?.length} {__('New', 'multivendorx')}
												</span>
											)} */}
										</div>
									}
									tabs={[
										{
											id: 'notifications',
											label: __("Notifications", 'multivendorx'),
											icon: 'adminfont-notification',
											content: (

												<ul className="notification-list">
													{/* {renderContent()} */}
												</ul>
											)
										},
										{
											id: 'activities',
											label: __("Activities", 'multivendorx'),
											icon: 'adminfont-activity',
											content: (
												<ul className="notification-list">
													{/* {renderContent()} */}
												</ul>
											)
										},
									]}
									footer={
										<div className="footer">
											{/* {activeType == 'notification' ? (

												<a
													href={`?page=multivendorx#&tab=notifications&subtab=notifications`}
													className="admin-btn btn-purple"
													onClick={() => setIsDropdownOpen(false)}
												>
													<i className="adminfont-eye"></i>
													{__('View all notifications', 'multivendorx')}
												</a>
											) : (
												<a
													href={`?page=multivendorx#&tab=notifications&subtab=activities`}
													className="admin-btn btn-purple"
													onClick={() => setIsDropdownOpen(false)}
												>
													<i className="adminfont-eye"></i>
													{__('View all activities', 'multivendorx')}
												</a>
											)} */}
											<a
													href={`?page=multivendorx#&tab=notifications&subtab=activities`}
													className="admin-btn btn-purple"
													// onClick={() => setIsDropdownOpen(false)}
												>
													<i className="adminfont-eye"></i>
													{__('View all activities', 'multivendorx')}
												</a>
										</div>
									}
								/>
								</li>
								<li className="tooltip-wrapper bottom">
								<Popover
									toggleIcon="adminfont-announcement"
									toggleContent={<span className="tooltip-name">Announcements</span>}
									template="notification"
									width="20rem"
									className="tooltip-wrapper bottom"
									items={announcement?.length
										? announcement.map((item, index) => ({
											title: item.title,
											desc: item.content,
											time: formatTimeAgo(item.date),
											icon: `adminfont-user-network-icon admin-color${index + 1}`,
											action: () => {
												// optional: handle click on individual announcement
												// handleNotificationClick(item.id)
											},
										}))
										: []}
									header={
										<div className="title">
											{__('Announcements', 'multivendorx')}
											{announcement && announcement.length > 0 && (
												<span className="admin-badge green">
													{announcement.length} {__('New', 'multivendorx')}
												</span>
											)}
										</div>
									}
									footer={
										<a
											href={
												appLocalizer.permalink_structure
													? `${appLocalizer.site_url.replace(/\/$/, '')}/${appLocalizer.dashboard_slug}/view-notifications/#subtab=announcements`
													: `${appLocalizer.site_url.replace(/\/$/, '')}/?page_id=${appLocalizer.dashboard_page_id}&segment=view-notifications#subtab=announcements`
											}
											className="admin-btn btn-purple"
										>
											<i className="adminfont-eye"></i>
											{__('View all announcements', 'multivendorx')}
										</a>
									}
								/>
								</li>

								<li
									id="fullscreenToggle"
									onClick={toggleFullscreen}
									className="tooltip-wrapper bottom"
								>
									<i className="admin-icon adminfont-crop-free"></i>
									<span className="tooltip-name">
										Full Screen
									</span>
								</li>

								<li
									className="dropdown login-user"
								>
									<div
										className="avatar-wrapper"
										onClick={toggleUserDropdown}
									>
										<i className="admin-icon adminfont-person"></i>
									</div>
									{showUserDropdown && (
										<div className="dropdown-menu" ref={userDropdownRef}>
											<div className="dropdown-header">
												<div className="user-card">
													<div className="user-avatar">
														<img
															src={
																appLocalizer.current_user_image
															}
															alt={
																appLocalizer
																	.current_user
																	?.data
																	?.display_name
															}
															width={48}
															height={48}
														/>
													</div>

													<div className="user-info">
														<span className="user-name">
															{
																appLocalizer
																	.current_user
																	?.data
																	?.display_name
															}
														</span>
														<span className="user-email">
															{
																appLocalizer
																	.current_user
																	?.data
																	?.user_email
															}
														</span>
													</div>
												</div>
											</div>

											<div className="dropdown-body">
												<ul>
													<li>
														<a href="#">
															<i className="adminfont-person"></i>
															My Profile
														</a>
													</li>

													<li>
														<a href="#">
															<i className="adminfont-setting"></i>
															Account Setting
														</a>
													</li>
													{availableStores.length >
														0 && (
															<li className="switch-store-wrapper">
																<a
																	href="#"
																	onClick={(
																		e
																	) => {
																		e.preventDefault();
																		setShowStoreList(
																			(
																				prev
																			) =>
																				!prev
																		);
																	}}
																>
																	<i className="adminfont-switch-store"></i>
																	Switch stores
																	{firstTwoStores.length >
																		0 && (
																			<span className="switch-store-preview">
																				{!showStoreList && (
																					<>
																						{firstTwoStores.map(
																							(
																								store,
																								index
																							) => (
																								<span
																									className={`store-icon admin-color${index + 2}`}
																									key={
																										store.id
																									}
																								>
																									{store.name
																										.charAt(
																											0
																										)
																										.toUpperCase()}
																								</span>
																							)
																						)}

																						{availableStores.length >
																							2 && (
																								<span className="store-icon number">
																									+
																									{availableStores.length -
																										2}
																								</span>
																							)}
																					</>
																				)}
																				<span className="adminfont-keyboard-arrow-down arrow-icon"></span>
																			</span>
																		)}
																</a>

																{showStoreList && (
																	<div className="switch-store-list">
																		{availableStores.map(
																			(
																				store,
																				index
																			) => (
																				<div
																					className="store"
																					key={
																						store.id
																					}
																				>
																					<a
																						href="#"
																						className="switch-store"
																						onClick={(
																							e
																						) => {
																							e.preventDefault();
																							switchStore(
																								store.id
																							);
																						}}
																					>
																						<span
																							className={`store-icon admin-color${index + 2}`}
																						>
																							{store.name
																								.charAt(
																									0
																								)
																								.toUpperCase()}
																						</span>
																						<div className="details-wrapper">
																							<div className="store-name">
																								{
																									store.name
																								}
																							</div>
																						</div>
																					</a>
																				</div>
																			)
																		)}
																	</div>
																)}
															</li>
														)}
												</ul>
											</div>

											<div className="footer">
												<a
													className="admin-btn btn-red"
													href={
														appLocalizer.user_logout_url
													}
												>
													<i className="adminfont-import"></i>{' '}
													Sign Out
												</a>
											</div>
										</div>
									)}
								</li>
							</ul>
						</div>
					</div>
				</div>

				<div className="content-wrapper">
					{storeData && storeData.status !== 'active' ? (
						<div className="permission-wrapper">
							<i className="adminfont-info red"></i>
							<div className="title">
								{storeData.status === 'pending' ? (
									appLocalizer.settings_databases_value[
										'pending'
									]?.pending_msg
								) : storeData.status === 'suspended' ? (
									appLocalizer.settings_databases_value[
										'suspended'
									]?.suspended_msg
								) : storeData.status === 'under_review' ? (
									appLocalizer.settings_databases_value[
										'under-review'
									]?.under_review_msg
								) : storeData.status === 'rejected' ? (
									<>
										{
											appLocalizer
												.settings_databases_value[
												'rejected'
											]?.rejected_msg
										}{' '}
										<a
											href={
												appLocalizer.registration_page
											}
											className="reapply-link"
											target="__blank"
										>
											Click here to reapply.
										</a>
									</>
								) : (
									'No active store select for this user.'
								)}
							</div>
							<div className="admin-btn btn-purple">
								Contact Admin
							</div>
						</div>
					) : noPermission ? (
						<div className="permission-wrapper">
							<i className="adminfont-info red"></i>
							<div className="title">
								You do not have permission to access this page.
							</div>
							<div className="admin-btn btn-purple">
								Contact Admin
							</div>
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
