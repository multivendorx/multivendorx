/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { CardComponent, NoticeManager } from '@zyra/components';
import { __, sprintf } from '@wordpress/i18n';
import axios from 'axios';
import multivendorxIcon from '../../assets/images/multivendorx-icon.png';
import notifimaIcon from '../../assets/images/notifima-icon.png';
import { ProPopupDialog } from '../Popup/Popup';
import Insights from './Insights';
import {
	ACCOUNT_URL,
	COMMUNITY_URL,
	CONTACT_URL,
	DOCS_URL,
	EXPERTS_URL,
	UTM,
} from '../../services/links';

interface WPPlugin {
	plugin?: string;
	status?: string;
}

/** The Pro features the dashboard's Pro panel lists (free sites only). */
const PRO_FEATURES = [
	{
		icon: 'quote',
		title: __('Professional quotations', 'catalogx'),
		desc: __(
			'Price a request, send it as a quote with an expiry date, and let the customer accept it online.',
			'catalogx'
		),
	},
	{
		icon: 'wholesale',
		title: __('Wholesale selling', 'catalogx'),
		desc: __(
			'Approve wholesale buyers and give them their own prices and order form.',
			'catalogx'
		),
	},
	{
		icon: 'rules',
		title: __('Dynamic pricing rules', 'catalogx'),
		desc: __(
			'Set prices by role, customer, product, category or quantity.',
			'catalogx'
		),
	},
	{
		icon: 'multi-product',
		title: __('Multi-product enquiries', 'catalogx'),
		desc: __(
			'Customers add several products to one enquiry instead of sending one each.',
			'catalogx'
		),
	},
	{
		icon: 'enquiry',
		title: __('Enquiry inbox', 'catalogx'),
		desc: __(
			'Reply to every enquiry from one place, with files, tags and a quote button.',
			'catalogx'
		),
	},
	{
		icon: 'form-email',
		title: __('Form builder', 'catalogx'),
		desc: __(
			'Enquiry, quote and wholesale forms that ask exactly what you need to know.',
			'catalogx'
		),
	},
];

interface HelpLink {
	icon: string;
	title: string;
	desc: string;
	/** Absolute URL (opens in a new tab), `#&tab=…` for a screen of this admin page, or a wp-admin page. */
	link: string;
}

/** Learning CatalogX on your own: the docs, the setup wizard and the community. */
const LEARN: HelpLink[] = [
	{
		icon: 'knowledgebase',
		title: __('Documentation', 'catalogx'),
		desc: __(
			'Guides for catalog mode, enquiries, quotes and wholesale.',
			'catalogx'
		),
		link: DOCS_URL,
	},
	{
		icon: 'tools',
		title: __('Setup wizard', 'catalogx'),
		desc: __(
			'Walk through the main choices again, one screen at a time.',
			'catalogx'
		),
		link: `${appLocalizer.url}index.php?page=catalogx-setup`,
	},
	{
		icon: 'global-community',
		title: __('Community', 'catalogx'),
		desc: __(
			'Ask other store owners and our team how they set things up.',
			'catalogx'
		),
		link: COMMUNITY_URL,
	},
];

/** Most problems are a switched-off module or a button hidden by a rule: the screens that show which. */
const TROUBLESHOOT: HelpLink[] = [
	{
		icon: 'module',
		title: __('Check which modules are on', 'catalogx'),
		desc: __(
			'Catalog, Enquiry and Quotation each have to be switched on before their buttons show.',
			'catalogx'
		),
		link: '#&tab=settings&subtab=modules',
	},
	{
		icon: 'exclude',
		title: __('Review the access rules', 'catalogx'),
		desc: __(
			'A button missing on a product is often an exclusion for its category, role or user.',
			'catalogx'
		),
		link: '#&tab=settings&subtab=enquiry-quote-exclusion',
	},
	{
		icon: 'report',
		title: __('Check the logs', 'catalogx'),
		desc: __(
			'Errors CatalogX recorded. Attach them when you contact support.',
			'catalogx'
		),
		link: '#&tab=settings&subtab=tools',
	},
];

/** Ways to reach the team. Manage plan only applies once there is a plan. */
const CONTACT: HelpLink[] = [
	{
		icon: 'customer-support',
		title: __('Contact support', 'catalogx'),
		desc: __(
			'Send our team a ticket and get a reply by email.',
			'catalogx'
		),
		link: CONTACT_URL,
	},
	{
		icon: 'coding',
		title: __('Expert help', 'catalogx'),
		desc: __(
			'Book our team to set up your catalog or build a custom feature.',
			'catalogx'
		),
		link: EXPERTS_URL,
	},
	...(appLocalizer.khali_dabba
		? [
				{
					icon: 'person',
					title: __('Manage plan', 'catalogx'),
					desc: __(
						'Download CatalogX Pro, manage license keys and renew.',
						'catalogx'
					),
					link: ACCOUNT_URL,
				},
			]
		: []),
];

