import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { Table, TableCell } from "zyra";

const overview = [
  {
    id: 'sales',
    label: 'Admin Net Earning',
    count: 15,
    icon: 'adminlib-star',
  },
  {
    id: 'earnings',
    label: 'Store Commission',
    count: 625,
    icon: 'adminlib-support',
  },
  {
    id: 'Vendors',
    label: 'Store Net Commission',
    count: 8,
    icon: 'adminlib-global-community',
  },
  {
    id: 'free',
    label: 'Sub Total',
    count: 758,
    icon: 'adminlib-global-community',
  },
  {
    id: 'free',
    label: 'Shipping',
    count: 85,
    icon: 'adminlib-global-community',
  },
];
const StoreOrders: React.FC = () => {
  const [data, setData] = useState<StoreRow[] | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [pageCount, setPageCount] = useState(0);
  type StoreRow = {
  id: number;
  vendor: string;
  amount: string;
  commission: string;
  date: string;
  status: "Paid" | "Unpaid";
};

  const demoData: StoreRow[] = [
  { id: 1, vendor: "John's Electronics", amount: "$1200", commission: "$120", date: "2025-09-01", status: "Paid" },
  { id: 2, vendor: "Jane's Apparel", amount: "$850", commission: "$85", date: "2025-09-02", status: "Unpaid" },
  { id: 3, vendor: "Tech Hub", amount: "$2300", commission: "$230", date: "2025-09-03", status: "Paid" },
  { id: 4, vendor: "Gadget World", amount: "$670", commission: "$67", date: "2025-09-04", status: "Unpaid" },
  { id: 5, vendor: "Fashion Store", amount: "$980", commission: "$98", date: "2025-09-05", status: "Paid" },
  { id: 6, vendor: "Mobile Planet", amount: "$1500", commission: "$150", date: "2025-09-06", status: "Unpaid" },
  { id: 7, vendor: "Home Essentials", amount: "$720", commission: "$72", date: "2025-09-07", status: "Paid" },
  { id: 8, vendor: "Office Supplies Co.", amount: "$430", commission: "$43", date: "2025-09-08", status: "Unpaid" },
  { id: 9, vendor: "Luxury Bags", amount: "$1250", commission: "$125", date: "2025-09-09", status: "Paid" },
  { id: 10, vendor: "Kitchen King", amount: "$980", commission: "$98", date: "2025-09-10", status: "Unpaid" },
];

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
      header: __('Order Id', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell title={row.original.store_name || ''}>
          {'#7585'}
        </TableCell>
      ),
    },
    {
      header: __('Store', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell title={row.original.store_name || ''}>
          {row.original.vendor || '-'}
        </TableCell>
      ),
    },
    {
      header: __('Amount', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell title={row.original.store_slug || ''}>
          {row.original.amount || '-'}
        </TableCell>
      ),
    },
    {
      header: __('Commission', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell title={row.original.store_slug || ''}>
          {row.original.commission || '-'}
        </TableCell>
      ),
    },
    {
      header: __('Date', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell title={row.original.store_slug || ''}>
          {row.original.date || '-'}
        </TableCell>
      ),
    },
    {
      header: __('Status', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell title={row.original.status || ''}>
          {row.original.status === "Paid" && (
            <span className="admin-badge green">Paid</span>
          )}
          {row.original.status === "Unpaid" && (
            <span className="admin-badge red">Unpaid</span>
          )}
        </TableCell>
      ),
    },
  ];
  return (
    <>
    <div className="row">
      <div className="column">
        <div className="card-header">
            <div className="left">
              <div className="title">
                Revenue Distribution
              </div>
            </div>
          </div>
          <Table
          data={demoData}
          columns={columns as ColumnDef<Record<string, any>, any>[]}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          defaultRowsPerPage={10}
          // pageCount={pageCount}
          // pagination={pagination}
          onPaginationChange={setPagination}
          // handlePagination={requestApiForData}
          perPageOption={[10, 25, 50]}
          typeCounts={[]}
        />
      </div>
    </div>
        
    </>
  );
};

export default StoreOrders;