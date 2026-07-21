/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import {
	CardComponent,
	LayoutColumnComponent,
	ListComponent,
	ContainerComponent,
	NoticeManager,
} from '@zyra/components';
import { __, sprintf } from '@wordpress/i18n';
import axios from 'axios';
import catalogxIcon from '../../assets/images/catalogx-icon.png';
import multivendorxIcon from '../../assets/images/multivendorx-icon.png';
import notifimaIcon from '../../assets/images/notifima-icon.png';

interface WPPlugin {
	plugin?: string;
	status?: string;
}

const DashboardTab: React.FC<object> = () => {
	const [installing, setInstalling] = useState<string>('');
	const [pluginStatus, setPluginStatus] = useState<{
		[key: string]: boolean;
	}>({});
	const [plugins, setPlugins] = useState<WPPlugin[]>([]);

	const isPro = !!appLocalizer.khali_dabba;

	const renderUpgradeButton = (label = __('Upgrade Now', 'catalogx')) => {
		if (isPro) {
			return null;
		}
		return (
			<a
				href={appLocalizer.pro_url}
				target="_blank"
				className="admin-btn btn-purple"
			>
				<i className="adminfont-pro-tag"></i>
				{label}
				<i className="adminfont-arrow-right icon-pro-btn"></i>
			</a>
		);
	};

	useEffect(() => {
		fetchPlugins();
	}, []);

	const fetchPlugins = () => {
		axios
			.get(`${appLocalizer.apiUrl}/wp/v2/plugins`, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((response) => {
				const pluginList = response.data;

				setPlugins(pluginList);

				const statusMap: Record<string, boolean> = {};

				[
					'dc-woocommerce-multi-vendor',
					'woocommerce-product-stock-alert',
				].forEach((slug) => {
					statusMap[slug] = pluginList.some(
						(plugin: WPPlugin) =>
							plugin.plugin.includes(slug) &&
							plugin.status === 'active'
					);
				});

				setPluginStatus(statusMap);
			})
			.catch((error) => {
				console.error('Failed to fetch plugins:', error);
			});
	};

	const installOrActivatePlugin = (slug: string) => {
		if (!slug || installing) {
			return;
		}

		const isInstalled = plugins.some((p) => p.plugin?.includes(slug));

		if (isInstalled) {
			NoticeManager.add({
				title: __('Redirecting...', 'catalogx'),
				message: __(
					'Plugin already installed. Redirecting to activate...',
					'catalogx'
				),
				type: 'info',
				position: 'float',
			});

			window.open(
				`${appLocalizer.url}plugins.php?s=${slug}`,
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
			.then((res) => {
				setPlugins((prev) => [...prev, res.data]);
				setPluginStatus((prev) => ({ ...prev, [slug]: true }));
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
	const resources = [
		{
			title: __('Documentation', 'catalogx'),
			desc: __(
				'Explore our resources and connect with our team to get the most out of CatalogX.',
				'catalogx'
			),
			iconClass: 'knowledgebase',
			linkText: __('Explore Docs', 'catalogx'),
			href: 'https://catalogx.com/docs/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx',
		},
		{
			title: __('Expert consultation', 'catalogx'),
			desc: __(
				'Get personalized guidance from our WooCommerce specialists for your store setup and growth strategy.',
				'catalogx'
			),
			iconClass: 'preview',
			linkText: __('Book Consultation', 'catalogx'),
			href: 'https://catalogx.com/hire-experts/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx',
		},
	];

	const featuresList = [
		{
			title: __('Turbocharge Your Catalog', 'catalogx'),
			desc: __(
				`Enable catalog mode site-wide or per product, hide prices and 'Add to Cart' until login, and pair it with 'Send Enquiry' to turn visitors into leads.`,
				'catalogx'
			),
			icon: 'commission',
		},
		{
			title: __('Enquiries That Convert', 'catalogx'),
			desc: __(
				`Let customers send enquiries — even on out-of-stock items — with a customizable form, page-builder-ready button, and role-based routing to the right team.`,
				'catalogx'
			),
			icon: 'verification3',
		},
		{
			title: __('Bulk Enquiries, Bigger Sales', 'catalogx'),
			desc: __(
				`Process multiple bulk or high-value enquiries at once with the Enquiry Cart, so you can gauge demand and respond faster across the board.`,
				'catalogx'
			),
			icon: 'marketplace',
		},
		{
			title: __('Quote Like a Pro', 'catalogx'),
			desc: __(
				`Let customers request quotes on any product with a page-builder-ready button, restrict it to registered users, and send branded, easy-to-find quotations.`,
				'catalogx'
			),
			icon: 'vacation',
		},
		{
			title: __('Smart Pricing, Smarter Profits', 'catalogx'),
			desc: __(
				`Create custom roles without coding and apply dynamic, quantity-based pricing and category-wide discounts for each one.`,
				'catalogx'
			),
			icon: 'global-community',
		},
		{
			title: __('Wholesale Made Simple', 'catalogx'),
			desc: __(
				`Set a dedicated wholesale role with separate pricing, hide or show retail prices as needed, block coupon use, and apply flexible amount or percentage discounts.`,
				'catalogx'
			),
			icon: 'notification',
		},
	];

	return (
		<ContainerComponent>
			<LayoutColumnComponent grid={8}>
				<CardComponent>
					<div className="pro-banner-wrapper">
						<div className="content">
							<div className="heading">
								{__('Welcome to CatalogX', 'catalogx')}
							</div>
							<div className="description">
								{__(
									'Transform your WooCommerce store into a powerful product catalog with enquiries, quotations, and wholesale pricing.',
									'catalogx'
								)}
							</div>

							<div className="button-wrapper">
								{renderUpgradeButton(
									__('Upgrade Now', 'catalogx')
								)}

								<div
									className="admin-btn"
									onClick={() =>
										(window.location.href =
											'?page=catalogx-setup')
									}
								>
									{__('Launch Setup Wizard', 'catalogx')}
									<i className="adminfont-import"></i>
								</div>
							</div>
						</div>

						<div className="image">
							<img src={catalogxIcon} alt="" />
						</div>
					</div>
				</CardComponent>
				{!appLocalizer.khali_dabba && (
					<CardComponent
						title={__(
							'Build a smarter catalog',
							'catalogx'
						)}
						badge={[
							{
								text: 'Starting at $299/year',
								color: 'blue',
							},
						]}
						desc={__(
							'Unlock advanced features and premium modules to turn your store into a lead-generating, quote-ready sales engine.',
							'catalogx'
						)}
					>
						<ListComponent
							className="feature-list"
							items={featuresList.map(
								({ icon, title, desc }) => ({
									icon: icon,
									title: title,
									desc: desc,
								})
							)}
						/>
						<div className="pro-banner">
							<div className="text">
								{__(
									'Join 5,000+ stores closing more deals with CatalogX',
									'catalogx'
								)}
							</div>
							<div className="des">
								{__(
									'Capture leads, manage enquiries, and grow your sales with confidence. Trusted by thousands of businesses worldwide.',
									'catalogx'
								)}
							</div>

							{renderUpgradeButton(
								__('Upgrade Now', 'catalogx')
							)}

							<div className="des">
								{__(
									'15-day money-back guarantee',
									'catalogx'
								)}
							</div>
						</div>
					</CardComponent>
				)}
			</LayoutColumnComponent>

			{/* Right Side */}
			<LayoutColumnComponent grid={4}>
				<CardComponent title={__('Extend your website', 'catalogx')}>
					<LayoutColumnComponent row>
						{pluginStatus['dc-woocommerce-multi-vendor'] ? (
							<ListComponent
								className="mini-card"
								background
								items={[
									{
										title: __(
											'MultiVendorX Pro',
											'catalogx'
										),
										desc: __(
											'Advanced product catalog with enhanced enquiry features and premium templates',
											'catalogx'
										),
										img: multivendorxIcon,
										tags: (
											<>
												<span className="admin-badge red">
													<i className="adminfont-pro-tag"></i>{' '}
													{__('Pro', 'catalogx')}
												</span>
												<a
													href="https://multivendorx.com/pricing/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx"
													target="_blank"
													rel="noopener noreferrer"
												>
													{__(
														'Get Pro',
														'catalogx'
													)}
												</a>
											</>
										),
									},
								]}
							/>
						) : (
							<ListComponent
								className="mini-card"
								background
								items={[
									{
										title: __('MultiVendorX', 'catalogx'),
										desc: __(
											'Turn your store into a product catalog with enquiry-based sales',
											'catalogx'
										),
										img: multivendorxIcon,
										tags: (
											<>
												<span className="admin-badge green">
													{__('Free', 'catalogx')}
												</span>
												<a
													href="#"
													onClick={(e) => {
														e.preventDefault();
														if (!installing) {
															installOrActivatePlugin(
																'dc-woocommerce-multi-vendor'
															);
														}
													}}
													style={{
														pointerEvents:
															installing
																? 'none'
																: 'auto',
														opacity:
															installing ===
															'dc-woocommerce-multi-vendor'
																? 0.6
																: 1,
													}}
												>
													{installing ===
													'dc-woocommerce-multi-vendor'
														? __(
																'Installing...',
																'catalogx'
															)
														: __(
																'Install',
																'catalogx'
															)}
												</a>
											</>
										),
									},
								]}
							/>
						)}

						{pluginStatus['woocommerce-product-stock-alert'] ? (
							<ListComponent
								className="mini-card"
								background
								items={[
									{
										title: __(
											'Notifima Pro',
											'catalogx'
										),
										desc: __(
											'Advanced stock alerts, wishlist features, and premium notification system',
											'catalogx'
										),
										img: notifimaIcon,
										tags: (
											<>
												<span className="admin-badge red">
													<i className="adminfont-pro-tag"></i>{' '}
													{__('Pro', 'catalogx')}
												</span>
												<a
													href="https://notifima.com/pricing/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx"
													target="_blank"
													rel="noopener noreferrer"
												>
													{__(
														'Get Pro',
														'catalogx'
													)}
												</a>
											</>
										),
									},
								]}
							/>
						) : (
							<ListComponent
								className="mini-card"
								background
								items={[
									{
										title: __('Notifima', 'catalogx'),
										desc: __(
											'Advanced stock alerts and wishlist features for WooCommerce',
											'catalogx'
										),
										img: notifimaIcon,
										tags: (
											<>
												<span className="admin-badge green">
													{__('Free', 'catalogx')}
												</span>
												<a
													href="#"
													onClick={(e) => {
														e.preventDefault();
														if (!installing) {
															installOrActivatePlugin(
																'woocommerce-product-stock-alert'
															);
														}
													}}
													style={{
														pointerEvents:
															installing
																? 'none'
																: 'auto',
														opacity:
															installing ===
															'woocommerce-product-stock-alert'
																? 0.6
																: 1,
													}}
												>
													{installing ===
													'woocommerce-product-stock-alert'
														? __(
																'Installing...',
																'catalogx'
															)
														: __(
																'Install',
																'catalogx'
															)}
												</a>
											</>
										),
									},
								]}
							/>
						)}
					</LayoutColumnComponent>
				</CardComponent>

				{/* Quick Links */}
				<CardComponent title={__('Need help getting started?', 'catalogx')}>
					<div className="quick-link">
						{resources.map((res) => (
							<ListComponent
								className="mini-card list"
								border
								items={[
									{
										title: res.title,
										desc: res.desc,
										icon: res.iconClass,
										tags: (
											<>
												<a
													href={res.href}
													target="_blank"
												>
													{__(
														res.linkText,
														'catalogx'
													)}
													<i className="adminfont-external"></i>
												</a>
											</>
										),
									},
								]}
							/>
						))}
					</div>
				</CardComponent>
			</LayoutColumnComponent>
		</ContainerComponent>
	);
};

export default DashboardTab;
