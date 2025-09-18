import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { Table, TableCell } from "zyra";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Tooltip } from 'react-leaflet';

const overview = [
  {
    id: 'sales',
    label: 'Active Stores',
    count: 15,
    icon: 'adminlib-star red',
  },
  {
    id: 'earnings',
    label: 'Stores with Sales',
    count: 625,
    icon: 'adminlib-support green',
  },
  {
    id: 'Vendors',
    label: 'New Stores',
    count: 8,
    icon: 'adminlib-global-community blue',
  },
  {
    id: 'free',
    label: 'Pending Store',
    count: 758,
    icon: 'adminlib-global-community yellow',
  },
];
const data = [
  { month: "Jan", revenue: 4000, net_sale: 2400, admin_amount: 1200 },
  { month: "Feb", revenue: 3000, net_sale: 2000, admin_amount: 1000 },
  { month: "Mar", revenue: 4500, net_sale: 2800, admin_amount: 1300 },
  { month: "Apr", revenue: 5000, net_sale: 3200, admin_amount: 1500 },
  { month: "May", revenue: 4200, net_sale: 2500, admin_amount: 1400 },
  { month: "Jun", revenue: 4800, net_sale: 3000, admin_amount: 1600 },
  { month: "Jul", revenue: 5200, net_sale: 3400, admin_amount: 1700 },
  { month: "Aug", revenue: 4700, net_sale: 2900, admin_amount: 1500 },
];
const overviewData = [
  { name: "Jan", orders: 120, sold_out: 30 },
  { name: "Feb", orders: 90, sold_out: 20 },
  { name: "Mar", orders: 150, sold_out: 40 },
  { name: "Apr", orders: 170, sold_out: 35 },
  { name: "May", orders: 140, sold_out: 25 },
  { name: "Jun", orders: 180, sold_out: 50 },
  { name: "Jul", orders: 200, sold_out: 45 },
  { name: "Aug", orders: 160, sold_out: 30 },
];
const Transactions: React.FC = () => {
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
  const chart = [
    { month: "Jan", revenue: 4000, net_sale: 2400, admin_amount: 1200 },
    { month: "Feb", revenue: 3000, net_sale: 2000, admin_amount: 1000 },
    { month: "Mar", revenue: 4500, net_sale: 2800, admin_amount: 1300 },
    { month: "Apr", revenue: 5000, net_sale: 3200, admin_amount: 1500 },
    { month: "May", revenue: 4200, net_sale: 2500, admin_amount: 1400 },
    { month: "Jun", revenue: 4800, net_sale: 3000, admin_amount: 1600 },
    { month: "Jul", revenue: 5200, net_sale: 3400, admin_amount: 1700 },
    { month: "Aug", revenue: 4700, net_sale: 2900, admin_amount: 1500 },
  ];
  const demoData: StoreRow[] = [
    { id: 54211, vendor: "John's Electronics", amount: "$1200", commission: "$120", date: "2025-09-01", status: "Paid" },
    { id: 84211, vendor: "Jane's Apparel", amount: "$850", commission: "$85", date: "2025-09-02", status: "Unpaid" },
    { id: 84211, vendor: "Tech Hub", amount: "$2300", commission: "$230", date: "2025-09-03", status: "Paid" },
    { id: 84211, vendor: "Gadget World", amount: "$670", commission: "$67", date: "2025-09-04", status: "Unpaid" },
    { id: 84211, vendor: "Fashion Store", amount: "$980", commission: "$98", date: "2025-09-05", status: "Paid" },
    { id: 64211, vendor: "Mobile Planet", amount: "$1500", commission: "$150", date: "2025-09-06", status: "Unpaid" },
    { id: 54211, vendor: "Home Essentials", amount: "$720", commission: "$72", date: "2025-09-07", status: "Paid" },
    { id: 8211, vendor: "Office Supplies Co.", amount: "$430", commission: "$43", date: "2025-09-08", status: "Unpaid" },
    { id: 4211, vendor: "Luxury Bags", amount: "$1250", commission: "$125", date: "2025-09-09", status: "Paid" },
    { id: 84211, vendor: "Kitchen King", amount: "$980", commission: "$98", date: "2025-09-10", status: "Unpaid" },
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
      header: __('Order Total', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell title={row.original.store_slug || ''}>
          {row.original.amount || '-'}
        </TableCell>
      ),
    },
    {
      header: __('Shipping', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell title={row.original.store_slug || ''}>
          {row.original.amount || '-'}
        </TableCell>
      ),
    },
    {
      header: __('Tax', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell title={row.original.store_slug || ''}>
          {row.original.amount || '-'}
        </TableCell>
      ),
    },
    {
      header: __('Store Commission', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell title={row.original.store_slug || ''}>
          {row.original.commission || '-'}
        </TableCell>
      ),
    },
    {
      header: __('Store Net Earnings', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell title={row.original.store_slug || ''}>
          {row.original.commission || '-'}
        </TableCell>
      ),
    },
    {
      header: __('Admin Earnings', 'multivendorx'),
      cell: ({ row }) => (
        <TableCell title={row.original.store_slug || ''}>
          {row.original.commission || '-'}
        </TableCell>
      ),
    },
  ];
  const analyticsData = [
    { icon: "adminlib-tools red", number: "230k", text: "Total Earnings" },
    { icon: "adminlib-book green", number: "45k", text: "Awaiting Disbursement" },
    { icon: "adminlib-global-community yellow", number: "1.2M", text: "Pending Withdrawal" },
    { icon: "adminlib-wholesale blue", number: "500k", text: "Completed / Paid Disbursement" },
    { icon: "adminlib-tools red", number: "230k", text: "Refund / Chargeback Impact" },
    { icon: "adminlib-book green", number: "45k", text: "Manual Adjustments" },
    { icon: "adminlib-global-community yellow", number: "1.2M", text: "Upcoming Unlock" },
  ];
  const pieData = [
    { name: "Store 1(300)", value: 300 },
    { name: "Store 2(2400)", value: 2400 },
    { name: "Store 3(800)", value: 800 },
    { name: "Store 4(200)", value: 200 },
    { name: "Store 5(400)", value: 400 },
  ];

  const COLORS = ["#5007aa", "#00c49f", "#ff7300", "#d400ffff", "#00ff88ff"];
  return (
    <>
      {/* <div className="row">
        <div className="overview-card-wrapper">
          {overview.map((stat) => (
            <div className="action" key={stat.id}>
              <div className="title">
                {stat.count}
                <i className={stat.icon}></i>
              </div>
              <div className="description">{stat.label}</div>
            </div>
          ))}
        </div>
      </div> */}
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
        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Top revenue-generating stores
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

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

export default Transactions;
