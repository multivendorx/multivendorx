/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import {
	CardComponent,
	ModuleGridComponent,
	NoticeManager,
} from '@zyra/components';
import { __, sprintf } from '@wordpress/i18n';
import axios from 'axios';
import catalogxIcon from '../../assets/images/catalogx.png';
import notifimaIcon from '../../assets/images/brand-icon.png';
import ShowProPopup, { ProPopupDialog } from '../Popup/Popup';
import { MODULE_GRID_LABELS } from '../Modules/Modules';
import { getModuleData } from '../../services/templateService';
import Insights, { MarketplaceStage } from './Insights';
import { PRO_FEATURES } from '../../services/proFeatures';
import {
	COMMUNITY_URL,
	DISCORD_URL,
	DOCS_URL,
	EXPERTS_URL,
	FACEBOOK_URL,
	FAQS_URL,
	LIVE_CHAT_URL,
	SUPPORT_URL,
	UTM,
	WPORG_FORUM_URL,
	YOUTUBE_URL,
} from '../../services/links';

interface WPPlugin {
	plugin?: string;
	status?: string;
}

interface HelpLink {
	icon: string;
	title: string;
	desc: string;
	/** Absolute URL (opens in a new tab), `#&tab=…` for a screen of this admin page, or a wp-admin page. */
	link: string;
}

/** Learning MultiVendorX on your own: the docs, the setup wizard and the communities. */
const LEARN: HelpLink[] = [
	{
		icon: 'knowledgebase',
		title: __('Documentation', 'multivendorx'),
		desc: __(
			'Step-by-step guides to set up and run your marketplace.',
			'multivendorx'
		),
		link: DOCS_URL,
	},
	{
		icon: 'faq',
		title: __('FAQs', 'multivendorx'),
		desc: __(
			'Quick answers to the questions marketplace owners ask most.',
			'multivendorx'
		),
		link: FAQS_URL,
	},
	{
		icon: 'youtube',
		title: __('Video tutorials', 'multivendorx'),
		desc: __(
			'Watch setup, store management and payments explained on YouTube.',
			'multivendorx'
		),
		link: YOUTUBE_URL,
	},
	{
		icon: 'tools',
		title: __('Setup wizard', 'multivendorx'),
		desc: __(
			'Walk through the main choices again, one screen at a time.',
			'multivendorx'
		),
		link: `${appLocalizer.admin_url}admin.php?page=multivendorx-setup`,
	},
	{
		icon: 'global-community',
		title: __('Developer community', 'multivendorx'),
		desc: __(
			'Talk to our team and other builders on Discord.',
			'multivendorx'
		),
		link: DISCORD_URL,
	},
	{
		icon: 'user-circle',
		title: __('Facebook group', 'multivendorx'),
		desc: __('Share tips with other marketplace owners.', 'multivendorx'),
		link: FACEBOOK_URL,
	},
];

/** Most problems are a switched-off module or a missing store capability: the screens that show which. */
const TROUBLESHOOT: HelpLink[] = [
	{
		icon: 'module',
		title: __('Check which modules are on', 'multivendorx'),
		desc: __(
			'A feature and its settings only appear once its module is switched on.',
			'multivendorx'
		),
		link: '#&tab=settings&subtab=modules',
	},
	{
		icon: 'wholesale',
		title: __('Review store permissions', 'multivendorx'),
		desc: __(
			'A store missing a menu or an action is often a capability its role doesn’t have.',
			'multivendorx'
		),
		link: '#&tab=settings&subtab=store-permissions',
	},
	{
		icon: 'report',
		title: __('Check the log', 'multivendorx'),
		desc: __(
			'Errors MultiVendorX recorded. Attach them when you contact support.',
			'multivendorx'
		),
		link: '#&tab=settings&subtab=log',
	},
];

