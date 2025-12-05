import React, { useState, useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { BasicInput, CalendarInput, CommonPopup, getApiLink, useModules, Table, TableCell, TextArea } from 'zyra';
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatCurrency } from '../services/commonFunction';
import AddProductCom from "./add-products";

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

type FilterData = {
    searchAction?: string;
    searchField?: string;
    category?: any;
    stock_status?: string;
    productType?: string;
};
export interface RealtimeFilter {
    name: string;
    render: (updateFilter: (key: string, value: any) => void, filterValue: any) => ReactNode;
}
const formatWooDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};
// Add these status options inside AllProduct component
const stockStatusOptions = [
    { key: '', name: 'Stock Status' },
    { key: 'instock', name: 'In Stock' },
    { key: 'outofstock', name: 'Out of Stock' },
    { key: 'onbackorder', name: 'On Backorder' },
];
const productTypeOptions = [
    { key: '', name: 'Product Type' },
    { key: 'simple', name: 'Simple Product' },
    { key: 'variable', name: 'Variable Product' },
    { key: 'grouped', name: 'Grouped Product' },
    { key: 'external', name: 'External/Affiliate Product' },
];
const AllProduct: React.FC = () => {
    const [data, setData] = useState<ProductRow[]>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [AddProduct, setAddProduct] = useState(false);
    const [categoriesList, setCategoriesList] = useState<{ id: number; name: string }[]>([]);
    const [pageCount, setPageCount] = useState(0);
    const [activeTab, setActiveTab] = useState("general");
    const { modules } = useModules();
    const [newProductId, setNewProductId] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    const query = new URLSearchParams(location.search);
    let element = query.get("element");

    if (!element) {
        const parts = location.pathname.split("/").filter(Boolean);
        if (parts.length >= 4) {
            element = element || parts[2]; 
        }
    }

    const isAddProduct = element === "edit";

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

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${appLocalizer.apiUrl}/wc/v3/products/categories`, {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
            });
            setCategoriesList(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

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
                <TableCell title={row.original.name}>
                    <a
                        href={row.original.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className=""
                    >
                        {row.original.name}
                    </a>
                </TableCell>
            ),
        },
        {
            id: 'sku',
            accessorKey: 'sku',
            enableSorting: true,
            header: __('SKU', 'multivendorx'),
            cell: ({ row }) => <TableCell>{row.original.sku || '-'}</TableCell>,
        },
        {
            id: 'price',
            accessorKey: 'price',
            accessorFn: row => parseFloat(row.price || '0'),
            enableSorting: true,
            header: __('Price', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell>
                    {row.original.price !== '-' ? formatCurrency(row.original.price) : '-'}
                </TableCell>
            ),
        },
        {
            header: __('Stock', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell>
                    {row.original.stock_status === 'instock' && (
                        <span className="admin-badge in-stock">In Stock</span>
                    )}
                    {row.original.stock_status === 'outofstock' && (
                        <span className="admin-badge out-of-stock">Out of Stock</span>
                    )}
                    {row.original.stock_status === 'onbackorder' && (
                        <span className="admin-badge onbackorder">On Backorder</span>
                    )}
                    {!row.original.stock_status && '-'}
                </TableCell>
            ),
        },
        {
            header: __('Categories', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell>
                    {row.original.categories?.length
                        ? row.original.categories.map((c) => c.name).join(', ')
                        : '-'}
                </TableCell>
            ),
        },
        {
            id: 'date_created',
            accessorKey: 'date_created',
            enableSorting: true,
            header: __('Date', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell>{formatWooDate(row.original.date_created)}</TableCell>
            ),
        },
        {
            id: 'status',
            header: __('Status', 'multivendorx'),
            cell: ({ row }) => {
                return (
                    <TableCell
                        type="status"
                        status={row.original.status}
                    />
                );
            },
        },
        {
            id: 'action',
            header: __('Action', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell
                    type="action-dropdown"
                    rowData={row.original}
                    header={{
                        actions: [
                            {
                                label: __('Edit', 'multivendorx'),
                                icon: 'adminlib-edit',
                                onClick: (rowData) => {
                                    if (appLocalizer.permalink_structure) {
                                        navigate(`/${appLocalizer.dashboard_slug}/products/edit/${rowData.id}/`);
                                    } else {
                                        navigate(`?page_id=${appLocalizer.dashboard_page_id}&segment=products&element=edit&context_id=${rowData.id}`);
                                    }
                                },
                                hover: true
                            },
                            {
                                label: __('View', 'multivendorx'),
                                icon: 'adminlib-preview',
                                onClick: () => {
                                    window.location.assign(`${row.original.permalink}`);
                                },
                            },
                            {
                                label: __('Copy URL', 'multivendorx'),
                                icon: 'adminlib-vendor-form-copy',
                                onClick: () => {
                                    const url = row.original.permalink;
                                    navigator.clipboard.writeText(url).catch(() => { });
                                },
                            },
                            // {
                            //     label: __('Clone', 'multivendorx'),
                            //     icon: 'adminlib-vendor-form-copy',
                            //     // onClick: (rowData) => {
                            //     //     window.location.href = `?page=multivendorx#&tab=stores&edit/${rowData.id}`;
                            //     // },
                            // },
                            {
                                label: __('Delete', 'multivendorx'),
                                icon: 'adminlib-vendor-form-delete',
                                onClick: (rowData) => {
                                    handleDelete(rowData.id)
                                },
                                hover: true
                            },

                        ],
                    }}
                />
            ),
        },
    ];

    const realtimeFilter: RealtimeFilter[] = [
        {
            name: 'category',
            render: (updateFilter: (key: string, value: string) => void, filterValue: string | undefined) => (
                <div className="   group-field">
                    <select
                        name="category"
                        onChange={(e) => updateFilter(e.target.name, e.target.value)}
                        value={filterValue || ''}
                        className="basic-select"
                    >
                        <option value="">Category</option>
                        {categoriesList?.map((s: any) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>

                </div>
            ),
        },
        {
            name: 'productType',
            render: (updateFilter: (key: string, value: string) => void, filterValue: string | undefined) => (
                <div className="   group-field">
                    <select
                        name="productType"
                        onChange={(e) => updateFilter(e.target.name, e.target.value)}
                        value={filterValue || ''}
                        className="basic-select"
                    >
                        {productTypeOptions?.map((s: any) => (
                            <option key={s.key} value={s.key}>
                                {s.name}
                            </option>
                        ))}
                    </select>

                </div>
            ),
        },
        {
            name: 'stock_status',
            render: (updateFilter: (key: string, value: string) => void, filterValue: string | undefined) => (
                <div className="group-field">
                    <select
                        name="stock_status"
                        onChange={(e) => updateFilter(e.target.name, e.target.value)}
                        value={filterValue || ''}
                        className="basic-select"
                    >
                        {stockStatusOptions?.map((s: any) => (
                            <option key={s.key} value={s.key}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                </div>
            ),
        },
        // {
        //     name: 'brand',
        //     render: (updateFilter: (key: string, value: string) => void, filterValue: string | undefined) => (
        //         <div className="   group-field">
        //             <select
        //                 name="product-type"
        //                 onChange={(e) => updateFilter(e.target.name, e.target.value)}
        //                 value={filterValue || ''}
        //                 className="basic-select"
        //             >
        //                 <option value="">Brand</option>
        //                 {/* { Object.entries( groups ).map( ( [ groupId, groupName ] ) => (
        //                         <option key={ groupId } value={ groupId }>
        //                             { ' ' }
        //                             { groupName }{ ' ' }
        //                         </option>
        //                     ) ) } */}
        //             </select>
        //         </div>
        //     ),
        // },
        {
            name: 'date',
            render: (updateFilter) => (
                <div className="right">
                    <CalendarInput
                        wrapperClass=""
                        inputClass=""
                        onChange={(range: any) => {
                            updateFilter('date', {
                                start_date: range.startDate,
                                end_date: range.endDate,
                            });
                        }}
                    />
                </div>
            ),
        },
    ];

    const searchFilter: RealtimeFilter[] = [
        {
            name: 'searchField',
            render: (updateFilter, filterValue) => (
                <>
                    <div className="search-section">
                        <input
                            name="searchField"
                            type="text"
                            placeholder={__('Search', 'multivendorx')}
                            onChange={(e) => {
                                updateFilter(e.target.name, e.target.value);
                            }}
                            className='basic-select'
                            value={filterValue || ''}
                        />
                        <i className="adminlib-search"></i>
                    </div>
                </>
            ),
        },
    ];

    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        const rowsPerPage = pagination.pageSize;
        requestData(rowsPerPage, currentPage);
    }, [pagination]);

    // Fetch data from backend.
    function requestData(
        rowsPerPage = 10,
        currentPage = 1,
        category = '',
        stockStatus = '',    // <-- Positional Argument 4
        searchField = '',    // <-- Positional Argument 5
        productType = '',    // <-- Positional Argument 6
        startDate = new Date(0),
        endDate = new Date(),
    ) {
        setData([]);

        // Build the base parameters object
        const params: any = {
            page: currentPage,
            row: rowsPerPage,
            category: category,
            after: startDate,
            before: endDate,
            meta_key: 'multivendorx_store_id',
            value: appLocalizer.store_id,
        };

        if (stockStatus) {
            params.stock_status = stockStatus;
        }

        if (searchField) {
            params.search = searchField;
        }
        if (productType) {
            params.type = productType;
        }
        axios({
            method: 'GET',
            url: `${appLocalizer.apiUrl}/wc/v3/products`,
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: params, // Use the dynamically built params object
        })
            .then((response) => {
                const formattedProducts = response.data.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    sku: p.sku || '-',
                    price: p.price ? `${p.price}` : '-',
                    stock_status: p.stock_status,
                    categories: p.categories,
                    date_created: p.date_created,
                    status: p.status,
                    permalink: p.permalink,
                }));
                setData(formattedProducts);

                const total = parseInt(response.headers['x-wp-total']);
                setTotalRows(total);

                // Calculate pageCount AFTER totalRows is available
                setPageCount(Math.ceil(total / rowsPerPage));
            })
            .catch(() => {
                setData([]);
                setTotalRows(0);
                setPageCount(0);
            });
    }

    // Handle pagination and filter changes
    const requestApiForData = (
        rowsPerPage: number,
        currentPage: number,
        filterData: FilterData
    ) => {
        setData([]);
        // Arguments must be passed in the exact order requestData expects them.
        requestData(
            rowsPerPage,                            // 1: rowsPerPage
            currentPage,                            // 2: currentPage
            filterData?.category,                   // 3: category
            filterData?.stock_status,               // 4: stockStatus
            filterData?.searchField,                // 5: searchField (Assuming filterData uses searchField for the search box value)
            filterData?.productType,                // 6: productType
            filterData?.date?.start_date,           // 7: startDate
            filterData?.date?.end_date,             // 8: endDate
        );
    };

    const handleDelete = async (productId) => {
        const res = await axios.delete(
            `${appLocalizer.apiUrl}/wc/v3/products/${productId}`, {
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        }
        );

        requestData();
    }

    const createAutoDraftProduct = () => {
        try {
            const payload = {
                title: "Auto Draft",
                status: "auto-draft"
            };

            axios.post(`${appLocalizer.apiUrl}/wc/v3/products/`, payload, {
                headers: { "X-WP-Nonce": appLocalizer.nonce }
            })
            .then(res => {
                console.log("Auto-draft created:", res.data);
                setNewProductId(res.data.id); 
            });
 
        } catch (err) {
            console.error("Error creating auto-draft:", err.response?.data || err);
        }
    };

    useEffect(() => {
        if (!newProductId) return;

        if (appLocalizer.permalink_structure) {
            navigate(`/${appLocalizer.dashboard_slug}/products/edit/${newProductId}`);
        } else {
            navigate(`?page_id=${appLocalizer.dashboard_page_id}&segment=products&element=edit&context_id=${newProductId}`);
        }
    }, [newProductId]);


    return (
        <>
        {!isAddProduct && (
            <>
                {AddProduct && (
                    <CommonPopup
                        open={AddProduct}
                        // onClose= setAddProduct(true)
                        width="31.25rem"
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
                <div className="page-title-wrapper">
                    <div className="page-title">
                        <div className="title">All Product</div>
                        <div className="des">Manage your store information and preferences</div>
                    </div>
                    <div className="buttons-wrapper">
                        {modules.includes('import-export') && (
                            <>
                                <div
                                    className="admin-btn btn-purple-bg"
                                    onClick={() => setAddProduct(true)}
                                >
                                    <i className="adminlib-import"></i>
                                    import
                                </div>
                                <div
                                    className="admin-btn btn-purple-bg"
                                    onClick={() => setAddProduct(true)}
                                >
                                    <i className="adminlib-export"></i>
                                    Export
                                </div>
                            </>
                        )}
                        <div
                            className="admin-btn btn-purple-bg"
                            onClick={() =>{
                                createAutoDraftProduct();
                            }}
                        >
                            <i className="adminlib-plus-circle"></i> Add New
                        </div>

                    </div>
                </div>
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
                        realtimeFilter={realtimeFilter}
                        handlePagination={requestApiForData}
                        totalCounts={totalRows}
                        searchFilter={searchFilter}
                    />
                </div>
            </>
        )}

        {isAddProduct && <AddProductCom />}
        </>
    );
};

export default AllProduct;