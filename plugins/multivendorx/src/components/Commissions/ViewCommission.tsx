/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { getApiLink, PopupUI,  TableCard } from 'zyra';
import axios from 'axios';
import { formatCurrency } from '../../services/commonFunction';
import { TableRow } from '@/services/type';

interface ViewCommissionProps {
	open: boolean;
	onClose: () => void;
	commissionId?: number | null;
}

const ViewCommission: React.FC<ViewCommissionProps> = ({
	open,
	onClose,
	commissionId,
}) => {
	const [commissionData, setCommissionData] = useState<any>(null);
	const [storeData, setStoreData] = useState<any>(null);
	const [orderData, setOrderData] = useState<any>(null);
	const [shippingItems, setShippingItems] = useState<TableRow[][]>([]);
	const [refundMap, setRefundMap] = useState<Record<number, any>>({});
	const [orderItems, setOrderItems] = useState<TableRow[][]>([]);

	useEffect(() => {
		if (!commissionId) {
			setCommissionData(null);
			setStoreData(null);
			setOrderData(null);
			setOrderItems([]); // reset
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
							let refundMap: Record<number, any> = {};

							refunds.forEach((refund: any) => {
								refund.line_items.forEach((item: any) => {
									const productId = item.product_id;

									refundMap[productId] = {
										qty: item.quantity, // negative
										total: item.total,
										tax: item.total_tax,
									};
								});
							});

							// store refund map
							setRefundMap(refundMap);
						})
						.catch(() => { });

					axios({
						method: 'GET',
						url: `${appLocalizer.apiUrl}/wc/v3/orders/${commission.order_id}`,
						headers: { 'X-WP-Nonce': appLocalizer.nonce },
					})
						.then((orderRes) => {
							const order = orderRes.data || {};

							setOrderData(order);
							if (Array.isArray(order.shipping_lines)) {
								const mappedRows: TableRow[][] = order.shipping_lines.map((ship: any) => [
									{ display: ship.method_title, value: ship.method_title },
									{ display: ship.method_id, value: ship.method_id },
									{ display: formatCurrency(ship.total), value: ship.total },
									{ display: formatCurrency(ship.total_tax), value: ship.total_tax },
								]);
								setShippingItems(mappedRows);
							} else {
								setShippingItems([]);
							}

							if (Array.isArray(order.line_items)) {
								const mappedRows: TableRow[][] = order.line_items.map((item: any) => {
									const total = parseFloat(item.total || '0');
									const tax = parseFloat(item.total_tax || '0');

									return [
										{
											type: 'product',
											value: item.id,
											data: {
												id: item.id,
												name: item.name,
												sku: item.sku,
												image: item.images?.src,
											},
											display: item.name
										},
										{ display: formatCurrency(item.price), value: item.price },
										{
											type: 'card',
											value: item.quantity,
											data: {
												name: item.quantity,
												description: refundMap[item.id]?.qty
											},
											display: item.quantity
										},
										{
											type: 'card',
											value: total,
											data: {
												name: total,
												description: formatCurrency(refundMap[item.id]?.total)
											},
											display: total
										},
										{
											type: 'card',
											value:tax,
											data: {
												name: tax,
												description: formatCurrency(refundMap[item.id]?.tax)
											},
											display: tax
										},
									];
								});

								setOrderItems(mappedRows);
							} else {
								setOrderItems([]);
							}

						})
						.catch(() => {
							setOrderData(null);
							setOrderItems([]);
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

	const popupColumns = [
		{
			key: 'id',
			label: 'Product',
		},
		{
			key: 'cost',
			label: 'Cost',
		},
		{
			key: 'qty',
			label: 'Qty',
		},
		{
			key: 'total',
			label: 'Total',
		},
		{
			key: 'tax',
			label: 'Tax',
		}
	];

	const shippingColumns = [
		{
			key: 'method',
			label: 'Method',
		},
		{
			key: 'Amount',
			label: 'Amount',
		},
		{
			key: 'tax',
			label: 'Tax',
		}
	];

	return (
		<PopupUI
			open={open}
			onClose={onClose}
			width="70%"
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
				{/* your existing code untouched */}
				<div className="section left">
					<div className="vendor-details">
						<div className="name">
							{storeData?.id ? (
								<a
									href={`${appLocalizer.site_url.replace(
										/\/$/,
										''
									)}/wp-admin/admin.php?page=multivendorx#&tab=stores&view&id=${storeData.id
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
						</div>
						<div className="details">
							{storeData?.email && (
								<div className="email">
									<i className="adminfont-mail"></i>
									<b>{__('Email:', 'multivendorx')}</b>{' '}
									{storeData.email.split(/\s*[\n,]\s*/)[0]}
								</div>
							)}
						</div>
					</div>

					<div className="popup-divider"></div>

					<div className="heading">
						{__('Order Details', 'multivendorx')}
					</div>
					<TableCard
						headers={popupColumns}
						rows={orderItems}
					/>
					{Array.isArray(shippingItems) &&
						shippingItems.length > 0 && (
							<>
								<div className="heading">
									{__('Shipping', 'multivendorx')}
								</div>

								<TableCard
									headers={shippingColumns}
									rows={shippingItems}
								/>
							</>
						)}
				</div>

				<div className="section right">
					<div className="heading">
						{__('Order Overview', 'multivendorx')}
					</div>
					<div className="commission-details">
						<div className="items">
							<div className="text">
								{__('Associated Order', 'multivendorx')}
							</div>
							<div className="value">
								{commissionData?.order_id ? (
									<a
										href={`${appLocalizer.site_url.replace(
											/\/$/,
											''
										)}/wp-admin/post.php?post=${commissionData.order_id
											}&action=edit`}
										target="_blank"
										rel="noopener noreferrer"
										className="link-item"
									>
										#{commissionData.order_id}
									</a>
								) : (
									'-'
								)}
							</div>
						</div>
						<div className="items">
							<div className="text">
								{__('Order Status', 'multivendorx')}
							</div>
							<div className="value">
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
							</div>
						</div>
					</div>
					<div className="popup-divider"></div>

					<div className="heading">
						{__('Commission Overview', 'multivendorx')}
					</div>

					<div className="commission-details">
						<div className="items">
							<div className="text">
								{__('Commission Status', 'multivendorx')}
							</div>
							<div className="value">
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
							</div>
						</div>
						<div className="items">
							<div className="text">
								{__('Commission Amount', 'multivendorx')}
							</div>
							<div className="value">
								{formatCurrency(
									parseFloat(commissionData?.total ?? 0) +
									parseFloat(
										commissionData?.commission_refunded ??
										0
									)
								)}
							</div>
						</div>
						<div className="items">
							<div className="text">
								{__('Shipping', 'multivendorx')}
							</div>
							<div className="value">
								{formatCurrency(commissionData?.shipping)}
							</div>
						</div>
						<div className="items">
							<div className="text">
								{__('Tax', 'multivendorx')}
							</div>
							<div className="value">
								{formatCurrency(
									Number(commissionData?.tax || 0) +
									Number(
										commissionData?.shipping_tax_amount ||
										0
									)
								)}
							</div>
						</div>
						{commissionData?.commission_refunded > 0 && (
							<div className="items">
								<div className="text">
									{__('Commission refund', 'multivendorx')}
								</div>
								<div className="value">
									{formatCurrency(
										commissionData.commission_refunded
									)}
								</div>
							</div>
						)}
						<div className="items">
							<div className="text">
								{__('Total', 'multivendorx')}
							</div>
							<div className="value">
								{formatCurrency(commissionData?.total)}
							</div>
						</div>
					</div>

					<div className="popup-divider"></div>

					{commissionData?.note && (
						<>
							<div className="heading">
								{__('Commission Notes', 'multivendorx')}
							</div>
							<div className="settings-metabox-note">
								<i className="adminfont-info"></i>
								<p>{commissionData?.note}</p>
							</div>
						</>
					)}
				</div>
			</div>
		</PopupUI>
	);
};

export default ViewCommission;
