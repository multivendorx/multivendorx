/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import {
	FormGroup,
	FormGroupWrapper,
	getApiLink,
	InfoItem,
	Notice,
	PopupUI,
	SectionUI,
	TableCard,
	TableRow,
} from 'zyra';
import axios from 'axios';
import { formatCurrency, getUrl } from '../../services/commonFunction';

interface ViewCommissionProps {
	open: boolean;
	onClose: () => void;
	commissionId?: number | string | null;
}
interface CommissionData {
	order_id?: number;
	store_id?: number;
	status?: string;
	total?: number;
	commission_refunded?: number;
	shipping?: number;
	tax?: number;
	shipping_tax_amount?: number;
	note?: string;
	[key: string]: unknown;
}
interface StoreData {
	id?: number;
	name?: string;
	email?: string;
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
interface RefundItem {
	qty: number;
	total: string;
	tax: string;
}

const ViewCommission: React.FC<ViewCommissionProps> = ({
	open,
	onClose,
	commissionId,
}) => {
	const [commissionData, setCommissionData] = useState<CommissionData | null>(
		null
	);
	const [storeData, setStoreData] = useState<StoreData | null>(null);
	const [orderData, setOrderData] = useState<OrderData | null>(null);
	const [shippingItems, setShippingItems] = useState<TableRow[][]>([]);
	const [orderItems, setOrderItems] = useState<TableRow[][]>([]);

	useEffect(() => {
		if (!commissionId) {
			setCommissionData(null);
			setStoreData(null);
			setOrderData(null);
			setOrderItems([]);
			return;
		}

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `commission/${commissionId}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		})
			.then((res) => {
				const commission = res.data || {};
				setCommissionData(commission);

				if (commission.store_id) {
					axios({
						method: 'GET',
						url: getApiLink(
							appLocalizer,
							`store/${commission.store_id}`
						),
						headers: { 'X-WP-Nonce': appLocalizer.nonce },
					})
						.then((storeRes) => {
							setStoreData(storeRes.data || {});
						})
						.catch(() => setStoreData(null));
				}

				if (commission.order_id) {
					axios({
						method: 'GET',
						url: `${appLocalizer.apiUrl}/wc/v3/orders/${commission.order_id}/refunds`,
						headers: { 'X-WP-Nonce': appLocalizer.nonce },
					})
						.then((refundRes) => {
							const refunds = refundRes.data || [];

							// map refunds by product_id
							let refundMap: Record<number, RefundItem> = {};

							refunds.forEach((refund) => {
								refund.line_items.forEach((item) => {
									const productId = item.product_id;

									refundMap[productId] = {
										qty: item.quantity,
										total: item.total,
										tax: item.total_tax,
									};
								});
							});
						})
						.catch(() => {});

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
						})
						.catch(() => {
							setOrderData(null);
							setOrderItems([]);
							setShippingItems([]);
						});
				}
			})
			.catch(() => {
				setCommissionData(null);
				setStoreData(null);
				setOrderData(null);
				setOrderItems([]);
			});
	}, [commissionId]);

	const popupColumns = {
		id: {
			label: __('Product', 'multivendorx'),
			width: 14,
			render: (row) => {
				return (
					<InfoItem
						title={row.name}
						titleLink={getUrl(row.product_id, 'product') || ''}
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
			width="70%"
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
				<div className="section left">
					{/* <div className="title">
						{storeData?.id ? (
							<a
								href={`${appLocalizer.site_url.replace(
									/\/$/,
									''
								)}/wp-admin/admin.php?page=multivendorx#&tab=stores&view&id=${
									storeData.id
								}`}
								target="_blank"
								rel="noopener noreferrer"
								className="store-link"
							>
								{storeData.name}
							</a>
						) : (
							(storeData?.name ?? '-')
						)}
					</div> */}
					{storeData?.email && (
						<div className="desc">
							<i className="adminfont-mail"></i>
							<b>{__('Email:', 'multivendorx')}</b>{' '}
							{storeData.email.split(/\s*[\n,]\s*/)[0]}
						</div>
					)}

					<SectionUI title={__('Order Details', 'multivendorx')} />
					<TableCard
						headers={popupColumns}
						rows={orderItems}
						showMenu={false}
						currency={{
							currencySymbol: appLocalizer.currency_symbol,
							priceDecimals: appLocalizer.price_decimals,
							decimalSeparator: appLocalizer.decimal_separator,
							thousandSeparator: appLocalizer.thousand_separator,
							currencyPosition: appLocalizer.currency_position,
						}}
					/>

					{Array.isArray(shippingItems) &&
						shippingItems.length > 0 && (
							<TableCard
								headers={shippingColumns}
								rows={shippingItems}
								title={__('Shipping', 'multivendorx')}
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
							/>
						)}
				</div>

				<div className="section right">
					<FormGroupWrapper>
						<SectionUI
							title={__('Order Overview', 'multivendorx')}
						/>

						<FormGroup
							row
							label={__('Associated Order', 'multivendorx')}
						>
							{commissionData?.order_id ? (
								<a
									href={getUrl(
										commissionData.order_id,
										'order'
									)}
									target="_blank"
									rel="noopener noreferrer"
									className="link-item"
								>
									#{commissionData.order_id}
								</a>
							) : (
								'-'
							)}
						</FormGroup>

						<FormGroup
							row
							label={__('Order Status', 'multivendorx')}
						>
							<span
								className={`admin-badge badge-${orderData?.status}`}
							>
								{orderData?.status
									? orderData.status
											.replace(/^wc-/, '') // remove 'wc-' prefix if exists
											.replace(/[-_]/g, ' ') // replace underscores with spaces
											.replace(/\b\w/g, (c) =>
												c.toUpperCase()
											) // capitalize first letter of each word
									: ''}
							</span>
						</FormGroup>

						<SectionUI
							title={__('Commission Overview', 'multivendorx')}
						/>

						<FormGroup
							row
							label={__('Commission Status', 'multivendorx')}
						>
							<span
								className={`admin-badge ${
									commissionData?.status === 'paid'
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
							label={__('Marketplace Commission', 'multivendorx')}
						>
							{formatCurrency(
								parseFloat(
									commissionData?.marketplace_commission ?? 0
								)
							)}
						</FormGroup>

						<FormGroup row label={__('Shipping', 'multivendorx')}>
							{formatCurrency(commissionData?.shipping_amount)}
						</FormGroup>

						<FormGroup row label={__('Tax', 'multivendorx')}>
							{formatCurrency(
								Number(commissionData?.tax_amount || 0)
							)}
						</FormGroup>

						{commissionData?.marketplace_refunded > 0 && (
							<FormGroup
								row
								label={__('Commission refund', 'multivendorx')}
							>
								{formatCurrency(
									commissionData.marketplace_refunded
								)}
							</FormGroup>
						)}

						<FormGroup row label={__('Total', 'multivendorx')}>
							{formatCurrency(commissionData?.total_order_amount)}
						</FormGroup>
					</FormGroupWrapper>

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
				</div>
			</div>
		</PopupUI>
	);
};

export default ViewCommission;
