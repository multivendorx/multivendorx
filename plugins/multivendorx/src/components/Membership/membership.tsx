import { Link, useLocation } from 'react-router-dom';
import { Tabs } from 'zyra';

import MessageAndMail from './messageAndMail';
import MultivendorxProFeatures from './MultivendorxProFeatures';


const Memberships = () => {
    const location = useLocation();
    const hash = location.hash.replace(/^#/, '');

    const hashParams = new URLSearchParams(hash);
    const currentTab = hashParams.get('subtab') || 'payment-membership-message';

    const prepareUrl = (tabId: string) => `?page=multivendorx#&tab=memberships&subtab=${tabId}`;

    const tabData = [
        {
            type: 'file',
            content: {
                id: 'payment-membership-message',
                name: 'Basic Plan Details',
                desc: 'Site errors and events are logged for easy troubleshooting.',
                icon: 'adminlib-credit-card',
                hideTabHeader: true,
            },
        },
        {
            type: 'file',
            content: {
                id: 'payment-membership-design',
                name: 'MultivendorX Pro Features',
                desc: 'PayPal Payout makes it easy for you to pay multiple sellers at the sametime.',
                icon: 'adminlib-credit-card',
            },
        },
    ];

    const getForm = (tabId: string) => {
        switch (tabId) {
            case 'payment-membership-message':
                return <MessageAndMail id='' />;
            case 'payment-membership-design':
                return <MultivendorxProFeatures />;
            default:
                return <div></div>;
        }
    };

    return (
        <>
            <Tabs
                tabData={tabData}
                currentTab={currentTab}
                getForm={getForm}
                prepareUrl={prepareUrl}
                appLocalizer={appLocalizer}
                Link={Link}
                settingName={'Memberships'}
            />
        </>
    );
};

export default Memberships;