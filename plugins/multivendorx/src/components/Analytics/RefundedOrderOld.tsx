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
    label: 'Vendor Commission',
    count: 625,
    icon: 'adminlib-support',
  },
  {
    id: 'Vendors',
    label: 'Vendor Net Commission',
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
const RefundedOrderOld: React.FC = () => {
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

  type RefundRow = {
    orderId: number;
    vendor: string;
    refundAmount: string;
    refundReason: string;
    paymentGateway: string;
    date: string;
  };

  const demoData: RefundRow[] = [
    {
      orderId: 101,
      vendor: "John's Electronics",
      refundAmount: "$120",
      refundReason: "Damaged product",
      paymentGateway: "PayPal",
      date: "2025-09-01",
    },
    {
      orderId: 102,
      vendor: "Jane's Apparel",
      refundAmount: "$80",
      refundReason: "Size issue",
      paymentGateway: "Stripe",
      date: "2025-09-02",
    },
    {
      orderId: 103,
      vendor: "Tech Hub",
      refundAmount: "$150",
      refundReason: "Late delivery",
      paymentGateway: "Razorpay",
      date: "2025-09-03",
    },
    {
      orderId: 104,
      vendor: "Gadget World",
      refundAmount: "$60",
      refundReason: "Wrong color",
      paymentGateway: "PayPal",
      date: "2025-09-04",
    },
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
        <TableCell title={row.original.orderId || ''}>
          {row.original.orderId || '-'}
        </TableCell>
      ),
    },
    {
      header: __('Store', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell title={row.original.vendor || ''}>
          {row.original.vendor || '-'}
        </TableCell>
      ),
    },
    {
      header: __('Refund Amount', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell title={row.original.refundAmount || ''}>
          {row.original.refundAmount || '-'}
        </TableCell>
      ),
    },
    {
      header: __('Refund Reason', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell title={row.original.refundReason || ''}>
          {row.original.refundReason || '-'}
        </TableCell>
      ),
    },
    {
      header: __('Payment Gateway', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell title={row.original.paymentGateway || ''}>
          {row.original.paymentGateway || '-'}
        </TableCell>
      ),
    },
    {
      header: __('Date', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell title={row.original.date || ''}>
          {row.original.date || '-'}
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
                Account Overview
              </div>
            </div>
            <div className="right">
              <span>Updated 1 month ago</span>
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

export default RefundedOrderOld;