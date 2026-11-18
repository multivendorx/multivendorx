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

/** GET moowoodle/v1/dashboard (classes/RestAPI/Controllers/Dashboard.php). */
interface DashboardData {
	period_days: number;
	/** The periods the range switch offers, e.g. [7, 30, 90]. */
	period_choices?: number[];
	idle_days: number;
	/** The store's currency code, for revenue. */
	currency?: string;
	connection: {
		configured: boolean;
		site_name: string;
		moodle_url: string;
		sync_running: boolean;
	};
	courses: {
		total: number;
		with_product: number;
		without_product: number;
		not_selling: number;
		ending_soon: number;
		ended_on_sale: number;
		categories: number;
	};
	enrollments: {
		total: number;
		by_status: Record<string, number>;
		new: PeriodCount;
		unenrolled: PeriodCount;
		/** Active enrollments whose access ends within `days` (set by MooWoodle Pro). */
		expiring?: { count: number; days: number };
	};
	/** Course revenue: line totals of the order items behind the period's enrollments. */
	revenue?: PeriodCount;
	/** Processing orders with a course product: paid, but enrollment waits for Completed. */
	waiting_orders?: { count: number; limited: boolean; url: string };
	daily: Array<{ date: string; count: number; revenue?: number }>;
	top_courses: Array<{
		course_id: number;
		name: string;
		enrollments: number;
		revenue?: number;
		product_url: string;
	}>;
	recent: Array<{
		student: string;
		course: string;
		status: string;
		date: string;
	}>;
}

interface PeriodCount {
	current: number;
	previous: number;
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
	connection: '#&tab=settings&subtab=connection-access',
	syncCourses: '#&tab=synchronization&subtab=synchronize-course',
	courses: '#&tab=courses',
	enrollments: '#&tab=enrolments',
};

const SEVERITY_LABEL: Record<Severity, string> = {
	critical: __('Critical', 'moowoodle'),
	warning: __('Warning', 'moowoodle'),
	info: __('Info', 'moowoodle'),
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

const numberFormat = new Intl.NumberFormat();

/** How many "needs your attention" items show before "Show all". */
const INSIGHTS_SHOWN = 3;

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

	return __('just now', 'moowoodle');
};

/**
 * Turns the dashboard numbers into what needs doing, most urgent first. Connecting Moodle™ and the first sync aren't
 * listed: the setup checklist covers them, and comes back if the connection is lost.
 */
