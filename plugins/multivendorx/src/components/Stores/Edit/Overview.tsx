/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import axios from 'axios';

import {
	CardComponent,
	ColumnComponent,
	ContainerComponent,
	InformationItemComponent,
	TrendStatComponent,
} from '@zyra/components';
import { getApiLink, useModules } from '@zyra/core';
import { formatCurrency } from '../../../services/commonFunction';
import LatestReview from './LatestReview';
import LatestRefundRequest from './LatestRefundRequest';
import { applyFilters } from '@wordpress/hooks';

interface OverviewProps {
	id: string | null;
	storeData?: StoreData;
	onUpdate: (data: Record<string, string>) => void;
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
		display_name?: string;
		user_email?: string;
	};
	payment_methods?: Record<string, { primary?: boolean }>;
}
const formatMethod = (method: string): string => {
	if (!method || typeof method !== 'string') {
		return '';
	}
	return method
		.replace(/-/g, ' ') // stripe-connect → stripe connect
		.replace(/\b\w/g, (c) => c.toUpperCase()); // Stripe connect → Stripe Connect
};

const getPrimaryPaymentMethodId = (
	paymentMethods?: StoreData['payment_methods']
): string | null => {
	if (!paymentMethods) {
		return null;
	}
	const entries = Object.entries(paymentMethods);
	const primaryEntry = entries.find(([, value]) => value?.primary === true);
	if (primaryEntry) {
		return primaryEntry[0];
	}
	return entries.length === 1 ? entries[0][0] : null;
};
const Overview: React.FC<OverviewProps> = ({ id, storeData, onUpdate }) => {
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
			url: getApiLink(appLocalizer, 'transactions'),
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

	// The store's money, as the dashboard's tiles: what it can withdraw now, what is still settling, what it asked for.
	const balanceTiles = [
		{
			icon: 'wallet',
			label: __('Wallet balance', 'multivendorx'),
			value: formatCurrency(storeData?.transactions?.balance ?? 0),
			caption: __('Ready to pay out', 'multivendorx'),
		},
		{
			icon: 'dollar',
			label: __('Upcoming balance', 'multivendorx'),
			value: formatCurrency(
				storeData?.transactions?.locking_balance ?? 0
			),
			caption: __('Still in the clearance period', 'multivendorx'),
		},
		{
			icon: 'wallet-in',
			label: __('Requested payout', 'multivendorx'),
			value: formatCurrency(storeData?.request_withdrawal_amount ?? 0),
			caption: __('Waiting for your approval', 'multivendorx'),
		},
	];

	/** A card header's "View all →" link, in place of a bare external-link icon. */
	const viewAll = (
		onClick: () => void,
		label: string = __('View all', 'multivendorx')
	) => (
		<button type="button" className="mvx-store-more" onClick={onClick}>
			{label}
			<i className="adminfont-arrow-right" aria-hidden="true" />
		</button>
	);

	const primaryMethodId = getPrimaryPaymentMethodId(
		storeData?.payment_methods
	);

	return (
		<>
			<ContainerComponent>
				<ColumnComponent grid={8}>
					<TrendStatComponent cols={3} items={balanceTiles} />
					<CardComponent
						title={__('Recent payouts', 'multivendorx')}
						desc={__(
							'The latest money paid out to this store.',
							'multivendorx'
						)}
						action={viewAll(() =>
							navigate(
								`?page=multivendorx#&tab=transaction-history&store_id=${id}`
							)
						)}
					>
						{recentDebits && recentDebits.length > 0 ? (
							recentDebits.map((txn) => (
								<InformationItemComponent
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
							<p className="mvx-store-empty">
								{__(
									'No payouts yet. Each one this store receives shows up here.',
									'multivendorx'
								)}
							</p>
						)}
					</CardComponent>
					{/* <CardComponent
						title={__('Store availability', 'multivendorx')}
						titleIcon="storefront"
						desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
						iconName="external icon"
						onIconClick={() => {
							navigate(
								`?page=multivendorx#&tab=transaction-history&store_id=${id}`
							);
						}}
					>
						<ColumnComponent row>
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
						</ColumnComponent>


						
						<div className="ui-notice type-info display-notice"><i className="admin-font adminfont-info"></i><div className="notice-details"><div className="notice-desc">
				
							<b>Next opening time </b>is auto-calculated from the working hours in the sidebar.
						</div></div></div>

					</CardComponent> */}
					<CardComponent
						title={__('Latest products', 'multivendorx')}
						desc={__(
							'The newest products/listings in this store and their prices.',
							'multivendorx'
						)}
						action={viewAll(() =>
							window.open(
								`${appLocalizer.admin_url}edit.php?post_type=product&multivendorx_store_id=${id}`,
								'_self'
							)
						)}
					>
						{recentProducts.length > 0 ? (
							recentProducts.map((product) => {
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
									<InformationItemComponent
										key={product.id}
										title={product.name}
										titleLink={editUrl}
										avatar={{
											image: productImage,
											iconClass:
												'item-icon adminfont-single-product admin-color-2',
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
							<p className="mvx-store-empty">
								{__(
									'No products/listings yet.',
									'multivendorx'
								)}
							</p>
						)}
					</CardComponent>

					{modules.includes('store-review') && (
						<CardComponent
							title={__('Latest reviews', 'multivendorx')}
							desc={__(
								'What customers said about this store most recently.',
								'multivendorx'
							)}
							action={viewAll(() =>
								navigate(
									`?page=multivendorx#&tab=customers&subtab=store-review`
								)
							)}
						>
							<LatestReview store_id={id} />
						</CardComponent>
					)}

					{modules.includes('marketplace-refund') && (
						<CardComponent
							title={__('Latest refunds', 'multivendorx')}
							desc={__(
								'Recent refund requests on this store’s orders.',
								'multivendorx'
							)}
							action={viewAll(() =>
								navigate(
									`?page=multivendorx#&tab=reports&subtab=refunded-orders`
								)
							)}
						>
							<div className="store-owner-details owner">
								<LatestRefundRequest store_id={id} />
							</div>
						</CardComponent>
					)}
				</ColumnComponent>
				<ColumnComponent grid={4}>
					{/* The facts an admin checks first, as one list: label left, value right. */}
					<CardComponent
						title={__('Store details', 'multivendorx')}
						className="mvx-store-details"
					>
						<dl className="mvx-store-facts">
							<div>
								<dt>{__('Owner', 'multivendorx')}</dt>
								<dd>
									{storeData?.primary_owner_info
										?.display_name || '—'}
								</dd>
							</div>
							{storeData?.primary_owner_info?.user_email && (
								<div>
									<dt>{__('Owner email', 'multivendorx')}</dt>
									<dd>
										<a
											href={`mailto:${storeData.primary_owner_info.user_email}`}
										>
											{
												storeData.primary_owner_info
													.user_email
											}
										</a>
									</dd>
								</div>
							)}
							<div>
								<dt>{__('Payment method', 'multivendorx')}</dt>
								<dd>
									{primaryMethodId ? (
										<span className="admin-badge purple method">
											<i className="adminfont-bank"></i>
											{formatMethod(primaryMethodId)}
										</span>
									) : (
										<>
											<span className="mvx-store-muted">
												{__(
													'None saved',
													'multivendorx'
												)}
											</span>
											{viewAll(
												() =>
													navigate(
														`?page=multivendorx#&tab=stores&edit/${id}/&subtab=payment`
													),
												__('Set up', 'multivendorx')
											)}
										</>
									)}
								</dd>
							</div>
							<div>
								<dt>
									{__('Compliance & records', 'multivendorx')}
								</dt>
								<dd>
									{viewAll(
										() =>
											navigate(
												`?page=multivendorx#&tab=stores&edit/${id}/&subtab=compliance-records`
											),
										__('View', 'multivendorx')
									)}
								</dd>
							</div>
						</dl>
					</CardComponent>
					{applyFilters(
						'multivendorx_store_edit_right_section',
						null,
						id,
						storeData,
						modules,
						onUpdate
					)}
				</ColumnComponent>
			</ContainerComponent>
		</>
	);
};

export default Overview;
