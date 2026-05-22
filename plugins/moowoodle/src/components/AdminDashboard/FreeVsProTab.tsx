import React from 'react';
import { Card, Column, Container } from 'zyra';
import { __ } from '@wordpress/i18n';
import MoowoodleConcept from '../../assets/images/moowoodle-concept.png';
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
		title: __('Power your Moodle eLearning platform', 'moowoodle'),
		features: [
			{
				name: __('Connect Moodle with WordPress', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('WooCommerce course selling', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Course synchronization', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Course category synchronization', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('One-click enrollment', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Student enrollment management', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Moodle test connection', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Log viewer & debugging tools', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Course listing management', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Multilingual support', 'moowoodle'),
				free: true,
				pro: true,
			},
		],
	},
	{
		title: __('Manage courses with advanced controls', 'moowoodle'),
		features: [
			{
				name: __('Import courses as draft', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Course status control', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Course image synchronization', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Course group synchronization', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Automatically create new products', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Automatically update existing products', 'moowoodle'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __('Synchronize users and access seamlessly', 'moowoodle'),
		features: [
			{
				name: __('Basic user synchronization', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Real-time user synchronization', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Bidirectional synchronization', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('User profile field mapping', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Existing user synchronization', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Single Sign-On (SSO)', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __(
					'Synced login/logout between Moodle & WordPress',
					'moowoodle'
				),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __('Sell courses your way', 'moowoodle'),
		features: [
			{
				name: __('Individual course enrollment', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Classroom / multi-seat enrollment', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Cohort enrollment', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Group enrollment via variations', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Course gifting', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Seat reassignment', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Bulk student enrollment', 'moowoodle'),
				free: false,
				pro: true,
			},
		],
	},
	{
		title: __('Flexible pricing and subscriptions', 'moowoodle'),
		features: [
			{
				name: __('One-time course purchase', 'moowoodle'),
				free: true,
				pro: true,
			},
			{
				name: __('Tiered course access', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Subscription-based courses', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Tiered subscription support', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Bundled courses', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Multiple pricing models', 'moowoodle'),
				free: false,
				pro: true,
			},
			{
				name: __('Course variations support', 'moowoodle'),
				free: false,
				pro: true,
			},
		],
	},
];

const FreeVsProTab: React.FC = () => {
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
							<table key={`${idx}-${section.title}`}>
								<thead>
									<tr>
										<th scope="col">{section.title}</th>
										<th scope="col">
											{__('Free', 'moowoodle')}
										</th>
										<th scope="col">
											{__('Pro', 'moowoodle')}
										</th>
									</tr>
								</thead>
								<tbody>
									{section.features.map((feature) => (
										<tr
											key={`${section.title}-${feature.name}`}
										>
											<td>{feature.name}</td>
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
							<img
								src={MoowoodleConcept}
								alt={__(
									'Moowoodle marketplace concept illustration',
									'moowoodle'
								)}
							/>
						</div>

						<div className="title">
							{__(
								'Powering modern eLearning businesses worldwide',
								'moowoodle'
							)}
						</div>

						<div className="des">
							{__(
								'From individual educators to large training organizations, MooWoodle helps simplify course selling, learner management, and Moodle-WooCommerce integration at scale.',
								'moowoodle'
							)}
						</div>

						<ul>
							<li>
								<i className="adminfont-check"></i>
								{__(
									'Sell course with WooCommerce',
									'moowoodle'
								)}
							</li>
							<li>
								<i className="adminfont-check"></i>
								{__('Automate course enrollments', 'moowoodle')}
							</li>
							<li>
								<i className="adminfont-check"></i>
								{__(
									'Classroom, cohort based learning',
									'moowoodle'
								)}
							</li>
							<li>
								<i className="adminfont-check"></i>
								{__(
									'Seamless Single Sign-On experiences',
									'moowoodle'
								)}
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
