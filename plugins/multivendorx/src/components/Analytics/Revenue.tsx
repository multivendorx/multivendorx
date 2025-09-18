import React from "react";
import { Tooltip } from "react-leaflet";
import { Cell, Legend, PieChart, ResponsiveContainer, Pie, BarChart, CartesianGrid, XAxis, YAxis, Bar, LineChart, Line } from "recharts";
import { __ } from '@wordpress/i18n';
import { Table, TableCell } from "zyra";

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
    label: 'Products Sold',
    count: 15,
    icon: 'adminlib-star red',
  },
  {
    id: 'earnings',
    label: 'New Products',
    count: 625,
    icon: 'adminlib-support green',
  },
  {
    id: 'Vendors',
    label: 'Low Stock',
    count: 8,
    icon: 'adminlib-global-community yellow',
  },
  {
    id: 'free',
    label: 'Out of Stock',
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
    title: "Total Vendor Commission",
    price: "$1,713.85",
  },
  {
    id: 1,
    title: "Total Vendor Net Commission",
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

const Revenue: React.FC = () => {
  return (
    <div className="dashboard-overview">
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
                Revenue Trend Analysis
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

      {/* <div className="row">
        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Category Performance
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
                Stock Status Overview
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
      <div className="row">
        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Top Categories
              </div>
              <div className="des">3 categories showing top performers</div>
            </div>
          </div>
          {/* 1st product */}
          <div className="column">
            <div className="card-header">
              <div className="left">
                <div className="product-name">
                  Electronics
                </div>
              </div>
              <div className="right">
                <div className="price">
                  <b>Total Sales:</b> $125,000
                </div>
              </div>
            </div>
            <div className="top-items">
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <span className="admin-icon red">#1</span>
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
                    <span className="admin-icon green">#2</span>
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
          {/* 2nd product */}
          <div className="column">
            <div className="card-header">
              <div className="left">
                <div className="product-name">
                  Clothing
                </div>
              </div>
              <div className="right">
                <div className="price">
                  <b>Total Sales:</b> $125,000
                </div>
              </div>
            </div>
            <div className="top-items">
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <span className="admin-icon red">#1</span>
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
                    <span className="admin-icon green">#2</span>
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
          {/* 3rd product */}
          <div className="column">
            <div className="card-header">
              <div className="left">
                <div className="product-name">
                  Home & Garden
                </div>
              </div>
              <div className="right">
                <div className="price">
                  <b>Total Sales:</b> $125,000
                </div>
              </div>
            </div>
            <div className="top-items">
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <span className="admin-icon red">#1</span>
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
                    <span className="admin-icon green">#2</span>
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

        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Top Brands
              </div>
              <div className="des">3 brands showing top performers</div>
            </div>
          </div>
          {/* 1st product */}
          <div className="column">
            <div className="card-header">
              <div className="left">
                <div className="product-name">
                  Apple
                </div>
              </div>
              <div className="right">
                <div className="price">
                  <b>Total Sales:</b> $125,000
                </div>
              </div>
            </div>
            <div className="top-items">
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <span className="admin-icon red">#1</span>
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
                    <span className="admin-icon green">#2</span>
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
          {/* 2nd product */}
          <div className="column">
            <div className="card-header">
              <div className="left">
                <div className="product-name">
                  Nike
                </div>
              </div>
              <div className="right">
                <div className="price">
                  <b>Total Sales:</b> $125,000
                </div>
              </div>
            </div>
            <div className="top-items">
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <span className="admin-icon red">#1</span>
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
                    <span className="admin-icon green">#2</span>
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
          {/* 3rd product */}
          <div className="column">
            <div className="card-header">
              <div className="left">
                <div className="product-name">
                  Samsung
                </div>
              </div>
              <div className="right">
                <div className="price">
                  <b>Total Sales:</b> $125,000
                </div>
              </div>
            </div>
            <div className="top-items">
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <span className="admin-icon red">#1</span>
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
                    <span className="admin-icon green">#2</span>
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

        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Top Stores
              </div>
              <div className="des">3 stores showing top performers</div>
            </div>
          </div>
          {/* 1st product */}
          <div className="column">
            <div className="card-header">
              <div className="left">
                <div className="product-name">
                  Downtown Flagship
                </div>
              </div>
              <div className="right">
                <div className="price">
                  <b>Total Sales:</b> $125,000
                </div>
              </div>
            </div>
            <div className="top-items">
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <span className="admin-icon red">#1</span>
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
                    <span className="admin-icon green">#2</span>
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
          {/* 2nd product */}
          <div className="column">
            <div className="card-header">
              <div className="left">
                <div className="product-name">
                  Mall Location
                </div>
              </div>
              <div className="right">
                <div className="price">
                  <b>Total Sales:</b> $125,000
                </div>
              </div>
            </div>
            <div className="top-items">
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <span className="admin-icon red">#1</span>
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
                    <span className="admin-icon green">#2</span>
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
          {/* 3rd product */}
          <div className="column">
            <div className="card-header">
              <div className="left">
                <div className="product-name">
                  Suburban Store
                </div>
              </div>
              <div className="right">
                <div className="price">
                  <b>Total Sales:</b> $125,000
                </div>
              </div>
            </div>
            <div className="top-items">
              <div className="items">
                <div className="left-side">
                  <div className="icon">
                    <span className="admin-icon red">#1</span>
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
                    <span className="admin-icon green">#2</span>
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
      </div>
    </div>
  );
};

export default Revenue;
