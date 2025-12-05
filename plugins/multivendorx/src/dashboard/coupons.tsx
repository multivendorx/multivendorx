import React, { useState, useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { BasicInput, CalendarInput, CommonPopup, getApiLink, MultiCheckBox, SelectInput, Table, TableCell, TextArea, ToggleSetting } from 'zyra';
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';
import axios from 'axios';
import { formatCurrency } from '../services/commonFunction';

type CouponRow = {
    id: number;
    code: string;
    discount_type: string;
    amount: string;
    usage_count: number;
    usage_limit?: number | null;
    date_expires?: string | null;
    description?: string;
    status?: string;
};

type FilterData = {
    searchAction?: string;
    searchField?: string;
    stock_status?: string;
    couponType?: string;
    typeCount?: string;
};

const discountOptions = [
    { label: "Percentage discount", value: "percent" },
    { label: "Fixed cart discount", value: "fixed_cart" },
    { label: "Fixed product discount", value: "fixed_product" },
];
const formatWooDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export interface RealtimeFilter {
    name: string;
    render: (updateFilter: (key: string, value: any) => void, filterValue: any) => ReactNode;
}
const formatDateForInput = (dateString?: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const AllCoupon: React.FC = () => {
    const [id, setId] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    const validateForm = () => {
        const errors: { [key: string]: string } = {};

        if (!formData.title.trim()) {
            errors.title = __('Coupon code is required', 'multivendorx');
        }

        if (!formData.discount_type.trim()) {
            errors.discount_type = __('Discount type is required', 'multivendorx');
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };


    const defaultFormData = {
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
        id: undefined
    };

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

    const [data, setData] = useState<CouponRow[]>([]);
    const [storeProducts, setStoreProducts] = useState<{ value: string; label: string }[]>([]);
    const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [AddCoupon, setAddCoupon] = useState(false);

    const [pageCount, setPageCount] = useState(0);
    const [activeTab, setActiveTab] = useState("general");

    const [couponTypeCounts, setCouponTypeCounts] = useState<{ key: string; name: string; count: number }[]>([]);
    const handleEditCoupon = async (couponId: number) => {
        try {
            const res = await axios.get(`${appLocalizer.apiUrl}/wc/v3/coupons/${couponId}`, {
                headers: { 'X-WP-Nonce': appLocalizer.nonce }
            });

            const coupon = res.data;

            setFormData({
                title: coupon.code,
                content: coupon.description || '',
                discount_type: coupon.discount_type,
                coupon_amount: coupon.amount,
                free_shipping: coupon.free_shipping ? "yes" : "no",
                expiry_date: formatDateForInput(coupon.date_expires), // <-- fix date
                usage_limit: coupon.usage_limit || '',
                limit_usage_to_x_items: coupon.limit_usage_to_x_items || '',
                usage_limit_per_user: coupon.usage_limit_per_user || '',
                minimum_amount: coupon.minimum_amount || '',
                maximum_amount: coupon.maximum_amount || '',
                individual_use: coupon.individual_use ? 'yes' : 'no',
                exclude_sale_items: coupon.exclude_sale_items ? 'yes' : 'no',
                product_ids: coupon.product_ids || [],
                exclude_product_ids: coupon.excluded_product_ids || [],
                product_categories: coupon.product_categories || [],
                exclude_product_categories: coupon.excluded_product_categories || [],
                customer_email: (coupon.email_restrictions || []).join(','),
                id: coupon.id
            });


            setAddCoupon(true);       // open popup
            setActiveTab("general");  // optional: start with general tab
        } catch (err) {
            console.error("Failed to fetch coupon details:", err);
            alert("Failed to fetch coupon details. Please try again.");
        }
    };


    const fetchCouponStatusCounts = async () => {
        const statuses = ['all', 'publish', 'draft', 'pending'];
        const counts = await Promise.all(
            statuses.map(async (status) => {
                const params: any = {
                    meta_key: 'multivendorx_store_id',
                    value: appLocalizer.store_id,
                };

                if (status !== 'all') {
                    params.status = status;
                } else {
                    params.status = 'any';
                }

                const res = await axios.get(`${appLocalizer.apiUrl}/wc/v3/coupons`, {
                    headers: { 'X-WP-Nonce': appLocalizer.nonce },
                    params,
                });

                const total = parseInt(res.headers['x-wp-total'] || '0');

                return {
                    key: status,
                    name: status === 'all' ? __('All', 'multivendorx') : status.charAt(0).toUpperCase() + status.slice(1),
                    count: total,
                };
            })
        );
        setCouponTypeCounts(counts.filter(c => c.key === 'all' || c.count > 0));
    };


    // Fetch data from backend.
    function requestData(
        rowsPerPage = 10,
        currentPage = 1,
        stockStatus = '',
        searchField = '',
        couponType = '',
        typeCount = 'any',
        startDate = '',
        endDate = '',
    ) {
        setData([]);

        // Build the base parameters object
        const params: any = {
            status: typeCount,
            page: currentPage,
            row: rowsPerPage,
            meta_key: 'multivendorx_store_id',
            value: appLocalizer.store_id,
        };

        if (startDate && endDate) {
            params.after = startDate;
            params.before = endDate;
        }

        if (stockStatus) {
            params.stock_status = stockStatus;
        }

        if (searchField) {
            params.search = searchField;
        }
        if (couponType) {
            params.discount_type = couponType;
        }
        axios({
            method: 'GET',
            url: `${appLocalizer.apiUrl}/wc/v3/coupons`,
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: params, // Use the dynamically built params object
        })
            .then((response) => {
                const total = parseInt(response.headers['x-wp-total']);
                setTotalRows(total);
                setPageCount(Math.ceil(total / rowsPerPage));

                // Map WooCommerce coupon data to our table rows
                const formatted = response.data.map((coupon: any) => ({
                    id: coupon.id,
                    code: coupon.code,
                    discount_type: coupon.discount_type,
                    amount: coupon.amount,
                    usage_count: coupon.usage_count,
                    usage_limit: coupon.usage_limit,
                    date_expires: coupon.date_expires,
                    description: coupon.description,
                    status: coupon.status, // usually 'publish', 'draft', or 'trash'
                }));
                setData(formatted);
                fetchCouponStatusCounts();

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
            filterData?.stock_status,               // 4: stockStatus
            filterData?.searchField,                // 5: searchField (Assuming filterData uses searchField for the search box value)
            filterData?.couponType,
            filterData?.typeCount,                // 6: couponType
            filterData?.date?.start_date,           // 7: startDate
            filterData?.date?.end_date,             // 8: endDate
        );
    };

    useEffect(() => {
        fetchCouponStatusCounts();
        const currentPage = pagination.pageIndex + 1;
        const rowsPerPage = pagination.pageSize;
        requestData(rowsPerPage, currentPage);
    }, [pagination]);

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


    const handleSave = async (status: "draft" | "publish") => {
        if (!validateForm()) {
            return; // Stop submission if errors exist
        }
        try {
            const payload: any = {
                code: formData.title,
                description: formData.content,
                discount_type: formData.discount_type,
                amount: formData.coupon_amount,
                individual_use: formData.individual_use === "yes",
                exclude_sale_items: formData.exclude_sale_items === "yes",
                free_shipping: formData.free_shipping === "yes",
                minimum_amount: formData.minimum_amount || undefined,
                maximum_amount: formData.maximum_amount || undefined,
                usage_limit: formData.usage_limit || undefined,
                limit_usage_to_x_items: formData.limit_usage_to_x_items || undefined,
                usage_limit_per_user: formData.usage_limit_per_user || undefined,
                date_expires: formData.expiry_date || undefined,
                email_restrictions: formData.customer_email ? formData.customer_email.split(",") : [],
                product_ids: formData.product_ids || [],
                excluded_product_ids: formData.exclude_product_ids || [],
                product_categories: formData.product_categories || [],
                excluded_product_categories: formData.exclude_product_categories || [],
                status: status,
                meta_data: [
                    { key: "multivendorx_store_id", value: appLocalizer.store_id }
                ]
            };

            if (formData.id) {
                // Update existing coupon
                await axios.put(
                    `${appLocalizer.apiUrl}/wc/v3/coupons/${formData.id}`,
                    payload,
                    { headers: { "X-WP-Nonce": appLocalizer.nonce } }
                );
            } else {
                // Create new coupon
                await axios.post(
                    `${appLocalizer.apiUrl}/wc/v3/coupons`,
                    payload,
                    { headers: { "X-WP-Nonce": appLocalizer.nonce } }
                );
            }


            // Close popup & reset form
            setAddCoupon(false);
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
                id: undefined
            });

            // Reload list
            requestData(pagination.pageSize, pagination.pageIndex + 1);
        } catch (err) {
            console.error("Error saving coupon:", err);
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
                            {validationErrors.discount_type && <div className="invalid-massage">{validationErrors.discount_type}</div>}
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
                            <ToggleSetting
                                wrapperClass="setting-form-input"
                                options={[
                                    { key: "yes", value: "yes", label: "Yes" },
                                    { key: "no", value: "no", label: "No" },
                                ]}
                                value={formData.individual_use}
                                onChange={(val: any) =>
                                    setFormData({ ...formData, individual_use: val })
                                }
                            />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label>Exclude sale items</label>
                            <ToggleSetting
                                wrapperClass="setting-form-input"
                                options={[
                                    { key: "yes", value: "yes", label: "Yes" },
                                    { key: "no", value: "no", label: "No" },
                                ]}
                                value={formData.exclude_sale_items}
                                onChange={(val: any) =>
                                    setFormData({ ...formData, exclude_sale_items: val })
                                }
                            />
                        </div>
                    </div>


                    {/* <div className="form-group-wrapper">
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
                    </div> */}

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

    const columns: ColumnDef<CouponRow>[] = [
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
            header: __('Coupon Code', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.code}>
                    {row.original.code}
                </TableCell>
            ),
        },
        {
            header: __('Coupon Type', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.discount_type}>
                    {row.original.discount_type === 'percent'
                        ? 'Percentage discount'
                        : row.original.discount_type === 'fixed_cart'
                            ? 'Fixed cart discount'
                            : row.original.discount_type === 'fixed_product'
                                ? 'Fixed product discount'
                                : '-'}
                </TableCell>
            ),
        },
        {
            id: 'amount',
            accessorKey: 'amount',
            accessorFn: row => parseFloat(row.amount || '0'),
            enableSorting: true,
            header: __('Amount', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.amount}>
                    {formatCurrency(row.original.amount)}
                </TableCell>
            ),
        },
        {
            header: __('Description', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.description || '-'}>
                    {row.original.description || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Usage / Limit', 'multivendorx'),
            cell: ({ row }) => {
                const usageCount = row.original.usage_count ?? 0;
                const usageLimit =
                    row.original.usage_limit && row.original.usage_limit > 0
                        ? row.original.usage_limit
                        : '∞';
                return (
                    <TableCell>{`${usageCount} / ${usageLimit}`}</TableCell>
                );
            },
        },
        {
            id: 'date_expires',
            accessorKey: 'date_expires',
            enableSorting: true,
            header: __('Expiry Date', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell>{formatWooDate(row.original.date_expires)}</TableCell>
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
                                onClick: (rowData: any) => {
                                    handleEditCoupon(rowData.id);
                                },
                            },
                            {
                                label: __('Delete', 'multivendorx'),
                                icon: 'adminlib-vendor-form-delete',
                                onClick: async (rowData: any) => {
                                    if (
                                        confirm(
                                            `Are you sure you want to delete coupon "${rowData.code}"?`
                                        )
                                    ) {
                                        await axios.delete(
                                            `${appLocalizer.apiUrl}/wc/v3/coupons/${rowData.id}`,
                                            {
                                                headers: {
                                                    'X-WP-Nonce': appLocalizer.nonce,
                                                },
                                            }
                                        );
                                        requestData(pagination.pageSize, pagination.pageIndex + 1);
                                    }
                                },
                            },
                        ],
                    }}
                />
            ),
        },
    ];

    const realtimeFilter: RealtimeFilter[] = [
        {
            name: 'couponType',
            render: (updateFilter: (key: string, value: string) => void, filterValue: string | undefined) => (
                <div className="   group-field">
                    <select
                        name="couponType"
                        onChange={(e) => updateFilter(e.target.name, e.target.value)}
                        value={filterValue || ''}
                        className="basic-select"
                    >
                        <option value="">{__('All Types', 'multivendorx')}</option>
                        <option value="percent">{__('Percentage Discount', 'multivendorx')}</option>
                        <option value="fixed_cart">{__('Fixed Cart Discount', 'multivendorx')}</option>
                        <option value="fixed_product">{__('Fixed Product Discount', 'multivendorx')}</option>
                    </select>
                </div>
            ),
        },
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
                <div className="search-section">
                    <input
                        type="text"
                        name="searchField"
                        placeholder={__('Search', 'multivendorx')}
                        value={filterValue || ''}
                        onChange={(e) => updateFilter(e.target.name, e.target.value)}
                        className='basic-select'
                    />
                    <i className="adminlib-search"></i>
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="page-title-wrapper">
                <div className="page-title">
                    <div className="title">Coupons</div>
                    <div className="des">Manage your store information and preferences</div>
                </div>
                <div className="button-wrapper">
                    <div
                        className="admin-btn btn-purple-bg"
                        onClick={() => {
                            setFormData({ ...defaultFormData }); // <-- reset form
                            setActiveTab("general");             // start with General tab
                            setAddCoupon(true);                  // open popup
                        }}
                    >
                        <i className="adminlib-plus-circle"></i>
                        Add New
                    </div>
                </div>
            </div>

            {AddCoupon && (
                <CommonPopup
                    open={AddCoupon}
                    onClick={() => setAddCoupon(false)}
                    width="31.25rem"
                    height="100%"
                    header={
                        <>
                            <div className="title">
                                <i className="adminlib-coupon"></i>
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
                                {/* <i className="adminlib-contact-form"></i> */}
                            </div>
                            <div
                                className="admin-btn btn-purple-bg"
                                onClick={() => handleSave("publish")}
                            >
                                Publish
                                {/* <i className="adminlib-check"></i> */}
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
                                    wrapperClass="setting-form-input"
                                    value={formData.title}
                                    generate={true}
                                    onChange={(e: any) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                />
                                {validationErrors.title && <div className="invalid-massage">{validationErrors.title}</div>}
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
                    realtimeFilter={realtimeFilter}
                    perPageOption={[10, 25, 50]}
                    handlePagination={requestApiForData}
                    totalCounts={totalRows}
                    typeCounts={couponTypeCounts}
                    searchFilter={searchFilter}
                />
            </div>
        </>
    );
};

export default AllCoupon;
