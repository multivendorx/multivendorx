import { Link, useLocation } from 'react-router-dom';
import { Tabs } from 'zyra';
import Brand from '../../../assets/images/brand-logo.png';
import BrandSmall from '../../../assets/images/brand-icon.png';
// import StoreSettings from './StoreSettings';
// import SocialSettings from './SocialSettings';

// import PaymentSettings from './PaymentSettings';

const EditCommission = () => {
    const location = useLocation();
    const hash = location.hash.replace(/^#/, '');

    const editParts = hash.match(/edit\/(\d+)/);
    const editId = editParts ? editParts[1] : null;

    return (
        <>
        Edit Commison{editId}

        </>
    );
};

export default EditCommission;
