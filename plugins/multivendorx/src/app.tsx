/* global appLocalizer */
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
	AdminHeader,
	SequentialTaskExecutor,
	FormGroup,
	FormGroupWrapper,
	PopupUI,
	GuidedTourProvider,
	Notice,
} from 'zyra';

import Brand from './assets/images/multivendorx-logo.png';
import { searchIndex, SearchItem } from './searchIndex';
import { __ } from '@wordpress/i18n';
import { getTourSteps } from './components/Tour/Tours';
import NotificationTabContent from './components/Notifications/HeaderNotifications';
import './routeRegistry';
import './routes';

// Auto-load all modules src folder.
const modulesContext = require.context(
	'../modules',
	true,
	/\/src\/index\.(ts|tsx)$/
);

modulesContext.keys().forEach(modulesContext);

localStorage.setItem('force_multivendorx_context_reload', 'true');

const Route = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [routes, setRoutes] = useState([...window.MULTIVENDORX_ROUTES]);

	useEffect(() => {
		const complianceStore = window.multivendorxComplianceStore;
		const approvalStore = window.multivendorxStore;
		const commissions = window.multivendorxCommissionStore;
		const customers = window.multivendorxCustomerStore;

		const unsubscribeCompliance = complianceStore?.subscribe((counts) => {
			const el = document.querySelector(
				`.multivendorx-count[data-tab="compliance"]`
			);
			if (!el) {
				return;
			}
			let value = counts || 0;
			if (typeof value === 'object') {
				value = Object.values(value).reduce((sum, v) => sum + v, 0);
			}
			el.innerText = value;
		});

		const unsubscribeApproval = approvalStore?.subscribe((counts) => {
			const el = document.querySelector(
				`.multivendorx-count[data-tab="approval-queue"]`
			);
			if (!el) {
				return;
			}
			let value = counts || 0;
			if (typeof value === 'object') {
				value = Object.values(value).reduce((sum, v) => sum + v, 0);
			}
			el.innerText = value;
		});

		const unsubscribeCommissions = commissions?.subscribe((counts) => {
			const el = document.querySelector(
				`.multivendorx-count[data-tab="commissions"]`
			);
			if (!el) {
				return;
			}
			let value = counts || 0;
			if (typeof value === 'object') {
				value = Object.values(value).reduce((sum, v) => sum + v, 0);
			}
			el.innerText = value;
		});

		const unsubscribeCustomers = customers?.subscribe((counts) => {
			const el = document.querySelector(
				`.multivendorx-count[data-tab="customers"]`
			);
			if (!el) {
				return;
			}
			let value = counts || 0;
			if (typeof value === 'object') {
				value = Object.values(value).reduce((sum, v) => sum + v, 0);
			}
			el.innerText = value;
		});

		return () => {
			unsubscribeCompliance && unsubscribeCompliance();
			unsubscribeApproval && unsubscribeApproval();
			unsubscribeCommissions && unsubscribeCommissions();
			unsubscribeCustomers && unsubscribeCustomers();
		};
	}, [routes]);

	useEffect(() => {
		const updateRoutes = () => {
			setRoutes([...window.MULTIVENDORX_ROUTES]);
		};

		window.addEventListener('multivendorx-routes', updateRoutes);

		return () =>
			window.removeEventListener('multivendorx-routes', updateRoutes);
	}, []);

	const tab = new URLSearchParams(location.hash).get('tab') || 'dashboard';

	const route = routes.find((r) => r.tab === tab);
	const Component = route?.component;

	if (!Component) {
		return null;
	}

	return (
		<Component
			id={tab}
			location={location}
			navigate={navigate}
			Link={Link}
		/>
	);
};

