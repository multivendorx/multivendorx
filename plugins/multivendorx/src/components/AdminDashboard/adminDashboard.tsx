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
interface Payment {
  id: number;
  customer: string;
  amount: string;
  method: string;
  date: string;
  status: 'Paid' | 'Pending' | 'Failed';
}
// Custom marker icon (optional)
const salesIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="background:#5007aa;color:#fff;border-radius:50%;padding:6px 10px;font-size:12px;">$</div>`,
});

import "./adminDashboard.scss";
import "../dashboard.scss";
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
    { text: "Stores", iconClass: "icon-add", href: "#" },
    { text: "Commissions", iconClass: "icon-commission", href: "#" },
    { text: "Products", iconClass: "icon-product", href: "#" },
    { text: "Payouts", iconClass: "icon-payment", href: "#" },
    { text: "Disbursements", iconClass: "icon-payment", href: "#" },
    { text: "Customer Support", iconClass: "icon-payment", href: "#" },
  ];

const payments: Payment[] = [
  {
    id: 1,
    customer: "John Doe",
    amount: "$380",
    method: "Credit Card",
    date: "2025-09-01",
    status: "Paid",
  },
  {
    id: 2,
    customer: "Jane Smith",
    amount: "$120",
    method: "PayPal",
    date: "2025-09-03",
    status: "Pending",
  },
  {
    id: 3,
    customer: "Robert Brown",
    amount: "$220",
    method: "Bank Transfer",
    date: "2025-09-05",
    status: "Failed",
  },
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
                  <i className="adminlib-rules"></i>
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
                  <i className="adminlib-person"></i>
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
                  <i className="adminlib-security"></i>
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
                  <i className="adminlib-calendar"></i>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="column">
            <div className="card-header">
              <div className="left">
                <div className="title">
                  Payments
                </div>
              </div>
              <div className="right">
                <span>Updated 1 month ago</span>
              </div>
            </div>
            <div className="top-items">
              {payments.map((payment) => (
                <div className="items" key={payment.id}>
                  <div className="left-side">
                    <div className="image">
                      {/* <img src={payment.image} alt={payment.customer} /> */}
                    </div>
                    <div className="details">
                      <div className="item-title">{payment.customer}</div>
                      <div className="sub-text">{payment.method}</div>
                    </div>
                  </div>
                  <div className="right-side">
                    <div className="price">{payment.amount}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="column">
            <div className="card-header">
              <div className="left">
                <div className="title">
                  Notification
                </div>
              </div>
              <div className="right">
                <span>Updated 1 month ago</span>
              </div>
            </div>
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
          <div className="column">
            <div className="card-header">
              <div className="left">
                <div className="title">
                  Quick Link
                </div>
                <div className="des">Lorem ipsum dolor sit amet.</div>
              </div>
              <div className="right">
                <i className="adminlib-more-vertical"></i>
              </div>
            </div>
            <div className="quick-links-wrapper">
              {quickLinks.map((link, index) => (
                <a href={link.href} className="admin-btn btn-purple" key={index}>
                  <i className={link.iconClass}></i> {link.text}
                </a>
              ))}
            </div>

            <div className="card-header">
              <div className="left">
                <div className="title">
                  Sales by Locations
                </div>
                <div className="des">Lorem ipsum dolor sit amet.</div>
              </div>
              <div className="right">
                <i className="adminlib-more-vertical"></i>
              </div>
            </div>
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

        {/* recent activity */}
        <div className="row">
          <div className="column">
            <div className="card-header">
              <div className="left">
                <div className="title">
                  Top Sellers
                </div>
                <div className="des">Lorem ipsum dolor sit amet.</div>
              </div>
              <div className="right">
                <i className="adminlib-more-vertical"></i>
              </div>
            </div>
            <TopSellers />
          </div>
          <div className="column ">
            <div className="chart-wrapper">
              <div className="card-header">
                <div className="left">
                  <div className="title">
                    System Overview
                  </div>
                  <div className="des">Lorem ipsum dolor sit amet.</div>
                </div>
                <div className="right">
                  <i className="adminlib-more-vertical"></i>
                </div>
              </div>
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


        {/* chart */}
        <div className="row">
          <div className="column w-65">
            <div className="card-header">
              <div className="left">
                <div className="title">
                  Revenue Trend (Last 7 Months)
                </div>
                <div className="des">Lorem ipsum dolor sit amet.</div>
              </div>
              <div className="right">
                <i className="adminlib-more-vertical"></i>
              </div>
            </div>
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
            <div className="card-header">
              <div className="left">
                <div className="title">
                  Best Selling Products
                </div>
                <div className="des">Lorem ipsum dolor sit amet.</div>
              </div>
              <div className="right">
                <i className="adminlib-more-vertical"></i>
              </div>
            </div>
            <BestSellingProducts />
          </div>
        </div>

        <div className="row">

          <div className="column">
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
          </div>
        </div>

        <div className="row">
          <div className="column w-35">
            <div className="card-header">
              <div className="left">
                <div className="title">
                  This is what you get
                </div>
                <div className="des">Lorem ipsum dolor sit amet.</div>
              </div>
              <div className="right">
                <i className="adminlib-more-vertical"></i>
              </div>
            </div>

            <div className="activity-wrapper">
              {items.map((item, index) => (
                <div className={`activity ${item.active ? "" : "inactive"}`} key={index}>
                  <span className="icon">
                    <i className={item.active ? "adminlib-check" : "adminlib-close"}></i>
                  </span>
                  <div className={`details ${item.active ? "" : "inactive"}`}>
                    {item.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default AdminDashboard;
