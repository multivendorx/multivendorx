import { Link, useLocation } from 'react-router-dom';
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

import "./adminDashboard.scss";
import "../../dashboard/dashboardCommon.scss";
import BestSellingProducts from './bestSellingProducts';
import TopSellers from './topSellers';

const AdminDashboard = () => {
  const location = useLocation();
  const hash = location.hash;
  const isTabActive = hash.includes('tab=dashboard');

  // Dummy chart data
  const data = [
    { month: 'Jan', revenue: 4000 },
    { month: 'Feb', revenue: 3000 },
    { month: 'Mar', revenue: 5000 },
    { month: 'Apr', revenue: 4780 },
    { month: 'May', revenue: 5890 },
    { month: 'Jun', revenue: 4390 },
    { month: 'Jul', revenue: 6490 },
  ];
  const overviewData = [
    { name: 'Pending Approvals', value: 18 },
    { name: 'Active Disputes', value: 5 },
    { name: 'Low Stock Items', value: 42 },
    { name: 'Pending Payouts', value: 9 },
  ];
  const COLORS = ['#4CAF50', '#FF9800', '#F44336', '#2196F3'];
  const items = [
    { text: "Set up seller Registration Form Fields", active: true },
    { text: "Set up payments", active: true },
    { text: "Set up taxes", active: false },
    { text: "Set up shipping", active: true },
    { text: "Set up commissions", active: false },
    { text: "Set up product capabilities", active: true },
    { text: "Set up allowed product types", active: true },
    { text: "Set up commissions", active: false },
    { text: "Set up product capabilities", active: true },
    { text: "Set up allowed product types", active: true },
  ];
  const resources = [
    {
      title: "Documentation",
      desc: "Step-by-step guides to set up and manage your marketplace.",
      iconClass: "adminlib-book",
      linkText: "Explore Docs",
      href: "#",
    },
    {
      title: "Expert Consultation",
      desc: "Get tailored advice from our marketplace specialists.",
      iconClass: "adminlib-preview",
      linkText: "Book Consultation",
      href: "#",
    },
    {
      title: "Developer Community",
      desc: "Connect with our team and fellow builders on Discord.",
      iconClass: "adminlib-global-community",
      linkText: "Join Discord",
      href: "#",
    },
    {
      title: "Facebook Group",
      desc: "Share experiences and tips with other marketplace owners.",
      iconClass: "adminlib-user-circle",
      linkText: "Join Group",
      href: "#",
    },
  ];

  const quickLinks = [
    { text: "Add Vendor", iconClass: "icon-add", href: "#" },
    { text: "Commission", iconClass: "icon-commission", href: "#" },
    { text: "Add Product", iconClass: "icon-product", href: "#" },
    { text: "Payment", iconClass: "icon-payment", href: "#" },
  ];
  return (
    <>
      <div className="admin-dashboard">

        {/* header */}
        <div className="header">
          <div className="title-wrapper">
            <div className="title">Welcome back, Admin!</div>
            <div className="des">Here's what's happening with your marketplace today</div>
          </div>
          {/* <button className="admin-btn btn-purple"><i className="adminlib-plus-circle-o"></i>Add Product</button> */}
        </div>

        {/* cards */}
        <div className="row">
          <div className="column">
            <div className="cards">
              <div className="title-wrapper">
                <div>TOTAL REVENUE</div>
                <span className="text-green">+16.24%</span>
              </div>
              <div className="card-body">
                <div className="value">
                  <span>$47,892</span>
                  <a href="#">View net revenue</a>
                </div>
                <span className="icon">
                  <i className="adminlib-dynamic-pricing"></i>
                </span>
              </div>
            </div>
          </div>

          <div className="column">
            <div className="cards">
              <div className="title-wrapper">
                <div>ACTIVE VENDORS</div>
                <span className="text-green">+16.24%</span>
              </div>
              <div className="card-body">
                <div className="value">
                  <span>184</span>
                  <a href="#">View all vendor</a>
                </div>
                <span className="icon">
                  <i className="adminlib-dynamic-pricing"></i>
                </span>
              </div>
            </div>
          </div>

          <div className="column">
            <div className="cards">
              <div className="title-wrapper">
                <div>TOTAL PRODUCTS</div>
                <span className="text-red">-8.54%</span>
              </div>
              <div className="card-body">
                <div className="value">
                  <span>7,892</span>
                  <a href="#">View all products</a>
                </div>
                <span className="icon">
                  <i className="adminlib-dynamic-pricing"></i>
                </span>
              </div>
            </div>
          </div>

          <div className="column">
            <div className="cards">
              <div className="title-wrapper">
                <div>ORDERS THIS MONTH</div>
                <span className="">+0.00%</span>
              </div>
              <div className="card-body">
                <div className="value">
                  <span>3892</span>
                  <a href="#">View all order</a>
                </div>
                <span className="icon">
                  <i className="adminlib-dynamic-pricing"></i>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* chart */}
        <div className="row">
          <div className="column w-65">
            <h3>Revenue Trend (Last 7 Months)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#5007aa" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="column w-35">
            <h3>Sales by Locations</h3>
            <MapContainer
              center={[20, 0]}
              zoom={2}
              style={{ height: "300px", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {salesByLocations.map(({ name, coordinates, sales }) => (
                <Marker
                  key={name}
                  position={coordinates as [number, number]}
                  icon={salesIcon}
                >
                  <Popup>
                    <strong>{name}</strong>
                    <br />
                    Sales: ${sales}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* table */}
        <div className="row">
          <div className="column">
            <h3>Best Selling Products</h3>
            <BestSellingProducts />
          </div>
          <div className="column ">
            <div className="chart-wrapper">
              <h3>Top Sellers</h3>
              <TopSellers />
            </div>
          </div>
        </div>

        {/* recent activity */}
        <div className="row">
          <div className="column">
            <h3>Recent Activity</h3>

            <div className="activity-wrapper">
              <div className="activity">
                <span className="icon">
                  <i className="adminlib-cart"></i>
                </span>
                <div className="details">
                  New product "Wireless Gaming Headset" added by TechWorld
                  <span>2 minutes ago</span>
                </div>
              </div>
              <div className="activity">
                <span className="icon">
                  <i className="adminlib-star"></i>
                </span>
                <div className="details">
                  5-star review received for "Smartphone Case" by MobileGear
                  <span>2 minutes ago</span>
                </div>
              </div>
              <div className="activity">
                <span className="icon">
                  <i className="adminlib-global-community"></i>
                </span>
                <div className="details">

                  New vendor "Fashion Forward" completed registration
                  <span>2 minutes ago</span>
                </div>
              </div>
              <div className="activity">
                <span className="icon">
                  <i className="adminlib-cart"></i>
                </span>
                <div className="details">
                  Commission payment of $2,847 processed for ElectroHub
                  <span>2 minutes ago</span>
                </div>
              </div>
            </div>

          </div>
          <div className="column ">
            <div className="chart-wrapper">
              <h3>System Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={overviewData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#5007aa" barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* last */}
        <div className="row">
          <div className="column w-35">
            <h3>This is what you get</h3>

            <div className="activity-wrapper">
              {items.map((item, index) => (
                <div className="activity" key={index}>
                  <span className="icon">
                    <i className={item.active ? "adminlib-check" : "adminlib-close"}></i>
                  </span>
                  <div className="details">
                    {item.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="column w-65">
        {/* Left column - 60% */}
          <div className="cards-wrapper">
            {resources.map((res, index) => (
              <div className="cards" key={index}>
                <i className={res.iconClass}></i>
                <h3>{res.title}</h3>
                <p>{res.desc}</p>
                <a href={res.href} target="blank">
                  {res.linkText}
                </a>
              </div>
            ))}
          </div>

        {/* Right column - 40%: Quick Links */}

        <div className="quick-link">

          <h3>Quick Link</h3>
          <div className="quick-links-wrapper">
            {quickLinks.map((link, index) => (
              <a href={link.href} className="admin-btn btn-purple" key={index}>
                <i className={link.iconClass}></i> {link.text}
              </a>
            ))}
          </div>
        </div>
    </div>
        </div>

      </div>
    </>
  );
};

export default AdminDashboard;
