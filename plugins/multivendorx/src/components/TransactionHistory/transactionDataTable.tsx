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

type StoreRow = {
    id?: number;
    store_name?: string;
    store_slug?: string;
    status?: string;
};

const TransactionDataTable: React.FC = ({storeId}) => {
    const [data, setData] = useState<StoreRow[] | null>(null);

    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [pageCount, setPageCount] = useState(0);



    useEffect(() => {
        const currentPage = pagination.pageIndex + 1;
        const rowsPerPage = pagination.pageSize;
        requestData(rowsPerPage, currentPage);
        setPageCount(Math.ceil(totalRows / rowsPerPage));
    }, [pagination]);
    const [ showDropdown, setShowDropdown ] = useState( false );
    
        const toggleDropdown = ( id: any ) => {
            if ( showDropdown === id ) {
                setShowDropdown( false );
                return;
            }
            setShowDropdown( id );
        };
    // Fetch data from backend.
    function requestData(
        rowsPerPage = 10,
        currentPage = 1,
    ) {
        setData(null);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'products'),
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
            header: __('Product Name', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.name || ''}>
                    {row.original.name || '-'}
                </TableCell>
            ),
        },
        {
            header: __('SKU', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.sku || ''}>
                    {row.original.sku || '-'}
                </TableCell>
            ),
        },
        {
            header: __('Price', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.price || ''}>
                    {row.original.price ? `${row.original.price}` : '-'}
                </TableCell>
            ),
        },
        {
            header: __('Status', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.status || ''}>
                    {row.original.status || '-'}
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
                                { __( 'View Store', 'multivendorx' ) }
                            </li>
                            <li
                                onClick={() =>
                                    (window.location.href = `?page=multivendorx#&tab=stores&edit/${row.original.id}`)
                                }
                            >
                                <i className="adminlib-create"></i>
                                { __( 'Edit Store', 'multivendorx' ) }
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
        </>
    );
};

export default TransactionDataTable;
