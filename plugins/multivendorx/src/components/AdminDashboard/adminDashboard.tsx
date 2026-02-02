/* global appLocalizer React */
import notifima from '../../assets/images/brand-icon.png';
import catalogx from '../../assets/images/catalogx.png';
import Mascot from '../../assets/images/multivendorx-mascot-scale.png';
import freePro from '../../assets/images/dashboard-1.png';

interface Section {
	title: string;
	features: Feature[];
}
interface Module {
	id: string;
	name: string;
	iconClass: string;
	pro?: boolean;
	hasToggle?: boolean;
}
interface Feature {
	name: string;
	free: boolean | string;
	pro: boolean | string;
}

interface WPPlugin {
	plugin?: string;
	status?: string;
}

import './adminDashboard.scss';
import '../dashboard.scss';
import { useEffect, useState } from 'react';
import { Card, Column, Container, getApiLink, MiniCard, sendApiResponse, SuccessNotice, useModules } from 'zyra';
import axios from 'axios';
import { __ } from '@wordpress/i18n';

const AdminDashboard = () => {
	const { modules, insertModule, removeModule } = useModules();
	const [installing, setInstalling] = useState<string>('');
	const [pluginStatus, setPluginStatus] = useState<{
		[key: string]: boolean;
	}>({});
	const [successMsg, setSuccessMsg] = useState<string>('');

	// Check plugin installation status on component mount
	useEffect(() => {
		checkPluginStatus('woocommerce-catalog-enquiry');
		checkPluginStatus('woocommerce-product-stock-alert');
	}, []);

	// Function to check if plugin is installed and active
	const checkPluginStatus = async (slug: string) => {
		try {
			const response = await axios({
				method: 'GET',
				url: `${appLocalizer.apiUrl}/wp/v2/plugins`,
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
			});

			// Check if our plugin exists and is active
			const plugins = response.data;
			const pluginExists = plugins.some(
				(plugin: WPPlugin) =>
					plugin.plugin.includes(slug) && plugin.status === 'active'
			);

			setPluginStatus((prev) => ({
				...prev,
				[slug]: pluginExists,
			}));
		} catch (error) {
			console.error(`Failed to check plugin status "${slug}":`, error);
			setPluginStatus((prev) => ({
				...prev,
				[slug]: false,
			}));
		}
	};

	const installOrActivatePlugin = async (slug: string) => {
		if (!slug || installing) {
			return;
		} // prevent multiple clicks
		setInstalling(slug);

		try {
			// Step 1: Get current plugins
			const { data: plugins } = await axios.get(
				`${appLocalizer.apiUrl}/wp/v2/plugins`,
				{
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
				}
			);

			// Step 2: Find if plugin exists
			const existingPlugin = plugins.find((plugin: WPPlugin) =>
				plugin.plugin.includes(slug)
			);
			const pluginFilePath =
				existingPlugin?.plugin || `${slug}/${slug}.php`;

			// Step 3: Determine action
			let apiUrl = `${appLocalizer.apiUrl}/wp/v2/plugins`;
			let requestData: WPPlugin = { status: 'active' }; // default request for activation

			if (!existingPlugin) {
				// Plugin not installed → install & activate
				requestData.slug = slug;
			} else if (existingPlugin.status === 'active') {
				setSuccessMsg(`Plugin "${slug}" is already active.`);
				await checkPluginStatus(slug);
				return;
			} else {
				// Plugin installed but inactive → just activate
				const encodedFile = encodeURIComponent(pluginFilePath);
				apiUrl += `/${encodedFile}`;
			}

			// Step 4: Call API
			await axios.post(apiUrl, requestData, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			});

			// Step 5: Refresh status
			await checkPluginStatus(slug);

			setSuccessMsg(
				`Plugin "${slug}" ${existingPlugin ? 'activated' : 'installed & activated'
				} successfully!`
			);
		} catch (error) {
			console.error(error);
			setSuccessMsg(`Failed to install/activate plugin "${slug}".`);
		} finally {
			setTimeout(() => setSuccessMsg(''), 3000);
			setInstalling('');
		}
	};

	const handleOnChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
		moduleId: string
	) => {
		const action = event.target.checked ? 'activate' : 'deactivate';
		try {
			if (action === 'activate') {
				insertModule?.(moduleId);
			} else {
				removeModule?.(moduleId);
			}
			localStorage.setItem(`force_multivendorx_context_reload`, 'true');
			await sendApiResponse(
				appLocalizer,
				getApiLink(appLocalizer, 'modules'),
				{
					id: moduleId,
					action,
				}
			);
			setSuccessMsg(`Module ${action}d`);
			setTimeout(() => setSuccessMsg(''), 2000);
		} catch (error) {
			setSuccessMsg(`Error: Failed to ${error} module`);
			setTimeout(() => setSuccessMsg(''), 2000);
		}
	};

	const resources = [
		{
			title: 'Documentation',
			desc: 'Step-by-step guides to set up and manage your marketplace.',
			iconClass: 'adminfont-book',
			linkText: 'Explore Docs',
			href: 'https://multivendorx.com/docs/knowledgebase/',
		},
		{
			title: 'Expert consultation',
			desc: 'Get tailored advice from our marketplace specialists.',
			iconClass: 'adminfont-preview',
			linkText: 'Book Consultation',
			href: 'https://multivendorx.com/custom-development/',
		},
		{
			title: 'Developer community',
			desc: 'Connect with our team and fellow builders on Discord.',
			iconClass: 'adminfont-global-community',
			linkText: 'Join Discord',
			href: 'https://discord.com/channels/1376811097134469191/1376811102020829258',
		},
		{
			title: 'Facebook group',
			desc: 'Share experiences and tips with other marketplace owners.',
			iconClass: 'adminfont-user-circle',
			linkText: 'Join Group',
			href: 'https://www.facebook.com/groups/226246620006065/',
		},
	];

	const featuresList = [
		{
			title: 'Membership rewards & commission',
			desc: 'Charge your sellers a monthly or yearly membership fee to sell on your marketplace - predictable revenue every month.',
			iconClass: 'adminfont-commission',
			linkText: 'Join Discord',
			href: '#',
		},
		{
			title: 'Verified stores only',
			desc: 'Screen stores with document verification and approval - build a trusted marketplace from day one.',
			iconClass: 'adminfont-verification3',
			linkText: 'Join Discord',
			href: '#',
		},
		{
			title: 'Diversified marketplace',
			desc: 'Enable bookings, subscriptions, and auctions to boost sales and engagement.',
			iconClass: 'adminfont-marketplace',
			linkText: 'Explore Docs',
			href: '#',
		},
		{
			title: 'Vacation mode for stores',
			desc: 'Stores can pause their stores temporarily with automatic buyer notifications - no missed messages.',
			iconClass: 'adminfont-vacation',
			linkText: 'Explore Docs',
			href: '#',
		},
		{
			title: 'Never run out of stock',
			desc: 'Real-time inventory tracking with automatic low-stock alerts keeps sellers prepared and buyers happy.',
			iconClass: 'adminfont-global-community',
			linkText: 'Book Consultation',
			href: '#',
		},
		{
			title: 'Autopilot notifications',
			desc: 'Automatic emails and alerts for every order, refund, and payout - everyone stays in the loop.',
			iconClass: 'adminfont-notification',
			linkText: 'Join Discord',
			href: '#',
		},
	];

	const sections: Section[] = [
		{
			title: 'Product & store tools',
			features: [
				{
					name: 'Multiple stores per product',
					free: true,
					pro: true,
				},
				{ name: 'Store policies', free: true, pro: true },
				{ name: 'Store reviews', free: true, pro: true },
				{ name: 'Follow store', free: true, pro: true },
				{
					name: 'Privacy controls to show/hide store details)',
					free: true,
					pro: true,
				},
				{
					name: 'Confirm vendor identity with documents',
					free: false,
					pro: true,
				},
				{
					name: 'Bulk upload/download product via CSV',
					free: false,
					pro: true,
				},
				{
					name: 'Display store opening/closing times',
					free: false,
					pro: true,
				},
				{
					name: 'Store can temporarily close shop with customer notice',
					free: false,
					pro: true,
				},
				{
					name: 'Assign assistants to your store and control what they can access',
					free: false,
					pro: true,
				},
			],
		},
		{
			title: ' Get paid without hassle',
			features: [
				{ name: 'Bank transfer', free: true, pro: true },
				{ name: 'PayPal payout', free: true, pro: true },
				{ name: 'Stripe connect', free: true, pro: true },
				{ name: 'Razorpay', free: true, pro: true },
				{ name: 'Real-time split payments', free: false, pro: true },
			],
		},
		{
			title: ' Deliver seamless shopping experiences',
			features: [
				{ name: 'Product Q&A', free: true, pro: true },
				{ name: 'Marketplace refunds', free: true, pro: true },
				{ name: 'Announcements', free: true, pro: true },
				{ name: 'Product abuse report', free: true, pro: true },
				{ name: 'Invoices & packing slips', free: false, pro: true },
				{ name: 'Live chat', free: false, pro: true },
				{ name: 'Customer support', free: false, pro: true },
				{ name: 'Product enquiry', free: false, pro: true },
			],
		},
		{
			title: ' Ship the way you want',
			features: [
				{ name: 'Zone-based shipping', free: true, pro: true },
				{ name: 'Distance-based shipping', free: true, pro: true },
				{ name: 'Country restrictions', free: true, pro: true },
				{ name: 'Weight-based shipping', free: true, pro: true },
				{ name: 'Per-product shipping', free: false, pro: true },
			],
		},
		{
			title: ' Sell in different ways',
			features: [
				{
					name: 'Optimize store & product SEO with Yoast or Rank Math',
					free: false,
					pro: true,
				},
				{
					name: 'Sales, revenue, and order reports',
					free: false,
					pro: true,
				},
				{
					name: 'Store with different capabilities as per subsctiption plan',
					free: false,
					pro: true,
				},
				{ name: 'Paid product promotions', free: false, pro: true },
				{
					name: 'Special pricing & bulk rules for groups',
					free: false,
					pro: true,
				},
				{
					name: 'Low-stock alerts, waitlists, inventory management',
					free: false,
					pro: true,
				},
			],
		},
		{
			title: 'Automate rules and commissions',
			features: [
				{ name: 'Payment gateway fees', free: true, pro: true },
				{ name: 'Min/Max quantities', free: true, pro: true },
				{ name: 'Facilitator fees', free: false, pro: true },
				{ name: 'Marketplace fees', free: false, pro: true },
			],
		},
	];

	const renderCell = (value: string | boolean) => {
		if (typeof value === 'boolean') {
			return value ? (
				<i className="check-icon adminfont-check"></i>
			) : (
				<i className="close-icon adminfont-close"></i>
			);
		}
		return value;
	};

	const Modules: Module[] = [
		{
			id: 'shared-listing',
			name: 'Shared listing',
			iconClass: 'adminfont-spmv',
			pro: false,
		},
		{
			id: 'staff-manager',
			name: 'Staff manager',
			iconClass: 'adminfont-staff-manager',
			pro: true,
		},
		{
			id: 'vacation',
			name: 'Vacation mode',
			iconClass: 'adminfont-vacation',
			pro: true,
		},
		{
			id: 'business-hours',
			name: 'Business hours',
			iconClass: 'adminfont-business-hours',
			pro: true,
		},
		{
			id: 'store-inventory',
			name: 'Store inventory',
			iconClass: 'adminfont-store-inventory',
			pro: true,
		},
		{
			id: 'min-max-quantities',
			name: 'Min max',
			iconClass: 'adminfont-min-max',
			pro: false,
		},
		{
			id: 'wholesale',
			name: 'Wholesale',
			iconClass: 'adminfont-wholesale',
			pro: true,
		},
		{
			id: 'paypal-marketplace',
			name: 'PayPal marketplace',
			iconClass: 'adminfont-paypal-marketplace',
			pro: true,
		},
		{
			id: 'stripe-marketplace',
			name: 'Stripe marketplace',
			iconClass: 'adminfont-stripe-marketplace',
			pro: true,
		},
		{
			id: 'facilitator',
			name: 'Facilitator',
			iconClass: 'adminfont-facilitator',
			pro: true,
		},
		{
			id: 'franchises-module',
			name: 'Franchises',
			iconClass: 'adminfont-franchises-module',
			pro: true,
		},
		{
			id: 'invoice',
			name: 'Invoice & packing slip',
			iconClass: 'adminfont-invoice',
			pro: true,
		},
	];

	const [activeTab, setActiveTab] = useState('dashboard');
	const isPro = !!appLocalizer.khali_dabba;
	const renderUpgradeButton = (label = 'Upgrade Now') => {
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
				{label}
				<i className="adminfont-arrow-right icon-pro-btn"></i>
			</a>
		);
	};

	let tabs = [
		{
			id: 'dashboard',
			label: __('Dashboard', 'multivendorx'),
			icon: 'adminfont-module',
			content: (
				<>
					<Column grid={8}>
						<Card contentHeight>
							<div className="pro-banner-wrapper">
								<div className="content">
									<div className="heading">
										{__(
											'Welcome to MultiVendorX',
											'multivendorx'
										)}
									</div>
									<div className="description">
										{__(
											'Expand your WooCommerce store by creating a marketplace for multiple stores. Manage, grow, and scale seamlessly.',
											'multivendorx'
										)}
									</div>

									<div className="button-wrapper">
										{renderUpgradeButton(
											__(
												'Upgrade Now',
												'multivendorx'
											)
										)}

										<div
											className="admin-btn"
											onClick={() =>
											(window.location.href =
												'?page=multivendorx-setup')
											}
										>
											{__(
												'Launch Setup Wizard',
												'multivendorx'
											)}
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
								title={__('Build a professional marketplace', 'multivendorx')}
								badge={[
									{ text: 'Starting at $299/year', color: 'blue' }
								]}
								desc={__('Unlock advanced features and premium modules to create a marketplace that stands out.', 'multivendorx')}
							>
								<MiniCard
									items={featuresList.map((res) => ({
										iconClass: res.iconClass,
										title: res.title,
										description: res.desc,
									}))}
								/>

								<div className="pro-banner">
									<div className="text">
										{__('Join 8,000+ successful marketplace owners', 'multivendorx')}
									</div>
									<div className="des">
										{__(
											'Create, manage, and grow your marketplace with confidence. Trusted by thousands of entrepreneurs worldwide.',
											'multivendorx'
										)}
									</div>

									{renderUpgradeButton(__('Upgrade Now', 'multivendorx'))}

									<div className="des">
										{__('15-day money-back guarantee', 'multivendorx')}
									</div>
								</div>
							</Card>

						)}
						<Card contentHeight title="Modules" buttonLabel="View All" onButtonClick={() => (window.location.href = `?page=multivendorx#&tab=modules`)}>
							<div className="mini-module">
								{Modules.map((module) => (
									<div
										className="module-list-item"
										key={module.id}
									>
										<div className="module-header">
											<i
												className={`font ${module.iconClass}`}
											></i>

											{!module.pro ||
												appLocalizer.khali_dabba ? (
												<div
													className="toggle-checkbox"
													data-tour={`id-showcase-tour`}
												>
													<input
														type="checkbox"
														className="woo-toggle-checkbox"
														id={`toggle-switch-${module.id}`}
														checked={modules.includes(
															module.id
														)}
														onChange={(e) =>
															handleOnChange(
																e,
																module.id
															)
														}
													/>
													<label
														htmlFor={`toggle-switch-${module.id}`}
														className="toggle-switch-is_hide_cart_checkout"
													></label>
												</div>
											) : (
												<span className="admin-pro-tag">
													<i className="adminfont-pro-tag"></i>
													{__(
														'Pro',
														'multivendorx'
													)}
												</span>
											)}
										</div>

										<div className="module-name">
											{__(
												module.name,
												'multivendorx'
											)}
										</div>
									</div>
								))}
							</div>
						</Card>
					</Column>

					{/* Right Side */}
					<Column grid={4}>
						<Card contentHeight title={__('Extend your website', 'multivendorx')}>
							<Column row>
								{pluginStatus[
									'woocommerce-catalog-enquiry'
								] ? (
									<MiniCard background
										header={
											<>
												<img src={catalogx} alt="" />
												<div className="tag">
													<span className="admin-badge red">
														<i className="adminfont-pro-tag"></i>{' '}
														{__('Pro', 'multivendorx')}
													</span>
													<a
														href="https://catalogx.com/pricing/"
														target="_blank"
														rel="noopener noreferrer"
													>
														{__('Get Pro', 'multivendorx')}
													</a>
												</div>
											</>
										}
										title={__('CatalogX Pro', 'multivendorx')}
										description={__(
											'Advanced product catalog with enhanced enquiry features and premium templates',
											'multivendorx'
										)}
									/>
								) : (
									<MiniCard background
										header={
											<>
												<img src={catalogx} alt="" />
												<div className="tag">
													<span className="admin-badge green">
														{__('Free', 'multivendorx')}
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
															pointerEvents: installing ? 'none' : 'auto',
															opacity:
																installing ===
																	'woocommerce-catalog-enquiry'
																	? 0.6
																	: 1,
														}}
													>
														{installing ===
															'woocommerce-catalog-enquiry'
															? __('Installing...', 'multivendorx')
															: __('Install', 'multivendorx')}
													</a>
												</div>
											</>
										}
										title={__('CatalogX', 'multivendorx')}
										description={__(
											'Turn your store into a product catalog with enquiry-based sales',
											'multivendorx'
										)}
									/>
								)}

								{pluginStatus[
									'woocommerce-product-stock-alert'
								] ? (
									<MiniCard background
										header={
											<div className="header">
												<img src={notifima} alt="" />
												<div className="tag">
													<span className="admin-badge red">
														<i className="adminfont-pro-tag"></i>{' '}
														{__('Pro', 'multivendorx')}
													</span>
													<a
														href="https://notifima.com/pricing/"
														target="_blank"
														rel="noopener noreferrer"
													>
														{__('Get Pro', 'multivendorx')}
													</a>
												</div>
											</div>
										}
										title={__('Notifima Pro', 'multivendorx')}
										description={__(
											'Advanced stock alerts, wishlist features, and premium notification system',
											'multivendorx'
										)}
									/>
								) : (
									<MiniCard background
										header={
											<>
												<img src={notifima} alt="" />
												<div className="tag">
													<span className="admin-badge green">
														{__('Free', 'multivendorx')}
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
															pointerEvents: installing ? 'none' : 'auto',
															opacity:
																installing ===
																	'woocommerce-product-stock-alert'
																	? 0.6
																	: 1,
														}}
													>
														{installing ===
															'woocommerce-product-stock-alert'
															? __('Installing...', 'multivendorx')
															: __('Install', 'multivendorx')}
													</a>
												</div>
											</>
										}
										title={__('Notifima', 'multivendorx')}
										description={__(
											'Advanced stock alerts and wishlist features for WooCommerce',
											'multivendorx'
										)}
									/>

								)}
							</Column>
						</Card>

						{/* Quick Links */}
						<Card contentHeight title={__('Need help getting started?', 'multivendorx')}>
							<div className="cards-wrapper quick-link">
								{resources.map((res, index) => (
									<div className="cards" key={index}>
										<div className="header">
											<i
												className={`icon ${res.iconClass}`}
											></i>
											<a
												href={res.href}
												target="blank"
											>
												{__(
													res.linkText,
													'multivendorx'
												)}
												<i className="adminfont-external"></i>
											</a>
										</div>
										<h3>
											{__(res.title, 'multivendorx')}
										</h3>
										<p>
											{__(res.desc, 'multivendorx')}
										</p>
									</div>
								))}
							</div>
						</Card>
					</Column>
				</>
			),
		},
		{
			id: 'free-vs-pro',
			label: __('Free vs Pro', 'multivendorx'),
			icon: 'adminfont-pros-and-cons',
			content: (
				<>
					<Column grid={8}>
						<Card
							title={__('Free vs Pro comparison', 'multivendorx')}
							desc={__('See what you get with MultiVendorX Pro', 'multivendorx')}
							action={
								<a
									href="https://multivendorx.com/pricing/"
									className="admin-btn btn-purple"
								>
									{__('Get Pro Access Today!', 'multivendorx')}
									<i className="adminfont-arrow-right icon-pro-btn"></i>
								</a>
							}
						>
							<div id="free-vs-pro" className="free-vs-pro">
								{sections.map((section, idx) => (
									<table key={idx}>
										<thead>
											<tr>
												<td>
													{__(
														section.title,
														'multivendorx'
													)}
												</td>
												<td>
													{__(
														'Free',
														'multivendorx'
													)}
												</td>
												<td>
													{__(
														'Pro',
														'multivendorx'
													)}
												</td>
											</tr>
										</thead>
										<tbody>
											{section.features.map(
												(feature, i) => (
													<tr key={i}>
														<td>
															{__(
																feature.name,
																'multivendorx'
															)}
														</td>
														<td>
															{renderCell(
																feature.free
															)}
														</td>
														<td>
															{renderCell(
																feature.pro
															)}
														</td>
													</tr>
												)
											)}
										</tbody>
									</table>
								))}
							</div>
						</Card>
					</Column>

					<Column grid={4}>
						<Card>
							<div className="right-pro-banner">
								<div className="image-wrapper">
									<img src={freePro} alt="" />
								</div>

								<div className="title">
									{__(
										'Join 8,000+ successful marketplace owners',
										'multivendorx'
									)}
								</div>

								<div className="des">
									{__(
										'Build, manage, and expand your marketplace with confidence. Loved by entrepreneurs globally.',
										'multivendorx'
									)}
								</div>

								<ul>
									<li>
										<i className="adminfont-check"></i>
										{__(
											'Flexible selling models',
											'multivendorx'
										)}
									</li>
									<li>
										<i className="adminfont-check"></i>
										{__(
											'Effortless inventory control',
											'multivendorx'
										)}
									</li>
									<li>
										<i className="adminfont-check"></i>
										{__(
											'Intelligent alert system',
											'multivendorx'
										)}
									</li>
									<li>
										<i className="adminfont-check"></i>
										{__(
											'Secure seller onboarding',
											'multivendorx'
										)}
									</li>
									<li>
										<i className="adminfont-check"></i>
										{__(
											'Recurring revenue tools',
											'multivendorx'
										)}
									</li>
								</ul>

								<div className="button-wrapper">
									<a
										href="https://multivendorx.com/pricing/"
										className="admin-btn btn-purple"
									>
										<i className="adminfont-pro-tag"></i>
										{__('Upgrade Now', 'multivendorx')}
										<i className="adminfont-arrow-right icon-pro-btn"></i>
									</a>

									<div
										onClick={() =>
											(window.location.href = `?page=multivendorx-setup`)
										}
										className="admin-btn"
									>
										{__(
											'Launch Setup Wizard',
											'multivendorx'
										)}
										<i className="adminfont-import"></i>
									</div>
								</div>
							</div>
						</Card>
					</Column>
				</>
			),
		},
	];

	tabs = appLocalizer.khali_dabba
		? tabs.filter((tab) => tab.id !== 'free-vs-pro')
		: tabs;

	return (
		<>
			<SuccessNotice message={successMsg} />
			{/* <Container className="general-wrapper admin-dashboard"> */}
			<Container general>
				<Column>
					<Card>
						<div className="admin-tab tabs-wrapper">
							<div className="tabs-item">
								{tabs.map((tab) => (
									<div
										key={tab.id}
										className={`tab ${activeTab === tab.id
											? 'active-tab'
											: ''
											}`}
										onClick={() => setActiveTab(tab.id)}
									>
										<p className="tab-name">
											<i className={tab.icon}></i>
											{tab.label}
										</p>
									</div>
								))}
							</div>
							<div className="right">
								{renderUpgradeButton('Upgrade Now')}
							</div>
						</div>
					</Card>
				</Column>
				{tabs.map(
					(tab) => activeTab === tab.id && <>{tab.content}</>
				)}
			</Container>
		</>
	);
};

export default AdminDashboard;
