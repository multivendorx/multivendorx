/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { Card, Column, ItemListUI, Container, NoticeManager } from 'zyra';
import { __, sprintf } from '@wordpress/i18n';
import axios from 'axios';
import MoowoodleIcon from '../../assets/images/moowoodle-icon.png';
import catalogx from '../../assets/images/catalogx.png';
import notifima from '../../assets/images/notifima.png';

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

	const renderUpgradeButton = (label = __('Upgrade Now', 'moowoodle')) => {
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
				{__(label, 'moowoodle')}
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
			.then((res) => {
				setPlugins((prev) => [...prev, res.data]);
				setPluginStatus((prev) => ({ ...prev, [slug]: true }));
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
	const resources = [
		{
			title: __('Documentation', 'moowoodle'),
			desc: __(
				'Step-by-step guides to set up and manage your marketplace.',
				'moowoodle'
			),
			iconClass: 'knowledgebase',
			linkText: __('Explore Docs', 'moowoodle'),
			href: 'https://dualcube.com/knowledgebase/',
		},
		{
			title: __('Expert consultation', 'moowoodle'),
			desc: __(
				'Get tailored advice from our marketplace specialists.',
				'moowoodle'
			),
			iconClass: 'preview',
			linkText: __('Book Consultation', 'moowoodle'),
			href: 'https://dualcube.com/custom-development/',
		},
	];

	const featuresList = [
		{
			title: __('Seamless Moodle integration', 'moowoodle'),
			desc: __(
				'Connect your WooCommerce store with Moodle and automatically manage courses, enrollments, and learner access from one place.',
				'moowoodle'
			),
			icon: 'moodle',
		},
		{
			title: __('Sell courses with WooCommerce', 'moowoodle'),
			desc: __(
				'Turn Moodle courses into purchasable WooCommerce products and monetize your learning platform with flexible checkout and payment options.',
				'moowoodle'
			),
			icon: 'woocommerce',
		},
		{
			title: __('Single Sign-On access', 'moowoodle'),
			desc: __(
				'Allow learners to access their Moodle courses directly from WordPress without logging in multiple times.',
				'moowoodle'
			),
			icon: 'single-sign-on',
		},
		{
			title: __('Classroom & bulk enrollment', 'moowoodle'),
			desc: __(
				'Enable teachers, companies, and training centers to purchase multiple seats and assign courses to learners with ease.',
				'moowoodle'
			),
			icon: 'classroom-enrollment',
		},
		{
			title: __('Course gifting made simple', 'moowoodle'),
			desc: __(
				'Let customers purchase and gift courses to friends, students, employees, or team members directly during checkout.',
				'moowoodle'
			),
			icon: 'subscription-courses',
		},
		{
			title: __('Real-time user synchronization', 'moowoodle'),
			desc: __(
				'Keep user profiles synchronized between WordPress and Moodle automatically for a smooth and connected learning experience.',
				'moowoodle'
			),
			icon: 'bulk-course-sync',
		},
		{
			title: __('Automatic course synchronization', 'moowoodle'),
			desc: __(
				'Fetch Moodle courses instantly and keep WooCommerce products updated with the latest course information.',
				'moowoodle'
			),
			icon: 'smart-course-sync',
		},
		{
			title: __('Cohort synchronization & group learning', 'moowoodle'),
			desc: __(
				'Sync Moodle cohorts with WooCommerce products to streamline group enrollments and organization-based learning.',
				'moowoodle'
			),
			icon: 'cohort',
		},
	];

	return (
		<Container>
			<Column grid={8}>
				<Card>
					<div className="pro-banner-wrapper">
						<div className="content">
							<div className="heading">
								{__('Welcome to MooWoodle', 'moowoodle')}
							</div>
							<div className="description">
								{__(
									'Connect WordPress, WooCommerce, and Moodle to sell courses, automate enrollments, and deliver a seamless eLearning experience from a single platform.',
									'moowoodle'
								)}
							</div>

							<div className="button-wrapper">
								{renderUpgradeButton(
									__('Upgrade Now', 'moowoodle')
								)}
							</div>
						</div>

						<div className="image">
							<img src={MoowoodleIcon} alt="" />
						</div>
					</div>
				</Card>
				{!appLocalizer.khali_dabba && (
					<Card
						title={__(
							'Build a smarter eLearning platform',
							'moowoodle'
						)}
						badge={[
							{
								text: 'Starting at $299/year',
								color: 'blue',
							},
						]}
						desc={__(
							'Unlock advanced synchronization, automation, and enrollment features to create a professional learning experience for individuals, teams, and institutions.',
							'moowoodle'
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
									'Trusted by growing eLearning businesses',
									'moowoodle'
								)}
							</div>
							<div className="des">
								{__(
									'Create, manage, and scale your online learning platform with confidence. From individual instructors to training organizations, MooWoodle helps simplify course selling and learner management.',
									'moowoodle'
								)}
							</div>

							{renderUpgradeButton(
								__('Upgrade Now', 'moowoodle')
							)}

							<div className="des">
								{__('15-day money-back guarantee', 'moowoodle')}
							</div>
						</div>
					</Card>
				)}
			</Column>

			{/* Right Side */}
			<Column grid={4}>
				<Card title={__('Extend your website', 'moowoodle')}>
					<Column row>
						{pluginStatus['woocommerce-catalog-enquiry'] ? (
							<ItemListUI
								className="mini-card"
								background
								items={[
									{
										title: __('CatalogX Pro', 'moowoodle'),
										desc: __(
											'Advanced product catalog with enhanced enquiry features and premium templates',
											'moowoodle'
										),
										img: catalogx,
										tags: (
											<>
												<span className="admin-badge red">
													<i className="adminfont-pro-tag"></i>{' '}
													{__('Pro', 'moowoodle')}
												</span>
												<a
													href="https://catalogx.com/pricing/"
													target="_blank"
													rel="noopener noreferrer"
												>
													{__('Get Pro', 'moowoodle')}
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
										title: __('CatalogX', 'moowoodle'),
										desc: __(
											'Turn your store into a product catalog with enquiry-based sales',
											'moowoodle'
										),
										img: catalogx,
										tags: (
											<>
												<span className="admin-badge green">
													{__('Free', 'moowoodle')}
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
																'moowoodle'
															)
														: __(
																'Install',
																'moowoodle'
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
										title: __('Notifima Pro', 'moowoodle'),
										desc: __(
											'Advanced stock alerts, wishlist features, and premium notification system',
											'moowoodle'
										),
										img: notifima,
										tags: (
											<>
												<span className="admin-badge red">
													<i className="adminfont-pro-tag"></i>{' '}
													{__('Pro', 'moowoodle')}
												</span>
												<a
													href="https://notifima.com/pricing/"
													target="_blank"
													rel="noopener noreferrer"
												>
													{__('Get Pro', 'moowoodle')}
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
										title: __('Notifima', 'moowoodle'),
										desc: __(
											'Advanced stock alerts and wishlist features for WooCommerce',
											'moowoodle'
										),
										img: notifima,
										tags: (
											<>
												<span className="admin-badge green">
													{__('Free', 'moowoodle')}
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
																'moowoodle'
															)
														: __(
																'Install',
																'moowoodle'
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
				<Card title={__('Need help getting started?', 'moowoodle')}>
					<div className="quick-link">
						{resources.map((res) => (
							<ItemListUI
								className="mini-card list"
								border
								items={[
									{
										title: __(res.title, 'moowoodle'),
										desc: __(res.desc, 'moowoodle'),
										icon: res.iconClass,
										tags: (
											<>
												<a
													href={res.href}
													target="blank"
												>
													{__(
														res.linkText,
														'moowoodle'
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
