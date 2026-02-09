import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { applyFilters } from '@wordpress/hooks';
import { AdminHeader, Banner, CommonPopup, DoActionBtn, FormGroup, FormGroupWrapper, TourSetup } from 'zyra';

import Settings from './components/Settings/Settings';
import Modules from './components/Modules/Modules';
import Stores from './components/Stores/Stores';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import StatusAndTools from './components/StatusAndTools/StatusAndTools';
import CustomerSupport from './components/CustomerSupport/CustomerSupport';
import Brand from './assets/images/multivendorx-logo.png';
import { searchIndex, SearchItem } from './searchIndex';
import { __ } from '@wordpress/i18n';
import Announcements from './components/Announcements/Announcements';
import Knowledgebase from './components/Knowledgebase/Knowledgebase';
import Commissions from './components/Commissions/Commissions';
import Analytics from './components/Reports/Reports';
import HelpSupport from './components/HelpSupport/HelpSupport';
import ApprovalQueue from './components/ApprovalQueue/ApprovalQueue';
import Notifications from './components/Notifications/Notifications';
import TransactionHistory from './components/TransactionHistory/TransactionHistory';
import { getTourSteps } from './components/Tour/TourSteps';
import TableCardDemo from './components/table/TableCardDemo';
import NotificationTabContent from './components/Notifications/HeaderNotifications';

localStorage.setItem('force_multivendorx_context_reload', 'true');

interface Products {
	title: string;
	description: string;
}

const products: Products[] = [
	{
		title: __('Marketplace monetization', 'multivendorx'),
		description: __(
			'Create flexible membership plans that let you charge stores for access, features, and growth opportunities.',
			'multivendorx'
		),
	},
	{
		title: __('Built-in tax compliance', 'multivendorx'),
		description: __(
			'Automatically generate tax-ready invoices for orders, commissions, and payouts to keep your marketplace compliant.',
			'multivendorx'
		),
	},
	{
		title: __('Franchise-ready scaling', 'multivendorx'),
		description: __(
			'Run multiple regional or franchise marketplaces with centralized control and consistent branding.',
			'multivendorx'
		),
	},
	{
		title: __('Recurring revenue engine', 'multivendorx'),
		description: __(
			'Enable subscription-based selling so your marketplace benefits from predictable, recurring income.',
			'multivendorx'
		),
	},
	{
		title: __('Service and booking sales', 'multivendorx'),
		description: __(
			'Allow stores to sell bookings for services, appointments, rentals, and experiences on your platform.',
			'multivendorx'
		),
	},
	{
		title: __('High-value rentals', 'multivendorx'),
		description: __(
			'Launch rental marketplace with date-based availability and higher order values.',
			'multivendorx'
		),
	},
	{
		title: __('Verified stores', 'multivendorx'),
		description: __(
			'Verify store identities using documents and badges to build trust and reduce risk on your marketplace.',
			'multivendorx'
		),
	},
	{
		title: __('Vacation mode', 'multivendorx'),
		description: __(
			'Allow stores to temporarily pause their shop during vacations while keeping their listings intact.',
			'multivendorx'
		),
	},


];

const Route = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const currentTab = new URLSearchParams(useLocation().hash);
	const tab = currentTab.get('tab') || 'dashboard';

	return (
		<>
			{tab === 'settings' && <Settings id="settings" />}
			{tab === 'status-tools' && <StatusAndTools id="status-tools" />}
			{tab === 'modules' && <Modules />}
			{tab === 'stores' && <Stores />}
			{tab === 'commissions' && <Commissions />}
			{tab === 'customer-support' && <CustomerSupport />}
			{tab === 'approval-queue' && <ApprovalQueue />}
			{tab === 'dashboard' && <AdminDashboard />}
			{tab === 'announcements' && <Announcements />}
			{tab === 'knowledgebase' && <Knowledgebase />}
			{tab === 'transaction-history' && <TransactionHistory />}
			{tab === 'reports' && <Analytics />}
			{tab === 'help-support' && <HelpSupport />}
			{tab === 'notifications' && <Notifications />}
			{tab === 'table-card' && <TableCardDemo />}

			{applyFilters(
				'multivendorx_admin_submenu_render',
				null,
				{
					tab,
					location,
					Link,
					navigate
				}
			)}
		</>
	);
};

