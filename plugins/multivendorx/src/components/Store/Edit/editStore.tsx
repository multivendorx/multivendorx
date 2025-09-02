import { Link, useLocation } from 'react-router-dom';
import { Tabs } from 'zyra';
import Brand from '../../../assets/images/brand-logo.png';
import BrandSmall from '../../../assets/images/brand-icon.png';
import StoreSettings from './storeSettings';

import PaymentSettings from './paymentSettings';
import StoreQueue from './storeCrew';
import PolicySettings from './policySettings';
import ShippingSettings from './shippingSettings';
import StoreRegistration from './storeRegistrationForm';

const EditStore = () => {
    const location = useLocation();
    const hash = location.hash.replace(/^#/, '');

    const editParts = hash.match(/edit\/(\d+)/);
    const editId = editParts ? editParts[1] : null;

    const hashParams = new URLSearchParams(hash);
    const currentTab = hashParams.get('subtab') || 'store';

    const prepareUrl = (tabId: string) => `?page=multivendorx#&tab=stores&edit/${editId}/&subtab=${tabId}`;

    const tabData = [
        {
            type: 'file',
            content: {
                id: 'store',
                name: 'Basic Info',
                desc: 'Store Info',
                icon: 'adminlib-credit-card',
            },
        },
        {
            type: 'file',
            content: {
                id: 'users',
                name: 'Store Crew',
                desc: 'Store Users',
                icon: 'adminlib-credit-card',
            },
        },
        {
            type: 'file',
            content: {
                id: 'payment',
                name: 'Payment',
                desc: 'Payment Methods',
                icon: 'adminlib-credit-card',
            },
        },
        {
            type: 'file',
            content: {
                id: 'vendor-shipping',
                name: 'Vendor Shipping',
                desc: 'Vendor Shipping',
                icon: 'adminlib-credit-card',
            },
        },
        {
            type: 'file',
            content: {
                id: 'store-policy',
                name: 'Store Policy',
                desc: 'Store Policy',
                icon: 'adminlib-credit-card',
            },
        },
        {
            type: 'file',
            content: {
                id: 'store-application',
                name: 'Vendor Application',
                desc: 'Vendor Application',
                icon: 'adminlib-credit-card',
            },
        },
    ];

    const getForm = (tabId: string) => {
        switch (tabId) {
            case 'store':
                return <StoreSettings id={editId} />;
            case 'users':
                return <StoreQueue id={editId} />;
            case 'payment':
                return <PaymentSettings id={editId} />;
            case 'vendor-shipping':
                return <ShippingSettings id={editId} />;
            case 'store-policy':
                return <PolicySettings id={editId} />;
            case 'store-application':
                return <StoreRegistration id={editId} />;
            default:
                return <div></div>;
        }
    };

    return (
        <>
            {/* <Link
                to="?page=multivendorx#&tab=stores"
                className="button"
            >
                Back
            </Link> */}

            <Tabs
                tabData={tabData}
                currentTab={currentTab}
                getForm={getForm}
                prepareUrl={prepareUrl}
                appLocalizer={appLocalizer}
                brandImg={Brand}
                smallbrandImg={BrandSmall}
                Link={Link}
                settingName={'Store'}
            />
        </>
    );
};

export default EditStore;
