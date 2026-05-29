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
				href={appLocalizer.shop_url}
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
				'Step-by-step guides to set up and manage your marketplace.',
				'notifima'
			),
			iconClass: 'knowledgebase',
			linkText: __('Explore Docs', 'notifima'),
			href: 'https://catalogx.com/docs/knowledgebase/',
		},
		{
			title: __('Expert consultation', 'notifima'),
			desc: __(
				'Get tailored advice from our marketplace specialists.',
				'notifima'
			),
			iconClass: 'preview',
			linkText: __('Book Consultation', 'notifima'),
			href: 'https://catalogx.com/custom-development/',
		},
		{
			title: __('Developer community', 'notifima'),
			desc: __(
				'Connect with our team and fellow builders on Discord.',
				'notifima'
			),
			iconClass: 'global-community',
			linkText: __('Join Discord', 'notifima'),
			href: 'https://discord.com/channels/1376811097134469191/1376811102020829258',
		},
		{
			title: __('Facebook group', 'notifima'),
			desc: __(
				'Share experiences and tips with other marketplace owners.',
				'notifima'
			),
			iconClass: 'user-circle',
			linkText: __('Join Group', 'notifima'),
			href: 'https://www.facebook.com/groups/226246620006065/',
		},
	];

	const featuresList = [
		{
			title: __('Membership rewards & commission', 'notifima'),
			desc: __(
				'Charge your sellers a monthly or yearly membership fee to sell on your marketplace - predictable revenue every month.',
				'notifima'
			),
			icon: 'commission',
		},
		{
			title: __('Verified stores only', 'notifima'),
			desc: __(
				'Screen stores with document verification and approval - build a trusted marketplace from day one.',
				'notifima'
			),
			icon: 'verification3',
		},
		{
			title: __('Diversified marketplace', 'notifima'),
			desc: __(
				'Enable bookings, subscriptions, and auctions to boost sales and engagement.',
				'notifima'
			),
			icon: 'marketplace',
		},
		{
			title: __('Vacation mode for stores', 'notifima'),
			desc: __(
				'Stores can pause their stores temporarily with automatic buyer notifications - no missed messages.',
				'notifima'
			),
			icon: 'vacation',
		},
		{
			title: __('Never run out of stock', 'notifima'),
			desc: __(
				'Real-time inventory tracking with automatic low-stock alerts keeps sellers prepared and buyers happy.',
				'notifima'
			),
			icon: 'global-community',
		},
		{
			title: __('Autopilot notifications', 'notifima'),
			desc: __(
				'Automatic emails and alerts for every order, refund, and payout - everyone stays in the loop.',
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
									'Expand your WooCommerce store by creating a marketplace for multiple stores. Manage, grow, and scale seamlessly.',
									'notifima'
								)}
							</div>

							<div className="button-wrapper">
								{renderUpgradeButton(
									__('Upgrade Now', 'notifima')
								)}

								<div
									className="admin-btn"
									onClick={() =>
										(window.location.href =
											'?page=catalogx-setup')
									}
								>
									{__('Launch Setup Wizard', 'notifima')}
									<i className="adminfont-import"></i>
								</div>
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
							'Build a professional marketplace',
							'notifima'
						)}
						desc={__(
							'Unlock advanced features and premium modules to create a marketplace that stands out.',
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
									'Join 8,000+ successful marketplace owners',
									'notifima'
								)}
							</div>
							<div className="des">
								{__(
									'Create, manage, and grow your marketplace with confidence. Trusted by thousands of entrepreneurs worldwide.',
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
						{pluginStatus['woocommerce-catalog-enquiry'] ? (
							<ItemListUI
								className="mini-card"
								background
								items={[
									{
										title: __(
											'CatalogX Pro',
											'notifima'
										),
										desc: __(
											'Advanced product catalog with enhanced enquiry features and premium templates',
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
													{__(
														'Get Pro',
														'notifima'
													)}
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
										title: __('notifima', 'notifima'),
										desc: __(
											'Turn your store into a product catalog with enquiry-based sales',
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
															installing
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
														: __(
																'Install',
																'notifima'
															)}
												</a>
											</>
										),
									},
								]}
							/>
						)}

						{pluginStatus['woocommerce-product-stock-alert'] ? (
							<ItemListUI
								className="mini-card"
								background
								items={[
									{
										title: __(
											'Multivendorx Pro',
											'notifima'
										),
										desc: __(
											'Advanced stock alerts, wishlist features, and premium notification system',
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
													href="https://notifima.com/pricing/"
													target="_blank"
													rel="noopener noreferrer"
												>
													{__(
														'Get Pro',
														'notifima'
													)}
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
										title: __('Multivendorx', 'notifima'),
										desc: __(
											'Advanced stock alerts and wishlist features for WooCommerce',
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
																'notifima'
															)
														: __(
																'Install',
																'notifima'
															)}
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
								className="mini-card list"
								border
								items={[
									{
										title: __(res.title, 'notifima'),
										desc: __(res.desc, 'notifima'),
										icon: res.iconClass,
										tags: (
											<>
												<a
													href={res.href}
													target="blank"
												>
													{__(
														res.linkText,
														'notifima'
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
				</Card>
			</Column>
		</Container>
	);
};

export default DashboardTab;
