import { Link } from 'react-router-dom';
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
import "./ViewStore.scss";
import "../AdminDashboard/AdminDashboard.scss";
import BannerImg from '../../assets/images/banner-placeholder.jpg';
import { AdminBreadcrumbs } from 'zyra';

const ViewStore = () => {
  const overviewData = [
    { name: 'Total Products', value: 18 },
    { name: 'Product sold', value: 6 },
    { name: 'Store Visitors', value: 42 },
    { name: 'Reviews', value: 9 },
  ];
  const COLORS = ['#4CAF50', '#FF9800', '#F44336', '#2196F3'];
  return (
    <>
      <AdminBreadcrumbs
        activeTabIcon="adminlib-storefront"
        tabTitle="View Store"
        buttons={[
          {
            label: 'Back',
            onClick: () => window.location.assign('?page=multivendorx#&tab=stores'),
            className: 'admin-btn btn-purple'
          }
        ]}
      />

      <div className="store-view-wrapper">
        <div className="store-header row">
          <div className="column profile-section">
            <span className="avater"><img src="https://99designs-blog.imgix.net/blog/wp-content/uploads/2022/06/Starbucks_Corporation_Logo_2011.svg-e1657703028844.png?auto=format&q=60&fit=max&w=930" /></span>
            <div className="name">Lorem ipsum</div>
            <div className="des">Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim, facere delectus reprehenderit facilis dolore, ipsum esse fugiat praesentium, perspiciatis impedit laboriosam ex? Deserunt, qui ipsam.</div>
            <div className="details">
              <i className="adminlib-wholesale"></i>
              Lorem ipsum dolor sit amet.
            </div>
            <div className="details">
              <i className="adminlib-form-phone"></i>
              + 9874563210
            </div>
            <div className="details">
              <i className="adminlib-mail"></i>
              store@gmail.com
            </div>
            <div className="review">
              <i className="adminlib-star"></i>
              <i className="adminlib-star"></i>
              <i className="adminlib-star"></i>
              <i className="adminlib-star"></i>
              <i className="adminlib-star"></i>
            </div>
            <div className="buttons">
              <a className="admin-btn btn-purple"><i className="adminlib-mail"></i> Send Mail</a>
            </div>
          </div>

          <div
            className="column store-image"
            style={{ backgroundImage: `url('https://cdn.vectorstock.com/i/500p/57/56/shopping-cart-banner-online-store-vector-42935756.jpg')` }}
          >
            {/* <img src="https://res.cloudinary.com/walden-global-services/image/upload/v1544584558/dandelion/29.jpg" alt="" /> */}
          </div>

        </div>

        <div className="row">
          <div className="column">
            <div className="cards">
              <div className="title-wrapper">
                <div>ORDERS PROCESSED</div>
                <span className="text-green">+16.24%</span>
              </div>
              <div className="card-body">
                <div className="value">
                  <span>47,892</span>
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
                <div>GROSS SALES</div>
                <span className="text-green">+16.24%</span>
              </div>
              <div className="card-body">
                <div className="value">
                  <span>$184</span>
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
                <div>TOTAL EARNINGS</div>
                <span className="text-red">-8.54%</span>
              </div>
              <div className="card-body">
                <div className="value">
                  <span>$7,892</span>
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
                <div>CURRENT BALANCE</div>
                <span className="">+0.00%</span>
              </div>
              <div className="card-body">
                <div className="value">
                  <span>$3892</span>
                  <a href="#">View all order</a>
                </div>
                <span className="icon">
                  <i className="adminlib-dynamic-pricing"></i>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="row">

          <div className="column">
            <h3>Badge Acquired</h3>

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
            <div className="chart-box">
              <h3>Products</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={overviewData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label
                  >
                    {overviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </>
  );
};

export default ViewStore;
