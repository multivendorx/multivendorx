/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { getApiLink } from '@zyra/core';
import {
	FormGroupComponent,
	FormGroupWrapperComponent,
	NoticeComponent,
	PopupComponent,
	SectionComponent,
	ColumnComponent,
	ContainerComponent,
} from '@zyra/components';
import { TableCard, TableRow } from '@zyra/table';
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
			url: getApiLink(appLocalizer, `commissions/${commissionId}`),
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
							`stores/${commission.store_id}`
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
		name: {
			label: __('Product', 'multivendorx'),
			type: 'info',
			iconKey: 'info_icon',
			titleLinkKey: 'info_link',
			descriptionKey: 'info_descriptions',
		},
	};

	const orderItemRows = orderItems.map((row: any) => ({
		...row,
		info_icon: 'single-product',
		info_link: getUrl(row.product_id, 'product') || '',
		info_descriptions: [
			{
				label: __('SKU', 'multivendorx'),
				icon: 'single-product',
				value: row.sku || '—',
			},
			{
				label: __('Cost', 'multivendorx'),
				icon: 'dollar',
				value: formatCurrency(row.price),
			},
			{
				label: __('Qty', 'multivendorx'),
				icon: 'cart',
				value: row.quantity ?? '—',
			},
			{
				label: __('Total', 'multivendorx'),
				icon: 'dollar',
				value: formatCurrency(row.total),
			},
			{
				label: __('Tax', 'multivendorx'),
				icon: 'tax-compliance',
				value: formatCurrency(row.total_tax),
			},
		],
	}));

	const shippingColumns = {
		method_title: {
			label: __('Method', 'multivendorx'),
			type: 'info',
			iconKey: 'info_icon',
			descriptionKey: 'info_descriptions',
		},
	};

	const shippingRows = shippingItems.map((row: any) => ({
		...row,
		info_icon: 'shipping',
		info_descriptions: [
			{
				label: __('Amount', 'multivendorx'),
				icon: 'dollar',
				value: formatCurrency(row.total),
			},
			{
				label: __('Tax', 'multivendorx'),
				icon: 'tax-compliance',
				value: formatCurrency(row.total_tax),
			},
		],
	}));

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
			<ContainerComponent className="className">
				<ColumnComponent grid={6}>
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
						</FormGroupComponent>

						<FormGroupComponent
							row
							label={__('Order Status', 'multivendorx')}
							className="space-between"
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
						</FormGroupComponent>
					</FormGroupWrapperComponent>
				</ColumnComponent>

				<ColumnComponent  grid={6}>
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
							label={__('Marketplace Commission', 'multivendorx')}
							className="space-between"
						>
							<b>{formatCurrency(
								parseFloat(
									commissionData?.marketplace_commission ?? 0
								)
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

						{commissionData?.marketplace_refunded > 0 && (
							<FormGroupComponent
								row
								label={__('Commission refund', 'multivendorx')}
								className="space-between"
							>
								<b>{formatCurrency(
									commissionData.marketplace_refunded
								)}</b>
							</FormGroupComponent>
						)}

						<FormGroupComponent row label={__('Total', 'multivendorx')} className="space-between">
							<b>{formatCurrency(commissionData?.total_order_amount)}</b>
						</FormGroupComponent>
					</FormGroupWrapperComponent>
				</ColumnComponent>
				</ContainerComponent>
			<SectionComponent title={__('Order Details', 'multivendorx')} />
			{storeData?.email && (
				<div className="desc">
					<i className="adminfont-mail"></i>
					<b>{__('Email:', 'multivendorx')}</b>{' '}
					{storeData.email.split(/\s*[\n,]\s*/)[0]}
				</div>
			)}
			<TableCard
				headers={popupColumns}
				variant="transparent"
				rows={orderItemRows}
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
						variant="transparent"
						rows={shippingRows}
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
		</PopupComponent>
	);
};

export default ViewCommission;
