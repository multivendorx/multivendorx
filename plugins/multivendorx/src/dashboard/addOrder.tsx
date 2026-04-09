/* global appLocalizer */
import React, { useEffect, useRef, useState } from 'react';
import {
	TableRow,
	ButtonInputUI,
	BasicInputUI,
	Card,
	Column,
	Container,
	FormGroup,
	FormGroupWrapper,
	NavigatorHeader,
	SelectInputUI,
	TableCard,
	TextAreaUI,
	getApiLink,
	useOutsideClick,
	EmailsInputUI,
	InfoItem,
} from 'zyra';
import axios from 'axios';
import { formatCurrency, dashNavigate } from '@/services/commonFunction';
import { __ } from '@wordpress/i18n';
import { useNavigate } from 'react-router-dom';
interface AddressData {
	address_1?: string;
	address_2?: string;
	city?: string;
	postcode?: string;
	state?: string;
	country?: string;
	[key: string]: string | undefined;
}

const AddOrder = () => {
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [showAddProduct, setShowAddProduct] = useState(false);
	const [allProducts, setAllProducts] = useState([]);
	const [customers, setCustomers] = useState([]);
	const [selectedCustomer, setSelectedCustomer] = useState(null);
	const [shippingAddress, setShippingAddress] = useState({});
	const [billingAddress, setBillingAddress] = useState({});
	const [paymentMethods, setPaymentMethods] = useState([]);
	const [selectedPayment, setSelectedPayment] = useState(null);
	const [addedProducts, setAddedProducts] = useState([]);
	const [showAddressEdit, setShowAddressEdit] = useState(false);
	const [showShippingAddressEdit, setShowShippingAddressEdit] =
		useState(false);
	const [showCreateCustomer, setShowCreateCustomer] = useState(false);
	const [orderNote, SetOrderNote] = useState('');
	const addressEditRef = useRef(null);
	const shippingAddressEditRef = useRef(null);
	const [shippingLines, setShippingLines] = useState([]);
	const [availableShippingMethods, setAvailableShippingMethods] = useState(
		[]
	);
	const navigate = useNavigate();

	useOutsideClick(addressEditRef, () => {
		const payload = {
			billing: {
				first_name: selectedCustomer?.first_name,
				last_name: selectedCustomer?.last_name,
				address_1: billingAddress.address_1,
				address_2: '',
				city: billingAddress.city,
				state: billingAddress.state,
				postcode: billingAddress.postcode,
				country: billingAddress.country,
			},
		};
		axios
			.post(
				`${appLocalizer.apiUrl}/wc/v3/customers/${selectedCustomer?.id}`,
				payload,
				{
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
				}
			)
			.then((res) => {
				setBillingAddress(res.data.billing);
			});

		setShowAddressEdit(false);
	});

	useOutsideClick(shippingAddressEditRef, () => {
		const payload = {
			shipping: {
				first_name: selectedCustomer?.first_name,
				last_name: selectedCustomer?.last_name,
				address_1: shippingAddress.address_1,
				address_2: '',
				city: shippingAddress.city,
				state: shippingAddress.state,
				postcode: shippingAddress.postcode,
				country: shippingAddress.country,
			},
		};
		axios
			.post(
				`${appLocalizer.apiUrl}/wc/v3/customers/${selectedCustomer?.id}`,
				payload,
				{
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
				}
			)
			.then((res) => {
				setShippingAddress(res.data.shipping);
			});

		setShowShippingAddressEdit(false);
	});

	useEffect(() => {
		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/customers`, {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
				params: {
					per_page: 100,
				},
			})
			.then((response) => {
				setCustomers(response.data);
			});
	}, []);

	const customerOptions = [
		{ label: 'Choose customer...', value: '' },
		...(customers
			? customers.map((c) => ({
					label: `${c.first_name} ${c.last_name}`.trim() || c.email,
					value: c.id,
				}))
			: []),
	];

	useEffect(() => {
		if (!showAddProduct) {
			return;
		}

		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/products`, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					per_page: 100,
				},
			})
			.then((res) => {
				const products = res.data;
				const filtered = products.filter((p) => {
					const storeId = p.meta_data?.find(
						(m) => m.key === 'multivendorx_store_id'
					)?.value;

					return storeId === appLocalizer.store_id;
				});

				setAllProducts(filtered);
			});
	}, [showAddProduct]);

	const subtotal = addedProducts.reduce((sum, item) => {
		return sum + item.price * (item.qty || 1);
	}, 0);

	const hasCustomer = !!selectedCustomer;

	useEffect(() => {
		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/payment_gateways`, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((res) => {
				const enabled = res.data.filter((m) => m.enabled === true);

				const formatted = enabled.map((m) => ({
					label: m.title,
					value: m.id,
					method_title: m.title,
				}));

				setPaymentMethods(formatted);
			});
	}, []);

	useEffect(() => {
		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/shipping_methods`, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((res) => {
				const formatted = res.data.map((method) => ({
					label: method.title,
					value: method.id,
					...method,
				}));
				setAvailableShippingMethods(formatted);
			});
	}, []);

	const totalShipping = shippingLines.reduce(
		(sum, s) => sum + Number(s.cost || 0),
		0
	);

	const paymentOptions = [
		{ label: 'Select Payment Method', value: '' },
		...paymentMethods,
	];

	const [taxRates, setTaxRates] = useState<TableRow[][]>([]);

	useEffect(() => {
		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/taxes`, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: { per_page: 100 },
			})
			.then((res) => {
				const taxes = Array.isArray(res.data) ? res.data : [];
				const ids = taxes.map((tax) => {
					return tax.id;
				});

				setRowIds(ids);

				setTaxRates(taxes);
			});
	}, []);

	const [showAddTax, setShowAddTax] = useState(false);
	const [selectedTaxRate, setSelectedTaxRate] = useState(null);

	const applyTaxToOrder = () => {
		if (!selectedTaxRate) {
			return;
		}

		const rate = Number(selectedTaxRate.rate) / 100;

		setAddedProducts((prev) =>
			prev.map((item) => ({
				...item,
				tax_rate_id: selectedTaxRate.id,
				tax_amount: item.price * (item.qty || 1) * rate,
			}))
		);
	};

	const createOrder = async () => {
		const orderData = {
			customer_id: selectedCustomer?.id || 0,
			billing: billingAddress,
			shipping: shippingAddress,
			line_items: addedProducts.map((item) => {
				const qty = item.qty || 1;
				const subtotal = item.price * qty;
				const tax = item.tax_amount || 0;

				return {
					product_id: item.id,
					quantity: qty,
					subtotal: subtotal.toFixed(2),
					total: subtotal.toFixed(2),
					// Tax
					subtotal_tax: tax.toFixed(2),
					total_tax: tax.toFixed(2),
					// Required for tax mapping
					taxes: item.tax_rate_id
						? [{ id: item.tax_rate_id, total: tax.toFixed(2) }]
						: [],
				};
			}),
			// Shipping
			shipping_lines: shippingLines.map((s) => ({
				method_id: s.method_id,
				method_title: s.name,
				total: Number(s.cost).toFixed(2),
			})),
			// Payment
			payment_method: selectedPayment?.value || '',
			payment_method_title: selectedPayment?.method_title || '',
			set_paid: false,
			customer_note: orderNote || '',
			meta_data: [
				{
					key: 'multivendorx_store_id',
					value: appLocalizer.store_id,
				},
			],
		};

		axios
			.post(`${appLocalizer.apiUrl}/wc/v3/orders`, orderData, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then(() => {
				dashNavigate(navigate, ['orders']);
			});
	};

	const orderSubtotal = addedProducts.reduce(
		(sum, item) => sum + item.price * (item.qty || 1),
		0
	);

	const orderTaxTotal = addedProducts.reduce(
		(sum, item) => sum + (item.tax_amount || 0),
		0
	);

	const orderShippingTotal = totalShipping;

	const grandTotal = orderSubtotal + orderTaxTotal + orderShippingTotal;

	const [newCustomer, setNewCustomer] = useState({
		first_name: '',
		last_name: '',
		email: '',
		phone: '',
	});

	const createCustomer = () => {
		const payload = {
			email: newCustomer.email,
			first_name: newCustomer.first_name,
			last_name: newCustomer.last_name,
			billing: {
				first_name: newCustomer.first_name,
				last_name: newCustomer.last_name,
				email: newCustomer.email,
				phone: newCustomer.phone,
			},
			shipping: {
				first_name: newCustomer.first_name,
				last_name: newCustomer.last_name,
			},
		};

		axios
			.post(`${appLocalizer.apiUrl}/wc/v3/customers`, payload, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((res) => {
				const customer = res.data;
				// Add to dropdown immediately
				setCustomers((prev) => [...prev, customer]);
				// Select this customer automatically
				setSelectedCustomer(customer);
				setBillingAddress(customer.billing);
				setShippingAddress(customer.shipping);
				// Close create form
				setShowCreateCustomer(false);
				// Clear form
				setNewCustomer({
					first_name: '',
					last_name: '',
					email: '',
					phone: '',
				});
			});
	};
	const [stateOptions, setStateOptions] = useState<
		{ label: string; value: string }[]
	>([]);

	const fetchStatesByCountry = (countryCode: string) => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `states/${countryCode}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((res) => {
			setStateOptions(res.data || []);
		});
	};

	useEffect(() => {
		if (hasCustomer && billingAddress?.address_1 == '') {
			setShowAddressEdit(true);
		}
	}, [hasCustomer, billingAddress]);

	useEffect(() => {
		if (hasCustomer && shippingAddress?.address_1 == '') {
			setShowShippingAddressEdit(true);
		}
	}, [hasCustomer, shippingAddress]);

	// Define headers for the order items table
	const tableRows = [
		...addedProducts.map((product) => ({
			...product,
			rowType: 'product',
			id: `product-${product.id}`,
		})),
		...shippingLines.map((ship) => ({
			...ship,
			rowType: 'shipping',
			id: `shipping-${ship.id}`,
		})),
	];

	// Single table headers that handle both products and shipping
	const tableHeaders = {
		item: {
			label: __('Item', 'multivendorx'),
			render: (row) => {
				if (row.rowType === 'product') {
					return (
						<div className="item-details">
							<div className="image">
								<img
									src={row?.images?.[0]?.src}
									width={40}
									alt={row.name}
								/>
							</div>
							<div className="detail">
								<div className="name">{row.name}</div>
								{row?.sku && (
									<div className="sku">
										{__('SKU:', 'multivendorx')} {row.sku}
									</div>
								)}
							</div>
						</div>
					);
				} else {
					return (
						<div className="item-details">
							<div className="icon">
								<i className="adminfont-cart green"></i>
							</div>
							<div className="detail">
								<div className="name">
									{__('Shipping', 'multivendorx')}
								</div>
								<SelectInputUI
									name="shipping_method"
									type="single-select"
									options={availableShippingMethods}
									value={availableShippingMethods.find(
										(o) => o.value === row.method_id
									)}
									onChange={(value) => {
										const selectedOption =
											availableShippingMethods.find(
												(o) => o.value === value
											);
										const method_title =
											selectedOption?.label || '';
										setShippingLines((prev) =>
											prev.map((s) =>
												s.id === row.id
													? {
															...s,
															method_id: value,
															name: method_title,
														}
													: s
											)
										);
									}}
								/>
							</div>
						</div>
					);
				}
			},
		},
		price: {
			label: __('Price', 'multivendorx'),
			render: (row) => {
				if (row.rowType === 'product') {
					return `$${row.price}`;
				}
				return '';
			},
		},
		qty: {
			label: __('Qty', 'multivendorx'),
			render: (row) => {
				if (row.rowType === 'product') {
					return (
						<BasicInputUI
							type="number"
							min="1"
							value={row.qty || 1}
							onChange={(value) => {
								const qty = +value;
								setAddedProducts((prev) =>
									prev.map((p) =>
										p.id === row.id ? { ...p, qty } : p
									)
								);
							}}
						/>
					);
				}
				return '';
			},
		},
		total: {
			label: __('Total', 'multivendorx'),
			render: (row) => {
				if (row.rowType === 'product') {
					return `$${(row.price * (row.qty || 1)).toFixed(2)}`;
				} else {
					return (
						<BasicInputUI
							type="number"
							min="0"
							value={row.cost}
							onChange={(value) => {
								const cost = parseFloat(value) || 0;
								setShippingLines((prev) =>
									prev.map((s) =>
										s.id === row.id ? { ...s, cost } : s
									)
								);
							}}
						/>
					);
				}
			},
		},
	};

	// Tax headers
	const taxTableHeaders = {
		name: {
			label: __('Rate name', 'multivendorx'),
		},
		class: {
			label: __('Tax class', 'multivendorx'),
		},
		code: {
			label: __('Rate code', 'multivendorx'),
		},
		rate: {
			label: __('Rate %', 'multivendorx'),
		},
		action: {
			type: 'action',
			label: __('Action', 'multivendorx'),
			actions: [
				{
					label: __('Select', 'multivendorx'),
					icon: 'check',
					onClick: (row) => {
						if (row) {
							setSelectedTaxRate(row);
						}
					},
				},
			],
		},
	};

	// billing & shipping common card
	const renderAddressCard = (
		title: string,
		address: AddressData,
		isEditMode: boolean,
		setIsEditMode: (value: boolean) => void,
		editRef: React.RefObject<HTMLDivElement | null>,
		type: 'billing' | 'shipping'
	) => {
		const hasCustomer = !!selectedCustomer;

		return (
			<Card
				title={__(title, 'multivendorx')}
				iconName={hasCustomer && !isEditMode ? 'edit' : ''}
				onIconClick={() => setIsEditMode(true)}
			>
				{!hasCustomer && (
					<span>
						{type === 'billing'
							? __('No billing address found', 'multivendorx')
							: __('Please Select a customer', 'multivendorx')}
					</span>
				)}

				{hasCustomer && !isEditMode && (
					<FormGroupWrapper>
						<FormGroup row label={__('Address', 'multivendorx')}>
							{address.address_1}
						</FormGroup>
						<FormGroup row label={__('City', 'multivendorx')}>
							{address.city}
						</FormGroup>
						<FormGroup
							row
							label={__('Postcode / ZIP', 'multivendorx')}
						>
							{address.postcode}
						</FormGroup>
						<FormGroup row label={__('State', 'multivendorx')}>
							{address.state}
						</FormGroup>
						<FormGroup row label={__('Country', 'multivendorx')}>
							{address.country}
						</FormGroup>
					</FormGroupWrapper>
				)}

				{isEditMode && (
					<div ref={editRef}>
						<FormGroupWrapper>
							<FormGroup
								label={__('Address', 'multivendorx')}
								htmlFor={`${type}-address`}
							>
								<BasicInputUI
									name={`${type}_address_1`}
									value={address.address_1 || ''}
									onChange={(value: string) => {
										if (type === 'billing') {
											setBillingAddress(
												(prev: AddressData) => ({
													...prev,
													address_1: value,
												})
											);
										} else {
											setShippingAddress(
												(prev: AddressData) => ({
													...prev,
													address_1: value,
												})
											);
										}
									}}
								/>
							</FormGroup>

							<FormGroup
								cols={2}
								label={__('City', 'multivendorx')}
								htmlFor={`${type}-city`}
							>
								<BasicInputUI
									name={`${type}_city`}
									value={address.city || ''}
									onChange={(value: string) => {
										if (type === 'billing') {
											setBillingAddress(
												(prev: AddressData) => ({
													...prev,
													city: value,
												})
											);
										} else {
											setShippingAddress(
												(prev: AddressData) => ({
													...prev,
													city: value,
												})
											);
										}
									}}
								/>
							</FormGroup>

							<FormGroup
								cols={2}
								label={__('Postcode / ZIP', 'multivendorx')}
								htmlFor={`${type}-postcode`}
							>
								<BasicInputUI
									name={`${type}_postcode`}
									value={address.postcode || ''}
									onChange={(value: string) => {
										if (type === 'billing') {
											setBillingAddress(
												(prev: AddressData) => ({
													...prev,
													postcode: value,
												})
											);
										} else {
											setShippingAddress(
												(prev: AddressData) => ({
													...prev,
													postcode: value,
												})
											);
										}
									}}
								/>
							</FormGroup>

							<FormGroup
								cols={2}
								label={__('Country / Region', 'multivendorx')}
								htmlFor={`${type}-country`}
							>
								<SelectInputUI
									name={`${type}_country`}
									type="single-select"
									value={address.country}
									options={appLocalizer.country_list || []}
									onChange={(selected: string) => {
										if (type === 'billing') {
											setBillingAddress(
												(prev: AddressData) => ({
													...prev,
													country: selected,
												})
											);
										} else {
											setShippingAddress(
												(prev: AddressData) => ({
													...prev,
													country: selected,
												})
											);
										}
										fetchStatesByCountry(selected);
									}}
								/>
							</FormGroup>

							<FormGroup
								cols={2}
								label={__('State / County', 'multivendorx')}
								htmlFor={`${type}-state`}
							>
								<SelectInputUI
									name={`${type}_state`}
									type="single-select"
									value={address.state}
									options={stateOptions}
									onChange={(selected: string) => {
										if (type === 'billing') {
											setBillingAddress(
												(prev: AddressData) => ({
													...prev,
													state: selected,
												})
											);
										} else {
											setShippingAddress(
												(prev: AddressData) => ({
													...prev,
													state: selected,
												})
											);
										}
									}}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</div>
				)}
			</Card>
		);
	};

	return (
		<>
			<NavigatorHeader
				headerTitle={__('Add Order', 'multivendorx')}
				headerDescription={__(
					'Create a new order manually by adding products, charges, and customer details.',
					'multivendorx'
				)}
				buttons={[
					{
						label: __('Create Order', 'multivendorx'),
						icon: 'plus',
						onClick: () => createOrder(),
					},
				]}
			/>
			<Container>
				<Column grid={8}>
					<Card>
						{(addedProducts.length > 0 ||
							shippingLines.length > 0) && (
							<>
								<TableCard
									headers={tableHeaders}
									rows={tableRows}
									showMenu={false}
								/>

								<div className="total-summary">
									<div className="row">
										<span>
											{__('Subtotal:', 'multivendorx')}
										</span>
										<span>${subtotal.toFixed(2)}</span>
									</div>

									<div className="row">
										<span>
											{__('Tax:', 'multivendorx')}
										</span>
										<span>
											$
											{addedProducts
												.reduce(
													(sum, p) =>
														sum +
														(p.tax_amount || 0),
													0
												)
												.toFixed(2)}
										</span>
									</div>

									<div className="row">
										<span>
											{__('Shipping:', 'multivendorx')}
										</span>
										<span>
											{formatCurrency(totalShipping)}
										</span>
									</div>

									<div className="row total">
										<strong>
											{__('Grand Total:', 'multivendorx')}
										</strong>
										<strong>
											${grandTotal.toFixed(2)}
										</strong>
									</div>
								</div>
							</>
						)}
						<FormGroupWrapper>
							<ButtonInputUI
								position="left"
								buttons={[
									{
										icon: 'plus',
										text: 'Add Product',
										onClick: () => setShowAddProduct(true),
									},
									{
										icon: 'plus',
										text: 'Add Shipping',
										onClick: () =>
											setShippingLines((prev) => [
												...prev,
												{
													id: Date.now(),
													name: 'Shipping',
													cost: 0,
													method_id: '',
												},
											]),
									},
									{
										icon: 'plus',
										text: 'Add Tax',
										onClick: () => setShowAddTax(true),
									},
								]}
							/>

							{showAddProduct && (
								<FormGroup
									row
									label={__('Select Product', 'multivendorx')}
								>
									<SelectInputUI
										name="product_select"
										type="single-select"
										options={[
											{
												label: __(
													'Select a product',
													'multivendorx'
												),
												value: '',
											},
											...allProducts.map((p) => ({
												label: p.name,
												value: p.id,
											})),
										]}
										onChange={(selected) => {
											if (!selected) {
												return;
											}

											const prod = allProducts.find(
												(p) => p.id == selected
											);
											if (prod) {
												setAddedProducts((prev) => [
													...prev,
													{ ...prod, qty: 1 },
												]);
											}

											setShowAddProduct(false);
										}}
									/>
								</FormGroup>
							)}
						</FormGroupWrapper>

						{showAddTax && (
							<div className="tax-wrapper">
								<div className="title">
									{__('Add tax', 'multivendorx')}
								</div>

								{taxRates.length > 0 ? (
									<>
										<TableCard
											headers={taxTableHeaders}
											rows={taxRates}
											ids={rowIds}
											showMenu={false}
										/>
										<ButtonInputUI
											buttons={[
												{
													text: __(
														'Apply Tax',
														'multivendorx'
													),
													icon: 'plus',
													onClick: () => {
														applyTaxToOrder();
														setShowAddTax(false);
													},
												},
											]}
										/>
									</>
								) : (
									<div className="desc">
										{__(
											'No tax rates set. Contact admin.',
											'multivendorx'
										)}
									</div>
								)}
							</div>
						)}
					</Card>
				</Column>
				<Column grid={4}>
					<Card title={__('Payment Method', 'multivendorx')}>
						<FormGroupWrapper>
							<FormGroup
								row
								label={__('Payment Method', 'multivendorx')}
								htmlFor="payment-method"
							>
								<SelectInputUI
									name="payment_method"
									type="single-select"
									options={paymentOptions}
									value={selectedPayment?.value}
									onChange={(value) => {
										const method = paymentMethods.find(
											(m) => m.value === value
										);
										setSelectedPayment(method || null);
									}}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</Card>

					<Card title={__('Customer details', 'multivendorx')}>
						{!selectedCustomer && (
							<>
								<FormGroupWrapper>
									<FormGroup
										row
										label={__(
											'Select Customer',
											'multivendorx'
										)}
										htmlFor="Select-customer"
									>
										<SelectInputUI
											name="new_owner"
											type="single-select"
											options={customerOptions}
											onChange={(value) => {
												const customer = customers.find(
													(c) => c.id == value
												);
												setSelectedCustomer(customer);
												if (customer) {
													setShippingAddress(
														customer.shipping
													);
													setBillingAddress(
														customer.billing
													);
													setShowCreateCustomer(
														false
													);
												}
											}}
										/>
									</FormGroup>
								</FormGroupWrapper>

								<ButtonInputUI
									buttons={{
										icon: 'plus',
										text: __(
											'Add New Customer',
											'multivendorx'
										),
										onClick: () =>
											setShowCreateCustomer(
												!showCreateCustomer
											),
									}}
								/>
							</>
						)}
						{selectedCustomer && (
							<InfoItem
								title={
									selectedCustomer
										? `${selectedCustomer.first_name} ${selectedCustomer.last_name}`
										: __('Guest Customer', 'multivendorx')
								}
								avatar={{
									text: selectedCustomer
										? selectedCustomer.first_name[0]
										: 'C',
									iconClass: 'avatar-text',
								}}
								descriptions={
									selectedCustomer
										? [
												{
													label: __(
														'Customer ID',
														'multivendorx'
													),
													value: `#${selectedCustomer.id}`,
													boldLabel: true,
												},
												{
													value: (
														<>
															<i className="adminfont-mail" />{' '}
															{
																selectedCustomer.email
															}
														</>
													),
												},
												{
													value: (
														<>
															<i className="adminfont-phone" />{' '}
															{
																selectedCustomer
																	.billing
																	?.phone
															}
														</>
													),
												},
											]
										: []
								}
								badges={[
									{
										text: __('Edit', 'multivendorx'),
										className: 'blue',
										onClick: () =>
											setSelectedCustomer(null),
									},
								]}
							/>
						)}
					</Card>

					{showCreateCustomer && !selectedCustomer && (
						<Card title={__('Create customer', 'multivendorx')}>
							<FormGroupWrapper>
								<FormGroup
									cols={2}
									label={__('First name', 'multivendorx')}
									htmlFor="Select-customer"
								>
									<BasicInputUI
										name="first_name"
										value={newCustomer.first_name}
										onChange={(value) =>
											setNewCustomer({
												...newCustomer,
												first_name: value,
											})
										}
									/>
								</FormGroup>

								<FormGroup
									cols={2}
									label={__('Last name', 'multivendorx')}
									htmlFor="last-name"
								>
									<BasicInputUI
										name="last_name"
										value={newCustomer.last_name}
										onChange={(value) =>
											setNewCustomer({
												...newCustomer,
												last_name: value,
											})
										}
									/>
								</FormGroup>

								<FormGroup
									label={__('Email', 'multivendorx')}
									htmlFor="email"
								>
									<EmailsInputUI
										mode="single"
										value={
											newCustomer.email
												? [newCustomer.email]
												: []
										}
										placeholder={__(
											'Enter email...',
											'multivendorx'
										)}
										onChange={(emails) => {
											setNewCustomer({
												...newCustomer,
												email: emails[0] || '',
											});
										}}
									/>
								</FormGroup>

								<FormGroup
									label={__('Phone number', 'multivendorx')}
									htmlFor="phone-number"
								>
									<BasicInputUI
										type="number"
										name="phone"
										value={newCustomer.phone}
										onChange={(value) =>
											setNewCustomer({
												...newCustomer,
												phone: value,
											})
										}
									/>
								</FormGroup>
							</FormGroupWrapper>

							<ButtonInputUI
								buttons={{
									icon: 'plus',
									text: __('Create', 'multivendorx'),
									onClick: () => createCustomer(),
								}}
							/>
						</Card>
					)}

					{renderAddressCard(
						'Shipping address',
						shippingAddress,
						showShippingAddressEdit,
						setShowShippingAddressEdit,
						shippingAddressEditRef,
						'shipping'
					)}

					{renderAddressCard(
						'Billing address',
						billingAddress,
						showAddressEdit,
						setShowAddressEdit,
						addressEditRef,
						'billing'
					)}

					<Card title={__('Order note', 'multivendorx')}>
						<FormGroup>
							<TextAreaUI
								name="order_note"
								value={orderNote}
								placeholder={__(
									'Enter order note...',
									'multivendorx'
								)}
								onChange={(value) => SetOrderNote(value)}
							/>
						</FormGroup>
					</Card>
				</Column>
			</Container>
		</>
	);
};

export default AddOrder;
