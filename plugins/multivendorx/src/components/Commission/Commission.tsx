/* global appLocalizer */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Table, getApiLink, TableCell } from 'zyra';
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';
import { useLocation } from 'react-router-dom';
import EditCommission from './EditCommission';

type CommissionRow = {
    id?: number;
    orderId?: number;
    storeId?: number;
    commissionAmount?: string;
    shipping?: string;
    tax?: string;
    includeCoupon?: boolean;
    includeShipping?: boolean;
    includeTax?: boolean;
    commissionTotal?: string;
    commissionRefunded?: string;
    paidStatus?: 'paid' | 'unpaid' | string; // enum-like if you want
    commissionNote?: string | null;
    createTime?: string; // ISO datetime string
};


const Commission: React.FC = () => {
    const location = useLocation();
    const hash = location.hash;

    const isTabActive = hash.includes('tab=commissions');
    // const isAddStore = hash.includes('create');
    // const isViewStore = hash.includes('view');
    const iseditCommission = hash.includes('edit');

    const [error, setError] = useState<String>();
    const [data, setData] = useState<CommissionRow[] | null>(null);

    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [pageCount, setPageCount] = useState(0);

    // Fetch total rows on mount
    useEffect(() => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'commission'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true },
        })
            .then((response) => {
                setTotalRows(response.data || 0);
                setPageCount(Math.ceil(response.data / pagination.pageSize));
            })
            .catch(() => {
                setError(__('Failed to load total rows', 'multivendorx'));
            });
    }, []);

    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        const rowsPerPage = pagination.pageSize;
        requestData(rowsPerPage, currentPage);
        setPageCount(Math.ceil(totalRows / rowsPerPage));
    }, [pagination]);
    const [showDropdown, setShowDropdown] = useState(false);

    const toggleDropdown = (id: any) => {
        if (showDropdown === id) {
            setShowDropdown(false);
            return;
        }
        setShowDropdown(id);
    };
    // Fetch data from backend.
    function requestData(
        rowsPerPage = 10,
        currentPage = 1,
    ) {
        setData(null);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'commission'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: currentPage,
                row: rowsPerPage,
            },
        })
            .then((response) => {
                setData(response.data || []);
            })
            .catch(() => {
                setError(__('Failed to load stores', 'multivendorx'));
                setData([]);
            });
    }

    // Handle pagination and filter changes
    const requestApiForData = (
        rowsPerPage: number,
        currentPage: number,
    ) => {
        setData(null);
        requestData(
            rowsPerPage,
            currentPage,
        );
    };

    // Column definitions
    const columns: ColumnDef<CommissionRow>[] = [
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
            header: __('ID', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.id?.toString() || ''}>
                    {row.original.id ?? '-'}
                </TableCell>
            ),
        },
        {
            header: __('Order ID', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.orderId?.toString() || ''}>
                    {row.original.orderId ?? '-'}
                </TableCell>
            ),
        },
        {
            header: __('Store ID', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.storeId?.toString() || ''}>
                    {row.original.storeId ?? '-'}
                </TableCell>
            ),
        },
        {
            header: __('Commission Amount', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.commissionAmount || ''}>
                    {row.original.commissionAmount ?? '-'}
                </TableCell>
            ),
        },
        {
            header: __('Shipping', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.shipping || ''}>
                    {row.original.shipping ?? '-'}
                </TableCell>
            ),
        },
        {
            header: __('Tax', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.tax || ''}>
                    {row.original.tax ?? '-'}
                </TableCell>
            ),
        },
        {
            header: __('Include Coupon', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.includeCoupon ? 'Yes' : 'No'}>
                    {row.original.includeCoupon ? 'Yes' : 'No'}
                </TableCell>
            ),
        },
        {
            header: __('Include Shipping', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.includeShipping ? 'Yes' : 'No'}>
                    {row.original.includeShipping ? 'Yes' : 'No'}
                </TableCell>
            ),
        },
        {
            header: __('Include Tax', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.includeTax ? 'Yes' : 'No'}>
                    {row.original.includeTax ? 'Yes' : 'No'}
                </TableCell>
            ),
        },
        {
            header: __('Commission Total', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.commissionTotal || ''}>
                    {row.original.commissionTotal ?? '-'}
                </TableCell>
            ),
        },
        {
            header: __('Commission Refunded', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.commissionRefunded || ''}>
                    {row.original.commissionRefunded ?? '-'}
                </TableCell>
            ),
        },
        {
            header: __('Paid Status', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.paidStatus || ''}>
                    {row.original.paidStatus ?? '-'}
                </TableCell>
            ),
        },
        {
            header: __('Commission Note', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.commissionNote || ''}>
                    {row.original.commissionNote ?? '-'}
                </TableCell>
            ),
        },
        {
            header: __('Date', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.createTime || ''}>
                    {row.original.createTime ?? '-'}
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
                                            (window.location.href = `?page=multivendorx#&tab=commissions&edit/${row.original.id}`)
                                        }
                                    >
                                        <i className="adminlib-eye"></i>
                                        {__('Edit', 'multivendorx')}
                                    </li>
                                    <li
                                        onClick={() =>
                                            (window.location.href = `?page=multivendorx#&tab=stores&edit/${row.original.id}`)
                                        }
                                    >
                                        <i className="adminlib-create"></i>
                                        {__('Delete', 'multivendorx')}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </TableCell>
            ),
        }
    ];

    return (
        <>
            {isTabActive && iseditCommission && <EditCommission />}
            {!iseditCommission && (
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
                        typeCounts={[]}
                    />
                </div>
            )}

        </>
    );
};

export default Commission;
