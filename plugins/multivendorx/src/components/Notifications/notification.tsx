import { AdminBreadcrumbs, getApiLink } from 'zyra';
import Products from './products';
import Vendors from './vendors';
import Coupons from './coupon';
import Transactions from './transaction';
import { useEffect, useState } from 'react';
import axios from 'axios';

const Notification = () => {
    const [productCount, setProductCount] = useState<number>(0);
    const [couponCount, setCouponCount] = useState<number>(0);
    const [transactionCount, setTransactionCount] = useState<number>(0);
    const [storeCount, setStoreCount] = useState<number>(0);

    const [activeTab, setActiveTab] = useState("products");


    const tabs = [
        { id: "products", label: "Products", content: <Products /> },
        { id: "stores", label: "Stores", content: <Vendors /> },
        { id: "coupons", label: "Coupons", content: <Coupons /> },
        { id: "transactions", label: "Transaction", content: <Transactions /> },
    ];
    // Fetch total rows on mount
    useEffect(() => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'products'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true },
        })
            .then((response) => {
                setProductCount(response.data || 0);
            })

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'coupons'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true },
        })
            .then((response) => {
                setCouponCount(response.data || 0);
            })
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'store'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { count: true, status: 'pending' },
        })
            .then((response) => {
                setStoreCount(response.data || 0);
            })
    }, []);

    const tasks = [
        {
            id: 1,
            title: "Fix login bug",
        },
        {
            id: 2,
            title: "Update dashboard UI",
        },
        {
            id: 3,
            title: "Write unit tests",
            priority: "Low",
            dueDate: "2025-09-20",
        },
        {
            id: 4,
            title: "Deploy staging server",
        },
    ];
    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-bar-chart"
                tabTitle="Actions Dashboard"
                description={'Manage all pending administrative actions including approvals, payouts, and notifications.'}
            />

            {/* Workboard Stats */}
            <div className="work-board">

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
                        <div className="overview-card-wrapper">
                            <div className="action">
                                <div className="title">
                                    {productCount}
                                    <i className="adminlib-cart"></i>
                                </div>
                                <div className="description">
                                    Pending Products
                                </div>
                            </div>
                            <div className="action">
                                <div className="title">
                                    {storeCount}
                                    <i className="adminlib-tools"></i>
                                </div>
                                <div className="description">
                                    Pending Stores
                                </div>
                            </div>
                        </div>
                        <div className="overview-card-wrapper">
                            <div className="action">
                                <div className="title">
                                    {couponCount}
                                    <i className="adminlib-catalog"></i>
                                </div>
                                <div className="description">
                                    Pending Coupons
                                </div>
                            </div>
                            <div className="action">
                                <div className="title">
                                    {transactionCount}
                                    <i className="adminlib-module"></i>
                                </div>
                                <div className="description">
                                    Pending Transaction
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="column">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Tasks
                                </div>
                            </div>
                            <div className="right">
                                <div className="admin-btn btn-purple">
                                    <i className="adminlib-plus-circle-o"></i>
                                    Add task
                                </div>
                            </div>
                        </div>
                        <div className="task-manager">

                            {/* Task Table */}
                            <table className="task-table">
                                <tbody>
                                    {tasks.map((task) => (
                                        <tr
                                            key={task.id}
                                            className="task-row"
                                            onClick={() => setShowDetails(task)}
                                        >
                                            <td>{task.title}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
                        <div className="notification-wrapper">
                            <ul>
                                <li>
                                    <div className="icon-wrapper">
                                        <i className="adminlib-form-paypal-email blue"></i>
                                    </div>
                                    <div className="details">
                                        <div className="notification-title">Lorem ipsum dolor sit amet.</div>
                                        <div className="des">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</div>
                                        <span>1d ago</span>
                                    </div>

                                </li>
                                <li>
                                    <div className="icon-wrapper">
                                        <i className="adminlib-mail orange"></i>
                                    </div>
                                    <div className="details">
                                        <div className="notification-title">Lorem ipsum dolor sit amet.</div>
                                        <div className="des">Lorem ipsum dolor sit amet, consectetur adipisicing elit</div>
                                        <span>34min ago</span>
                                    </div>
                                </li>
                                <li>
                                    <div className="icon-wrapper">
                                        <i className="adminlib-form-paypal-email green"></i>
                                    </div>
                                    <div className="details">
                                        <div className="notification-title">Lorem ipsum dolor sit amet.</div>
                                        <div className="des">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</div>
                                        <span>34min ago</span>
                                    </div>
                                </li>
                                <li>
                                    <div className="icon-wrapper">
                                        <i className="adminlib-calendar red"></i>
                                    </div>
                                    <div className="details">
                                        <div className="notification-title">Lorem ipsum dolor sit amet.</div>
                                        <div className="des">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</div>
                                        <span>34min ago</span>
                                    </div>
                                </li>
                            </ul>

                            <div className="buttons-wrapper">
                                <div className="admin-btn btn-purple">
                                    <i className="adminlib-eye"></i>
                                    Show all notification
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="column">
                        <div className="action-tab-wrapper">
                            <div className="card-header">
                                <div className="left">
                                    <div className="title">
                                        Account Overview
                                    </div>
                                </div>
                                <div className="right">
                                    <i className="adminlib-more-vertical"></i>
                                </div>
                            </div>
                            {/* Tab Titles */}
                            <div className="tab-titles">
                                {tabs.map((tab) => (
                                    <div
                                        key={tab.id}
                                        className={`title ${activeTab === tab.id ? "active" : ""}`}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        <p><i className="adminlib-cart"></i>{tab.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="tab-content">
                                {tabs.map(
                                    (tab) =>
                                        activeTab === tab.id && (
                                            <div key={tab.id} className="tab-panel">
                                                {tab.content}
                                            </div>
                                        )
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

export default Notification;