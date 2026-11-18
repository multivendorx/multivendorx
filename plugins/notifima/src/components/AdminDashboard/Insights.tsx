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

/** GET notifima/v1/dashboard (classes/RestAPI/Controllers/Dashboard.php). */
interface DashboardData {
	period_days: number;
	/** The periods the range switch offers, e.g. [7, 30, 90]. */
	period_choices?: number[];
	/** The store's currency code, for the value of waiting demand. */
	currency?: string;
	setup: {
		/** Whether WooCommerce sends the back-in-stock email. */
		email_enabled: boolean;
		/** WooCommerce → Settings → Emails, opened at the back-in-stock email. */
		email_url: string;
		/** Whether the subscription form designer has been saved. */
		form_customized: boolean;
		/** The products screen, filtered to out-of-stock products. */
		products_url: string;
	};
	subscriptions: {
		total: number;
		by_status: Record<SubscriptionStatus, number>;
		/** New subscriptions this period and the one before. */
		new: PeriodCount;
	};
	products: {
		/** Products with at least one shopper waiting. */
		waiting: number;
		/** True when the server stopped counting waited-for products at its limit. */
		limited: boolean;
		out_of_stock: number;
		/** Price × shoppers waiting, over the waited-for products that are out of stock. */
		demand_value: number;
		/** Waited-for products that are back in stock, whose shoppers were never emailed. */
		restocked: number;
		restocked_waiting: number;
	};
	daily: Array<{ date: string; count: number }>;
	top_products: Array<{
		product_id: number;
		name: string;
		waiting: number;
		new: number;
		price: number;
		stock_status: string;
		edit_url: string;
	}>;
	recent: Array<{
		email: string;
		product: string;
		status: SubscriptionStatus;
		date: string;
	}>;
}

type SubscriptionStatus =
	| 'subscribed'
	| 'unsubscribed'
	| 'notification_sent'
	| 'notification_failed';

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
	automation: '#&tab=settings&subtab=automation',
	formDesigner: '#&tab=settings&subtab=subscription-form-designer',
	subscribers: '#&tab=subscribers-list',
	inventory: '#&tab=inventory-manager',
};

const SEVERITY_LABEL: Record<Severity, string> = {
	critical: __('Critical', 'notifima'),
	warning: __('Warning', 'notifima'),
	info: __('Info', 'notifima'),
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

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
	subscribed: __('Waiting', 'notifima'),
	unsubscribed: __('Unsubscribed', 'notifima'),
	notification_sent: __('Notified', 'notifima'),
	notification_failed: __('Failed', 'notifima'),
};

const STOCK_LABEL: Record<string, string> = {
	instock: __('In stock', 'notifima'),
	outofstock: __('Out of stock', 'notifima'),
	onbackorder: __('On backorder', 'notifima'),
};

const numberFormat = new Intl.NumberFormat();

/** How many "needs your attention" items show before "Show all". */
const INSIGHTS_SHOWN = 3;

/** An out-of-stock product with at least this many shoppers waiting is worth its own "restock it" item. */
const HIGH_DEMAND = 5;

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

	return __('just now', 'notifima');
};

/**
 * Turns the dashboard numbers into what needs doing, most urgent first. Turning the email on and the first subscriber
 * aren't listed on their own while the setup checklist covers them; the email comes back here if shoppers are waiting.
 */