const App = () => {
	const currentTabParams = new URLSearchParams(useLocation().hash);
	const [openFeaturePopup, setOpenFeaturePopup] = useState(false);
	const [results, setResults] = useState<SearchItem[]>([]);

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
			if (searchAction && searchAction !== 'all' && item.tab !== searchAction) {
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
			title: "What's New",
			icon: 'adminfont-new',
			link: 'https://multivendorx.com/latest-release/?utm_source=settings&utm_medium=plugin&utm_campaign=promotion',
			targetBlank: true,
		},
		{
			title: 'Get Support',
			icon: 'adminfont-customer-support',
			link: 'https://multivendorx.com/support-forum/?utm_source=settings&utm_medium=plugin&utm_campaign=promotion',
			targetBlank: true,
		},
		{
			title: 'Community',
			icon: 'adminfont-global-community',
			link: 'https://multivendorx.com/community/?utm_source=settings&utm_medium=plugin&utm_campaign=promotion',
			targetBlank: true,
		},
		{
			title: 'Documentation',
			icon: 'adminfont-book',
			link: 'https://multivendorx.com/docs/knowledgebase/?utm_source=settings&utm_medium=plugin&utm_campaign=promotion',
			targetBlank: true,
		},
		{
			title: 'Request a Feature',
			icon: 'adminfont-blocks',
			link: 'https://github.com/multivendorx/multivendorx/issues',
			targetBlank: true,
		},
		{
			title: 'Import Dummy Data',
			icon: 'adminfont-import',
			action: handleOpenFeaturePopup,
		},
	];
	const utilityListWithTab = [
		{
			toggleIcon: 'adminfont-notification',
			tabs: [
				{
					id: 'notifications',
					label: __('Notifications', 'multivendorx'),
					icon: 'adminfont-notification',
					content: <NotificationTabContent type="notification" />,
					footer: {
						url: '?page=multivendorx#&tab=notifications&subtab=notifications',
						icon: 'adminfont-eye',
						text: __('View all notifications', 'multivendorx')
					}
				},
				{
					id: 'activities',
					label: __('Activities', 'multivendorx'),
					icon: 'adminfont-activity',
					content: <NotificationTabContent type="activity" />,
					footer: {
						url: '?page=multivendorx#&tab=notifications&subtab=activities',
						icon: 'adminfont-eye',
						text: __('View all activities', 'multivendorx')
					}
				},
			],
		},
	];

	const utilityList = [
		{
			toggleIcon: 'admin-icon adminfont-user-circle',
			items: profileItems,
		}
	];
	return (
		<>
			<Banner
				products={products}
				isPro={appLocalizer.khali_dabba}
				proUrl={appLocalizer.pro_url}
			/>
			<AdminHeader
				brandImg={Brand}
				results={results}
				search={{
					placeholder: 'Search...',
					options: [
						{ value: 'all', label: 'Modules & Settings' },
						{ value: 'modules', label: 'Modules' },
						{ value: 'settings', label: 'Settings' },
					],
				}}
				onQueryUpdate={handleQueryUpdate}
				onResultClick={handleResultClick}
				free={appLocalizer.freeVersion}
				pro={appLocalizer.pro_data.version}
				utilityList={utilityList}
				utilityListWithTab={utilityListWithTab}
			/>

			<CommonPopup
				open={openFeaturePopup}
				onClose={handleCloseFeaturePopup}
				width="31.25rem"
				height="70%"
				header={{
					icon: 'import',
					title: __('Import Dummy Data', 'multivendorx')
				}}
			>
				<FormGroupWrapper>
					<FormGroup label={__('Import Dummy Data', 'multivendorx')}>

					</FormGroup>
					<div className="desc">
						Get a hands-on feel of your marketplace in minutes.
						Import demo stores, store owners, products, and commission data to see how everything works together.
						<b>Important: </b>Delete all demo data before going live so your real marketplace data stays clean and reliable.</div>
					<DoActionBtn
						buttonKey="import_dummy_data"
						value={__('Import Dummy Data', 'multivendorx')}
						apilink="import-dummy-data"
						parameter="action"
						interval={1000}
						proSetting={false}
						proSettingChanged={() => false}
						appLocalizer={appLocalizer}
						successMessage={__('Dummy data imported successfully!', 'multivendorx')}
						failureMessage={__('Failed to import dummy data.', 'multivendorx')}
						tasks={[
							{
								action: 'import_store_owners',
								message: __('Importing store owners...', 'multivendorx'),
								cacheKey: 'store_owners',
								successMessage: __('Store owners imported', 'multivendorx'),
								failureMessage: __('Failed to import store owners', 'multivendorx'),
							},
							{
								action: 'import_stores',
								message: __('Creating stores...', 'multivendorx'),
								cacheKey: 'store_ids',
								successMessage: __('Stores created', 'multivendorx'),
								failureMessage: __('Failed to create stores', 'multivendorx'),
							},
							{
								action: 'import_products',
								message: __('Importing products...', 'multivendorx'),
								cacheKey: 'product_ids',
								successMessage: __('Products imported', 'multivendorx'),
								failureMessage: __('Failed to import products', 'multivendorx'),
							},
							{
								action: 'import_commissions',
								message: __('Creating commissions...', 'multivendorx'),
								successMessage: __('Commissions created', 'multivendorx'),
								failureMessage: __('Failed to create commissions', 'multivendorx'),
							},
							{
								action: 'import_orders',
								message: __('Creating orders...', 'multivendorx'),
								successMessage: __('Orders created', 'multivendorx'),
								failureMessage: __('Failed to create orders', 'multivendorx'),
							},
							{
								action: 'import_reviews',
								message: __('Creating reviews...', 'multivendorx'),
								successMessage: __('Reviews created', 'multivendorx'),
								failureMessage: __('Failed to create reviews', 'multivendorx'),
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
			</CommonPopup>

			<TourSetup
				appLocalizer={appLocalizer}
				steps={getTourSteps(appLocalizer)}
			/>

			<Route />
		</>
	);
};

export default App;
