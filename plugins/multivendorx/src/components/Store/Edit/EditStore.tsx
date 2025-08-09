import { Link, useLocation } from 'react-router-dom';
import { Tabs } from 'zyra';
import Brand from '../../../assets/images/brand-logo.png';
import BrandSmall from '../../../assets/images/brand-icon.png';
import StoreSettings from './StoreSettings';

const EditStore = () => {
    const location = useLocation();
    const hash = location.hash.replace(/^#/, '');

    const editParts = hash.match(/edit\/(\d+)/);
    const editId = editParts ? editParts[1] : null;

    const hashParams = new URLSearchParams(hash);
    const currentTab = hashParams.get('section') || 'store';

    const prepareUrl = (tabId: string) => `?page=multivendorx#&tab=store-management&edit/${editId}/&section=${tabId}`;

    const tabData = [
        {
        type: 'file',
        content: {
            id: 'store',
            name: 'Store',
            desc: 'Store Info',
            icon: 'adminlib-credit-card',
        },
        },
        {
        type: 'file',
        content: {
            id: 'social',
            name: 'Social',
            desc: 'Social Links',
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
    ];

    const getForm = (tabId: string) => {
        switch (tabId) {
        case 'store':
            return <StoreSettings id={editId}/>;
        case 'social':
            return <h1>Social Links</h1>;
        case 'payment':
            return <h1>Payment Options</h1>;
        default:
            return <div></div>;
        }
    };

    return (
        <>
        <Link
            to="?page=multivendorx#&tab=store-management&view"
            className="button"
        >
            Back
        </Link>

        <Tabs
            tabData={tabData}
            currentTab={currentTab}
            getForm={getForm}
            prepareUrl={prepareUrl}
            appLocalizer={appLocalizer}
            brandImg={ Brand }
            smallbrandImg={ BrandSmall }
            Link={Link}
        />
        </>
    );
};

export default EditStore;
