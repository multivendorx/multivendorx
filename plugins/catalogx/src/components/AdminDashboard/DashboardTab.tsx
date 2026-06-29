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
import { getModuleData } from '../../services/templateService';
import axios from 'axios';
import proPopupContent from '../Popup/Popup';
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
				{__(label, 'catalogx')}
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
			href: 'https://catalogx.com/docs/knowledgebase/',
		},
		{
			title: __('Expert consultation', 'catalogx'),
			desc: __(
				'Get personalized guidance from our WooCommerce specialists for your store setup and growth strategy.',
				'catalogx'
			),
			iconClass: 'preview',
			linkText: __('Book Consultation', 'catalogx'),
			href: 'https://catalogx.com/custom-development/',
		},
	];

	const featuresList = [
		{
			title: __('Turbocharge Your Catalog', 'catalogx'),
			desc: __(
				`Enable catalog mode for your entire site or for specific products to control what visitors can actually purchase. Create a private store by hiding prices and the 'Add to Cart' button until a customer logs in, giving you full control over price visibility to boost lead generation. You can hide 'Add to Cart' entirely, or use it alongside 'Send Enquiry' to give customers more than one way to engage.`,
				'catalogx'
			),
			icon: 'commission',
		},
		{
			title: __('Enquiries That Convert', 'catalogx'),
			desc: __(
				`Get a comprehensive overview of product demand by letting customers send enquiries directly from your store, including on out-of-stock items so you never miss a potential sale. Add an Enquiry Button to pages built with any page builder, respond to customers efficiently, and use role-based query management to route the right enquiries to the right team members. The enquiry form itself can be fully customized to match your workflow.`,
				'catalogx'
			),
			icon: 'verification3',
		},
		{
			title: __('Bulk Enquiries, Bigger Sales', 'catalogx'),
			desc: __(
				`Enable enquiries for bulk or high-value orders using the Enquiry Cart, so you can process multiple enquiries simultaneously instead of handling them one by one. This makes it easy to quickly assess demand for specific products or services across multiple enquiries at once, respond faster to customer queries, and ultimately improve satisfaction and conversions while managing high volumes of enquiries more effectively.`,
				'catalogx'
			),
			icon: 'marketplace',
		},
		{
			title: __('Quote Like a Pro', 'catalogx'),
			desc: __(
				`Allow quote requests for all or selected products from your catalog, with a Quotation Button you can add to pages created with any page builder. Restrict quote requests to registered users if you want tighter control over who can ask, and effortlessly find customer quotations with quick search. You can also customize emails and quotations with your company logo attachment for a more professional touch.`,
				'catalogx'
			),
			icon: 'vacation',
		},
		{
			title: __('Smart Pricing, Smarter Profits', 'catalogx'),
			desc: __(
				`Create custom roles without any coding, then apply dynamic price adjustments based on those user roles. Set minimum and maximum quantities for each role, and apply role-based discounts across entire categories to keep your pricing strategy flexible and scalable.`,
				'catalogx'
			),
			icon: 'global-community',
		},
		{
			title: __('Wholesale Made Simple', 'catalogx'),
			desc: __(
				`Create a specific user role for wholesale customers and assign different prices for them on both simple and variable products. You can choose to hide retail prices from wholesale customers entirely, or show both retail and wholesale prices to business users depending on your needs. WooCommerce coupons can be restricted from wholesale customers, and discounts can be configured as either a fixed amount or a percentage.`,
				'catalogx'
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
				</Card>
				{!appLocalizer.khali_dabba && (
					<Card
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
									'catalogx'
								)}
							</div>
							<div className="des">
								{__(
									'Create, manage, and grow your marketplace with confidence. Trusted by thousands of entrepreneurs worldwide.',
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
					</Card>
				)}
			</Column>

			{/* Right Side */}
			<Column grid={4}>
				<Card title={__('Extend your website', 'catalogx')}>
					<Column row>
						{pluginStatus['dc-woocommerce-multi-vendor'] ? (
							<ItemListUI
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
													href="https://multivendorx.com/pricing/"
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
							<ItemListUI
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
							<ItemListUI
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
													href="https://notifima.com/pricing/"
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
							<ItemListUI
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
					</Column>
				</Card>

				{/* Quick Links */}
				<Card title={__('Need help getting started?', 'catalogx')}>
					<div className="quick-link">
						{resources.map((res) => (
							<ItemListUI
								className="mini-card list"
								border
								items={[
									{
										title: __(res.title, 'catalogx'),
										desc: __(res.desc, 'catalogx'),
										icon: res.iconClass,
										tags: (
											<>
												<a
													href={res.href}
													target="blank"
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
				</Card>
			</Column>
		</Container>
	);
};

export default DashboardTab;
