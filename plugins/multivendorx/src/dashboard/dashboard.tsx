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
import './dashboardCommon.scss';

const salesByLocations = [
  { name: "USA", coordinates: [40, -100], sales: 12000 },
  { name: "India", coordinates: [22, 78], sales: 8500 },
  { name: "UK", coordinates: [54, -2], sales: 6700 },
  { name: "Germany", coordinates: [51, 10], sales: 5400 },
  { name: "Australia", coordinates: [-25, 133], sales: 4300 },
];
const salesIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="background:#5007aa;color:#fff;border-radius:50%;padding:6px 10px;font-size:12px;">$</div>`,
});

const Dashboard = () => {
  return (
    <>
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
              </div><span className="icon">
                <i className="adminlib-dynamic-pricing"></i>
              </span>
            </div>
          </div>
        </div>
        <div className="column">
          <div className="cards">
            <div className="title-wrapper">
              <div>ACTIVE VENDORS</div><span className="text-green">+16.24%</span>
            </div>
            <div className="card-body">
              <div className="value"><span>184</span><a href="#">View all vendor</a></div><span
                className="icon"><i className="adminlib-dynamic-pricing"></i></span>
            </div>
          </div>
        </div>
        <div className="column">
          <div className="cards">
            <div className="title-wrapper">
              <div>TOTAL PRODUCTS</div><span className="text-red">-8.54%</span>
            </div>
            <div className="card-body">
              <div className="value"><span>7,892</span><a href="#">View all products</a></div><span
                className="icon"><i className="adminlib-dynamic-pricing"></i></span>
            </div>
          </div>
        </div>
        <div className="column">
          <div className="cards">
            <div className="title-wrapper">
              <div>ORDERS THIS MONTH</div><span className="">+0.00%</span>
            </div>
            <div className="card-body">
              <div className="value"><span>3892</span><a href="#">View all order</a></div><span
                className="icon"><i className="adminlib-dynamic-pricing"></i></span>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="column">
          <h3>Top products</h3>
          <div className="activity-wrapper">

            <div className="activity product">
              <div className="product-name">
                <span className="icon"><i className="adminlib-cart"></i></span>
                <div className="details">Amazon Fire TV<span>$199</span>
                </div>
              </div>
              <div className="details">
                $2999
                <span>49 Sold</span>
              </div>

            </div>

            <div className="activity product">
              <div className="product-name">
                <span className="icon"><i className="adminlib-cart"></i></span>
                <div className="details">Amazon Fire TV<span>$199</span>
                </div>
              </div>
              <div className="details">
                $2583
                <span>49 Sold</span>
              </div>

            </div>

            <div className="activity product">
              <div className="product-name">
                <span className="icon"><i className="adminlib-cart"></i></span>
                <div className="details">Amazon Fire TV<span>$199</span>
                </div>
              </div>
              <div className="details">
                $99999
                <span>49 Sold</span>
              </div>

            </div>

            <div className="activity product">
              <div className="product-name">
                <span className="icon"><i className="adminlib-cart"></i></span>
                <div className="details">Amazon Fire TV<span>$199</span>
                </div>
              </div>
              <div className="details">
                $4599
                <span>4 Sold</span>
              </div>

            </div>

            <div className="activity product">
              <div className="product-name">
                <span className="icon"><i className="adminlib-cart"></i></span>
                <div className="details">Amazon Fire TV<span>$199</span>
                </div>
              </div>
              <div className="details">
                $2999
                <span>49 Sold</span>
              </div>

            </div>

          </div>
        </div>
        <div className="column">
          <h3>Recent Activity</h3>
          <div className="activity-wrapper">

            <div className="activity">
              <span className="icon"><i className="adminlib-cart"></i></span>
              <div className="details">
                Purchase by James Price
                <span>Product noise evolve smartwatch</span>
                <span className="date admin-badge yellow">25 Dec, 2021</span>
              </div>
            </div>

            <div className="activity">
              <span className="icon"><i className="adminlib-cart"></i></span>
              <div className="details">
                Natasha Carey have liked the products
                <span>Allow users to like products in your WooCommerce store.</span>
                <span className="date admin-badge yellow">25 Dec, 2021</span>
              </div>
            </div>

            <div className="activity">
              <span className="icon"><i className="adminlib-cart"></i></span>
              <div className="details">
                Purchase by James Price
                <span>Product noise evolve smartwatch</span>
                <span className="date admin-badge yellow">25 Dec, 2021</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="row">
        <div className="column">
          <h3>Top products</h3>
          <div className="activity-wrapper">

            <div className="activity">
              <div className="product-name">
                <span className="icon"><i className="adminlib-cart"></i></span>
                <div className="details">Amazon Fire TV<span>$199</span>
                </div>
              </div>
              <div className="details">
                $2999
                <span>49 Sold</span>
              </div>

            </div>

            <div className="activity">
              <div className="product-name">
                <span className="icon"><i className="adminlib-cart"></i></span>
                <div className="details">Amazon Fire TV<span>$199</span>
                </div>
              </div>
              <div className="details">
                $2583
                <span>49 Sold</span>
              </div>

            </div>

            <div className="activity">
              <div className="product-name">
                <span className="icon"><i className="adminlib-cart"></i></span>
                <div className="details">Amazon Fire TV<span>$199</span>
                </div>
              </div>
              <div className="details">
                $99999
                <span>49 Sold</span>
              </div>

            </div>

            <div className="activity">
              <div className="product-name">
                <span className="icon"><i className="adminlib-cart"></i></span>
                <div className="details">Amazon Fire TV<span>$199</span>
                </div>
              </div>
              <div className="details">
                $4599
                <span>4 Sold</span>
              </div>

            </div>

            <div className="activity">
              <div className="product-name">
                <span className="icon"><i className="adminlib-cart"></i></span>
                <div className="details">Amazon Fire TV<span>$199</span>
                </div>
              </div>
              <div className="details">
                $2999
                <span>49 Sold</span>
              </div>

            </div>

            <div className="activity">
              <div className="product-name">
                <span className="icon"><i className="adminlib-cart"></i></span>
                <div className="details">Amazon Fire TV<span>$199</span>
                </div>
              </div>
              <div className="details">
                $2999
                <span>25 Sold</span>
              </div>

            </div>

          </div>
        </div>
        <div className="column">
          <h3>Recent Activity</h3>
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
    </>
  );
};

export default Dashboard;
