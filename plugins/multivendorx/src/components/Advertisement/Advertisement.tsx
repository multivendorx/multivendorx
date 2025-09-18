import { ColumnDef, PaginationState, RowSelectionState } from '@tanstack/react-table';
import { useState } from 'react';
import { AdminBreadcrumbs, Table, TableCell } from 'zyra';
import { __ } from '@wordpress/i18n';

export interface RealtimeFilter {
    name: string;
    render: (updateFilter: (key: string, value: any) => void, filterValue: any) => ReactNode;
}

const Advertisement: React.FC = () => {
    const [data, setData] = useState<StoreRow[] | null>(null);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [pageCount, setPageCount] = useState(0);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });


    // Type for an order line
    interface OrderItem {
        id: number;
        productName: string;
        storeName: string;
        createdBy: string;
        orderId: string;
        cost: string;
        expiryDate: string;
        createdAt: string;
    }

    const demoData: OrderItem[] = [
        {
            id: 1,
            productName: "Charcoal Detox",
            storeName: "Glow Essentials",
            createdBy: "Anna Lee",
            orderId: "ORD-1001",
            cost: "$95.00",
            expiryDate: "2026-01-10",
            createdAt: "2025-09-01",
        },
        {
            id: 2,
            productName: "Lavender Soap",
            storeName: "Luxe Bath Co",
            createdBy: "John Smith",
            orderId: "ORD-1002",
            cost: "$12.00",
            expiryDate: "2026-02-15",
            createdAt: "2025-09-02",
        },
        {
            id: 3,
            productName: "Herbal Shampoo",
            storeName: "Nature’s Touch",
            createdBy: "Sophie Brown",
            orderId: "ORD-1003",
            cost: "$18.00",
            expiryDate: "2026-03-05",
            createdAt: "2025-09-03",
        },
        {
            id: 4,
            productName: "Organic Lotion",
            storeName: "Pure Bliss",
            createdBy: "David Chen",
            orderId: "ORD-1004",
            cost: "$22.50",
            expiryDate: "2026-04-20",
            createdAt: "2025-09-04",
        },
        {
            id: 5,
            productName: "Rose Face Mist",
            storeName: "Glow Essentials",
            createdBy: "Emily Clark",
            orderId: "ORD-1005",
            cost: "$15.00",
            expiryDate: "2026-05-30",
            createdAt: "2025-09-05",
        },
        {
            id: 6,
            productName: "Mint Foot Cream",
            storeName: "Luxe Bath Co",
            createdBy: "Oliver Davis",
            orderId: "ORD-1006",
            cost: "$8.50",
            expiryDate: "2026-06-25",
            createdAt: "2025-09-06",
        },
        {
            id: 7,
            productName: "Coconut Hair Oil",
            storeName: "Nature’s Touch",
            createdBy: "Sophia Patel",
            orderId: "ORD-1007",
            cost: "$13.00",
            expiryDate: "2026-07-18",
            createdAt: "2025-09-07",
        },
        {
            id: 8,
            productName: "Vanilla Body Scrub",
            storeName: "Pure Bliss",
            createdBy: "Liam Walker",
            orderId: "ORD-1008",
            cost: "$20.00",
            expiryDate: "2026-08-12",
            createdAt: "2025-09-08",
        },
        {
            id: 9,
            productName: "Green Tea Mask",
            storeName: "Glow Essentials",
            createdBy: "Ella Martinez",
            orderId: "ORD-1009",
            cost: "$10.00",
            expiryDate: "2026-09-02",
            createdAt: "2025-09-09",
        },
        {
            id: 10,
            productName: "Honey Lip Balm",
            storeName: "Luxe Bath Co",
            createdBy: "James Carter",
            orderId: "ORD-1010",
            cost: "$6.00",
            expiryDate: "2026-10-22",
            createdAt: "2025-09-10",
        },
    ];

    const columns: ColumnDef<OrderItem>[] = [
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
                <TableCell title={row.original.productName || ''}>
                    {row.original.productName ?? '-'}
                </TableCell>
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
            header: __('Created By', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.createdBy || ''}>
                    {row.original.createdBy ?? '-'}
                </TableCell>
            ),
        },
        {
            header: __('Order Id', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.orderId || ''}>
                    {row.original.orderId ?? '-'}
                </TableCell>
            ),
        },
        {
            header: __('Cost', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.cost || ''}>
                    {row.original.cost ?? '-'}
                </TableCell>
            ),
        },
        {
            header: __('Expiry Date', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.expiryDate || ''}>
                    {row.original.expiryDate ?? '-'}
                </TableCell>
            ),
        },
        {
            header: __('Created At', 'multivendorx'),
            cell: ({ row }) => (
                <TableCell title={row.original.createdAt || ''}>
                    {row.original.createdAt ?? '-'}
                </TableCell>
            ),
        },
    ];

    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-advertisement"
                tabTitle="Advertisement"
                description={'Manage all pending administrative actions including approvals, payouts, and notifications.'}
            />


            <div className="admin-table-wrapper">
                <Table
                    data={demoData}
                    columns={columns as ColumnDef<Record<string, any>, any>[]}
                    rowSelection={rowSelection}
                    onRowSelectionChange={setRowSelection}
                    defaultRowsPerPage={10}
                    pageCount={pageCount}
                    pagination={pagination}
                    // realtimeFilter={realtimeFilter}
                    onPaginationChange={setPagination}
                    // handlePagination={requestApiForData}
                    perPageOption={[10, 25, 50]}
                    // typeCounts={announcementStatus as AnnouncementStatus[]}
                    onRowClick={(row: any) => {
                        handleEdit(row.id);
                    }}
                // bulkActionComp={() => <BulkAction />}
                />
            </div>
        </>
    );
}

export default Advertisement;