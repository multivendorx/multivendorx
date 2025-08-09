import { Link, useLocation } from 'react-router-dom';
import AddStore from './AddStore';
import ViewStore from './ViewStore';
import EditStore from './Edit/EditStore';

const Store = () => {
  const location = useLocation();
  const hash = location.hash;

  const isTabActive = hash.includes('tab=store-management');
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
          <Link
            to="?page=multivendorx#&tab=store-management&create"
            className="button"
          >
            Add Store
          </Link>
          <Link
            to="?page=multivendorx#&tab=store-management&view"
            className="button"
          >
            View Store
          </Link>
          <div>Loading Store...</div>
        </>
      )}
    </>
  );
};

export default Store;
