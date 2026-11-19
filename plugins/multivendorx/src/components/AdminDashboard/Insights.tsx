/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { __, _n, sprintf } from '@wordpress/i18n';
import { getApiLink } from '@zyra/core';
import {
	CardComponent,
	ColumnComponent,
	ContainerComponent,
	TrendStatComponent,
} from '@zyra/components';
import './insights.scss';
import { DOCS_URL } from '../../services/links';
import { getModuleData } from '../../services/templateService';

interface PeriodCount {
	current: number;
	previous: number;
}

/** GET multivendorx/v1/admin-dashboard (classes/RestAPI/Controllers/AdminDashboard.php). */
interface DashboardData {
	period_days: number;
	/** The periods the range switch offers, e.g. [7, 30, 90]. */
	period_choices?: number[];
	/** The store's currency code. */
	currency?: string;
	is_pro?: boolean;
	/** Ids of the modules that are on. */
	modules: string[];
	/** All-time counts, for the setup steps. */
	totals: { stores: number; active_stores: number; orders: number };
	sales: {
		/** Order totals. */
		sales: PeriodCount;
		/** Sales less what the stores are paid. */
		earnings: PeriodCount;
		orders: PeriodCount;
	};
	new_stores: PeriodCount;
	daily: Array<{
		date: string;
		sales: number;
		orders: number;
		/** Added in 5.0.23; an older response leaves the earnings and new-store lines flat. */
		earnings?: number;
		new_stores?: number;
	}>;
	top_stores: Array<{
		id: number;
		name: string;
		sales: number;
		orders: number;
	}>;
	/** What is waiting for the admin, by kind; `refunds` only while the Marketplace Refund module is on. */
	queue: {
		stores: number;
		products: number;
		coupons: number;
		withdrawals: number;
		deactivations: number;
		refunds?: number;
	};
	newest_stores: Array<{
		id: number;
		name: string;
		status: string;
		date: string;
	}>;
}

type Severity = 'critical' | 'warning' | 'info';

interface Insight {
	id: string;
	severity: Severity;
	title: string;
	detail: string;
	cta: string;
	link: string;
}

const TAB = {
	modules: '#&tab=settings&subtab=modules',
	commissions: '#&tab=settings&subtab=commissions',
	onboarding: '#&tab=settings&subtab=onboarding',
	stores: '#&tab=stores',
	reports: '#&tab=reports',
	queue: (subtab: string) => `#&tab=approval-queue&subtab=${subtab}`,
	store: (id: number) => `#&tab=stores&edit/${id}/&subtab=store-overview`,
};

const SEVERITY_LABEL: Record<Severity, string> = {
	critical: __('Critical', 'multivendorx'),
	warning: __('Warning', 'multivendorx'),
	info: __('Info', 'multivendorx'),
};

const SEVERITY_ICON: Record<Severity, string> = {
	critical: 'error',
	warning: 'attention',
	info: 'info',
};

const SEVERITY_ORDER: Record<Severity, number> = {
	critical: 0,
	warning: 1,
	info: 2,
};

const STORE_STATUS_LABEL: Record<string, string> = {
	active: __('Active', 'multivendorx'),
	pending: __('Pending', 'multivendorx'),
	rejected: __('Rejected', 'multivendorx'),
	permanently_rejected: __('Rejected', 'multivendorx'),
	under_review: __('In review', 'multivendorx'),
	suspended: __('Suspended', 'multivendorx'),
	deactivated: __('Deactivated', 'multivendorx'),
};

const numberFormat = new Intl.NumberFormat();

/** How many "needs your attention" items show before "Show all". */
const INSIGHTS_SHOWN = 3;

/** How many modules "What is switched on" lists before "+N more". */
const MODULES_SHOWN = 6;

/** "$1,240" in the store's currency (whole amounts in tiles, cents where they matter). */
const formatMoney = (
	amount: number,
	currency = 'USD',
	cents = false
): string => {
	try {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency,
			minimumFractionDigits: cents ? 2 : 0,
			maximumFractionDigits: cents ? 2 : 0,
		}).format(amount);
	} catch {
		return numberFormat.format(Math.round(amount));
	}
};

/** "+25%" / "−10%" against the previous period; null when there is nothing to compare with. */
const percentChange = ({ current, previous }: PeriodCount): number | null =>
	previous > 0 ? Math.round(((current - previous) / previous) * 100) : null;

const formatDay = (isoDate: string, options: Intl.DateTimeFormatOptions) =>
	new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, options);