/** Ways to reach the team. */
const CONTACT: HelpLink[] = [
	{
		icon: 'customer-support',
		title: __('Support forum', 'multivendorx'),
		desc: __(
			'Ask our team and get an answer in the forum.',
			'multivendorx'
		),
		link: SUPPORT_URL,
	},
	{
		icon: 'live-chat',
		title: __('Live chat', 'multivendorx'),
		desc: __(
			'Chat with our team for setup and troubleshooting help.',
			'multivendorx'
		),
		link: LIVE_CHAT_URL,
	},
	{
		icon: 'wordpress',
		title: __('WordPress.org forum', 'multivendorx'),
		desc: __(
			'Ask in the free plugin’s public support forum.',
			'multivendorx'
		),
		link: WPORG_FORUM_URL,
	},
	{
		icon: 'preview',
		title: __('Expert consultation', 'multivendorx'),
		desc: __(
			'Book our marketplace specialists for setup advice or a custom feature.',
			'multivendorx'
		),
		link: EXPERTS_URL,
	},
	{
		icon: 'global-community',
		title: __('Community', 'multivendorx'),
		desc: __(
			'See how other marketplace owners set things up.',
			'multivendorx'
		),
		link: COMMUNITY_URL,
	},
];

/** The team's other WooCommerce plugins: the wordpress.org slug decides installed/active, the Pro link replaces Install once active. */
const COMPANION_PLUGINS = [
	{
		slug: 'woocommerce-catalog-enquiry',
		name: 'CatalogX',
		desc: __(
			'Turn your store into a product catalog with enquiry-based sales.',
			'multivendorx'
		),
		logo: catalogxIcon,
		proUrl: `https://catalogx.com/pricing/?${UTM}`,
	},
	{
		slug: 'woocommerce-product-stock-alert',
		name: 'Notifima',
		desc: __(
			'Back-in-stock alerts and wishlists for WooCommerce.',
			'multivendorx'
		),
		logo: notifimaIcon,
		proUrl: `https://notifima.com/pricing/?${UTM}`,
	},
];

const isExternal = (link: string) => /^https?:\/\//.test(link);

/** One help row: icon, title and description, the whole row a link (external ones open in a new tab). */
const LinkRow = ({ item }: { item: HelpLink }) => (
	<li>
		<a
			className="mvx-dash-row"
			href={item.link}
			{...(isExternal(item.link)
				? { target: '_blank', rel: 'noopener noreferrer' }
				: {})}
		>
			<span className="mvx-dash-icon" aria-hidden="true">
				<i className={`adminfont-${item.icon}`} />
			</span>
			<span className="mvx-dash-row-text">
				<strong>{item.title}</strong>
				<span>{item.desc}</span>
			</span>
			<i
				className={`mvx-dash-row-arrow adminfont-${isExternal(item.link) ? 'external' : 'arrow-right'}`}
				aria-hidden="true"
			/>
			{isExternal(item.link) && (
				<span className="screen-reader-text">
					{__('(opens in a new tab)', 'multivendorx')}
				</span>
			)}
		</a>
	</li>
);

/**
 * The Overview tab: builds the Learn, Help & Support, companion-plugin and (free sites) Pro cards, and hands them to
 * Insights.tsx, which places them around the setup card or the figures.
 */
interface DashboardTabProps {
	/** The reporting period in days (the switch beside the tabs). */
	days: number;
	/** Told the marketplace's stage once the figures load (see AdminDashboard's welcome block). */
	onStage?: (stage: MarketplaceStage) => void;
}

