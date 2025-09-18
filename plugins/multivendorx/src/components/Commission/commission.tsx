/* global appLocalizer */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { DateRangePicker, RangeKeyDict, Range } from 'react-date-range';
import { Table, getApiLink, TableCell, AdminBreadcrumbs, CommonPopup } from 'zyra';
import {
    ColumnDef,
    RowSelectionState,
    PaginationState,
} from '@tanstack/react-table';
import { useLocation } from 'react-router-dom';
import ViewCommission from './viewCommission';
export interface RealtimeFilter {
    name: string;
    render: (updateFilter: (key: string, value: any) => void, filterValue: any) => ReactNode;
}
// Type declarations
type CommissionStatus = {
    key: string;
    name: string;
    count: number;
};
type CommissionRow = {
    id?: number;
    orderId?: number;
    storeId?: number;
    storeName?: string;
    commissionAmount?: string;
    shipping?: string;
    tax?: string;
    commissionTotal?: string;
    commissionRefunded?: string;
    paidStatus?: 'paid' | 'unpaid' | string; // enum-like if you want
    commissionNote?: string | null;
    createTime?: string; // ISO datetime string
};

type FilterData = {
    searchAction?: string;
    searchField?: string;
    typeCount?: any;
};

const Commission: React.FC = () => {
    const dateRef = useRef<HTMLDivElement | null>(null);
    const [openModal, setOpenModal] = useState(false);
    const [modalDetails, setModalDetails] = useState<string>('');
    const [error, setError] = useState<String>();
    const [data, setData] = useState<CommissionRow[] | null>(null);
    const bulkSelectRef = useRef<HTMLSelectElement>(null);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [totalRows, setTotalRows] = useState<number>(0);
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [viewCommission, setViewCommission] = useState(false);
    const [selectedCommissionId, setSelectedCommissionId] = useState<number | null>(null);

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [selectedRange, setSelectedRange] = useState([
        {
            startDate: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date(),
            key: 'selection',
        },
    ]);
    const handleDateOpen = () => {
        setOpenDatePicker(!openDatePicker);
    };

    const [commissionStatus, setCommissionStatus] = useState<CommissionStatus[] | null>(null);
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
    const handleBulkAction = () => {
        if (appLocalizer.khali_dabba) {
            if (!Object.keys(rowSelection).length) {
                setModalDetails('Select rows.');
                setOpenModal(true);
                return;
            }
            if (!bulkSelectRef.current?.value) {
                setModalDetails('Please select a action.');
                setOpenModal(true);
                return;
            }
            setData(null);
        }
    };

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
        typeCount = '',
    ) {
        setData(null);
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'commission'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                page: currentPage,
                row: rowsPerPage,
                status: typeCount === 'all' ? '' : typeCount,
            },
        })
            .then((response) => {
                setData(response.data || []);
                setCommissionStatus([
                    {
                        key: 'all',
                        name: 'All',
                        count: response.data.all || 0,
                    },
                    {
                        key: 'paid',
                        name: 'Paid',
                        count: response.data.paid || 0,
                    },
                    {
                        key: 'unpaid',
                        name: 'Unpaid',
                        count: response.data.unpaid || 0,
                    },
                    {
                        key: 'refund',
                        name: 'Refund',
                        count: response.data.refund || 0,
                    },
                    {
                        key: 'trash',
                        name: 'Trash',
                        count: response.data.trash || 0,
                    },
                ]);

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
        filterData: FilterData
    ) => {
        setData(null);
        requestData(
            rowsPerPage,
            currentPage,
            filterData?.typeCount,
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
            header: __('Store Name', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.storeName || ''}>
                    {row.original.storeName ?? '-'}
                </TableCell>
            ),
        },
        {
            header: __('Product Amount', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.commissionAmount || ''}>
                    {row.original.commissionAmount ?? '-'}
                </TableCell>
            ),
        },
        {
            header: __('Commission Earned', 'multivendorx'),
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
            header: __('Commission Total', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.commissionTotal || ''}>
                    {row.original.commissionTotal ?? '-'}
                </TableCell>
            ),
        },

        {
            header: __('Paid Status', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.paidStatus || ''}>
                    <span className="admin-badge red">{row.original.paidStatus ?? '-'}</span>
                </TableCell>
            ),
        },
        {
            header: __('Date', 'multivendorx'),
            cell: ({ row }) => {
                const rawDate = row.original.createTime;
                let formattedDate = '-';
                if (rawDate) {
                    const dateObj = new Date(rawDate);
                    formattedDate = new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    }).format(dateObj);
                }
                return <TableCell title={formattedDate}>{formattedDate}</TableCell>;
            },
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
                                        onClick={() => {
                                            setSelectedCommissionId(row.original.id ?? null);
                                            setViewCommission(true);
                                        }}
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
    const realtimeFilter: RealtimeFilter[] = [
        {
            name: 'commissionStatus',
            render: (updateFilter: (key: string, value: string) => void, filterValue: string | undefined) => (
                <div className="admin-header-search-section course-field">
                    <select
                        name="commissionStatus"
                        onChange={(e) => updateFilter(e.target.name, e.target.value)}
                        value={filterValue || ''}
                        className="basic-select"
                    >
                        <option value="">Commission Status</option>
                        {/* { Object.entries( courses ).map( ( [ courseId, courseName ] ) => (
                            <option key={ courseId } value={ courseId }>
                                { courseName }
                            </option>
                        ) ) } */}
                    </select>
                </div>
            ),
        },
        {
            name: 'vendor',
            render: (updateFilter: (key: string, value: string) => void, filterValue: string | undefined) => (
                <div className="admin-header-search-section group-field">
                    <select
                        name="vendor"
                        onChange={(e) => updateFilter(e.target.name, e.target.value)}
                        value={filterValue || ''}
                        className="basic-select"
                    >
                        <option value="">All Vendors</option>
                        {/* { Object.entries( groups ).map( ( [ groupId, groupName ] ) => (
                            <option key={ groupId } value={ groupId }>
                                { ' ' }
                                { groupName }{ ' ' }
                            </option>
                        ) ) } */}
                    </select>
                </div>
            ),
        },
        // {
        //     name: 'bulk-action',
        //     render: () => (
        //         <div className=" bulk-action">
        //             <select name="action" className="basic-select" ref={bulkSelectRef}>
        //                 <option value="">{__('Bulk actions')}</option>
        //                 <option value="mark_paid">{__('Mark Paid')}</option>
        //                 <option value="delete">{__('Delete')}</option>
        //                 <option value="restore">{__('Restore')}</option>
        //             </select>
        //             {/* <button name="bulk-action-apply" className="admin-btn btn-purple" onClick={handleBulkAction}>
        //                 {__('Apply')}
        //             </button> */}
        //         </div>
        //     ),
        // },
        {
            name: 'date',
            render: (updateFilter) => (
                <div ref={dateRef}>
                    <div className="admin-header-search-section">
                        <input
                            value={`${selectedRange[0].startDate.toLocaleDateString()} - ${selectedRange[0].endDate.toLocaleDateString()}`}
                            onClick={() => handleDateOpen()}
                            className="basic-input"
                            type="text"
                            placeholder={'DD/MM/YYYY'}
                        />
                    </div>
                    {openDatePicker && (
                        <div className="date-picker-section-wrapper" id="date-picker-wrapper">
                            <DateRangePicker
                                ranges={selectedRange}
                                months={1}
                                direction="vertical"
                                scroll={{ enabled: true }}
                                maxDate={new Date()}
                                onChange={(ranges: RangeKeyDict) => {
                                    const selection: Range = ranges.selection;

                                    if (selection?.endDate instanceof Date) {
                                        // Set end of day to endDate
                                        selection.endDate.setHours(23, 59, 59, 999);
                                    }

                                    // Update local range state
                                    setSelectedRange([
                                        {
                                            startDate: selection.startDate || new Date(),
                                            endDate: selection.endDate || new Date(),
                                            key: selection.key || 'selection',
                                        },
                                    ]);

                                    // Update external filters (could be used by table or search logic)
                                    updateFilter('date', {
                                        start_date: selection.startDate,
                                        end_date: selection.endDate,
                                    });
                                }}
                            />
                        </div>
                    )}
                </div>
            ),
        },
    ];

    const BulkAction: React.FC = () => (
        <div className="bulk-actiondddddddd">
            <select name="action" className="basic-select" ref={bulkSelectRef}>
                <option value="">{__("Bulk actions", "multivendorx")}</option>
                <option value="mark_paid">{__("Mark Paid", "multivendorx")}</option>
                <option value="delete">{__("Delete", "multivendorx")}</option>
                <option value="restore">{__("Restore", "multivendorx")}</option>
            </select>

            <button
                name="bulk-action-apply"
                className="admin-btn btn-purple"
                onClick={handleBulkAction}
            >
                {__("Apply", "multivendorx")}
            </button>
        </div>
    );
    // 👉 Demo data for commissions
    // Type for an order line
    interface OrderItem {
        id: number;
        name: string;
        sku: string;
        cost: string;
        discount?: string;
        qty: number;
        total: string;
    }

    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-commission"
                tabTitle="Commissions"
                description={'Details of commissions earned by each store for every order, including order amount, commission rate, and payout status.'}
            />
            <div className="admin-table-wrapper">
                <Table
                    data={data}
                    columns={columns as ColumnDef<Record<string, any>, any>[]}
                    rowSelection={rowSelection}
                    onRowSelectionChange={setRowSelection}
                    defaultRowsPerPage={10}
                    realtimeFilter={realtimeFilter}
                    pageCount={pageCount}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    handlePagination={requestApiForData}
                    perPageOption={[10, 25, 50]}
                    typeCounts={commissionStatus as CommissionStatus}
                    bulkActionComp={() => <BulkAction />}
                />
            </div>

            {viewCommission && selectedCommissionId !== null && (
                <ViewCommission
                    open={viewCommission}
                    onClose={() => setViewCommission(false)}
                    commissionId={selectedCommissionId}
                />
            )}
        </>
    );
};

export default Commission;
