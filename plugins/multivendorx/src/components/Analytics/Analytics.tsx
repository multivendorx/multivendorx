import { useLocation } from 'react-router-dom';
import { AdminBreadcrumbs, SelectInput } from 'zyra';
import { useEffect, useRef, useState } from 'react';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const salesByLocations = [
  { name: "USA", coordinates: [40, -100], sales: 12000 },
  { name: "India", coordinates: [22, 78], sales: 8500 },
  { name: "UK", coordinates: [54, -2], sales: 6700 },
  { name: "Germany", coordinates: [51, 10], sales: 5400 },
  { name: "Australia", coordinates: [-25, 133], sales: 4300 },
];

// Custom marker icon (optional)
const salesIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="background:#5007aa;color:#fff;border-radius:50%;padding:6px 10px;font-size:12px;">$</div>`,
});

// import "./adminDashboard.scss";
import "../../dashboard/dashboardCommon.scss";
import Overview from './Overview';
import Transactions from './Payout';
import Revenue from './Revenue';
import RefundedOrders from './RefundedOrders';
import StoreOrders from './StoreOrders';
import RevenueOld from './RevenueOld';
import RefundedOrderOld from './RefundedOrderOld';

const Analytics = () => {
  const location = useLocation();
  const hash = location.hash;
  const isTabActive = hash.includes('tab=dashboard');

  // Dummy chart data
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
  const overview = [
    {
      id: 'earnings',
      label: 'Net Product',
      count: "7896",
      icon: 'adminlib-support green',
    },
    {
      id: 'Vendors',
      label: 'Admin Commission',
      count: "85669",
      icon: 'adminlib-global-community blue',
    },
    {
      id: 'Pending Withdrawals',
      label: 'Vendor Payout Pending',
      count: "88200",
      icon: 'adminlib-calendar red',
    },
    {
      id: 'Pending Withdrawals',
      label: 'Amount Refunds',
      count: "600",
      icon: 'adminlib-calendar green',
    },
    {
      id: 'Pending Withdrawals',
      label: 'No. of refunds',
      count: "600",
      icon: 'adminlib-calendar blue',
    },

  ];
  const pieData = [
    { name: "Admin Net Earning", value: 1200 },
    { name: "Vendor Commission", value: 2400 },
    { name: "Vendor Net Commission", value: 800 },
    { name: "Sub Total", value: 200 },
    { name: "Shipping", value: 200 },
  ];
  const [activeTab, setActiveTab] = useState("overview");
  const tabs = [
    { id: "overview", label: "Marketplace Report", content: <Overview overview={overview} data={data} overviewData={overviewData} pieData={pieData} /> },
    { id: "revenue", label: "Product Report", content: <Revenue /> },
    { id: "payout", label: "Store Report", content: <Transactions /> },
    // { id: "refundedOrders", label: "Traffic & Conversion", content: <RefundedOrders /> },
    // { id: "RevenueOld", label: "Revenue", content: <RevenueOld /> },
    { id: "StoreOrders", label: "Store Orders", content: <StoreOrders /> },
    { id: "RefundedOrderOld", label: "Refunded Order", content: <RefundedOrderOld /> },
  ];

  const COLORS = ["#5007aa", "#00c49f", "#ff7300", "#d400ffff", "#004ec4ff"];
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (

    <>
      <AdminBreadcrumbs
        activeTabIcon="adminlib-analytics"
        tabTitle="Analytics"
        description={'Manage all pending administrative actions including approvals, payouts, and notifications.'}

      />
      <div className="admin-dashboard tab">

        <div className="row ">
          {/* Tab Titles */}
          <div className="card-header">
            <div className="left">
              <div className="tab-titles">
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={`title ${activeTab === tab.id ? "active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <p>{tab.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {tabs.map(
          (tab) =>
            activeTab === tab.id && (
              <div key={tab.id} className="tab-panel">
                {tab.content}
              </div>
            )
        )}

      </div>
    </>
  );
};

export default Analytics;