/** The team's other WooCommerce plugins: the wordpress.org slug decides installed/active, the Pro link replaces Install once active. */
const COMPANION_PLUGINS = [
	{
		slug: 'dc-woocommerce-multi-vendor',
		name: 'MultiVendorX',
		desc: __(
			'Turn your store into a marketplace where other sellers list their products.',
			'catalogx'
		),
		logo: multivendorxIcon,
		proUrl: `https://multivendorx.com/pricing/?${UTM}`,
	},
	{
		slug: 'woocommerce-product-stock-alert',
		name: 'Notifima',
		desc: __(
			'Back-in-stock alerts and wishlists for WooCommerce.',
			'catalogx'
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
			className="cx-dash-row"
			href={item.link}
			{...(isExternal(item.link)
				? { target: '_blank', rel: 'noopener noreferrer' }
				: {})}
		>
			<span className="cx-dash-icon" aria-hidden="true">
				<i className={`adminfont-${item.icon}`} />
			</span>
			<span className="cx-dash-row-text">
				<strong>{item.title}</strong>
				<span>{item.desc}</span>
			</span>
			<i
				className={`cx-dash-row-arrow adminfont-${isExternal(item.link) ? 'external' : 'arrow-right'}`}
				aria-hidden="true"
			/>
			{isExternal(item.link) && (
				<span className="screen-reader-text">
					{__('(opens in a new tab)', 'catalogx')}
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
				title: __('Redirecting...', 'catalogx'),
				message: __(
					'Plugin already installed. Redirecting to activate...',
					'catalogx'
				),
				type: 'info',
				position: 'float',
			});

			window.open(`${appLocalizer.url}plugins.php?s=${slug}`, '_blank');
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
					title: __('Error!', 'catalogx'),
					message: sprintf(
						/* translators: %s: Plugin slug or plugin name. */
						__('Could not install "%s".', 'catalogx'),
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
			title={__('Do more with CatalogX Pro', 'catalogx')}
			desc={__(
				'Quotations, wholesale selling, pricing rules and an enquiry inbox, in the admin you already use.',
				'catalogx'
			)}
			className="cx-dash-pro"
			action={
				<span className="cx-dash-pro-cta">
					<span>
						{__('15-day money-back guarantee', 'catalogx')}
					</span>
					<button
						type="button"
						className="admin-btn btn-purple-bg"
						onClick={() => setProPopupOpen(true)}
					>
						<i className="adminfont-pro-tag" aria-hidden="true" />
						{__('Upgrade to Pro', 'catalogx')}
					</button>
				</span>
			}
		>
			<ul className="cx-dash-pro-features">
				{PRO_FEATURES.map((feature) => (
					<li key={feature.title}>
						<span className="cx-dash-icon" aria-hidden="true">
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

	const learnCard = (
		<CardComponent
			title={__('Learn CatalogX', 'catalogx')}
			desc={__('Guides, the setup wizard and the community', 'catalogx')}
		>
			<ul className="cx-dash-list">
				{LEARN.map((item) => (
					<LinkRow key={item.title} item={item} />
				))}
			</ul>
		</CardComponent>
	);

	// Links to `#&tab=dashboard&view=help-support` scroll to this card.
	const helpCard = (
		<CardComponent
			id="catalogx-help-support"
			title={__('Help & Support', 'catalogx')}
			desc={__(
				'Most problems are a module that is off or a rule that hides the button. Still stuck? We are a message away.',
				'catalogx'
			)}
		>
			<div className="cx-dash-help-groups">
				<section>
					<h3>{__('Troubleshoot first', 'catalogx')}</h3>
					<ul className="cx-dash-list">
						{TROUBLESHOOT.map((item) => (
							<LinkRow key={item.title} item={item} />
						))}
					</ul>
				</section>
				<section>
					<h3>{__('Talk to our team', 'catalogx')}</h3>
					<ul className="cx-dash-list">
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
			title={__('More from the CatalogX team', 'catalogx')}
			desc={__('Free plugins for your WooCommerce store', 'catalogx')}
		>
			<ul className="cx-dash-list">
				{COMPANION_PLUGINS.map((companion) => {
					const isActive = !!pluginStatus[companion.slug];
					const isBusy = installing === companion.slug;

					return (
						<li key={companion.slug} className="cx-dash-row">
							<img
								className="cx-dash-logo"
								src={companion.logo}
								alt=""
							/>
							<span className="cx-dash-row-text">
								<strong>
									{companion.name}
									<span
										className={`cx-dash-tag ${isActive ? 'is-active' : 'is-free'}`}
									>
										{isActive
											? __('Active', 'catalogx')
											: __('Free', 'catalogx')}
									</span>
								</strong>
								<span>{companion.desc}</span>
							</span>
							{isActive ? (
								<a
									className="cx-dash-action"
									href={companion.proUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									{sprintf(
										/* translators: %s: plugin name. */
										__('Get %s Pro', 'catalogx'),
										companion.name
									)}
									<span className="screen-reader-text">
										{__('(opens in a new tab)', 'catalogx')}
									</span>
								</a>
							) : (
								<button
									type="button"
									className="cx-dash-action"
									disabled={!!installing}
									onClick={() =>
										installOrActivatePlugin(companion.slug)
									}
								>
									{isBusy
										? __('Installing…', 'catalogx')
										: __('Install', 'catalogx')}
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
