/* global appLocalizer */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import { NoticeComponent } from '@zyra/components';

import Settings from './components/Settings/Settings';
import SubscribersList from './components/SubscriberList/SubscribersList';
import Managestock from './components/Managestock/Managestock';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import SearchHeader from './components/Header/SearchHeader';
import './styles/admin.scss';

/**
 * Picks the screen for the open tab. Tabs are admin sidebar submenu entries (classes/Admin.php), each pointing to
 * `notifima#&tab={tab}`, so switching tabs only changes the hash.
 */
const Route = () => {
	const tab = new URLSearchParams(useLocation().hash).get('tab');

	// The submenu entries are hash tabs, which WordPress can't match on the server, so mark the open one here.
	useEffect(() => {
		document
			.querySelectorAll('#toplevel_page_notifima .wp-submenu li')
			.forEach((item) => {
				const link = item.querySelector('a');
				const href = link?.getAttribute('href') ?? '';
				const linkTab = new URLSearchParams(
					href.split('#')[1] ?? ''
				).get('tab');
				const isCurrent = !!tab && linkTab === tab;

				item.classList.toggle('current', isCurrent);
				link?.classList.toggle('current', isCurrent);
			});
	}, [tab]);

	switch (tab) {
		case 'dashboard':
			return <AdminDashboard />;
		case 'settings':
			return <Settings id="settings" />;
		case 'subscribers-list':
			return <SubscribersList />;
		case 'inventory-manager':
			return <Managestock />;
		default:
			return null;
	}
};

const bannerItem = [
	__(
		'<b>Double Opt-In:</b> Experience the power of Double Opt-In for our Stock Alert Form - Guaranteed precision in every notification!',
		'notifima'
	),
	__(
		'<b>Your Subscription Hub:</b> Subscription Dashboard - Easily monitor and download lists of out-of-stock subscribers for seamless management.',
		'notifima'
	),
	__(
		'<b>Mailchimp Bridge:</b> Seamlessly link WooCommerce out-of-stock subscriptions with Mailchimp for effective marketing.',
		'notifima'
	),
	__(
		'<b>Unsubscribe Notifications:</b> User-Initiated Unsubscribe from In-Stock Notifications.',
		'notifima'
	),
	__(
		'<b>Ban Spam Emails:</b> Email and Domain Blacklist for Spam Prevention.',
		'notifima'
	),
	__(
		'<b>Google reCAPTCHA Protection:</b> Secure your stock alert forms with Google reCAPTCHA and keep spam subscriptions away.',
		'notifima'
	),
	__(
		'<b>Subscriber Management:</b> View and manage all product subscribers with advanced filtering by subscription and email status.',
		'notifima'
	),
	__(
		'<b>Subscription Insights:</b> Track subscription dates, email delivery status, and product-wise subscriber activity from one dashboard.',
		'notifima'
	),
];

const BANNER_DISMISS_STORAGE_KEY = 'notifima_banner_dismissed';

/** Whether the free-site Pro banner was dismissed in this browser. Storage can be blocked, so a failure means "not". */
const isBannerDismissed = (): boolean => {
	try {
		return 'true' === localStorage.getItem(BANNER_DISMISS_STORAGE_KEY);
	} catch {
		return false;
	}
};

/** Root of the admin app: the search header, the Pro banner (Free only, until dismissed) and the open tab's screen. */
const App = () => (
	<>
		<SearchHeader />
		{!appLocalizer.khali_dabba && !isBannerDismissed() && (
			<NoticeComponent
				uniqueKey="banner"
				dismissStorageKey={BANNER_DISMISS_STORAGE_KEY}
				type="banner"
				validity="lifetime"
				displayPosition="banner"
				message={bannerItem}
				actionLabel={__('Upgrade Now', 'notifima')}
				onAction={() => {
					window.location.assign(appLocalizer.pro_url);
				}}
			/>
		)}
		<Route />
	</>
);

export default App;
