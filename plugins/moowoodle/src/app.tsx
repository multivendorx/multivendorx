/* global appLocalizer */
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import { NoticeComponent } from '@zyra/components';

import Settings from './components/Settings/Settings';
import Synchronization from './components/Synchronization/Synchronization';
import Cohort from './components/Cohort/Cohort';
import Enrollment from './components/Enrollment/Enrollment';
import Courses from './components/Courses/Courses';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import SearchHeader from './components/Header/SearchHeader';
import './styles/admin.scss';

/** Tabs that moved into Settings, and the Settings sub-tab each one is now. Old links still land on them. */
const MOVED_TO_SETTINGS: Record<string, string> = {
	'help-support': 'help-support',
};

/**
 * Picks the screen for the open tab. Tabs are admin sidebar submenu entries (classes/Admin.php), each pointing to
 * `moowoodle#&tab={tab}`, so switching tabs only changes the hash.
 */
const Route = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const tab = new URLSearchParams(location.hash).get('tab');

	useEffect(() => {
		if (tab && MOVED_TO_SETTINGS[tab]) {
			navigate(
				`${location.pathname}${location.search}#&tab=settings&subtab=${MOVED_TO_SETTINGS[tab]}`,
				{ replace: true }
			);
		}
	}, [tab]);

	// The submenu entries are hash tabs, which WordPress can't match on the server, so mark the open one here.
	useEffect(() => {
		document
			.querySelectorAll('#toplevel_page_moowoodle .wp-submenu li')
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
		case 'settings':
			return <Settings id="settings" />;
		case 'synchronization':
			return <Synchronization id="synchronization" />;
		case 'courses':
			return <Courses />;
		case 'enrolments':
			return <Enrollment />;
		case 'cohorts':
			return <Cohort />;
		case 'dashboard':
			return <AdminDashboard />;
		default:
			return null;
	}
};

const bannerItem = [
	__(
		'<b>Automated user and course synchronization with scheduler:</b> Utilize personalized scheduling options to synchronize users and courses between WordPress and Moodle.',
		'moowoodle'
	),
	__(
		'<b>Convenient Single Sign-On login:</b> SSO enables students to access their purchased courses without the need to log in separately to the Moodle site.',
		'moowoodle'
	),
	__(
		'<b>Steady Income through Course Subscriptions:</b> Generate consistent revenue by offering courses with subscription-based model.',
		'moowoodle'
	),
	__(
		'<b>Synchronize Courses in Bulk:</b> Effortlessly synchronize multiple courses at once, ideal for managing large course catalogs.',
		'moowoodle'
	),
	__(
		'<b>Automatic User Synchronization for Moodle™ and WordPress:</b>Syncs users between Moodle™ and WordPress for seamless account management across both platforms.',
		'moowoodle'
	),
];

/** Root of the admin app: the search header, the Pro banner (Free only) and the screen for the open tab. */
const App = () => (
	<>
		<SearchHeader />
		{!appLocalizer.khali_dabba && (
			<NoticeComponent
				uniqueKey="banner"
				type="banner"
				validity="lifetime"
				displayPosition="banner"
				message={bannerItem}
				actionLabel={__('Upgrade Now', 'moowoodle')}
				onAction={() => {
					window.location.href = appLocalizer.shop_url;
				}}
			/>
		)}
		<Route />
	</>
);

export default App;
