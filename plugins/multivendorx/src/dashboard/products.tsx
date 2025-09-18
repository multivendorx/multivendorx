import React, { useState, useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { BasicInput, CommonPopup, MultiCheckBox, Table, TableCell, TextArea } from 'zyra';
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';

type ProductRow = {
    id: number;
    product_name?: string;
    product_sku?: string;
    price?: string;
    stock?: string;
    categories?: string;
    date?: string;
    status?: string;
};

const AllProduct: React.FC = () => {
    const [data, setData] = useState<ProductRow[]>([]);

    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const [showDropdown, setShowDropdown] = useState(false);
    const [AddProduct, setAddProduct] = useState(false);

    const toggleDropdown = (id: any) => {
        if (showDropdown === id) {
            setShowDropdown(false);
            return;
        }
        setShowDropdown(id);
    };
    const [pageCount, setPageCount] = useState(0);
    const [activeTab, setActiveTab] = useState("general");

    const tabs = [
        {
            id: "general",
            label: "General",
            content: (
                <>
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Discount type</label>
                            <BasicInput type="text" name="discount_type" />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Coupon amount</label>
                            <BasicInput type="number" name="coupon_amount" />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Allow free shipping</label>
                            <BasicInput type="text" name="free_shipping" />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Coupon expiry date</label>
                            <BasicInput type="date" name="expiry_date" />
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
                            <BasicInput type="number" name="limit_per_coupon" />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Limit usage to X items</label>
                            <BasicInput type="number" name="limit_per_items" />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Usage limit per user</label>
                            <BasicInput type="number" name="limit_per_user" />
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
                            <BasicInput type="number" name="min_spend" />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Maximum spend</label>
                            <BasicInput type="number" name="max_spend" />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Individual use only</label>
                            <BasicInput type="checkbox" name="individual_use" />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Exclude sale items</label>
                            <BasicInput type="checkbox" name="exclude_sale_items" />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Products</label>
                            <BasicInput type="text" name="products" />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Exclude products</label>
                            <BasicInput type="text" name="exclude_products" />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Product categories</label>
                            <BasicInput type="text" name="product_categories" />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Exclude categories</label>
                            <BasicInput type="text" name="exclude_categories" />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Allowed emails</label>
                            <BasicInput type="text" name="allowed_emails" />
                        </div>
                    </div>
                </>
            ),
        },
    ];


    // 🔹 Add demo data on mount
    useEffect(() => {
        const demoData: ProductRow[] = [
            {
                id: 101,
                product_name: "Wireless Mouse",
                product_sku: "WM-101",
                price: "$25.99",
                stock: "In Stock",
                categories: "Accessories",
                date: "June 18, 2025",
                status: "Published",
            },
            {
                id: 102,
                product_name: "Mechanical Keyboard",
                product_sku: "MK-203",
                price: "$79.00",
                stock: "Out of Stock",
                categories: "Accessories",
                date: "June 18, 2025",
                status: "Draft",
            },
            {
                id: 103,
                product_name: "Gaming Headset",
                product_sku: "GH-332",
                price: "$59.50",
                stock: "In Stock",
                categories: "Audio",
                date: "June 18, 2025",
                status: "Published",
            },
            {
                id: 104,
                product_name: "4K Monitor",
                product_sku: "MON-4K24",
                price: "$329.99",
                stock: "Out of Stock",
                categories: "Monitors",
                date: "June 18, 2025",
                status: "Draft",
            },
            {
                id: 105,
                product_name: "USB-C Hub",
                product_sku: "HUB-C72",
                price: "$34.25",
                stock: "In Stock",
                categories: "Accessories",
                date: "June 18, 2025",
                status: "Published",
            },
            {
                id: 106,
                product_name: "Portable SSD 1TB",
                product_sku: "SSD-1T",
                price: "$109.99",
                stock: "In Stock",
                categories: "Storage",
                date: "June 18, 2025",
                status: "Draft",
            },
            {
                id: 107,
                product_name: "Smartphone Stand",
                product_sku: "STAND-20",
                price: "$12.49",
                stock: "Out of Stock",
                categories: "Accessories",
                date: "June 18, 2025",
                status: "Published",
            },
            {
                id: 108,
                product_name: "Bluetooth Speaker",
                product_sku: "BS-77",
                price: "$45.00",
                stock: "In Stock",
                categories: "Audio",
                date: "June 18, 2025",
                status: "Draft",
            },
            {
                id: 109,
                product_name: "Ergonomic Chair",
                product_sku: "CHAIR-300",
                price: "$189.00",
                stock: "Out of Stock",
                categories: "Furniture",
                date: "June 18, 2025",
                status: "Published",
            },
            {
                id: 110,
                product_name: "Webcam 1080p",
                product_sku: "CAM-1080",
                price: "$39.99",
                stock: "In Stock",
                categories: "Cameras",
                date: "June 18, 2025",
                status: "Draft",
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
    const columns: ColumnDef<ProductRow>[] = [
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
            header: __('Product Name', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.product_name || ''}>
                    {row.original.product_name || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Sku', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.product_sku || ''}>
                    {row.original.product_sku || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Price', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.price || ''}>
                    {row.original.price || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Stock', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.stock || ''}>
                    {row.original.stock === "In Stock" && (
                        <span className="admin-badge green">In Stock</span>
                    )}
                    {row.original.stock === "Out of Stock" && (
                        <span className="admin-badge red">Out of Stock</span>
                    )}
                </TableCell>
            ),
        },
        {
            header: __('Categories', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.categories || ''}>
                    {row.original.categories || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Date', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.date || ''}>
                    {row.original.date || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Status', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.status || ""}>
                    {row.original.status === "Draft" && (
                        <span className="admin-badge yellow">Draft</span>
                    )}
                    {row.original.status === "Published" && (
                        <span className="admin-badge green">Published</span>
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
                                    toggleDropdown(row.original.id)
                                }
                            ></i>
                            <div
                                className={`action-dropdown ${showDropdown === row.original.id
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
                                        {__('View', 'multivendorx')}
                                    </li>
                                    <li
                                        onClick={() =>
                                            (window.location.href = `?page=multivendorx#&tab=stores&edit/${row.original.id}`)
                                        }
                                    >
                                        <i className="adminlib-create"></i>
                                        {__('Edi', 'multivendorx')}
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
                    onClick={() => setAddProduct(true)}
                >
                    <i className="adminlib-import"></i>
                    import
                </div>
                <div
                    className="admin-btn btn-purple"
                    onClick={() => setAddProduct(true)}
                >
                    <i className="adminlib-export"></i>
                    Export
                </div>
                <div
                    className="admin-btn btn-purple"
                    onClick={() => setAddProduct(true)}
                >
                    <i className="adminlib-plus-circle-o"></i>
                    Add New
                </div>
            </div>

            {AddProduct && (
                <CommonPopup
                    open={AddProduct}
                    // onClose= setAddProduct(true)
                    width="500px"
                    height="100%"
                    header={
                        <>
                            <div className="title">
                                <i className="adminlib-cart"></i>
                                Add Product
                            </div>
                            <p>Publish important news, updates, or alerts that appear directly in store dashboards, ensuring sellers never miss critical information.</p>
                            <i
                                className="icon adminlib-close"
                                onClick={() => setAddProduct(false)}
                            ></i>
                        </>
                    }
                    footer={
                        <>
                            <div
                                className="admin-btn btn-red"
                                onClick={() => setAddProduct(false)}
                            >
                                Draft
                                <i className="adminlib-contact-form"></i>
                            </div>
                            <div
                                className="admin-btn btn-purple"
                                onClick={() => setAddProduct(false)}
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
                                <label htmlFor="title">Name</label>
                                <BasicInput
                                    type="text"
                                    name="title"
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
                    // realtimeFilter={[]}
                />
            </div>
        </>
    );
};

export default AllProduct;