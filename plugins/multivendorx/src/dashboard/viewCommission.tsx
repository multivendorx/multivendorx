/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink } from '@zyra/core';
import {
	FormGroupComponent,
	FormGroupWrapperComponent,
	InformationItemComponent,
	NoticeComponent,
	PopupComponent,
	SectionComponent,
} from '@zyra/components';
import { TableCard, TableRow } from '@zyra/table';
import { dashNavigate, formatCurrency } from '@/services/commonFunction';
import { useNavigate } from 'react-router-dom';

type ViewCommissionProps = {
	open: boolean;
	onClose: () => void;
	commissionId: number;
};
interface CommissionData {
	order_id?: number;
	store_id?: number;
	status?: string;
	amount?: number;
	total_order_amount?: number | string;
	shipping?: number;
	tax?: number;
	shipping_tax_amount?: number;
	commission_refunded?: number;
	commission_note?: string;
	store_refunded?: number | string;
	[key: string]: unknown;
}

interface OrderData {
	status?: string;
	shipping_lines?: Array<{
		method_title: string;
		total: string;
		total_tax: string;
	}>;
	line_items?: Array<{
		name: string;
		price: string;
		quantity: number;
		total?: string;
		total_tax?: string;
	}>;
	[key: string]: unknown;
}

const ViewCommission: React.FC<ViewCommissionProps> = ({
	open,
	onClose,
	commissionId,
}) => {
	const [commissionData, setCommissionData] = useState<CommissionData | null>(
		null
	);
	const [orderData, setOrderData] = useState<OrderData | null>(null);
	const [shippingItems, setShippingItems] = useState<TableRow[][]>([]);
	const [loading, setLoading] = useState(false);
	// Add new state
	const [orderItems, setOrderItems] = useState<TableRow[][]>([]);
	const navigate = useNavigate();
	useEffect(() => {
		if (!commissionId) {
			setCommissionData(null);
			setOrderData(null);
			setOrderItems([]);
			return;
		}
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `commissions/${commissionId}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		})
			.then((res) => {
				const commission = res.data || {};
				setCommissionData(commission);
				setLoading(true);

				if (commission.order_id) {
					axios({
						method: 'GET',
						url: `${appLocalizer.apiUrl}/wc/v3/orders/${commission.order_id}`,
						headers: { 'X-WP-Nonce': appLocalizer.nonce },
					})
						.then((orderRes) => {
							const order = orderRes.data || {};

							setOrderData(order);
							setOrderItems(order.line_items);
							setShippingItems(order.shipping_lines);
							setLoading(false);
						})
						.catch(() => {
							setOrderData(null);
							setOrderItems([]);
							setLoading(false);
						});
				}
			})
			.catch(() => {
				setCommissionData(null);
				setOrderData(null);
				setOrderItems([]);
			});
	}, [commissionId]);

	const popupColumns = {
		id: {
			label: __('Product', 'multivendorx'),
			render: (row) => {
				return (
					<InformationItemComponent
						title={row.name}
						onClick={() =>
							dashNavigate(navigate, [
								'products',
								'edit',
								String(row.product_id),
							])
						}
						avatar={{
							image: row.image?.src || '',
							iconClass: 'single-product',
						}}
						descriptions={[
							{
								label: __('SKU:', 'multivendorx'),
								value: row.sku || '—',
							},
						]}
					/>
				);
			},
		},
		price: {
			label: __('Cost', 'multivendorx'),
			type: 'currency',
		},
		quantity: {
			label: __('Qty', 'multivendorx'),
		},
		total: {
			label: __('Total', 'multivendorx'),
			type: 'currency',
		},
		total_tax: {
			label: __('Tax', 'multivendorx'),
			type: 'currency',
		},
	};

	const shippingColumns = {
		method_title: {
			label: __('Method', 'multivendorx'),
		},
		total: {
			label: __('Amount', 'multivendorx'),
			type: 'currency',
		},
		total_tax: {
			label: __('Tax', 'multivendorx'),
			type: 'currency',
		},
	};

	return (
		<PopupComponent
			open={open}
			onClose={onClose}
			width="40%"
			height="80%"
			header={{
				icon: 'commission',
				title: `${__('View Commission', 'multivendorx')}${commissionId ? ` #${commissionId}` : ''}`,
				description: __(
					'Details of this commission including stores, order breakdown, and notes.',
					'multivendorx'
				),
			}}
		>
			<div className="content multi">
				<div className="section right">
					<div className="order-overview">
						<FormGroupWrapperComponent>
							<SectionComponent
								title={__('Order Overview', 'multivendorx')}
							/>

							<FormGroupComponent
								row
								label={__('Associated Order', 'multivendorx')}
								className="space-between"
							>
								{commissionData?.order_id ? (
									<span
										className="link-item"
										onClick={() =>
											dashNavigate(navigate, [
												'orders',
												'view',
												String(commissionData.order_id),
											])
										}
									>
										#{commissionData.order_id}
									</span>
								) : (
									'-'
								)}
							</FormGroupComponent>

							<FormGroupComponent
								row
								label={__('Order Status', 'multivendorx')}
								className="space-between"
							>
								<span className="admin-badge blue">
									{orderData?.status
										? orderData.status
											.replace(/^wc-/, '') // remove 'wc-' prefix if exists
											.replace(/_/g, ' ') // replace underscores with spaces
											.replace(/\b\w/g, (c) =>
												c.toUpperCase()
											) // capitalize first letter of each word
										: ''}
								</span>
							</FormGroupComponent>
							{commissionData?.commission_note && (
								<>
									<SectionComponent
										title={__('Commission Notes', 'multivendorx')}
									/>
									<NoticeComponent
										type="info"
										displayPosition="inline-notice"
										message={commissionData?.commission_note}
									/>
								</>
							)}
						</FormGroupWrapperComponent>
					</div>

					<div className="commission-overview">
						<FormGroupWrapperComponent>
							<SectionComponent
								title={__('Commission Overview', 'multivendorx')}
							/>

							<FormGroupComponent
								row
								label={__('Commission Status', 'multivendorx')}
								className="space-between"
							>
								<span
									className={`admin-badge ${commissionData?.status === 'paid'
										? 'green'
										: 'red'
										}`}
								>
									{commissionData?.status
										? commissionData.status
											.replace(/^wc-/, '') // remove any prefix like 'wc-'
											.replace(/_/g, ' ') // replace underscores with spaces
											.replace(/\b\w/g, (c) =>
												c.toUpperCase()
											) // capitalize each word
										: ''}
								</span>
							</FormGroupComponent>

							<FormGroupComponent
								row
								label={__('Commission Amount', 'multivendorx')}
								className="space-between"
							>
								<b>{formatCurrency(
									parseFloat(commissionData?.store_earning ?? 0)
								)}</b>
							</FormGroupComponent>

							<FormGroupComponent row label={__('Shipping', 'multivendorx')} className="space-between">
								<b>{formatCurrency(commissionData?.shipping_amount)}</b>
							</FormGroupComponent>

							<FormGroupComponent row label={__('Tax', 'multivendorx')} className="space-between">
								<b>{formatCurrency(
									Number(commissionData?.tax_amount || 0)
								)}</b>
							</FormGroupComponent>

							{commissionData?.store_refunded > 0 && (
								<FormGroupComponent
									row
									label={__('Commission refund', 'multivendorx')}
									className="space-between"
								>
									<b>{formatCurrency(commissionData.store_refunded)}</b>
								</FormGroupComponent>
							)}

							<FormGroupComponent row label={__('Total', 'multivendorx')} className="space-between">
								<b>{formatCurrency(commissionData?.total_order_amount)}</b>
							</FormGroupComponent>
						</FormGroupWrapperComponent>
					</div>
				</div>
				<div className="section left">
					<SectionComponent title={__('Order Details', 'multivendorx')} />
					<TableCard
						headers={popupColumns}
						rows={orderItems}
						isLoading={loading}
						currency={{
							currencySymbol: appLocalizer.currency_symbol,
							priceDecimals: appLocalizer.price_decimals,
							decimalSeparator: appLocalizer.decimal_separator,
							thousandSeparator: appLocalizer.thousand_separator,
							currencyPosition: appLocalizer.currency_position,
						}}
						showMenu={false}
					/>

					{Array.isArray(shippingItems) &&
					shippingItems.length > 0 && (
						<TableCard
							title={__('Shipping', 'multivendorx')}
							headers={shippingColumns}
							rows={shippingItems}
							isLoading={loading}
							currency={{
								currencySymbol:
									appLocalizer.currency_symbol,
								priceDecimals: appLocalizer.price_decimals,
								decimalSeparator:
									appLocalizer.decimal_separator,
								thousandSeparator:
									appLocalizer.thousand_separator,
								currencyPosition:
									appLocalizer.currency_position,
							}}
							showMenu={false}
						/>
					)}
				</div>
			</div>
		</PopupComponent>
	);
};

export default ViewCommission;
