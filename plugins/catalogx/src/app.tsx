import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import Settings from './components/Settings/Settings';
import Modules from './components/Modules/Modules';
import EnquiryMessages from './components/EnquiryMessages/enquiryMessages';
import WholesaleUser from './components/WholesaleUser/wholesaleUser.tsx';
import Rules from './components/Rules/Rules';

import { NoticeComponent, TourComponent } from '@zyra/components';
import { initializeModules } from '@zyra/core';
import { AdminHeader } from '@zyra/admin';
import { __ } from '@wordpress/i18n';
import Brand from './assets/images/catalogx-logo.png';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import { getTourSteps } from './components/Tour/Tours';
import QuoteRequests from './components/QuoteRequests/QuoteRequests';
import { searchIndex, SearchItem } from './searchIndex';

localStorage.setItem('force_catalogx_context_reload', 'true');

const Route = () => {
	const currentTab = new URLSearchParams(useLocation().hash);
	return (
		<>
			{currentTab.get('tab') === 'dashboard' && (<AdminDashboard />)}
			{currentTab.get('tab') === 'settings' && (
				<Settings id={'settings'} />
			)}
			{currentTab.get('tab') === 'modules' && <Modules />}
			{currentTab.get('tab') === 'quote-requests' && (
				<QuoteRequests />
			)}
			{currentTab.get('tab') === 'wholesale-users' && (
				<WholesaleUser />
			)}
			{currentTab.get('tab') === 'enquiry-messages' && (
				<EnquiryMessages />
			)}
			{currentTab.get('tab') === 'rules' && <Rules />}
		</>
	);
};
const bannerItem = [
	__(
		'<b>Advanced enquiry management:</b> Organize, track, and respond to every enquiry from one powerful dashboard.',
		'catalogx'
	),

	__(
		'<b>Multi-product enquiries:</b> Let customers enquire about multiple products in a single request to generate more qualified leads.',
		'catalogx'
	),

	__(
		'<b>Professional quotations:</b> Create, send, approve, and manage quotations with expiry dates and PDF downloads.',
		'catalogx'
	),

	__(
		'<b>Wholesale selling:</b> Unlock B2B sales with wholesale pricing, customer roles, and bulk ordering tools.',
		'catalogx'
	),

	__(
		'<b>Dynamic pricing rules:</b> Create advanced pricing strategies based on customer roles, quantities, products, and categories.',
		'catalogx'
	),

	__(
		'<b>Visual page builder:</b> Build enquiry, quotation, and wholesale pages without writing a single line of code.',
		'catalogx'
	),

	__(
		'<b>Custom form builder:</b> Design enquiry and quotation forms that collect exactly the information your business needs.',
		'catalogx'
	),

	__(
		'<b>Higher conversions:</b> Show both purchasing and enquiry options together so customers can buy or contact you their way.',
		'catalogx'
	)
];
const BANNER_DISMISS_STORAGE_KEY = 'catalogx_banner_dismissed';
const App = () => {
	const [results, setResults] = useState<SearchItem[]>([]);
	const currentTabParams = new URLSearchParams(useLocation().hash);
	document
		.querySelectorAll('#toplevel_page_catalogx>ul>li>a')
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

    const isBannerDismissed =
        appLocalizer.khali_dabba ||
        localStorage.getItem(BANNER_DISMISS_STORAGE_KEY) === 'true';

	// --- INIT MODULES ---
	useEffect(() => {
		initializeModules(appLocalizer, 'catalogx', 'free', 'modules');
	}, []);

	const profileItems = [
		{
			title: __("What's New", 'catalogx'),
			icon: 'new',
			link: 'https://catalogx.com/docs/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx',
			targetBlank: true,
		},
		{
			title: __('Get Support', 'catalogx'),
			icon: 'customer-support',
			link: 'https://catalogx.com/support/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx',
			targetBlank: true,
		},
		{
			title: __('Community', 'catalogx'),
			icon: 'global-community',
			link: 'https://catalogx.com/community/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx',
			targetBlank: true,
		},
	];
	const utilityList = [
		{
			toggleIcon: 'admin-icon adminfont-user-circle',
			tooltipName: __('Support', 'catalogx'),
			tooltipPosition: 'end',
			items: profileItems,
		},
	];

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

	return (
		<>
			{!isBannerDismissed && (
				<NoticeComponent
					uniqueKey="banner"
					type="banner"
					dismissStorageKey={BANNER_DISMISS_STORAGE_KEY}
					validity="lifetime"
					displayPosition="banner"
					message={bannerItem}
					actionLabel={__('Upgrade Now', 'catalogx')}
					onAction={() => {
						window.location.href = appLocalizer.pro_url;
					}}
				/>
			)}
			<AdminHeader
				brandImg={Brand}
				results={results}
				search={{
					placeholder: __('Search...', 'catalogx'),
					options: [
						{
							value: 'all',
							label: __('Modules & Settings', 'catalogx'),
						},
						{
							value: 'modules',
							label: __('Modules', 'catalogx'),
						},
						{
							value: 'settings',
							label: __('Settings', 'catalogx'),
						},
					],
				}}
				onQueryUpdate={handleQueryUpdate}
				onResultClick={handleResultClick}
				free={appLocalizer.free_version}
				pro={appLocalizer.pro_data.version}
				utilityList={utilityList}
			/>
			<TourComponent
				appLocalizer={appLocalizer}
				steps={getTourSteps(appLocalizer)}
			/>
			<Route />
		</>
	);
};

export default App;
