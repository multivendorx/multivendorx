import { Link, useLocation, useNavigate } from 'react-router-dom';
import AddStore from './addStore';
import StoreTable from './storeTable';
import ViewStore from './viewStore';
import EditStore from './Edit/editStore';
import { AdminBreadcrumbs, BasicInput, CommonPopup, FileInput, getApiLink, TextArea } from 'zyra';
import { useEffect, useState } from 'react';
import axios from 'axios';

const Store = () => {
  const location = useLocation();
  const [addStore, setaddStore] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const hash = location.hash;
  const navigate = useNavigate();

  const isTabActive = hash.includes('tab=stores');
  const isAddStore = hash.includes('create');
  const isViewStore = hash.includes('view');
  const iseditStore = hash.includes('edit');

  // handle change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle submit
  const handleSubmit = () => {
    if (!formData || Object.keys(formData).length === 0) {
      return;
    }

    axios({
      method: 'POST',
      url: getApiLink(appLocalizer, 'store'),
      headers: { 'X-WP-Nonce': appLocalizer.nonce },
      data: { formData },
    })
      .then((response) => {
        if (response.data.success) {
          console.log('Store created successfully');
          setaddStore(false);
          navigate(`?page=multivendorx#&tab=stores&edit/${response.data.id}`);
        }
      })
      .catch((err) => {
        console.error('Error saving store:', err);
      });
  };

  return (
    <>
      {isTabActive && isAddStore && <AddStore />}
      {isTabActive && isViewStore && !isAddStore && <ViewStore />}
      {isTabActive && iseditStore && !isViewStore && !isAddStore && <EditStore />}

      {!isAddStore && !isViewStore && !iseditStore && (
        <>
          <AdminBreadcrumbs
            activeTabIcon="adminlib-storefront"
            tabTitle="Stores"
            description={'Manage marketplace stores with ease. Review, edit, or add new stores anytime.'}
            buttons={[
              <div
                className="admin-btn btn-purple"
                onClick={() => setaddStore(true)}
              >
                <i className="adminlib-plus-circle-o"></i>
                Add Store
              </div>
            ]}
          />

          {addStore && (
            <CommonPopup
              open={addStore}
              // onClose={}
              width="500px"
              header={
                <>
                  <div className="title">
                    <i className="adminlib-cart"></i>
                    Add Store
                  </div>
                  <p>Create a new store and set it up with essential details.</p>
                  <i
                    onClick={() => setaddStore(false)}
                    className="icon adminlib-close"
                  ></i>
                </>
              }
              footer={
                <>
                  <div
                    onClick={() => setaddStore(false)}
                    className="admin-btn btn-red"
                  >
                    Cancel
                  </div>
                  <div
                    onClick={handleSubmit}
                    className="admin-btn btn-purple"
                  >
                    Submit
                  </div>
                </>
              }
            >

              <div className="content">
                <div className="form-group-wrapper">
                  <div className="form-group">
                    <label htmlFor="store-name">Store Name</label>
                    <BasicInput
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="store-url">Store Url</label>
                    <BasicInput
                      type="text"
                      name="slug"
                      value={formData.slug || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="store-desc">Description</label>
                    <TextArea
                      name="description"
                      inputClass="textarea-input"
                      value={formData.description || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="store-owner">Store Owner</label>
                    <BasicInput
                      type="text"
                      name="owner"
                      value={formData.owner || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="store-image">Profile Image</label>
                    <FileInput
                      inputClass="form-input"
                      name="image"
                      type="hidden"
                      imageWidth={75}
                      imageHeight={75}
                      openUploader="Upload Image"
                      buttonClass="admin-btn btn-purple"
                    />
                  </div>
                </div>
              </div>
            </CommonPopup>
          )}
          <StoreTable />
        </>
      )}
    </>
  );
};

export default Store;
