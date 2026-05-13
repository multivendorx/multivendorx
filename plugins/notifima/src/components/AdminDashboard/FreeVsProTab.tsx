import React from 'react';
import { Card, Column, Container } from 'zyra';
import { __ } from '@wordpress/i18n';
import freePro from '../../assets/images/dashboard-1.png';
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
		title: __('Product & store tools', 'notifima'),
		features: [
			{
				name: __('Multiple stores per product', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Store policies', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Store reviews', 'notifima'),
				free: true,
				pro: true,
			},
			{ name: __('Follow store', 'notifima'), free: true, pro: true },
			{
				name: __(
					'Privacy controls to show/hide store details)',
					'notifima'
				),
				free: true,
				pro: true,
			},
			{
				name: __(
					'Confirm vendor identity with documents',
					'notifima'
				),
				free: false,
				pro: true,
			},
			{
				name: __(
					'Bulk upload/download product via CSV',
					'notifima'
				),
				free: false,
				pro: true,
			},
			{
				name: __('Display store opening/closing times', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __(
					'Store can temporarily close shop with customer notice',
					'notifima'
				),
				free: false,
				pro: true,
			},
			{
				name: __(
					'Assign assistants to your store and control what they can access',
					'notifima'
				),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __(' Get paid without hassle', 'notifima'),
		features: [
			{
				name: __('Bank transfer', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('PayPal payout', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Stripe connect', 'notifima'),
				free: true,
				pro: true,
			},
			{ name: __('Razorpay', 'notifima'), free: true, pro: true },
			{
				name: __('Real-time split payments', 'notifima'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __(' Deliver seamless shopping experiences', 'notifima'),
		features: [
			{ name: __('Product Q&A', 'notifima'), free: true, pro: true },
			{
				name: __('Marketplace refunds', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Announcements', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Product abuse report', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Invoices & packing slips', 'notifima'),
				free: false,
				pro: true,
			},
			{ name: __('Live chat', 'notifima'), free: false, pro: true },
			{
				name: __('Customer support', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Product enquiry', 'notifima'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __(' Ship the way you want', 'notifima'),
		features: [
			{
				name: __('Zone-based shipping', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Distance-based shipping', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Country restrictions', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Weight-based shipping', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Per-product shipping', 'notifima'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __(' Sell in different ways', 'notifima'),
		features: [
			{
				name: __(
					'Optimize store & product SEO with Yoast or Rank Math',
					'notifima'
				),
				free: false,
				pro: true,
			},
			{
				name: __('Sales, revenue, and order reports', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __(
					'Store with different capabilities as per subsctiption plan',
					'notifima'
				),
				free: false,
				pro: true,
			},
			{
				name: __('Paid product promotions', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __(
					'Special pricing & bulk rules for groups',
					'notifima'
				),
				free: false,
				pro: true,
			},
			{
				name: __(
					'Low-stock alerts, waitlists, inventory management',
					'notifima'
				),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __('Automate rules and commissions', 'notifima'),
		features: [
			{
				name: __('Payment gateway fees', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Min/Max quantities', 'notifima'),
				free: true,
				pro: true,
			},
			{
				name: __('Facilitator fees', 'notifima'),
				free: false,
				pro: true,
			},
			{
				name: __('Marketplace fees', 'notifima'),
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
							href="https://notifima.com/pricing/"
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
							{/* <img src={freePro} alt="" /> */}
						</div>

						<div className="title">
							{__(
								'Join 8,000+ successful marketplace owners',
								'notifima'
							)}
						</div>

						<div className="des">
							{__(
								'Build, manage, and expand your marketplace with confidence. Loved by entrepreneurs globally.',
								'notifima'
							)}
						</div>

						<ul>
							<li>
								<i className="adminfont-check"></i>
								{__('Flexible selling models', 'notifima')}
							</li>
							<li>
								<i className="adminfont-check"></i>
								{__(
									'Effortless inventory control',
									'notifima'
								)}
							</li>
							<li>
								<i className="adminfont-check"></i>
								{__('Intelligent alert system', 'notifima')}
							</li>
							<li>
								<i className="adminfont-check"></i>
								{__('Secure seller onboarding', 'notifima')}
							</li>
							<li>
								<i className="adminfont-check"></i>
								{__('Recurring revenue tools', 'notifima')}
							</li>
						</ul>

						<div className="button-wrapper">
							<a
								href="https://notifima.com/pricing/"
								className="admin-btn btn-purple"
							>
								<i className="adminfont-pro-tag"></i>
								{__('Upgrade Now', 'notifima')}
								<i className="adminfont-arrow-right icon-pro-btn"></i>
							</a>

							<div
								onClick={() =>
									(window.location.href = `?page=notifima-setup`)
								}
								className="admin-btn"
							>
								{__('Launch Setup Wizard', 'notifima')}
								<i className="adminfont-import"></i>
							</div>
						</div>
					</div>
				</Card>
			</Column>
		</Container>
	);
};

export default FreeVsProTab;
