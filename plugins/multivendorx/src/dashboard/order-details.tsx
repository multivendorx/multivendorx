import { useEffect, useState, useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import { AdminButton, BasicInput, Card, Column, Container, FormGroup, FormGroupWrapper, InfoItem, SelectInput, SuccessNotice, TextArea, getApiLink, useModules } from 'zyra';
import axios from 'axios';
import { formatCurrency } from '../services/commonFunction';

interface OrderDetailsProps {
	order?: any; // optionally pass order data
	onBack?: () => void; // optional back button
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onBack }) => {
	const [isRefundLoading, setIsRefundLoading] = useState(false);
	const [refundError, setRefundError] = useState('');
	const [orderData, setOrderData] = useState<any>(order || null);
	const [customerData, setCustomerData] = useState<any>();
	const orderId = order?.id;

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
		tracking_url: '',
		tracking_id: '',
	});
	const { modules } = useModules();
	const customer_information_access = appLocalizer.settings_databases_value['privacy'].customer_information_access;
	const shipping_providers_options =
		appLocalizer.settings_databases_value['shipping']
			.shipping_providers_options;

	const selected_shipping_providers =
		appLocalizer.settings_databases_value['shipping']
			.shipping_providers;

	// const filteredShippingProviders = shipping_providers_options.filter(
	// 	(option) => selected_shipping_providers.includes(option.value)
	// );
	// When any item total changes, recalculate refundAmount
	const handleItemChange = (id, field, value) => {
		setRefundItems((prev) => {
			const item = orderData.line_items.find((i) => i.id === id);
			if (!item) return prev;

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
					sum +
					Number(row.total || 0) +
					Number(row.tax || 0),
				0
			);

			setRefundDetails((prevDetails) => ({
				...prevDetails,
				refundAmount,
			}));

			return updated;
		});
	};
	const handleRefundSubmit = () => {
		if (isRefundLoading) {
			return;
		}

		setRefundError('');

		if (
			!refundDetails.refundAmount ||
			Number(refundDetails.refundAmount) <= 0
		) {
			setRefundError(
				__('Invalid refund amount', 'multivendorx')
			);
			return;
		}

		// Set loading state
		setIsRefundLoading(true);

		const payload = {
			orderId: orderId,
			items: refundItems,
			refundAmount: refundDetails.refundAmount,
			restock: refundDetails.restock,
			reason: refundDetails.reason,
		};

		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, 'refund'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: { payload },
		}).then((response) => {
			if (response.data.success) {
				window.location.reload();
			}
		}).catch((err) => {
			const message =
				err?.response?.data?.message ||
				__('Refund failed. Please try again.', 'multivendorx');

			setRefundError(message);
		}).finally(() => {
			setIsRefundLoading(false);
		});
	};

	const [values, setValues] = useState({
		commission: 50,
		discount: 5,
		shipping: 0,
		total: 95,
		earned: 50,
	});

	const fetchOrder = async () => {
		try {
			const res = await axios.get(
				`${appLocalizer.apiUrl}/wc/v3/orders/${orderId}`,
				{
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
				}
			);
			setOrderData(res.data);

			const customerId = res.data.customer_id;

			const customer = await axios.get(
				`${appLocalizer.apiUrl}/wc/v3/customers/${customerId}`,
				{
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
				}
			);
			setCustomerData(customer.data);
		} catch (error) {
			console.error('Error fetching order:', error);
		}
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

	const handleStatusChange = async (newStatus) => {
		const response = await axios.put(
			`${appLocalizer.apiUrl}/wc/v3/orders/${orderId}`,
			{ status: newStatus },
			{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
		);

		if (response) {
			setStatusSelect(false);
			fetchOrder();
		}
	};

	const handleChange = (field: keyof typeof values, val: number) => {
		const newVals = { ...values, [field]: val };
		const baseTotal = 100; // example base price
		newVals.total = baseTotal - newVals.discount + newVals.shipping;
		newVals.earned = newVals.commission;
		setValues(newVals);
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
		if (!orderData?.meta_data) return;

		const meta = (key: string) =>
			orderData.meta_data.find((m) => m.key === key)?.value ?? '';
		setShipmentData({
			provider: meta(appLocalizer.order_meta['shipping_provider']),
			tracking_url: meta(appLocalizer.order_meta['tracking_url']),
			tracking_id: meta(appLocalizer.order_meta['tracking_id']),
		});
	}, [orderData]);

	const saveShipmentToOrder = async () => {
		await axios.put(
			`${appLocalizer.apiUrl}/wc/v3/orders/${orderId}`,
			{
				meta_data: [
					{ key: appLocalizer.order_meta['shipping_provider'], value: shipmentData.provider },
					{ key: appLocalizer.order_meta['tracking_url'], value: shipmentData.tracking_url },
					{ key: appLocalizer.order_meta['tracking_id'], value: shipmentData.tracking_id },
				],
			},
			{
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			}
		);

		// Refresh order data
		fetchOrder();
	};

	return (
		<>
			<SuccessNotice message={refundError} />
			{!appLocalizer.edit_order_capability ? (
				<p>No access to view the order</p>
			) : (
				<>
					<div className="page-title-wrapper">
						<div className="page-title">
							<div className="title">
								Order #{orderData?.number ?? orderId ?? '—'}
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
									</div>
								)}
								{statusSelect && (
									<div className="status-edit">
										<SelectInput
											name="status"
											options={[
												{
													label: 'Processing',
													value: 'processing',
												},
												{
													label: 'On Hold',
													value: 'on-hold',
												},
												{
													label: 'Completed',
													value: 'completed',
												},
												{
													label: 'Cancelled',
													value: 'cancelled',
												},
											]}
											value={orderData?.status}
											type="single-select"
											onChange={(newValue: any) => {
												handleStatusChange(
													newValue.value
												);
											}}
										/>
									</div>
								)}
							</div>

							<div className="des">
								{formatDateTime(orderData?.date_created)}
							</div>
						</div>
						<div className="buttons-wrapper">
							{onBack && (
								<button
									className="tooltip-btn admin-badge blue"
									onClick={onBack}
								>
									<i className="adminfont-arrow-right"></i>
									<span className="tooltip">
										{' '}
										Back to Orders{' '}
									</span>
								</button>
							)}
						</div>
					</div>

					<Container>
						<Column grid={8}>
							<Card contentHeight>
								<div className="table-wrapper view-order-table">
									<table className="admin-table">
										<thead className="admin-table-header">
											<tr className="header-row">
												<td className="header-col">
													Item
												</td>
												<td className="header-col">
													Cost
												</td>
												<td className="header-col">
													Qty
												</td>
												<td className="header-col">
													Total
												</td>
												<td className="header-col">
													Tax
												</td>
											</tr>
										</thead>

										<tbody className="admin-table-body">
											{orderData?.line_items?.length >
												0 ? (
												orderData.line_items.map(
													(item) => (
														<tr
															key={item.id}
															className="admin-row simple"
														>
															<td className="admin-column">
																<div className="item-details">
																	<div className="image">
																		<img
																			src={
																				item
																					?.image
																					?.src
																			}
																			alt={
																				item?.name
																			}
																			width={
																				40
																			}
																		/>
																	</div>
																	<div className="detail">
																		<div className="name">
																			{
																				item.name
																			}
																		</div>
																		{item?.sku && (
																			<div className="sku">
																				SKU:{' '}
																				{
																					item.sku
																				}
																			</div>
																		)}
																	</div>
																</div>
															</td>
															{/* Cost (not editable) */}
															<td className="admin-column">
																{`$${parseFloat(
																	item.price
																).toFixed(2)}`}
															</td>

															{/* Qty (editable only in refund mode) */}
															<td className="admin-column">
																<div className="price">
																	{' '}
																	x{' '}
																	{
																		item.quantity
																	}{' '}
																</div>

																{isRefund && (
																	<BasicInput
																		name="refund-amount"
																		type="number"
																		value={refundItems[
																			item
																				.id
																		]
																			?.quantity ??
																			0}
																		onChange={(
																			e
																		) =>
																			handleItemChange(
																				item.id,
																				'quantity',
																				+e
																					.target
																					.value
																			)
																		}
																	/>
																)}
															</td>

															{/* Total (editable only in refund mode) */}
															<td className="admin-column">
																<div className="price">
																	{' '}
																	$
																	{parseFloat(
																		item.subtotal
																	).toFixed(
																		2
																	)}{' '}
																</div>
																{refundMap[
																	item.id
																]
																	?.refunded_line_total !==
																	0 && (
																		<div>
																			{
																				refundMap[
																					item
																						.id
																				]
																					.refunded_line_total
																			}
																		</div>
																	)}
																{isRefund && (
																	<BasicInput
																		name="refund-amount"
																		type="number"
																		value={
																			refundItems[
																				item
																					.id
																			]
																				?.total ??
																			0
																		}
																		onChange={(
																			e
																		) =>
																			handleItemChange(
																				item.id,
																				'total',
																				e
																					.target
																					.value
																			)
																		}
																	/>
																)}
															</td>
															<td className="admin-column">
																<div className="price">
																	{' '}
																	$
																	{parseFloat(
																		item.subtotal_tax
																	).toFixed(
																		2
																	)}{' '}
																</div>
																{refundMap[
																	item.id
																]
																	?.refunded_tax !==
																	0 && (
																		<div>
																			{refundMap[item.id].refunded_tax}
																		</div>
																	)}
																{isRefund && (
																	<BasicInput
																		name="refund-amount"
																		type="number"
																		value={
																			refundItems[
																				item
																					.id
																			]
																				?.tax ??
																			0
																		}
																		onChange={(
																			e
																		) =>
																			handleItemChange(
																				item.id,
																				'tax',
																				e
																					.target
																					.value
																			)
																		}
																	/>
																)}
															</td>
														</tr>
													)
												)
											) : (
												<tr className="admin-row simple">
													<td colSpan={4}>
														No items found.
													</td>
												</tr>
											)}
											{orderData?.shipping_lines?.length >
												0 &&
												orderData.shipping_lines.map(
													(item) => (
														<tr className="admin-row simple">
															<td
																className="admin-column"
																colSpan={3}
															>
																<div className="item-details">
																	<div className="icon">
																		<i className="adminfont-cart green"></i>
																	</div>
																	<div className="detail">
																		<div className="name">
																			{
																				item.method_title
																			}
																		</div>
																		{/* {item?.meta_data?.map((data) => (
                                                                        <div className="sub-text" key={data.id}>
                                                                            <span>{data.display_key || data.key}:</span> {data.display_value || data.value}
                                                                        </div>
                                                                    ))} */}
																		{/* <div className="sub-text"><span>_vendor_order_shipping_item_id:</span> 337</div> */}
																	</div>
																</div>
															</td>
															<td className="admin-column"></td>
															<td className="admin-column"></td>
															<td className="admin-column">
																{isRefund ? (
																	<BasicInput
																		name="refund"
																		type="number"
																		value={
																			refundItems[
																				item
																					.id
																			]
																				?.total ??
																			0
																		}
																		onChange={(
																			e
																		) =>
																			handleItemChange(
																				item.id,
																				'total',
																				e
																					.target
																					.value
																			)
																		}
																	/>
																) : (
																	item.total
																)}
																{refundMap[
																	item.id
																]
																	?.refunded_shipping !==
																	0 && (
																		<div>
																			{
																				refundMap[
																					item
																						.id
																				]
																					.refunded_shipping
																			}
																		</div>
																	)}
															</td>
															<td className="admin-column">
																{isRefund ? (
																	<BasicInput
																		name="refund"
																		type="number"
																		value={
																			refundItems[
																				item
																					.id
																			]
																				?.tax ??
																			0
																		}
																		onChange={(
																			e
																		) =>
																			handleItemChange(
																				item.id,
																				'tax',
																				e
																					.target
																					.value
																			)
																		}
																	/>
																) : (
																	item.total_tax
																)}
																{refundMap[
																	item.id
																]
																	?.refunded_shipping_tax !==
																	0 && (
																		<div>
																			{
																				refundMap[
																					item
																						.id
																				]
																					.refunded_shipping_tax
																			}
																		</div>
																	)}
															</td>
														</tr>
													)
												)}
											{orderData?.refunds?.length > 0 &&
												orderData.refunds.map(
													(item) => (
														<tr className="admin-row simple">
															<td
																className="admin-column"
																colSpan={3}
															>
																<div className="item-details">
																	<div className="icon">
																		<i className="adminfont-cart green"></i>
																	</div>
																	{item.label}
																	
																</div>
																<div>{item.reason}</div>
															</td>
															<td className="admin-column"></td>
															<td className="admin-column"></td>
															<td className="admin-column">
																{item.total}
															</td>
															<td className="admin-column"></td>
														</tr>
													)
												)}
										</tbody>
									</table>
								</div>

								<div className="coupons-calculation-wrapper">
									<div className="left">
										{modules.includes('marketplace-refund') && (
											!isRefund ? (
												<AdminButton
													buttons={[
														{
															text: __('Refund', 'multivendorx'),
															className: 'purple',
															onClick: () => setIsRefund(true),
														},
													]}
												/>
											) : (
												<AdminButton
													wrapperClass="left"
													buttons={[
														{
															text: `${__('Refund', 'multivendorx')} $${refundDetails.refundAmount.toFixed(2)} ${__('manually', 'multivendorx')}`,
															className: 'green',
															onClick: handleRefundSubmit,
															disabled: isRefundLoading,
														},
														{
															text: __('Cancel', 'multivendorx'),
															className: 'red',
															onClick: () => setIsRefund(false),
														},
													]}
												/>
											)
										)}
									</div>



									{isRefund && (
										<div className="right">
											<table className="refund-table">
												<tbody>
													<tr>
														<td>
															{__('Restock refunded items:', 'multivendorx')}
														</td>
														<td>
															<input
																type="checkbox"
																checked={refundDetails.restock}
																onChange={(e) =>
																	setRefundDetails({
																		...refundDetails,
																		restock: e.target.checked,
																	})
																}
															/>
														</td>
													</tr>

													<tr>
														<td>
															{__('Amount already refunded:', 'multivendorx')}
														</td>
														<td>
															- {formatCurrency(totalRefunded)}
														</td>
													</tr>

													<tr>
														<td>
															{__('Total available to refund:', 'multivendorx')}
														</td>
														<td>
															{formatCurrency(
																orderData.commission_total - totalRefunded
															)}
														</td>
													</tr>

													<tr>
														<td>
															{__('Refund amount:', 'multivendorx')}
														</td>
														<td>
															<BasicInput
																name="refund-amount"
																type="number"
																value={refundDetails.refundAmount}
																onChange={(e) =>
																	setRefundDetails({
																		...refundDetails,
																		refundAmount: +e.target.value,
																	})
																}
															/>
														</td>
													</tr>

													<tr>
														<td>
															{__('Reason for refund (optional):', 'multivendorx')}
														</td>
														<td>
															<TextArea
																value={refundDetails.reason}
																placeholder={__('Reason for refund', 'multivendorx')}
																onChange={(e) =>
																	setRefundDetails({
																		...refundDetails,
																		reason: e.target.value,
																	})
																}
															/>
														</td>
													</tr>
												</tbody>
											</table>
										</div>
									)}

									{!isRefund ? (
										<div className="right">
											<table>
												<tbody>
													<tr>
														<td>{__('Commission:', 'multivendorx')}</td>
														<td>
															{formatCurrency(orderData?.commission_amount)}
														</td>
													</tr>

													{modules.includes('store-shipping') && (
														<tr>
															<td>{__('Shipping:', 'multivendorx')}</td>
															<td>
																{formatCurrency(orderData?.shipping_total)}
															</td>
														</tr>
													)}

													<tr>
														<td>{__('Total:', 'multivendorx')}</td>
														<td>
															{formatCurrency(orderData?.total)}
														</td>
													</tr>

													<tr>
														<td>{__('Total Earned:', 'multivendorx')}</td>
														<td>
															{formatCurrency(orderData?.commission_total)}
														</td>
													</tr>
												</tbody>
											</table>
										</div>

									) : (
										<></>
										// <table className="refund-table">
										//     <tbody>
										//         <tr><td>Amount already refunded:</td><td>-$50</td></tr>
										//         <tr><td>Total available to refund:</td><td>$60</td></tr>
										//         <tr>
										//             <td>Refund amount:</td>
										//             <td>
										//                 <input
										//                     type="number"
										//                     className="basic-input"
										//                     value={values.shipping}
										//                     onChange={(e) => handleChange("shipping", +e.target.value)}
										//                 />
										//             </td>
										//         </tr>
										//         <tr><td>Reason for refund (optional):</td><td>${values.total.toFixed(2)}</td></tr>
										//     </tbody>
										// </table>
									)}
								</div>
							</Card>
						</Column>

						<Column grid={4}>
							<Card
								title={__('Customer details', 'multivendorx')}
							>
								<InfoItem
									title={
										modules.includes('privacy') &&
											Array.isArray(customer_information_access) &&
											customer_information_access.includes('name')
											? orderData?.billing?.first_name || orderData?.billing?.last_name
												? `${orderData?.billing?.first_name ?? ''} ${orderData?.billing?.last_name ?? ''}`
												: __('Guest Customer', 'multivendorx')
											: __('Customer', 'multivendorx')
									}
									avatar={{
										image: customerData?.avatar_url,
									}}
									descriptions={[
										{
											label: __('Customer ID', 'multivendorx'),
											value:
												orderData?.customer_id && orderData.customer_id !== 0
													? `#${orderData.customer_id}`
													: '—',
										},
										...(modules.includes('privacy') &&
											Array.isArray(customer_information_access) &&
											customer_information_access.includes('email_address') &&
											orderData?.billing?.email
											? [
												{
													value: (
														<>
															<i className="adminfont-mail" />{' '}
															{orderData.billing.email}
														</>
													),
												},
											]
											: []),
										...(modules.includes('privacy') &&
											Array.isArray(customer_information_access) &&
											customer_information_access.includes('phone_number') &&
											orderData?.billing?.phone
											? [
												{
													value: (
														<>
															<i className="adminfont-phone" />{' '}
															{orderData.billing.phone}
														</>
													),
												},
											]
											: []),
									]}
								/>

							</Card>

							<Card
								title={__('Billing address', 'multivendorx')}
							>
								<FormGroupWrapper>
									<FormGroup row label={__('Address', 'multivendorx')}>
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
									<FormGroup row label={__('Payment method', 'multivendorx')}>
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
							{modules.includes('privacy') && Array.isArray(customer_information_access) &&
								customer_information_access.includes('shipping_address') && (
									<Card
										title={__('Shipping address', 'multivendorx')}
									>
										<div>{orderData?.shipping.address_1}</div>
										{orderData?.shipping.address_2 && (
											<div>{orderData?.shipping.address_2}</div>
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
									<FormGroup label={__('Create Shipping', 'multivendorx')} htmlFor="create-shipping">
										{/* <SelectInput
											options={filteredShippingProviders}
											type="single-select"
											value={shipmentData.provider}
											onChange={(option) =>
												setShipmentData((prev) => ({
													...prev,
													provider: option.value,
												}))
											}
										/> */}
									</FormGroup>
									<FormGroup label={__('Enter Tracking Url ', 'multivendorx')} htmlFor="tracking-number">
										<BasicInput

											descClass="settings-metabox-description"
											value={shipmentData.tracking_url}
											onChange={(e) =>
												setShipmentData((prev) => ({
													...prev,
													tracking_url: e.target.value,
												}))
											}
										/>
									</FormGroup>
									<FormGroup label={__('Enter Tracking ID', 'multivendorx')} htmlFor="tracking-number">
										<BasicInput

											descClass="settings-metabox-description"
											value={shipmentData.tracking_id}
											onChange={(e) =>
												setShipmentData((prev) => ({
													...prev,
													tracking_id: e.target.value,
												}))
											}
										/>
									</FormGroup>
								</FormGroupWrapper>

								<AdminButton
									wrapperClass="left"
									buttons={{
										icon: 'plus',
										text: __('Create Shipment', 'multivendorx'),
										className: 'purple-bg',
										onClick: saveShipmentToOrder,
									}}
								/>
							</Card>
							{modules.includes('privacy') && Array.isArray(customer_information_access) &&
								customer_information_access.includes('order_notes') && (
									<Card
										title={__('Order notes', 'multivendorx')}
									>
										{orderData?.order_notes &&
											orderData.order_notes.length > 0 ? (
											<div className="notification-wrapper">
												<ul>
													{orderData.order_notes.slice(0, 5).map(
														(note: any, index: number) => (
															<li key={index}>
																<div className={`icon-wrapper admin-color${index + 2}`}>
																	<i
																		className={
																			note.is_customer_note
																				? 'adminfont-mail'
																				: 'adminfont-contact-form'
																		}
																	></i>
																</div>
																<div className="details">
																	<div className="notification-title">
																		{note.author ||
																			__(
																				'System Note',
																				'multivendorx'
																			)}
																	</div>
																	<div
																		className="des"
																		dangerouslySetInnerHTML={{
																			__html:
																				note.content ||
																				'',
																		}}
																	></div>
																	<span>
																		{new Date(
																			note.date_created.date
																		).toLocaleDateString(
																			'en-GB',
																			{
																				day: '2-digit',
																				month: 'short',
																				year: 'numeric',
																			}
																		)}
																	</span>
																</div>
															</li>
														)
													)}
												</ul>
											</div>
										) : (
											<p>
												{__(
													'No order notes found.',
													'multivendorx'
												)}
											</p>
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
