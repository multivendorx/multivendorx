/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { NoticeManager, PopupComponent } from '@zyra/components';
import { __, sprintf } from '@wordpress/i18n';
import axios from 'axios';
import catalogx from '../../assets/images/catalogx.png';
import notifima from '../../assets/images/notifima.png';
import ShowProPopup from '../Popup/Popup';
import Insights from './Insights';

interface WPPlugin {
	plugin?: string;
	status?: string;
}

const UTM =
	'utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=moowoodle';

/** The Pro features the dashboard's Pro panel lists (free sites only). */
const PRO_FEATURES = [
	{
		icon: 'single-sign-on',
		title: __('Single Sign-On', 'moowoodle'),
		desc: __(
			'Students open Moodle™ courses straight from WordPress, without a second login.',
			'moowoodle'
		),
	},
	{
		icon: 'cohort',
		title: __('Cohort enrollment', 'moowoodle'),
		desc: __(
			'Sell a Moodle™ cohort as one product and enroll the whole group at once.',
			'moowoodle'
		),
	},
	{
		icon: 'classroom-enrollment',
		title: __('Classroom seats', 'moowoodle'),
		desc: __(
			'Teams and schools buy several seats and assign them to their learners.',
			'moowoodle'
		),
	},
	{
		icon: 'gift-a-course',
		title: __('Gift a course', 'moowoodle'),
		desc: __(
			'Customers buy a course for someone else, right at checkout.',
			'moowoodle'
		),
	},
	{
		icon: 'subscription-courses',
		title: __('Subscription courses', 'moowoodle'),
		desc: __(
			'Sell access on a recurring plan instead of a one-off price.',
			'moowoodle'
		),
	},
	{
		icon: 'bulk-course-sync',
		title: __('Automatic sync', 'moowoodle'),
		desc: __(
			'Courses, cohorts and users stay in step with Moodle™ on a schedule.',
			'moowoodle'
		),
	},
];

/** Self-serve help: the docs, the videos and this plugin's own Help & Support screen. */
const RESOURCES = [
	{
		icon: 'knowledgebase',
		title: __('Documentation', 'moowoodle'),
		desc: __(
			'Guides for connecting Moodle™, syncing courses and selling them.',
			'moowoodle'
		),
		link: `https://moowoodle.com/docs/knowledgebase/?${UTM}`,
	},
	{
		icon: 'youtube',
		title: __('Video tutorials', 'moowoodle'),
		desc: __(
			'Watch the setup, from the Moodle™ token to the first enrollment.',
			'moowoodle'
		),
		link: 'https://www.youtube.com/@moowoodle/videos',
	},
	{
		icon: 'customer-support',
		title: __('Help & Support', 'moowoodle'),
		desc: __(
			'Troubleshooting, the community forum and our team.',
			'moowoodle'
		),
		link: '#&tab=help-support',
	},
];

/** The team's other WooCommerce plugins: the wordpress.org slug decides installed/active, the Pro link replaces Install once active. */
const COMPANION_PLUGINS = [
	{
		slug: 'woocommerce-catalog-enquiry',
		name: 'CatalogX',
		desc: __(
			'Turn your store into a catalog with enquiry-based sales.',
			'moowoodle'
		),
		logo: catalogx,
		proUrl: `https://catalogx.com/pricing/?${UTM}`,
	},
	{
		slug: 'woocommerce-product-stock-alert',
		name: 'Notifima',
		desc: __(
			'Back-in-stock alerts and wishlists for WooCommerce.',
			'moowoodle'
		),
		logo: notifima,
		proUrl: `https://notifima.com/pricing/?${UTM}`,
	},
];

const isExternal = (link: string) => !link.startsWith('#');

/**
 * The Dashboard tab: the data-driven insights (Insights.tsx), then — for free sites — what Pro adds, and the help and
 * companion-plugin panels. Every panel uses the same card style as the insights above it.
 */
