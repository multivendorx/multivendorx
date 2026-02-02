import { AdminBreadcrumbs, Container } from 'zyra';
// import '../Settings/Notification/Notification.scss';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Plans = () => {
	const navigate = useNavigate();
	const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
	const demoPlans = [
		{
			id: 1,
			tag: null,
			title: 'Basic',
			icon: 'adminfont-supervised-user-circle',
			activeVendors: 89,
			price: '29',
			revenue: 2581,
			growth: '+12%',
			description: 'Lorem ipsum dolor sit amet consectetur.',
			checklist: ['5 Products', 'Basic Support', '2% Commission'],
		},
		{
			id: 2,
			tag: 'MOST POPULAR',
			title: 'Professional',
			icon: 'adminfont-security',
			activeVendors: 124,
			price: '59',
			revenue: 7316,
			growth: '+12%',
			description: 'Everything in Basic plus more.',
			checklist: [
				'50 Products',
				'Priority Support',
				'1.5% Commission',
				'Analytics',
			],
		},
		{
			id: 3,
			tag: null,
			title: 'Premium',
			activeVendors: 34,
			icon: 'adminfont-resources',
			price: '99 ',
			revenue: 3366,
			growth: '+8%',
			description: 'Best for large-scale businesses.',
			checklist: [
				'Unlimited Products',
				'24/7 Support',
				'1% Commission',
				'Advanced Analytics',
				'Custom Branding',
			],
		},
		{
			id: 4,
			tag: null,
			title: 'Enterprise',
			activeVendors: 0,
			icon: 'adminfont-wallet-open',
			price: '299',
			revenue: null,
			growth: null,
			description: 'Tailored pricing for your needs',
			checklist: [
				'Everything in Premium',
				'Dedicated Manager',
				'Custom Integration',
				'White Label',
			],
		},
	];

	return (
		<>
			<Container general>
				<div className="buttons-wrapper toggle-setting-wrapper view-toggle">
					<div className="tabs-wrapper">
						{['list', 'grid'].map((mode) => (
							<div
								key={mode}
								role="button"
								className="toggle-option"
								tabIndex={0}
								onClick={() =>
									setViewMode(mode as 'list' | 'grid')
								}
								onKeyDown={(e) =>
									e.key === 'Enter' &&
									setViewMode(mode as 'list' | 'grid')
								}
							>
								<input
									className="toggle-setting-form-input"
									type="radio"
									id={`${mode}-view`}
									name="view-mode"
									value={mode}
									checked={viewMode === mode}
									readOnly
								/>
								<label htmlFor={`${mode}-view`}>
									<i
										className={
											mode === 'list'
												? 'adminfont-editor-list-ul'
												: 'adminfont-module'
										}
									></i>
								</label>
							</div>
						))}
					</div>
					<div
						className="admin-btn btn-purple-bg"
						onClick={() => {
							navigate(
								`?page=multivendorx#&tab=memberships&add/`
							);
						}}
					>
						<i className="adminfont-plus"></i>
						Add New Plan
					</div>
				</div>
				{viewMode === 'list' && (
					<div className="notification-container">
						<div className="table-wrapper">
							<table className="admin-table">
								<thead className="admin-table-header">
									<tr className="header-row">
										<th className="header-col">
											Plan Name
										</th>
										<th className="header-col">
											Description
										</th>
										<th className="header-col">
											Price
										</th>
										<th className="header-col action">
											Action
										</th>
									</tr>
								</thead>
								<tbody className="admin-table-body">
									{demoPlans.map((plan) => (
										<tr className="admin-row">
											<td className="admin-column">
												<div className="table-row-custom">
													<div className="product-wrapper notification">
														<span
															className={`item-icon notification-icon adminfonts ${plan.icon}`}
														></span>
														<div className="details">
															<div className="title">
																{plan.title}
															</div>
														</div>
													</div>
												</div>
											</td>
											<td className="admin-column">
												<div className="table-row-custom">
													<div className="recipients-list">
														{plan.description}
													</div>
												</div>
											</td>
											<td className="admin-column">
												<div className="table-row-custom">
													<div className="recipients-list">
														${plan.price} /month
													</div>
												</div>
											</td>
											<td className="admin-column action">
												<div className="action-section">
													<div className="action-icons">
														<div className="inline-actions">
															<div className="inline-action-btn tooltip-wrapper">
																<i className="adminfont-edit"></i>
																<span className="tooltip-name">
																	Edit
																</span>
															</div>
														</div>
													</div>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}
				{viewMode === 'grid' && (
					<div className="notification-container">
						<div className="notification-grid">
							{demoPlans.map((plan) => (
								<div
									className="notification-card"
									key={plan.id}
								>
									<div className="card-body">
										<div className="title-wrapper">
											<i
												className={`notification-icon ${plan.icon}`}
											></i>
											<div className="details">
												<div className="title">
													{plan.title}
												</div>
												<div className="description">
													{plan.description}
												</div>
											</div>
										</div>

										<div className="checklist-title">
											What's Included
										</div>
										<ul className="checklist">
											{plan.checklist.map(
												(item, idx) => (
													<li key={idx}>
														<i className="check adminfont-icon-yes"></i>
														{item}
													</li>
												)
											)}
										</ul>
									</div>

									<div className="card-footer">
										<div className="price">
											${plan.price}{' '}
											<span>/month</span>
										</div>
										<div className="admin-btn btn-purple">
											Edit Plan
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</Container>
		</>
	);
};

export default Plans;
