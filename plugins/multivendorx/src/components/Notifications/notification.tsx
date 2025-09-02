import { AdminBreadcrumbs } from 'zyra';
import WithdrawalRequests from './withdrawalRequests';
import Products from './products';
import Vendors from './vendors';
import Coupons from './coupon';
import Transactions from './transaction';

const Notification = () => {
    const workboardStats = [
        {
            id: 'reviews',
            label: 'Pending Products',
            count: 12,
        },
        {
            id: 'reviews',
            label: 'Pending Vendors',
            count: 12,
        },
        {
            id: 'reviews',
            label: 'Pending Coupons',
            count: 12,
        },
        {
            id: 'reviews',
            label: 'Pending Transaction',
            count: 12,
        },
    ];

    const withdrawalExtraStats = [
        { id: 'reverse', label: 'Reverse Withdrawal', value: '₹0.00' },
        { id: 'collected', label: 'Total Collected', value: '₹25,440.00' },
        { id: 'remaining', label: 'Remaining Balance', value: '₹12,850.00' },
        { id: 'transactions', label: 'Total Transactions', value: '156' },
    ];

    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-cart"
                tabTitle="Notification Dashboard"
            />

            {/* Workboard Stats */}
            <div className="work-board">
                <div className="row store-card">
                    {workboardStats.map(stat => (
                        <div className="column" key={stat.id}>
                            <div className="cards">
                                <span className="value">{stat.count}</span>
                                <span className="name">{stat.label}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sections */}
                <div className="title-wrapper">
                    <i className="adminlib-storefront"></i>
                    <h2>Products</h2>
                </div>
                <Products />

                <div className="title-wrapper">
                    <i className="adminlib-support"></i>
                    <h2>Vendors</h2>
                </div>
                <Vendors />

                <div className="title-wrapper">
                    <i className="adminlib-credit-card"></i>
                    <h2>Coupons</h2>
                </div>
                <Coupons/>
                <div className="title-wrapper">
                    <i className="adminlib-credit-card"></i>
                    <h2>Transaction</h2>
                </div>
                <Transactions/>
                {/* Extra stats specific to Withdrawal Requests */}
                <div className="row ">
                    {withdrawalExtraStats.map(stat => (
                        <div className="column" key={stat.id}>
                            <div className="cards">
                                <span className="value">{stat.value}</span>
                                <span className="name">{stat.label}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <WithdrawalRequests />

            </div>
        </>
    );
};

export default Notification;
