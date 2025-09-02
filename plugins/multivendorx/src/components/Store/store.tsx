import { Link, useLocation } from 'react-router-dom';
import AddStore from './addStore';
import StoreTable from './storeTable';
import ViewStore from './viewStore';
import EditStore from './Edit/editStore';
import {AdminBreadcrumbs, BasicInput, FileInput, TextArea} from 'zyra';
import { useState } from 'react';
import axios from 'axios';

const Store = () => {
  const location = useLocation();
  const [addStore, setaddStore] = useState(false);
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
                <div className="right-popup">
                    <div className={`content-wrapper ${addStore ? "open" : ""}`}>
                        <div className="title-wrapper">
                                <div className="title">
                                    <i className="adminlib-cart"></i>
                                    Add Store
                                </div>
                                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                                <i onClick={() => setaddStore(false)} className="icon adminlib-close"></i>
                            </div>
                            
                            <div className="content">
                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <label htmlFor="product-name">Store Name</label>
                                        <BasicInput
                                            type="text"
                                            name="name"
                                            // value={formData.name}
                                            // onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="product-name">Store Url</label>
                                        <BasicInput
                                            type="text"
                                            name="name"
                                            // value={formData.name}
                                            // onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="product-name">Description</label>
                                        <TextArea
                                        name="description"
                                        inputClass="textarea-input"
                                        // value={formData.description}
                                        // onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="product-name">Store Owner</label>
                                        <BasicInput
                                            type="text"
                                            name="name"
                                            // value={formData.name}
                                            // onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                      <label htmlFor="product-name">Profile Image</label>
                                      <FileInput
                                        // value={formData.image}
                                        inputClass="form-input"
                                        name="image"
                                        type="hidden"
                                        // onButtonClick={() => runUploader('image')}
                                        imageWidth={75}
                                        imageHeight={75}
                                        openUploader="Upload Image"
                                        // imageSrc={imagePreviews.image}
                                        buttonClass="admin-btn btn-purple"
                                      />
                                    </div>
                                </div>
                            </div>
                        <div className="popup-footer">
                            <div onClick={() => setaddStore(false)} className="admin-btn btn-red">Cancel</div>
                            <a href="" className="admin-btn btn-purple">Submit</a>
                        </div>
                    </div>
                </div>
            )}
          <StoreTable/>
        </>
      )}
    </>
  );
};

export default Store;