/* global appLocalizer */
import React from 'react';
import { __ } from '@wordpress/i18n';
import { ButtonInput } from '@zyra/inputs';
import {
	CardComponent,
	ColumnComponent,
	ContainerComponent,
	ListComponent,
	ModuleGridComponent,
	ModuleGuardComponent,
} from '@zyra/components';
import { getModuleData } from '../../services/templateService';
import proPopupContent from '../../components/Popup/Popup';
import proModulesCatalog from '../../components/Modules';
import { usePluginStatus } from './usePluginStatus';
import VuloPilotLogo from '../../assets/images/vulopilot-logo.svg';
import catalogxLogo from '../../assets/images/catalogx.png';
import notifimaLogo from '../../assets/images/notifima-icon.png';
import './WelcomeSection.scss';

/** Icon per pro module id, matching the `adminfont-*` names already used
 * elsewhere in this plugin for the same concepts (dashboard widget icons,
 * GEO's own Popup.tsx entry) rather than inventing new ones. */
const FEATURE_ICONS: Record<string, string> = {
	automation: 'automation',
	'security-monitoring': 'security',
	'woo-commerce-ai': 'ai',
	'advanced-reports': 'report',
	'one-click-fix': 'check',
	'geo-insights': 'globe',
};

/**
 * CatalogX and Notifima only, per this task's explicit scope — with REAL install/active status via
 * `usePluginStatus` — both are the same publisher as VuloPilot
 * (MultiVendorX/dualcube, confirmed via the plugin header's Author URI),
 * so cross-promoting them is a real relationship, not fabricated. `slug`
 * is the folder-slug substring `/wp/v2/plugins` reports (verified against
 * each plugin's own `package.json` `pluginSlug` and a hardcoded reference
 * in a sibling plugin's PHP — `catalogx/classes/Promotions.php` for
 * CatalogX, `catalogx/classes/Utill.php` for Notifima); `pluginFile` is
 * the full `folder/main-file.php` path the activate endpoint needs.
 */
const TRACKED_EXTEND_PRODUCTS = [
	{
		title: __('CatalogX', 'vulopilot'),
		desc: __(
			'Convert your WooCommerce store into a catalog website in a click.',
			'vulopilot'
		),
		img: catalogxLogo,
		slug: 'woocommerce-catalog-enquiry',
		pluginFile: 'woocommerce-catalog-enquiry/Woocommerce_Catalog_Enquiry.php',
		adminPage: 'catalogx',
	},
	{
		title: __('Notifima', 'vulopilot'),
		desc: __(
			'Boost sales with real-time stock alerts and simplified stock data management.',
			'vulopilot'
		),
		img: notifimaLogo,
		slug: 'woocommerce-product-stock-alert',
		pluginFile: 'woocommerce-product-stock-alert/product_stock_alert.php',
		adminPage: 'notifima',
	},
];

/**
 * Same destinations MultiVendorX's own "Need help getting started?" card
 * links to (`DashboardTab.tsx`'s `resources` array) — VuloPilot has no
 * confirmed docs/Discord/Facebook URLs of its own anywhere in this
 * codebase (checked readme.txt, plugin header, config.php,
 * `global.d.ts`), and this task's clarifying-question answer was to
 * reuse the same-publisher destinations rather than invent VuloPilot-
 * specific ones. `utm_campaign` is set to `vulopilot` (not
 * `multivendorx`) so traffic from this dashboard is attributed
 * correctly, matching the pattern `config.php`'s own
 * `VULOPILOT_PRO_SHOP_URL` already uses.
 */
export const HELP_RESOURCES = [
	{
		title: __('Documentation', 'vulopilot'),
		desc: __(
			'Step-by-step guides to set up and manage your website.',
			'vulopilot'
		),
		iconClass: 'knowledgebase',
		linkText: __('Explore Docs', 'vulopilot'),
		href: 'https://multivendorx.com/docs/knowledgebase/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=vulopilot',
	},
	{
		title: __('Expert consultation', 'vulopilot'),
		desc: __(
			'Get tailored advice from our team.',
			'vulopilot'
		),
		iconClass: 'preview',
		linkText: __('Book Consultation', 'vulopilot'),
		href: 'https://multivendorx.com/custom-development/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=vulopilot',
	},
	{
		title: __('Developer community', 'vulopilot'),
		desc: __(
			'Connect with our team and fellow builders on Discord.',
			'vulopilot'
		),
		iconClass: 'global-community',
		linkText: __('Join Discord', 'vulopilot'),
		href: 'https://discord.com/channels/1376811097134469191/1376811102020829258',
	},
	{
		title: __('Facebook group', 'vulopilot'),
		desc: __(
			'Share experiences and tips with other website owners.',
			'vulopilot'
		),
		iconClass: 'user-circle',
		linkText: __('Join Group', 'vulopilot'),
		href: 'https://www.facebook.com/groups/226246620006065/',
	},
];

/**
 * The static, non-widget section at the top of the Dashboard — modeled
 * directly on the free multivendorx plugin's own admin dashboard welcome
 * page (`components/AdminDashboard/DashboardTab.tsx`): a `grid={8}` left
 * column (welcome banner, upgrade-to-pro feature card when not licensed,
 * Modules card) and a `grid={4}` right column ("Extend your website",
 * "Need help getting started?") — same two-column layout, same
 * `ListComponent`/`CardComponent` shapes. Its only real state is
 * `usePluginStatus`'s install/active tracking for the "Extend your
 * website" card — everything else is derived from static catalogs.
 */
