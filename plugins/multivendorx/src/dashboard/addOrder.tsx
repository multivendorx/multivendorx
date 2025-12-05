import { useEffect, useRef, useState } from "react";
import { BasicInput, SelectInput, TextArea, getApiLink } from "zyra";
import axios from "axios";
import { formatCurrency } from "@/services/commonFunction";


const AddOrder = () => {
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
    const [showShippingAddressEdit, setShowShippingAddressEdit] = useState(false);

    const [showCreateCustomer, setShowCreateCustomer] = useState(false);

    const addressEditRef = useRef(null);
    const shippingAddressEditRef = useRef(null);
    const [shippingLines, setShippingLines] = useState([]);
    const [availableShippingMethods, setAvailableShippingMethods] = useState([]);

    useEffect(() => {
        // if (!showAddressEdit) return;

        function handleClickOutside(e) {
            if (addressEditRef.current && !addressEditRef.current.contains(e.target)) {
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
                    }
                };
                axios.put(`${appLocalizer.apiUrl}/wc/v3/customers/${selectedCustomer?.id}`, payload, {
                    headers: { "X-WP-Nonce": appLocalizer.nonce }
                })
                .then(res => {
                    setBillingAddress(res.data.billing);
                });

                setShowAddressEdit(false);
            }
            if (shippingAddressEditRef.current && !shippingAddressEditRef.current.contains(e.target)) {

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
                    }
                };
                axios.put(`${appLocalizer.apiUrl}/wc/v3/customers/${selectedCustomer?.id}`, payload, {
                    headers: { "X-WP-Nonce": appLocalizer.nonce }
                })
                .then(res => {
                    setShippingAddress(res.data.shipping);
                });

                setShowShippingAddressEdit(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showAddressEdit, showShippingAddressEdit, shippingAddress, billingAddress]);

    useEffect(() => {
        axios.get(`${appLocalizer.apiUrl}/wc/v3/customers`, {
            headers: {
                'X-WP-Nonce': appLocalizer.nonce
            },
            params: {
                per_page: 100,
            }
        })
            .then((response) => {
                setCustomers(response.data);
            });
    }, []);

    const customerOptions = [
        { label: "Choose customer...", value: "" },
        ...customers?.map((c) => ({
            label: `${c.first_name} ${c.last_name}`.trim() || c.email,
            value: c.id
        }))
    ];

    useEffect(() => {
        if (!showAddProduct) return;

        axios.get(`${appLocalizer.apiUrl}/wc/v3/products`, {
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                per_page: 100
            }
        })
            .then((res) => {
                const products = res.data;

                const filtered = products.filter(p => {
                    const storeId = p.meta_data?.find(m => m.key === "multivendorx_store_id")?.value;
                    return storeId === appLocalizer.store_id || !storeId;
                });

                setAllProducts(filtered);
            })
    }, [showAddProduct]);


    const subtotal = addedProducts.reduce((sum, item) => {
        return sum + item.price * (item.qty || 1);
    }, 0);

    // const taxRate = 0.18; // 18% GST example
    // const tax = subtotal * taxRate;

    // const shipping = 50; // Example flat shipping

    // const discount = 0; // If you add discount input later

    // const grandTotal = subtotal + tax + shipping - discount;

    const hasCustomer = !!selectedCustomer;

    useEffect(() => {
        axios.get(`${appLocalizer.apiUrl}/wc/v3/payment_gateways`, {
            headers: { "X-WP-Nonce": appLocalizer.nonce }
        })
            .then(res => {
                const enabled = res.data.filter(m => m.enabled === true);

                const formatted = enabled.map(m => ({
                    label: m.title,
                    value: m.id,
                    method_title: m.title
                }));

                setPaymentMethods(formatted);
            })
    }, []);

    useEffect(() => {
        axios.get(`${appLocalizer.apiUrl}/wc/v3/shipping_methods`, {
            headers: { "X-WP-Nonce": appLocalizer.nonce }
        })
        .then(res => {
            const formatted = res.data.map(method => ({
                label: method.title,
                value: method.id,
                ...method
            }));
            setAvailableShippingMethods(formatted);
        })
    }, []);

    const totalShipping = shippingLines.reduce((sum, s) => sum + Number(s.cost || 0), 0);

    const paymentOptions = [
        { label: "Select Payment Method", value: "" },
        ...paymentMethods
    ];

    const [taxRates, setTaxRates] = useState([]);

    useEffect(() => {
        axios.get(`${appLocalizer.apiUrl}/wc/v3/taxes`, {
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { per_page: 100 }
        })
        .then(res => setTaxRates(res.data));
    }, []);

    const [showAddTax, setShowAddTax] = useState(false);
    const [selectedTaxRate, setSelectedTaxRate] = useState(null);

    const applyTaxToOrder = () => {
        if (!selectedTaxRate) return;

        const rate = Number(selectedTaxRate.rate) / 100;

        setAddedProducts(prev =>
            prev.map(item => ({
                ...item,
                tax_rate_id: selectedTaxRate.id,
                tax_amount: item.price * (item.qty || 1) * rate
            }))
        );
    };

    // const createOrder = async () => {
    //     const orderData = {
    //         customer_id: selectedCustomer.id,

    //         billing: billingAddress,
    //         shipping: shippingAddress,

    //         line_items: addedProducts.map(item => ({
    //             product_id: item.id,
    //             quantity: item.qty || 1,
    //         })),

    //         // shipping_lines: [
    //         //     {
    //         //         method_id: "flat_rate",
    //         //         method_title: "Flat Rate",
    //         //         total: "50"
    //         //     }
    //         // ],
    //         shipping_lines: shippingLines.map(s => ({
    //             method_id: s.method_id,
    //             method_title: s.name,
    //             total: String(s.cost.toFixed(2))
    //         })),


    //         payment_method: selectedPayment?.value,
    //         payment_method_title: selectedPayment?.method_title,
    //         set_paid: false
    //     };

    //     axios.post(`${appLocalizer.apiUrl}/wc/v3/orders`, orderData, {
    //         headers: { "X-WP-Nonce": appLocalizer.nonce },
    //     })
    //     .then(res => {
    //         console.log("Order created:", res.data);
    //         window.location.assign(window.location.pathname);
    //     })
    // };

    const createOrder = async () => {
        const orderData = {
            customer_id: selectedCustomer?.id || 0,

            billing: billingAddress,
            shipping: shippingAddress,

            line_items: addedProducts.map(item => {
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
                        : []
                }
            }),

            // Shipping
            shipping_lines: shippingLines.map(s => ({
                method_id: s.method_id,
                method_title: s.name,
                total: Number(s.cost).toFixed(2)
            })),

            // Payment
            payment_method: selectedPayment?.value || "",
            payment_method_title: selectedPayment?.method_title || "",
            set_paid: false,
        };

        axios.post(`${appLocalizer.apiUrl}/wc/v3/orders`, orderData, {
            headers: { "X-WP-Nonce": appLocalizer.nonce }
        })
        .then(res => {
            console.log("Order created:", res.data);
            window.location.assign(window.location.pathname);
        })
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
        first_name: "",
        last_name: "",
        email: "",
        phone: ""
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
                phone: newCustomer.phone
            },
            shipping: {
                first_name: newCustomer.first_name,
                last_name: newCustomer.last_name
            }
        };

        axios.post(`${appLocalizer.apiUrl}/wc/v3/customers`, payload, {
            headers: { "X-WP-Nonce": appLocalizer.nonce }
        })
        .then(res => {
            const customer = res.data;

            // Add to dropdown immediately
            setCustomers(prev => [...prev, customer]);

            // Select this customer automatically
            setSelectedCustomer(customer);
            setBillingAddress(customer.billing);
            setShippingAddress(customer.shipping);

            // Close create form
            setShowCreateCustomer(false);

            // Clear form
            setNewCustomer({
                first_name: "",
                last_name: "",
                email: "",
                phone: ""
            });
        })
    };
    const [stateOptions, setStateOptions] = useState<{ label: string; value: string }[]>([]);

    const fetchStatesByCountry = (countryCode: string) => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `states/${countryCode}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        }).then((res) => {
            setStateOptions(res.data || []);
        })
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

    return (
        <>
            <div className="page-title-wrapper">
                <div className="page-title">
                    <div className="title">
                        Add Order
                    </div>

                    <div className="des">
                        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quas accusantium obcaecati labore nam quibusdam minus.
                    </div>
                </div>
                <div className="buttons">
                    <button
                        className="admin-btn btn-purple-bg"
                        onClick={createOrder}
                    >
                        Create Order
                    </button>
                </div>
            </div>


            <div className="container-wrapper">
                <div className="card-wrapper w-65">
                    <div className="card-content">
                        <div className="table-wrapper view-order-table">
                            <table className="admin-table">
                                <thead className="admin-table-header">
                                    <tr className="header-row">
                                        <td className="header-col">Item</td>
                                        <td className="header-col">Price</td>
                                        <td className="header-col">Qty</td>
                                        <td className="header-col">Total</td>
                                    </tr>
                                </thead>
                                <tbody className="admin-table-body">
                                    {addedProducts.length > 0 &&
                                        addedProducts.map((item) => (
                                            <tr key={`added-${item.id}`} className="admin-row simple">
                                                <td className="admin-column">
                                                    <div className="item-details">
                                                        <div className="image">
                                                            <img
                                                                src={item?.images?.[0]?.src}
                                                                width={40}
                                                                alt={item.name}
                                                            />
                                                        </div>
                                                        <div className="detail">
                                                            <div className="name">{item.name}</div>
                                                            {item?.sku && <div className="sku">SKU: {item.sku}</div>}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="admin-column">${item.price}</td>

                                                <td className="admin-column">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        className="basic-input"
                                                        value={item.qty || 1}
                                                        onChange={(e) => {
                                                            const qty = +e.target.value;
                                                            setAddedProducts(prev => prev.map(p => p.id === item.id ? { ...p, qty } : p));
                                                        }}
                                                    />
                                                </td>

                                                <td className="admin-column">
                                                    ${(item.price * (item.qty || 1)).toFixed(2)}
                                                </td>

                                                {/* <td className="admin-column">${item.price}</td> */}
                                            </tr>
                                        ))
                                    }

                                    {shippingLines.map(ship => (
                                        <tr key={`ship-${ship.id}`} className="admin-row shipping-row">

                                            <td className="admin-column">
                                                <div className="item-details">
                                                    <div className="icon">
                                                        <i className="adminlib-cart green"></i>
                                                    </div>

                                                    <div className="detail">
                                                        <div className="name">Shipping</div>
                                                        <SelectInput
                                                            name="shipping_method"
                                                            type="single-select"
                                                            options={availableShippingMethods}
                                                            value={availableShippingMethods.find(o => o.value === ship.method_id)}
                                                            onChange={(selected) => {

                                                                const method_id = selected.value;
                                                                const method_title = selected.label;

                                                                setShippingLines(prev =>
                                                                    prev.map(s => s.id === ship.id ? {
                                                                        ...s,
                                                                        method_id,
                                                                        name: method_title
                                                                    } : s)
                                                                );
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="admin-column"></td>
                                            <td className="admin-column"></td>

                                            <td className="admin-column">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    className="basic-input"
                                                    value={ship.cost}
                                                    onChange={e => {
                                                        const cost = parseFloat(e.target.value) || 0;
                                                        setShippingLines(prev =>
                                                            prev.map(s => s.id === ship.id ? { ...s, cost } : s)
                                                        );
                                                    }}
                                                />
                                            </td>

                                        </tr>
                                    ))}

                                </tbody>
                            </table>
                            <div className="card-content">
                                <div className="total-summary">
                                    <div className="row">
                                        <span>Subtotal:</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>

                                    <div className="row">
                                        <span>Tax:</span>
                                        <span>${addedProducts.reduce((sum, p) => sum + (p.tax_amount || 0), 0).toFixed(2)}</span>
                                    </div>

                                    <div className="row">
                                        <span>Shipping:</span>
                                        <span>{formatCurrency(totalShipping)}</span>
                                    </div>

                                    <div className="row total">
                                        <strong>Grand Total:</strong>
                                        <strong>${grandTotal.toFixed(2)}</strong>
                                    </div>
                                </div>
                                <div className="buttons-wrapper left">
                                    <button className="admin-btn btn-purple-bg" onClick={() => setShowAddProduct(true)}>
                                        <i className="adminlib-plus-circle"></i> Add Product
                                    </button>
                                    <button
                                        className="admin-btn btn-purple-bg"
                                        onClick={() => {
                                            setShippingLines(prev => [
                                                ...prev,
                                                {
                                                    name: "Shipping",
                                                    cost: 0
                                                }
                                            ]);
                                        }}
                                    >
                                        <i className="adminlib-plus-circle"></i> Add Shipping
                                    </button>
                                    <button className="admin-btn btn-purple-bg" onClick={() => setShowAddTax(true)}>
                                        <i className="adminlib-plus-circle"></i> Add Tax
                                    </button>
                                </div>

                                {showAddProduct && (
                                    <div className="select-product-wrapper">
                                        <label>Select Product</label>

                                        <SelectInput
                                            name="product_select"
                                            type="single-select"
                                            options={[
                                                { label: "Select a product", value: "" },
                                                ...allProducts.map((p) => ({
                                                    label: p.name,
                                                    value: p.id
                                                }))
                                            ]}
                                            onChange={(selected) => {
                                                if (!selected?.value) return;

                                                const prod = allProducts.find(p => p.id == selected.value);
                                                if (prod) {
                                                    setAddedProducts(prev => [...prev, { ...prod, qty: 1 }]);
                                                }
                                                setShowAddProduct(false);
                                            }}
                                        />
                                    </div>
                                )}

                                {showAddTax && (
                                    <div className="tax-modal">
                                        <h2>Add tax</h2>

                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <td></td>
                                                    <td>Rate name</td>
                                                    <td>Tax class</td>
                                                    <td>Rate code</td>
                                                    <td>Rate %</td>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {taxRates.map(rate => (
                                                    <tr key={rate.id} className="admin-row">
                                                        <td className="admin-column">
                                                            <input
                                                                type="radio"
                                                                name="tax"
                                                                onChange={() => setSelectedTaxRate(rate)}
                                                                checked={selectedTaxRate?.id === rate.id}
                                                            />
                                                        </td>
                                                        <td className="admin-column">{rate.name}</td>
                                                        <td className="admin-column">{rate.class || "Standard"}</td>
                                                        <td className="admin-column">{`${rate.country}-${rate.state}-${rate.name}`}</td>
                                                        <td className="admin-column">{rate.rate}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        <button
                                            className="admin-btn btn-purple-bg"
                                            onClick={() => {
                                                applyTaxToOrder();
                                                setShowAddTax(false);
                                            }}
                                        >
                                            Add
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card-wrapper w-35">
                    <div className="card-content">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">Payment Method</div>
                            </div>
                        </div>

                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="payment-method">Select Payment Method</label>
                                <SelectInput
                                    name="payment_method"
                                    options={paymentOptions}
                                    type="single-select"
                                    value={selectedPayment?.value}
                                    onChange={(value) => {
                                        const method = paymentMethods.find(m => m.value === value.value);
                                        setSelectedPayment(method || null);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card-content">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Customer details
                                </div>
                            </div>
                        </div>
                        {!selectedCustomer && (
                            <>
                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="product-name">Select Customer</label>
                                        <SelectInput
                                            name="new_owner"
                                            options={customerOptions}
                                            type="single-select"
                                            onChange={(value) => {
                                                const customer = customers.find(c => c.id == value.value);
                                                setSelectedCustomer(customer);
                                                if (customer) {
                                                    setShippingAddress(customer.shipping);
                                                    setBillingAddress(customer.billing);
                                                    setShowCreateCustomer(false);
                                                } 
                                                // else {
                                                //     setShippingAddress({});
                                                //     setBillingAddress({});
                                                // }
                                            }}
                                        />
                                    </div>
                                </div>
                                
                                <div className="admin-btn btn-purple-bg" onClick={() => setShowCreateCustomer(!showCreateCustomer)}>Add New Customer</div>
                            </>
                        )}

                        {selectedCustomer && (
                            <div className="store-owner-details">
                                <div className="profile">
                                    <div className="avater">
                                        <span>{selectedCustomer ? selectedCustomer.first_name[0] : "C"}</span>
                                    </div>

                                    <div className="details">
                                        <div className="name">
                                            {selectedCustomer
                                                ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}`
                                                : "Guest Customer"}
                                        </div>

                                        {selectedCustomer && (
                                            <>
                                                <div className="des">Customer ID: #{selectedCustomer.id}</div>
                                                <div className="des">
                                                    <i className="adminlib-mail" /> {selectedCustomer.email}
                                                </div>
                                                <div className="des">
                                                    <i className="adminlib-phone" /> {selectedCustomer.billing.phone}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="admin-badge blue" onClick={() => setSelectedCustomer(false)}>
                                    <i className="adminlib-edit"></i>
                                </div>
                            </div>
                        )}
                        
                    </div>
                    {showCreateCustomer && !selectedCustomer && (
                        <div className="card-content">
                            <div className="card-header">
                                <div className="left">
                                    <div className="title">
                                        Create customer
                                    </div>
                                </div>
                            </div>
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">First name</label>
                                    <BasicInput 
                                        name="first_name"
                                        value={newCustomer.first_name}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, first_name: e.target.value })}
                                        wrapperClass="setting-form-input"
                                    />

                                </div>
                                <div className="form-group">
                                    <label htmlFor="product-name">Last name</label>
                                    <BasicInput 
                                        name="last_name"
                                        value={newCustomer.last_name}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, last_name: e.target.value })}
                                        wrapperClass="setting-form-input"
                                    />
                                </div>
                            </div>
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">Email</label>
                                    <BasicInput 
                                        name="email"
                                        value={newCustomer.email}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                        wrapperClass="setting-form-input"
                                    />
                                </div>
                            </div>
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">Phone number</label>
                                    <BasicInput 
                                        name="phone"
                                        value={newCustomer.phone}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                        wrapperClass="setting-form-input"
                                    />

                                </div>
                            </div>
                            <div className="buttons-wrapper">
                                <div className="admin-btn btn-purple-bg" onClick={createCustomer}>Create</div>
                            </div>
                        </div>
                    )}

                    <div className="card-content">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Shipping address
                                </div>
                            </div>
                        </div>
                        {!hasCustomer && (
                            <div className="address-wrapper">
                                <div className="address">
                                    <span>Please Select a customer</span>
                                </div>
                            </div>
                        )}

                        {hasCustomer && !showShippingAddressEdit && (
                            <div className="address-wrapper">
                                <div className="address">
                                    <span>{shippingAddress.address_1}</span>
                                    <span>{shippingAddress.city}</span>
                                    <span>{shippingAddress.postcode}, {shippingAddress.state}</span>
                                    <span>{shippingAddress.country}</span>
                                </div>

                                <div className="admin-badge blue" onClick={() => setShowShippingAddressEdit(true)}>
                                    <i className="adminlib-edit"></i>
                                </div>
                            </div>
                        )}

                        {showShippingAddressEdit && (
                            < div ref={shippingAddressEditRef}>
                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="product-name">Address</label>
                                        <BasicInput 
                                            name="address_1"
                                            value={shippingAddress.address_1} 
                                            wrapperClass="setting-form-input" 
                                            onChange={(e) => setShippingAddress(prev => ({
                                                            ...prev,
                                                            address_1: e.target.value
                                                        }))} 
                                        />
                                    </div>
                                </div>

                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="product-name">City</label>
                                        <BasicInput
                                            name="city"
                                            value={shippingAddress.city || ""}
                                            onChange={(e) =>
                                                setShippingAddress(prev => ({
                                                    ...prev,
                                                    city: e.target.value
                                                }))
                                            }
                                            wrapperClass="setting-form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="product-name">Postcode / ZIP</label>
                                        <BasicInput
                                            name="postcode"
                                            value={shippingAddress.postcode || ""}
                                            onChange={(e) =>
                                                setShippingAddress(prev => ({
                                                    ...prev,
                                                    postcode: e.target.value
                                                }))
                                            }
                                            wrapperClass="setting-form-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="product-name">Country / Region</label>
                                        <SelectInput
                                            name="country"
                                            value={shippingAddress.country}
                                            options={appLocalizer.country_list || []}
                                            type="single-select"
                                            onChange={(selected) => {
                                                setShippingAddress(prev => ({
                                                    ...prev,
                                                    country: selected.value
                                                }))
                                                fetchStatesByCountry(selected.value)
                                            }
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="product-name">State / County</label>
                                        <SelectInput
                                            name="state"
                                            value={shippingAddress.state}
                                            options={stateOptions}
                                            type="single-select"
                                            onChange={(selected) => {
                                                setShippingAddress(prev => ({
                                                    ...prev,
                                                    state: selected.value
                                                }))
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="card-content">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Billing address
                                </div>
                            </div>
                        </div>
                        {!hasCustomer && (
                            <div className="address-wrapper">
                                <div className="address">
                                    <span>No billing address found</span>
                                </div>
                            </div>
                        )}

                        {hasCustomer && !showAddressEdit && (
                            <div className="address-wrapper">
                                <div className="address">
                                    <span>{billingAddress.address_1}</span>
                                    <span>{billingAddress.city}</span>
                                    <span>{billingAddress.postcode}, {billingAddress.state}</span>
                                    <span>{billingAddress.country}</span>
                                </div>

                                <div className="admin-badge blue" onClick={() => setShowAddressEdit(true)}>
                                    <i className="adminlib-edit"></i>
                                </div>
                            </div>
                        )}

                        {showAddressEdit && (
                            <div ref={addressEditRef}>
                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="product-name">Address</label>
                                        <BasicInput 
                                            name="address_1"
                                            value={billingAddress.address_1} 
                                            wrapperClass="setting-form-input" 
                                            onChange={(e) => setBillingAddress(prev => ({
                                                            ...prev,
                                                            address_1: e.target.value
                                                        }))} 
                                        />
                                    </div>
                                </div>

                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="product-name">City</label>
                                        <BasicInput
                                            name="city"
                                            value={billingAddress.city || ""}
                                            onChange={(e) =>
                                                setBillingAddress(prev => ({
                                                    ...prev,
                                                    city: e.target.value
                                                }))
                                            }
                                            wrapperClass="setting-form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="product-name">Postcode / ZIP</label>
                                        <BasicInput
                                            name="postcode"
                                            value={billingAddress.postcode || ""}
                                            onChange={(e) =>
                                                setBillingAddress(prev => ({
                                                    ...prev,
                                                    postcode: e.target.value
                                                }))
                                            }
                                            wrapperClass="setting-form-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="product-name">Country / Region</label>
                                        <SelectInput
                                            name="country"
                                            value={billingAddress.country}
                                            options={appLocalizer.country_list || []}
                                            type="single-select"
                                            onChange={(selected) => {
                                                setBillingAddress(prev => ({
                                                    ...prev,
                                                    country: selected.value
                                                }))
                                                fetchStatesByCountry(selected.value)
                                            }
                                            }
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="product-name">State / County</label>
                                        <SelectInput
                                            name="state"
                                            value={billingAddress.state}
                                            options={stateOptions}
                                            type="single-select"
                                            onChange={(selected) => {
                                                setBillingAddress(prev => ({
                                                    ...prev,
                                                    state: selected.value
                                                }))
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="card-content">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Order note
                                </div>
                            </div>
                        </div>
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <TextArea name="shipping_policy" wrapperClass="setting-from-textarea"
                                    inputClass="textarea-input"
                                    descClass="settings-metabox-description"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AddOrder