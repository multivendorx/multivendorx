import { AdminBreadcrumbs } from 'zyra';
import StoreSupport from './storeSupport';
import RefundRequest from './refundRequest';
import AbuseReports from './abuseReports';
import StoreReviews from './storeReviews ';
import './customerServices.scss';

const CustomerServices = () => {
    const CustomerServicesStats = [
        {
            id: 'reviews',
            label: 'Pending Reviews',
            count: 12,
        },
        {
            id: 'support',
            label: 'Open Support Tickets',
            count: 5,
        },
        {
            id: 'withdrawals',
            label: 'Withdrawal Requests',
            count: 8,
        },
        {
            id: 'refunds',
            label: 'Refund Requests',
            count: 3,
        },
        {
            id: 'abuse',
            label: 'Abuse Reports',
            count: 2,
        },
    ];

    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-cart"
                tabTitle="Customer Service"
            />

            {/* CustomerServices Stats */}
            <div className="work-board">
                <div className="row store-card">
                    {CustomerServicesStats.map(stat => (
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
                    <h2>Store Reviews</h2>
                </div>
                <StoreReviews />

                <div className="title-wrapper">
                    <i className="adminlib-support"></i>
                    <h2>Store Support</h2>
                </div>
                <StoreSupport />

                <div className="title-wrapper">
                    <i className="adminlib-captcha-automatic-code"></i>
                    <h2>Refund Requests</h2>
                </div>
                <RefundRequest />

                <div className="title-wrapper">
                    <i className="adminlib-folder-open"></i>
                    <h2>Abuse Reports</h2>
                </div>
                <AbuseReports />
            </div>
        </>
    );
};

export default CustomerServices;
