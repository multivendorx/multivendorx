/* global appLocalizer */
import React, { useEffect, useState, useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import {
	ButtonInputUI,
	BasicInputUI,
	Card,
	Column,
	Container,
	FormGroup,
	FormGroupWrapper,
	InfoItem,
	Notice,
	SelectInputUI,
	TextAreaUI,
	getApiLink,
	useModules,
	NavigatorHeader,
	TableCard,
	TableRow,
	ItemListUI,
	PopupUI,
	ComponentStatusView,
} from 'zyra';
import axios from 'axios';
import { formatCurrency, formatDate } from '../services/commonFunction';
import { useParams, useNavigate } from 'react-router-dom';
import { dashNavigate } from '../services/commonFunction';
import { applyFilters } from '@wordpress/hooks';

const OrderDetails: React.FC = () => {
	const [isRefundLoading, setIsRefundLoading] = useState(false);
	const [refundError, setRefundError] = useState('');
	const [orderData, setOrderData] = useState(null);
	const [customerData, setCustomerData] = useState();
	const { context_id } = useParams();
	const orderId = context_id;
	const [popupOpen, setPopupOpen] = useState(false);
	const [rejectNote, setRejectNote] = useState('');
	const [statusSelect, setStatusSelect] = useState(false);
	const [isRefund, setIsRefund] = useState(false);
	const [refundItems, setRefundItems] = useState({});
	const [refundDetails, setRefundDetails] = useState({
		refundAmount: 0,
		restock: true,
		reason: '',
	});
	const [shipmentData, setShipmentData] = useState({
		provider: '',
		tracking_date: '',
		tracking_url: '',
		tracking_id: '',
	});

	const providers =
		appLocalizer.settings_databases_value.shipping.shipping_providers || [];

	const formattedProviders = providers.map((provider) => ({
		value: provider,
		label: provider
			.replace(/[-_]/g, ' ')
			.replace(/\b\w/g, (char) => char.toUpperCase()),
	}));

	const { modules } = useModules();
	const customer_information_access =
		appLocalizer.settings_databases_value['privacy']
			.customer_information_access;

	const navigate = useNavigate();

	// When any item total changes, recalculate refundAmount
	const handleItemChange = (id, field, value) => {
		setRefundItems((prev) => {
			const item = orderData.line_items.find((i) => i.id === id);
			if (!item) {
				return prev;
			}

			const maxQty = Number(item.quantity);
			const unitPrice = Number(item.subtotal) / maxQty;

			let quantity = prev[id]?.quantity ?? 0;
			let total = prev[id]?.total ?? '';
			let tax = prev[id]?.tax ?? '';

			//Qty is numeric and restricted
			if (field === 'quantity') {
				const qty = Math.min(Math.max(Math.floor(value), 0), maxQty);
				quantity = qty;
				total = (qty * unitPrice).toFixed(2);
			}

			//Total: allow empty, NO restriction
			if (field === 'total') {
				total = value === '' ? '' : value;
			}

			// Tax: allow empty, NO restriction
			if (field === 'tax') {
				tax = value === '' ? '' : value;
			}

			const updated = {
				...prev,
				[id]: { quantity, total, tax },
			};

			const refundAmount = Object.values(updated).reduce(
				(sum, row) =>
					sum + Number(row.total || 0) + Number(row.tax || 0),
				0
			);

			setRefundDetails((prevDetails) => ({
				...prevDetails,
				refundAmount,
			}));

			return updated;
		});
	};
	// const handleRefundSubmit = () => {
	// 	if (isRefundLoading) {
	// 		return;
	// 	}

	// 	setRefundError('');

	// 	if (
	// 		!refundDetails.refundAmount ||
	// 		Number(refundDetails.refundAmount) <= 0
	// 	) {
	// 		setRefundError(__('Invalid refund amount', 'multivendorx'));
	// 		return;
	// 	}

	// 	// Set loading state
	// 	setIsRefundLoading(true);

	// 	const payload = {
	// 		orderId: orderId,
	// 		items: refundItems,
	// 		refundAmount: refundDetails.refundAmount,
	// 		restock: refundDetails.restock,
	// 		reason: refundDetails.reason,
	// 	};

	// 	axios({
	// 		method: 'POST',
	// 		url: getApiLink(appLocalizer, 'refund'),
	// 		headers: { 'X-WP-Nonce': appLocalizer.nonce },
	// 		data: { payload },
	// 	})
	// 		.then((response) => {
	// 			if (response.data.success) {
	// 				window.location.reload();
	// 			}
	// 		})
	// 		.catch((err) => {
	// 			const message =
	// 				err?.response?.data?.message ||
	// 				__('Refund failed. Please try again.', 'multivendorx');

	// 			setRefundError(message);
	// 		})
	// 		.finally(() => {
	// 			setIsRefundLoading(false);
	// 		});
	// };

	const fetchOrder = () => {
		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/orders/${orderId}`, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((res) => {
				setOrderData(res.data);

				const customerId = res.data.customer_id;

				return axios.get(
					`${appLocalizer.apiUrl}/wc/v3/customers/${customerId}`,
					{
						headers: { 'X-WP-Nonce': appLocalizer.nonce },
					}
				);
			})
			.then((customer) => {
				setCustomerData(customer.data);
			})
			.catch((error) => {
				console.error('Error fetching order or customer:', error);
			});
	};

	useEffect(() => {
		if (!orderId) {
			return;
		}

		fetchOrder();
	}, [orderId]);

	const refundMap = useMemo(() => {
		const map = {};
		if (orderData?.refund_items) {
			orderData.refund_items.forEach((r) => {
				map[r.item_id] = r;
			});
		}
		return map;
	}, [orderData]);

	const totalRefunded = (orderData?.refunds ?? []).reduce((sum, item) => {
		const total = Math.abs(Number(item.total ?? 0));
		return sum + total;
	}, 0);

	const handleStatusChange = (newStatus) => {
		axios
			.post(
				`${appLocalizer.apiUrl}/wc/v3/orders/${orderId}`,
				{ status: newStatus },
				{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
			)
			.then(() => {
				setStatusSelect(false);
				fetchOrder();
			})
			.catch((error) => {
				console.error('Error updating order status:', error);
			});
	};
	const formatDateTime = (iso?: string | null) => {
		if (!iso) {
			return '-';
		}
		try {
			const d = new Date(iso);
			return d.toLocaleString(); // adjust locale/options if you want specific format
		} catch {
			return iso;
		}
	};

	const statusBadgeClass = (status?: string) => {
		switch ((status || '').toLowerCase()) {
			case 'completed':
				return 'admin-badge green';
			case 'on-hold':
				return 'admin-badge orange';
			case 'processing':
				return 'admin-badge blue';
			case 'cancelled':
				return 'admin-badge red';
			default:
				return 'admin-badge';
		}
	};

	useEffect(() => {
		if (!orderData?.meta_data) {
			return;
		}

		const meta = (key: string) =>
			orderData.meta_data.find((m) => m.key === key)?.value ?? '';
		setShipmentData({
			provider: meta(appLocalizer.order_meta['shipping_provider']),
			tracking_date: meta(appLocalizer.order_meta['tracking_date']),
			tracking_url: meta(appLocalizer.order_meta['tracking_url']),
			tracking_id: meta(appLocalizer.order_meta['tracking_id']),
		});
	}, [orderData]);

	const saveShipmentToOrder = () => {
		axios
			.post(
				`${appLocalizer.apiUrl}/wc/v3/orders/${orderId}`,
				{
					meta_data: [
						{
							key: appLocalizer.order_meta['shipping_provider'],
							value: shipmentData.provider,
						},
						{
							key: appLocalizer.order_meta['tracking_date'],
							value: shipmentData.tracking_date,
						},
						{
							key: appLocalizer.order_meta['tracking_url'],
							value: shipmentData.tracking_url,
						},
						{
							key: appLocalizer.order_meta['tracking_id'],
							value: shipmentData.tracking_id,
						},
					],
				},
				{
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
				}
			)
			.then(() => {
				// Refresh order data
				fetchOrder();
			})
			.catch((error) => {
				console.error('Error saving shipment to order:', error);
			});

		const noteContent = `
			Shipment Details:
			Provider: ${shipmentData.provider}
			Date: ${shipmentData.tracking_date}
			Tracking URL: ${shipmentData.tracking_url}
			Tracking ID: ${shipmentData.tracking_id}
			`;

		axios.post(
			`${appLocalizer.apiUrl}/wc/v3/orders/${orderId}/notes`,
			{
				note: noteContent,
				customer_note: false,
			},
			{
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			}
		);

		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `tracking`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: {
				...shipmentData,
				order_id: orderId,
			},
		}).then(() => {});
	};
	const handleRefunReject = (orderId: number) => {
		// Add order note
		axios({
			method: 'POST',
			url: `${appLocalizer.apiUrl}/wc/v3/orders/${orderId}/notes`,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: {
				note: rejectNote,
				customer_note: false,
			},
		});

		axios({
			method: 'POST',
			url: `${appLocalizer.apiUrl}/wc/v3/orders/${orderId}`,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: {
				status: 'refund-rejected',
				meta_data: [
					{
						key: 'multivendorx_store_refund_reject_note',
						value: rejectNote,
					},
				],
			},
		})
			.then(() => {
				setPopupOpen(false);
				setRejectNote('');
				fetchOrder();
			})
			.catch((err) => {
				console.error('Error rejecting refund:', err);
			});
	};

	const tableRows = useMemo(() => {
		const rows: TableRow[] = [];

		// Add line items
		if (orderData?.line_items?.length > 0) {
			orderData.line_items.forEach((item) => {
				rows.push({
					...item,
					rowType: 'line_item',
					id: `line-${item.id}`,
				});
			});
		}

		// Add shipping lines
		if (orderData?.shipping_lines?.length > 0) {
			orderData.shipping_lines.forEach((item) => {
				rows.push({
					...item,
					rowType: 'shipping',
					id: `shipping-${item.id}`,
				});
			});
		}

		// Add refunds
		if (orderData?.refunds?.length > 0) {
			orderData.refunds.forEach((item) => {
				rows.push({
					...item,
					rowType: 'refund',
					id: `refund-${item.id}`,
				});
			});
		}

		return rows;
	}, [orderData]);

	// Table headers configuration
	const tableHeaders = {
		item: {
			label: __('Item', 'multivendorx'),
			render: (row) => {
				if (row.rowType === 'line_item') {
					return (
						<div className="item-details">
							<div className="image">
								<img
									src={row?.image?.src}
									alt={row?.name}
									width={40}
								/>
							</div>
							<div className="detail">
								<div className="name">{row.name}</div>
								{row?.sku && (
									<div className="sku">SKU: {row.sku}</div>
								)}
							</div>
						</div>
					);
				} else if (row.rowType === 'shipping') {
					return (
						<div className="item-details">
							<div className="icon">
								<i className="adminfont-cart green"></i>
							</div>
							<div className="detail">
								<div className="name">{row.method_title}</div>
							</div>
						</div>
					);
				} else {
					return (
						<div className="item-details">
							<div className="icon">
								<i className="adminfont-cart green"></i>
							</div>
							<div>
								{row.label}
								{row.reason && (
									<div className="sub-text">{row.reason}</div>
								)}
							</div>
						</div>
					);
				}
			},
		},
		cost: {
			label: __('Cost', 'multivendorx'),
			render: (row) => {
				if (row.rowType === 'line_item') {
					return `$${parseFloat(row.price).toFixed(2)}`;
				}
				return '';
			},
		},
		qty: {
			label: __('Qty', 'multivendorx'),
			render: (row) => {
				if (row.rowType === 'line_item') {
					return (
						<div>
							<div className="price">x {row.quantity}</div>
							{isRefund && (
								<BasicInputUI
									name="refund-amount"
									type="number"
									value={refundItems[row.id]?.quantity ?? 0}
									onChange={(value) =>
										handleItemChange(
											row.id,
											'quantity',
											+value
										)
									}
								/>
							)}
							{refundMap[row.id]?.refunded_line_total !== 0 && (
								<div>
									{refundMap[row.id]?.refunded_line_total}
								</div>
							)}
						</div>
					);
				}
				return '';
			},
		},
		total: {
			label: __('Total', 'multivendorx'),
			render: (row) => {
				if (row.rowType === 'line_item') {
					return (
						<div>
							<div className="price">
								${parseFloat(row.subtotal).toFixed(2)}
							</div>
							{isRefund && (
								<BasicInputUI
									name="refund-amount"
									type="number"
									value={refundItems[row.id]?.total ?? 0}
									onChange={(value) =>
										handleItemChange(row.id, 'total', value)
									}
								/>
							)}
						</div>
					);
				} else if (row.rowType === 'shipping') {
					return (
						<div>
							{!isRefund ? (
								row.total
							) : (
								<BasicInputUI
									name="refund"
									type="number"
									value={refundItems[row.id]?.total ?? 0}
									onChange={(value) =>
										handleItemChange(row.id, 'total', value)
									}
								/>
							)}
							{refundMap[row.id]?.refunded_shipping !== 0 && (
								<div>
									{refundMap[row.id]?.refunded_shipping}
								</div>
							)}
						</div>
					);
				} else {
					return row.total;
				}
			},
		},
		tax: {
			label: __('Tax', 'multivendorx'),
			render: (row) => {
				if (row.rowType === 'line_item') {
					return (
						<div>
							<div className="price">
								${parseFloat(row.subtotal_tax).toFixed(2)}
							</div>
							{isRefund && (
								<BasicInputUI
									name="refund-amount"
									type="number"
									value={refundItems[row.id]?.tax ?? 0}
									onChange={(value) =>
										handleItemChange(row.id, 'tax', value)
									}
								/>
							)}
							{refundMap[row.id]?.refunded_tax !== 0 && (
								<div>{refundMap[row.id]?.refunded_tax}</div>
							)}
						</div>
					);
				} else if (row.rowType === 'shipping') {
					return (
						<div>
							{!isRefund ? (
								row.total_tax
							) : (
								<BasicInputUI
									name="refund"
									type="number"
									value={refundItems[row.id]?.tax ?? 0}
									onChange={(value) =>
										handleItemChange(row.id, 'tax', value)
									}
								/>
							)}
							{refundMap[row.id]?.refunded_shipping_tax !== 0 && (
								<div>
									{refundMap[row.id]?.refunded_shipping_tax}
								</div>
							)}
						</div>
					);
				}
				return '';
			},
		},
	};
	return (
		<>
			<Notice
				message={refundError}
				type="error"
				displayPosition="float"
				title={__('Great!', 'multivendorx')}
			/>
			{!appLocalizer.edit_order_capability ? (
					<ComponentStatusView title={__( 'No access to view the order', 'multivendorx')}/>
			) : (
				<>
					<NavigatorHeader
						headerTitle={
							<div className='order-view-title'>
								{__( 'Order #', 'multivendorx')} {orderData?.number ?? orderId ?? '—'}
								{!statusSelect && orderData?.status?.trim() && (
									<div
										className={statusBadgeClass(
											orderData?.status
										)}
										onClick={() => setStatusSelect(true)}
									>
										{(orderData?.status || '')
											.replace(/-/g, ' ')
											.replace(/\b\w/g, (c) =>
												c.toUpperCase()
											)}
										<i className="adminfont-keyboard-arrow-down"></i>
									</div>
								)}
								{statusSelect && (
									<div className='status-edit'>
										<SelectInputUI
											name="status"
											type="single-select"
											options={[
												{
													label: __(
														'Processing',
														'multivendorx'
													),
													value: 'processing',
												},
												{
													label: __(
														'On Hold',
														'multivendorx'
													),
													value: 'on-hold',
												},
												{
													label: __(
														'Completed',
														'multivendorx'
													),
													value: 'completed',
												},
												{
													label: __(
														'Cancelled',
														'multivendorx'
													),
													value: 'cancelled',
												},
												{
													label: __(
														'Shipped',
														'multivendorx'
													),
													value: 'shipped',
												},
											]}
											value={orderData?.status}
											onChange={(value) => {
												handleStatusChange(value);
											}}
										/>
									</div>
								)}
							</div>
						}
						headerDescription={formatDateTime(
							orderData?.date_created
						)}
						buttons={[
							{
								label: __('Back to Orders', 'multivendorx'),
								icon: 'arrow-right',
								onClick: () =>
									dashNavigate(navigate, ['orders']),
							},
						]}
					/>

					<Container>
						<Column grid={8}>
							<Card>
								{tableRows.length > 0 ? (
									<TableCard
										headers={tableHeaders}
										rows={tableRows}
										showMenu={false}
									/>
								) : (
									<div>
										{' '}
										{__('No items found.', 'multivendorx')}
									</div>
								)}

								<div className="coupons-calculation-wrapper">
									{/* <div className="left">
										{modules.includes(
											'marketplace-refund'
										) &&
											(!isRefund ? (
												<ButtonInputUI
													buttons={[
														{
															text: __(
																'Refund',
																'multivendorx'
															),
															color: 'purple',
															onClick: () =>
																setIsRefund(
																	true
																),
														},
													]}
												/>
											) : (
												<ButtonInputUI
													position="left"
													buttons={[
														{
															text: `${__('Refund', 'multivendorx')} $${refundDetails.refundAmount.toFixed(2)} ${__('manually', 'multivendorx')}`,
															color: 'green',
															onClick:
																handleRefundSubmit,
															disabled:
																isRefundLoading,
														},
														{
															text: __(
																'Cancel',
																'multivendorx'
															),
															color: 'red',
															onClick: () =>
																setIsRefund(
																	false
																),
														},
													]}
												/>
											))}
									</div> */}

									{/* {isRefund && (
										<div className="right">
											<table className="refund-table">
												<tbody>
													<tr>
														<td>
															{__(
																'Restock refunded items:',
																'multivendorx'
															)}
														</td>
														<td>
															<input
																type="checkbox"
																checked={
																	refundDetails.restock
																}
																onChange={(e) =>
																	setRefundDetails(
																		{
																			...refundDetails,
																			restock:
																				e
																					.target
																					.checked,
																		}
																	)
																}
															/>
														</td>
													</tr>

													<tr>
														<td>
															{__(
																'Amount already refunded:',
																'multivendorx'
															)}
														</td>
														<td>
															-{' '}
															{formatCurrency(
																totalRefunded
															)}
														</td>
													</tr>

													<tr>
														<td>
															{__(
																'Total available to refund:',
																'multivendorx'
															)}
														</td>
														<td>
															{formatCurrency(
																orderData?.commission_total -
																totalRefunded
															)}
														</td>
													</tr>

													<tr>
														<td>
															{__(
																'Refund amount:',
																'multivendorx'
															)}
														</td>
														<td>
															<BasicInputUI
																name="refund-amount"
																type="number"
																value={
																	refundDetails.refundAmount
																}
																onChange={(
																	value
																) =>
																	setRefundDetails(
																		{
																			...refundDetails,
																			refundAmount:
																				+value,
																		}
																	)
																}
															/>
														</td>
													</tr>

													<tr>
														<td>
															{__(
																'Reason for refund (optional):',
																'multivendorx'
															)}
														</td>
														<td>
															<TextAreaUI
																value={
																	refundDetails.reason
																}
																placeholder={__(
																	'Reason for refund',
																	'multivendorx'
																)}
																onChange={(
																	value
																) =>
																	setRefundDetails(
																		{
																			...refundDetails,
																			reason: value,
																		}
																	)
																}
															/>
														</td>
													</tr>
												</tbody>
											</table>
										</div>
									)} */}

									{!isRefund ? (
										<div className="right">
											<table>
												<tbody>
													<tr>
														<td>
															{__(
																'Commission:',
																'multivendorx'
															)}
														</td>
														<td>
															{formatCurrency(
																orderData?.commission_amount
															)}
														</td>
													</tr>

													{modules.includes(
														'store-shipping'
													) && (
														<tr>
															<td>
																{__(
																	'Shipping:',
																	'multivendorx'
																)}
															</td>
															<td>
																{formatCurrency(
																	orderData?.shipping_total
																)}
															</td>
														</tr>
													)}

													<tr>
														<td>
															{__(
																'Total:',
																'multivendorx'
															)}
														</td>
														<td>
															{formatCurrency(
																orderData?.total
															)}
														</td>
													</tr>

													<tr>
														<td>
															{__(
																'Total Earned:',
																'multivendorx'
															)}
														</td>
														<td>
															{formatCurrency(
																orderData?.commission_total
															)}
														</td>
													</tr>
												</tbody>
											</table>
										</div>
									) : (
										<></>
									)}
								</div>
							</Card>
							{orderData &&
								orderData?.status === 'refund-requested' && (
									<Card
										title={__(
											'Refund Request - Action Required',
											'multivendorx'
										)}
									>
										<div className="refund-request-wrapper">
											{/* Header */}
											<div className="refund-header">
												<div className="details">
													<div className="title">
														#{orderData.id}
													</div>
													<div className="desc">
														{formatDate(
															orderData.date_modified
														)}
													</div>
												</div>
												<div className="price-wrapper">
													{/* Total refund amount for requested items */}
													<div className="price">
														$
														{orderData.line_items
															.filter((item) =>
																orderData.meta_data
																	.find(
																		(
																			meta
																		) =>
																			meta.key ===
																			'multivendorx_customer_refund_product'
																	)
																	?.value.includes(
																		String(
																			item.product_id
																		)
																	)
															)
															.reduce(
																(sum, item) =>
																	sum +
																	parseFloat(
																		item.total
																	),
																0
															)
															.toFixed(2)}
													</div>
												</div>
											</div>

											{/* Refund Items */}
											<div className="buttons-wrapper">
												{orderData.line_items
													.filter((item) =>
														orderData.meta_data
															.find(
																(meta) =>
																	meta.key ===
																	'multivendorx_customer_refund_product'
															)
															?.value.includes(
																String(
																	item.product_id
																)
															)
													)
													.map((item) => (
														<div
															className="admin-badge blue"
															key={item.id}
														>
															{item.name} x{' '}
															{item.quantity} ($
															{parseFloat(
																item.total
															).toFixed(2)}
															)
														</div>
													))}
											</div>

											{/* Customer Uploaded Images */}
											{orderData.meta_data.find(
												(meta) =>
													meta.key ===
													'multivendorx_customer_refund_product_imgs'
											)?.value.length > 0 && (
												<div className="refund-images-wrapper">
													<div className="title">
														Customer Uploaded Images
													</div>
													<div className="images">
														{orderData.meta_data
															.find(
																(meta) =>
																	meta.key ===
																	'multivendorx_customer_refund_product_imgs'
															)
															?.value.map(
																(
																	imgUrl,
																	index
																) => (
																	<img
																		key={
																			index
																		}
																		src={
																			imgUrl
																		}
																		alt={`Refund Proof ${index + 1}`}
																		className="refund-image"
																		style={{
																			maxWidth:
																				'100px',
																			marginRight:
																				'10px',
																			marginTop:
																				'10px',
																		}}
																	/>
																)
															)}
													</div>
												</div>
											)}

											{/* Customer Reason */}
											<div className="reason">
												<div className="title">
													Customer's Reason
												</div>
												<div className="desc">
													{
														orderData.meta_data.find(
															(meta) =>
																meta.key ===
																'multivendorx_customer_refund_reason'
														)?.value
													}
												</div>
												<div className="title">
													Additional details
												</div>
												<div className="desc">
													{
														orderData.meta_data.find(
															(meta) =>
																meta.key ===
																'multivendorx_customer_refund_addi_info'
														)?.value
													}
												</div>
											</div>
										</div>
										<ButtonInputUI
											buttons={[
												{
													icon: 'external-link',
													text: __(
														'Refund Accepted',
														'multivendorx'
													),
													color: 'yellow-bg',
													onClick: () =>
														handleStatusChange(
															'refund-accepted'
														),
												},
												{
													icon: 'save',
													text: __(
														'Reject',
														'multivendorx'
													),
													onClick: () =>
														setPopupOpen(true),
												},
											]}
										/>
										<PopupUI
											open={popupOpen}
											onClose={() => setPopupOpen(false)}
											width={40}
											height="80%"
											header={{
												icon: 'announcement',
												title: __(
													'Refund Request Details',
													'multivendorx'
												),
												description: __(
													'Review refund details before taking action.',
													'multivendorx'
												),
											}}
											footer={
												<ButtonInputUI
													buttons={[
														{
															icon: 'save',
															text: __(
																'Reject',
																'multivendorx'
															),
															onClick: () =>
																handleRefunReject(
																	orderData.id
																),
														},
													]}
												/>
											}
										>
											<FormGroupWrapper>
												<FormGroup
													label={__(
														'Reject Message',
														'multivendorx'
													)}
													htmlFor="content"
												>
													<TextAreaUI
														value={rejectNote}
														placeholder={__(
															'Reject Note',
															'multivendorx'
														)}
														onChange={(value) =>
															setRejectNote(value)
														}
													/>
												</FormGroup>
											</FormGroupWrapper>
										</PopupUI>
									</Card>
								)}
						</Column>

						<Column grid={4}>
							<Card
								title={__('Customer details', 'multivendorx')}
							>
								<InfoItem
									title={
										modules.includes('privacy') &&
										Array.isArray(
											customer_information_access
										) &&
										customer_information_access.includes(
											'name'
										)
											? orderData?.billing?.first_name ||
												orderData?.billing?.last_name
												? `${orderData?.billing?.first_name ?? ''} ${orderData?.billing?.last_name ?? ''}`
												: __(
														'Guest Customer',
														'multivendorx'
													)
											: __('Customer', 'multivendorx')
									}
									avatar={{
										image: customerData?.avatar_url,
									}}
									descriptions={[
										{
											label: __(
												'Customer ID',
												'multivendorx'
											),
											value:
												orderData?.customer_id &&
												orderData.customer_id !== 0
													? `#${orderData.customer_id}`
													: '—',
										},
										...(modules.includes('privacy') &&
										Array.isArray(
											customer_information_access
										) &&
										customer_information_access.includes(
											'email_address'
										) &&
										orderData?.billing?.email
											? [
													{
														value: (
															<>
																<i className="adminfont-mail" />{' '}
																{
																	orderData
																		.billing
																		.email
																}
															</>
														),
													},
												]
											: []),
										...(modules.includes('privacy') &&
										Array.isArray(
											customer_information_access
										) &&
										customer_information_access.includes(
											'phone_number'
										) &&
										orderData?.billing?.phone
											? [
													{
														value: (
															<>
																<i className="adminfont-phone" />{' '}
																{
																	orderData
																		.billing
																		.phone
																}
															</>
														),
													},
												]
											: []),
									]}
								/>
							</Card>

							<Card title={__('Billing address', 'multivendorx')}>
								<FormGroupWrapper>
									<FormGroup
										row
										label={__('Address', 'multivendorx')}
									>
										<div className="details">
											{orderData?.billing?.address_1 ||
											orderData?.billing?.city ||
											orderData?.billing?.postcode ||
											orderData?.billing?.country ? (
												<div className="address">
													{orderData.billing
														.first_name ||
													orderData.billing
														.last_name ? (
														<>
															{
																orderData
																	.billing
																	.first_name
															}{' '}
															{
																orderData
																	.billing
																	.last_name
															}
														</>
													) : null}
													{orderData.billing
														.company && (
														<>
															{' '}
															,{' '}
															{
																orderData
																	.billing
																	.company
															}{' '}
														</>
													)}
													{orderData.billing
														.address_1 && (
														<>
															{' '}
															,{' '}
															{
																orderData
																	.billing
																	.address_1
															}{' '}
														</>
													)}
													{orderData.billing
														.address_2 && (
														<>
															{' '}
															,{' '}
															{
																orderData
																	.billing
																	.address_2
															}{' '}
														</>
													)}
													{orderData.billing.city && (
														<>
															{
																orderData
																	.billing
																	.city
															}
															{orderData.billing
																.state
																? `, ${orderData.billing.state}`
																: ''}
														</>
													)}
													{orderData.billing
														.postcode && (
														<>
															,{' '}
															{
																orderData
																	.billing
																	.postcode
															}{' '}
														</>
													)}
													{orderData.billing
														.country && (
														<>
															{' '}
															,{' '}
															{
																orderData
																	.billing
																	.country
															}
														</>
													)}
												</div>
											) : (
												<div className="address">
													{__(
														'No billing address provided',
														'multivendorx'
													)}
												</div>
											)}
										</div>
									</FormGroup>
									<FormGroup
										row
										label={__(
											'Payment method',
											'multivendorx'
										)}
									>
										<div className="admin-badge blue">
											{orderData?.payment_method_title ||
												__(
													'Not specified',
													'multivendorx'
												)}
										</div>
									</FormGroup>
								</FormGroupWrapper>
							</Card>
							{modules.includes('privacy') &&
								Array.isArray(customer_information_access) &&
								customer_information_access.includes(
									'shipping_address'
								) && (
									<Card
										title={__(
											'Shipping address',
											'multivendorx'
										)}
									>
										<div>
											{orderData?.shipping.address_1}
										</div>
										{orderData?.shipping.address_2 && (
											<div>
												{orderData?.shipping.address_2}
											</div>
										)}

										<div>
											{orderData?.shipping.city},{' '}
											{orderData?.shipping.state}{' '}
											{orderData?.shipping.postcode}
										</div>

										<div>{orderData?.shipping.country}</div>
									</Card>
								)}

							<Card
								title={__('Shipping Tracking', 'multivendorx')}
							>
								<FormGroupWrapper>
									<FormGroup
										cols={2}
										label={__(
											'Shipping Providers',
											'multivendorx-pro'
										)}
										htmlFor="title"
									>
										<SelectInputUI
											type="single-select"
											name="provider"
											value={shipmentData.provider || ''}
											options={formattedProviders}
											onChange={(selected) =>
												setShipmentData((prev) => ({
													...prev,
													provider: selected,
												}))
											}
										/>
									</FormGroup>
									<FormGroup
										cols={2}
										label={__('Date', 'multivendorx-pro')}
										htmlFor="title"
									>
										<BasicInputUI
											type="date"
											value={shipmentData.tracking_date}
											onChange={(value: any) =>
												setShipmentData((prev) => ({
													...prev,
													tracking_date: value,
												}))
											}
										/>
									</FormGroup>
									<FormGroup
										label={__(
											'Enter Tracking Url ',
											'multivendorx'
										)}
										htmlFor="tracking-number"
									>
										<BasicInputUI
											value={shipmentData.tracking_url}
											onChange={(value) =>
												setShipmentData((prev) => ({
													...prev,
													tracking_url: value,
												}))
											}
										/>
									</FormGroup>
									<FormGroup
										label={__(
											'Enter Tracking ID',
											'multivendorx'
										)}
										htmlFor="tracking-number"
									>
										<BasicInputUI
											value={shipmentData.tracking_id}
											onChange={(value) =>
												setShipmentData((prev) => ({
													...prev,
													tracking_id: value,
												}))
											}
										/>
									</FormGroup>
								</FormGroupWrapper>

								<ButtonInputUI
									position="left"
									buttons={applyFilters(
										'multivendorx_shippment_button',
										[
											{
												icon: 'plus',
												text:
													shipmentData.tracking_url !==
													''
														? __(
																'Update Shipment',
																'multivendorx'
															)
														: __(
																'Create Shipment',
																'multivendorx'
															),
												onClick: saveShipmentToOrder,
											},
										],
										{
											orderId,
											shipmentData,
										}
									)}
								/>
							</Card>

							{modules.includes('privacy') &&
								Array.isArray(customer_information_access) &&
								customer_information_access.includes(
									'order_notes'
								) && (
									<Card
										title={__(
											'Order notes',
											'multivendorx'
										)}
									>
										{orderData?.order_notes &&
										orderData.order_notes.length > 0 ? (
											<ItemListUI
												className="notification-wrapper"
												items={
													orderData?.order_notes
														?.slice(0, 5)
														.map((note, index) => ({
															id:
																note.id ||
																index,
															title:
																note.author ||
																__(
																	'System Note',
																	'multivendorx'
																),
															desc: note.content,
															icon: note.is_customer_note
																? 'mail yellow'
																: 'contact-form blue',
															value: new Date(
																note
																	.date_created
																	.date
															).toLocaleDateString(
																'en-GB',
																{
																	day: '2-digit',
																	month: 'short',
																	year: 'numeric',
																}
															),
														})) || []
												}
											/>
										) : (
											<ComponentStatusView title={__( 'No order notes found.', 'multivendorx' )} />
										)}
									</Card>
								)}
						</Column>
					</Container>
				</>
			)}
		</>
	);
};

export default OrderDetails;
