import { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import {
	getApiLink,
	ComponentStatusView,
	Tabs,
	PopupUI,
	useModules,
	Tooltip,
} from 'zyra';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import './hooksFilters';
import { DASHBOARD_ROUTES } from './dashboardConfig';

/**
 * Builds a navigable path string.
 *
 * Pretty permalinks  → relative path used with react-router navigate()
 *                      e.g.  "/products/edit/123"
 *
 * Plain permalinks   → also a relative path for MemoryRouter navigate(),
 *                      AND separately updates window.history so the browser
 *                      URL bar reflects the correct query-param URL.
 */
const buildPath = (segments: string[]): string => `/${segments.filter(Boolean).join('/')}`;

const sanitize = (value: string) =>
	value.replace(/[^a-zA-Z0-9_-]/g, '');

const updatePlainPermalinkUrl = (segments: string[]) => {
	const [segment = '', element = '', context_id = ''] = segments;

	const params = new URLSearchParams({
		page_id: appLocalizer.dashboard_page_id,
		segment: sanitize(segment),
		...(element ? { element: sanitize(element) } : {}),
		...(context_id ? { context_id: sanitize(context_id) } : {}),
	});

	window.history.pushState(
		{},
		'',
		`${window.location.pathname}?${params.toString()}`
	);
};

const Dashboard = () => {
	const { tab: urlTab, element, context_id } = useParams();
	const navigate = useNavigate();

	const [menu, setMenu]                           = useState<Record<string, any>>({});
	const [openSubmenus, setOpenSubmenus]           = useState<Record<string, boolean>>({});
	const [storeData, setStoreData]                 = useState<any>(null);
	const [currentTab, setCurrentTab]               = useState('');
	const [announcement, setAnnouncement]           = useState<any[]>([]);
	const [showUserDropdown, setShowUserDropdown]   = useState(false);
	const [showStoreList, setShowStoreList]         = useState(false);
	const [isDarkMode, setIsDarkMode]               = useState(false);
	const [isMenuCollapsed, setIsMenuCollapsed]     = useState(false);
	const [isMenuMinmize, setisMenuMinmize]         = useState(false);
	const [noPermission, setNoPermission]           = useState(false);
	const [newProductId, setNewProductId]           = useState<number | null>(null);

	const userDropdownRef = useRef<HTMLDivElement>(null);
	const { modules }     = useModules();

	const DEFAULT_TAB = 'dashboard';

	const hasCapability = (capability: any): boolean => {
		if (!capability) return true;
		const userCaps = appLocalizer.current_user?.allcaps || {};
		if (Array.isArray(capability)) return capability.some((cap) => userCaps[cap] === true);
		return userCaps[capability] === true;
	};

	const isModuleActive = (requiredModules: any): boolean => {
		if (!requiredModules) return true;
		return requiredModules.some((m: string) => modules.includes(m));
	};

	/**
	 * Navigate within the dashboard.
	 * Handles both permalink modes transparently.
	 *
	 * @param segments  e.g. ['products'], ['products', 'edit'], ['products', 'edit', '123']
	 */
	const dashNavigate = (segments: string[]) => {
		const ALLOWED_SEGMENTS = ['products', 'orders', 'dashboard'];

		if (!ALLOWED_SEGMENTS.includes(segments)) {
			return;
		}
		const path = buildPath(segments);
		if (!appLocalizer.permalink_structure) {
			updatePlainPermalinkUrl(segments);
		}
		navigate(path);
	};

	const storefrontUrl = `${appLocalizer.store_page_url}${storeData?.slug}`;

	const createAutoDraftProduct = () => {
		axios
			.post(
				`${appLocalizer.apiUrl}/wc/v3/products/`,
				{ name: 'Auto Draft', status: 'draft' },
				{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
			)
			.then((res) => setNewProductId(res.data.id))
			.catch((err) => console.error('Error creating auto draft product:', err));
	};

	useEffect(() => {
		if (!newProductId) return;
		dashNavigate(['products', 'edit', String(newProductId)]);
	}, [newProductId]);


	useEffect(() => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((res: any) => setStoreData(res.data || null));
	}, [appLocalizer.store_id]);

	useEffect(() => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'endpoints'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((res) => setMenu(res.data || {}));

		if (modules.includes('announcement')) {
			axios({
				method: 'GET',
				url: getApiLink(appLocalizer, 'announcement'),
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: { page: 1, row: 4, store_id: appLocalizer.store_id, status: 'publish' },
			})
				.then((res) => setAnnouncement(res.data.items || []))
				.catch(() => {});
		}
	}, []);

	// Dark mode
	useEffect(() => {
		const palette =
			appLocalizer.settings_databases_value['appearance']
				?.store_color_settings?.selectedPalette;
		if (palette) document.body.classList.add(palette);
		document.body.classList.toggle('dark', isDarkMode);
		return () => document.body.classList.remove('dark');
	}, [isDarkMode]);

	// Sync current tab from URL params
	useEffect(() => {
		setCurrentTab(urlTab || DEFAULT_TAB);
	}, [urlTab]);

	// Permission check for current tab
	useEffect(() => {
		if (!currentTab) return;

		let capability = null;
		for (const [key, item] of Object.entries(menu)) {
			if (key === currentTab) {
				capability = item.capability;
				break;
			}
			const sub = item.submenu?.find((s: any) => s.key === currentTab);
			if (sub) {
				capability = sub.capability;
				break;
			}
		}
		setNoPermission(!hasCapability(capability));
	}, [currentTab, menu]);

	// Auto-open parent submenu when a child tab is active
	useEffect(() => {
		const open: Record<string, boolean> = {};
		Object.entries(menu).forEach(([key, item]) => {
			if (!item.submenu?.length) return;
			const isParentActive = currentTab === key;
			const isChildActive  = item.submenu.some((s: any) => s.key === currentTab);
			if (isParentActive || isChildActive) open[key] = true;
		});
		setOpenSubmenus(open);
	}, [currentTab, menu]);

	// Submenu toggle (closes other open submenus)
	const toggleSubmenu = (key: string) => {
		setOpenSubmenus((prev) => {
			const updated: Record<string, boolean> = {};
			Object.keys(menu).forEach((menuKey) => {
				updated[menuKey] = menuKey === key ? !prev[key] : false;
			});
			return updated;
		});
	};

	// Endpoint list
	const endpoints = useMemo(() => {
		const list: { tab: string; filename: string }[] = [];
		Object.entries(menu).forEach(([key, item]) => {
			list.push({ tab: key, filename: item.filename || key });
			item.submenu?.forEach((sub: any) =>
				list.push({ tab: sub.key, filename: sub.filename || sub.key })
			);
		});
		return list;
	}, [menu]);

	const loadComponent = (key: string) => {
		if (!endpoints.length) return null;

		try {

			const matchedRoute = DASHBOARD_ROUTES.find(
				(route) =>
					route.tab === urlTab &&
					route.element === element
			);

			if (matchedRoute) {
				const Component = matchedRoute.component;
				return <Component contextId={context_id} />;
			}

			const activeEndpoint = endpoints.find((ep) => ep.tab === key);
			const kebabToCamelCase = (str: string) =>
				str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
			const convertedKey = kebabToCamelCase(activeEndpoint?.filename || key);
			
			try {
				const DashboardComponent = require(`./dashboard/${convertedKey}.tsx`).default;
				return <DashboardComponent contextId={context_id} />;
			} catch {
				// fall through to filter
			}

			return applyFilters('multivendorx_pro_dashboard_component', null, convertedKey);
		} catch {
			return <div>404 not found</div>;
		}
	};

	// Menu filtered by capability + active modules
	const filteredMenu = useMemo(() => {
		const result: Record<string, any> = {};
		Object.entries(menu).forEach(([key, item]: any) => {
			if (!hasCapability(item.capability)) return;
			if (!isModuleActive(item.module)) return;

			let filteredSubmenu = item.submenu;
			if (item.submenu?.length) {
				filteredSubmenu = item.submenu.filter(
					(sub: any) => hasCapability(sub.capability) && isModuleActive(sub.module)
				);
				if (filteredSubmenu.length === 0) return;
			}
			result[key] = { ...item, submenu: filteredSubmenu };
		});
		return result;
	}, [menu, modules]);

	const tabHref = (tab: string): string => {
		if (appLocalizer.permalink_structure) {
			return `${appLocalizer.site_url.replace(/\/$/, '')}/${appLocalizer.dashboard_slug}/${tab}`;
		}
		return `${appLocalizer.site_url.replace(/\/$/, '')}/?page_id=${appLocalizer.dashboard_page_id}&segment=${tab}`;
	};

	const store_dashboard_logo =
		appLocalizer.settings_databases_value['appearance']?.store_dashboard_site_logo || '';

	const availableStores = appLocalizer.store_ids.filter((store) => {
		return appLocalizer.store_id
			? store.id !== String(appLocalizer.store_id)
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
			document.documentElement.requestFullscreen().catch((err) =>
				console.warn(`Fullscreen error: ${err.message}`)
			);
		} else {
			document.exitFullscreen();
		}
	};

	const toggleUserDropdown = () => setShowUserDropdown((prev) => !prev);

	return (
		<div
			id="store-dashboard"
			className={[
				isDarkMode       ? 'dark'     : 'light',
				isMenuCollapsed  ? 'collapsed' : '',
				isMenuMinmize    ? 'minimize'  : '',
			]
				.filter(Boolean)
				.join(' ')}
		>
			<div
				className="dashboard-tabs-wrapper"
				onMouseEnter={() => setisMenuMinmize(false)}
				onMouseOut={()   => setisMenuMinmize(true)}
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

				{storeData?.status === 'active' && (
					<div className="dashboard-tabs">
						<ul>
							{Object.entries(filteredMenu).map(([key, item]) => {
								if (!item.name) return null;

								const hasSubmenu    = item.submenu?.length > 0;
								const isParentActive = currentTab === key;
								const isOpen        = openSubmenus[key] || false;

								return (
									
									<li key={key} className={`tab-name ${isParentActive ? 'active' : ''}`}>
										{hasSubmenu ? (
											// Submenu parent — no navigation, just toggle
											<a
												className="tab"
												onClick={() => toggleSubmenu(key)}
											>
												<i className={`adminfont-${item.icon}`}></i>
												<span>{item.name}</span>
												<i className={`admin-arrow adminfont-pagination-right-arrow ${isOpen ? 'rotate' : ''}`}></i>
											</a>
										) : (
											// Regular tab — let NavLink handle routing
											<NavLink
												className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}
												to={`/${key}`}                    // ← always a path; NavLink works in both BrowserRouter & MemoryRouter
												onClick={() => setCurrentTab(key)}
											>
												<i className={`adminfont-${item.icon}`}></i>
												<span>{item.name}</span>
											</NavLink>
										)}

										{hasSubmenu && (
											<ul className={`subtabs ${isOpen ? 'open' : ''}`}>
												{item.submenu.map((sub: any) => (
													<li key={sub.key}>
														<NavLink
															className={({ isActive }) => isActive ? 'active' : ''}
															to={`/${sub.key}`}
															onClick={() => setCurrentTab(sub.key)}
														>
															{sub.name}
														</NavLink>
													</li>
												))}
											</ul>
										)}
									</li>
								);
							})}
						</ul>
					</div>
				)}
			</div>

			{/* Main content area                                                 */}
			<div className="dashboard-content tab-wrapper">
				{/* Top Navbar */}
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
								{/* Dark mode toggle */}
								<li onClick={() => setIsDarkMode((prev) => !prev)}>
									<div
										className={`adminfont-icon admin-icon dark-icon adminfont-${
											isDarkMode ? 'light' : 'moon'
										}`}
									></div>
								</li>

								{/* Add product */}
								<Tooltip text={__('Add product', 'multivendorx')}>
									<li
										onClick={() => {
											if (modules.includes('shared-listing')) {
												dashNavigate(['products', 'add']);
											} else {
												createAutoDraftProduct();
											}
										}}
									>
										<i className="admin-icon adminfont-product-addon"></i>
									</li>
								</Tooltip>

								{/* View storefront */}
								<Tooltip text={__('View storefront', 'multivendorx')}>
									<li onClick={() => window.open(storefrontUrl, '_blank')}>
										<i className="admin-icon adminfont-storefront"></i>
									</li>
								</Tooltip>

								{/* Notifications */}
								<Tooltip text={__('Notifications', 'multivendorx')}>
									<li>
										<PopupUI
											position="menu-dropdown"
											toggleIcon="adminfont-notification"
											width={24}
											header={{
												title: __('Notifications', 'multivendorx'),
												showCloseButton: false,
											}}
										>
											<Tabs
												tabs={[
													{
														id: 'notifications',
														label: __('Notifications', 'multivendorx'),
														icon: 'adminfont-notification',
														content: <ul className="notification-list"></ul>,
														footer: {
															url: tabHref('view-notifications') + '#subtab=notifications',
															icon: 'adminfont-eye',
															text: __('View all notifications', 'multivendorx'),
														},
													},
													{
														id: 'activities',
														label: __('Activities', 'multivendorx'),
														icon: 'adminfont-activity',
														content: <ul className="notification-list"></ul>,
														footer: {
															url: tabHref('view-notifications') + '#subtab=activity',
															icon: 'adminfont-eye',
															text: __('View all activities', 'multivendorx'),
														},
													},
												]}
											/>
										</PopupUI>
									</li>
								</Tooltip>

								{/* Announcements */}
								{modules.includes('announcement') && (
									<Tooltip text={__('Announcement', 'multivendorx')}>
										<li>
											{/* Mount your Announcement popover here */}
										</li>
									</Tooltip>
								)}

								{/* Fullscreen */}
								<Tooltip text={__('Full Screen', 'multivendorx')}>
									<li id="fullscreenToggle" onClick={toggleFullscreen}>
										<i className="admin-icon adminfont-crop-free"></i>
									</li>
								</Tooltip>

								{/* User dropdown */}
								<Tooltip text={__('Settings', 'multivendorx')}>
									<li className="dropdown login-user">
										<div className="avatar-wrapper" onClick={toggleUserDropdown}>
											<i className="admin-icon adminfont-person"></i>
										</div>

										{showUserDropdown && (
											<div className="dropdown-menu" ref={userDropdownRef}>
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
															<span className="user-name">
																{appLocalizer.current_user?.data?.display_name}
															</span>
															<span className="user-email">
																{appLocalizer.current_user?.data?.user_email}
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
																	Switch
																	stores
																	{firstTwoStores.length >
																		0 && (
																		<span className="switch-store-preview">
																			{!showStoreList && (
																				<>
																					{firstTwoStores.map((store, index) => (
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
																					key={ store.id }
																				>
																					<a
																						href="#"
																						className="switch-store"
																						onClick={( e ) => {
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
																								.charAt( 0 ) .toUpperCase()}
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
														href={appLocalizer.user_logout_url}
													>
														<i className="adminfont-import"></i> Sign Out
													</a>
												</div>
											</div>
										)}
									</li>
								</Tooltip>
							</ul>
						</div>
					</div>
				</div>

				{/* Page content */}
				<div className="content-wrapper">
					{storeData && storeData.status !== 'active' ? (
						<ComponentStatusView
							title={__('Your store is not active', 'multivendorx')}
							desc={__('To get started, register your store.', 'multivendorx')}
							buttonText={__('Create your store', 'multivendorx')}
							buttonLink={appLocalizer.registration_page}
							buttonTarget="_blank"
						/>
					) : noPermission ? (
						<ComponentStatusView
							title={__('You do not have permission to access this page.', 'multivendorx')}
							buttonText={__('Contact Admin', 'multivendorx')}
							onButtonClick={() => {}}
						/>
					) : (
						loadComponent(currentTab)
					)}
				</div>
			</div>
		</div>
	);
};

export default Dashboard;