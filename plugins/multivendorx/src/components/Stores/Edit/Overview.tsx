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
	SectionUI,
	ComponentStatusView,
} from 'zyra';
import { formatCurrency } from '../../../services/commonFunction';
import LatestReview from './LatestReview';
import LatestRefundRequest from './LatestRefundRequest';
import { applyFilters } from '@wordpress/hooks';

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
const formatMethod = (method) => {
	if (!method) {
		return '';
	}
	return method
		.replace(/-/g, ' ') // stripe-connect → stripe connect
		.replace(/\b\w/g, (c) => c.toUpperCase()); // Stripe connect → Stripe Connect
};
const Overview: React.FC<OverviewProps> = ({ id, storeData }) => {
	const navigate = useNavigate();
	const { modules } = useModules();

	const [recentDebits, setRecentDebits] = useState<Transaction[]>([]);
	const [recentProducts, setRecentProducts] = useState<Product[]>([]);

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
								)}/wp-admin/post.php?post=${
									product.id
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
							<ComponentStatusView title={__( 'No recent products found.', 'multivendorx' )} />
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
						<Card title={__('Store overview', 'multivendorx')}>
							<FormGroupWrapper>
								<FormGroup
									row
									label={__('Application', 'multivendorx')}
								>
									<a
										className="sku"
										onClick={() => {
											navigate(
												`?page=multivendorx#&tab=stores&edit/${id}/&subtab=compliance-records`
											);
										}}
									>
										{__('View details', 'multivendorx')}
									</a>
								</FormGroup>
							<SectionUI
								title={__('Settings', 'multivendorx')}
							/>
							<FormGroup
								row
								label={__('Payment method', 'multivendorx')}
							>
								{storeData?.payment_method ? (
									<div className="admin-badge purple method">
										<i className="adminfont-bank"></i>
										{formatMethod(
											storeData.payment_method
										)}
									</div>
								) : (
									<span>
										{__(
											'No payment method saved',
											'multivendorx'
										)}
									</span>
								)}
							</FormGroup>
						</FormGroupWrapper>
					</Card>
					{applyFilters(
						'multivendorx_store_edit_right_section',
						null,
						id,
						storeData,
						modules
					)}
				</Column>
			</Container>
		</>
	);
};

export default Overview;
