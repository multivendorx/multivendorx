import React from 'react';
import { Card, Column, Container } from '@zyra/primitives';
import { __ } from '@wordpress/i18n';
import CatalogxBrand from '../../assets/images/catalogx-brand.png';
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
		title: __('Core features', 'catalogx'),
		features: [
			{
				name: __('Enquiry management', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Catalog mode', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Quotation management', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Wholesale pricing', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Dynamic pricing', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Live page builder', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Form builder', 'catalogx'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __('Blocks & shortcodes', 'catalogx'),
		features: [
			{
				name: __('Enquiry button', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Quote button', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Enquiry cart', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Quote cart', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Multi enquiry button', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Wholesale pricing block', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Dynamic pricing block', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Live page builder', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Form builder', 'catalogx'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __('Enquiry features', 'catalogx'),
		features: [
			{
				name: __('Flexible enquiry form display', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Product links in enquiry emails', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('WPML compatibility', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Custom enquiry form position', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Multi enquiry support', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Enquiry cart', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Enquiry email templates', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Form builder', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Enquiry management dashboard', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Combined selling and enquiry mode', 'catalogx'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __('Quotation features', 'catalogx'),
		features: [
			{
				name: __('Add to quote button', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Variable product support', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Universal quote access', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Cart to quote conversion', 'catalogx'),
				free: true,
				pro: true,
			},
			{
				name: __('Customizable quote button', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('PDF quote viewing', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Custom thank you page', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Custom quote creation', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Quote acceptance and rejection', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Admin quote notifications', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('User quote management', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Quote expiration', 'catalogx'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __('Wholesale pricing', 'catalogx'),
		features: [
			{
				name: __('Wholesale customer role', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Show or hide retail prices', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Wholesale pricing fields', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Coupon restrictions for wholesalers', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Hide products without wholesale pricing', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Global wholesale pricing', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Minimum cart quantity', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Per-product minimum quantity', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Wholesale order form', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Percentage discounts', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Fixed amount discounts', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Per-user wholesale pricing', 'catalogx'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __('Dynamic pricing', 'catalogx'),
		features: [
			{
				name: __('Role-based pricing rules', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Customer-specific pricing', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Fixed pricing adjustments', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Discounts and markups', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Bulk pricing adjustments', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Quantity-based pricing', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Replace product prices with markups', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Custom user roles', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Drag-and-drop rule priority', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Product-level pricing rules', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Multi-tier pricing', 'catalogx'),
				free: false,
				pro: true,
			},
			{
				name: __('Category-based pricing rules', 'catalogx'),
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
							href="https://catalogx.com/pricing/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx"
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
							<img src={CatalogxBrand} alt="" />
						</div>

						<div className="title">
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
								href="https://catalogx.com/pricing/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=catalogx"
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