const buildInsights = (data: DashboardData): Insight[] => {
	const { setup, subscriptions, products, period_days: periodDays } = data;
	const insights: Insight[] = [];
	const waiting = subscriptions.by_status.subscribed ?? 0;
	const failed = subscriptions.by_status.notification_failed ?? 0;
	const money = (amount: number) =>
		formatMoney(amount, data.currency ?? 'USD');

	if (products.restocked > 0) {
		insights.push({
			id: 'restocked-waiting',
			severity: 'critical',
			title: sprintf(
				/* translators: %s: number of products. */
				_n(
					'%s product is back in stock, but its shoppers weren’t told',
					'%s products are back in stock, but their shoppers weren’t told',
					products.restocked,
					'notifima'
				),
				numberFormat.format(products.restocked)
			),
			detail: sprintf(
				/* translators: %s: number of shoppers. */
				_n(
					'%s shopper is still waiting. Notifima emails subscribers when a product’s stock status changes to In stock; stock changed by an import or directly in the database doesn’t trigger it. Update the stock from the product to send the email.',
					'%s shoppers are still waiting. Notifima emails subscribers when a product’s stock status changes to In stock; stock changed by an import or directly in the database doesn’t trigger it. Update the stock from the product to send the email.',
					products.restocked_waiting,
					'notifima'
				),
				numberFormat.format(products.restocked_waiting)
			),
			cta: __('Review products', 'notifima'),
			link: appLocalizer.khali_dabba
				? TAB.inventory
				: `${appLocalizer.admin_url}edit.php?post_type=product&stock_status=instock`,
		});
	}

	if (!setup.email_enabled && waiting > 0) {
		insights.push({
			id: 'email-off',
			severity: 'critical',
			title: __('The back-in-stock email is turned off', 'notifima'),
			detail: sprintf(
				/* translators: %s: number of shoppers. */
				_n(
					'%s shopper is waiting, and won’t be told when the product returns.',
					'%s shoppers are waiting, and none of them will be told when their product returns.',
					waiting,
					'notifima'
				),
				numberFormat.format(waiting)
			),
			cta: __('Turn it on', 'notifima'),
			link: setup.email_url,
		});
	}

	if (failed > 0) {
		insights.push({
			id: 'emails-failed',
			severity: 'warning',
			title: sprintf(
				/* translators: %s: number of emails. */
				_n(
					'%s back-in-stock email couldn’t be sent',
					'%s back-in-stock emails couldn’t be sent',
					failed,
					'notifima'
				),
				numberFormat.format(failed)
			),
			detail: __(
				'Notifima tries again once on its own. If emails keep failing, check that your site can send email; an SMTP plugin usually fixes it.',
				'notifima'
			),
			cta: __('Check email settings', 'notifima'),
			link: setup.email_url,
		});
	}

	const subscriptionChange = percentChange(subscriptions.new);

	if (
		null !== subscriptionChange &&
		subscriptionChange <= -25 &&
		subscriptions.new.previous >= 5
	) {
		insights.push({
			id: 'subscriptions-down',
			severity: 'warning',
			title: sprintf(
				/* translators: 1: percentage drop, 2: number of days. */
				__(
					'New subscriptions are down %1$s%% on the previous %2$s days',
					'notifima'
				),
				Math.abs(subscriptionChange),
				periodDays
			),
			detail: sprintf(
				/* translators: 1: subscriptions this period, 2: subscriptions in the previous period. */
				__(
					'%1$s this period against %2$s before it. Check that the form still shows on your out-of-stock products.',
					'notifima'
				),
				numberFormat.format(subscriptions.new.current),
				numberFormat.format(subscriptions.new.previous)
			),
			cta: __('Review the form', 'notifima'),
			link: TAB.automation,
		});
	}

	data.top_products
		.filter(
			(product) =>
				'outofstock' === product.stock_status &&
				product.waiting >= HIGH_DEMAND
		)
		.slice(0, 2)
		.forEach((product) => {
			insights.push({
				id: `high-demand-${product.product_id}`,
				severity: 'info',
				title: sprintf(
					/* translators: 1: number of shoppers, 2: product name. */
					_n(
						'%1$s shopper is waiting for %2$s',
						'%1$s shoppers are waiting for %2$s',
						product.waiting,
						'notifima'
					),
					numberFormat.format(product.waiting),
					product.name || __('a deleted product', 'notifima')
				),
				detail:
					product.price > 0
						? sprintf(
								/* translators: %s: an amount. */
								__(
									'Worth %s at today’s price. Restock it and they are emailed right away.',
									'notifima'
								),
								money(product.price * product.waiting)
							)
						: __(
								'Restock it and they are emailed right away.',
								'notifima'
							),
				cta: __('Restock it', 'notifima'),
				link: product.edit_url || data.setup.products_url,
			});
		});

	return insights.sort(
		(a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
	);
};

/** The four steps from a fresh install to the first back-in-stock email. */
const buildSetupSteps = (data: DashboardData) => {
	const { setup, subscriptions } = data;
	const firstWanted = data.top_products.find(
		(product) => product.edit_url && 'instock' !== product.stock_status
	);

	return [
		{
			id: 'email',
			done: setup.email_enabled,
			title: __('Turn on the back-in-stock email', 'notifima'),
			doneTitle: __('Back-in-stock email is on', 'notifima'),
			detail: __(
				'WooCommerce sends it when a product someone is waiting for is back. While it is off, no one is told.',
				'notifima'
			),
			cta: __('Open email settings', 'notifima'),
			link: setup.email_url,
		},
		{
			id: 'form',
			done: setup.form_customized,
			title: __('Make the form yours', 'notifima'),
			doneTitle: __('Subscription form customized', 'notifima'),
			detail: __(
				'Set the text, button and fields shoppers see on out-of-stock products.',
				'notifima'
			),
			cta: __('Design the form', 'notifima'),
			link: TAB.formDesigner,
		},
		{
			id: 'subscriber',
			done: subscriptions.total > 0,
			title: __('Get your first subscriber', 'notifima'),
			doneTitle: sprintf(
				/* translators: %s: number of subscriptions. */
				_n(
					'%s subscription so far',
					'%s subscriptions so far',
					subscriptions.total,
					'notifima'
				),
				numberFormat.format(subscriptions.total)
			),
			detail: __(
				'The form shows on every out-of-stock product. Open one to see it as shoppers do.',
				'notifima'
			),
			cta: __('See out-of-stock products', 'notifima'),
			link: setup.products_url,
		},
		{
			id: 'notify',
			done: (subscriptions.by_status.notification_sent ?? 0) > 0,
			title: __('Send your first back-in-stock email', 'notifima'),
			doneTitle: __('First back-in-stock email sent', 'notifima'),
			detail: __(
				'Restock a product someone is waiting for, and Notifima emails them on its own.',
				'notifima'
			),
			cta: __('Restock a product', 'notifima'),
			link: firstWanted?.edit_url || setup.products_url,
		},
	];
};

/**
 * A tile's change badge, "+25%" against the previous period: green when it went up, red when down, grey when there
 * is nothing to compare with.
 */
const changeBadge = (
	period: PeriodCount
): { text: string; color: string } | undefined => {
	const change = percentChange(period);

	if (null === change) {
		return period.current > 0
			? { text: __('New', 'notifima'), color: 'gray' }
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

/** New subscriptions per day: thin bars, a hover tooltip, and the same figures as a table for screen readers. */
const DailyTrend = ({ daily }: { daily: DashboardData['daily'] }) => {
	const [hovered, setHovered] = useState<number | null>(null);
	const total = daily.reduce((sum, day) => sum + day.count, 0);
	const max = niceMax(Math.max(0, ...daily.map((day) => day.count)));
	const hoveredDay = null === hovered ? null : daily[hovered];
	const describe = (count: number) =>
		sprintf(
			/* translators: %s: number of subscriptions. */
			_n('%s subscription', '%s subscriptions', count, 'notifima'),
			numberFormat.format(count)
		);

	if (0 === total) {
		return (
			<div className="nf-insights-chart-empty">
				<i className="adminfont-bar-chart" aria-hidden="true" />
				<p>
					{__(
						'No new subscriptions in this period yet. Each signup from an out-of-stock product shows up here.',
						'notifima'
					)}
				</p>
			</div>
		);
	}

	return (
		<div className="nf-insights-chart">
			<div className="nf-insights-chart-plot" aria-hidden="true">
				<div className="nf-insights-chart-grid">
					<span data-value={numberFormat.format(max)} />
					<span data-value={numberFormat.format(max / 2)} />
					<span data-value="0" />
				</div>
				<div
					className="nf-insights-chart-bars"
					onMouseLeave={() => setHovered(null)}
				>
					{daily.map((day, index) => (
						<div
							key={day.date}
							className={`nf-insights-chart-slot${hovered === index ? ' is-hovered' : ''}`}
							onMouseEnter={() => setHovered(index)}
						>
							<span
								className="nf-insights-chart-bar"
								style={{
									height: `${(day.count / max) * 100}%`,
								}}
							/>
						</div>
					))}
				</div>
				{hoveredDay && null !== hovered && (
					<div
						className="nf-insights-chart-tooltip"
						style={{
							left: `${((hovered + 0.5) / daily.length) * 100}%`,
						}}
					>
						<strong>{describe(hoveredDay.count)}</strong>
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
			<div className="nf-insights-chart-axis" aria-hidden="true">
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
				<span>{__('Today', 'notifima')}</span>
			</div>
			<table className="screen-reader-text">
				<caption>{__('New subscriptions per day', 'notifima')}</caption>
				<thead>
					<tr>
						<th scope="col">{__('Date', 'notifima')}</th>
						<th scope="col">{__('Subscriptions', 'notifima')}</th>
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
							<td>{describe(day.count)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

interface InsightsProps {
	/** The "Do more with Notifima Pro" card; null with Pro active. */
	pro: React.ReactNode;
	/** Learn Notifima: docs, forum, consultation. */
	learn: React.ReactNode;
	/** Help & Support: troubleshooting and the ways to reach the team. */
	help: React.ReactNode;
	/** More from the Notifima team. */
	team: React.ReactNode;
}

/**
 * The cards under the setup row or the figures: Learn Notifima beside Help & Support, then Pro. (The team's plugins
 * sit at the top right instead: beside the setup card, or at the head of the figures' side column.)
 */
const SupportRows = ({ pro, learn, help }: Omit<InsightsProps, 'team'>) => (
	<>
		<ContainerComponent className="nf-insights-grid is-equal">
			<ColumnComponent grid={4}>{learn}</ColumnComponent>
			<ColumnComponent grid={8}>{help}</ColumnComponent>
		</ContainerComponent>
		{pro}
	</>
);

/**
 * The whole Overview tab. Until the first subscriber it is a setup page: the setup card beside the team's plugins,
 * then Learn Notifima beside Help & Support, then Pro. After it, the period's figures lead: tiles, what needs
 * attention, the subscription trend and the most-wanted products, with a side column of the team's plugins, the setup
 * card (while a step is left), notification health and the latest subscribers; Learn, Help & Support and Pro follow.
 * One request, to notifima/v1/dashboard.
 */
const Insights: React.FC<InsightsProps> = ({ pro, learn, help, team }) => {
	const [data, setData] = useState<DashboardData | null>(null);
	const [failed, setFailed] = useState(false);
	// The reporting period, from the range switch. Changing it keeps the figures on screen (dimmed) until the new
	// ones arrive, so the layout doesn't jump.
	const [days, setDays] = useState(30);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [showAllInsights, setShowAllInsights] = useState(false);

	// Help & Support links (`&view=help-support`) scroll to the card once it is drawn.
	useEffect(() => {
		if (
			data &&
			'help-support' ===
				new URLSearchParams(window.location.hash.substring(1)).get(
					'view'
				)
		) {
			document
				.getElementById('notifima-help-support')
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
			<div className="nf-insights">
				<div className="nf-insights-failed" role="alert">
					<i className="adminfont-error" aria-hidden="true" />
					{__(
						'The dashboard figures could not be loaded. Reload the page, or contact support if it keeps happening.',
						'notifima'
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
				className="nf-insights"
				aria-busy="true"
				aria-label={__('Loading dashboard', 'notifima')}
			>
				<ContainerComponent className="nf-insights-grid">
					<ColumnComponent grid={6} className="nf-col-60">
						<CardComponent isLoading />
					</ColumnComponent>
					<ColumnComponent grid={6} className="nf-col-40">
						{team}
					</ColumnComponent>
				</ContainerComponent>
			</div>
		);
	}

	const { setup, subscriptions, products } = data;
	const periodDays = data.period_days;
	const steps = buildSetupSteps(data);
	const doneSteps = steps.filter((step) => step.done).length;
	const setupComplete = doneSteps === steps.length;
	const nextStep = steps.find((step) => !step.done);
	const insights = buildInsights(data);
	// The figures start with the first subscriber. Before it, every tile and chart would be zero, and the setup card
	// already says what to do next, so it is the whole dashboard.
	const hasData = subscriptions.total > 0;
	const byStatus = subscriptions.by_status;
	const waiting = byStatus.subscribed ?? 0;
	const failedEmails = byStatus.notification_failed ?? 0;
	const topMax = Math.max(
		1,
		...data.top_products.map((product) => product.waiting)
	);
	const sparkline = data.daily.some((day) => day.count > 0)
		? data.daily.map((day) => ({ value: day.count }))
		: undefined;
	const money = (amount: number) =>
		formatMoney(amount, data.currency ?? 'USD');
	const periodChoices = data.period_choices ?? [7, 30, 90];
	// The most urgent few, so the list reads as priorities; the rest behind "Show all".
	const visibleInsights = showAllInsights
		? insights
		: insights.slice(0, INSIGHTS_SHOWN);

	const setupCard = setupComplete ? null : (
		<CardComponent
			title={__('Get Notifima ready', 'notifima')}
			desc={sprintf(
				/* translators: 1: steps done, 2: total steps. */
				__('%1$s of %2$s steps done.', 'notifima'),
				doneSteps,
				steps.length
			)}
			className="nf-insights-setup"
			action={
				<div
					className="nf-insights-progress"
					role="progressbar"
					aria-valuemin={0}
					aria-valuemax={steps.length}
					aria-valuenow={doneSteps}
					aria-label={__('Setup progress', 'notifima')}
				>
					<span
						style={{
							width: `${(doneSteps / steps.length) * 100}%`,
						}}
					/>
				</div>
			}
		>
			<ol className="nf-insights-steps">
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
								className="nf-insights-step-marker"
								aria-hidden="true"
							>
								{step.done ? (
									<i className="adminfont-check" />
								) : (
									index + 1
								)}
							</span>
							<div className="nf-insights-step-body">
								<strong>
									{step.done ? step.doneTitle : step.title}
									{step.done && (
										<span className="screen-reader-text">
											{` ${__('(done)', 'notifima')}`}
										</span>
									)}
								</strong>
								{/* Only the step to do now explains itself; the rest stay one quiet line. */}
								{step === nextStep && (
									<>
										<p>{step.detail}</p>
										<div className="nf-insights-step-actions">
											<a
												className="admin-btn btn-purple-bg"
												href={step.link}
											>
												{step.cta}
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
			<div className="nf-insights">
				<ContainerComponent className="nf-insights-grid is-equal">
					<ColumnComponent grid={6} className="nf-col-60">
						{setupCard}
					</ColumnComponent>
					<ColumnComponent grid={6} className="nf-col-40">
						{team}
					</ColumnComponent>
				</ContainerComponent>
				<SupportRows pro={pro} learn={learn} help={help} />
			</div>
		);
	}

	return (
		<div className="nf-insights">
			<div className="nf-insights-toolbar">
				<p>
					<span>
						{sprintf(
							/* translators: %1$s: number of days (used twice). */
							__(
								'Last %1$s days, compared with the %1$s days before',
								'notifima'
							),
							periodDays
						)}
					</span>
				</p>
				<div
					className="nf-insights-range"
					role="group"
					aria-label={__('Reporting period', 'notifima')}
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
								__('%sd', 'notifima'),
								choice
							)}
						</button>
					))}
				</div>
			</div>

			<div className={isRefreshing ? 'nf-insights-refreshing' : ''}>
				<TrendStatComponent
					cols={4}
					items={[
						{
							icon: 'subscriber',
							label: __('New subscriptions', 'notifima'),
							value: numberFormat.format(
								subscriptions.new.current
							),
							caption: sprintf(
								/* translators: 1: a number, 2: number of days. */
								__('%1$s the %2$s days before', 'notifima'),
								numberFormat.format(subscriptions.new.previous),
								periodDays
							),
							badge: changeBadge(subscriptions.new),
							chartData: sparkline,
							chartDataKey: 'value',
						},
						{
							icon: 'person',
							label: __('Shoppers waiting', 'notifima'),
							value: numberFormat.format(waiting),
							caption: sprintf(
								/* translators: %s: number of products. */
								_n(
									'for %s product',
									'for %s products',
									products.waiting,
									'notifima'
								),
								`${numberFormat.format(products.waiting)}${products.limited ? '+' : ''}`
							),
						},
						{
							icon: 'revenue',
							label: __('Demand waiting', 'notifima'),
							value: money(products.demand_value),
							caption: sprintf(
								/* translators: %s: number of products. */
								_n(
									'on %s out-of-stock product',
									'on %s out-of-stock products',
									products.out_of_stock,
									'notifima'
								),
								numberFormat.format(products.out_of_stock)
							),
						},
						{
							icon: 'mail',
							label: __('Back-in-stock emails sent', 'notifima'),
							value: numberFormat.format(
								byStatus.notification_sent ?? 0
							),
							caption: __('Since Notifima was installed', 'notifima'),
							badge:
								failedEmails > 0
									? {
											text: sprintf(
												/* translators: %s: number of failed emails. */
												__('%s failed', 'notifima'),
												numberFormat.format(
													failedEmails
												)
											),
											color: 'red',
										}
									: undefined,
						},
					]}
				/>
			</div>

			<ContainerComponent className="nf-insights-grid">
				<ColumnComponent grid={8}>
					<div className="nf-insights-stack">
						{(insights.length > 0 || setupComplete) && (
							<CardComponent
								title={__('Needs your attention', 'notifima')}
								desc={
									insights.length > 0
										? sprintf(
												/* translators: %s: number of items. */
												_n(
													'%s thing to look at',
													'%s things to look at',
													insights.length,
													'notifima'
												),
												numberFormat.format(
													insights.length
												)
											)
										: __(
												'Nothing waiting on you',
												'notifima'
											)
								}
							>
								{insights.length > 0 ? (
									<>
										<ul className="nf-insights-list">
											{visibleInsights.map((insight) => (
												<li
													key={insight.id}
													className={`is-${insight.severity}`}
												>
													<span
														className="nf-insights-severity"
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
													<span className="nf-insights-list-text">
														<strong>
															{insight.title}
														</strong>
														<span>
															{insight.detail}
														</span>
													</span>
													<a
														className="nf-insights-action"
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
												className="nf-insights-more nf-insights-toggle"
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
															'notifima'
														)
													: sprintf(
															/* translators: %s: number of items. */
															__(
																'Show all %s',
																'notifima'
															),
															insights.length
														)}
											</button>
										)}
									</>
								) : (
									<p className="nf-insights-clear">
										<i
											className="adminfont-check"
											aria-hidden="true"
										/>
										{__(
											'Shoppers are subscribing and being told when their products are back.',
											'notifima'
										)}
									</p>
								)}
							</CardComponent>
						)}

						<CardComponent
							title={__('New subscriptions per day', 'notifima')}
							desc={sprintf(
								/* translators: 1: number of subscriptions, 2: number of days. */
								_n(
									'%1$s in the last %2$s days',
									'%1$s in the last %2$s days',
									subscriptions.new.current,
									'notifima'
								),
								numberFormat.format(subscriptions.new.current),
								periodDays
							)}
						>
							<div
								className={
									isRefreshing ? 'nf-insights-refreshing' : ''
								}
							>
								<DailyTrend daily={data.daily} />
							</div>
						</CardComponent>

						<CardComponent
							title={__('Most-wanted products', 'notifima')}
							desc={__('By shoppers waiting now', 'notifima')}
							action={
								appLocalizer.khali_dabba ? (
									<a
										className="nf-insights-more"
										href={TAB.inventory}
									>
										{__('All products', 'notifima')}
										<i
											className="adminfont-arrow-right"
											aria-hidden="true"
										/>
									</a>
								) : undefined
							}
						>
							{data.top_products.length > 0 ? (
								<table className="nf-insights-table">
									<thead>
										<tr>
											<th scope="col">
												{__('Product', 'notifima')}
											</th>
											<th scope="col">
												{__('Waiting', 'notifima')}
											</th>
											<th
												scope="col"
												className="is-number"
											>
												{sprintf(
													/* translators: %s: number of days. */
													__('New, %sd', 'notifima'),
													periodDays
												)}
											</th>
											<th scope="col">
												{__('Stock', 'notifima')}
											</th>
											<th scope="col">
												<span className="screen-reader-text">
													{__(
														'Edit product',
														'notifima'
													)}
												</span>
											</th>
										</tr>
									</thead>
									<tbody>
										{data.top_products.map((product) => (
											<tr key={product.product_id}>
												<td className="nf-insights-table-title">
													{product.name ||
														__(
															'Deleted product',
															'notifima'
														)}
												</td>
												<td>
													<span className="nf-insights-meter">
														<span
															className="nf-insights-meter-bar"
															aria-hidden="true"
														>
															<span
																style={{
																	width: `${(product.waiting / topMax) * 100}%`,
																}}
															/>
														</span>
														{numberFormat.format(
															product.waiting
														)}
													</span>
												</td>
												<td className="is-number">
													{numberFormat.format(
														product.new
													)}
												</td>
												<td>
													<span
														className={`nf-insights-status-tag is-${product.stock_status || 'unknown'}`}
													>
														{STOCK_LABEL[
															product.stock_status
														] ?? '—'}
													</span>
												</td>
												<td className="nf-insights-table-action">
													{product.edit_url && (
														<a
															href={
																product.edit_url
															}
														>
															{__(
																'Edit product',
																'notifima'
															)}
														</a>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							) : (
								<p className="nf-insights-empty">
									{__(
										'No one is waiting for a product right now. Products with shoppers waiting are ranked here.',
										'notifima'
									)}
								</p>
							)}
						</CardComponent>
					</div>
				</ColumnComponent>

				<ColumnComponent grid={4}>
					<div className="nf-insights-stack">
						{team}
						{setupCard}
						<CardComponent
							title={__('Notification health', 'notifima')}
							desc={
								setup.email_enabled
									? __(
											'Back-in-stock emails are going out',
											'notifima'
										)
									: __(
											'The back-in-stock email is off',
											'notifima'
										)
							}
						>
							<dl className="nf-insights-pulse">
								<div>
									<dt>{__('Back-in-stock email', 'notifima')}</dt>
									<dd>
										<span
											className={`nf-insights-dot ${setup.email_enabled ? 'is-good' : 'is-off'}`}
											aria-hidden="true"
										/>
										<a href={setup.email_url}>
											{setup.email_enabled
												? __('On', 'notifima')
												: __('Off', 'notifima')}
										</a>
									</dd>
								</div>
								<div>
									<dt>{__('Emails sent', 'notifima')}</dt>
									<dd>
										{numberFormat.format(
											byStatus.notification_sent ?? 0
										)}
									</dd>
								</div>
								<div>
									<dt>{__('Failed', 'notifima')}</dt>
									<dd>{numberFormat.format(failedEmails)}</dd>
								</div>
								<div>
									<dt>{__('Unsubscribed', 'notifima')}</dt>
									<dd>
										{numberFormat.format(
											byStatus.unsubscribed ?? 0
										)}
									</dd>
								</div>
							</dl>
						</CardComponent>

						<CardComponent
							title={__('Latest subscribers', 'notifima')}
							desc={__('Most recent first', 'notifima')}
							action={
								data.recent.length > 0 &&
								appLocalizer.khali_dabba ? (
									<a
										className="nf-insights-more"
										href={TAB.subscribers}
									>
										{__('View all', 'notifima')}
										<i
											className="adminfont-arrow-right"
											aria-hidden="true"
										/>
									</a>
								) : undefined
							}
						>
							{data.recent.length > 0 ? (
								<ul className="nf-insights-recent">
									{data.recent.map((subscriber, index) => (
										<li key={`${subscriber.date}-${index}`}>
											<span
												className="nf-insights-avatar"
												aria-hidden="true"
											>
												{(subscriber.email || '?')
													.charAt(0)
													.toUpperCase()}
											</span>
											<span className="nf-insights-recent-text">
												<strong>{subscriber.email}</strong>
												<span>
													{subscriber.product ||
														__(
															'Deleted product',
															'notifima'
														)}
												</span>
											</span>
											<span className="nf-insights-recent-meta">
												<span
													className={`nf-insights-status-tag is-${subscriber.status}`}
												>
													{STATUS_LABEL[
														subscriber.status
													] ?? subscriber.status}
												</span>
												<time dateTime={subscriber.date}>
													{formatAgo(subscriber.date)}
												</time>
											</span>
										</li>
									))}
								</ul>
							) : (
								<p className="nf-insights-empty">
									{__('No subscribers yet.', 'notifima')}
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
