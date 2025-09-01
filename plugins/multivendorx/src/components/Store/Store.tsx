import { Link, useLocation } from 'react-router-dom';
import AddStore from './AddStore';
import StoreTable from './StoreTable';
import ViewStore from './ViewStore';
import EditStore from './Edit/EditStore';
import {AdminBreadcrumbs} from 'zyra';

const Store = () => {
  const location = useLocation();
  const hash = location.hash;

  const isTabActive = hash.includes('tab=stores');
  const isAddStore = hash.includes('create');
  const isViewStore = hash.includes('view');
  const iseditStore = hash.includes('edit');

  return (
    <>
      {isTabActive && isAddStore && <AddStore />}
      {isTabActive && isViewStore && !isAddStore && <ViewStore />}
      {isTabActive && iseditStore && !isViewStore && !isAddStore && <EditStore />}
      
      {!isAddStore && !isViewStore && !iseditStore && (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-cart"
                tabTitle="Stores"
                buttons={[
                    {
                      label: 'Add Store',
                      onClick: () => window.location.assign('?page=multivendorx#&tab=stores&create'),
                      className: 'admin-btn btn-purple'
                    }
                ]}
            />
          {/* <Link
            to="?page=multivendorx#&tab=stores&create"
            className="button"
          >
            Add Store
          </Link> */}
          {/* <Link
            to="?page=multivendorx#&tab=stores&view"
            className="button"
          >
            View Store
          </Link> */}
          <StoreTable/>
        </>
      )}
    </>
  );
};

export default Store;