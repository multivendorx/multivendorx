import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Table, getApiLink, TableCell, Container, Column } from 'zyra';
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';

type NotificationStore = {
    id?: number;
    store_name?: string;
    title?: string;
    type?: string;
    date?: string; // Add date field
};

const NotificationTable = (): React.ReactElement => {
    const [data, setData] = useState<NotificationStore[] | null>(null);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [pageCount, setPageCount] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Fetch total rows on mount
    useEffect(() => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'notifications'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true, notification: true },
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

    // Fetch data from backend.
    function requestData(rowsPerPage = 10, currentPage = 1, typeCount = '') {
        setData(null);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'notifications'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: currentPage,
                row: rowsPerPage,
                filter_status: typeCount === 'all' ? '' : typeCount,
                notification: true,
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
        currentPage: number
        // filterData: FilterData
    ) => {
        setData(null);
        requestData(
            rowsPerPage,
            currentPage
            // filterData?.typeCount,
        );
    };

    // Column definitions with sorting enabled
    const columns: ColumnDef<NotificationStore>[] = [
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
            header: __('Store Name', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.store_name || ''}>
                    {row.original.store_name || ''}
                </TableCell>
            ),
        },
        {
            header: __('Title', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.title || ''}>
                    {row.original.title || ''}
                </TableCell>
            ),
        },

        {
            header: __('Type', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.type || ''}>
                    {row.original.type || ''}
                </TableCell>
            ),
        },
        {
            header: __('Date', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.date || ''}>
                    {row.original.date || ''}
                </TableCell>
            ),
        },
    ];

    return (
        <Container general>
            <Column>
                {error && <div className="error-notice">{error}</div>}
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
                    totalCounts={totalRows}
                    // searchFilter={searchFilter}
                    // realtimeFilter={realtimeFilter}
                />
            </Column>
        </Container>
    );
};

export default NotificationTable;
