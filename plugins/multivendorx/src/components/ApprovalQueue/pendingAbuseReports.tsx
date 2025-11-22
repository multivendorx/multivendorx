/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Table, getApiLink, TableCell, CalendarInput } from 'zyra';
import { ColumnDef, RowSelectionState, PaginationState } from '@tanstack/react-table';

export interface RealtimeFilter {
    name: string;
    render: (updateFilter: (key: string, value: any) => void, filterValue: any) => React.ReactNode;
}

type ReportRow = {
    ID: number;
    store_id: number;
    store_name?: string;
    product_id: number;
    product_name?: string;
    product_link?: string;
    name: string;
    email: string;
    reason?: string;
    message?: string;
    created_at: string;
    updated_at: string;
};

interface Props {
    onUpdated?: () => void;
}
type FilterData = {
    searchAction?: string;
    searchField?: string;
    typeCount?: any;
    store?: string;
    order?: any;
    orderBy?: any;
    date?: {
        start_date: Date;
        end_date: Date;
    };
    transactionType?: string;
    transactionStatus?: string;
};
const ReportAbuseTable: React.FC<Props> = ({ onUpdated }) => {
    const [data, setData] = useState<ReportRow[] | null>(null);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [pageCount, setPageCount] = useState(0);
    const [store, setStore] = useState<any[] | null>(null);

    useEffect(() => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        })
            .then((response) => {
                setStore(response.data.stores);
            })
            .catch(() => {
                setStore([]);
            });
    }, []);

    // Fetch total count on mount
    useEffect(() => {
        axios
            .get(getApiLink(appLocalizer, 'report-abuse'), {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                params: { count: true },
            })
            .then((res) => {
                const total = res.data || 0;
                setTotalRows(total);
                setPageCount(Math.ceil(total / pagination.pageSize));
            })
            .catch(() => {
                console.error('Failed to load total rows');
            });
    }, []);

    // Fetch paginated data
    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        const rowsPerPage = pagination.pageSize;
        fetchData(rowsPerPage, currentPage);
        setPageCount(Math.ceil(totalRows / rowsPerPage));
    }, [pagination]);

    const fetchData = (rowsPerPage = 10, currentPage = 1) => {
        setData(null);
        axios
            .get<ReportRow[]>(getApiLink(appLocalizer, 'report-abuse'), {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                params: {
                    page: currentPage,
                    row: rowsPerPage,
                },
            })
            .then((res) => setData(res.data || []))
            .catch(() => {
                console.error('Failed to load report abuse data');
                setData([]);
            });
    };

    const columns: ColumnDef<ReportRow>[] = [
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
            id: 'product',
            header: __('Product', 'multivendorx'),
            cell: ({ row }) => {
                const product = row.original;
                const image = product.product_image ; // fallback to default
                const productName = product.product_name || '-';
                const productId = product.product_id; // use ID for admin edit link
                const productLink = `${window.location.origin}/wp-admin/post.php?post=${productId}&action=edit`;
                const sku = product.product_sku || '';
                const storeName = product.store_name;
                const storeLink = `${window.location.origin}/wp-admin/admin.php?page=multivendorx#&tab=stores&edit/${product.store_id}`;

                return (
                    <TableCell title={`${productName} - ${storeName}`}>
                        <a
                            href={productLink}
                            target="_blank"
                            rel="noreferrer"
                            className="product-wrapper"
                        >
                            {image ? (
                                <img
                                    src={image}
                                    alt={productName}
                                />
                            ) : (
                                <i className="item-icon adminlib-multi-product"></i>
                            )}
                            <div className="details">
                                <span className="title">{productName}</span>
                                {sku && <span className="des">
                                    SKU: {sku}
                                    {storeName !== '' && <>
                                        | By:
                                        <a
                                            href={storeLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="link-item"
                                        >
                                            {storeName}
                                        </a>
                                    </>}
                                </span>}


                            </div>
                        </a>
                    </TableCell>
                );
            },
        },


        {
            header: __('Reported By', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={`Reported By: ${row.original.name} (${row.original.email})`}>
                    {row.original.name ? `${row.original.name} (${row.original.email})` : '-'}
                </TableCell>
            ),
        },
        {
            header: __('Reason', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.reason || '-'}>
                    {row.original.reason ?? '-'}
                </TableCell>
            ),
        },
        {
            id: 'created_at',
            accessorKey: 'created_at',
            enableSorting: true,
            header: __('Date created', 'multivendorx'),
            cell: ({ row }) => {
                const rawDate = row.original.created_at;
                const formattedDate = rawDate ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(rawDate)) : '-';
                return <TableCell title={formattedDate}>{formattedDate}</TableCell>;
            }
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
                                label: __('Delete', 'multivendorx'),
                                icon: 'adminlib-delete',
                                onClick: (rowData: ReportRow) => {
                                    if (
                                        confirm(__('Are you sure you want to delete this report?', 'multivendorx'))
                                    ) {
                                        axios
                                            .delete(getApiLink(appLocalizer, `report-abuse/${rowData.ID}`), {
                                                headers: { 'X-WP-Nonce': appLocalizer.nonce },
                                            })
                                            .then(() => {
                                                fetchData(pagination.pageSize, pagination.pageIndex + 1);
                                                onUpdated?.();
                                            })
                                            .catch(() => {
                                                alert(__('Failed to delete report', 'multivendorx'));
                                            });
                                    }
                                },
                                hover: true,
                            },
                        ],
                    }}
                />
            ),
        },
    ];

    // 🔹 Fetch data from backend
    function requestData(
        rowsPerPage = 10,
        currentPage = 1,
        store = '',
        orderBy = '',
        order = '',
        startDate?: Date,
        endDate?: Date
    ) {

        setData(null);

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'report-abuse'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: currentPage,
                row: rowsPerPage,
                store_id: store,
                start_date: startDate,
                end_date: endDate,
                orderBy,
                order,
            },
        }).then((response) => {
            setData(response.data || []);
        })
            .catch(() => setData([]));
    }

    // 🔹 Handle pagination & date changes
    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        requestData(pagination.pageSize, currentPage);
        setPageCount(Math.ceil(totalRows / pagination.pageSize));
    }, [pagination]);

    const requestApiForData = (rowsPerPage: number, currentPage: number, filterData: FilterData) => {
        requestData(
            rowsPerPage,
            currentPage,
            filterData?.store,
            filterData?.orderBy,
            filterData?.order,
            filterData?.date?.start_date,
            filterData?.date?.end_date
        );
    };


    const realtimeFilter: RealtimeFilter[] = [
        {
            name: 'store',
            render: (updateFilter: (key: string, value: string) => void, filterValue: string | undefined) => (
                <div className="   group-field">
                    <select
                        name="store"
                        onChange={(e) => updateFilter(e.target.name, e.target.value)}
                        value={filterValue || ''}
                        className="basic-select"
                    >
                        <option value="">All Store</option>
                        <option value="0">Admin</option>
                        {store?.map((s: any) => (
                            <option key={s.id} value={s.id}>
                                {s.store_name.charAt(0).toUpperCase() + s.store_name.slice(1)}
                            </option>
                        ))}
                    </select>

                </div>
            ),
        },
        {
            name: 'date',
            render: (updateFilter, filterValue) => (
                <div className="right">
                    <CalendarInput
                        wrapperClass=""
                        inputClass=""
                        onChange={(range: any) => updateFilter('date', { start_date: range.startDate, end_date: range.endDate })}
                        value={filterValue}
                    />
                </div>
            ),
        },
    ];

    return (
        <>
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
                    handlePagination={requestApiForData}
                    perPageOption={[10, 25, 50]}
                    totalCounts={totalRows}
                    realtimeFilter={realtimeFilter}
                />
            </div>
        </>

    );
};

export default ReportAbuseTable;