const relativeTime = new Intl.RelativeTimeFormat(undefined, {
	numeric: 'auto',
});

/** "3 hours ago", "yesterday", "2 weeks ago". */
const formatAgo = (isoDateTime: string): string => {
	const seconds = (new Date(isoDateTime).getTime() - Date.now()) / 1000;
	const steps: Array<[Intl.RelativeTimeFormatUnit, number]> = [
		['year', 31536000],
		['month', 2592000],
		['week', 604800],
		['day', 86400],
		['hour', 3600],
		['minute', 60],
	];

	for (const [unit, size] of steps) {
		if (Math.abs(seconds) >= size) {
			return relativeTime.format(Math.round(seconds / size), unit);
		}
	}

	return __('just now', 'multivendorx');
};

/** One "N things are waiting" item, when there are any. */
const queueInsight = (
	count: number,
	insight: Omit<Insight, 'title'> & { title: (count: string) => string }
): Insight[] =>
	count > 0
		? [{ ...insight, title: insight.title(numberFormat.format(count)) }]
		: [];

/** Turns the dashboard numbers into what needs doing, most urgent first. */
const buildInsights = (data: DashboardData): Insight[] => {
	const { queue, sales, period_days: periodDays } = data;
	const insights: Insight[] = [
		...queueInsight(queue.withdrawals, {
			id: 'withdrawals',
			severity: 'critical',
			title: (count) =>
				sprintf(
					/* translators: %s: number of stores. */
					_n(
						'%s store is waiting for a payout',
						'%s stores are waiting for a payout',
						queue.withdrawals,
						'multivendorx'
					),
					count
				),
			detail: __(
				'They asked to withdraw their earnings. Approve or reject each request so they know where they stand.',
				'multivendorx'
			),
			cta: __('Review withdrawals', 'multivendorx'),
			link: TAB.queue('withdrawal'),
		}),
		...queueInsight(queue.refunds ?? 0, {
			id: 'refunds',
			severity: 'critical',
			title: (count) =>
				sprintf(
					/* translators: %s: number of refund requests. */
					_n(
						'%s refund request needs a decision',
						'%s refund requests need a decision',
						queue.refunds ?? 0,
						'multivendorx'
					),
					count
				),
			detail: __(
				'A customer asked for their money back. Answer quickly to keep their trust in your marketplace.',
				'multivendorx'
			),
			cta: __('Review refunds', 'multivendorx'),
			link: TAB.queue('refund-requests'),
		}),
		...queueInsight(queue.stores, {
			id: 'stores',
			severity: 'warning',
			title: (count) =>
				sprintf(
					/* translators: %s: number of stores. */
					_n(
						'%s store is waiting for approval',
						'%s stores are waiting for approval',
						queue.stores,
						'multivendorx'
					),
					count
				),
			detail: __(
				'They signed up to sell on your marketplace and can’t list products until you approve them.',
				'multivendorx'
			),
			cta: __('Review stores', 'multivendorx'),
			link: TAB.queue('stores'),
		}),
		...queueInsight(queue.products, {
			id: 'products',
			severity: 'warning',
			title: (count) =>
				sprintf(
					/* translators: %s: number of products. */
					_n(
						'%s product is waiting for review',
						'%s products are waiting for review',
						queue.products,
						'multivendorx'
					),
					count
				),
			detail: __(
				'Stores submitted them for sale. Customers can’t buy them until you publish them.',
				'multivendorx'
			),
			cta: __('Review products', 'multivendorx'),
			link: TAB.queue('products'),
		}),
		...queueInsight(queue.coupons, {
			id: 'coupons',
			severity: 'info',
			title: (count) =>
				sprintf(
					/* translators: %s: number of coupons. */
					_n(
						'%s store coupon is waiting for review',
						'%s store coupons are waiting for review',
						queue.coupons,
						'multivendorx'
					),
					count
				),
			detail: __(
				'Stores created them for their customers.',
				'multivendorx'
			),
			cta: __('Review coupons', 'multivendorx'),
			link: TAB.queue('coupons'),
		}),
		...queueInsight(queue.deactivations, {
			id: 'deactivations',
			severity: 'info',
			title: (count) =>
				sprintf(
					/* translators: %s: number of stores. */
					_n(
						'%s store asked to close',
						'%s stores asked to close',
						queue.deactivations,
						'multivendorx'
					),
					count
				),
			detail: __(
				'Read their reasons: some can be kept with a quick conversation.',
				'multivendorx'
			),
			cta: __('Review requests', 'multivendorx'),
			link: TAB.queue('deactivate-requests'),
		}),
	];

	const salesChange = percentChange(sales.sales);

	if (
		null !== salesChange &&
		salesChange <= -25 &&
		sales.orders.previous >= 5
	) {
		insights.push({
			id: 'sales-down',
			severity: 'warning',
			title: sprintf(
				/* translators: 1: percentage drop, 2: number of days. */
				__(
					'Sales are down %1$s%% on the previous %2$s days',
					'multivendorx'
				),
				Math.abs(salesChange),
				periodDays
			),
			detail: __(
				'See which stores sold less in Reports, and whether their products are still published.',
				'multivendorx'
			),
			cta: __('Open reports', 'multivendorx'),
			link: TAB.reports,
		});
	}

	return insights.sort(
		(a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
	);
};

/**
 * From a fresh install to the first sale: a store signs up, it is approved, it sells. If a step comes undone (every
 * store deleted), it is the step to do again.
 */
const buildSetupSteps = (data: DashboardData) => [
	{
		id: 'first-store',
		done: data.totals.stores > 0,
		title: __('Get your first store', 'multivendorx'),
		doneTitle: __('First store signed up', 'multivendorx'),
		detail: __(
			'Sellers sign up from the store registration page, or you add a store yourself. Decide what they fill in under Onboarding.',
			'multivendorx'
		),
		cta: __('Set up onboarding', 'multivendorx'),
		link: TAB.onboarding,
	},
	{
		id: 'active-store',
		done: data.totals.active_stores > 0,
		title: __('Approve a store', 'multivendorx'),
		doneTitle: __('A store is selling', 'multivendorx'),
		detail: __(
			'A store can list products once it is active. Approve new stores by hand, or let them in automatically.',
			'multivendorx'
		),
		cta: __('Review stores', 'multivendorx'),
		link: TAB.stores,
	},
	{
		id: 'first-sale',
		done: data.totals.orders > 0,
		title: __('Make your first marketplace sale', 'multivendorx'),
		doneTitle: __('First sale made', 'multivendorx'),
		detail: __(
			'Set what the marketplace keeps from each sale. When a customer buys from a store, the order and its commission show up here.',
			'multivendorx'
		),
		cta: __('Set commissions', 'multivendorx'),
		link: TAB.commissions,
	},
];

/**
 * A tile's change badge, "+25%" against the previous period: green when it went up, red when it went down, grey when
 * there is nothing to compare with.
 */
const changeBadge = (
	period: PeriodCount
): { text: string; color: string } | undefined => {
	const change = percentChange(period);

	if (null === change) {
		return period.current > 0
			? { text: __('New', 'multivendorx'), color: 'gray' }
			: undefined;
	}

	if (0 === change) {
		return { text: '0%', color: 'gray' };
	}

	return {
		text: `${change > 0 ? '+' : '−'}${Math.abs(change)}%`,
		color: change > 0 ? 'green' : 'red',
	};
};

/** "Round" axis maximum: 1, 2, 5, 10, 20, 50… at or above the highest bar. */
const niceMax = (value: number): number => {
	if (value <= 1) {
		return 1;
	}
	const magnitude = 10 ** Math.floor(Math.log10(value));
	const step = [1, 2, 5, 10].find((m) => m * magnitude >= value) ?? 10;
	return step * magnitude;
};

/** One daily series (sales or orders): thin bars, a hover tooltip, and the same figures as a table for screen readers. */
const DailyTrend = ({
	daily,
	valueOf,
	formatValue,
	formatAxis,
	caption,
	emptyText,
}: {
	daily: DashboardData['daily'];
	valueOf: (day: DashboardData['daily'][number]) => number;
	/** The tooltip's and table's figure ("$1,240", "3 orders"). */
	formatValue: (value: number) => string;
	/** The axis labels' figure. */
	formatAxis: (value: number) => string;
	/** The screen-reader table's caption and its figure column. */
	caption: { title: string; column: string };
	emptyText: string;
}) => {
	const [hovered, setHovered] = useState<number | null>(null);
	const total = daily.reduce((sum, day) => sum + valueOf(day), 0);
	const max = niceMax(Math.max(0, ...daily.map(valueOf)));
	const hoveredDay = null === hovered ? null : daily[hovered];

	if (0 === total) {
		return (
			<div className="mvx-insights-chart-empty">
				<i className="adminfont-bar-chart" aria-hidden="true" />
				<p>{emptyText}</p>
			</div>
		);
	}

	return (
		<div className="mvx-insights-chart">
			<div className="mvx-insights-chart-plot" aria-hidden="true">
				<div className="mvx-insights-chart-grid">
					<span data-value={formatAxis(max)} />
					<span data-value={formatAxis(max / 2)} />
					<span data-value="0" />
				</div>
				<div
					className="mvx-insights-chart-bars"
					onMouseLeave={() => setHovered(null)}
				>
					{daily.map((day, index) => (
						<div
							key={day.date}
							className={`mvx-insights-chart-slot${hovered === index ? ' is-hovered' : ''}`}
							onMouseEnter={() => setHovered(index)}
						>
							<span
								className="mvx-insights-chart-bar"
								style={{
									height: `${(valueOf(day) / max) * 100}%`,
								}}
							/>
						</div>
					))}
				</div>
				{hoveredDay && null !== hovered && (
					<div
						className="mvx-insights-chart-tooltip"
						style={{
							left: `${((hovered + 0.5) / daily.length) * 100}%`,
						}}
					>
						<strong>{formatValue(valueOf(hoveredDay))}</strong>
						<span>
							{formatDay(hoveredDay.date, {
								weekday: 'short',
								month: 'short',
								day: 'numeric',
							})}
						</span>
					</div>
				)}
			</div>
			<div className="mvx-insights-chart-axis" aria-hidden="true">
				<span>
					{formatDay(daily[0].date, {
						month: 'short',
						day: 'numeric',
					})}
				</span>
				<span>
					{formatDay(daily[Math.floor(daily.length / 2)].date, {
						month: 'short',
						day: 'numeric',
					})}
				</span>
				<span>{__('Today', 'multivendorx')}</span>
			</div>
			{/* The class is on a div: a table ignores the 1px height it sets and would stretch the page. */}
			<div className="screen-reader-text">
				<table>
					<caption>{caption.title}</caption>
					<thead>
						<tr>
							<th scope="col">{__('Date', 'multivendorx')}</th>
							<th scope="col">{caption.column}</th>
						</tr>
					</thead>
					<tbody>
						{daily.map((day) => (
							<tr key={day.date}>
								<td>
									{formatDay(day.date, {
										month: 'long',
										day: 'numeric',
									})}
								</td>
								<td>{formatValue(valueOf(day))}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

/** Where the marketplace is, for the welcome block above the tabs: still setting up, or running. */
export interface MarketplaceStage {
	setupComplete: boolean;
	doneSteps: number;
	totalSteps: number;
	/** The first step not yet done, while setting up. */
	nextStepTitle?: string;
}

interface InsightsProps {
	/** The reporting period in days, from the switch beside the dashboard's tabs. */
	days: number;
	/** Told the marketplace's stage each time the figures load. */
	onStage?: (stage: MarketplaceStage) => void;
	/** The most-used modules as quick switches. */
	modules: React.ReactNode;
	/** The "Do more with MultiVendorX Pro" card; null with Pro active. */
	pro: React.ReactNode;
	/** Help & resources: learning, troubleshooting and the ways to reach the team. */
	help: React.ReactNode;
	/** More from the MultiVendorX team. */
	team: React.ReactNode;
}

/** The cards under the setup row or the figures: Help & resources, then Pro. */
const SupportRows = ({ pro, help }: Pick<InsightsProps, 'pro' | 'help'>) => (
	<>
		{help}
		{pro}
	</>
);

/**
 * The whole Overview tab. Until the first sale it is a setup page: the setup card beside the team's plugins, then
 * Learn beside Help & Support, then Pro. After it, the period's figures lead: tiles, what needs attention, the daily
 * trend and the top stores, with a side column of the team's plugins, the setup card (if a step comes undone), what
 * is switched on and the newest stores; Learn, Help & Support and Pro follow. One request, to
 * multivendorx/v1/admin-dashboard.
 */
const Insights: React.FC<InsightsProps> = ({
	days,
	onStage,
	modules,
	pro,
	help,
	team,
}) => {
	const [data, setData] = useState<DashboardData | null>(null);
	const [failed, setFailed] = useState(false);
	// The reporting period, from the range switch. Changing it keeps the figures on screen (dimmed) until the new
	// ones arrive, so the layout doesn't jump.
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [chartMetric, setChartMetric] = useState<'sales' | 'orders'>('sales');
	const [showAllInsights, setShowAllInsights] = useState(false);

	// The welcome block above the tabs words its line and picks its main button from this.
	useEffect(() => {
		if (!data || !onStage) {
			return;
		}
		const stageSteps = buildSetupSteps(data);
		const done = stageSteps.filter((step) => step.done).length;
		onStage({
			setupComplete: done === stageSteps.length,
			doneSteps: done,
			totalSteps: stageSteps.length,
			nextStepTitle: stageSteps.find((step) => !step.done)?.title,
		});
	}, [data, onStage]);

	// Links to Help & Support (`&view=help-support`) scroll to the card once it is drawn.
	useEffect(() => {
		if (
			data &&
			'help-support' ===
				new URLSearchParams(window.location.hash.substring(1)).get(
					'view'
				)
		) {
			document
				.getElementById('multivendorx-help-support')
				?.scrollIntoView({ block: 'start' });
		}
	}, [data]);

	useEffect(() => {
		let cancelled = false;

		setIsRefreshing(true);
		axios
			.get(getApiLink(appLocalizer, 'admin-dashboard'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: { days },
			})
			.then((response) => !cancelled && setData(response.data))
			.catch(() => !cancelled && setFailed(true))
			.finally(() => !cancelled && setIsRefreshing(false));

		return () => {
			cancelled = true;
		};
	}, [days]);

	if (failed) {
		return (
			<div className="mvx-insights">
				<div className="mvx-insights-failed" role="alert">
					<i className="adminfont-error" aria-hidden="true" />
					{__(
						'The dashboard figures could not be loaded. Reload the page, or check Settings → Status & Tools.',
						'multivendorx'
					)}
				</div>
				{team}
				{modules}
				<SupportRows pro={pro} help={help} />
			</div>
		);
	}

	if (!data) {
		return (
			<div
				className="mvx-insights"
				aria-busy="true"
				aria-label={__('Loading dashboard', 'multivendorx')}
			>
				<ContainerComponent className="mvx-insights-grid">
					<ColumnComponent grid={6} className="mvx-col-60">
						<CardComponent isLoading />
					</ColumnComponent>
					<ColumnComponent grid={6} className="mvx-col-40">
						{team}
					</ColumnComponent>
				</ContainerComponent>
			</div>
		);
	}

	const { sales } = data;
	const periodDays = data.period_days;
	const steps = buildSetupSteps(data);
	const doneSteps = steps.filter((step) => step.done).length;
	const setupComplete = doneSteps === steps.length;
	const nextStep = steps.find((step) => !step.done);
	const insights = buildInsights(data);
	// The figures start with the first sale. Before it every tile and chart would be zero, and the setup card already
	// says what to do next, so it is the whole dashboard (with anything already waiting in the queue).
	const hasData = data.totals.orders > 0;
	const isPro = !!appLocalizer.khali_dabba;
	const currency = data.currency ?? 'USD';
	const money = (amount: number) => formatMoney(amount, currency);
	const topMax = Math.max(1, ...data.top_stores.map((store) => store.sales));
	const daysBefore = (value: string) =>
		sprintf(
			/* translators: 1: a number or amount, 2: number of days. */
			__('%1$s the %2$s days before', 'multivendorx'),
			value,
			periodDays
		);
	// Every tile gets its daily line, a flat one when the period had none, so the four tiles keep one shape.
	const sparklineOf = (key: 'sales' | 'orders' | 'earnings' | 'new_stores') =>
		data.daily.map((day) => ({ value: day[key] ?? 0 }));
	// The most urgent few, so the list reads as priorities; the rest behind "Show all".
	const visibleInsights = showAllInsights
		? insights
		: insights.slice(0, INSIGHTS_SHOWN);
	const moduleNames: Record<string, string> = Object.fromEntries(
		(getModuleData()?.modules ?? [])
			.filter(
				(module: { id?: string; name?: string; type?: string }) =>
					'separator' !== module.type
			)
			.map((module: { id: string; name: string }) => [
				module.id,
				module.name,
			])
	);
	const activeModules = data.modules.filter((id) => moduleNames[id]);

	// Something waiting gets a card with the most urgent items first. Nothing waiting (once set up) is one quiet line,
	// not a card that only says so.
	const attentionCard =
		insights.length > 0 ? (
			<CardComponent
				title={__('Needs your attention', 'multivendorx')}
				desc={sprintf(
					/* translators: %s: number of items. */
					_n(
						'%s thing to look at',
						'%s things to look at',
						insights.length,
						'multivendorx'
					),
					numberFormat.format(insights.length)
				)}
			>
				<>
					<ul className="mvx-insights-list">
						{visibleInsights.map((insight) => (
							<li
								key={insight.id}
								className={`is-${insight.severity}`}
							>
								<span
									className="mvx-insights-severity"
									title={SEVERITY_LABEL[insight.severity]}
								>
									<i
										className={`adminfont-${SEVERITY_ICON[insight.severity]}`}
										aria-hidden="true"
									/>
									<span className="screen-reader-text">
										{SEVERITY_LABEL[insight.severity]}
									</span>
								</span>
								<span className="mvx-insights-list-text">
									<strong>{insight.title}</strong>
									<span>{insight.detail}</span>
								</span>
								<a
									className="mvx-insights-action"
									href={insight.link}
								>
									{insight.cta}
									<i
										className="adminfont-arrow-right"
										aria-hidden="true"
									/>
								</a>
							</li>
						))}
					</ul>
					{insights.length > INSIGHTS_SHOWN && (
						<button
							type="button"
							className="mvx-insights-more mvx-insights-toggle"
							aria-expanded={showAllInsights}
							onClick={() => setShowAllInsights(!showAllInsights)}
						>
							{showAllInsights
								? __('Show fewer', 'multivendorx')
								: sprintf(
										/* translators: %s: number of items. */
										__('Show all %s', 'multivendorx'),
										insights.length
									)}
						</button>
					)}
				</>
			</CardComponent>
		) : (
			setupComplete && (
				<p className="mvx-insights-allclear">
					<i className="adminfont-check" aria-hidden="true" />
					<span>
						<strong>{__('All clear.', 'multivendorx')}</strong>{' '}
						{__(
							'No store, product or payout is waiting for you.',
							'multivendorx'
						)}
					</span>
				</p>
			)
		);

	const setupCard = setupComplete ? null : (
		<CardComponent
			title={__('Get your marketplace selling', 'multivendorx')}
			desc={sprintf(
				/* translators: 1: steps done, 2: total steps. */
				__(
					'%1$s of %2$s steps done. Each one unlocks the next.',
					'multivendorx'
				),
				doneSteps,
				steps.length
			)}
			className="mvx-insights-setup"
			action={
				<div
					className="mvx-insights-progress"
					role="progressbar"
					aria-valuemin={0}
					aria-valuemax={steps.length}
					aria-valuenow={doneSteps}
					aria-label={__('Setup progress', 'multivendorx')}
				>
					<span
						style={{
							width: `${(doneSteps / steps.length) * 100}%`,
						}}
					/>
				</div>
			}
		>
			<ol className="mvx-insights-steps">
				{steps.map((step, index) => {
					const state = step.done
						? 'is-done'
						: step === nextStep
							? 'is-current'
							: 'is-todo';

					return (
						<li
							key={step.id}
							className={state}
							aria-current={
								step === nextStep ? 'step' : undefined
							}
						>
							<span
								className="mvx-insights-step-marker"
								aria-hidden="true"
							>
								{step.done ? (
									<i className="adminfont-check" />
								) : (
									index + 1
								)}
							</span>
							<div className="mvx-insights-step-body">
								<strong>
									{step.done ? step.doneTitle : step.title}
									{step.done && (
										<span className="screen-reader-text">
											{` ${__('(done)', 'multivendorx')}`}
										</span>
									)}
								</strong>
								{/* Only the step to do now explains itself; the rest stay one quiet line. */}
								{step === nextStep && (
									<>
										<p>{step.detail}</p>
										<div className="mvx-insights-step-actions">
											<a
												className="admin-btn btn-purple-bg"
												href={step.link}
											>
												{step.cta}
											</a>
											<a
												className="mvx-insights-more"
												href={DOCS_URL}
												target="_blank"
												rel="noopener noreferrer"
											>
												{__(
													'Read the guide',
													'multivendorx'
												)}
												<i
													className="adminfont-external"
													aria-hidden="true"
												/>
												<span className="screen-reader-text">
													{__(
														'(opens in a new tab)',
														'multivendorx'
													)}
												</span>
											</a>
										</div>
									</>
								)}
							</div>
						</li>
					);
				})}
			</ol>
		</CardComponent>
	);

	if (!hasData) {
		return (
			<div className="mvx-insights">
				<ContainerComponent className="mvx-insights-grid">
					<ColumnComponent grid={6} className="mvx-col-60">
						<div className="mvx-insights-stack">
							{setupCard}
							{insights.length > 0 && attentionCard}
							{modules}
						</div>
					</ColumnComponent>
					<ColumnComponent grid={6} className="mvx-col-40">
						{team}
					</ColumnComponent>
				</ContainerComponent>
				<SupportRows pro={pro} help={help} />
			</div>
		);
	}

	return (
		<div className="mvx-insights">
			<div className={isRefreshing ? 'mvx-insights-refreshing' : ''}>
				<TrendStatComponent
					cols={4}
					items={[
						{
							icon: 'sales',
							label: __('Sales', 'multivendorx'),
							value: money(sales.sales.current),
							caption: daysBefore(money(sales.sales.previous)),
							badge: changeBadge(sales.sales),
							chartData: sparklineOf('sales'),
							chartDataKey: 'value',
						},
						{
							icon: 'commission',
							label: __('Marketplace earnings', 'multivendorx'),
							value: money(sales.earnings.current),
							caption: daysBefore(money(sales.earnings.previous)),
							badge: changeBadge(sales.earnings),
							chartData: sparklineOf('earnings'),
							chartDataKey: 'value',
						},
						{
							icon: 'order',
							label: __('Orders', 'multivendorx'),
							value: numberFormat.format(sales.orders.current),
							caption: daysBefore(
								numberFormat.format(sales.orders.previous)
							),
							badge: changeBadge(sales.orders),
							chartData: sparklineOf('orders'),
							chartDataKey: 'value',
						},
						{
							icon: 'storefront',
							label: __('New stores', 'multivendorx'),
							value: numberFormat.format(data.new_stores.current),
							caption: daysBefore(
								numberFormat.format(data.new_stores.previous)
							),
							badge: changeBadge(data.new_stores),
							chartData: sparklineOf('new_stores'),
							chartDataKey: 'value',
						},
					]}
				/>
			</div>

			<ContainerComponent className="mvx-insights-grid">
				<ColumnComponent grid={8}>
					<div className="mvx-insights-stack">
						{attentionCard}

						<CardComponent
							title={
								'orders' === chartMetric
									? __('Orders per day', 'multivendorx')
									: __('Sales per day', 'multivendorx')
							}
							desc={sprintf(
								/* translators: 1: total sales or number of orders, 2: number of days. */
								__(
									'%1$s in the last %2$s days',
									'multivendorx'
								),
								'orders' === chartMetric
									? numberFormat.format(sales.orders.current)
									: money(sales.sales.current),
								periodDays
							)}
							action={
								<div
									className="mvx-insights-range"
									role="group"
									aria-label={__('Chart', 'multivendorx')}
								>
									{(
										[
											[
												'sales',
												__('Sales', 'multivendorx'),
											],
											[
												'orders',
												__('Orders', 'multivendorx'),
											],
										] as const
									).map(([key, label]) => (
										<button
											key={key}
											type="button"
											aria-pressed={key === chartMetric}
											className={
												key === chartMetric
													? 'is-active'
													: ''
											}
											onClick={() => setChartMetric(key)}
										>
											{label}
										</button>
									))}
								</div>
							}
						>
							<div
								className={
									isRefreshing
										? 'mvx-insights-refreshing'
										: ''
								}
							>
								{'orders' === chartMetric ? (
									<DailyTrend
										daily={data.daily}
										valueOf={(day) => day.orders}
										formatValue={(value) =>
											sprintf(
												/* translators: %s: number of orders. */
												_n(
													'%s order',
													'%s orders',
													value,
													'multivendorx'
												),
												numberFormat.format(value)
											)
										}
										formatAxis={(value) =>
											numberFormat.format(value)
										}
										caption={{
											title: __(
												'Orders per day',
												'multivendorx'
											),
											column: __(
												'Orders',
												'multivendorx'
											),
										}}
										emptyText={__(
											'No orders in this period yet. Each order a store receives shows up here.',
											'multivendorx'
										)}
									/>
								) : (
									<DailyTrend
										daily={data.daily}
										valueOf={(day) => day.sales}
										formatValue={(value) =>
											formatMoney(value, currency, true)
										}
										formatAxis={money}
										caption={{
											title: __(
												'Sales per day',
												'multivendorx'
											),
											column: __('Sales', 'multivendorx'),
										}}
										emptyText={__(
											'No sales in this period yet. Each order a store receives shows up here.',
											'multivendorx'
										)}
									/>
								)}
							</div>
						</CardComponent>

						<CardComponent
							title={__('Top stores', 'multivendorx')}
							desc={sprintf(
								/* translators: %s: number of days. */
								__('By sales, last %s days', 'multivendorx'),
								periodDays
							)}
						>
							{data.top_stores.length > 0 ? (
								<table className="mvx-insights-table">
									<thead>
										<tr>
											<th scope="col">
												{__('Store', 'multivendorx')}
											</th>
											<th scope="col">
												{__('Sales', 'multivendorx')}
											</th>
											<th
												scope="col"
												className="is-number"
											>
												{__('Orders', 'multivendorx')}
											</th>
											<th scope="col">
												<span className="screen-reader-text">
													{__('View', 'multivendorx')}
												</span>
											</th>
										</tr>
									</thead>
									<tbody>
										{data.top_stores.map((store) => (
											<tr key={store.id}>
												<td className="mvx-insights-table-title">
													{store.name ||
														__(
															'Deleted store',
															'multivendorx'
														)}
												</td>
												<td>
													<span className="mvx-insights-meter">
														<span
															className="mvx-insights-meter-bar"
															aria-hidden="true"
														>
															<span
																style={{
																	width: `${(store.sales / topMax) * 100}%`,
																}}
															/>
														</span>
														{money(store.sales)}
													</span>
												</td>
												<td className="is-number">
													{numberFormat.format(
														store.orders
													)}
												</td>
												<td className="mvx-insights-table-action">
													{store.name && (
														<a
															href={TAB.store(
																store.id
															)}
														>
															{__(
																'View store',
																'multivendorx'
															)}
														</a>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							) : (
								<p className="mvx-insights-empty">
									{__(
										'Stores that sell in this period are ranked here.',
										'multivendorx'
									)}
								</p>
							)}
						</CardComponent>

						{modules}
					</div>
				</ColumnComponent>

				<ColumnComponent grid={4}>
					<div className="mvx-insights-stack">
						{setupCard}
						<CardComponent
							title={__('Newest stores', 'multivendorx')}
							desc={__('Most recent first', 'multivendorx')}
						>
							{data.newest_stores.length > 0 ? (
								<ul className="mvx-insights-recent">
									{data.newest_stores.map((store) => (
										<li key={store.id}>
											<span
												className="mvx-insights-avatar"
												aria-hidden="true"
											>
												{(store.name || '?')
													.charAt(0)
													.toUpperCase()}
											</span>
											<span className="mvx-insights-recent-text">
												<strong>
													<a
														href={TAB.store(
															store.id
														)}
													>
														{store.name}
													</a>
												</strong>
											</span>
											<span className="mvx-insights-recent-meta">
												<span
													className={`mvx-insights-status-tag is-${store.status}`}
												>
													{STORE_STATUS_LABEL[
														store.status
													] ?? store.status}
												</span>
												<time dateTime={store.date}>
													{formatAgo(store.date)}
												</time>
											</span>
										</li>
									))}
								</ul>
							) : (
								<p className="mvx-insights-empty">
									{__('No stores yet.', 'multivendorx')}
								</p>
							)}
						</CardComponent>
						<CardComponent
							title={__('What is switched on', 'multivendorx')}
							desc={sprintf(
								/* translators: 1: "MultiVendorX Pro" or "MultiVendorX Free", 2: number of modules. */
								_n(
									'%1$s · %2$s module on',
									'%1$s · %2$s modules on',
									activeModules.length,
									'multivendorx'
								),
								isPro
									? 'MultiVendorX Pro'
									: 'MultiVendorX Free',
								numberFormat.format(activeModules.length)
							)}
							action={
								<a
									className="mvx-insights-more"
									href={TAB.modules}
								>
									{__('Modules', 'multivendorx')}
									<i
										className="adminfont-arrow-right"
										aria-hidden="true"
									/>
								</a>
							}
						>
							{activeModules.length > 0 ? (
								<dl className="mvx-insights-pulse">
									{activeModules
										.slice(0, MODULES_SHOWN)
										.map((id) => (
											<div key={id}>
												<dt>{moduleNames[id]}</dt>
												<dd>
													<span
														className="mvx-insights-dot is-good"
														aria-hidden="true"
													/>
													{__('On', 'multivendorx')}
												</dd>
											</div>
										))}
									{activeModules.length > MODULES_SHOWN && (
										<div>
											<dt>
												{sprintf(
													/* translators: %s: number of modules. */
													__(
														'+%s more',
														'multivendorx'
													),
													activeModules.length -
														MODULES_SHOWN
												)}
											</dt>
											<dd />
										</div>
									)}
								</dl>
							) : (
								<p className="mvx-insights-empty">
									{__(
										'No modules are on yet.',
										'multivendorx'
									)}
								</p>
							)}
						</CardComponent>

						{team}
					</div>
				</ColumnComponent>
			</ContainerComponent>

			<SupportRows pro={pro} help={help} />
		</div>
	);
};

export default Insights;
