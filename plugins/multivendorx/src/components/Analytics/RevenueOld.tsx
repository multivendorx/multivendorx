import React from "react";
import { Tooltip } from "react-leaflet";
import { Cell, Legend, PieChart, ResponsiveContainer, Pie } from "recharts";
import { Table, TableCell } from "zyra";
import { __ } from '@wordpress/i18n';

type Product = {
  id: number;
  title: string;
  price: string;
};
const pieData = [
  { name: "Admin", value: 1200 },
  { name: "Vendor", value: 2400 },
  { name: "Shipping", value: 800 },
  { name: "Free", value: 200 },
];
const COLORS = ["#5007aa", "#00c49f", "#ff7300", "#d400ffff"];
const overview = [
  {
    id: 'sales',
    label: 'Gross Sales',
    count: 15,
    icon: 'adminlib-star green',
  },
  {
    id: 'earnings',
    label: 'Returns',
    count: 625,
    icon: 'adminlib-support red',
  },
  {
    id: 'Vendors',
    label: 'Coupons',
    count: 8,
    icon: 'adminlib-global-community blue',
  },
  {
    id: 'free',
    label: 'Net Sales',
    count: 8,
    icon: 'adminlib-global-community yellow',
  },
  {
    id: 'sales',
    label: 'Taxs',
    count: 15,
    icon: 'adminlib-star green',
  },
  {
    id: 'earnings',
    label: 'Shipping',
    count: 625,
    icon: 'adminlib-support red',
  },
  {
    id: 'Vendors',
    label: 'Total sales',
    count: 8,
    icon: 'adminlib-global-community blue',
  },
];
const products: Product[] = [
  {
    id: 1,
    title: "Total Admin Net Earning",
    price: "$5,072.31",
  },
  {
    id: 1,
    title: "Total Store Commission",
    price: "$1,713.85",
  },
  {
    id: 1,
    title: "Total Store Net Commission",
    price: "$75",
  },
  {
    id: 1,
    title: "Total Sub Total",
    price: "$1,713.85",
  },
  {
    id: 1,
    title: "Shipping",
    price: "$0",
  },
];
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
const RevenueOld: React.FC = () => {
  return (
    <div className="dashboard-overview">
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
          <div className="card-body">
            <div className="analytics-container">

              {overview.map((item, idx) => (
                <div key={idx} className="analytics-item">
                  <div className="analytics-icon">
                    <i className={item.icon}></i>
                  </div>
                  <div className="details">
                    <div className="number">{item.count}</div>
                    <div className="text">{item.label}</div>
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>
      </div>
      <Table
          data={demoData}
          columns={columns as ColumnDef<Record<string, any>, any>[]}
          // rowSelection={rowSelection}
          // onRowSelectionChange={setRowSelection}
          defaultRowsPerPage={10}
          // pageCount={pageCount}
          // pagination={pagination}
          // onPaginationChange={setPagination}
          // handlePagination={requestApiForData}
          // perPageOption={[10, 25, 50]}
          // typeCounts={[]}
        />
    </div>
  );
};

export default RevenueOld;