import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { __ } from '@wordpress/i18n';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Table, TableCell } from "zyra";

type Stat = {
  id: string | number;
  count: number | string;
  icon: string;
  label: string;
};
type Product = {
  id: number;
  title: string;
  price: string;
};
type OverviewProps = {
  overview: Stat[];
  data: { month: string; revenue: number; net_sale: number; admin_amount: number }[];
  overviewData: { name: string; orders: number; sold_out: number }[];
  pieData: { name: string; value: number }[];
  COLORS?: string[];
};
// const products: Product[] = [
//   {
//     id: 1,
//     title: "Citrus Bloom",
//     sold: 3,
//     price: "$380",
//     image: "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/products/headphones.png",
//   },
//   {
//     id: 2,
//     title: "Leather Backpack",
//     sold: 5,
//     price: "$120",
//     image: "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/products/apple-watch.png",
//   },
//   {
//     id: 3,
//     title: "Smart Watch",
//     sold: 2,
//     price: "$220",
//     image: "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/products/play-station.png",
//   },
// ];
const products: Product[] = [
  {
    id: 1,
    title: "Admin Net Earning",
    price: "$5,072.31",
  },
  {
    id: 1,
    title: "Store Net Earning",
    price: "$1,713.85",
  },
  {
    id: 1,
    title: "Shipping",
    price: "$75",
  },
  {
    id: 1,
    title: "Tax",
    price: "$1,713.85",
  },
  {
    id: 1,
    title: "Total",
    price: "$855552",
  },
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
    header: __('Product title', 'multivendorx'),
    cell: ({ row }) => (
      <TableCell title={row.original.store_name || ''}>
        #{row.original.id || '-'}
      </TableCell>
    ),
  },
  {
    header: __('SKU', 'multivendorx'),
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
  {
    header: __('Items sold', 'multivendorx'),
    cell: ({ row }) => (
      <TableCell title={row.original.store_slug || ''}>
        {row.original.date || '-'}
      </TableCell>
    ),
  },
  {
    header: __('Net sales', 'multivendorx'),
    cell: ({ row }) => (
      <TableCell title={row.original.store_name || ''}>
        {row.original.vendor || '-'}
      </TableCell>
    ),
  },
  {
    header: __('Orders', 'multivendorx'),
    cell: ({ row }) => (
      <TableCell title={row.original.store_slug || ''}>
        {row.original.amount || '-'}
      </TableCell>
    ),
  },
  {
    header: __('Category', 'multivendorx'),
    cell: ({ row }) => (
      <TableCell title={row.original.store_slug || ''}>
        {row.original.commission || '-'}
      </TableCell>
    ),
  },
  {
    header: __('Variations', 'multivendorx'),
    cell: ({ row }) => (
      <TableCell title={row.original.store_slug || ''}>
        {row.original.amount || '-'}
      </TableCell>
    ),
  },
  {
    header: __('Status', 'multivendorx'),
    cell: ({ row }) => (
      <TableCell title={row.original.store_slug || ''}>
        {row.original.commission || '-'}
      </TableCell>
    ),
  },
  {
    header: __('Stock', 'multivendorx'),
    cell: ({ row }) => (
      <TableCell title={row.original.store_slug || ''}>
        {row.original.commission || '-'}
      </TableCell>
    ),
  },
];
const Overview: React.FC<OverviewProps> = ({
  overview,
  data,
  overviewData,
  pieData,
  COLORS = ["#5007aa", "#00c49f", "#ff7300", "#d400ffff", "#004ec4ff"],
}) => {
  return (
    <div className="dashboard-overview">
      {/* Top Stats */}
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
        <div className="column width-65">
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
        <div className="column width-35">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Revenue breakdown
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
      <div className="row">
        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Revenue trade
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#5007aa" strokeWidth={3} name="Top Category" />
              <Line type="monotone" dataKey="net_sale" stroke="#ff7300" strokeWidth={3} name="Top Brand" />
              <Line type="monotone" dataKey="admin_amount" stroke="#00c49f" strokeWidth={3} name="Top Store" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="row">
        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Top sold category
              </div>
            </div>
          </div>
          <div className="top-items">
            <div className="items">
              <div className="left-side">
                <div className="icon">
                  <i className="adminlib-pro-tag admin-icon red"></i>
                </div>
                <div className="details">
                  <div className="item-title">Lather & Loom</div>
                  <div className="sub-text">3 orders</div>
                </div>
              </div>
              <div className="right-side">
                <div className="price">$380</div>
              </div>
            </div>
            <div className="items">
              <div className="left-side">
                <div className="icon">
                  <i className="adminlib-pro-tag admin-icon green"></i>
                </div>
                <div className="details">
                  <div className="item-title">Lather & Loom</div>
                  <div className="sub-text">3 orders</div>
                </div>
              </div>
              <div className="right-side">
                <div className="price">$380</div>
              </div>
            </div>
          </div>
        </div>

        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Top sold Product
              </div>
            </div>
          </div>
          <div className="top-items">
            <div className="items">
              <div className="left-side">
                <div className="icon">
                  <i className="adminlib-pro-tag admin-icon red"></i>
                </div>
                <div className="details">
                  <div className="item-title">Lather & Loom</div>
                  <div className="sub-text">3 orders</div>
                </div>
              </div>
              <div className="right-side">
                <div className="price">$380</div>
              </div>
            </div>
            <div className="items">
              <div className="left-side">
                <div className="icon">
                  <i className="adminlib-pro-tag admin-icon green"></i>
                </div>
                <div className="details">
                  <div className="item-title">Lather & Loom</div>
                  <div className="sub-text">3 orders</div>
                </div>
              </div>
              <div className="right-side">
                <div className="price">$380</div>
              </div>
            </div>
          </div>
        </div>
        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Top Store
              </div>
            </div>
          </div>
          <div className="top-items">
            <div className="items">
              <div className="left-side">
                <div className="icon">
                  <i className="adminlib-pro-tag admin-icon red"></i>
                </div>
                <div className="details">
                  <div className="item-title">Lather & Loom</div>
                  <div className="sub-text">3 orders</div>
                </div>
              </div>
              <div className="right-side">
                <div className="price">$380</div>
              </div>
            </div>
            <div className="items">
              <div className="left-side">
                <div className="icon">
                  <i className="adminlib-pro-tag admin-icon green"></i>
                </div>
                <div className="details">
                  <div className="item-title">Lather & Loom</div>
                  <div className="sub-text">3 orders</div>
                </div>
              </div>
              <div className="right-side">
                <div className="price">$380</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="row">
        <div className="column">
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
            perPageOption={[10, 25, 50]}
            typeCounts={[]}
          />
        </div>
      </div> */}
    </div>
  );
};

export default Overview;
