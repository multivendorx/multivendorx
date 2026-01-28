import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import axios from 'axios';
import { Analytics, Card, Column, Container, getApiLink, InfoItem, useModules, Skeleton } from 'zyra';
import { formatCurrency } from '../../../services/commonFunction';
import LatestReview from './latestReview';
import LatestRefundRequest from './latestRefundRequest';

interface OverviewProps {
	id: string | null;
	storeData?: any;
}

const Overview: React.FC<OverviewProps> = ({ id, storeData }) => {
	const navigate = useNavigate();
	const { modules } = useModules();

	const [recentDebits, setRecentDebits] = useState<any[]>([]);
	const [recentProducts, setRecentProducts] = useState<any[]>([]);

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
			text: 'Wallet balance',
		},
		{
			icon: 'dollar yellow',
			number: formatCurrency(storeData.transactions?.locking_balance ?? 0),
			text: 'Upcoming balance',
		},
		{
			icon: 'wallet-in blue',
			number: formatCurrency(storeData.request_withdrawal_amount ?? 0),
			text: 'Requested payout',
		},
	];

	return (
		<>
			<Container>
				<Column grid={8}>
					<Analytics
						variant='small'
						data={overviewData.map((item) => ({
							icon: item.icon,
							number: item.number,
							text: item.text,
						}))}
					/>
					<div className="card-wrapper">
						<Card
							title={__('Recent payouts', 'multivendorx')}
							iconName="adminfont-external icon"
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
												value: new Date(txn.date).toLocaleDateString('en-US', {
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
					</div>

					<Card
						title={__('Latest products', 'multivendorx')}
						iconName="adminfont-external icon"
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
									product.images &&
										product.images.length > 0
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
												label: __('sku', 'multivendorx'),
												value: product.sku,
											},
										]}
										amount={formatCurrency(product.price ?? 0)}
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
							iconName="adminfont-external icon"
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
							iconName="adminfont-external icon"
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
					{appLocalizer.khali_dabba && (
						<Card
							title={__('Store hours', 'multivendorx')}
							desc={__(
								'Manage your weekly schedule and special hours',
								'multivendorx'
							)}>

							<div className="store-time-wrapper">
								<div className="card-wrapper">
									<div className="time-wrapper">
										<div className="des">
											{__(
												'Current status',
												'multivendorx'
											)}
										</div>
										<div className="time">
											<span className="admin-badge green">
												{__('Open', 'multivendorx')}
											</span>
										</div>
									</div>
									<div className="time-wrapper">
										<div className="des">
											{__('Next opening', 'multivendorx')}
										</div>
										<div className="time">
											{__('Mon 9:00 AM', 'multivendorx')}
										</div>
									</div>
								</div>
							</div>
						</Card>
					)}
					<Card
						title={__('Store information', 'multivendorx')}
						iconName="adminfont-external icon"
						contentHeight
						onIconClick={() => {
							navigate(
								`?page=multivendorx#&tab=stores&edit/${id}/&subtab=store`
							);
						}}
					>
						<div className="overview-wrapper">
							<div className="items">
								<div className="title">
									{__('Created on', 'multivendorx')}
								</div>
								<div className="details">
									<div className="sku">
										{storeData.create_time}
										<a
											className="sku"
											onClick={() => {
												navigate(
													`?page=multivendorx#&tab=stores&edit/${id}/&subtab=application-details`
												);
											}}
										>
											{__(
												'Application Data',
												'multivendorx'
											)}
										</a>
									</div>
								</div>
							</div>
							<div className="items">
								<div className="title">
									{__('Lifetime earnings', 'multivendorx')}
								</div>
								<div className="details">
									<div className="sku">
										{formatCurrency(
											storeData.commission
												?.commission_total ?? 0
										)}
									</div>
								</div>
							</div>
							{appLocalizer.khali_dabba && (
								<div className="items">
									<div className="title">
										{__('Vacation mode', 'multivendorx')}
									</div>
									<div className="details">
										<span className="admin-badge red">
											{__('Inactive', 'multivendorx')}
										</span>
									</div>
								</div>
							)}
							{appLocalizer.khali_dabba && (
								<div className="description-wrapper">
									<div className="title">
										<i className="adminfont-error"></i>
										{__('Gold plan', 'multivendorx')}
										<span className="admin-badge green">
											{__('Active', 'multivendorx')}
										</span>
									</div>
									<div className="des">
										{__(
											'Renews on Dec 15, 2024 (p)',
											'multivendorx'
										)}
									</div>
								</div>
							)}
						</div>
					</Card>

					<Card
						title={__('Store staff', 'multivendorx')}
						iconName="adminfont-external icon"
						contentHeight
						onIconClick={() => {
							navigate(
								`?page=multivendorx#&tab=stores&edit/${id}/&subtab=staff`
							);
						}}
					>
						<InfoItem
							title={
								storeData.primary_owner_info?.data?.display_name ?? (
									<Skeleton width={150} />
								)
							}
							avatar={{
								iconClass: 'item-icon adminfont-person secondary',
							}}
							descriptions={[
								{
									label: __('Email', 'multivendorx'),
									value:
										storeData.primary_owner_info?.data?.user_email ?? (
											<Skeleton width={150} />
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
											{ state: { highlightTarget: 'primary-owner' } }
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
					</Card>
				</Column>
			</Container>
		</>
	);
};

export default Overview;