const DashboardTab: React.FC<DashboardTabProps> = ({ days, onStage }) => {
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
				title: __('Redirecting...', 'multivendorx'),
				message: __(
					'Plugin already installed. Redirecting to activate...',
					'multivendorx'
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
					title: __('Error!', 'multivendorx'),
					message: sprintf(
						/* translators: %s: Plugin slug or plugin name. */
						__('Could not install "%s".', 'multivendorx'),
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
			title={__('Do more with MultiVendorX Pro', 'multivendorx')}
			desc={__(
				'Memberships, verified stores, bookings and subscriptions, in the admin you already use.',
				'multivendorx'
			)}
			className="mvx-dash-pro"
			action={
				<span className="mvx-dash-pro-cta">
					<span>{__('Starting at $299/year', 'multivendorx')}</span>
					<button
						type="button"
						className="admin-btn btn-purple-bg"
						onClick={() => setProPopupOpen(true)}
					>
						<i className="adminfont-pro-tag" aria-hidden="true" />
						{__('Upgrade to Pro', 'multivendorx')}
					</button>
				</span>
			}
		>
			<ul className="mvx-dash-pro-features">
				{PRO_FEATURES.map((feature) => (
					<li key={feature.title}>
						<span className="mvx-dash-icon" aria-hidden="true">
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
				<ProPopupDialog onClose={() => setProPopupOpen(false)} />
			)}
		</CardComponent>
	);

	// Learning, troubleshooting and the team in one card, three columns of the same rows. Links to
	// `#&tab=dashboard&view=help-support` scroll to it.
	const helpCard = (
		<CardComponent
			id="multivendorx-help-support"
			className="mvx-dash-help"
			title={__('Help & resources', 'multivendorx')}
			desc={__(
				'Learn MultiVendorX, check the usual causes when something is missing, or ask us.',
				'multivendorx'
			)}
		>
			<div className="mvx-dash-help-groups">
				<section>
					<h3>{__('Learn', 'multivendorx')}</h3>
					<ul className="mvx-dash-list">
						{LEARN.map((item) => (
							<LinkRow key={item.title} item={item} />
						))}
					</ul>
				</section>
				<section>
					<h3>{__('Troubleshoot first', 'multivendorx')}</h3>
					<ul className="mvx-dash-list">
						{TROUBLESHOOT.map((item) => (
							<LinkRow key={item.title} item={item} />
						))}
					</ul>
				</section>
				<section>
					<h3>{__('Talk to our team', 'multivendorx')}</h3>
					<ul className="mvx-dash-list">
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
			title={__('More from the MultiVendorX team', 'multivendorx')}
			desc={__('Free plugins for your WooCommerce store', 'multivendorx')}
		>
			<ul className="mvx-dash-list">
				{COMPANION_PLUGINS.map((companion) => {
					const isActive = !!pluginStatus[companion.slug];
					const isBusy = installing === companion.slug;

					return (
						<li key={companion.slug} className="mvx-dash-row">
							<img
								className="mvx-dash-logo"
								src={companion.logo}
								alt=""
							/>
							<span className="mvx-dash-row-text">
								<strong>
									{companion.name}
									<span
										className={`mvx-dash-tag ${isActive ? 'is-active' : 'is-free'}`}
									>
										{isActive
											? __('Active', 'multivendorx')
											: __('Free', 'multivendorx')}
									</span>
								</strong>
								<span>{companion.desc}</span>
							</span>
							{isActive ? (
								<a
									className="mvx-dash-action"
									href={companion.proUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									{sprintf(
										/* translators: %s: plugin name. */
										__('Get %s Pro', 'multivendorx'),
										companion.name
									)}
									<span className="screen-reader-text">
										{__(
											'(opens in a new tab)',
											'multivendorx'
										)}
									</span>
								</a>
							) : (
								<button
									type="button"
									className="mvx-dash-action"
									disabled={!!installing}
									onClick={() =>
										installOrActivatePlugin(companion.slug)
									}
								>
									{isBusy
										? __('Installing…', 'multivendorx')
										: __('Install', 'multivendorx')}
								</button>
							)}
						</li>
					);
				})}
			</ul>
		</CardComponent>
	);

	// The most-used modules as quick switches (the ones marked `miniModule` in Modules/index.ts); every module is
	// under Settings → Modules.
	const modulesCard = (
		<CardComponent
			title={__('Modules', 'multivendorx')}
			desc={__(
				'Switch the features your marketplace uses on and off.',
				'multivendorx'
			)}
			action={
				<a
					className="mvx-insights-more"
					href="#&tab=settings&subtab=modules"
				>
					{__('View all', 'multivendorx')}
					<i className="adminfont-arrow-right" aria-hidden="true" />
				</a>
			}
		>
			<ModuleGridComponent
				modulesArray={getModuleData()}
				apiLink="modules"
				pluginName="multivendorx"
				proPopupContent={ShowProPopup}
				labels={MODULE_GRID_LABELS}
				variant="mini-module"
			/>
		</CardComponent>
	);

	// Insights decides where these sit: beside the setup card on a new site, under the figures once there are some.
	return (
		<Insights
			days={days}
			onStage={onStage}
			modules={modulesCard}
			pro={proCard}
			help={helpCard}
			team={teamCard}
		/>
	);
};

export default DashboardTab;
