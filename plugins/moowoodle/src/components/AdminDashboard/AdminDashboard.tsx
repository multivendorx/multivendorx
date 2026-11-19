/* global appLocalizer */
import {
	ColumnComponent,
	ContainerComponent,
	NavigatorHeaderComponent,
	PopupComponent,
	TabsComponent,
} from '@zyra/components';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ShowProPopup from '../Popup/Popup';
import FreeVsProTab from './FreeVsProTab';
import DashboardTab from './DashboardTab';

/** "Good morning" / "Good afternoon" / "Good evening", by the admin's own clock. */
const greeting = (): string => {
	const hour = new Date().getHours();

	if (hour < 12) {
		return __('Good morning', 'moowoodle');
	}

	return hour < 18
		? __('Good afternoon', 'moowoodle')
		: __('Good evening', 'moowoodle');
};

/**
 * MooWoodle → Dashboard: today's date and a greeting, one header action, then the Overview (with Help & Support in
 * it). Free sites also get a Free vs Pro tab, opened by `&view=free-vs-pro`; with Pro there is nothing to compare, so
 * the Overview shows without a tab bar.
 */
const AdminDashboard = () => {
	const isPro = !!appLocalizer.khali_dabba;
	const [proPopupOpen, setProPopupOpen] = useState(false);
	const firstName = appLocalizer.user_first_name ?? '';
	const location = useLocation();
	const navigate = useNavigate();

	const tabs = [
		{
			key: 'overview',
			label: __('Overview', 'moowoodle'),
			icon: 'module',
			content: <DashboardTab />,
		},
		...(isPro
			? []
			: [
					{
						key: 'free-vs-pro',
						label: __('Free vs Pro', 'moowoodle'),
						icon: 'pros-and-cons',
						content: <FreeVsProTab />,
					},
				]),
	];
	const hashParams = new URLSearchParams(location.hash.substring(1));
	const activeIndex = Math.max(
		0,
		tabs.findIndex((tab) => tab.key === hashParams.get('view'))
	);

	// Keeps the `#&tab=…` form app.tsx reads; the Overview is the plain dashboard link.
	const openTab = (index: number) => {
		if (0 === index) {
			hashParams.delete('view');
		} else {
			hashParams.set('view', tabs[index].key);
		}
		navigate(
			`${location.pathname}${location.search}#&${hashParams.toString()}`,
			{ replace: true }
		);
	};

	// One header action. With Pro it is a quiet link to the courses: the figures are the point. Without Pro it is the
	// page's one prominent button, Upgrade to Pro, which opens the Pro popup (features, plans, buy) like every other
	// upgrade button in MooWoodle.
	const actions = isPro ? (
		<a className="admin-btn btn-purple" href="#&tab=courses">
			<i className="adminfont-catalog" aria-hidden="true"></i>
			{__('View courses', 'moowoodle')}
		</a>
	) : (
		<button
			type="button"
			className="admin-btn mw-upgrade-btn"
			onClick={() => setProPopupOpen(true)}
		>
			<i className="adminfont-pro-tag" aria-hidden="true"></i>
			{__('Upgrade to Pro', 'moowoodle')}
		</button>
	);

	return (
		<>
			<NavigatorHeaderComponent
				eyebrow={new Date().toLocaleDateString(undefined, {
					weekday: 'long',
					month: 'long',
					day: 'numeric',
				})}
				headerTitle={
					firstName
						? sprintf(
								/* translators: 1: "Good morning" or similar, 2: the admin's first name. */
								__('%1$s, %2$s', 'moowoodle'),
								greeting(),
								firstName
							)
						: greeting()
				}
				headerDescription={__(
					'How your courses are selling, what needs a look, and the next step to take.',
					'moowoodle'
				)}
				headerCustomContent={actions}
			/>
			<ContainerComponent general className="dashboard-tab mw-dash">
				<ColumnComponent>
					{1 === tabs.length ? (
						tabs[0].content
					) : (
						<TabsComponent
							tabs={tabs}
							activeIndex={activeIndex}
							onTabChange={openTab}
							className="background"
						/>
					)}
				</ColumnComponent>
			</ContainerComponent>
			{proPopupOpen && (
				<PopupComponent
					position="lightbox"
					open
					onClose={() => setProPopupOpen(false)}
					width={46}
					height="auto"
				>
					<ShowProPopup />
				</PopupComponent>
			)}
		</>
	);
};

export default AdminDashboard;
