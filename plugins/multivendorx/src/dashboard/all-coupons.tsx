import React, { useState, useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { BasicInput, CommonPopup, getApiLink, MultiCheckBox, SelectInput, Table, TableCell, TextArea, ToggleSetting } from 'zyra';
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';
import axios from 'axios';

type StoreRow = {
    id: number;
    store_name?: string;   // Coupon Name
    store_slug?: string;   // Reused but we'll map different fields into it
    type?: string;         // Coupon Type
    amount?: string;       // Coupon Amount
    usage?: string;        // Usage / Limit
    expiry?: string;       // Expiry Date
    status?: string;
};
const discountOptions = [
    { label: "Percentage discount", value: "percent" },
    { label: "Fixed cart discount", value: "fixed_cart" },
    { label: "Fixed product discount", value: "fixed_product" },
];
const handleToggleChange = (value: string) => {

};
const AllCoupon: React.FC = () => {
    const [id, setId] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({
        title: "",
        content: "",
        discount_type: "",
        coupon_amount: "",
        free_shipping: "no",
        expiry_date: "",
        usage_limit: "",
        limit_usage_to_x_items: "",
        usage_limit_per_user: "",
        minimum_amount: "",
        maximum_amount: "",
        individual_use: "no",
        exclude_sale_items: "no",
        product_ids: [],
        exclude_product_ids: [],
        product_categories: [],
        exclude_product_categories: [],
        customer_email: "",
    });

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const dashboardId = searchParams.get("dashboard");
        setId(dashboardId);
    }, []);

    const [data, setData] = useState<StoreRow[]>([]);
    const [storeProducts, setStoreProducts] = useState<{ value: string; label: string }[]>([]);
    const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    useEffect(() => {
        if (!id) return;

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `store/${id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { store: 'store' }
        }).then((res) => {
            const data = res.data || {};
            setStoreProducts(data.products);
            setCategories(data.categories)
        });
    }, [id]);

    const [showDropdown, setShowDropdown] = useState(false);
    const [AddCoupon, setAddCoupon] = useState(false);

    const toggleDropdown = (id: any) => {
        if (showDropdown === id) {
            setShowDropdown(false);
            return;
        }
        setShowDropdown(id);
    };
    const [pageCount, setPageCount] = useState(0);
    const [activeTab, setActiveTab] = useState("general");

    const handleSave = async (status: "draft" | "publish") => {
        try {
            const payload = {
                ...formData,
                status: status,
                store_id: id, // attach store id if needed
            };
            console.log(payload)

            await axios.post(
                getApiLink(appLocalizer, "coupons"),
                payload,
                { headers: { "X-WP-Nonce": appLocalizer.nonce } }
            );
            // Close popup
            setAddCoupon(false);

            // Optionally: reset form
            setFormData({
                title: "",
                content: "",
                discount_type: "",
                coupon_amount: "",
                free_shipping: "no",
                expiry_date: "",
                usage_limit: "",
                limit_usage_to_x_items: "",
                usage_limit_per_user: "",
                minimum_amount: "",
                maximum_amount: "",
                individual_use: "no",
                exclude_sale_items: "no",
                product_ids: [],
                exclude_product_ids: [],
                product_categories: [],
                exclude_product_categories: [],
                customer_email: "",
            });

            // Optionally reload coupons list
            // fetchCoupons();

        } catch (err) {
            console.error("Error saving coupon:", err);
            alert("Failed to save coupon");
        }
    };

    const tabs = [
        {
            id: "general",
            label: "General",
            content: (
                <>
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Discount type</label>
                            <SelectInput
                                name="discount_type"
                                value={formData.discount_type}
                                options={discountOptions}
                                type="single-select"
                                onChange={(val: any) =>
                                    setFormData({ ...formData, discount_type: val?.value || "" })
                                }
                            />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Coupon amount</label>
                            <BasicInput
                                type="number"
                                name="coupon_amount"
                                value={formData.coupon_amount}
                                onChange={(e: any) =>
                                    setFormData({ ...formData, coupon_amount: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Allow free shipping</label>
                            <ToggleSetting
                                wrapperClass="setting-form-input"
                                options={[
                                    { key: "yes", value: "yes", label: "Yes" },
                                    { key: "no", value: "no", label: "No" },
                                ]}
                                value={formData.free_shipping}
                                onChange={(val: any) =>
                                    setFormData({ ...formData, free_shipping: val })
                                }
                            />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Coupon expiry date</label>
                            <BasicInput
                                type="date"
                                name="expiry_date"
                                value={formData.expiry_date}
                                onChange={(e: any) =>
                                    setFormData({ ...formData, expiry_date: e.target.value })
                                }
                            />
                        </div>
                    </div>
                </>
            ),
        },
        {
            id: "limits",
            label: "Usage Limits",
            content: (
                <>
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Usage limit per coupon</label>
                            <BasicInput
                                type="number"
                                name="usage_limit"
                                value={formData.usage_limit}
                                onChange={(e: any) =>
                                    setFormData({ ...formData, usage_limit: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Limit usage to X items</label>
                            <BasicInput
                                type="number"
                                name="limit_usage_to_x_items"
                                value={formData.limit_usage_to_x_items}
                                onChange={(e: any) =>
                                    setFormData({ ...formData, limit_usage_to_x_items: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Usage limit per user</label>
                            <BasicInput
                                type="number"
                                name="usage_limit_per_user"
                                value={formData.usage_limit_per_user}
                                onChange={(e: any) =>
                                    setFormData({ ...formData, usage_limit_per_user: e.target.value })
                                }
                            />
                        </div>
                    </div>
                </>
            ),
        },
        {
            id: "restriction",
            label: "Usage Restriction",
            content: (
                <>
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Minimum spend</label>
                            <BasicInput
                                type="number"
                                name="minimum_amount"
                                value={formData.minimum_amount}
                                onChange={(e: any) =>
                                    setFormData({ ...formData, minimum_amount: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Maximum spend</label>
                            <BasicInput
                                type="number"
                                name="maximum_amount"
                                value={formData.maximum_amount}
                                onChange={(e: any) =>
                                    setFormData({ ...formData, maximum_amount: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Individual use only</label>
                            <MultiCheckBox
                                khali_dabba={appLocalizer?.khali_dabba ?? false}
                                wrapperClass="toggle-btn"
                                descClass="settings-metabox-description"
                                inputWrapperClass="toggle-checkbox-header"
                                inputInnerWrapperClass="toggle-checkbox"
                                inputClass="basic-input"
                                idPrefix="toggle-switch"
                                options={[
                                    { key: "yes", value: "yes" },
                                    { key: "no", value: "no" },
                                ]}
                                value={
                                    formData.individual_use === "yes"
                                        ? ["yes"]
                                        : ["no"]
                                }
                                onChange={(selected: any) =>
                                    setFormData({
                                        ...formData,
                                        individual_use: selected.includes("yes") ? "yes" : "no",
                                    })
                                }
                            />

                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Exclude sale items</label>
                            <MultiCheckBox
                                khali_dabba={appLocalizer?.khali_dabba ?? false}
                                wrapperClass="toggle-btn"
                                descClass="settings-metabox-description"
                                inputWrapperClass="toggle-checkbox-header"
                                inputInnerWrapperClass="toggle-checkbox"
                                inputClass="basic-input"
                                idPrefix="toggle-switch"
                                options={[{ key: "exclude_sale_items", value: "yes" }]}
                                value={
                                    formData.exclude_sale_items === "yes"
                                        ? ["exclude_sale_items"]
                                        : []
                                }
                                onChange={(selected: any) =>
                                    setFormData({
                                        ...formData,
                                        exclude_sale_items: selected.includes("exclude_sale_items")
                                            ? "yes"
                                            : "no",
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Products</label>
                            <SelectInput
                                name="product_ids"
                                type="multi-select"
                                options={storeProducts}
                                value={formData.product_ids}
                                onChange={(newValue: any) =>
                                    setFormData({
                                        ...formData,
                                        product_ids: newValue.map((item: any) => item.value),
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Exclude products</label>
                            <SelectInput
                                name="exclude_product_ids"
                                type="multi-select"
                                options={storeProducts}
                                value={formData.exclude_product_ids}
                                onChange={(newValue: any) =>
                                    setFormData({
                                        ...formData,
                                        exclude_product_ids: newValue.map((item: any) => item.value),
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Product categories</label>
                            <SelectInput
                                name="product_categories"
                                type="multi-select"
                                options={categories}
                                value={formData.product_categories}
                                onChange={(newValue: any) =>
                                    setFormData({
                                        ...formData,
                                        product_categories: newValue.map((item: any) => item.value),
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Exclude categories</label>
                            <SelectInput
                                name="exclude_product_categories"
                                type="multi-select"
                                options={categories}
                                value={formData.exclude_product_categories}
                                onChange={(newValue: any) =>
                                    setFormData({
                                        ...formData,
                                        exclude_product_categories: newValue.map(
                                            (item: any) => item.value
                                        ),
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Allowed emails</label>
                            <BasicInput
                                type="text"
                                name="customer_email"
                                value={formData.customer_email}
                                onChange={(e: any) =>
                                    setFormData({ ...formData, customer_email: e.target.value })
                                }
                            />
                        </div>
                    </div>
                </>
            ),
        }
    ];

    // 🔹 Add demo data on mount
    useEffect(() => {
        const demoData: StoreRow[] = [
            {
                id: 25831,
                store_name: "EAA2US8Z",
                type: "Fixed Cart Discount",
                amount: "10.6",
                usage: "0 / 200",
                expiry: "2025-12-31",
                status: "Active",
            },
            {
                id: 25832,
                store_name: "WELCOME10",
                type: "Percentage",
                amount: "10%",
                usage: "12 / 100",
                expiry: "2026-01-15",
                status: "Active",
            },
            {
                id: 25833,
                store_name: "FREESHIP",
                type: "Free Shipping",
                amount: "—",
                usage: "5 / ∞",
                expiry: "2025-10-01",
                status: "Expired",
            },
        ];
        setData(demoData);
        setTotalRows(demoData.length);
    }, []);

    // 🔹 Update page count when pagination or totalRows changes
    useEffect(() => {
        const rowsPerPage = pagination.pageSize;
        setPageCount(Math.ceil(totalRows / rowsPerPage));
    }, [pagination, totalRows]);

    // Column definitions
    const columns: ColumnDef<StoreRow>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <input
                    type="checkbox"
                    checked={table.getIsAllRowsSelected()}
                    onChange={table.getToggleAllRowsSelectedHandler()}
                />
            ),
            cell: ({ row }) => (
                <input
                    type="checkbox"
                    checked={row.getIsSelected()}
                    onChange={row.getToggleSelectedHandler()}
                />
            ),
        },
        {
            header: __('Coupon Name', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.store_name || ''}>
                    {row.original.store_name || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Coupon type', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.type || ''}>
                    {row.original.type || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Coupon Amount', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.amount || ''}>
                    {row.original.amount || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Usage / Limit', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.usage || ''}>
                    {row.original.usage || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Expiry Date', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.expiry || ''}>
                    {row.original.expiry || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Status', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.status || ""}>
                    {row.original.status === "Active" && (
                        <span className="admin-badge green">Active</span>
                    )}
                    {row.original.status === "Inactive" && (
                        <span className="admin-badge ">Inactive</span>
                    )}
                    {row.original.status === "Expired" && (
                        <span className="admin-badge red">Expired</span>
                    )}
                </TableCell>


            ),
        },
        {
            header: __('Action', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title="Action">
                    <div className="action-section">
                        <div className="action-icons">
                            <i
                                className="adminlib-more-vertical"
                                onClick={() =>
                                    toggleDropdown(row.original.order_id)
                                }
                            ></i>
                            <div
                                className={`action-dropdown ${showDropdown === row.original.order_id
                                    ? 'show'
                                    : ''
                                    }`}
                            >

                                <ul>
                                    <li
                                        onClick={() =>
                                            (window.location.href = `?page=multivendorx#&tab=stores&view&id=${row.original.id}`)
                                        }
                                    >
                                        <i className="adminlib-eye"></i>
                                        {__('View Store', 'multivendorx')}
                                    </li>
                                    <li
                                        onClick={() =>
                                            (window.location.href = `?page=multivendorx#&tab=stores&edit/${row.original.id}`)
                                        }
                                    >
                                        <i className="adminlib-create"></i>
                                        {__('Edit Store', 'multivendorx')}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </TableCell>
            ),
        },
    ];

    return (
        <>
            <div className="header-wrapper">
                <div
                    className="admin-btn btn-purple"
                    onClick={() => setAddCoupon(true)}
                >
                    <i className="adminlib-plus-circle-o"></i>
                    Add New
                </div>
            </div>

            {AddCoupon && (
                <CommonPopup
                    open={AddCoupon}
                    // onClose= setAddCoupon(true)
                    width="500px"
                    height="100%"
                    header={
                        <>
                            <div className="title">
                                <i className="adminlib-cart"></i>
                                Add Coupon
                            </div>
                            <p>Publish important news, updates, or alerts that appear directly in store dashboards, ensuring sellers never miss critical information.</p>
                            <i
                                className="icon adminlib-close"
                                onClick={() => setAddCoupon(false)}
                            ></i>
                        </>
                    }
                    footer={
                        <>
                            <div
                                className="admin-btn btn-red"
                                onClick={() => handleSave("draft")}
                            >
                                Draft
                                <i className="adminlib-contact-form"></i>
                            </div>
                            <div
                                className="admin-btn btn-purple"
                                onClick={() => handleSave("publish")}
                            >
                                Publish
                                <i className="adminlib-check"></i>
                            </div>

                        </>
                    }
                >

                    <div className="content">
                        {/* start left section */}
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="title">Coupon code</label>
                                <BasicInput
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={(e: any) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="title">Description (optional)</label>
                                <TextArea
                                    name="content"
                                    inputClass="textarea-input"
                                    rowNumber={6}
                                    value={formData.content}
                                    onChange={(e: any) =>
                                        setFormData({ ...formData, content: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        <div className="tab-titles">
                            {tabs.map((tab) => (
                                <div
                                    key={tab.id}
                                    className={`title ${activeTab === tab.id ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <h2>{tab.label}</h2>
                                </div>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="tab-content">
                            {tabs.map(
                                (tab) =>
                                    activeTab === tab.id && (
                                        <div key={tab.id} className="tab-panel">
                                            {tab.content}
                                        </div>
                                    )
                            )}
                        </div>
                    </div>

                    {/* {error && <p className="error-text">{error}</p>} */}
                </CommonPopup>
            )}
            <div className="admin-table-wrapper">
                <Table
                    data={data}
                    columns={columns as ColumnDef<Record<string, any>, any>[]}
                    rowSelection={rowSelection}
                    onRowSelectionChange={setRowSelection}
                    defaultRowsPerPage={10}
                    pageCount={pageCount}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    perPageOption={[10, 25, 50]}
                    typeCounts={[]}
                    realtimeFilter={[]}
                />
            </div>
        </>
    );
};

export default AllCoupon;
