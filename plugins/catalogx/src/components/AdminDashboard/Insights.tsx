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

/** GET catalogx/v1/dashboard (classes/RestAPI/Controllers/Dashboard.php). */
interface DashboardData {
	period_days: number;
	/** The periods the range switch offers, e.g. [7, 30, 90]. */
	period_choices?: number[];
	/** The store's currency code, for quote values. */
	currency?: string;
	is_pro?: boolean;
	features: {
		/** Ids of the modules that are on (catalog, enquiry, quote, wholesale, rules…). */
		modules: string[];
		/** Whether the request-a-quote page exists and is published. */
		quote_page: boolean;
	};
	enquiries: {
		total: number;
		new: PeriodCount;
		/** Enquiries no one has replied to in the inbox (CatalogX Pro only; null without it). */
		unanswered: number | null;
	};
	quotes: {
		/** Whether the Quote module is on; every other quote figure is 0 when it is off. */
		enabled: boolean;
		total: number;
		by_status: Record<string, number>;
		new: PeriodCount;
		/** Order totals of the quote requests made in each period. */
		value: PeriodCount;
		/** This period's quote requests that have been accepted. */
		accepted: number;
	};
	daily: Array<{ date: string; enquiries: number; quotes: number }>;
	top_products: Array<{
		product_id: number;
		name: string;
		enquiries: number;
		quotes: number;
		edit_url: string;
	}>;
	recent: Array<{
		type: 'enquiry' | 'quote';
		customer: string;
		item: string;
		status: string;
		date: string;
	}>;
	links: { quotes: string };
	/** Added by CatalogX Pro (`catalogx_dashboard_data`) while its Wholesale module is on. */
	wholesale?: { pending: number };
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
	modules: '#&tab=settings&subtab=modules',
	engagement: '#&tab=settings&subtab=customer-engagement',
	pages: '#&tab=settings&subtab=pages-shortcodes',
	enquiries: '#&tab=enquiry-messages',
	quoteRequests: '#&tab=quote-requests',
	wholesale: '#&tab=wholesale-users',
};

