/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import axios from 'axios';
import {
	Analytics,
	Card,
	Column,
	Container,
	getApiLink,
	InfoItem,
	useModules,
	FormGroupWrapper,
	FormGroup,
	ButtonInputUI,
	PopupUI,
	MultiCheckBoxUI,
	CalendarInputUI,
	TextAreaUI,
	ChoiceToggleUI,
	ItemListUI,
	TableCard,
	Notice,
	SectionUI,
} from 'zyra';
import { formatCurrency } from '../../../services/commonFunction';
import LatestReview from './LatestReview';
import LatestRefundRequest from './LatestRefundRequest';

interface OverviewProps {
	id: string | null;
	storeData?: StoreData;
}

interface Transaction {
	id: number;
	amount: string | number;
	date: string;
	transaction_type: string;
	transaction_status: string;
}

interface Product {
	id: number;
	name: string;
	sku: string;
	price: string | number;
	images?: Array<{ src: string }>;
}

interface StoreData {
	transactions?: {
		balance?: number;
		locking_balance?: number;
	};
	request_withdrawal_amount?: number;
	create_time?: string;
	commission?: {
		commission_total?: number;
	};
	primary_owner_info?: {
		data?: {
			display_name?: string;
			user_email?: string;
		};
	};
}

const Overview: React.FC<OverviewProps> = ({ id, storeData }) => {
	const navigate = useNavigate();
	const { modules } = useModules();

	const [recentDebits, setRecentDebits] = useState<Transaction[]>([]);
	const [recentProducts, setRecentProducts] = useState<Product[]>([]);
	const [Vacation, setVacation] = useState(false);
	const [vacationMode, setvacationMode] = useState<string[]>([]);
	const [hours, sethours] = useState(false);

	useEffect(() => {
		if (!id) {
			return;
		}

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'transaction'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				page: 1,
				row: 3,
				store_id: id,
				transaction_type: 'Withdrawal',
				transaction_status: 'Completed',
				filter_status: 'Dr',
				orderBy: 'created_at',
				order: 'DESC',
			},
		})
			.then((response) => {
				setRecentDebits(response.data.transaction || []);
			})
			.catch((error) => {
				console.error(
					'Error fetching recent debit transactions:',
					error
				);
				setRecentDebits([]);
			});

		axios({
			method: 'GET',
			url: `${appLocalizer.apiUrl}/wc/v3/products`,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				page: 1,
				per_page: 3,
				orderby: 'date',
				order: 'desc',
				meta_key: 'multivendorx_store_id',
				value: id,
			},
		})
			.then((response) => {
				setRecentProducts(response.data);
			})
			.catch((error) => {
				console.error('Failed to fetch recent products:', error);
			});
	}, []);

	useEffect(() => {
		const highlightId = location.state?.highlightTarget;
		if (highlightId) {
			const target = document.getElementById(highlightId);

			if (target) {
				target.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
				});
				target.classList.add('highlight');
				const handleClick = () => {
					target.classList.remove('highlight');
					document.removeEventListener('click', handleClick);
				};
				setTimeout(() => {
					document.addEventListener('click', handleClick);
				}, 100);
			}
		}
	}, [location.state]);

	const overviewData = [
		{
			icon: 'wallet red',
			number: formatCurrency(storeData.transactions?.balance ?? 0),
			text: __('Wallet Balance', 'multivendorx'),
		},
		{
			icon: 'dollar yellow',
			number: formatCurrency(
				storeData.transactions?.locking_balance ?? 0
			),
			text: __('Upcoming Balance', 'multivendorx'),
		},
		{
			icon: 'wallet-in blue',
			number: formatCurrency(storeData.request_withdrawal_amount ?? 0),
			text: __('Requested Payout', 'multivendorx'),
		},
	];
	const handleCloseForm = () => {
		setVacation(false);
	};
	const handleClosehours = () => {
		sethours(false);
	};

	// business hours table (dynamic and remove)
	const scheduleColumns = {
		day: {
			label: 'Day',
		},
		time: {
			label: 'Working Hours',
		},
	};
	const scheduleRows = [
		{ day: 'Mon', time: '9:00 AM–7:00 PM', break: 'Lunch' },
		{ day: 'Tue', time: '9:00 AM–7:00 PM', break: 'Lunch' },
		{ day: 'Wed', time: '9:00 AM–7:00 PM', break: '-' },
		{ day: 'Thu', time: '9:00 AM–7:00 PM', break: 'Lunch' },
		{ day: 'Fri', time: '9:00 AM–6:00 PM', break: 'Lunch' },
		{ day: 'Sat', time: '10:00 AM–4:00 PM', break: '-' },
		{ day: 'Sun', time: 'Closed', break: '-' },
	];
	return (
		<>
			<Container>
				<Column grid={8}>
					<Analytics
						variant="small"
						data={overviewData.map((item) => ({
							icon: item.icon,
							number: item.number,
							text: item.text,
						}))}
					/>
					<Card
						title={__('Recent payouts', 'multivendorx')}
						iconName="external icon"
						onIconClick={() => {
							navigate(
								`?page=multivendorx#&tab=transaction-history&store_id=${id}`
							);
						}}
					>
						{recentDebits && recentDebits.length > 0 ? (
							recentDebits.map((txn) => (
								<InfoItem
									key={txn.id}
									title={__('Bank Transfer', 'multivendorx')}
									descriptions={[
										{
											value: new Date(
												txn.date
											).toLocaleDateString('en-US', {
												month: 'short',
												day: '2-digit',
												year: 'numeric',
											}),
										},
									]}
									amount={formatCurrency(txn.amount)}
								/>
							))
						) : (
							<div className="no-data">
								{__('No recent payout', 'multivendorx')}
							</div>
						)}
					</Card>
					{/* <Card
						title={__('Store availability', 'multivendorx')}
						iconName="external icon"
						onIconClick={() => {
							navigate(
								`?page=multivendorx#&tab=transaction-history&store_id=${id}`
							);
						}}
					>
						<Column row>
							<ItemListUI
								className="mini-card"
								background
								items={[
									{
										title: __(
											'Current status',
											'multivendorx'
										),
										desc: __(
											'Accepting orders from customers',
											'multivendorx'
										),
										value: __('Store', 'multivendorx'),
										tags: (
											<span className="admin-badge green">
												{__('Open', 'multivendorx')}
											</span>
										)
									}
								]}
							/>
							<ItemListUI
								className="mini-card"
								background
								items={[
									{
										title: __(
											'Next opening time',
											'multivendorx'
										),
										desc: __(
											'Calculated from working hours',
											'multivendorx'
										),
										value: __('Mon 9:00 AM', 'multivendorx'),
									},
								]}
							/>
						</Column>


						
						<div className="ui-notice type-info display-notice"><i className="admin-font adminfont-info"></i><div className="notice-details"><div className="notice-desc">
				
							<b>Next opening time </b>is auto-calculated from the working hours in the sidebar.
						</div></div></div>

					</Card> */}
					<Card
						title={__('Latest products', 'multivendorx')}
						iconName="external icon"
						onIconClick={() => {
							window.open(
								`${appLocalizer.admin_url}edit.php?post_type=product`,
								'_self'
							);
						}}
					>
						{recentProducts.length > 0 ? (
							recentProducts.map((product, idx) => {
								const productImage =
									product.images && product.images.length > 0
										? product.images[0].src
										: null;
								const editUrl = `${appLocalizer.site_url.replace(
									/\/$/,
									''
								)}/wp-admin/post.php?post=${product.id
									}&action=edit`;

								return (
									<InfoItem
										key={product.id}
										title={product.name}
										titleLink={editUrl}
										avatar={{
											image: productImage,
											iconClass: `item-icon adminfont-single-product admin-color${idx + 2}`,
										}}
										descriptions={[
											{
												label: __(
													'sku',
													'multivendorx'
												),
												value: product.sku,
											},
										]}
										amount={formatCurrency(
											product.price ?? 0
										)}
									/>
								);
							})
						) : (
							<p className="no-data">
								{__(
									'No recent products found.',
									'multivendorx'
								)}
							</p>
						)}
					</Card>

					{modules.includes('store-review') && (
						<Card
							title={__('Latest reviews', 'multivendorx')}
							iconName="external icon"
							onIconClick={() => {
								navigate(
									`?page=multivendorx#&tab=customer-support&subtab=review`
								);
							}}
						>
							<LatestReview store_id={id} />
						</Card>
					)}

					{modules.includes('marketplace-refund') && (
						<Card
							title={__('Latest refunds', 'multivendorx')}
							iconName="external icon"
							onIconClick={() => {
								navigate(
									`?page=multivendorx#&tab=customer-support&subtab=refund-requests`
								);
							}}
						>
							<div className="store-owner-details owner">
								<LatestRefundRequest store_id={id} />
							</div>
						</Card>
					)}
				</Column>
				<Column grid={4}>
					<Card
						title={__('Subscription plan', 'multivendorx')}
						action={
							<ButtonInputUI
								buttons={[
									{
										icon: 'vacation',
										text: __('Change plan', 'multivendorx'),
										color: 'purple'
										// onClick: () => setVacation(true),
									},
								]}
							/>
						}
					>
						<div className="plan-wrapper">
							<div className="plan-details">
								<div className="icon"><i className="adminfont-verification5" /></div>
								<div className="name">Gold Plan</div>
							</div>

							<div className="billing-wrapper">
								<div className="item">
									<b>	Next billing:  </b> Dec 15, 2024
								</div>
								<div className="item">
									<b>	Billing cycle:  </b> Monthly
								</div>
							</div>

							<div className="plan-status"><span className="admin-badge green">Active</span></div>

						</div>
					</Card>

					<div className="store-details-remove-class">
						<Card
							title={__('Store overview', 'multivendorx')}
						>
							<FormGroupWrapper>
								{/* <FormGroup
									row
									label={__('Registered', 'multivendorx')}
								>
									{__('Mon 9:00 AM (pkoro)', 'multivendorx')}
								</FormGroup> */}
								{/* <FormGroup
									row
									label={__('Lifetime earnings', 'multivendorx')}
								>
									{formatCurrency(
										storeData.commission?.commission_total ?? 0
									)}
								</FormGroup> */}
								<FormGroup
									row
									label={__('Application', 'multivendorx')}
								>
									<a
										className="sku"
										onClick={() => {
											navigate(
												`?page=multivendorx#&tab=stores&edit/${id}/&subtab=application-details`
											);
										}}
									>
										{__('View details', 'multivendorx')}
									</a>
								</FormGroup>
								{/* <SectionUI title={__('Contact', 'multivendorx')} />
								<FormGroup
									row
									label={__('Phone', 'multivendorx')}
								>
									{__('02-44801223', 'multivendorx')}
								</FormGroup>
								<FormGroup
									row
									label={__('Email', 'multivendorx')}
								>
									{__('dummy_store5@dokan.com', 'multivendorx')}
								</FormGroup> */}

								<SectionUI title={__('Settings', 'multivendorx')} />
								<FormGroup
									row
									label={__('Commission', 'multivendorx')}
								>
									{__('Category based', 'multivendorx')}
								</FormGroup>
								<FormGroup
									row
									label={__('Payment method', 'multivendorx')}
								>
									{__('Bank transfer', 'multivendorx')}
								</FormGroup>
							</FormGroupWrapper>
						</Card>
					</div>

					<Card
						title={__('Store availability', 'multivendorx')}
						action={
							<ButtonInputUI
								buttons={[
									{
										icon: 'vacation',
										text: __('Set Vacation', 'multivendorx'),
										color: 'purple',
										onClick: () => setVacation(true),
									}
								]}
							/>
						}
					>
						{appLocalizer.khali_dabba && (
							<>
								{/* <FormGroup
										row
										label={__(
											'Vacation mode',
											'multivendorx'
										)}
									>
										<span className="admin-badge red">
											{' '}
											{__(
												'Inactive(pkoro)',
												'multivendorx'
											)}
										</span>
									</FormGroup> */}
								<div className="vacation-wrapper">
									<span className="adminfont-vacation blue"></span>
									<div className="vacation-details">
										<div className="title">Vacation is off</div>
										<div className="desc">Store is accepting orders normally</div>
									</div>
								</div>
								<PopupUI
									open={Vacation}
									onClose={handleCloseForm}
									width={31.25}
									height={40}
									header={{
										icon: 'vacation',
										title: __('Store availability', 'multivendorx'),
										description: __(
											'Temporarily pause your store for a set period',
											'multivendorx'
										),
									}}
									footer={
										<ButtonInputUI
											buttons={[
												{
													icon: 'close',
													text: __(
														'Cancel',
														'multivendorx'
													),
													color: 'red',
													onClick: handleCloseForm,
												},
												{
													icon: 'save',
													text: __(
														'Save Vacation Settings',
														'multivendorx'
													),
													// onClick: () => handleSubmit(),
												},
											]}
										/>
									}
								>
									<FormGroupWrapper>

										<FormGroup
											cols={2}
											label={__('Start Date', 'multivendorx')}
										>
											<CalendarInputUI
											// onChange={(range: DateRange) => {
											// 	setDateRange({
											// 		startDate: range.startDate,
											// 		endDate: range.endDate,
											// 	});
											// }}
											/>
										</FormGroup>
										<FormGroup
											cols={2}
											label={__('End Date', 'multivendorx')}
										>
											<CalendarInputUI
											// onChange={(range: DateRange) => {
											// 	setDateRange({
											// 		startDate: range.startDate,
											// 		endDate: range.endDate,
											// 	});
											// }}
											/>
										</FormGroup>
										<FormGroup
											label={__(
												'Vacation Message',
												'multivendorx'
											)}
										>
											<TextAreaUI
												name="answer"
											// value={answer}
											// onChange={(value: string) => setAnswer(value)}
											/>
										</FormGroup>
										<FormGroup
											label={__(
												'Cart Behaviour During Vacation',
												'multivendorx'
											)}
										>
											<ChoiceToggleUI
												options={[
													{
														key: 'draft',
														value: 'draft',
														label: __(
															'Disable Add to Cart',
															'multivendorx'
														),
													},
													{
														key: 'pending',
														value: 'pending',
														label: __(
															'Keep Add to Cart Active',
															'multivendorx'
														),
													}
												]}
											// value={formData.status}
											// onChange={(val: string) =>
											// 	handleChange('status', val)
											// }
											/>
										</FormGroup>
									</FormGroupWrapper>
								</PopupUI>
							</>
						)}
					</Card>
					{/* store hours start */}
					{appLocalizer.khali_dabba && (
						<Card
							title={__('Store working hours', 'multivendorx')}
							action={
								<ButtonInputUI
									buttons={[
										{
											icon: 'vacation',
											text: __('Update working hours', 'multivendorx'),
											color: 'purple',
											onClick: () => sethours(true),
										},
									]}
								/>
							}
						>
							<FormGroupWrapper>
								<FormGroup
								>
									<div style={{ display: 'flex', gap: '0.5rem' }}>
										<span className="admin-badge green">Open Now</span>
										<span className="admin-badge blue">Close 7:00PM</span>
									</div>
								</FormGroup>
								<FormGroup
									row
									label={__('Next opening', 'multivendorx')}
								>
									{__('Open now (closes at 7:00 PM)', 'multivendorx')}
								</FormGroup>
							</FormGroupWrapper>
							<TableCard
										headers={scheduleColumns}
										rows={scheduleRows}
										showMenu={false}
									/>
							<PopupUI
								open={hours}
								onClose={handleClosehours}
								width={31.25}
								height={40}
								header={{
									icon: 'vacation',
									title: __('Store availability', 'multivendorx'),
									description: __(
										'Temporarily pause your store for a set period',
										'multivendorx'
									),
								}}
								footer={
									<ButtonInputUI
										buttons={[
											{
												icon: 'close',
												text: __(
													'Cancel',
													'multivendorx'
												),
												color: 'red',
												onClick: handleCloseForm,
											},
											{
												icon: 'save',
												text: __(
													'Save Vacation Settings',
													'multivendorx'
												),
											},
										]}
									/>
								}
							>
								<TableCard
									headers={scheduleColumns}
									rows={scheduleRows}
									showMenu={false}
								/>
							</PopupUI>
						</Card>
					)}

					{/* store hours end */}

					{/* <Card
						title={__('Store staff', 'multivendorx')}
						iconName="external icon"
						onIconClick={() => {
							navigate(
								`?page=multivendorx#&tab=stores&edit/${id}/&subtab=staff`
							);
						}}
					>
						<InfoItem
							title={
								storeData.primary_owner_info?.data
									?.display_name ?? <Skeleton width={9.375} />
							}
							avatar={{
								iconClass:
									'item-icon adminfont-person secondary',
							}}
							descriptions={[
								{
									label: __('Email', 'multivendorx'),
									value: storeData.primary_owner_info?.data
										?.user_email ?? (
										<Skeleton width={9.375} />
									),
								},
							]}
							badges={[
								{
									text: __('Primary Owner', 'multivendorx'),
									className: 'green',
								},
								{
									text: <i className="adminfont-edit" />,
									className: 'blue',
									onClick: () => {
										navigate(
											`?page=multivendorx#&tab=stores&edit/${id}/&subtab=staff`,
											{
												state: {
													highlightTarget:
														'primary-owner',
												},
											}
										);
										setTimeout(() => {
											navigate(
												`?page=multivendorx#&tab=stores&edit/${id}/&subtab=staff`,
												{ replace: true }
											);
										}, 500);
									},
								},
							]}
						/>
					</Card> */}
				</Column>
			</Container>
		</>
	);
};

export default Overview;