const buildInsights = (data: DashboardData): Insight[] => {
	const { connection, courses, enrollments, period_days: periodDays } = data;
	const insights: Insight[] = [];
	const waiting = data.waiting_orders;
	const expiring = enrollments.expiring;

	if (waiting && waiting.count > 0) {
		insights.push({
			id: 'waiting-orders',
			severity: 'critical',
			title: sprintf(
				/* translators: %s: number of orders. */
				_n(
					'%s paid order isn’t enrolled yet',
					'%s paid orders aren’t enrolled yet',
					waiting.count,
					'moowoodle'
				),
				`${numberFormat.format(waiting.count)}${waiting.limited ? '+' : ''}`
			),
			detail: __(
				'They are Processing. MooWoodle enrolls buyers in Moodle™ when an order is marked Completed, so until then they have paid but can’t open the course.',
				'moowoodle'
			),
			cta: __('Review orders', 'moowoodle'),
			link: waiting.url,
		});
	}

	if (courses.ended_on_sale > 0) {
		insights.push({
			id: 'ended-on-sale',
			severity: 'critical',
			title: sprintf(
				/* translators: %s: number of courses. */
				_n(
					'%s ended course is still for sale',
					'%s ended courses are still for sale',
					courses.ended_on_sale,
					'moowoodle'
				),
				numberFormat.format(courses.ended_on_sale)
			),
			detail: __(
				'Buyers can still purchase a course whose end date has passed. Unpublish the product or update the course dates in Moodle™.',
				'moowoodle'
			),
			cta: __('Review courses', 'moowoodle'),
			link: TAB.courses,
		});
	}

	if (courses.with_product > 0 && courses.without_product > 0) {
		insights.push({
			id: 'without-product',
			severity: 'warning',
			title: sprintf(
				/* translators: %s: number of courses. */
				_n(
					'%s course isn’t for sale yet',
					'%s courses aren’t for sale yet',
					courses.without_product,
					'moowoodle'
				),
				numberFormat.format(courses.without_product)
			),
			detail: __(
				'They are synced from Moodle™ but have no WooCommerce product, so no one can buy them.',
				'moowoodle'
			),
			cta: __('Create products', 'moowoodle'),
			link: TAB.courses,
		});
	}

	const enrollmentChange = percentChange(enrollments.new);

	if (
		null !== enrollmentChange &&
		enrollmentChange <= -25 &&
		enrollments.new.previous >= 5
	) {
		insights.push({
			id: 'enrollments-down',
			severity: 'warning',
			title: sprintf(
				/* translators: 1: percentage drop, 2: number of days. */
				__(
					'New enrollments are down %1$s%% on the previous %2$s days',
					'moowoodle'
				),
				Math.abs(enrollmentChange),
				periodDays
			),
			detail: sprintf(
				/* translators: 1: enrollments this period, 2: enrollments in the previous period. */
				__(
					'%1$s this period against %2$s before it. Check the courses that usually sell best.',
					'moowoodle'
				),
				numberFormat.format(enrollments.new.current),
				numberFormat.format(enrollments.new.previous)
			),
			cta: __('See courses', 'moowoodle'),
			link: TAB.courses,
		});
	}

	if (courses.not_selling > 0) {
		insights.push({
			id: 'not-selling',
			severity: 'info',
			title: sprintf(
				/* translators: 1: number of courses, 2: number of days. */
				_n(
					'%1$s course on sale had no enrollments in %2$s days',
					'%1$s courses on sale had no enrollments in %2$s days',
					courses.not_selling,
					'moowoodle'
				),
				numberFormat.format(courses.not_selling),
				data.idle_days
			),
			detail: __(
				'Review their price and product page, or feature them to bring in students.',
				'moowoodle'
			),
			cta: __('Review courses', 'moowoodle'),
			link: TAB.courses,
		});
	}

	if (courses.ending_soon > 0) {
		insights.push({
			id: 'ending-soon',
			severity: 'info',
			title: sprintf(
				/* translators: 1: number of courses, 2: number of days. */
				_n(
					'%1$s course ends in the next %2$s days',
					'%1$s courses end in the next %2$s days',
					courses.ending_soon,
					'moowoodle'
				),
				numberFormat.format(courses.ending_soon),
				periodDays
			),
			detail: __(
				'Plan the next run in Moodle™ and sync it, so the product stays on sale.',
				'moowoodle'
			),
			cta: __('View courses', 'moowoodle'),
			link: TAB.courses,
		});
	}

	if (expiring && expiring.count > 0) {
		insights.push({
			id: 'access-expiring',
			severity: 'info',
			title: sprintf(
				/* translators: 1: number of students, 2: number of days. */
				_n(
					'%1$s student’s access ends in the next %2$s days',
					'%1$s students’ access ends in the next %2$s days',
					expiring.count,
					'moowoodle'
				),
				numberFormat.format(expiring.count),
				expiring.days
			),
			detail: __(
				'A good moment to offer a renewal or the next course.',
				'moowoodle'
			),
			cta: __('See enrollments', 'moowoodle'),
			link: TAB.enrollments,
		});
	}

	if (connection.sync_running) {
		insights.push({
			id: 'sync-running',
			severity: 'info',
			title: __('A course sync is running', 'moowoodle'),
			detail: __('Course figures update when it finishes.', 'moowoodle'),
			cta: __('View progress', 'moowoodle'),
			link: TAB.syncCourses,
		});
	}

	return insights.sort(
		(a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
	);
};

/**
 * The four steps from a fresh install to the first enrollment. The first one connects Moodle™, or tests a connection
 * that is saved but hasn't passed; if a working connection is lost later, it is the step to do again.
 */
const buildSetupSteps = (data: DashboardData) => [
	data.connection.configured
		? {
				id: 'connect',
				done: '' !== data.connection.site_name,
				title: __('Test your Moodle™ connection', 'moowoodle'),
				doneTitle: __('Moodle™ connected', 'moowoodle'),
				detail: __(
					'Your site URL and token are saved. Run the test to confirm the two sites can reach each other.',
					'moowoodle'
				),
				cta: __('Test connection', 'moowoodle'),
				link: TAB.connection,
			}
		: {
				id: 'connect',
				done: false,
				title: __('Connect your Moodle™ site', 'moowoodle'),
				doneTitle: __('Moodle™ connected', 'moowoodle'),
				detail: __(
					'Add your Moodle™ site URL and a web service token. Courses sync and buyers are enrolled once it’s connected.',
					'moowoodle'
				),
				cta: __('Connect Moodle™ Site', 'moowoodle'),
				link: TAB.connection,
			},
	{
		id: 'sync',
		done: data.courses.total > 0,
		title: __('Sync your courses', 'moowoodle'),
		doneTitle: sprintf(
			/* translators: %s: number of synced courses. */
			_n(
				'%s course synced',
				'%s courses synced',
				data.courses.total,
				'moowoodle'
			),
			numberFormat.format(data.courses.total)
		),
		detail: __('Bring your Moodle™ courses into WordPress.', 'moowoodle'),
		cta: __('Sync courses', 'moowoodle'),
		link: TAB.syncCourses,
	},
	{
		id: 'sell',
		done: data.courses.with_product > 0,
		title: __('Put a course on sale', 'moowoodle'),
		doneTitle: sprintf(
			/* translators: %s: number of courses on sale. */
			_n(
				'%s course on sale',
				'%s courses on sale',
				data.courses.with_product,
				'moowoodle'
			),
			numberFormat.format(data.courses.with_product)
		),
		detail: __(
			'Create a WooCommerce product for a course so students can buy it.',
			'moowoodle'
		),
		cta: __('Create products', 'moowoodle'),
		link: TAB.courses,
	},
	{
		id: 'enroll',
		done: data.enrollments.total > 0,
		title: __('Get your first enrollment', 'moowoodle'),
		doneTitle: __('First enrollment received', 'moowoodle'),
		detail: __(
			'When someone buys a course, MooWoodle enrolls them in Moodle™ and it shows here.',
			'moowoodle'
		),
		cta: __('View courses', 'moowoodle'),
		link: TAB.courses,
	},
];

/**
 * A tile's change badge, "+25%" against the previous period: green when it moved the good way, red when not, grey when
 * there is nothing to compare with. `higherIsBetter` picks which way is good.
 */
const changeBadge = (
	period: PeriodCount,
	higherIsBetter: boolean
): { text: string; color: string } | undefined => {
	const change = percentChange(period);

	if (null === change) {
		return period.current > 0
			? { text: __('New', 'moowoodle'), color: 'gray' }
			: undefined;
	}

	if (0 === change) {
		return { text: '0%', color: 'gray' };
	}

	return {
		text: `${change > 0 ? '+' : '−'}${Math.abs(change)}%`,
		color: change > 0 === higherIsBetter ? 'green' : 'red',
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

/**
 * One daily series (new enrollments or course revenue): thin bars, a hover tooltip, and the same figures as a table
 * for screen readers.
 */
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
	/** The tooltip's and table's figure ("3 enrollments", "$120.00"). */
	formatValue: (value: number) => string;
	/** The gridline labels ("10", "$500"). */
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
			<div className="mw-insights-chart-empty">
				<i className="adminfont-bar-chart" aria-hidden="true" />
				<p>{emptyText}</p>
			</div>
		);
	}

	return (
		<div className="mw-insights-chart">
			<div className="mw-insights-chart-plot" aria-hidden="true">
				<div className="mw-insights-chart-grid">
					<span data-value={formatAxis(max)} />
					<span data-value={formatAxis(max / 2)} />
					<span data-value="0" />
				</div>
				<div
					className="mw-insights-chart-bars"
					onMouseLeave={() => setHovered(null)}
				>
					{daily.map((day, index) => (
						<div
							key={day.date}
							className={`mw-insights-chart-slot${hovered === index ? ' is-hovered' : ''}`}
							onMouseEnter={() => setHovered(index)}
						>
							<span
								className="mw-insights-chart-bar"
								style={{
									height: `${(valueOf(day) / max) * 100}%`,
								}}
							/>
						</div>
					))}
				</div>
				{hoveredDay && null !== hovered && (
					<div
						className="mw-insights-chart-tooltip"
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
			<div className="mw-insights-chart-axis" aria-hidden="true">
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
				<span>{__('Today', 'moowoodle')}</span>
			</div>
			<table className="screen-reader-text">
				<caption>{caption.title}</caption>
				<thead>
					<tr>
						<th scope="col">{__('Date', 'moowoodle')}</th>
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
	);
};

const STATUS_LABEL: Record<string, string> = {
	enrolled: __('Enrolled', 'moowoodle'),
	unenrolled: __('Unenrolled', 'moowoodle'),
	expired: __('Expired', 'moowoodle'),
};

interface InsightsProps {
	/** The "Do more with MooWoodle Pro" card; null with Pro active. */
	pro: React.ReactNode;
	/** Learn MooWoodle: docs, videos, forum. */
	learn: React.ReactNode;
	/** Help & Support: troubleshooting and the ways to reach the team. */
	help: React.ReactNode;
	/** More from the MooWoodle team. */
	team: React.ReactNode;
}

/**
 * The cards under the setup row or the figures: Learn MooWoodle beside Help & Support, then Pro. (The team's plugins
 * sit at the top right instead: beside the setup card, or at the head of the figures' side column.)
 */
const SupportRows = ({ pro, learn, help }: Omit<InsightsProps, 'team'>) => (
	<>
		<ContainerComponent className="mw-insights-grid is-equal">
			<ColumnComponent grid={4}>{learn}</ColumnComponent>
			<ColumnComponent grid={8}>{help}</ColumnComponent>
		</ContainerComponent>
		{pro}
	</>
);

/**
 * The whole Overview tab. Until the first enrollment it is a setup page: the setup card beside the team's plugins,
 * then Learn MooWoodle beside Help & Support, then Pro. After it, the period's figures lead: tiles, what needs
 * attention, the enrollment trend and top courses, with a side column of the team's plugins, the setup card (if a step
 * comes undone), the connection and the latest enrollments; Learn, Help & Support and Pro follow. One request, to
 * moowoodle/v1/dashboard.
 */
const Insights: React.FC<InsightsProps> = ({ pro, learn, help, team }) => {
	const [data, setData] = useState<DashboardData | null>(null);
	const [failed, setFailed] = useState(false);
	// The reporting period, from the range switch. Changing it keeps the figures on screen (dimmed) until the new
	// ones arrive, so the layout doesn't jump.
	const [days, setDays] = useState(30);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [chartMetric, setChartMetric] = useState<'enrollments' | 'revenue'>(
		'enrollments'
	);
	const [showAllInsights, setShowAllInsights] = useState(false);

	// Help & Support used to be its own tab; its links (`&view=help-support`) now scroll to the card once it is drawn.
	useEffect(() => {
		if (
			data &&
			'help-support' ===
				new URLSearchParams(window.location.hash.substring(1)).get(
					'view'
				)
		) {
			document
				.getElementById('moowoodle-help-support')
				?.scrollIntoView({ block: 'start' });
		}
	}, [data]);

	useEffect(() => {
		let cancelled = false;

		setIsRefreshing(true);
		axios
			.get(getApiLink(appLocalizer, 'dashboard'), {
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
			<div className="mw-insights">
				<div className="mw-insights-failed" role="alert">
					<i className="adminfont-error" aria-hidden="true" />
					{__(
						'The dashboard figures could not be loaded. Reload the page, or check Settings → System & Logs.',
						'moowoodle'
					)}
				</div>
				{team}
				<SupportRows pro={pro} learn={learn} help={help} />
			</div>
		);
	}

	if (!data) {
		return (
			<div
				className="mw-insights"
				aria-busy="true"
				aria-label={__('Loading dashboard', 'moowoodle')}
			>
				<ContainerComponent className="mw-insights-grid">
					<ColumnComponent grid={6} className="mw-col-60">
						<CardComponent isLoading />
					</ColumnComponent>
					<ColumnComponent grid={6} className="mw-col-40">
						{team}
					</ColumnComponent>
				</ContainerComponent>
			</div>
		);
	}

	const { connection, courses, enrollments } = data;
	const periodDays = data.period_days;
	const steps = buildSetupSteps(data);
	const doneSteps = steps.filter((step) => step.done).length;
	const setupComplete = doneSteps === steps.length;
	const nextStep = steps.find((step) => !step.done);
	const insights = buildInsights(data);
	// The figures start with the first enrollment. Before it, every tile and chart would be zero, and the setup card
	// already says what to do next, so it is the whole dashboard.
	const hasData = enrollments.total > 0;
	// Same test as the checklist's first step: URL and token saved, and the connection test has passed.
	const isConnected = connection.configured && '' !== connection.site_name;
	const topMax = Math.max(
		1,
		...data.top_courses.map((course) => course.enrollments)
	);
	const daysBefore = (count: number) =>
		sprintf(
			/* translators: 1: a number, 2: number of days. */
			__('%1$s the %2$s days before', 'moowoodle'),
			numberFormat.format(count),
			periodDays
		);
	const sparkline = data.daily.some((day) => day.count > 0)
		? data.daily.map((day) => ({ value: day.count }))
		: undefined;
	const currency = data.currency ?? 'USD';
	const revenue = data.revenue ?? { current: 0, previous: 0 };
	const money = (amount: number) => formatMoney(amount, currency);
	const revenueSparkline = data.daily.some((day) => (day.revenue ?? 0) > 0)
		? data.daily.map((day) => ({ value: day.revenue ?? 0 }))
		: undefined;
	// Revenue per new enrollment: a price and mix signal ("are buyers choosing cheaper courses?").
	const perEnrollment =
		enrollments.new.current > 0 && revenue.current > 0
			? revenue.current / enrollments.new.current
			: null;
	const periodChoices = data.period_choices ?? [7, 30, 90];
	// The most urgent few, so the list reads as priorities; the rest behind "Show all".
	const visibleInsights = showAllInsights
		? insights
		: insights.slice(0, INSIGHTS_SHOWN);
	const unenrolledMore =
		enrollments.unenrolled.current - enrollments.unenrolled.previous;

	const setupCard = setupComplete ? null : (
		<CardComponent
			title={__('Get MooWoodle ready', 'moowoodle')}
			desc={sprintf(
				/* translators: 1: steps done, 2: total steps. */
				__(
					'%1$s of %2$s steps done. Each one unlocks the next.',
					'moowoodle'
				),
				doneSteps,
				steps.length
			)}
			className="mw-insights-setup"
			action={
				<div
					className="mw-insights-progress"
					role="progressbar"
					aria-valuemin={0}
					aria-valuemax={steps.length}
					aria-valuenow={doneSteps}
					aria-label={__('Setup progress', 'moowoodle')}
				>
					<span
						style={{
							width: `${(doneSteps / steps.length) * 100}%`,
						}}
					/>
				</div>
			}
		>
			<ol className="mw-insights-steps">
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
								className="mw-insights-step-marker"
								aria-hidden="true"
							>
								{step.done ? (
									<i className="adminfont-check" />
								) : (
									index + 1
								)}
							</span>
							<div className="mw-insights-step-body">
								<strong>
									{step.done ? step.doneTitle : step.title}
									{step.done && (
										<span className="screen-reader-text">
											{` ${__('(done)', 'moowoodle')}`}
										</span>
									)}
								</strong>
								{/* Only the step to do now explains itself; the rest stay one quiet line. */}
								{step === nextStep && (
									<>
										<p>{step.detail}</p>
										<div className="mw-insights-step-actions">
											<a
												className="admin-btn btn-purple-bg"
												href={step.link}
											>
												{step.cta}
											</a>
											{'connect' === step.id &&
												!connection.configured && (
													<a
														className="mw-insights-more"
														href={DOCS_URL}
														target="_blank"
														rel="noopener noreferrer"
													>
														{__(
															'How to get a token',
															'moowoodle'
														)}
														<i
															className="adminfont-external"
															aria-hidden="true"
														/>
														<span className="screen-reader-text">
															{__(
																'(opens in a new tab)',
																'moowoodle'
															)}
														</span>
													</a>
												)}
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
			<div className="mw-insights">
				<ContainerComponent className="mw-insights-grid is-equal">
					<ColumnComponent grid={6} className="mw-col-60">
						{setupCard}
					</ColumnComponent>
					<ColumnComponent grid={6} className="mw-col-40">
						{team}
					</ColumnComponent>
				</ContainerComponent>
				<SupportRows pro={pro} learn={learn} help={help} />
			</div>
		);
	}

	return (
		<div className="mw-insights">
			<div className="mw-insights-toolbar">
				<p>
					{isConnected && (
						<span className="mw-insights-connected">
							<span
								className="mw-insights-dot is-good"
								aria-hidden="true"
							/>
							{connection.site_name}
						</span>
					)}
					<span>
						{sprintf(
							/* translators: %1$s: number of days (used twice). */
							__(
								'Last %1$s days, compared with the %1$s days before',
								'moowoodle'
							),
							periodDays
						)}
					</span>
				</p>
				<div
					className="mw-insights-range"
					role="group"
					aria-label={__('Reporting period', 'moowoodle')}
				>
					{periodChoices.map((choice) => (
						<button
							key={choice}
							type="button"
							aria-pressed={choice === periodDays}
							className={choice === periodDays ? 'is-active' : ''}
							disabled={isRefreshing}
							onClick={() => setDays(choice)}
						>
							{sprintf(
								/* translators: %s: number of days; "30d" means 30 days. */
								__('%sd', 'moowoodle'),
								choice
							)}
						</button>
					))}
				</div>
			</div>

			<div className={isRefreshing ? 'mw-insights-refreshing' : ''}>
				<TrendStatComponent
					cols={4}
					items={[
						{
							icon: 'revenue',
							label: __('Course revenue', 'moowoodle'),
							value: money(revenue.current),
							caption:
								null === perEnrollment
									? sprintf(
											/* translators: 1: an amount, 2: number of days. */
											__(
												'%1$s the %2$s days before',
												'moowoodle'
											),
											money(revenue.previous),
											periodDays
										)
									: sprintf(
											/* translators: %s: an amount. */
											__(
												'%s per new enrollment',
												'moowoodle'
											),
											formatMoney(
												perEnrollment,
												currency,
												true
											)
										),
							badge: changeBadge(revenue, true),
							chartData: revenueSparkline,
							chartDataKey: 'value',
						},
						{
							icon: 'classroom-enrollment',
							label: __('New enrollments', 'moowoodle'),
							value: numberFormat.format(enrollments.new.current),
							caption: daysBefore(enrollments.new.previous),
							badge: changeBadge(enrollments.new, true),
							chartData: sparkline,
							chartDataKey: 'value',
						},
						{
							icon: 'person',
							label: __('Active students', 'moowoodle'),
							value: numberFormat.format(
								enrollments.by_status.enrolled ?? 0
							),
							caption: sprintf(
								/* translators: %s: number of unenrollments. */
								_n(
									'%s unenrolled in this period',
									'%s unenrolled in this period',
									enrollments.unenrolled.current,
									'moowoodle'
								),
								numberFormat.format(
									enrollments.unenrolled.current
								)
							),
							// Only worth a colour when more students are leaving than before.
							badge:
								unenrolledMore > 0
									? {
											text: sprintf(
												/* translators: %s: number of extra unenrollments. */
												__('+%s leaving', 'moowoodle'),
												numberFormat.format(
													unenrolledMore
												)
											),
											color: 'red',
										}
									: undefined,
						},
						{
							icon: 'catalog',
							label: __('Courses on sale', 'moowoodle'),
							value: numberFormat.format(courses.with_product),
							caption: sprintf(
								/* translators: %s: number of synced courses. */
								__('of %s synced courses', 'moowoodle'),
								numberFormat.format(courses.total)
							),
							badge:
								courses.without_product > 0
									? {
											text: sprintf(
												/* translators: %s: number of courses. */
												__('%s unlisted', 'moowoodle'),
												numberFormat.format(
													courses.without_product
												)
											),
											color: 'gray',
										}
									: undefined,
						},
					]}
				/>
			</div>

			<ContainerComponent className="mw-insights-grid">
				<ColumnComponent grid={8}>
					<div className="mw-insights-stack">
						{(insights.length > 0 || setupComplete) && (
							<CardComponent
								title={__('Needs your attention', 'moowoodle')}
								desc={
									insights.length > 0
										? sprintf(
												/* translators: %s: number of items. */
												_n(
													'%s thing to look at',
													'%s things to look at',
													insights.length,
													'moowoodle'
												),
												numberFormat.format(
													insights.length
												)
											)
										: __(
												'Nothing waiting on you',
												'moowoodle'
											)
								}
							>
								{insights.length > 0 ? (
									<>
										<ul className="mw-insights-list">
											{visibleInsights.map((insight) => (
												<li
													key={insight.id}
													className={`is-${insight.severity}`}
												>
													<span
														className="mw-insights-severity"
														title={
															SEVERITY_LABEL[
																insight.severity
															]
														}
													>
														<i
															className={`adminfont-${SEVERITY_ICON[insight.severity]}`}
															aria-hidden="true"
														/>
														<span className="screen-reader-text">
															{
																SEVERITY_LABEL[
																	insight
																		.severity
																]
															}
														</span>
													</span>
													<span className="mw-insights-list-text">
														<strong>
															{insight.title}
														</strong>
														<span>
															{insight.detail}
														</span>
													</span>
													<a
														className="mw-insights-action"
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
												className="mw-insights-more mw-insights-toggle"
												aria-expanded={showAllInsights}
												onClick={() =>
													setShowAllInsights(
														!showAllInsights
													)
												}
											>
												{showAllInsights
													? __(
															'Show fewer',
															'moowoodle'
														)
													: sprintf(
															/* translators: %s: number of items. */
															__(
																'Show all %s',
																'moowoodle'
															),
															insights.length
														)}
											</button>
										)}
									</>
								) : (
									<p className="mw-insights-clear">
										<i
											className="adminfont-check"
											aria-hidden="true"
										/>
										{__(
											'Your courses are connected, on sale and enrolling students.',
											'moowoodle'
										)}
									</p>
								)}
							</CardComponent>
						)}

						<CardComponent
							title={
								'revenue' === chartMetric
									? __('Course revenue per day', 'moowoodle')
									: __('New enrollments per day', 'moowoodle')
							}
							desc={
								'revenue' === chartMetric
									? sprintf(
											/* translators: 1: an amount, 2: number of days. */
											__(
												'%1$s in the last %2$s days',
												'moowoodle'
											),
											money(revenue.current),
											periodDays
										)
									: sprintf(
											/* translators: 1: number of enrollments, 2: number of days. */
											_n(
												'%1$s in the last %2$s days',
												'%1$s in the last %2$s days',
												enrollments.new.current,
												'moowoodle'
											),
											numberFormat.format(
												enrollments.new.current
											),
											periodDays
										)
							}
							action={
								<div
									className="mw-insights-range"
									role="group"
									aria-label={__('Chart', 'moowoodle')}
								>
									{(
										[
											[
												'enrollments',
												__('Enrollments', 'moowoodle'),
											],
											[
												'revenue',
												__('Revenue', 'moowoodle'),
											],
										] as const
									).map(([metric, label]) => (
										<button
											key={metric}
											type="button"
											aria-pressed={
												metric === chartMetric
											}
											className={
												metric === chartMetric
													? 'is-active'
													: ''
											}
											onClick={() =>
												setChartMetric(metric)
											}
										>
											{label}
										</button>
									))}
								</div>
							}
						>
							<div
								className={
									isRefreshing ? 'mw-insights-refreshing' : ''
								}
							>
								{'revenue' === chartMetric ? (
									<DailyTrend
										daily={data.daily}
										valueOf={(day) => day.revenue ?? 0}
										formatValue={(value) =>
											formatMoney(value, currency, true)
										}
										formatAxis={money}
										caption={{
											title: __(
												'Course revenue per day',
												'moowoodle'
											),
											column: __('Revenue', 'moowoodle'),
										}}
										emptyText={__(
											'No course revenue in this period yet. Sales of course products show up here.',
											'moowoodle'
										)}
									/>
								) : (
									<DailyTrend
										daily={data.daily}
										valueOf={(day) => day.count}
										formatValue={(value) =>
											sprintf(
												/* translators: %s: number of enrollments. */
												_n(
													'%s enrollment',
													'%s enrollments',
													value,
													'moowoodle'
												),
												numberFormat.format(value)
											)
										}
										formatAxis={(value) =>
											numberFormat.format(value)
										}
										caption={{
											title: __(
												'New enrollments per day',
												'moowoodle'
											),
											column: __(
												'Enrollments',
												'moowoodle'
											),
										}}
										emptyText={__(
											'No new enrollments in this period yet. Each purchase of a course product shows up here.',
											'moowoodle'
										)}
									/>
								)}
							</div>
						</CardComponent>

						<CardComponent
							title={__('Top courses', 'moowoodle')}
							desc={sprintf(
								/* translators: %s: number of days. */
								__(
									'By new enrollments, last %s days',
									'moowoodle'
								),
								periodDays
							)}
							action={
								<a
									className="mw-insights-more"
									href={TAB.courses}
								>
									{__('All courses', 'moowoodle')}
									<i
										className="adminfont-arrow-right"
										aria-hidden="true"
									/>
								</a>
							}
						>
							{data.top_courses.length > 0 ? (
								<table className="mw-insights-table">
									<thead>
										<tr>
											<th scope="col">
												{__('Course', 'moowoodle')}
											</th>
											<th scope="col">
												{__(
													'New enrollments',
													'moowoodle'
												)}
											</th>
											<th
												scope="col"
												className="is-number"
											>
												{__('Revenue', 'moowoodle')}
											</th>
											<th scope="col">
												<span className="screen-reader-text">
													{__('Product', 'moowoodle')}
												</span>
											</th>
										</tr>
									</thead>
									<tbody>
										{data.top_courses.map((course) => (
											<tr key={course.course_id}>
												<td className="mw-insights-table-title">
													{course.name ||
														__(
															'Deleted course',
															'moowoodle'
														)}
												</td>
												<td>
													<span className="mw-insights-meter">
														<span
															className="mw-insights-meter-bar"
															aria-hidden="true"
														>
															<span
																style={{
																	width: `${(course.enrollments / topMax) * 100}%`,
																}}
															/>
														</span>
														{numberFormat.format(
															course.enrollments
														)}
													</span>
												</td>
												<td className="is-number">
													{money(course.revenue ?? 0)}
												</td>
												<td className="mw-insights-table-action">
													{course.product_url && (
														<a
															href={
																course.product_url
															}
														>
															{__(
																'Edit product',
																'moowoodle'
															)}
														</a>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							) : (
								<p className="mw-insights-empty">
									{__(
										'Courses with new enrollments in this period are ranked here.',
										'moowoodle'
									)}
								</p>
							)}
						</CardComponent>
					</div>
				</ColumnComponent>

				<ColumnComponent grid={4}>
					<div className="mw-insights-stack">
						{team}
						{setupCard}
						<CardComponent
							title={__('Moodle™ connection', 'moowoodle')}
							desc={
								isConnected
									? connection.site_name
									: __('Not connected', 'moowoodle')
							}
						>
							<dl className="mw-insights-pulse">
								<div>
									<dt>{__('Status', 'moowoodle')}</dt>
									<dd>
										<span
											className={`mw-insights-dot ${isConnected ? 'is-good' : 'is-off'}`}
											aria-hidden="true"
										/>
										{isConnected
											? __('Connected', 'moowoodle')
											: __('Not connected', 'moowoodle')}
									</dd>
								</div>
								<div>
									<dt>{__('Courses synced', 'moowoodle')}</dt>
									<dd>
										{numberFormat.format(courses.total)}
									</dd>
								</div>
								<div>
									<dt>{__('Categories', 'moowoodle')}</dt>
									<dd>
										{numberFormat.format(
											courses.categories
										)}
									</dd>
								</div>
								<div>
									<dt>{__('Course sync', 'moowoodle')}</dt>
									<dd>
										{connection.sync_running ? (
											<a href={TAB.syncCourses}>
												{__('Running', 'moowoodle')}
											</a>
										) : (
											__('Idle', 'moowoodle')
										)}
									</dd>
								</div>
							</dl>
						</CardComponent>

						<CardComponent
							title={__('Latest enrollments', 'moowoodle')}
							desc={__('Most recent first', 'moowoodle')}
							action={
								data.recent.length > 0 &&
								appLocalizer.khali_dabba ? (
									<a
										className="mw-insights-more"
										href={TAB.enrollments}
									>
										{__('View all', 'moowoodle')}
										<i
											className="adminfont-arrow-right"
											aria-hidden="true"
										/>
									</a>
								) : undefined
							}
						>
							{data.recent.length > 0 ? (
								<ul className="mw-insights-recent">
									{data.recent.map((enrollment, index) => (
										<li key={`${enrollment.date}-${index}`}>
											<span
												className="mw-insights-avatar"
												aria-hidden="true"
											>
												{(enrollment.student || '?')
													.charAt(0)
													.toUpperCase()}
											</span>
											<span className="mw-insights-recent-text">
												<strong>
													{enrollment.student}
												</strong>
												<span>
													{enrollment.course ||
														__(
															'Deleted course',
															'moowoodle'
														)}
												</span>
											</span>
											<span className="mw-insights-recent-meta">
												<span
													className={`mw-insights-status-tag is-${enrollment.status}`}
												>
													{STATUS_LABEL[
														enrollment.status
													] ?? enrollment.status}
												</span>
												<time
													dateTime={enrollment.date}
												>
													{formatAgo(enrollment.date)}
												</time>
											</span>
										</li>
									))}
								</ul>
							) : (
								<p className="mw-insights-empty">
									{nextStep
										? sprintf(
												/* translators: %s: name of the next setup step. */
												__(
													'No enrollments yet. Next step: %s.',
													'moowoodle'
												),
												nextStep.title
											)
										: __(
												'No enrollments yet.',
												'moowoodle'
											)}
								</p>
							)}
						</CardComponent>
					</div>
				</ColumnComponent>
			</ContainerComponent>

			<SupportRows pro={pro} learn={learn} help={help} />
		</div>
	);
};

export default Insights;
