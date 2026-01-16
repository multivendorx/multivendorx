/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { CommonPopup, getApiLink, Table, TableCell } from 'zyra';
import { ColumnDef } from '@tanstack/react-table';
import axios from 'axios';
import { formatCurrency } from '../../services/commonFunction';

//Type for an order line
interface OrderItem {
	id: number;
	name: string;
	sku: string;
	cost: string;
	discount?: string;
	qty: number;
	total: string;
}

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
	const [shippingItems, setShippingItems] = useState<any[]>([]);
	const [refundMap, setRefundMap] = useState<Record<number, any>>({});

	// Add new state
	const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

	useEffect(() => {
		if (!commissionId) {
			setCommissionData(null);
			setStoreData(null);
			setOrderData(null);
			setOrderItems([]); // reset
			return;
		}
		setOrderItems(null);

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
							// Map Shipping Lines into Table Format
							if (Array.isArray(order.shipping_lines)) {
								const mappedShipping = order.shipping_lines.map(
									(ship) => ({
										id: ship.id,
										method: ship.method_title || '-',
										methodId: ship.method_id || '-',
										total: formatCurrency(ship.total),
										tax: formatCurrency(ship.total_tax),
									})
								);

								setShippingItems(mappedShipping);
							} else {
								setShippingItems([]);
							}
							//Convert WooCommerce line_items → OrderItem[]
							if (Array.isArray(order.line_items)) {
								const fetchProductImages = order.line_items.map(
									async (item) => {
										const subtotal = parseFloat(
											item.subtotal || '0'
										);
										const total = parseFloat(
											item.total || '0'
										);
										const itemTax = item.total_tax
											? parseFloat(item.total_tax)
											: 0;

										const discount =
											subtotal > total
												? `-${formatCurrency(
													subtotal - total
												)}`
												: undefined;

										let imageUrl = null;

										//Fetch product image using product_id
										if (item.product_id) {
											try {
												const productRes = await axios({
													method: 'GET',
													url: `${appLocalizer.apiUrl}/wc/v3/products/${item.product_id}`,
													headers: {
														'X-WP-Nonce':
															appLocalizer.nonce,
													},
												});
												const product = productRes.data;
												imageUrl =
													product?.images?.[0]?.src ||
													null;
											} catch (err) {
												imageUrl = null;
											}
										}

										return {
											id: item.product_id,
											name: item.name,
											sku: item.sku || '-',
											cost: formatCurrency(item.price),
											discount,
											qty: item.quantity,
											total: formatCurrency(item.total),
											tax: formatCurrency(itemTax),
											image: imageUrl, //add product image here
										};
									}
								);

								// Wait for all product image requests
								Promise.all(fetchProductImages).then(
									(mapped) => {
										setOrderItems(mapped);
									}
								);
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

	const popupColumns: ColumnDef<OrderItem>[] = [
		{
			header: __('Product', 'multivendorx'),
			cell: ({ row }) => {
				const productId = row.original.id;
				const productName = row.original.name ?? '-';
				const productImage = row.original.image;

				return (
					<TableCell title={productName}>
						{productId ? (
							<a
								href={`${appLocalizer.site_url.replace(
									/\/$/,
									''
								)}/wp-admin/post.php?post=${productId}&action=edit`}
								target="_blank"
								rel="noopener noreferrer"
								className="product-wrapper"
							>
								{productImage ? (
									<img
										src={productImage}
										alt={productName}
										className="product-thumb"
									/>
								) : (
									<i className="item-icon adminfont-multi-product"></i>
								)}

								<div className="details">
									{productName}
									<div className="sub-text">
										Sku: {row.original.sku ?? '-'}
									</div>
								</div>
							</a>
						) : (
							productName
						)}
					</TableCell>
				);
			},
		},

		// COST (unchanged)
		{
			header: __('Cost', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.cost}>
					{row.original.cost ?? '-'}
				</TableCell>
			),
		},

		//QTY WITH REFUND
		{
			header: __('Qty', 'multivendorx'),
			cell: ({ row }) => {
				const refunded = refundMap[row.original.id]?.qty || 0;
				return (
					<TableCell title={row.original.qty}>
						<div className="cell-wrapper">
							<span>{row.original.qty}</span>

							{refunded < 0 && (
								<span className="refunded">{refunded}</span>
							)}
						</div>
					</TableCell>
				);
			},
		},

		//TOTAL WITH REFUND
		{
			header: __('Total', 'multivendorx'),
			cell: ({ row }) => {
				const refunded = refundMap[row.original.id]?.total || 0;
				return (
					<TableCell title={row.original.total}>
						<div className="cell-wrapper">
							<span>{row.original.total}</span>

							{refunded < 0 && (
								<span className="refunded">
									{formatCurrency(refunded)}
								</span>
							)}
						</div>
					</TableCell>
				);
			},
		},

		//TAX WITH REFUND
		{
			header: __('Tax', 'multivendorx'),
			cell: ({ row }) => {
				const refunded = refundMap[row.original.id]?.tax || 0;
				return (
					<TableCell title={row.original.tax}>
						<div className="cell-wrapper">
							<span>{row.original.tax}</span>

							{refunded < 0 && (
								<span className="refunded">
									{formatCurrency(refunded)}
								</span>
							)}
						</div>
					</TableCell>
				);
			},
		},
	];

	const shippingColumns: ColumnDef<any>[] = [
		{
			header: __('Method', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.method}>
					{row.original.method}
				</TableCell>
			),
		},
		{
			header: __('Amount', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.total}>
					{row.original.total}
				</TableCell>
			),
		},
		{
			header: __('Tax', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.tax}>
					{row.original.tax}
				</TableCell>
			),
		},
	];
	return (
		<CommonPopup
			open={open}
			onClose={onClose}
			width="70%"
			height="100%"
			header={{
				icon: 'commission',
				title: `${__('View Commission', 'multivendorx')}${commissionId ? ` #${commissionId}` : ''
					}`,
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
					<Table
						data={orderItems}
						columns={
							popupColumns as ColumnDef<
								Record<string, any>,
								any
							>[]
						}
					/>

					{Array.isArray(shippingItems) &&
						shippingItems.length > 0 && (
							<>
								<div className="heading">
									{__('Shipping', 'multivendorx')}
								</div>

								<Table
									data={shippingItems}
									columns={
										shippingColumns as ColumnDef<
											Record<string, any>,
											any
										>[]
									}
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
									parseFloat(commissionData?.amount ?? 0) +
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
		</CommonPopup>
	);
};

export default ViewCommission;
