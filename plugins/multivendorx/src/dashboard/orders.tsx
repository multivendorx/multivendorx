import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from 'react-router-dom';
import { __ } from "@wordpress/i18n";
import { CalendarInput, Table, TableCell } from "zyra";
import { ColumnDef, RowSelectionState, PaginationState } from "@tanstack/react-table";
import OrderDetails from "./order-details";
import AddOrder from "./addOrder";
import { formatCurrency } from '../services/commonFunction';

// Type declarations
type OrderStatus = {
    key: string;
    name: string;
    count: number;
};
type FilterData = {
    searchAction?: string;
    searchField?: string;
    category?: any;
    typeCount?: any;
    stock_status?: string;
    productType?: string;
};
export interface RealtimeFilter {
    name: string;
    render: (updateFilter: (key: string, value: any) => void, filterValue: any) => React.ReactNode;
}

const Orders: React.FC = () => {
    const location = useLocation();
    const [data, setData] = useState<any[]>([]);
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pageCount, setPageCount] = useState(0);
    const [orderStatus, setOrderStatus] = useState<OrderStatus[]>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const bulkSelectRef = React.useRef<HTMLSelectElement>(null);
    const hash = location.hash.replace(/^#/, '') || '';

    // const hash = window.location.hash || '';
    // const isViewOrder = hash.includes('view');


    const isViewOrder = hash.includes('view');
    const isAddOrder = hash.includes('add');

    useEffect(() => {
        if (isViewOrder) {
            const orderId = hash.split('view/')[1];
            if (orderId) {
                const foundOrder = data.find(o => o.id.toString() === orderId);
                setSelectedOrder(foundOrder || null);
            }
        } else {
            setSelectedOrder(null);
        }
    }, [hash, data]);

    // const path = window.location.pathname;
    // const isViewOrder = path.includes('/view/');

    const selectedOrderIds = Object.keys(rowSelection)
        .map((key) => {
            const index = Number(key);
            return data && data[index] ? data[index].id : null;
        })
        .filter((id): id is number => id !== null);

    // Fetch orders
    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        const rowsPerPage = pagination.pageSize;
    
        if (hash === 'refund-requested') {
            // call API with refund-requested filter
            requestApiForData(rowsPerPage, currentPage, {
                typeCount: 'refund-requested'
            });
        } else {
            // normal API call
            requestData(rowsPerPage, currentPage);
        }
    }, [pagination]);
    

    const fetchOrderStatusCounts = async () => {
        try {
            const statuses = ["all", "pending", "processing", "on-hold", "completed", "cancelled","refund-requested", "refunded", "failed", "trash"];

            const counts: OrderStatus[] = await Promise.all(
                statuses.map(async (status) => {
                    const params: any = {
                        per_page: 1,
                        meta_key: "multivendorx_store_id",
                        value: appLocalizer.store_id,
                    };
                    if (status !== "all") params.status = status;

                    const res = await axios.get(`${appLocalizer.apiUrl}/wc/v3/orders`, {
                        headers: { "X-WP-Nonce": appLocalizer.nonce },
                        params,
                    });

                    const total = parseInt(res.headers["x-wp-total"] || "0");

                    return {
                        key: status,
                        name: status === "all" ? __("All", "multivendorx") : status.charAt(0).toUpperCase() + status.slice(1),
                        count: total,
                    };
                })
            );

            // Filter out zero-count statuses except "all"
            const filteredCounts = counts.filter(status => status.key === "all" || status.count > 0);

            setOrderStatus(filteredCounts);

        } catch (error) {
            console.error("Failed to fetch order status counts:", error);
        }
    };


    // Fetch dynamic order status counts for typeCounts filter
    useEffect(() => {
        fetchOrderStatusCounts();
    }, []);

    function requestData(
        rowsPerPage = 10,
        currentPage = 1,
        startDate = new Date(0),
        endDate = new Date(),
        extraParams: any = {}
    ) {
        setData([]);

        const params: any = {
            page: currentPage,
            row: rowsPerPage,
            after: startDate.toISOString(),
            before: endDate.toISOString(),
            meta_key: 'multivendorx_store_id',
            value: appLocalizer.store_id,
            ...extraParams,
        };

        axios({
            method: 'GET',
            url: `${appLocalizer.apiUrl}/wc/v3/orders`,
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params,
        })
            .then((response) => {
                setData(response.data);
                const total = parseInt(response.headers['x-wp-total'] || "0");
                setTotalRows(total);
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

        let startDate = filterData?.date?.start_date || new Date(0);
        let endDate = filterData?.date?.end_date || new Date();

        const params: any = {
            page: currentPage,
            row: rowsPerPage,
            after: startDate.toISOString(),
            before: endDate.toISOString(),
            meta_key: 'multivendorx_store_id',
            value: appLocalizer.store_id,
        };

        // Search field
        if (filterData.searchField) {
            const searchValue = filterData.searchField.trim();
            if (filterData.searchAction) params.search = searchValue;
            else params.search = searchValue;
        }

        // Add typeCount filter
        if (filterData.typeCount && filterData.typeCount !== 'all') {
            params.status = filterData.typeCount;
        }
        console.log('params',params)
        requestData(rowsPerPage, currentPage, startDate, endDate, params);
    };

    const handleBulkAction = async () => {
        const action = bulkSelectRef.current?.value;

        if (!action || selectedOrderIds.length === 0) {
            return;
        }

        try {
            await Promise.all(
                selectedOrderIds.map((orderId) =>
                    axios.put(
                        `${appLocalizer.apiUrl}/wc/v3/orders/${orderId}`,
                        { status: action },
                        { headers: { 'X-WP-Nonce': appLocalizer.nonce } }
                    )
                )
            );

            setRowSelection({});
            fetchOrderStatusCounts();
            requestData(pagination.pageSize, pagination.pageIndex + 1);
        } catch (err) {
            console.error(err);
        } finally {
            if (bulkSelectRef.current) bulkSelectRef.current.value = "";
        }
    };

    const BulkAction: React.FC = () => {
        const handleBulkActionChange = async (action: string) => {
            if (!action || selectedOrderIds.length === 0) return;

            // Change order status
            try {
                await Promise.all(
                    selectedOrderIds.map((orderId) =>
                        axios.put(
                            `${appLocalizer.apiUrl}/wc/v3/orders/${orderId}`,
                            { status: action },
                            { headers: { 'X-WP-Nonce': appLocalizer.nonce } }
                        )
                    )
                );

                setRowSelection({});
                fetchOrderStatusCounts();
                requestData(pagination.pageSize, pagination.pageIndex + 1);
            } catch (err) {
                console.error(err);
            } finally {
                if (bulkSelectRef.current) bulkSelectRef.current.value = "";
            }
        };

        const downloadSelectedCSV = () => {
            if (selectedOrderIds.length === 0) {
                alert('No orders selected for export');
                return;
            }

            const selectedOrders = data.filter(order => selectedOrderIds.includes(order.id));

            const csvRows: string[] = [];
            csvRows.push('Order ID,Customer,Email,Total,Status,Date');

            selectedOrders.forEach(order => {
                const customer = order.billing?.first_name
                    ? `${order.billing.first_name} ${order.billing.last_name || ''}`
                    : 'Guest';
                const email = order.billing?.email || '';
                const total = order.total || '';
                const status = order.status || '';
                const date = order.date_created || '';

                csvRows.push(`"${order.id}","${customer}","${email}","${total}","${status}","${date}"`);
            });

            const csvString = csvRows.join('\n');
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `selected_orders_${appLocalizer.store_id}_${new Date().toISOString()}.csv`;
            link.click();
            URL.revokeObjectURL(link.href);
        };

        return (
            <div className="bulk-action" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select
                    name="action"
                    className="basic-select"
                    ref={bulkSelectRef}
                    onChange={(e) => handleBulkActionChange(e.target.value)}
                >
                    <option value="">{__('Bulk Actions', 'multivendorx')}</option>
                    <option value="completed">{__('Completed', 'multivendorx')}</option>
                    <option value="processing">{__('Processing', 'multivendorx')}</option>
                    <option value="pending">{__('Pending', 'multivendorx')}</option>
                    <option value="on-hold">{__('On Hold', 'multivendorx')}</option>
                    <option value="cancelled">{__('Cancelled', 'multivendorx')}</option>
                    <option value="refunded">{__('Refunded', 'multivendorx')}</option>
                    <option value="failed">{__('Failed', 'multivendorx')}</option>
                </select>

                <button
                    type="button"
                    className="admin-btn btn-purple-bg"
                    onClick={downloadSelectedCSV}
                >
                    <i className="adminlib-export"></i> {__('Download CSV', 'multivendorx')}
                </button>
            </div>
        );
    };

    const columns: ColumnDef<any>[] = [
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
            id: 'number',
            accessorKey: 'number',
            accessorFn: row => parseFloat(row.number || '0'),
            enableSorting: true,
            header: __("Order ID", "multivendorx"),
            cell: ({ row }) => (
                <TableCell>
                    <span
                        className="link"
                        onClick={() => {
                            // Open order in view mode (same as View action)
                            setSelectedOrder(row.original);
                            window.location.hash = `view/${row.original.id}`;
                        }}
                    >
                        #{row.original.number}
                    </span>
                </TableCell>
            ),
        },
        {
            header: __("Customer", "multivendorx"),
            cell: ({ row }) => {
                const { billing } = row.original;
                const name =
                    billing?.first_name || billing?.last_name
                        ? `${billing.first_name || ''} ${billing.last_name || ''}`
                        : billing?.email || __("Guest", "multivendorx");
                return <TableCell>{name}</TableCell>;
            },
        },
        {
            id: 'date_created',
            accessorKey: 'date_created',
            enableSorting: true,
            header: __("Date", "multivendorx"),
            cell: ({ row }) => {
                const date = new Date(row.original.date_created);
                const now = new Date();
                const diff = now.getTime() - date.getTime();

                const seconds = Math.floor(diff / 1000);
                const minutes = Math.floor(seconds / 60);
                const hours = Math.floor(minutes / 60);
                const days = Math.floor(hours / 24);
                const months = Math.floor(days / 30);
                const years = Math.floor(days / 365);

                let timeAgo = "";
                if (years > 0) timeAgo = `${years} year${years > 1 ? "s" : ""} ago`;
                else if (months > 0) timeAgo = `${months} month${months > 1 ? "s" : ""} ago`;
                else if (days > 0) timeAgo = `${days} day${days > 1 ? "s" : ""} ago`;
                else if (hours > 0) timeAgo = `${hours} hour${hours > 1 ? "s" : ""} ago`;
                else if (minutes > 0) timeAgo = `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
                else timeAgo = `${seconds} second${seconds !== 1 ? "s" : ""} ago`;

                return <TableCell>{timeAgo}</TableCell>;
            },
        },
        {
            header: __('Status', 'multivendorx'),
            cell: ({ row }) => {
                const status = row.original.status || "pending";
                const colorClass =
                    status === 'completed' ? 'green' :
                        status === 'pending' ? 'blue' : 'yellow';
                return (
                    <TableCell title={status}>
                        <span className={`admin-badge ${colorClass}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                    </TableCell>
                );
            },
        },
        {
            id: 'total',
            accessorKey: 'total',
            accessorFn: row => parseFloat(row.total || '0'),
            enableSorting: true,
            header: __("Total", "multivendorx"),
            cell: ({ row }) => (
                <TableCell>
                    {formatCurrency(row.original.total)}
                </TableCell>
            ),
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
                            // Conditionally include the "View" button
                            ...(appLocalizer.edit_order_capability
                                ? [
                                    {
                                        label: __('View', 'multivendorx'),
                                        icon: 'adminlib-preview',
                                        onClick: (rowData) => {
                                            setSelectedOrder(rowData);
                                            // window.location.href = `view/${rowData.id}`;

                                            window.location.hash = `view/${rowData.id}`;


                                            // const currentPath = window.location.pathname.replace(/\/$/, '');
                                            // const newPath = `${currentPath}/view/${rowData.id}`;
                                            // window.history.pushState({}, '', newPath);
                                        },
                                        hover: true,
                                    },
                                ]
                                : []),
                            {
                                label: __('Download', 'multivendorx'),
                                icon: 'adminlib-import',
                                onClick: (rowData) => {
                                    window.location.href = `?page=multivendorx#&tab=stores&edit/${rowData.id}`;
                                },
                            },
                            {
                                label: __('Copy URL', 'multivendorx'),
                                icon: 'adminlib-vendor-form-copy',
                                onClick: (rowData) => {
                                    navigator.clipboard.writeText(window.location.href);
                                },
                            },
                            {
                                label: __('Shipping', 'multivendorx'),
                                icon: 'adminlib-vendor-form-copy',
                                onClick: (rowData) => {
                                    window.location.href = `?page=multivendorx#&tab=stores&edit/${rowData.id}`;
                                },
                            },
                            {
                                label: __('PDF', 'multivendorx'),
                                icon: 'adminlib-vendor-form-delete',
                                onClick: (rowData) => {
                                    window.location.href = `?page=multivendorx#&tab=stores&edit/${rowData.id}`;
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
            name: 'searchAction',
            render: (updateFilter, filterValue) => (
                <div className="search-action">
                    <select
                        className="basic-select"
                        value={filterValue || ''}
                        onChange={(e) => {
                            updateFilter('searchAction', e.target.value || '');
                        }}
                    >
                        <option value="all">
                            {__('All', 'moowoodle')}
                        </option>
                        <option value="order_id">
                            {__('Order Id', 'moowoodle')}
                        </option>
                        <option value="products">
                            {__('Products', 'moowoodle')}
                        </option>
                        <option value="customer_email">
                            {__('Customer Email', 'moowoodle')}
                        </option>
                        <option value="customer">
                            {__('Customer', 'moowoodle')}
                        </option>
                    </select>
                </div>
            ),
        },
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
                            value={filterValue || ''}
                            className='basic-select'
                        />
                        <i className="adminlib-search"></i>
                    </div>
                </>
            ),
        },
    ];

    const exportAllOrders = async () => {
        try {
            let allOrders: any[] = [];
            let page = 1;
            const perPage = 100; // WooCommerce API max per page

            // Fetch all pages
            while (true) {
                const res = await axios.get(`${appLocalizer.apiUrl}/wc/v3/orders`, {
                    headers: { 'X-WP-Nonce': appLocalizer.nonce },
                    params: {
                        per_page: perPage,
                        page,
                        meta_key: 'multivendorx_store_id',
                        value: appLocalizer.store_id,
                    },
                });

                allOrders = allOrders.concat(res.data);

                const totalPages = parseInt(res.headers['x-wp-totalpages'] || '1');
                if (page >= totalPages) break;
                page++;
            }

            if (allOrders.length === 0) {
                alert('No orders found to export');
                return;
            }

            // Convert orders to CSV
            const csvRows: string[] = [];
            csvRows.push('Order ID,Customer,Email,Total,Status,Date'); // Header

            allOrders.forEach(order => {
                const customer = order.billing?.first_name
                    ? `${order.billing.first_name} ${order.billing.last_name || ''}`
                    : 'Guest';
                const email = order.billing?.email || '';
                const total = order.total || '';
                const status = order.status || '';
                const date = order.date_created || '';

                csvRows.push([
                    order.id,
                    customer,
                    email,
                    total,
                    status,
                    date
                ].map(field => `"${field}"`).join(','));
            });

            const csvString = csvRows.join('\n');

            // Trigger download
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `orders_${appLocalizer.store_id}_${new Date().toISOString()}.csv`;
            link.click();
            URL.revokeObjectURL(link.href);

        } catch (err) {
            console.error('Failed to export all orders:', err);
            alert('Failed to export orders, check console for details');
        }
    };



    return (
        <>
            {!isViewOrder && !isAddOrder && !selectedOrder && (
                <>
                    <div className="page-title-wrapper">
                        <div className="page-title">
                            <div className="title">Orders</div>
                            <div className="des">Manage your store information and preferences</div>
                        </div>
                        <div className="buttons-wrapper">
                            <div
                                className="admin-btn btn-purple-bg"
                                onClick={exportAllOrders}  // <-- fixed here
                            >
                                <i className="adminlib-export"></i>
                                Export
                            </div>
                            <div
                                className="admin-btn btn-purple-bg"
                                onClick={() => { window.location.hash = `add`; }}
                            >
                                <i className="adminlib-plus-circle"></i>
                                Add New
                            </div>
                        </div>
                    </div>

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
                        handlePagination={requestApiForData}
                        totalCounts={totalRows}
                        searchFilter={searchFilter}
                        realtimeFilter={realtimeFilter}
                        typeCounts={orderStatus}
                        bulkActionComp={() => <BulkAction />}
                        defaultCounts={hash? 'refund-requested':'all'}
                    />
                </>
            )}

            {isAddOrder && <AddOrder />}
            {isViewOrder && <OrderDetails
                order={selectedOrder}
                onBack={() => {
                    setSelectedOrder(null);
                    window.location.hash = '';
                }}
            />}
        </>
    );
};

export default Orders;
