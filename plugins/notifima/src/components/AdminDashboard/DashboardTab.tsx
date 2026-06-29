/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import {
	Card,
	Column,
	ItemListUI,
	Container,
	NoticeManager,
} from 'zyra';
import { __, sprintf } from '@wordpress/i18n';
import axios from 'axios';
import Mascot from '../../assets/images/brand-icon.png';
import catalogx from '../../assets/images/catalogx.png';
import multivendorx from '../../assets/images/multivendorx.png';

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

	const renderUpgradeButton = (label = __('Upgrade Now', 'notifima')) => {
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
				{__(label, 'notifima')}
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
					'woocommerce-catalog-enquiry',
					'dc-woocommerce-multi-vendor',
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
			.then((res) => {
				setPlugins((prev) => [...prev, res.data]);
				setPluginStatus((prev) => ({ ...prev, [slug]: true }));
				window.location.reload();
			})
			.catch(() => {
				NoticeManager.add({
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
	const resources = [
		{
			title: __('Documentation', 'notifima'),
			desc: __(
				'Step-by-step setup guides to configure Notifima quickly.',
				'notifima'
			),
			iconClass: 'knowledgebase',
			linkText: __('Explore Docs', 'notifima'),
			href: 'https://catalogx.com/docs/knowledgebase/',
		},
		{
			title: __('Expert consultation', 'notifima'),
			desc: __(
				'Get tailored advice from our specialists.',
				'notifima'
			),
			iconClass: 'preview',
			linkText: __('Book Consultation', 'notifima'),
			href: 'https://catalogx.com/custom-development/',
		}
	];

	const featuresList = [
		{
			title: __('Back-in-stock notifications', 'notifima'),
			desc: __(
				'Let customers join a waitlist and automatically email them when their favorite products are available again.',
				'notifima'
			),
			icon: 'commission',
		},
		{
			title: __('Smart inventory management', 'notifima'),
			desc: __(
				'Track stock levels across your store and manage inventory from a centralized dashboard.',
				'notifima'
			),
			icon: 'verification3',
		},
		{
			title: __('Grow your subscriber list', 'notifima'),
			desc: __(
				'Capture customer interest with product waitlists and turn subscribers into loyal, repeat buyers.',
				'notifima'
			),
			icon: 'marketplace',
		},
		{
			title: __('Flexible product support', 'notifima'),
			desc: __(
				'Works seamlessly with simple, variable, grouped, subscription, and bundled products.',
				'notifima'
			),
			icon: 'vacation',
		},
		{
			title: __('Personalized notifications', 'notifima'),
			desc: __(
				'Customize forms, email subjects, messages, and branding to create a consistent customer experience.',
				'notifima'
			),
			icon: 'global-community',
		},
		{
			title: __('Export and manage data', 'notifima'),
			desc: __(
				'Export subscriber lists and stock data for reporting, marketing, and better inventory planning.',
				'notifima'
			),
			icon: 'notification',
		},
	];

	return (
		<Container>
			<Column grid={8}>
				<Card>
					<div className="pro-banner-wrapper">
						<div className="content">
							<div className="heading">
								{__('Welcome to notifima', 'notifima')}
							</div>
							<div className="description">
								{__(
									'Never lose a sale because a product is out of stock. Turn product demand into revenue with smart stock alerts, waitlists, and inventory management tools for WooCommerce.',
									'notifima'
								)}
							</div>

							<div className="button-wrapper">
								{renderUpgradeButton(
									__('Upgrade Now', 'notifima')
								)}
							</div>
						</div>

						<div className="image">
							<img src={Mascot} alt="" />
						</div>
					</div>
				</Card>
				{!appLocalizer.khali_dabba && (
					<Card
						title={__(
							'Recover lost sales automatically',
							'notifima'
						)}
						desc={__(
							'Keep customers engaged even when products are unavailable and notify them the moment items are back in stock.',
							'notifima'
						)}
					>
						<ItemListUI
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
									'Turn Waiting into Winning',
									'notifima'
								)}
							</div>
							<div className="des">
								{__(
									'Capture customer interest today and transform tomorrows restock into instant sales.',
									'notifima'
								)}
							</div>

							{renderUpgradeButton(
								__('Upgrade Now', 'notifima')
							)}

							<div className="des">
								{__(
									'15-day money-back guarantee',
									'notifima'
								)}
							</div>
						</div>
					</Card>
				)}
			</Column>

			{/* Right Side */}
			<Column grid={4}>
				<Card title={__('Extend your website', 'notifima')}>
					<Column row>
						{/* CatalogX */}
						{pluginStatus['woocommerce-catalog-enquiry'] ? (
							<ItemListUI
								className="mini-card"
								background
								items={[
									{
										title: __('CatalogX Pro', 'notifima'),
										desc: __(
											'Advanced product catalog, quotation, and enquiry features with premium templates.',
											'notifima'
										),
										img: catalogx,
										tags: (
											<>
												<span className="admin-badge red">
													<i className="adminfont-pro-tag"></i>{' '}
													{__('Pro', 'notifima')}
												</span>
												<a
													href="https://catalogx.com/pricing/"
													target="_blank"
													rel="noopener noreferrer"
												>
													{__('Get Pro', 'notifima')}
												</a>
											</>
										),
									},
								]}
							/>
						) : (
							<ItemListUI
								className="mini-card"
								background
								items={[
									{
										title: __('CatalogX', 'notifima'),
										desc: __(
											'Turn your WooCommerce store into a product catalog with enquiry and quotation features.',
											'notifima'
										),
										img: catalogx,
										tags: (
											<>
												<span className="admin-badge green">
													{__('Free', 'notifima')}
												</span>
												<a
													href="#"
													onClick={(e) => {
														e.preventDefault();
														if (!installing) {
															installOrActivatePlugin(
																'woocommerce-catalog-enquiry'
															);
														}
													}}
													style={{
														pointerEvents:
															installing ===
																'woocommerce-catalog-enquiry'
																? 'none'
																: 'auto',
														opacity:
															installing ===
																'woocommerce-catalog-enquiry'
																? 0.6
																: 1,
													}}
												>
													{installing ===
														'woocommerce-catalog-enquiry'
														? __(
															'Installing...',
															'notifima'
														)
														: __('Install', 'notifima')}
												</a>
											</>
										),
									},
								]}
							/>
						)}

						{/* MultiVendorX */}
						{pluginStatus['dc-woocommerce-multi-vendor'] ? (
							<ItemListUI
								className="mini-card"
								background
								items={[
									{
										title: __(
											'MultiVendorX Pro',
											'notifima'
										),
										desc: __(
											'Advanced multivendor marketplace features with premium vendor management tools.',
											'notifima'
										),
										img: multivendorx,
										tags: (
											<>
												<span className="admin-badge red">
													<i className="adminfont-pro-tag"></i>{' '}
													{__('Pro', 'notifima')}
												</span>
												<a
													href="https://multivendorx.com/pricing/"
													target="_blank"
													rel="noopener noreferrer"
												>
													{__('Get Pro', 'notifima')}
												</a>
											</>
										),
									},
								]}
							/>
						) : (
							<ItemListUI
								className="mini-card"
								background
								items={[
									{
										title: __('MultiVendorX', 'notifima'),
										desc: __(
											'Build and manage a multivendor marketplace with powerful vendor management features.',
											'notifima'
										),
										img: multivendorx,
										tags: (
											<>
												<span className="admin-badge green">
													{__('Free', 'notifima')}
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
															installing ===
																'dc-woocommerce-multi-vendor'
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
															'notifima'
														)
														: __('Install', 'notifima')}
												</a>
											</>
										),
									},
								]}
							/>
						)}
					</Column>
				</Card>

				{/* Quick Links */}
				<Card title={__('Need help getting started?', 'notifima')}>
					<div className="quick-link">
						{resources.map((res) => (
							<ItemListUI
								key={res.href}
								className="mini-card list"
								border
								items={[
									{
										title: __(res.title, 'notifima'),
										desc: __(res.desc, 'notifima'),
										icon: res.iconClass,
										tags: (
											<a
												href={res.href}
												target="_blank"
												rel="noopener noreferrer"
											>
												{__(res.linkText, 'notifima')}
												<i className="adminfont-external"></i>
											</a>
										),
									},
								]}
							/>
						))}
					</div>
				</Card>
			</Column>
		</Container>
	);
};

export default DashboardTab;
