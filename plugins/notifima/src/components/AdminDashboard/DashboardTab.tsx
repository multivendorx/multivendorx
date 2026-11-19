/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import {
	CardComponent,
	ColumnComponent,
	ListComponent,
	ContainerComponent,
	NoticeManager,
	InformationItemComponent,
	IconComponent,
} from '@zyra/components';
import { __, sprintf } from '@wordpress/i18n';
import axios from 'axios';
import catalogx from '../../assets/images/catalogx.png';
import multivendorx from '../../assets/images/multivendorx.png';
import ShowProPopup, { PRO_FEATURES } from '../Popup/Popup';
import Insights from './Insights';
import {
	ACCOUNT_URL,
	CONSULTATION_URL,
	CONTACT_URL,
	DOCS_URL,
	UTM,
} from '../../services/links';

interface WPPlugin {
	plugin?: string;
	status?: string;
}

interface HelpLink {
	icon: string;
	title: string;
	desc: string;
	/** Absolute URL (opens in a new tab), or `#&tab=…` for a screen of this admin page. */
	link: string;
}

/** Learning Notifima on your own: the docs, the community forum and a call with the team. */
const LEARN: HelpLink[] = [
	{
		icon: 'knowledgebase',
		title: __('Documentation', 'notifima'),
		desc: __(
			'Guides for the subscription form, the emails and every setting.',
			'notifima'
		),
		link: DOCS_URL,
	},
	{
		icon: 'forum',
		title: __('Community forum', 'notifima'),
		desc: __(
			'Ask on WordPress.org and get answers from our team and other users.',
			'notifima'
		),
		link: 'https://wordpress.org/support/plugin/woocommerce-product-stock-alert/',
	},
	{
		icon: 'customer-support',
		title: __('Expert consultation', 'notifima'),
		desc: __(
			'Book a free call for advice tailored to your store.',
			'notifima'
		),
		link: CONSULTATION_URL,
	},
];

/** Most problems are an email that isn't sent or a form that doesn't show: the two screens that decide which. */
const TROUBLESHOOT: HelpLink[] = [
	{
		icon: 'mail',
		title: __('Check the back-in-stock email', 'notifima'),
		desc: __(
			'Make sure it is enabled in WooCommerce, and preview what subscribers receive.',
			'notifima'
		),
		link: `${appLocalizer.admin_url}admin.php?page=wc-settings&tab=email`,
	},
	{
		icon: 'automation',
		title: __('Review who sees the form', 'notifima'),
		desc: __(
			'Guests or logged-in shoppers only, out-of-stock or backorder products too.',
			'notifima'
		),
		link: '#&tab=settings&subtab=automation',
	},
];

