/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink } from '@zyra/core';
import {
	FormGroup,
	FormGroupWrapper,
	InfoItem,
	Notice,
	PopupUI,
	SectionUI,
} from '@zyra/primitives';
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
					<InfoItem
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
		<PopupUI
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
						<FormGroupWrapper>
							<SectionUI
								title={__('Order Overview', 'multivendorx')}
							/>

							<FormGroup
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
							</FormGroup>

							<FormGroup
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
							</FormGroup>
							{commissionData?.commission_note && (
								<>
									<SectionUI
										title={__('Commission Notes', 'multivendorx')}
									/>
									<Notice
										type="info"
										displayPosition="inline-notice"
										message={commissionData?.commission_note}
									/>
								</>
							)}
						</FormGroupWrapper>
					</div>

					<div className="commission-overview">
						<FormGroupWrapper>
							<SectionUI
								title={__('Commission Overview', 'multivendorx')}
							/>

							<FormGroup
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
							</FormGroup>

							<FormGroup
								row
								label={__('Commission Amount', 'multivendorx')}
								className="space-between"
							>
								<b>{formatCurrency(
									parseFloat(commissionData?.store_earning ?? 0)
								)}</b>
							</FormGroup>

							<FormGroup row label={__('Shipping', 'multivendorx')} className="space-between">
								<b>{formatCurrency(commissionData?.shipping_amount)}</b>
							</FormGroup>

							<FormGroup row label={__('Tax', 'multivendorx')} className="space-between">
								<b>{formatCurrency(
									Number(commissionData?.tax_amount || 0)
								)}</b>
							</FormGroup>

							{commissionData?.store_refunded > 0 && (
								<FormGroup
									row
									label={__('Commission refund', 'multivendorx')}
									className="space-between"
								>
									<b>{formatCurrency(commissionData.store_refunded)}</b>
								</FormGroup>
							)}

							<FormGroup row label={__('Total', 'multivendorx')} className="space-between">
								<b>{formatCurrency(commissionData?.total_order_amount)}</b>
							</FormGroup>
						</FormGroupWrapper>
					</div>
				</div>
				<div className="section left">
					<SectionUI title={__('Order Details', 'multivendorx')} />
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
		</PopupUI>
	);
};

export default ViewCommission;