const DashboardTab: React.FC<object> = () => {
	const [installing, setInstalling] = useState<string>('');
	const [pluginStatus, setPluginStatus] = useState<Record<string, boolean>>(
		{}
	);
	const [plugins, setPlugins] = useState<WPPlugin[]>([]);
	const [proPopupOpen, setProPopupOpen] = useState(false);

	const isPro = !!appLocalizer.khali_dabba;

	useEffect(() => {
		axios
			.get(`${appLocalizer.apiUrl}/wp/v2/plugins`, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((response) => {
				const pluginList: WPPlugin[] = response.data;
				const statusMap: Record<string, boolean> = {};

				COMPANION_PLUGINS.forEach(({ slug }) => {
					statusMap[slug] = pluginList.some(
						(plugin) =>
							!!plugin.plugin?.includes(slug) &&
							'active' === plugin.status
					);
				});

				setPlugins(pluginList);
				setPluginStatus(statusMap);
			})
			.catch((error) => {
				console.error('Failed to fetch plugins:', error);
			});
	}, []);

	const installOrActivatePlugin = (slug: string) => {
		if (!slug || installing) {
			return;
		}

		if (plugins.some((plugin) => plugin.plugin?.includes(slug))) {
			NoticeManager.add({
				title: __('Redirecting...', 'moowoodle'),
				message: __(
					'Plugin already installed. Redirecting to activate...',
					'moowoodle'
				),
				type: 'info',
				position: 'float',
			});

			window.open(
				`${appLocalizer.admin_url}plugins.php?s=${slug}`,
				'_blank'
			);
			return;
		}

		setInstalling(slug);

		axios
			.post(
				`${appLocalizer.apiUrl}/wp/v2/plugins`,
				{ slug, status: 'active' },
				{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
			)
			.then(() => {
				window.location.reload();
			})
			.catch(() => {
				NoticeManager.add({
					title: __('Error!', 'moowoodle'),
					message: sprintf(
						/* translators: %s: Plugin slug or plugin name. */
						__('Could not install "%s".', 'moowoodle'),
						slug
					),
					type: 'error',
					position: 'float',
				});
			})
			.finally(() => setInstalling(''));
	};

	return (
		<>
			<Insights />

			{!isPro && (
				<section className="mw-insights-panel mw-dash-pro">
					<div className="mw-dash-pro-head">
						<div>
							<span className="mw-dash-pro-pill">
								<i
									className="adminfont-pro-tag"
									aria-hidden="true"
								/>
								{__('MooWoodle Pro', 'moowoodle')}
							</span>
							<h2>
								{__(
									'Do more with your Moodle™ courses',
									'moowoodle'
								)}
							</h2>
							<p>
								{__(
									'Group and classroom sales, single sign-on, gifting and subscriptions, in the admin you already use.',
									'moowoodle'
								)}
							</p>
						</div>
						<div className="mw-dash-pro-cta">
							<button
								type="button"
								className="mw-insights-button"
								onClick={() => setProPopupOpen(true)}
							>
								{__('Upgrade to Pro', 'moowoodle')}
							</button>
							<span>
								{__('15-day money-back guarantee', 'moowoodle')}
							</span>
						</div>
					</div>
					<ul className="mw-dash-pro-features">
						{PRO_FEATURES.map((feature) => (
							<li key={feature.title}>
								<span
									className="mw-dash-icon"
									aria-hidden="true"
								>
									<i
										className={`adminfont-${feature.icon}`}
									/>
								</span>
								<span>
									<strong>{feature.title}</strong>
									<span>{feature.desc}</span>
								</span>
							</li>
						))}
					</ul>
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
				</section>
			)}

			<div className="mw-insights-row">
				<section className="mw-insights-panel">
					<div className="mw-insights-panel-head">
						<h2>{__('Help and resources', 'moowoodle')}</h2>
					</div>
					<ul className="mw-dash-list">
						{RESOURCES.map((resource) => (
							<li key={resource.title}>
								<a
									className="mw-dash-row"
									href={resource.link}
									{...(isExternal(resource.link)
										? {
												target: '_blank',
												rel: 'noopener noreferrer',
											}
										: {})}
								>
									<span
										className="mw-dash-icon"
										aria-hidden="true"
									>
										<i
											className={`adminfont-${resource.icon}`}
										/>
									</span>
									<span className="mw-dash-row-text">
										<strong>{resource.title}</strong>
										<span>{resource.desc}</span>
									</span>
									<i
										className={`mw-dash-row-arrow adminfont-${isExternal(resource.link) ? 'external' : 'arrow-right'}`}
										aria-hidden="true"
									/>
									{isExternal(resource.link) && (
										<span className="screen-reader-text">
											{__(
												'(opens in a new tab)',
												'moowoodle'
											)}
										</span>
									)}
								</a>
							</li>
						))}
					</ul>
				</section>

				<section className="mw-insights-panel">
					<div className="mw-insights-panel-head">
						<h2>
							{__('More from the MooWoodle team', 'moowoodle')}
						</h2>
					</div>
					<ul className="mw-dash-list">
						{COMPANION_PLUGINS.map((companion) => {
							const isActive = !!pluginStatus[companion.slug];
							const isBusy = installing === companion.slug;

							return (
								<li
									key={companion.slug}
									className="mw-dash-row"
								>
									<img
										className="mw-dash-logo"
										src={companion.logo}
										alt=""
									/>
									<span className="mw-dash-row-text">
										<strong>
											{companion.name}
											<span
												className={`mw-dash-tag ${isActive ? 'is-active' : 'is-free'}`}
											>
												{isActive
													? __('Active', 'moowoodle')
													: __('Free', 'moowoodle')}
											</span>
										</strong>
										<span>{companion.desc}</span>
									</span>
									{isActive ? (
										<a
											className="mw-dash-action"
											href={companion.proUrl}
											target="_blank"
											rel="noopener noreferrer"
										>
											{sprintf(
												/* translators: %s: plugin name. */
												__('Get %s Pro', 'moowoodle'),
												companion.name
											)}
											<span className="screen-reader-text">
												{__(
													'(opens in a new tab)',
													'moowoodle'
												)}
											</span>
										</a>
									) : (
										<button
											type="button"
											className="mw-dash-action"
											disabled={!!installing}
											onClick={() =>
												installOrActivatePlugin(
													companion.slug
												)
											}
										>
											{isBusy
												? __('Installing…', 'moowoodle')
												: __('Install', 'moowoodle')}
										</button>
									)}
								</li>
							);
						})}
					</ul>
				</section>
			</div>
		</>
	);
};

export default DashboardTab;
