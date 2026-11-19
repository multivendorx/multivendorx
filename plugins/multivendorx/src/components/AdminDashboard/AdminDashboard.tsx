/* global appLocalizer */
// AdminDashboard.scss also styles the store banner templates, so it stays imported here.
import './AdminDashboard.scss';
import '../dashboard.scss';
import {
	CardComponent,
	ColumnComponent,
	ContainerComponent,
	TabsComponent,
} from '@zyra/components';
import { __, sprintf } from '@wordpress/i18n';
import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import mascot from '../../assets/images/multivendorx-mascot-scale.png';
import { DOCS_URL } from '../../services/links';
import { ProPopupDialog } from '../Popup/Popup';
import FreeVsProTab from './FreeVsProTab';
import DashboardTab from './DashboardTab';
import type { MarketplaceStage } from './Insights';

/** The reporting periods the Overview offers, in days (the REST route accepts these). */
const PERIOD_CHOICES = [7, 30, 90];

/** Where the welcome block remembers the marketplace's last known stage (this browser only). */
const STAGE_STORAGE_KEY = 'multivendorx_dashboard_stage';

/** "Good morning" / "Good afternoon" / "Good evening", by the admin's own clock. */
const greeting = (): string => {
	const hour = new Date().getHours();

	if (hour < 12) {
		return __('Good morning', 'multivendorx');
	}

	return hour < 18
		? __('Good afternoon', 'multivendorx')
		: __('Good evening', 'multivendorx');
};

/**
 * MultiVendorX → Dashboard: one welcome block (today's date, a greeting, where to start, the mascot), then the Overview
 * (with Help & Support in it). Free sites also get a Free vs Pro tab, opened by `&view=free-vs-pro`; with Pro there is nothing to compare, so
 * the Overview shows without a tab bar.
 */
