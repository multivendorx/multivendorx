/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { __, _n, sprintf } from '@wordpress/i18n';
import { getApiLink } from '@zyra/core';
import './insights.scss';

/** GET moowoodle/v1/dashboard (classes/RestAPI/Controllers/Dashboard.php). */
interface DashboardData {
	period_days: number;
	idle_days: number;
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
	};
	daily: Array<{ date: string; count: number }>;
	top_courses: Array<{
		course_id: number;
		name: string;
		enrollments: number;
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

/** The four steps from a fresh install to the first enrollment. */
const buildSetupSteps = (data: DashboardData) => [
	{
		id: 'connect',
		done: data.connection.configured && '' !== data.connection.site_name,
		title: __('Connect Moodle™', 'moowoodle'),
		detail: __(
			'Save your Moodle™ site URL and access token, then run the connection test.',
			'moowoodle'
		),
		cta: __('Connect', 'moowoodle'),
		link: TAB.connection,
	},
	{
		id: 'sync',
		done: data.courses.total > 0,
		title: __('Sync your courses', 'moowoodle'),
		detail: __('Bring your Moodle™ courses into WordPress.', 'moowoodle'),
		cta: __('Sync courses', 'moowoodle'),
		link: TAB.syncCourses,
	},
	{
		id: 'sell',
		done: data.courses.with_product > 0,
		title: __('Put a course on sale', 'moowoodle'),
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
		detail: __(
			'When someone buys a course, MooWoodle enrolls them in Moodle™ and it shows here.',
			'moowoodle'
		),
		cta: __('View courses', 'moowoodle'),
		link: TAB.courses,
	},
];

/** A change badge: arrow, percentage and "vs previous 30 days". `higherIsBetter` picks which way is good. */
const Change = ({
	period,
	higherIsBetter,
	periodDays,
}: {
	period: PeriodCount;
	higherIsBetter: boolean;
	periodDays: number;
}) => {
	const change = percentChange(period);

	if (null === change) {
		return (
			<span className="mw-insights-change is-neutral">
				{period.current > 0
					? __('New this period', 'moowoodle')
					: sprintf(
							/* translators: %s: number of days. */
							__('None in the previous %s days', 'moowoodle'),
							periodDays
						)}
			</span>
		);
	}

	const isGood = 0 === change ? null : change > 0 === higherIsBetter;
	const tone = null === isGood ? 'is-neutral' : isGood ? 'is-good' : 'is-bad';
	const arrow = change > 0 ? '↑' : change < 0 ? '↓' : '→';

	return (
		<span className={`mw-insights-change ${tone}`}>
			<span aria-hidden="true">{arrow}</span>
			{sprintf(
				/* translators: 1: percentage change, 2: number of days. */
				__('%1$s%% vs previous %2$s days', 'moowoodle'),
				Math.abs(change),
				periodDays
			)}
		</span>
	);
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

/** Daily new enrollments: one series, thin bars, hover tooltip, and the same figures as a table for screen readers. */
const EnrollmentTrend = ({
	daily,
	total,
}: {
	daily: DashboardData['daily'];
	total: number;
}) => {
	const [hovered, setHovered] = useState<number | null>(null);
	const max = niceMax(Math.max(0, ...daily.map((day) => day.count)));
	const hoveredDay = null === hovered ? null : daily[hovered];

	if (0 === total) {
		return (
			<div className="mw-insights-chart-empty">
				<i className="adminfont-bar-chart" aria-hidden="true" />
				<p>
					{__(
						'No new enrollments in this period yet. Each purchase of a course product shows up here.',
						'moowoodle'
					)}
				</p>
			</div>
		);
	}

	return (
		<div className="mw-insights-chart">
			<div className="mw-insights-chart-plot" aria-hidden="true">
				<div className="mw-insights-chart-grid">
					<span data-value={numberFormat.format(max)} />
					<span data-value={numberFormat.format(max / 2)} />
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
									height: `${(day.count / max) * 100}%`,
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
						<strong>
							{sprintf(
								/* translators: %s: number of enrollments. */
								_n(
									'%s enrollment',
									'%s enrollments',
									hoveredDay.count,
									'moowoodle'
								),
								numberFormat.format(hoveredDay.count)
							)}
						</strong>
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
				<caption>{__('New enrollments per day', 'moowoodle')}</caption>
				<thead>
					<tr>
						<th scope="col">{__('Date', 'moowoodle')}</th>
						<th scope="col">{__('Enrollments', 'moowoodle')}</th>
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
							<td>{day.count}</td>
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

/**
 * The data-driven top of the dashboard: setup checklist until the first enrollment, then what needs attention, the
 * period's key figures, the enrollment trend, top courses and the latest enrollments. One request, to
 * moowoodle/v1/dashboard.
 */
const Insights: React.FC = () => {
	const [data, setData] = useState<DashboardData | null>(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		axios
			.get(getApiLink(appLocalizer, 'dashboard'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((response) => setData(response.data))
			.catch(() => setFailed(true));
	}, []);

	if (failed) {
		return (
			<div className="mw-insights-panel mw-insights-failed" role="alert">
				<i className="adminfont-error" aria-hidden="true" />
				{__(
					'The dashboard figures could not be loaded. Reload the page, or check Settings → System & Logs.',
					'moowoodle'
				)}
			</div>
		);
	}

	if (!data) {
		return (
			<div
				className="mw-insights is-loading"
				aria-busy="true"
				aria-label={__('Loading dashboard', 'moowoodle')}
			>
				<div className="mw-insights-kpis">
					{[0, 1, 2, 3].map((placeholder) => (
						<div
							key={placeholder}
							className="mw-insights-kpi mw-insights-skeleton"
						/>
					))}
				</div>
				<div className="mw-insights-panel mw-insights-skeleton is-tall" />
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
	// A brand-new site has no figures to show: the checklist is the whole dashboard until something is synced or sold.
	const hasData = courses.total > 0 || enrollments.total > 0;
	// Same test as the checklist's first step: URL and token saved, and the connection test has passed.
	const isConnected = connection.configured && '' !== connection.site_name;
	const topMax = Math.max(
		1,
		...data.top_courses.map((course) => course.enrollments)
	);

	return (
		<div className="mw-insights">
			{!isConnected && (
				<section className="mw-insights-alert" role="status">
					<span className="mw-insights-alert-icon" aria-hidden="true">
						<i className="adminfont-centralized-connections" />
					</span>
					<div className="mw-insights-alert-body">
						<h2>
							{connection.configured
								? __(
										'Run the Moodle™ connection test',
										'moowoodle'
									)
								: __(
										'Connect your Moodle™ site',
										'moowoodle'
									)}
						</h2>
						<p>
							{connection.configured
								? __(
										'Your site URL and token are saved, but the connection hasn’t passed a test. Run it to confirm courses will sync and buyers get enrolled.',
										'moowoodle'
									)
								: __(
										'Add your Moodle™ site URL and a web service token. Until then, courses can’t sync and students who buy a course aren’t enrolled in Moodle™.',
										'moowoodle'
									)}
						</p>
					</div>
					<div className="mw-insights-alert-actions">
						<a className="mw-insights-button" href={TAB.connection}>
							{connection.configured
								? __('Test connection', 'moowoodle')
								: __('Connect Moodle™', 'moowoodle')}
						</a>
						<a
							className="mw-insights-link"
							href="https://moowoodle.com/docs/knowledgebase/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=moowoodle"
							target="_blank"
							rel="noopener noreferrer"
						>
							{__('Setup guide', 'moowoodle')}
							<i
								className="adminfont-external"
								aria-hidden="true"
							/>
							<span className="screen-reader-text">
								{__('(opens in a new tab)', 'moowoodle')}
							</span>
						</a>
					</div>
				</section>
			)}

			{(isConnected || hasData) && (
				<div className="mw-insights-status">
					{isConnected ? (
						<span className="mw-insights-pill is-good">
							<i className="adminfont-check" aria-hidden="true" />
							{sprintf(
								/* translators: %s: Moodle site name. */
								__('Connected to %s', 'moowoodle'),
								connection.site_name
							)}
						</span>
					) : (
						<span />
					)}
					{hasData && (
						<span className="mw-insights-period">
							{sprintf(
								/* translators: %s: number of days. */
								__('Last %s days', 'moowoodle'),
								periodDays
							)}
						</span>
					)}
				</div>
			)}

			{!setupComplete && (
				<section className="mw-insights-panel mw-insights-setup">
					<div className="mw-insights-setup-head">
						<div>
							<h2>
								{__('Finish setting up MooWoodle', 'moowoodle')}
							</h2>
							<p>
								{sprintf(
									/* translators: 1: steps done, 2: total steps. */
									__('%1$s of %2$s steps done', 'moowoodle'),
									doneSteps,
									steps.length
								)}
							</p>
						</div>
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
					</div>
					<ol className="mw-insights-steps">
						{steps.map((step, index) => (
							<li
								key={step.id}
								className={`${step.done ? 'is-done' : ''}${step === nextStep ? ' is-next' : ''}`}
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
								<span className="mw-insights-step-text">
									<strong>
										{step.title}
										{step.done && (
											<span className="screen-reader-text">
												{` ${__('(done)', 'moowoodle')}`}
											</span>
										)}
									</strong>
									<span>{step.detail}</span>
								</span>
								{/* The connection alert above carries the Connect button; don't repeat it here. */}
								{step === nextStep &&
									('connect' !== step.id || isConnected) && (
										<a
											className="mw-insights-button"
											href={step.link}
										>
											{step.cta}
										</a>
									)}
							</li>
						))}
					</ol>
				</section>
			)}

			{(setupComplete || insights.length > 0) && (
				<section className="mw-insights-panel mw-insights-attention">
					<div className="mw-insights-panel-head">
						<h2>{__('Needs your attention', 'moowoodle')}</h2>
						{insights.length > 0 && (
							<span className="mw-insights-count">
								{insights.length}
							</span>
						)}
					</div>
					{insights.length > 0 ? (
						<ul className="mw-insights-list">
							{insights.map((insight) => (
								<li
									key={insight.id}
									className={`is-${insight.severity}`}
								>
									<span className="mw-insights-severity">
										<i
											className={`adminfont-${SEVERITY_ICON[insight.severity]}`}
											aria-hidden="true"
										/>
										{SEVERITY_LABEL[insight.severity]}
									</span>
									<span className="mw-insights-list-text">
										<strong>{insight.title}</strong>
										<span>{insight.detail}</span>
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
					) : (
						<div className="mw-insights-clear">
							<i className="adminfont-check" aria-hidden="true" />
							<strong>{__('All clear', 'moowoodle')}</strong>
							<span>
								{__(
									'Your courses are connected, on sale and enrolling students.',
									'moowoodle'
								)}
							</span>
						</div>
					)}
				</section>
			)}

			{hasData && (
				<>
					<div className="mw-insights-kpis">
						<div className="mw-insights-kpi">
							<span className="mw-insights-kpi-label">
								<i
									className="adminfont-classroom-enrollment"
									aria-hidden="true"
								/>
								{__('New enrollments', 'moowoodle')}
							</span>
							<strong>
								{numberFormat.format(enrollments.new.current)}
							</strong>
							<Change
								period={enrollments.new}
								higherIsBetter
								periodDays={periodDays}
							/>
						</div>
						<div className="mw-insights-kpi">
							<span className="mw-insights-kpi-label">
								<i
									className="adminfont-person"
									aria-hidden="true"
								/>
								{__('Active students', 'moowoodle')}
							</span>
							<strong>
								{numberFormat.format(
									enrollments.by_status.enrolled ?? 0
								)}
							</strong>
							<span className="mw-insights-change is-neutral">
								{sprintf(
									/* translators: %s: number of enrollments. */
									__('%s enrollments in total', 'moowoodle'),
									numberFormat.format(enrollments.total)
								)}
							</span>
						</div>
						<div className="mw-insights-kpi">
							<span className="mw-insights-kpi-label">
								<i
									className="adminfont-subscription-courses"
									aria-hidden="true"
								/>
								{__('Courses on sale', 'moowoodle')}
							</span>
							<strong>
								{numberFormat.format(courses.with_product)}
								<small>
									{sprintf(
										/* translators: %s: number of synced courses. */
										__('of %s', 'moowoodle'),
										numberFormat.format(courses.total)
									)}
								</small>
							</strong>
							{courses.without_product > 0 ? (
								<a
									className="mw-insights-change is-link"
									href={TAB.courses}
								>
									{sprintf(
										/* translators: %s: number of courses. */
										_n(
											'%s without a product',
											'%s without a product',
											courses.without_product,
											'moowoodle'
										),
										numberFormat.format(
											courses.without_product
										)
									)}
									<i
										className="adminfont-arrow-right"
										aria-hidden="true"
									/>
								</a>
							) : (
								<span className="mw-insights-change is-neutral">
									{courses.total > 0
										? __(
												'Every synced course is for sale',
												'moowoodle'
											)
										: __(
												'No courses synced yet',
												'moowoodle'
											)}
								</span>
							)}
						</div>
						<div className="mw-insights-kpi">
							<span className="mw-insights-kpi-label">
								<i
									className="adminfont-sign-out"
									aria-hidden="true"
								/>
								{__('Unenrollments', 'moowoodle')}
							</span>
							<strong>
								{numberFormat.format(
									enrollments.unenrolled.current
								)}
							</strong>
							<Change
								period={enrollments.unenrolled}
								higherIsBetter={false}
								periodDays={periodDays}
							/>
						</div>
					</div>

					<section className="mw-insights-panel">
						<div className="mw-insights-panel-head">
							<h2>
								{__('New enrollments per day', 'moowoodle')}
							</h2>
							<span>
								{sprintf(
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
								)}
							</span>
						</div>
						<EnrollmentTrend
							daily={data.daily}
							total={data.daily.reduce(
								(sum, day) => sum + day.count,
								0
							)}
						/>
					</section>

					<div className="mw-insights-row">
						<section className="mw-insights-panel">
							<div className="mw-insights-panel-head">
								<h2>{__('Top courses', 'moowoodle')}</h2>
								<span>
									{sprintf(
										/* translators: %s: number of days. */
										__(
											'By new enrollments, last %s days',
											'moowoodle'
										),
										periodDays
									)}
								</span>
							</div>
							{data.top_courses.length > 0 ? (
								<ol className="mw-insights-ranking">
									{data.top_courses.map((course) => (
										<li key={course.course_id}>
											<span className="mw-insights-ranking-name">
												{course.name ||
													__(
														'Deleted course',
														'moowoodle'
													)}
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
											</span>
											<span
												className="mw-insights-ranking-bar"
												aria-hidden="true"
											>
												<span
													style={{
														width: `${(course.enrollments / topMax) * 100}%`,
													}}
												/>
											</span>
											<span className="mw-insights-ranking-value">
												{numberFormat.format(
													course.enrollments
												)}
											</span>
										</li>
									))}
								</ol>
							) : (
								<p className="mw-insights-empty">
									{__(
										'Courses with new enrollments in this period are ranked here.',
										'moowoodle'
									)}
								</p>
							)}
						</section>

						<section className="mw-insights-panel">
							<div className="mw-insights-panel-head">
								<h2>{__('Latest enrollments', 'moowoodle')}</h2>
								{data.recent.length > 0 &&
									appLocalizer.khali_dabba && (
										<a href={TAB.enrollments}>
											{__('View all', 'moowoodle')}
										</a>
									)}
							</div>
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
						</section>
					</div>
				</>
			)}
		</div>
	);
};

export default Insights;
