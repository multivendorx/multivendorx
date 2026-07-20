/* global appLocalizer */
import React from 'react';
import { Card, Column, Container } from '@zyra/primitives';
import { __ } from '@wordpress/i18n';
import freePro from '../../assets/images/notifima-brand.png';
interface Feature {
	name: string;
	free: boolean | string;
	pro: boolean | string;
}

interface Section {
	title: string;
	features: Feature[];
}

const sections: Section[] = [
	{
		title: __('Never Miss a Sale Opportunity', 'notifima'),
		features: [
			{
				name: __('Back-in-stock subscription form', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Automatic restock email notifications', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Admin alerts for new subscriptions', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Support for guest and logged-in customers', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Prevent duplicate subscriptions', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Works with WooCommerce backorders', 'notifima'),
				free: true,
				pro: true,
			},
		],
	},
	{
		title: __('Customize the Subscriber Experience', 'notifima'),
		features: [
			{
				name: __('Customize subscription form text and styling', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Customize email headings and subjects', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('WPML compatibility', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Customer self-service subscription dashboard', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('View and manage product waitlists', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('One-click unsubscribe from notifications', 'notifima'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __('Grow and Engage Your Subscriber List', 'notifima'),
		features: [
			{
				name: __('Double opt-in subscription confirmation', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Ensure genuine subscriber interest', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Mailchimp integration', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Instant subscriber syncing', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Automated list management', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Batch synchronization options', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Enhanced customer segmentation', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Track email delivery and unsubscribe status', 'notifima'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __('Subscriber Management & Reporting', 'notifima'),
		features: [
			{
				name: __('Export subscriber list from WordPress tools', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Advanced subscriber export with names, emails, and dates', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Subscription management dashboard', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Sort subscriptions by products and dates', 'notifima'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __('Smart Inventory Management', 'notifima'),
		features: [
			{
				name: __('Export shop stock data', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Inventory manager dashboard', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('View and manage all products centrally', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Quick edit stock, SKU, and product data', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Import and update inventory via CSV', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Product stock history and movement logs', 'notifima'),
				free: false,
				pro: true,
				comingSoon: true,
			},
		],
	},
	{
		title: __('Security & Spam Protection', 'notifima'),
		features: [
			{
				name: __('Smart ReCAPTCHA protection', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Block automated spam subscriptions', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Prevent fake subscriptions and maintain data quality', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Ensure notification compliance and sender reputation', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Block subscriptions from specific email addresses', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Block subscriptions from specific email domains', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Customize subscription restriction messages', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Create safe-sender email lists', 'notifima'),
				free: false,
				pro: true,
			},
		],
	},
];

const FreeVsProTab: React.FC<object> = () => {
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

	return (
		<Container>
			<Column grid={8}>
				<Card
					title={__('Free vs Pro comparison', 'notifima')}
					desc={__(
						'See what you get with notifima Pro',
						'notifima'
					)}
					action={
						<a
							href= {appLocalizer.pro_url}
							className="admin-btn btn-purple"
						>
							{__('Get Pro Access Today!', 'notifima')}
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
											{__(section.title, 'notifima')}
										</td>
										<td>{__('Free', 'notifima')}</td>
										<td>{__('Pro', 'notifima')}</td>
									</tr>
								</thead>
								<tbody>
									{section.features.map((feature, i) => (
										<tr key={i}>
											<td>
												{__(
													feature.name,
													'notifima'
												)}
											</td>
											<td>{renderCell(feature.free)}</td>
											<td>{renderCell(feature.pro)}</td>
										</tr>
									))}
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
								'Never Miss Another Sale',
								'notifima'
							)}
						</div>

						<div className="des">
							{__(
								'Upgrade to Notifima Pro and turn out-of-stock products into future sales with advanced subscriber management, automation, and inventory tools.',
								'notifima'
							)}
						</div>

						<ul>
							<li>
								<i className="adminfont-check"></i>
								{__('Advanced subscriber management', 'notifima')}
							</li>
							<li>
								<i className="adminfont-check"></i>
								{__('Mailchimp integration', 'notifima')}
							</li>
							<li>
								<i className="adminfont-check"></i>
								{__('Inventory management dashboard', 'notifima')}
							</li>
							<li>
								<i className="adminfont-check"></i>
								{__('Double opt-in & spam protection', 'notifima')}
							</li>
							<li>
								<i className="adminfont-check"></i>
								{__('Advanced exports & reporting', 'notifima')}
							</li>
						</ul>

						<div className="button-wrapper">
							<a
								href={appLocalizer.pro_url}
								className="admin-btn btn-purple"
							>
								<i className="adminfont-pro-tag"></i>
								{__('Upgrade Now', 'notifima')}
								<i className="adminfont-arrow-right icon-pro-btn"></i>
							</a>
						</div>
					</div>
				</Card>
			</Column>
		</Container>
	);
};

export default FreeVsProTab;