const AdminDashboard = () => {
	const isPro = !!appLocalizer.khali_dabba;
	const [proPopupOpen, setProPopupOpen] = useState(false);
	const firstName = appLocalizer.user_first_name ?? '';
	const location = useLocation();
	const navigate = useNavigate();
	// Known once the Overview's figures load; the block then words itself for a marketplace setting up or running. The
	// last one seen is kept in this browser, so a returning admin doesn't see the setup button flash before the reports one.
	const [stage, setStage] = useState<MarketplaceStage | null>(() => {
		try {
			const saved = window.localStorage.getItem(STAGE_STORAGE_KEY);
			return saved ? (JSON.parse(saved) as MarketplaceStage) : null;
		} catch {
			return null;
		}
	});
	const reportStage = useCallback((next: MarketplaceStage) => {
		setStage(next);
		try {
			window.localStorage.setItem(
				STAGE_STORAGE_KEY,
				JSON.stringify(next)
			);
		} catch {
			// Storage blocked: the block just waits for the figures each visit.
		}
	}, []);
	const isRunning = !!stage?.setupComplete;
	// The Overview's reporting period. Its switch sits at the right of the tab row, so the tabs and the period share
	// one line instead of two bands.
	const [days, setDays] = useState(30);

	const tabs = [
		{
			key: 'overview',
			label: __('Overview', 'multivendorx'),
			icon: 'module',
			content: <DashboardTab days={days} onStage={reportStage} />,
		},
		...(isPro
			? []
			: [
					{
						key: 'free-vs-pro',
						label: __('Free vs Pro', 'multivendorx'),
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
			{
				replace: true,
			}
		);
	};

	// One main action for where the admin is: the setup wizard while the marketplace is being set up, the reports
	// once it runs. Upgrade to Pro is the quieter second action on free sites; the top bar and the menu already pitch it.
	const mainAction = isRunning ? (
		<a className="admin-btn btn-purple-bg" href="#&tab=reports">
			<i className="adminfont-report" aria-hidden="true" />
			{__('View reports', 'multivendorx')}
		</a>
	) : (
		<a
			className="admin-btn btn-purple-bg"
			href={`${appLocalizer.admin_url}admin.php?page=multivendorx-setup`}
		>
			<i className="adminfont-import" aria-hidden="true" />
			{__('Launch setup wizard', 'multivendorx')}
		</a>
	);

	// 7, 30 or 90 days: what the tiles, the chart and the top stores cover.
	const periodSwitch = (
		<div
			className="mvx-insights-range"
			role="group"
			aria-label={__('Reporting period', 'multivendorx')}
		>
			{PERIOD_CHOICES.map((choice) => (
				<button
					key={choice}
					type="button"
					aria-pressed={choice === days}
					className={choice === days ? 'is-active' : ''}
					title={sprintf(
						/* translators: %1$s: number of days (used twice). */
						__(
							'Last %1$s days, compared with the %1$s days before',
							'multivendorx'
						),
						choice
					)}
					onClick={() => setDays(choice)}
				>
					{sprintf(
						/* translators: %s: number of days; "30d" means 30 days. */
						__('%sd', 'multivendorx'),
						choice
					)}
				</button>
			))}
		</div>
	);

	const welcomeLine = (() => {
		if (!stage) {
			return __(
				'Welcome to MultiVendorX. See how your marketplace is selling, what is waiting for you, and the next step to take.',
				'multivendorx'
			);
		}
		if (stage.setupComplete) {
			return __(
				'Here is how your marketplace is selling, and what is waiting for you.',
				'multivendorx'
			);
		}
		return sprintf(
			/* translators: 1: setup steps done, 2: all setup steps, 3: the next step, e.g. "Approve a store". */
			__(
				'Welcome to MultiVendorX. %1$s of %2$s setup steps done; next: %3$s.',
				'multivendorx'
			),
			stage.doneSteps,
			stage.totalSteps,
			stage.nextStepTitle ?? ''
		);
	})();

	// The page's only header: the mascot, then the date, greeting and one line on where the marketplace is, then its
	// actions at the right.
	// Once the marketplace runs it is compact, so the figures sit higher.
	const welcome = (
		<CardComponent
			className={`mvx-dash-welcome${isRunning ? ' is-compact' : ''}`}
		>
			<div className="mvx-dash-welcome-body">
				<img className="mvx-dash-welcome-mascot" src={mascot} alt="" />
				<div className="mvx-dash-welcome-text">
					<span className="mvx-dash-welcome-date">
						{new Date().toLocaleDateString(undefined, {
							weekday: 'long',
							month: 'long',
							day: 'numeric',
						})}
					</span>
					<h1>
						{firstName
							? sprintf(
									/* translators: 1: "Good morning" or similar, 2: the admin's first name. */
									__('%1$s, %2$s', 'multivendorx'),
									greeting(),
									firstName
								)
							: greeting()}
					</h1>
					<p>{welcomeLine}</p>
				</div>
				{/* Least to most important, so the main action ends the row at the right edge. */}
				<div className="mvx-dash-welcome-actions">
					{!isRunning && (
						<a
							className="mvx-insights-more"
							href={DOCS_URL}
							target="_blank"
							rel="noopener noreferrer"
						>
							{__('Read the docs', 'multivendorx')}
							<i className="adminfont-external" aria-hidden="true" />
							<span className="screen-reader-text">
								{__('(opens in a new tab)', 'multivendorx')}
							</span>
						</a>
					)}
					{/* The Free vs Pro tab has its own upgrade panel right under this. */}
					{!isPro && 0 === activeIndex && (
						<button
							type="button"
							className="admin-btn mvx-upgrade-btn is-outline"
							onClick={() => setProPopupOpen(true)}
						>
							<i className="adminfont-pro-tag" aria-hidden="true" />
							{__('Upgrade to Pro', 'multivendorx')}
						</button>
					)}
					{mainAction}
				</div>
			</div>
		</CardComponent>
	);

	return (
		<>
			<ContainerComponent general className="dashboard-tab mvx-dash">
				<ColumnComponent>
					{welcome}
					{1 === tabs.length ? (
						<>
							{/* With Pro there is no tab bar: the period switch gets the same row on its own. */}
							{isRunning && (
								<div className="mvx-dash-tabs-row">
									{periodSwitch}
								</div>
							)}
							{tabs[0].content}
						</>
					) : (
						<TabsComponent
							tabs={tabs}
							activeIndex={activeIndex}
							onTabChange={openTab}
							className="mvx-dash-tabs"
							headerExtra={
								0 === activeIndex && isRunning && periodSwitch
							}
						/>
					)}
				</ColumnComponent>
			</ContainerComponent>
			{proPopupOpen && (
				<ProPopupDialog onClose={() => setProPopupOpen(false)} />
			)}
		</>
	);
};

export default AdminDashboard;
