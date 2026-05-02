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
		title: __('Product & store tools', 'catalogx'),
		features: [
			{
				name: __('Multiple stores per product', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Store policies', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Store reviews', 'catalogx'),
				free: true,
				pro: true,
			},
			{ name: __('Follow store', 'catalogx'), free: true, pro: true },
			{
				name: __(
					'Privacy controls to show/hide store details)',
					'catalogx'
				),
				free: true,
				pro: true,
			},
			{
				name: __(
					'Confirm vendor identity with documents',
					'catalogx'
				),
				free: false,
				pro: true,
			},
			{
				name: __(
					'Bulk upload/download product via CSV',
					'catalogx'
				),
				free: false,
				pro: true,
			},
			{
				name: __('Display store opening/closing times', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __(
					'Store can temporarily close shop with customer notice',
					'catalogx'
				),
				free: false,
				pro: true,
			},
			{
				name: __(
					'Assign assistants to your store and control what they can access',
					'catalogx'
				),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __(' Get paid without hassle', 'catalogx'),
		features: [
			{
				name: __('Bank transfer', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('PayPal payout', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Stripe connect', 'catalogx'),
				free: true,
				pro: true,
			},
			{ name: __('Razorpay', 'catalogx'), free: true, pro: true },
			{
				name: __('Real-time split payments', 'catalogx'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __(' Deliver seamless shopping experiences', 'catalogx'),
		features: [
			{ name: __('Product Q&A', 'catalogx'), free: true, pro: true },
			{
				name: __('Marketplace refunds', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Announcements', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Product abuse report', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Invoices & packing slips', 'catalogx'),
				free: false,
				pro: true,
			},
			{ name: __('Live chat', 'catalogx'), free: false, pro: true },
			{
				name: __('Customer support', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Product enquiry', 'catalogx'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __(' Ship the way you want', 'catalogx'),
		features: [
			{
				name: __('Zone-based shipping', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Distance-based shipping', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Country restrictions', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Weight-based shipping', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Per-product shipping', 'catalogx'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __(' Sell in different ways', 'catalogx'),
		features: [
			{
				name: __(
					'Optimize store & product SEO with Yoast or Rank Math',
					'catalogx'
				),
				free: false,
				pro: true,
			},
			{
				name: __('Sales, revenue, and order reports', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __(
					'Store with different capabilities as per subsctiption plan',
					'catalogx'
				),
				free: false,
				pro: true,
			},
			{
				name: __('Paid product promotions', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __(
					'Special pricing & bulk rules for groups',
					'catalogx'
				),
				free: false,
				pro: true,
			},
			{
				name: __(
					'Low-stock alerts, waitlists, inventory management',
					'catalogx'
				),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __('Automate rules and commissions', 'catalogx'),
		features: [
			{
				name: __('Payment gateway fees', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Min/Max quantities', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Facilitator fees', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Marketplace fees', 'catalogx'),
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
					title={__('Free vs Pro comparison', 'catalogx')}
					desc={__(
						'See what you get with catalogx Pro',
						'catalogx'
					)}
					action={
						<a
							href="https://catalogx.com/pricing/"
							className="admin-btn btn-purple"
						>
							{__('Get Pro Access Today!', 'catalogx')}
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
											{__(section.title, 'catalogx')}
										</td>
										<td>{__('Free', 'catalogx')}</td>
										<td>{__('Pro', 'catalogx')}</td>
									</tr>
								</thead>
								<tbody>
									{section.features.map((feature, i) => (
										<tr key={i}>
											<td>
												{__(
													feature.name,
													'catalogx'
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
								'catalogx'
							)}
						</div>

						<div className="des">
							{__(
								'Build, manage, and expand your marketplace with confidence. Loved by entrepreneurs globally.',
								'catalogx'
							)}
						</div>

						<ul>
							<li>
								<i className="adminfont-check"></i>
								{__('Flexible selling models', 'catalogx')}
							</li>
							<li>
								<i className="adminfont-check"></i>
								{__(
									'Effortless inventory control',
									'catalogx'
								)}
							</li>
							<li>
								<i className="adminfont-check"></i>
								{__('Intelligent alert system', 'catalogx')}
							</li>
							<li>
								<i className="adminfont-check"></i>
								{__('Secure seller onboarding', 'catalogx')}
							</li>
							<li>
								<i className="adminfont-check"></i>
								{__('Recurring revenue tools', 'catalogx')}
							</li>
						</ul>

						<div className="button-wrapper">
							<a
								href="https://catalogx.com/pricing/"
								className="admin-btn btn-purple"
							>
								<i className="adminfont-pro-tag"></i>
								{__('Upgrade Now', 'catalogx')}
								<i className="adminfont-arrow-right icon-pro-btn"></i>
							</a>

							<div
								onClick={() =>
									(window.location.href = `?page=catalogx-setup`)
								}
								className="admin-btn"
							>
								{__('Launch Setup Wizard', 'catalogx')}
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