const App = () => {
	const currentTabParams = new URLSearchParams(useLocation().hash);
	const [openFeaturePopup, setOpenFeaturePopup] = useState(false);
	const [results, setResults] = useState<SearchItem[]>([]);
	const [activeModal, setActiveModal] = useState<string | null>(null);
	const [dummyOwners,setDummyOwners] = useState<any[]>([]);

	const handleOpenFeaturePopup = () => {
		setOpenFeaturePopup(true);
	};
	const handleCloseFeaturePopup = () => {
		setOpenFeaturePopup(false);
	};

	// Highlight active tab in sidebar
	useEffect(() => {
		document
			.querySelectorAll('#toplevel_page_multivendorx>ul>li>a')
			.forEach((menuItem) => {
				const menuItemUrl = new URL(
					(menuItem as HTMLAnchorElement).href
				);
				const menuItemHashParams = new URLSearchParams(
					menuItemUrl.hash.substring(1)
				);

				if (menuItem.parentNode) {
					(menuItem.parentNode as HTMLElement).classList.remove(
						'current'
					);
				}
				if (
					menuItemHashParams.get('tab') ===
					currentTabParams.get('tab')
				) {
					(menuItem.parentNode as HTMLElement).classList.add(
						'current'
					);
				}
			});
	}, [currentTabParams]);

	const handleQueryUpdate = ({
		searchValue,
		searchAction,
	}: {
		searchValue: string;
		searchAction?: string;
	}) => {
		if (!searchValue.trim()) {
			setResults([]);
			return;
		}

		const lower = searchValue.toLowerCase();

		const filtered = searchIndex.filter((item) => {
			// Ignore action if "all"
			if (
				searchAction &&
				searchAction !== 'all' &&
				item.tab !== searchAction
			) {
				return false;
			}

			return (
				item.name?.toLowerCase().includes(lower) ||
				item.desc?.toLowerCase().includes(lower)
			);
		});

		setResults(filtered);
	};

	const handleResultClick = (item: SearchItem) => {
		window.location.hash = item.link;
	};

	const profileItems = [
		{
			title: __("What's New", 'multivendorx'),
			icon: 'new',
			link: 'https://multivendorx.com/latest-release/?utm_source=settings&utm_medium=plugin&utm_campaign=promotion',
			targetBlank: true,
		},
		{
			title: __('Get Support', 'multivendorx'),
			icon: 'customer-support',
			link: 'https://multivendorx.com/support-forum/?utm_source=settings&utm_medium=plugin&utm_campaign=promotion',
			targetBlank: true,
		},
		{
			title: __('Community', 'multivendorx'),
			icon: 'global-community',
			link: 'https://multivendorx.com/community/?utm_source=settings&utm_medium=plugin&utm_campaign=promotion',
			targetBlank: true,
		},
		{
			title: __('Documentation', 'multivendorx'),
			icon: 'knowledgebase',
			link: 'https://multivendorx.com/docs/knowledgebase/?utm_source=settings&utm_medium=plugin&utm_campaign=promotion',
			targetBlank: true,
		},
		{
			title: __('Request a Feature', 'multivendorx'),
			icon: 'blocks',
			link: 'https://github.com/multivendorx/multivendorx/issues',
			targetBlank: true,
		},
		{
			title: __('Import Dummy Data', 'multivendorx'),
			icon: 'export',
			action: handleOpenFeaturePopup,
		},
	];
	const bannerItem = [
		__(
			'<b>Earn from store memberships:</b> Create paid plans and charge stores to join or access special features on your marketplace.',
			'multivendorx'
		),
		__(
			'<b>Automatic tax invoices:</b> Generate clear invoices for orders, commissions, and payouts so your records stay organized.',
			'multivendorx'
		),
		__(
			'<b>Franchise marketplaces:</b> Let partners operate their own local version of your marketplace under your brand.',
			'multivendorx'
		),
		__(
			'<b>Earn recurring income:</b> Allow stores to sell subscription products and generate regular monthly or yearly revenue.',
			'multivendorx'
		),
		__(
			'<b>Sell services and bookings:</b> Let stores accept bookings for services, appointments, rentals, or experiences.',
			'multivendorx'
		),
		__(
			'<b>Create a rental marketplace:</b> Allow products to be rented for specific dates instead of being purchased permanently.',
			'multivendorx'
		),
		__(
			'<b>Verified stores:</b> Verify store identities using documents and badges to help customers trust your marketplace.',
			'multivendorx'
		),
		__(
			'<b>Vacation mode for stores:</b> Stores can temporarily pause orders during holidays while keeping their products visible.',
			'multivendorx'
		),
	];
	const utilityListWithTab = [
		{
			toggleIcon: 'notification',
			tooltipName: __('Notifications', 'multivendorx'),
			tabs: [
				{
					id: 'notifications',
					label: __('Notifications', 'multivendorx'),
					icon: 'notification',
					content: <NotificationTabContent type="notification" />,
					footer: {
						url: '?page=multivendorx#&tab=notifications&subtab=notifications',
						icon: 'adminfont-eye',
						text: __('View all notifications', 'multivendorx'),
					},
				},
				{
					id: 'activities',
					label: __('Activities', 'multivendorx'),
					icon: 'storefront',
					content: <NotificationTabContent type="activity" />,
					footer: {
						url: '?page=multivendorx#&tab=notifications&subtab=activities',
						icon: 'adminfont-eye',
						text: __('View all activities', 'multivendorx'),
					},
				},
			],
		},
	];

	const utilityList = [
		{
			toggleIcon: 'admin-icon adminfont-user-circle',
			tooltipName: __('Support', 'multivendorx'),
			tooltipPosition: 'end',
			items: profileItems,
		},
	];

	const isBannerDismissed =
		localStorage.getItem('banner_dismissed') === 'true';

	useEffect(() => {
		const handler = (e: any) => {
			if (e.detail?.type === 'open_modal') {
				setActiveModal(e.detail.key);
			}
		};

		window.addEventListener('multivendorx:action', handler);

		return () => {
			window.removeEventListener('multivendorx:action', handler);
		};
	}, []);

	return (
		<>
			<AdminHeader
				brandImg={Brand}
				results={results}
				search={{
					placeholder: __('Search...', 'multivendorx'),
					options: [
						{
							value: 'all',
							label: __('Modules & Settings', 'multivendorx'),
						},
						{
							value: 'modules',
							label: __('Modules', 'multivendorx'),
						},
						{
							value: 'settings',
							label: __('Settings', 'multivendorx'),
						},
					],
				}}
				onQueryUpdate={handleQueryUpdate}
				onResultClick={handleResultClick}
				free={appLocalizer.freeVersion}
				pro={appLocalizer.pro_data.version}
				utilityList={utilityList}
				utilityListWithTab={utilityListWithTab}
			/>

			<PopupUI
				open={openFeaturePopup}
				onClose={handleCloseFeaturePopup}
				width={31.25}
				height={50}
				header={{
					icon: 'knowledgebase',
					title: __('Import Dummy Data', 'multivendorx'),
					description: __(
						'Get a hands-on feel of your marketplace in minutes.',
						'multivendorx'
					),
				}}
			>
				<FormGroupWrapper>
					<FormGroup
						label={__('Import Dummy Data', 'multivendorx')}
					></FormGroup>
					<div className="desc">
						{__(
							'Get a hands-on feel of your marketplace in minutes. Import demo stores, store owners, products, and commission data to see how everything works together.',
							'multivendorx'
						)}
						<b>{__('Important:', 'multivendorx')} </b>
						{__(
							'Delete all demo data before going live so your real marketplace data stays clean and reliable.',
							'multivendorx'
						)}
					</div>
					<SequentialTaskExecutor
						buttonText={__('Import Dummy Data', 'multivendorx')}
						apilink="dummy-data"
						interval={1000}
						appLocalizer={appLocalizer}
						successMessage={__(
							'Dummy data imported successfully!',
							'multivendorx'
						)}
						failureMessage={__(
							'Failed to import dummy data.',
							'multivendorx'
						)}
						tasks={[
							{
								action: 'import_store_owners',
								message: __(
									'Importing store owners...',
									'multivendorx'
								),
								successMessage: __(
									'Store owners imported',
									'multivendorx'
								),
								failureMessage: __(
									'Failed to import store owners',
									'multivendorx'
								),
							},
							{
								action: 'import_stores',
								message: __(
									'Creating stores...',
									'multivendorx'
								),
								requiresResponeData: true,
								successMessage: __(
									'Stores created',
									'multivendorx'
								),
								failureMessage: __(
									'Failed to create stores',
									'multivendorx'
								),
							},
							{
								action: 'import_products',
								message: __(
									'Importing products...',
									'multivendorx'
								),
								requiresResponeData: true,
								successMessage: __(
									'Products imported',
									'multivendorx'
								),
								failureMessage: __(
									'Failed to import products',
									'multivendorx'
								),
							},
							{
								action: 'import_commissions',
								message: __(
									'Creating commissions...',
									'multivendorx'
								),
								successMessage: __(
									'Commissions created',
									'multivendorx'
								),
								failureMessage: __(
									'Failed to create commissions',
									'multivendorx'
								),
							},
							{
								action: 'import_orders',
								message: __(
									'Creating orders...',
									'multivendorx'
								),
								requiresResponeData: true,
								successMessage: __(
									'Orders created',
									'multivendorx'
								),
								failureMessage: __(
									'Failed to create orders',
									'multivendorx'
								),
							},
							{
								action: 'import_reviews',
								message: __(
									'Creating reviews...',
									'multivendorx'
								),
								requiresResponeData: true,
								successMessage: __(
									'Reviews created',
									'multivendorx'
								),
								failureMessage: __(
									'Failed to create reviews',
									'multivendorx'
								),
							},
						]}
						onTaskComplete={(task, response: any) => {
							if (task.action === 'import_store_owners') {
								setDummyOwners(response.data);
							}
						}}
						onError={(error) => {
							console.error('Import failed', error);
						}}
					/>
					{dummyOwners.length > 0 && (
						<div>
							<h3>Dummy Store Owners</h3>
							<ul>
								{dummyOwners.map((owner, index) => (
									<li key={index}>
										<strong>{owner.username}</strong> |
										Email: {owner.email} |
										Password: {owner.password}
									</li>
								))}
							</ul>
						</div>
					)}
				</FormGroupWrapper>
			</PopupUI>

			<GuidedTourProvider
				appLocalizer={appLocalizer}
				steps={getTourSteps(appLocalizer)}
			/>
			{!isBannerDismissed && (
				<Notice
					uniqueKey="banner"
					type="banner"
					validity="lifetime"
					displayPosition="banner"
					message={bannerItem}
					actionLabel="Upgrade Now"
				/>
			)}

			{activeModal === 'migrate' && (
				<>
					<PopupUI
						open={activeModal}
						onClose={() => setActiveModal(null)}
						width={31.25}
						height={50}
						header={{
							icon: 'knowledgebase',
							title: __('Migration', 'multivendorx'),
							description: __(
								'Get a hands-on feel of your marketplace in minutes.',
								'multivendorx'
							),
						}}
					>
						<FormGroupWrapper>
							<FormGroup
								label={__('Migration', 'multivendorx')}
							></FormGroup>
							<div className="desc">
								{appLocalizer.multivendor_plugin ||
									'No multivendor plugin active currently'}
							</div>
							<SequentialTaskExecutor
								buttonText={__('Import', 'multivendorx')}
								apilink="migration"
								interval={1000}
								appLocalizer={appLocalizer}
								successMessage={__(
									'Migrate successfully!',
									'multivendorx'
								)}
								failureMessage={__(
									'Failed to migrate.',
									'multivendorx'
								)}
								tasks={[
									{
										action: 'import_stores',
										message: __(
											'Creating stores...',
											'multivendorx'
										),
										requiresResponeData: true,
										successMessage: __(
											'Stores created',
											'multivendorx'
										),
										failureMessage: __(
											'Failed to create stores',
											'multivendorx'
										),
									},
									{
										action: 'import_products',
										message: __(
											'Importing products...',
											'multivendorx'
										),
										requiresResponeData: true,
										successMessage: __(
											'Products imported',
											'multivendorx'
										),
										failureMessage: __(
											'Failed to import products',
											'multivendorx'
										),
									},
								]}
							/>
						</FormGroupWrapper>
					</PopupUI>
				</>
			)}

			<Route />
		</>
	);
};

export default App;
