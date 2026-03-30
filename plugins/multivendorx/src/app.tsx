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
			icon: 'import',
			action: handleOpenFeaturePopup,
		},
	];
	const bannerItem = [
		'<b>Marketplace monetization:</b> Create flexible membership plans that let you charge stores for access, features, and growth opportunities.',
		'<b>Built-in tax compliance:</b> Automatically generate tax-ready invoices for orders, commissions, and payouts to keep your marketplace compliant.',
		'<b>Franchise-ready scaling:</b> Run multiple regional or franchise marketplaces with centralized control and consistent branding.',
		'<b>Recurring revenue engine:</b> Enable subscription-based selling so your marketplace benefits from predictable, recurring income.',
		'<b>Service and booking sales:</b> Allow stores to sell bookings for services, appointments, rentals, and experiences on your platform.',
		'<b>High-value rentals:</b> Launch rental marketplace with date-based availability and higher order values.',
		'<b>Verified stores:</b> Verify store identities using documents and badges to build trust and reduce risk on your marketplace.',
		'<b>Vacation mode:</b> Allow stores to temporarily pause their shop during vacations while keeping their listings intact.',
	];
	const utilityListWithTab = [
		{
			toggleIcon: 'notification',
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
					icon: 'activity',
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
			items: profileItems,
		},
	];
	const handleDismissBanner = () => {
		localStorage.setItem('banner', 'false');
	};

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
						apilink="import-dummy-data"
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
						onComplete={(data) => {
							console.log('Import completed', data);
						}}
						onError={(error) => {
							console.error('Import failed', error);
						}}
					/>
				</FormGroupWrapper>
			</PopupUI>

			<GuidedTourProvider
				appLocalizer={appLocalizer}
				steps={getTourSteps(appLocalizer)}
			/>
			<Notice
				uniqueKey="banner"
				type="banner"
				validity="lifetime"
				displayPosition="banner"
				message={bannerItem}
				actionLabel="Upgrade Now"
				onAction={() => handleDismissBanner()}
			/>

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
								{appLocalizer.multivendor_plugin || 'No multivendor plugin active currently'}
							</div>
							<SequentialTaskExecutor
								buttonText={__('Import', 'multivendorx')}
								apilink="migration"
								interval={1000}
								appLocalizer={appLocalizer}
								successMessage={__('Migrate successfully!', 'multivendorx')}
								failureMessage={__('Failed to migrate.', 'multivendorx')}
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
