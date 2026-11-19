/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { CardComponent, NoticeManager, PopupComponent } from '@zyra/components';
import { __, sprintf } from '@wordpress/i18n';
import axios from 'axios';
import catalogx from '../../assets/images/catalogx.png';
import notifima from '../../assets/images/notifima.png';
import ShowProPopup from '../Popup/Popup';
import Insights from './Insights';
import { ACCOUNT_URL, CONTACT_URL, DOCS_URL, UTM } from '../../services/links';

interface WPPlugin {
	plugin?: string;
	status?: string;
}

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

interface HelpLink {
	icon: string;
	title: string;
	desc: string;
	/** Absolute URL (opens in a new tab), or `#&tab=…` for a screen of this admin page. */
	link: string;
}

/** Learning MooWoodle on your own: the docs, the videos and the community forum. */
const LEARN: HelpLink[] = [
	{
		icon: 'knowledgebase',
		title: __('Documentation', 'moowoodle'),
		desc: __(
			'Guides for connecting Moodle™, syncing courses and selling them.',
			'moowoodle'
		),
		link: DOCS_URL,
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
		icon: 'forum',
		title: __('Community forum', 'moowoodle'),
		desc: __(
			'Ask on WordPress.org and get answers from our team and other users.',
			'moowoodle'
		),
		link: 'https://wordpress.org/support/plugin/moowoodle/',
	},
];

/** Most problems are a broken connection or a failed sync: the two screens that show which. */
const TROUBLESHOOT: HelpLink[] = [
	{
		icon: 'centralized-connections',
		title: __('Test the Moodle™ connection', 'moowoodle'),
		desc: __(
			'Checks the site URL, the token and each web service function MooWoodle needs.',
			'moowoodle'
		),
		link: '#&tab=settings&subtab=connection-access',
	},
	{
		icon: 'report',
		title: __('Check the logs', 'moowoodle'),
		desc: __(
			'Every request to Moodle™ and its error. Attach them when you contact support.',
			'moowoodle'
		),
		link: '#&tab=settings&subtab=logs',
	},
];

/** Ways to reach the team. Manage plan only applies once there is a plan. */
const CONTACT: HelpLink[] = [
	{
		icon: 'customer-support',
		title: __('Contact support', 'moowoodle'),
		desc: __(
			'Send our team a ticket and get a reply by email.',
			'moowoodle'
		),
		link: CONTACT_URL,
	},
	{
		icon: 'coding',
		title: __('Custom development', 'moowoodle'),
		desc: __(
			'We build tailored features for eLearning sites.',
			'moowoodle'
		),
		link: `https://dualcube.com/custom-development/?${UTM}`,
	},
	...(appLocalizer.khali_dabba
		? [
				{
					icon: 'person',
					title: __('Manage plan', 'moowoodle'),
					desc: __(
						'Download MooWoodle Pro, manage license keys and renew.',
						'moowoodle'
					),
					link: ACCOUNT_URL,
				},
			]
		: []),
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

/** One help row: icon, title and description, the whole row a link (external ones open in a new tab). */
const LinkRow = ({ item }: { item: HelpLink }) => (
	<li>
		<a
			className="mw-dash-row"
			href={item.link}
			{...(isExternal(item.link)
				? { target: '_blank', rel: 'noopener noreferrer' }
				: {})}
		>
			<span className="mw-dash-icon" aria-hidden="true">
				<i className={`adminfont-${item.icon}`} />
			</span>
			<span className="mw-dash-row-text">
				<strong>{item.title}</strong>
				<span>{item.desc}</span>
			</span>
			<i
				className={`mw-dash-row-arrow adminfont-${isExternal(item.link) ? 'external' : 'arrow-right'}`}
				aria-hidden="true"
			/>
			{isExternal(item.link) && (
				<span className="screen-reader-text">
					{__('(opens in a new tab)', 'moowoodle')}
				</span>
			)}
		</a>
	</li>
);

/**
 * The Overview tab: builds the Learn, Help & Support, companion-plugin and (free sites) Pro cards, and hands them to
 * Insights.tsx, which places them around the setup card or the figures.
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

	const proCard = isPro ? null : (
		<CardComponent
			title={__('Do more with MooWoodle Pro', 'moowoodle')}
			desc={__(
				'Group and classroom sales, single sign-on, gifting and subscriptions, in the admin you already use.',
				'moowoodle'
			)}
			className="mw-dash-pro"
			action={
				<span className="mw-dash-pro-cta">
					<span>
						{__('15-day money-back guarantee', 'moowoodle')}
					</span>
					<button
						type="button"
						className="admin-btn btn-purple-bg"
						onClick={() => setProPopupOpen(true)}
					>
						<i className="adminfont-pro-tag" aria-hidden="true" />
						{__('Upgrade to Pro', 'moowoodle')}
					</button>
				</span>
			}
		>
			<ul className="mw-dash-pro-features">
				{PRO_FEATURES.map((feature) => (
					<li key={feature.title}>
						<span className="mw-dash-icon" aria-hidden="true">
							<i className={`adminfont-${feature.icon}`} />
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
		</CardComponent>
	);

	const learnCard = (
		<CardComponent
			title={__('Learn MooWoodle', 'moowoodle')}
			desc={__('Guides, videos and the community', 'moowoodle')}
		>
			<ul className="mw-dash-list">
				{LEARN.map((item) => (
					<LinkRow key={item.title} item={item} />
				))}
			</ul>
		</CardComponent>
	);

	// Old Help & Support links (`#&tab=dashboard&view=help-support`) scroll to this card.
	const helpCard = (
		<CardComponent
			id="moowoodle-help-support"
			title={__('Help & Support', 'moowoodle')}
			desc={__(
				'Most problems are a broken connection or a failed sync. Still stuck? We are a message away.',
				'moowoodle'
			)}
		>
			<div className="mw-dash-help-groups">
				<section>
					<h3>{__('Troubleshoot first', 'moowoodle')}</h3>
					<ul className="mw-dash-list">
						{TROUBLESHOOT.map((item) => (
							<LinkRow key={item.title} item={item} />
						))}
					</ul>
				</section>
				<section>
					<h3>{__('Talk to our team', 'moowoodle')}</h3>
					<ul className="mw-dash-list">
						{CONTACT.map((item) => (
							<LinkRow key={item.title} item={item} />
						))}
					</ul>
				</section>
			</div>
		</CardComponent>
	);

	const teamCard = (
		<CardComponent
			title={__('More from the MooWoodle team', 'moowoodle')}
			desc={__('Free plugins for your WooCommerce store', 'moowoodle')}
		>
			<ul className="mw-dash-list">
				{COMPANION_PLUGINS.map((companion) => {
					const isActive = !!pluginStatus[companion.slug];
					const isBusy = installing === companion.slug;

					return (
						<li key={companion.slug} className="mw-dash-row">
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
										installOrActivatePlugin(companion.slug)
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
		</CardComponent>
	);

	// Insights decides where these sit: beside the setup card on a new site, under the figures once there are some.
	return (
		<Insights
			pro={proCard}
			learn={learnCard}
			help={helpCard}
			team={teamCard}
		/>
	);
};

export default DashboardTab;