const WelcomeSection: React.FC = () => {
	const isPro = !!appLocalizer.khali_dabba;

	const renderUpgradeButton = (label: string) => {
		if (isPro) {
			return null;
		}
		return (
			<a
				href={appLocalizer.shop_url}
				target="_blank"
				rel="noopener noreferrer"
				className="admin-btn btn-purple"
			>
				<i className="adminfont-pro-tag" />
				{label}
				<i className="adminfont-arrow-right icon-pro-btn" />
			</a>
		);
	};

	const proModules = proModulesCatalog.modules.filter(
		(module): module is typeof module & { id: string; name: string; desc: string } =>
			'proModule' in module && !!module.proModule
	);

	const miniModules = proModules.filter(
		(module) => 'miniModule' in module && !!module.miniModule
	);

	const { status: extendStatus, install, activate } = usePluginStatus(
		TRACKED_EXTEND_PRODUCTS
	);

	return (
		<ContainerComponent general>
			<ColumnComponent grid={8}>
				<CardComponent>
					<div className="dashboard-welcome-banner">
						<div className="content">
							<div className="heading">
								{__('Welcome to VuloPilot', 'vulopilot')}
							</div>
							<div className="description">
								{__(
									"Monitor your site's health, fix issues with AI, and stay ahead of SEO, security, and accessibility problems — all from one dashboard.",
									'vulopilot'
								)}
							</div>
							<div className="button-wrapper">
								{renderUpgradeButton(
									__('Upgrade Now', 'vulopilot')
								)}
							</div>
						</div>
						<div className="image">
							<img src={VuloPilotLogo} alt="" />
						</div>
					</div>
				</CardComponent>

				{!isPro && (
					<CardComponent
						title={__('Unlock premium features', 'vulopilot')}
						desc={__(
							'Automations, AI-powered fixes, deeper security monitoring, and historical reporting.',
							'vulopilot'
						)}
					>
						<ListComponent
							className="feature-list"
							items={proModules.map((module) => ({
								icon: FEATURE_ICONS[module.id] ?? 'pro-tag',
								title: module.name,
								desc: module.desc,
							}))}
						/>
						<div className="dashboard-welcome-upgrade">
							{renderUpgradeButton(
								__('Upgrade Now', 'vulopilot')
							)}
						</div>
					</CardComponent>
				)}

				<CardComponent
					title={__('Modules', 'vulopilot')}
					action={
						<ButtonInput
							buttons={[
								{
									icon: 'eye',
									text: __('View All', 'vulopilot'),
									color: 'purple',
									onClick: () => {
										window.location.href =
											'?page=vulopilot#&tab=modules';
									},
								},
							]}
						/>
					}
				>
					{miniModules.length > 0 ? (
						<ModuleGridComponent
							modulesArray={getModuleData()}
							appLocalizer={appLocalizer}
							apiLink="modules"
							proPopupContent={proPopupContent}
							pluginName="vulopilot"
							variant="mini-module"
						/>
					) : (
						<ModuleGuardComponent
							icon="module"
							title={__('No modules available', 'vulopilot')}
							desc={__(
								'Modules will appear here once available.',
								'vulopilot'
							)}
						/>
					)}
				</CardComponent>
			</ColumnComponent>

			<ColumnComponent grid={4}>
				<CardComponent title={__('Extend your website', 'vulopilot')}>
					<ColumnComponent row>
						{TRACKED_EXTEND_PRODUCTS.map((product) => {
							const entry = extendStatus[product.slug];
							const isActive = !!entry?.active;
							const isInstalled = !!entry?.installed;
							const isBusy = !!entry?.busy;

							const statusLabel = isActive
								? __('Active', 'vulopilot')
								: isInstalled
									? __('Installed', 'vulopilot')
									: __('Not Installed', 'vulopilot');
							const statusModifier = isActive
								? 'status-active'
								: isInstalled
									? 'status-installed'
									: 'status-not-installed';

							return (
								<ListComponent
									key={product.slug}
									className="mini-card"
									background
									items={[
										{
											title: product.title,
											desc: product.desc,
											img: product.img,
											tags: (
												<>
													<span
														className={`admin-badge ${statusModifier}`}
													>
														{statusLabel}
													</span>
													{isActive ? (
														<a
															href={`${appLocalizer.admin_url}admin.php?page=${product.adminPage}`}
														>
															{__('Open', 'vulopilot')}
														</a>
													) : (
														<a
															href="#"
															onClick={(e) => {
																e.preventDefault();
																if (isBusy) {
																	return;
																}
																if (isInstalled) {
																	activate(
																		product.slug
																	);
																} else {
																	install(
																		product.slug
																	);
																}
															}}
															style={{
																pointerEvents: isBusy
																	? 'none'
																	: 'auto',
																opacity: isBusy
																	? 0.6
																	: 1,
															}}
														>
															{isBusy
																? __(
																		'Please wait…',
																		'vulopilot'
																	)
																: isInstalled
																	? __(
																			'Activate',
																			'vulopilot'
																		)
																	: __(
																			'Install',
																			'vulopilot'
																		)}
														</a>
													)}
												</>
											),
										},
									]}
								/>
							);
						})}
					</ColumnComponent>
				</CardComponent>

				<CardComponent
					title={__('Need help getting started?', 'vulopilot')}
				>
					<div className="quick-link">
						{HELP_RESOURCES.map((resource) => (
							<ListComponent
								key={resource.title}
								className="mini-card list"
								border
								items={[
									{
										title: resource.title,
										desc: resource.desc,
										icon: resource.iconClass,
										tags: (
											<a
												href={resource.href}
												target="_blank"
												rel="noopener noreferrer"
											>
												{resource.linkText}
												<i className="adminfont-external" />
											</a>
										),
									},
								]}
							/>
						))}
					</div>
				</CardComponent>
			</ColumnComponent>
		</ContainerComponent>
	);
};

export default WelcomeSection;
