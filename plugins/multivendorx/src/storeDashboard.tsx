/* global appLocalizer */
import { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import {
	getApiLink,
	ComponentStatusView,
	PopupUI,
	useModules,
	Tooltip,
	TabsUI,
	NoticeReceiver,
	GuidedTourProvider,
} from 'zyra';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import './metaBoxes';
import { getDashboardRoutes } from './dashboardConfig';
import { dashNavigate } from './services/commonFunction';
import { getTourSteps } from './dashboard/Tours';
interface SubmenuItem {
	key: string;
	name: string;
	filename?: string;
	capability?: string | string[];
	module?: string[];
}

interface StoreData {
	slug?: string;
	status?: string;
	name?: string;
	[key: string]: unknown;
}

interface MenuItem {
	name: string;
	icon: string;
	filename?: string;
	capability?: string | string[];
	module?: string[];
	submenu?: SubmenuItem[];
}
const Dashboard = () => {
	const { tab: urlTab, element, context_id } = useParams();
	const navigate = useNavigate();

	const [menu, setMenu] = useState<Record<string, MenuItem>>({});
	const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>(
		{}
	);
	const [storeData, setStoreData] = useState<StoreData | null>(null);
	const [currentTab, setCurrentTab] = useState('');
	const [showUserDropdown, setShowUserDropdown] = useState(false);
	const [showStoreList, setShowStoreList] = useState(false);
	const [isDarkMode, setIsDarkMode] = useState(false);
	const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
	const [isMenuMinimize, setisMenuMinimize] = useState(false);
	const [noPermission, setNoPermission] = useState(false);
	const [newProductId, setNewProductId] = useState<number | null>(null);

	const userDropdownRef = useRef<HTMLDivElement>(null);
	const { modules } = useModules();

	const DEFAULT_TAB = 'dashboard';

	const hasCapability = (capability: string | string[] | null): boolean => {
		if (!capability) {
			return true;
		}
		const overrideResult = applyFilters(
			'multivendorx_override_capability',
			null,
			capability
		);

		// If membership handled it → stop here
		if (overrideResult !== null) {
			return overrideResult;
		}
		const userCaps = appLocalizer.current_user?.allcaps || {};
		if (Array.isArray(capability)) {
			return capability.some((cap) => userCaps[cap] === true);
		}
		return userCaps[capability] === true;
	};

	const isModuleActive = (requiredModules: string[]): boolean => {
		if (!requiredModules) {
			return true;
		}
		return requiredModules.some((m: string) => modules.includes(m));
	};

	const storefrontUrl = `${appLocalizer.store_page_url}${storeData?.slug}`;

	const createAutoDraftProduct = () => {
		axios
			.post(
				`${appLocalizer.apiUrl}/wc/v3/products/`,
				{ name: 'Auto Draft', status: 'draft', 
					meta_data: [
						{ key: '_is_auto_draft', value: true }
					]
				 },
				{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
			)
			.then((res) => setNewProductId(res.data.id))
			.catch((err) =>
				console.error('Error creating auto draft product:', err)
			);
	};

	useEffect(() => {
		if (!newProductId) {
			return;
		}
		dashNavigate(navigate, ['products', 'edit', String(newProductId)]);
	}, [newProductId]);

	useEffect(() => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((res) => setStoreData(res.data || null));
	}, [appLocalizer.store_id]);

	useEffect(() => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'endpoints'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((res) => setMenu(res.data || {}));
	}, []);

	// Dark mode
	useEffect(() => {
		const palette =
			appLocalizer.settings_databases_value['appearance']
				?.store_color_settings?.selectedPalette;
		if (palette) {
			document.body.classList.add(palette);
		}
		document.body.classList.toggle('dark', isDarkMode);
		return () => document.body.classList.remove('dark');
	}, [isDarkMode]);

	// Sync current tab from URL params
	useEffect(() => {
		setCurrentTab(urlTab || DEFAULT_TAB);
	}, [urlTab]);

	// Permission check for current tab
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

	// Auto-open parent submenu when a child tab is active
	useEffect(() => {
		const open: Record<string, boolean> = {};
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
			item.submenu?.forEach((sub) =>
				list.push({ tab: sub.key, filename: sub.filename || sub.key })
			);
		});
		return list;
	}, [menu]);

	const loadComponent = (key: string) => {
		if (!endpoints.length) {
			return null;
		}

		try {
			const routes = getDashboardRoutes();
			const matchedRoute = routes.find(
				(route) => route.tab === urlTab && route.element === element
			);

			if (matchedRoute) {
				const Component = matchedRoute.component;
				return <Component contextId={context_id} />;
			}

			const activeEndpoint = endpoints.find((ep) => ep.tab === key);
			const kebabToCamelCase = (str: string) =>
				str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
			const convertedKey = kebabToCamelCase(
				activeEndpoint?.filename || key
			);

			try {
				const DashboardComponent = require(
					`./dashboard/${convertedKey}.tsx`
				).default;
				return <DashboardComponent contextId={context_id} />;
			} catch {
				// fall through to filter
			}

			return applyFilters(
				'multivendorx_pro_dashboard_component',
				null,
				convertedKey
			);
		} catch {
			return <div>404 not found</div>;
		}
	};

	// Menu filtered by capability + active modules
	const filteredMenu = useMemo(() => {
		const result = {};
		Object.entries(menu).forEach(([key, item]: [string, MenuItem]) => {
			if (!hasCapability(item.capability)) {
				return;
			}
			if (!isModuleActive(item.module)) {
				return;
			}

			let filteredSubmenu = item.submenu;

			if (item.submenu?.length) {
				filteredSubmenu = item.submenu.filter((sub) => {
					const hasCap = hasCapability(sub.capability);
					const hasModule = isModuleActive(sub.module);

					let hasSetting = true;

					if (sub.key === 'withdrawls') {
						hasSetting =
							appLocalizer.settings_databases_value?.['payouts']
								?.withdraw_type != 'disable';
					}

					return hasCap && hasModule && hasSetting;
				});
				if (filteredSubmenu.length === 0) {
					return;
				}
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
		appLocalizer.settings_databases_value['appearance']
			?.store_dashboard_site_logo || '';
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
		}).then((res) => {
			window.location.assign(res.data.redirect);
		});
	};

	const toggleFullscreen = () => {
		if (!document.fullscreenElement) {
			document.documentElement
				.requestFullscreen()
				.catch((err) =>
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
				isDarkMode ? 'dark' : 'light',
				isMenuCollapsed ? 'collapsed' : '',
				isMenuMinimize ? 'minimize' : '',
			]
				.filter(Boolean)
				.join(' ')}
		>
			<GuidedTourProvider
				appLocalizer={appLocalizer}
				steps={getTourSteps(appLocalizer)}
				storeId={appLocalizer.store_id}
			/>
			<div className="dashboard-tabs-wrapper">
				<div className="logo-wrapper">
					{store_dashboard_logo ? (
						<img src={store_dashboard_logo.url} alt="Site Logo" />
					) : (
						<span className="site-name">
							{isMenuCollapsed && isMenuMinimize
								? appLocalizer.site_name.charAt(0).toUpperCase()
								: appLocalizer.site_name}
						</span>
					)}
				</div>

				{storeData?.status === 'active' && (
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
										className={`tab-name ${isParentActive ? 'active' : ''}`}
									>
										{hasSubmenu ? (
											// Submenu parent — no navigation, just toggle
											<a
												className="tab"
												onClick={() =>
													toggleSubmenu(key)
												}
											>
												<i
													className={`adminfont-${item.icon}`}
												></i>
												<span>{item.name}</span>
												<i
													className={`admin-arrow adminfont-pagination-right-arrow ${isOpen ? 'rotate' : ''}`}
												></i>
											</a>
										) : (
											// Regular tab — let NavLink handle routing
											<NavLink
												className={({ isActive }) =>
													`tab ${isActive ? 'active' : ''}`
												}
												to={`/${key}`} // ← always a path; NavLink works in both BrowserRouter & MemoryRouter
												onClick={() =>
													setCurrentTab(key)
												}
											>
												<i
													className={`adminfont-${item.icon}`}
												></i>
												<span>{item.name}</span>
											</NavLink>
										)}

										{hasSubmenu && (
											<ul
												className={`subtabs ${isOpen ? 'open' : ''}`}
											>
												{item.submenu.map((sub) => (
													<li key={sub.key}>
														<NavLink
															className={({
																isActive,
															}) =>
																isActive
																	? 'active'
																	: ''
															}
															to={`/${sub.key}`}
															onClick={() =>
																setCurrentTab(
																	sub.key
																)
															}
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

			{/* Main content area */}
			<div className="dashboard-content tab-wrapper">
				{/* Top Navbar */}
				<div className="top-navbar-wrapper">
					<div className="top-navbar">
						<div className="navbar-leftside">
							<i
								className={`adminfont-${isMenuCollapsed ? 'menu' : 'arrow-left'} toggle-menu-icon`}
								onClick={() => {
									setIsMenuCollapsed((prev) => {
										const next = !prev;
										setisMenuMinimize(next);
										return next;
									});
								}}
							></i>
						</div>

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
							<Tooltip
								position="bottom"
								text={__('Add product', 'multivendorx')}
							>
								<li
									onClick={() => {
										if (
											modules.includes('shared-listing')
										) {
											dashNavigate(navigate, [
												'products',
												'add',
											]);
										} else {
											createAutoDraftProduct();
										}
									}}
								>
									<i className="admin-icon adminfont-product-addon"></i>
								</li>
							</Tooltip>

							{/* View storefront */}
							<Tooltip
								position="bottom"
								text={__('View storefront', 'multivendorx')}
							>
								<li
									onClick={() =>
										window.open(storefrontUrl, '_blank')
									}
								>
									<i className="admin-icon adminfont-storefront"></i>
								</li>
							</Tooltip>

							{/* Notifications */}
							<li>
								<PopupUI
									position="menu-dropdown"
									toggleIcon="notification"
									tooltipName={__(
										'Notifications',
										'multivendorx'
									)}
									width={24}
									header={{
										title: __(
											'Notifications',
											'multivendorx'
										),
									}}
								>
									<TabsUI
										tabs={[
											{
												id: 'notifications',
												label: __(
													'Notifications',
													'multivendorx'
												),
												icon: 'adminfont-notification',
												content: (
													<ul className="notification-list"></ul>
												),
												footer: {
													url:
														tabHref(
															'view-notifications'
														) +
														'#subtab=notifications',
													icon: 'adminfont-eye',
													text: __(
														'View all notifications',
														'multivendorx'
													),
												},
											},
											{
												id: 'activities',
												label: __(
													'Activities',
													'multivendorx'
												),
												icon: 'adminfont-activity',
												content: (
													<ul className="notification-list"></ul>
												),
												footer: {
													url:
														tabHref(
															'view-notifications'
														) + '#subtab=activity',
													icon: 'adminfont-eye',
													text: __(
														'View all activities',
														'multivendorx'
													),
												},
											},
										]}
									/>
								</PopupUI>
							</li>

							{/* Announcements */}
							{modules.includes('announcement') && (
								<Tooltip
									position="bottom"
									text={__('Announcement', 'multivendorx')}
								>
									<li>
										<a
											href={
												tabHref('view-notifications') +
												'#subtab=announcements'
											}
										>
											<i className="admin-icon adminfont-announcement"></i>
										</a>
									</li>
								</Tooltip>
							)}

							{/* Fullscreen */}
							<Tooltip
								position="bottom"
								text={__('Full Screen', 'multivendorx')}
							>
								<li
									id="fullscreenToggle"
									onClick={toggleFullscreen}
								>
									<i className="admin-icon adminfont-crop-free"></i>
								</li>
							</Tooltip>

							{/* User dropdown */}
							<Tooltip
								position="bottom"
								text={__('Settings', 'multivendorx')}
							>
								<li className="dropdown login-user">
									<div
										className="avatar-wrapper"
										onClick={toggleUserDropdown}
									>
										<i className="admin-icon adminfont-person"></i>
									</div>

									{showUserDropdown && (
										<div
											className="dropdown-menu"
											ref={userDropdownRef}
										>
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
							</Tooltip>
						</ul>
					</div>
				</div>

				{/* Page content */}
				<div className="content-wrapper">
					<NoticeReceiver position="float" />
					<NoticeReceiver position="notice" />

					{storeData && storeData.status !== 'active' ? (
						<ComponentStatusView
							title={__(
								'Your store is not active',
								'multivendorx'
							)}
							desc={__(
								'To get started, register your store.',
								'multivendorx'
							)}
							buttonText={__('Create your store', 'multivendorx')}
							buttonLink={appLocalizer.registration_page}
							buttonTarget="_blank"
						/>
					) : noPermission ? (
						<ComponentStatusView
							title={__(
								'You do not have permission to access this page.',
								'multivendorx'
							)}
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