const SEVERITY_LABEL: Record<Severity, string> = {
	critical: __('Critical', 'catalogx'),
	warning: __('Warning', 'catalogx'),
	info: __('Info', 'catalogx'),
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

const STATUS_LABEL: Record<string, string> = {
	enquiry: __('Enquiry', 'catalogx'),
	'quote-new': __('New quote', 'catalogx'),
	'quote-pending': __('Quote sent', 'catalogx'),
	'quote-accepted': __('Accepted', 'catalogx'),
	'quote-rejected': __('Rejected', 'catalogx'),
	'quote-expired': __('Expired', 'catalogx'),
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

	return __('just now', 'catalogx');
};

/** Where a quote request is handled: CatalogX Pro's Quotation Requests screen, or WooCommerce's orders screen. */
const quotesLink = (data: DashboardData): string =>
	appLocalizer.khali_dabba ? TAB.quoteRequests : data.links.quotes;

/**
 * Turns the dashboard numbers into what needs doing, most urgent first. Switching a module on and the first request
 * aren't listed: the setup checklist covers them.
 */
const buildInsights = (data: DashboardData): Insight[] => {
	const { enquiries, quotes, features, period_days: periodDays } = data;
	const insights: Insight[] = [];
	const waiting = quotes.by_status['quote-new'] ?? 0;
	const sent = quotes.by_status['quote-pending'] ?? 0;
	const pendingWholesale = data.wholesale?.pending ?? 0;

	if (quotes.enabled && !features.quote_page) {
		insights.push({
			id: 'quote-page',
			severity: 'critical',
			title: __('The request-a-quote page is missing', 'catalogx'),
			detail: __(
				'Customers who add products to a quote have nowhere to send it. Choose or create the page under Pages & Shortcodes.',
				'catalogx'
			),
			cta: __('Choose the page', 'catalogx'),
			link: TAB.pages,
		});
	}

	if (waiting > 0) {
		insights.push({
			id: 'quotes-waiting',
			severity: 'critical',
			title: sprintf(
				/* translators: %s: number of quote requests. */
				_n(
					'%s quote request is waiting for your price',
					'%s quote requests are waiting for your price',
					waiting,
					'catalogx'
				),
				numberFormat.format(waiting)
			),
			detail: __(
				'The customer asked for a price and hasn’t heard back. Send a quote while they are still deciding.',
				'catalogx'
			),
			cta: __('Review quotes', 'catalogx'),
			link: quotesLink(data),
		});
	}

	if (null !== enquiries.unanswered && enquiries.unanswered > 0) {
		insights.push({
			id: 'enquiries-unanswered',
			severity: 'warning',
			title: sprintf(
				/* translators: %s: number of enquiries. */
				_n(
					'%s enquiry has no reply yet',
					'%s enquiries have no reply yet',
					enquiries.unanswered,
					'catalogx'
				),
				numberFormat.format(enquiries.unanswered)
			),
			detail: __(
				'No one has answered them in the enquiry inbox. A quick reply is often what turns a question into an order.',
				'catalogx'
			),
			cta: __('Open the inbox', 'catalogx'),
			link: TAB.enquiries,
		});
	}

	if (pendingWholesale > 0) {
		insights.push({
			id: 'wholesale-pending',
			severity: 'warning',
			title: sprintf(
				/* translators: %s: number of applications. */
				_n(
					'%s wholesale application is waiting for approval',
					'%s wholesale applications are waiting for approval',
					pendingWholesale,
					'catalogx'
				),
				numberFormat.format(pendingWholesale)
			),
			detail: __(
				'Until you approve them, these buyers see retail prices.',
				'catalogx'
			),
			cta: __('Review applications', 'catalogx'),
			link: TAB.wholesale,
		});
	}

	const enquiryChange = percentChange(enquiries.new);

	if (
		null !== enquiryChange &&
		enquiryChange <= -25 &&
		enquiries.new.previous >= 5
	) {
		insights.push({
			id: 'enquiries-down',
			severity: 'warning',
			title: sprintf(
				/* translators: 1: percentage drop, 2: number of days. */
				__(
					'New enquiries are down %1$s%% on the previous %2$s days',
					'catalogx'
				),
				Math.abs(enquiryChange),
				periodDays
			),
			detail: sprintf(
				/* translators: 1: enquiries this period, 2: enquiries in the previous period. */
				__(
					'%1$s this period against %2$s before it. Check that the enquiry button still shows where customers expect it.',
					'catalogx'
				),
				numberFormat.format(enquiries.new.current),
				numberFormat.format(enquiries.new.previous)
			),
			cta: __('Review button settings', 'catalogx'),
			link: TAB.engagement,
		});
	}

	if (sent > 0) {
		insights.push({
			id: 'quotes-sent',
			severity: 'info',
			title: sprintf(
				/* translators: %s: number of quotes. */
				_n(
					'%s quote is waiting on the customer',
					'%s quotes are waiting on the customer',
					sent,
					'catalogx'
				),
				numberFormat.format(sent)
			),
			detail: __(
				'You sent a price and they haven’t accepted or declined it. A short follow-up can close the sale.',
				'catalogx'
			),
			cta: __('See quotes', 'catalogx'),
			link: quotesLink(data),
		});
	}

	return insights.sort(
		(a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
	);
};

/**
 * The steps from a fresh install to the first request: switch on enquiries or quotes, give quotes a page (only while
 * quotes are on), and receive the first request. If a step comes undone later (a module switched off, the page
 * deleted), it is the step to do again.
 */
const buildSetupSteps = (data: DashboardData) => {
	const modules = data.features.modules;
	const requests = data.enquiries.total + data.quotes.total;

	return [
		{
			id: 'modules',
			done: modules.includes('enquiry') || modules.includes('quote'),
			title: __('Switch on enquiries or quotes', 'catalogx'),
			doneTitle: __('Enquiries or quotes switched on', 'catalogx'),
			detail: __(
				'Turn on the Enquiry module, the Quotation module, or both. Their buttons show on your product pages once they are on.',
				'catalogx'
			),
			cta: __('Open modules', 'catalogx'),
			link: TAB.modules,
		},
		...(data.quotes.enabled
			? [
					{
						id: 'quote-page',
						done: data.features.quote_page,
						title: __('Set the request-a-quote page', 'catalogx'),
						doneTitle: __('Request-a-quote page ready', 'catalogx'),
						detail: __(
							'Customers review and send their quote on this page. Pick an existing page or let CatalogX create one.',
							'catalogx'
						),
						cta: __('Choose the page', 'catalogx'),
						link: TAB.pages,
					},
				]
			: []),
		{
			id: 'first-request',
			done: requests > 0,
			title: __('Get your first request', 'catalogx'),
			doneTitle: __('First request received', 'catalogx'),
			detail: __(
				'Decide who sees the buttons and where. When a customer sends an enquiry or asks for a quote, it shows here.',
				'catalogx'
			),
			cta: __('Review button settings', 'catalogx'),
			link: TAB.engagement,
		},
	];
};

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
			? { text: __('New', 'catalogx'), color: 'gray' }
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
 * One daily series (new enquiries or quote requests): thin bars, a hover tooltip, and the same figures as a table for
 * screen readers.
 */
const DailyTrend = ({
	daily,
	valueOf,
	formatValue,
	caption,
	emptyText,
}: {
	daily: DashboardData['daily'];
	valueOf: (day: DashboardData['daily'][number]) => number;
	/** The tooltip's and table's figure ("3 enquiries"). */
	formatValue: (value: number) => string;
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
			<div className="cx-insights-chart-empty">
				<i className="adminfont-bar-chart" aria-hidden="true" />
				<p>{emptyText}</p>
			</div>
		);
	}

	return (
		<div className="cx-insights-chart">
			<div className="cx-insights-chart-plot" aria-hidden="true">
				<div className="cx-insights-chart-grid">
					<span data-value={numberFormat.format(max)} />
					<span data-value={numberFormat.format(max / 2)} />
					<span data-value="0" />
				</div>
				<div
					className="cx-insights-chart-bars"
					onMouseLeave={() => setHovered(null)}
				>
					{daily.map((day, index) => (
						<div
							key={day.date}
							className={`cx-insights-chart-slot${hovered === index ? ' is-hovered' : ''}`}
							onMouseEnter={() => setHovered(index)}
						>
							<span
								className="cx-insights-chart-bar"
								style={{
									height: `${(valueOf(day) / max) * 100}%`,
								}}
							/>
						</div>
					))}
				</div>
				{hoveredDay && null !== hovered && (
					<div
						className="cx-insights-chart-tooltip"
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
			<div className="cx-insights-chart-axis" aria-hidden="true">
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
				<span>{__('Today', 'catalogx')}</span>
			</div>
			{/* The class is on a div: a table ignores the 1px height it sets and would stretch the page. */}
			<div className="screen-reader-text">
				<table>
					<caption>{caption.title}</caption>
					<thead>
						<tr>
							<th scope="col">{__('Date', 'catalogx')}</th>
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

interface InsightsProps {
	/** The "Do more with CatalogX Pro" card; null with Pro active. */
	pro: React.ReactNode;
	/** Learn CatalogX: docs, the setup wizard, the community. */
	learn: React.ReactNode;
	/** Help & Support: troubleshooting and the ways to reach the team. */
	help: React.ReactNode;
	/** More from the CatalogX team. */
	team: React.ReactNode;
}

/**
 * The cards under the setup row or the figures: Learn CatalogX beside Help & Support, then Pro. (The team's plugins
 * sit at the top right instead: beside the setup card, or at the head of the figures' side column.)
 */
const SupportRows = ({ pro, learn, help }: Omit<InsightsProps, 'team'>) => (
	<>
		<ContainerComponent className="cx-insights-grid is-equal">
			<ColumnComponent grid={4}>{learn}</ColumnComponent>
			<ColumnComponent grid={8}>{help}</ColumnComponent>
		</ContainerComponent>
		{pro}
	</>
);

/**
 * The whole Overview tab. Until the first enquiry or quote request it is a setup page: the setup card beside the
 * team's plugins, then Learn CatalogX beside Help & Support, then Pro. After it, the period's figures lead: tiles, what
 * needs attention, the daily trend and the most requested products, with a side column of the team's plugins, the
 * setup card (if a step comes undone), what is switched on and the latest requests; Learn, Help & Support and Pro
 * follow. One request, to catalogx/v1/dashboard.
 */
const Insights: React.FC<InsightsProps> = ({ pro, learn, help, team }) => {
	const [data, setData] = useState<DashboardData | null>(null);
	const [failed, setFailed] = useState(false);
	// The reporting period, from the range switch. Changing it keeps the figures on screen (dimmed) until the new
	// ones arrive, so the layout doesn't jump.
	const [days, setDays] = useState(30);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [chartMetric, setChartMetric] = useState<'enquiries' | 'quotes'>(
		'enquiries'
	);
	const [showAllInsights, setShowAllInsights] = useState(false);

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
				.getElementById('catalogx-help-support')
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
			<div className="cx-insights">
				<div className="cx-insights-failed" role="alert">
					<i className="adminfont-error" aria-hidden="true" />
					{__(
						'The dashboard figures could not be loaded. Reload the page, or check Settings → System.',
						'catalogx'
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
				className="cx-insights"
				aria-busy="true"
				aria-label={__('Loading dashboard', 'catalogx')}
			>
				<ContainerComponent className="cx-insights-grid">
					<ColumnComponent grid={6} className="cx-col-60">
						<CardComponent isLoading />
					</ColumnComponent>
					<ColumnComponent grid={6} className="cx-col-40">
						{team}
					</ColumnComponent>
				</ContainerComponent>
			</div>
		);
	}

	const { enquiries, quotes, features } = data;
	const periodDays = data.period_days;
	const steps = buildSetupSteps(data);
	const doneSteps = steps.filter((step) => step.done).length;
	const setupComplete = doneSteps === steps.length;
	const nextStep = steps.find((step) => !step.done);
	const insights = buildInsights(data);
	// The figures start with the first request. Before it, every tile and chart would be zero, and the setup card
	// already says what to do next, so it is the whole dashboard.
	const hasData = enquiries.total + quotes.total > 0;
	const isPro = !!appLocalizer.khali_dabba;
	const topMax = Math.max(
		1,
		...data.top_products.map((product) => product.enquiries + product.quotes)
	);
	const daysBefore = (value: string) =>
		sprintf(
			/* translators: 1: a number or amount, 2: number of days. */
			__('%1$s the %2$s days before', 'catalogx'),
			value,
			periodDays
		);
	const sparklineOf = (key: 'enquiries' | 'quotes') =>
		data.daily.some((day) => day[key] > 0)
			? data.daily.map((day) => ({ value: day[key] }))
			: undefined;
	const currency = data.currency ?? 'USD';
	const money = (amount: number) => formatMoney(amount, currency);
	const quotesOff = __('Quotation module is off', 'catalogx');
	const acceptedShare =
		quotes.new.current > 0
			? Math.round((quotes.accepted / quotes.new.current) * 100)
			: null;
	const periodChoices = data.period_choices ?? [7, 30, 90];
	// The most urgent few, so the list reads as priorities; the rest behind "Show all".
	const visibleInsights = showAllInsights
		? insights
		: insights.slice(0, INSIGHTS_SHOWN);
	const metric = quotes.enabled ? chartMetric : 'enquiries';
	const isOn = (module: string) => features.modules.includes(module);

	const setupCard = setupComplete ? null : (
		<CardComponent
			title={__('Get CatalogX ready', 'catalogx')}
			desc={sprintf(
				/* translators: 1: steps done, 2: total steps. */
				__(
					'%1$s of %2$s steps done. Each one unlocks the next.',
					'catalogx'
				),
				doneSteps,
				steps.length
			)}
			className="cx-insights-setup"
			action={
				<div
					className="cx-insights-progress"
					role="progressbar"
					aria-valuemin={0}
					aria-valuemax={steps.length}
					aria-valuenow={doneSteps}
					aria-label={__('Setup progress', 'catalogx')}
				>
					<span
						style={{
							width: `${(doneSteps / steps.length) * 100}%`,
						}}
					/>
				</div>
			}
		>
			<ol className="cx-insights-steps">
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
								className="cx-insights-step-marker"
								aria-hidden="true"
							>
								{step.done ? (
									<i className="adminfont-check" />
								) : (
									index + 1
								)}
							</span>
							<div className="cx-insights-step-body">
								<strong>
									{step.done ? step.doneTitle : step.title}
									{step.done && (
										<span className="screen-reader-text">
											{` ${__('(done)', 'catalogx')}`}
										</span>
									)}
								</strong>
								{/* Only the step to do now explains itself; the rest stay one quiet line. */}
								{step === nextStep && (
									<>
										<p>{step.detail}</p>
										<div className="cx-insights-step-actions">
											<a
												className="admin-btn btn-purple-bg"
												href={step.link}
											>
												{step.cta}
											</a>
											<a
												className="cx-insights-more"
												href={DOCS_URL}
												target="_blank"
												rel="noopener noreferrer"
											>
												{__('Read the guide', 'catalogx')}
												<i
													className="adminfont-external"
													aria-hidden="true"
												/>
												<span className="screen-reader-text">
													{__(
														'(opens in a new tab)',
														'catalogx'
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
			<div className="cx-insights">
				<ContainerComponent className="cx-insights-grid is-equal">
					<ColumnComponent grid={6} className="cx-col-60">
						{setupCard}
					</ColumnComponent>
					<ColumnComponent grid={6} className="cx-col-40">
						{team}
					</ColumnComponent>
				</ContainerComponent>
				<SupportRows pro={pro} learn={learn} help={help} />
			</div>
		);
	}

	const featureRows: Array<[string, boolean]> = [
		[__('Catalog mode', 'catalogx'), isOn('catalog')],
		[__('Enquiries', 'catalogx'), isOn('enquiry')],
		[__('Quotations', 'catalogx'), isOn('quote')],
		...(isPro
			? ([
					[__('Wholesale', 'catalogx'), isOn('wholesale')],
					[__('Pricing rules', 'catalogx'), isOn('rules')],
				] as Array<[string, boolean]>)
			: []),
	];

	return (
		<div className="cx-insights">
			<div className="cx-insights-toolbar">
				<p>
					<span>
						{sprintf(
							/* translators: %1$s: number of days (used twice). */
							__(
								'Last %1$s days, compared with the %1$s days before',
								'catalogx'
							),
							periodDays
						)}
					</span>
				</p>
				<div
					className="cx-insights-range"
					role="group"
					aria-label={__('Reporting period', 'catalogx')}
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
								__('%sd', 'catalogx'),
								choice
							)}
						</button>
					))}
				</div>
			</div>

			<div className={isRefreshing ? 'cx-insights-refreshing' : ''}>
				<TrendStatComponent
					cols={4}
					items={[
						{
							icon: 'enquiry',
							label: __('New enquiries', 'catalogx'),
							value: numberFormat.format(enquiries.new.current),
							caption: daysBefore(
								numberFormat.format(enquiries.new.previous)
							),
							badge: changeBadge(enquiries.new, true),
							chartData: sparklineOf('enquiries'),
							chartDataKey: 'value',
						},
						{
							icon: 'quote',
							label: __('Quote requests', 'catalogx'),
							value: numberFormat.format(quotes.new.current),
							caption: quotes.enabled
								? daysBefore(
										numberFormat.format(quotes.new.previous)
									)
								: quotesOff,
							badge: changeBadge(quotes.new, true),
							chartData: sparklineOf('quotes'),
							chartDataKey: 'value',
						},
						{
							icon: 'revenue',
							label: __('Quote value', 'catalogx'),
							value: money(quotes.value.current),
							caption: quotes.enabled
								? daysBefore(money(quotes.value.previous))
								: quotesOff,
							badge: changeBadge(quotes.value, true),
						},
						{
							icon: 'check',
							label: __('Accepted quotes', 'catalogx'),
							value: numberFormat.format(quotes.accepted),
							caption: !quotes.enabled
								? quotesOff
								: null === acceptedShare
									? __(
											'No quote requests in this period',
											'catalogx'
										)
									: sprintf(
											/* translators: %s: percentage. */
											__(
												'%s%% of this period’s requests',
												'catalogx'
											),
											acceptedShare
										),
						},
					]}
				/>
			</div>

			<ContainerComponent className="cx-insights-grid">
				<ColumnComponent grid={8}>
					<div className="cx-insights-stack">
						{(insights.length > 0 || setupComplete) && (
							<CardComponent
								title={__('Needs your attention', 'catalogx')}
								desc={
									insights.length > 0
										? sprintf(
												/* translators: %s: number of items. */
												_n(
													'%s thing to look at',
													'%s things to look at',
													insights.length,
													'catalogx'
												),
												numberFormat.format(
													insights.length
												)
											)
										: __('Nothing waiting on you', 'catalogx')
								}
							>
								{insights.length > 0 ? (
									<>
										<ul className="cx-insights-list">
											{visibleInsights.map((insight) => (
												<li
													key={insight.id}
													className={`is-${insight.severity}`}
												>
													<span
														className="cx-insights-severity"
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
													<span className="cx-insights-list-text">
														<strong>
															{insight.title}
														</strong>
														<span>
															{insight.detail}
														</span>
													</span>
													<a
														className="cx-insights-action"
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
												className="cx-insights-more cx-insights-toggle"
												aria-expanded={showAllInsights}
												onClick={() =>
													setShowAllInsights(
														!showAllInsights
													)
												}
											>
												{showAllInsights
													? __('Show fewer', 'catalogx')
													: sprintf(
															/* translators: %s: number of items. */
															__(
																'Show all %s',
																'catalogx'
															),
															insights.length
														)}
											</button>
										)}
									</>
								) : (
									<p className="cx-insights-clear">
										<i
											className="adminfont-check"
											aria-hidden="true"
										/>
										{__(
											'Every request has an answer. Nothing is waiting on you.',
											'catalogx'
										)}
									</p>
								)}
							</CardComponent>
						)}

						<CardComponent
							title={
								'quotes' === metric
									? __('Quote requests per day', 'catalogx')
									: __('New enquiries per day', 'catalogx')
							}
							desc={sprintf(
								/* translators: 1: number of requests, 2: number of days. */
								__('%1$s in the last %2$s days', 'catalogx'),
								numberFormat.format(
									'quotes' === metric
										? quotes.new.current
										: enquiries.new.current
								),
								periodDays
							)}
							action={
								quotes.enabled ? (
									<div
										className="cx-insights-range"
										role="group"
										aria-label={__('Chart', 'catalogx')}
									>
										{(
											[
												[
													'enquiries',
													__('Enquiries', 'catalogx'),
												],
												[
													'quotes',
													__('Quotes', 'catalogx'),
												],
											] as const
										).map(([key, label]) => (
											<button
												key={key}
												type="button"
												aria-pressed={key === metric}
												className={
													key === metric
														? 'is-active'
														: ''
												}
												onClick={() =>
													setChartMetric(key)
												}
											>
												{label}
											</button>
										))}
									</div>
								) : undefined
							}
						>
							<div
								className={
									isRefreshing ? 'cx-insights-refreshing' : ''
								}
							>
								{'quotes' === metric ? (
									<DailyTrend
										daily={data.daily}
										valueOf={(day) => day.quotes}
										formatValue={(value) =>
											sprintf(
												/* translators: %s: number of quote requests. */
												_n(
													'%s quote request',
													'%s quote requests',
													value,
													'catalogx'
												),
												numberFormat.format(value)
											)
										}
										caption={{
											title: __(
												'Quote requests per day',
												'catalogx'
											),
											column: __('Quote requests', 'catalogx'),
										}}
										emptyText={__(
											'No quote requests in this period yet. Each quote a customer sends shows up here.',
											'catalogx'
										)}
									/>
								) : (
									<DailyTrend
										daily={data.daily}
										valueOf={(day) => day.enquiries}
										formatValue={(value) =>
											sprintf(
												/* translators: %s: number of enquiries. */
												_n(
													'%s enquiry',
													'%s enquiries',
													value,
													'catalogx'
												),
												numberFormat.format(value)
											)
										}
										caption={{
											title: __(
												'New enquiries per day',
												'catalogx'
											),
											column: __('Enquiries', 'catalogx'),
										}}
										emptyText={__(
											'No enquiries in this period yet. Each enquiry a customer sends shows up here.',
											'catalogx'
										)}
									/>
								)}
							</div>
						</CardComponent>

						<CardComponent
							title={__('Most requested products', 'catalogx')}
							desc={sprintf(
								/* translators: %s: number of days. */
								__(
									'By enquiries and quote requests, last %s days',
									'catalogx'
								),
								periodDays
							)}
						>
							{data.top_products.length > 0 ? (
								<table className="cx-insights-table">
									<thead>
										<tr>
											<th scope="col">
												{__('Product', 'catalogx')}
											</th>
											<th scope="col">
												{__('Enquiries', 'catalogx')}
											</th>
											<th scope="col" className="is-number">
												{__('Quotes', 'catalogx')}
											</th>
											<th scope="col">
												<span className="screen-reader-text">
													{__('Edit', 'catalogx')}
												</span>
											</th>
										</tr>
									</thead>
									<tbody>
										{data.top_products.map((product) => (
											<tr key={product.product_id}>
												<td className="cx-insights-table-title">
													{product.name ||
														__(
															'Deleted product',
															'catalogx'
														)}
												</td>
												<td>
													<span className="cx-insights-meter">
														<span
															className="cx-insights-meter-bar"
															aria-hidden="true"
														>
															<span
																style={{
																	width: `${((product.enquiries + product.quotes) / topMax) * 100}%`,
																}}
															/>
														</span>
														{numberFormat.format(
															product.enquiries
														)}
													</span>
												</td>
												<td className="is-number">
													{numberFormat.format(
														product.quotes
													)}
												</td>
												<td className="cx-insights-table-action">
													{product.edit_url && (
														<a href={product.edit_url}>
															{__(
																'Edit product',
																'catalogx'
															)}
														</a>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							) : (
								<p className="cx-insights-empty">
									{__(
										'Products customers ask about in this period are ranked here.',
										'catalogx'
									)}
								</p>
							)}
						</CardComponent>
					</div>
				</ColumnComponent>

				<ColumnComponent grid={4}>
					<div className="cx-insights-stack">
						{team}
						{setupCard}
						<CardComponent
							title={__('What is switched on', 'catalogx')}
							desc={
								isPro
									? __('CatalogX Pro is active', 'catalogx')
									: __('CatalogX Free', 'catalogx')
							}
							action={
								<a className="cx-insights-more" href={TAB.modules}>
									{__('Modules', 'catalogx')}
									<i
										className="adminfont-arrow-right"
										aria-hidden="true"
									/>
								</a>
							}
						>
							<dl className="cx-insights-pulse">
								{featureRows.map(([label, on]) => (
									<div key={label}>
										<dt>{label}</dt>
										<dd>
											<span
												className={`cx-insights-dot ${on ? 'is-good' : 'is-off'}`}
												aria-hidden="true"
											/>
											{on
												? __('On', 'catalogx')
												: __('Off', 'catalogx')}
										</dd>
									</div>
								))}
							</dl>
						</CardComponent>

						<CardComponent
							title={__('Latest requests', 'catalogx')}
							desc={__('Most recent first', 'catalogx')}
						>
							{data.recent.length > 0 ? (
								<ul className="cx-insights-recent">
									{data.recent.map((request, index) => (
										<li key={`${request.date}-${index}`}>
											<span
												className="cx-insights-avatar"
												aria-hidden="true"
											>
												{(request.customer || '?')
													.charAt(0)
													.toUpperCase()}
											</span>
											<span className="cx-insights-recent-text">
												<strong>
													{request.customer ||
														__('Guest', 'catalogx')}
												</strong>
												<span>
													{request.item ||
														__(
															'Deleted product',
															'catalogx'
														)}
												</span>
											</span>
											<span className="cx-insights-recent-meta">
												<span
													className={`cx-insights-status-tag is-${request.status}`}
												>
													{STATUS_LABEL[request.status] ??
														request.status}
												</span>
												<time dateTime={request.date}>
													{formatAgo(request.date)}
												</time>
											</span>
										</li>
									))}
								</ul>
							) : (
								<p className="cx-insights-empty">
									{__('No requests yet.', 'catalogx')}
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
