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
		title: __('Product & store tools', 'moowoodle'),
		features: [
			{
				name: __('Multiple stores per product', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Store policies', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Store reviews', 'moowoodle'),
				free: true,
				pro: true,
			},
			{ name: __('Follow store', 'moowoodle'), free: true, pro: true },
			{
				name: __(
					'Privacy controls to show/hide store details)',
					'moowoodle'
				),
				free: true,
				pro: true,
			},
			{
				name: __('Confirm vendor identity with documents', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Bulk upload/download product via CSV', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Display store opening/closing times', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __(
					'Store can temporarily close shop with customer notice',
					'moowoodle'
				),
				free: false,
				pro: true,
			},
			{
				name: __(
					'Assign assistants to your store and control what they can access',
					'moowoodle'
				),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __(' Get paid without hassle', 'moowoodle'),
		features: [
			{
				name: __('Bank transfer', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('PayPal payout', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Stripe connect', 'moowoodle'),
				free: true,
				pro: true,
			},
			{ name: __('Razorpay', 'moowoodle'), free: true, pro: true },
			{
				name: __('Real-time split payments', 'moowoodle'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __(' Deliver seamless shopping experiences', 'moowoodle'),
		features: [
			{ name: __('Product Q&A', 'moowoodle'), free: true, pro: true },
			{
				name: __('Marketplace refunds', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Announcements', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Product abuse report', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Invoices & packing slips', 'moowoodle'),
				free: false,
				pro: true,
			},
			{ name: __('Live chat', 'moowoodle'), free: false, pro: true },
			{
				name: __('Customer support', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Product enquiry', 'moowoodle'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __(' Ship the way you want', 'moowoodle'),
		features: [
			{
				name: __('Zone-based shipping', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Distance-based shipping', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Country restrictions', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Weight-based shipping', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Per-product shipping', 'moowoodle'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __(' Sell in different ways', 'moowoodle'),
		features: [
			{
				name: __(
					'Optimize store & product SEO with Yoast or Rank Math',
					'moowoodle'
				),
				free: false,
				pro: true,
			},
			{
				name: __('Sales, revenue, and order reports', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __(
					'Store with different capabilities as per subsctiption plan',
					'moowoodle'
				),
				free: false,
				pro: true,
			},
			{
				name: __('Paid product promotions', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __(
					'Special pricing & bulk rules for groups',
					'moowoodle'
				),
				free: false,
				pro: true,
			},
			{
				name: __(
					'Low-stock alerts, waitlists, inventory management',
					'moowoodle'
				),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __('Automate rules and commissions', 'moowoodle'),
		features: [
			{
				name: __('Payment gateway fees', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Min/Max quantities', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Facilitator fees', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Marketplace fees', 'moowoodle'),
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
					title={__('Free vs Pro comparison', 'moowoodle')}
					desc={__(
						'See what you get with MooWoodle Pro',
						'moowoodle'
					)}
					action={
						<a
							href="https://dualcube.com/product/moowoodle-pro/"
							className="admin-btn btn-purple"
						>
							{__('Get Pro Access Today!', 'moowoodle')}
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
											{__(section.title, 'moowoodle')}
										</td>
										<td>{__('Free', 'moowoodle')}</td>
										<td>{__('Pro', 'moowoodle')}</td>
									</tr>
								</thead>
								<tbody>
									{section.features.map((feature, i) => (
										<tr key={i}>
											<td>
												{__(feature.name, 'moowoodle')}
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
								'Join 8,000+ successful marketplace owners',
								'moowoodle'
							)}
						</div>

						<div className="des">
							{__(
								'Build, manage, and expand your marketplace with confidence. Loved by entrepreneurs globally.',
								'moowoodle'
							)}
						</div>

						<ul>
							<li>
								<i className="adminfont-check"></i>
								{__('Flexible selling models', 'moowoodle')}
							</li>
							<li>
								<i className="adminfont-check"></i>
								{__(
									'Effortless inventory control',
									'moowoodle'
								)}
							</li>
							<li>
								<i className="adminfont-check"></i>
								{__('Intelligent alert system', 'moowoodle')}
							</li>
							<li>
								<i className="adminfont-check"></i>
								{__('Secure seller onboarding', 'moowoodle')}
							</li>
							<li>
								<i className="adminfont-check"></i>
								{__('Recurring revenue tools', 'moowoodle')}
							</li>
						</ul>

						<div className="button-wrapper">
							<a
								href="https://dualcube.com/product/moowoodle-pro/"
								className="admin-btn btn-purple"
							>
								<i className="adminfont-pro-tag"></i>
								{__('Upgrade Now', 'moowoodle')}
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
