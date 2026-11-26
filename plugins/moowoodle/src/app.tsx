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

/** Help & Support was its own tab; it is now a card on the dashboard, and old links scroll to it. */
const HELP_SUPPORT_LINK = '#&tab=dashboard&view=help-support';

/**
 * Picks the screen for the open tab. Tabs are admin sidebar submenu entries (classes/Admin.php), each pointing to
 * `moowoodle#&tab={tab}`, so switching tabs only changes the hash.
 */
const Route = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const tab = new URLSearchParams(location.hash).get('tab');
	const isOldHelpLink = 'help-support' === tab;

	useEffect(() => {
		if (isOldHelpLink) {
			navigate(
				`${location.pathname}${location.search}${HELP_SUPPORT_LINK}`,
				{ replace: true }
			);
		}
	}, [isOldHelpLink]);

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
		'<b>Automatic User Synchronization for Moodle™ and WordPress:</b> Syncs users between Moodle™ and WordPress for seamless account management across both platforms.',
		'moowoodle'
	),
];

/**
 * Keyframes for the Pro banner's rotation, sized to its message count.
 *
 * zyra's banner (NoticeComponent, `type="banner"`) starts message i at i × 4s in a cycle of count × 4s, but its own
 * `cycle-banner` keyframes show each message for a fixed 12.5% of the cycle — right only for 8 messages. With 5 it
 * showed each for 2.5s of its 4s slot, leaving the banner blank for 1.5s after every message. Here each message is
 * shown for exactly its share of the cycle (100% / count), so one hands over to the next with no gap.
 */
const bannerShare = 100 / bannerItem.length;
const bannerCycleCss = `
@keyframes moowoodle-banner-cycle {
	0%, ${bannerShare.toFixed(3)}% { opacity: 1; visibility: visible; }
	${(bannerShare + 0.001).toFixed(3)}%, 100% { opacity: 0; visibility: hidden; }
}
#wpbody .ui-notice.type-banner .notice-desc { animation-name: moowoodle-banner-cycle; }
`;

/** Root of the admin app: the search header, the Pro banner (Free only) and the screen for the open tab. */
const App = () => (
	<>
		<SearchHeader />
		{!appLocalizer.khali_dabba && <style>{bannerCycleCss}</style>}
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