/** Ways to reach the team. Manage plan only applies once there is a plan. */
const CONTACT: HelpLink[] = [
	{
		icon: 'customer-support',
		title: __('Contact support', 'notifima'),
		desc: __(
			'Send our team a message and get a reply by email.',
			'notifima'
		),
		link: CONTACT_URL,
	},
	...(appLocalizer.khali_dabba
		? [
				{
					icon: 'person',
					title: __('Manage plan', 'notifima'),
					desc: __(
						'Download Notifima Pro, manage license keys and renew.',
						'notifima'
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
			'notifima'
		),
		logo: catalogx,
		proUrl: `https://catalogx.com/pricing/?${UTM}`,
	},
	{
		slug: 'dc-woocommerce-multi-vendor',
		name: 'MultiVendorX',
		desc: __(
			'Let other sellers open stores on your WooCommerce site.',
			'notifima'
		),
		logo: multivendorx,
		proUrl: `https://multivendorx.com/pricing/?${UTM}`,
	},
];

const isExternal = (link: string) => !link.startsWith('#');

/** One help row: icon, title and description, the whole row a link (external ones open in a new tab). */
const LinkRow = ({ item }: { item: HelpLink }) => (
	<li>
		<a
			className="nf-dash-row"
			href={item.link}
			{...(isExternal(item.link)
				? { target: '_blank', rel: 'noopener noreferrer' }
				: {})}
		>
			<span className="nf-dash-icon" aria-hidden="true">
				<i className={`adminfont-${item.icon}`} />
			</span>
			<span className="nf-dash-row-text">
				<strong>{item.title}</strong>
				<span>{item.desc}</span>
			</span>
			<i
				className={`nf-dash-row-arrow adminfont-${isExternal(item.link) ? 'external' : 'arrow-right'}`}
				aria-hidden="true"
			/>
			{isExternal(item.link) && (
				<span className="screen-reader-text">
					{__('(opens in a new tab)', 'notifima')}
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
				uniqueKey: `notifima-plugin-redirect-${slug}`,
				title: __('Redirecting...', 'notifima'),
				message: __(
					'Plugin already installed. Redirecting to activate...',
					'notifima'
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
					uniqueKey: `notifima-plugin-install-${slug}`,
					title: __('Error!', 'notifima'),
					message: sprintf(
						/* translators: %s: Plugin slug or plugin name. */
						__('Could not install "%s".', 'notifima'),
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
			title={__('Do more with Notifima Pro', 'notifima')}
			desc={__(
				'Cleaner waitlists, a full subscriber list, Mailchimp and an inventory manager, in the admin you already use.',
				'notifima'
			)}
			className="nf-dash-pro"
			action={
				<span className="nf-dash-pro-cta">
					<span>
						{__('15-day money-back guarantee', 'notifima')}
					</span>
					<button
						type="button"
						className="admin-btn btn-purple-bg"
						onClick={() => setProPopupOpen(true)}
					>
						<i className="adminfont-pro-tag" aria-hidden="true" />
						{__('Upgrade to Pro', 'notifima')}
					</button>
				</span>
			}
		>
			<ul className="nf-dash-pro-features">
				{/* The first six of the features the Pro popup lists, so the two never disagree. */}
				{PRO_FEATURES.slice(0, 6).map((feature) => (
					<li key={feature.name}>
						<span className="nf-dash-icon" aria-hidden="true">
							<i className={`adminfont-${feature.icon}`} />
						</span>
						<span>
							<strong>{feature.name}</strong>
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
			title={__('Learn Notifima', 'notifima')}
			desc={__('Guides, the community and our team', 'notifima')}
		>
			<ul className="nf-dash-list">
				{LEARN.map((item) => (
					<LinkRow key={item.title} item={item} />
				))}
			</ul>
		</CardComponent>
	);

	// Help & Support links (`#&tab=dashboard&view=help-support`, from the header search) scroll to this card.
	const helpCard = (
		<CardComponent
			id="notifima-help-support"
			title={__('Help & Support', 'notifima')}
			desc={__(
				'Most problems are an email that isn’t sent or a form that doesn’t show. Still stuck? We are a message away.',
				'notifima'
			)}
		>
			<div className="nf-dash-help-groups">
				<section>
					<h3>{__('Troubleshoot first', 'notifima')}</h3>
					<ul className="nf-dash-list">
						{TROUBLESHOOT.map((item) => (
							<LinkRow key={item.title} item={item} />
						))}
					</ul>
				</section>
				<section>
					<h3>{__('Talk to our team', 'notifima')}</h3>
					<ul className="nf-dash-list">
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
			title={__('More from the Notifima team', 'notifima')}
			desc={__('Free plugins for your WooCommerce store', 'notifima')}
		>
			<ul className="nf-dash-list">
				{COMPANION_PLUGINS.map((companion) => {
					const isActive = !!pluginStatus[companion.slug];
					const isBusy = installing === companion.slug;

					return (
						<li key={companion.slug} className="nf-dash-row">
							<img
								className="nf-dash-logo"
								src={companion.logo}
								alt=""
							/>
							<span className="nf-dash-row-text">
								<strong>
									{companion.name}
									<span
										className={`nf-dash-tag ${isActive ? 'is-active' : 'is-free'}`}
									>
										{isActive
											? __('Active', 'notifima')
											: __('Free', 'notifima')}
									</span>
								</strong>
								<span>{companion.desc}</span>
							</span>
							{isActive ? (
								<a
									className="nf-dash-action"
									href={companion.proUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									{sprintf(
										/* translators: %s: plugin name. */
										__('Get %s Pro', 'notifima'),
										companion.name
									)}
									<span className="screen-reader-text">
										{__('(opens in a new tab)', 'notifima')}
									</span>
								</a>
							) : (
								<button
									type="button"
									className="nf-dash-action"
									disabled={!!installing}
									onClick={() =>
										installOrActivatePlugin(companion.slug)
									}
								>
									{isBusy
										? __('Installing…', 'notifima')
										: __('Install', 'notifima')}
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
