import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { Table, TableCell } from "zyra";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Tooltip } from 'react-leaflet';
const COLORS = ["#5007aa", "#00c49f", "#ff7300", "#d400ffff"];

const overview = [
  {
    id: 'sales',
    label: 'Total Visits',
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
const RefundedOrders: React.FC = () => {
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
const pieData = [
  { name: "Admin", value: 1200 },
  { name: "Store", value: 2400 },
  { name: "Shipping", value: 800 },
  { name: "Free", value: 200 },
];
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
            </div>
      
            <div className="row">
              <div className="column">
                <div className="card-header">
                  <div className="left">
                    <div className="title">
                      Revenue Distribution
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
              <div className="column">
                <div className="card-header">
                  <div className="left">
                    <div className="title">
                      Breakdown
                    </div>
                  </div>
                </div>
                <div className="top-items">
                  {products.map((product) => (
                    <div className="items" key={product.id}>
                      <div className="left-side">
                        <div className="details">
                          <div className="item-title">{product.title}</div>
                        </div>
                      </div>
                      <div className="right-side">
                        <div className="price">{product.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* <div className="row">
              <div className="column">
                <div className="card-header">
                  <div className="left">
                    <div className="title">
                      Conversion Funnel
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={overviewData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orders" fill="#5007aa" barSize={40} name="Orders" />
                    <Bar dataKey="sold_out" fill="#00c49f" barSize={40} name="Sold Out" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="column">
                <div className="card-header">
                  <div className="left">
                    <div className="title">
                      Traffic Sources Breakdown
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
      
            </div> */}
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
    </>
  );
};

export default RefundedOrders;
