import { AdminBreadcrumbs } from 'zyra';
import StoreSupport from './storeSupport';
import RefundRequest from './refundRequest';
import AbuseReports from './abuseReports';
import StoreReviews from './storeReviews ';
import './customerServices.scss';
import '../AdminDashboard/adminDashboard.scss';
import Qna from './qnaTable';

const CustomerServices = () => {

    const CustomerServicesStats = [
        {
            id: 'reviews',
            label: 'Pending Reviews',
            count: 12,
            icon: 'adminlib-star',
        },
        {
            id: 'support',
            label: 'Open Support Tickets',
            count: 5,
            icon: 'adminlib-support',
        },
        {
            id: 'withdrawals',
            label: 'Withdrawal Requests',
            count: 8,
            icon: 'adminlib-global-community',
        },
        {
            id: 'refunds',
            label: 'Refund Requests',
            count: 3,
            icon: 'adminlib-catalog',
        },
        {
            id: 'abuse',
            label: 'Abuse Reports',
            count: 2,
            icon: 'adminlib-calendar',
        },
    ];

    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-customer-service"
                tabTitle="Customer Service"
                description={'Manage store reviews, support requests, financial transactions, and reported issues.'}
            />
            <div className="work-board">
                <div className="row">
                    <div className="overview-card-wrapper">
                        {CustomerServicesStats.map(stat => (
                            <div className="action" key={stat.id}>
                                <div className="title">
                                    {stat.count}
                                    <i className={stat.icon}></i>
                                </div>
                                <div className="description">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="row">
                    <div className="column">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Store Reviews
                                </div>
                                <div className="des">Lorem ipsum dolor sit amet.</div>
                            </div>
                            <div className="right">
                                <i className="adminlib-more-vertical"></i>
                            </div>
                        </div>
                        <StoreReviews />
                    </div>
                </div>

                <div className="row">
                    <div className="column">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Refund Requests
                                </div>
                                <div className="des">Lorem ipsum dolor sit amet.</div>
                            </div>
                            <div className="right">
                                <i className="adminlib-more-vertical"></i>
                            </div>
                        </div>
                        <RefundRequest />
                    </div>
                    <div className="column">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Abuse Reports
                                </div>
                                <div className="des">Lorem ipsum dolor sit amet.</div>
                            </div>
                            <div className="right">
                                <i className="adminlib-more-vertical"></i>
                            </div>
                        </div>
                        <AbuseReports />
                    </div>
                </div>
                <Qna/>
            </div>
        </>
    );
};

export default CustomerServices;
