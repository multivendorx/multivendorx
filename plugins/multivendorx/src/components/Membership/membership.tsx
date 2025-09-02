import { Link, useLocation } from 'react-router-dom';
import { Tabs } from 'zyra';
import Brand from '../../../assets/images/brand-logo.png';
import BrandSmall from '../../../assets/images/brand-icon.png';
import MessageAndMail from './messageAndMail';


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
                name: 'Message/ Mails',
                desc: 'PayPal MassPay lets you pay out a large number of affiliates very easily and quickly.',
                icon: 'adminlib-credit-card',
            },
        },
        {
            type: 'file',
            content: {
                id: 'payment-membership-design',
                name: 'Design Template',
                desc: 'PayPal Payout makes it easy for you to pay multiple sellers at the sametime.',
                icon: 'adminlib-credit-card',
            },
        },
        {
            type: 'file',
            content: {
                id: 'payment-membership-subscribers',
                name: 'Subscribers',
                desc: 'Connect to vendors stripe account and make hassle-free transfers as scheduled.',
                icon: 'adminlib-credit-card',
            },
        },
        {
            type: 'file',
            content: {
                id: 'payment-membership-plans',
                name: 'Plans',
                desc: 'Connect to vendors stripe account and make hassle-free transfers as scheduled',
                icon: 'adminlib-credit-card',
            },
        },
    ];

    const getForm = (tabId: string) => {
        switch (tabId) {
            case 'payment-membership-message':
                return <MessageAndMail id=''/>;
            case 'payment-membership-design':
                return <h1>design</h1>;
            case 'payment-membership-subscribers':
                return <h1>Subscriber</h1>;
            case 'payment-membership-plans':
                return <h1>Plans</h1>;
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
                // brandImg={Brand}
                // smallbrandImg={BrandSmall}
                Link={Link}
                settingName={'Memberships'}
            />
        </>
    );
};

export default Memberships;
