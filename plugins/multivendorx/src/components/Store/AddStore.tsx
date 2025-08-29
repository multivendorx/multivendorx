import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { BasicInput, TextArea, FileInput, getApiLink, AdminBreadcrumbs } from 'zyra';
import Default from '../../assets/images/default.png';
import BannerDefault from '../../assets/images/banner-placeholder.jpg';
import "./Store.scss";

const AddStore = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({
    image: Default,
    banner: BannerDefault,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const runUploader = (key: string): void => {
    const frame: any = (window as any).wp.media({
      title: 'Select or Upload Image',
      button: {
        text: 'Use this image',
      },
      multiple: false,
    });

    frame.on('select', function () {
      const attachment = frame.state().get('selection').first().toJSON();
      setFormData((prev) => ({ ...prev, [key]: attachment.url }));
      setImagePreviews((prev) => ({ ...prev, [key]: attachment.url }));
    });

    frame.open();
  };

  const handleSubmit = () => {
    if (!formData || Object.keys(formData).length === 0) {
      return;
    }


    axios({
      method: 'POST',
      url: getApiLink(appLocalizer, 'store'),
      headers: { 'X-WP-Nonce': appLocalizer.nonce },
      data: {
        formData: formData
      },
    })
      .then((response) => {
        if (response.data.success) {
          console.log('Store Create successfully')
          navigate(`?page=multivendorx#&tab=stores&edit/${response.data.id}`);
        }
      })
  };

  return (
    <>
      <AdminBreadcrumbs
        activeTabIcon="adminlib-cart"
        parentTabName="Add New Store"
        buttons={[
          {
            label: 'View All Store',
            onClick: () => window.location.assign('?page=multivendorx#&tab=stores'),
            className: 'admin-btn btn-purple'
          }
        ]}
      />



      <div className="container-wrapper">

        <div className="card-wrapper width-65">

          <div className="card-content">
            <div className="card-title">
              Store information
            </div>

            <div className="form-group-wrapper">
              <div className="form-group">
                <label htmlFor="product-name">Name</label>
                <BasicInput
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}

                />
              </div>
            </div>
            <div className="form-group-wrapper">
              <div className="form-group">
                <label htmlFor="product-name">Slug</label>
                <BasicInput
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}

                />
              </div>
            </div>

          </div>

          <div className="card-content">
            <div className="card-title">
              Description
            </div>

            <div className="form-group-wrapper">
              <div className="form-group">
                <TextArea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button
            className="admin-btn btn-purple"
            onClick={handleSubmit}
          >Submit</button>
        </div>

        <div className="card-wrapper width-35">
          <div className="card-content">
            <div className="card-title">
              Description
            </div>

            <div className="form-group-wrapper">
              <div className="form-group">
                <label htmlFor="product-name">Profile Image</label>
                <FileInput
                  value={formData.image}
                  inputClass="form-input"
                  name="image"
                  type="hidden"
                  onButtonClick={() => runUploader('image')}
                  imageWidth={75}
                  imageHeight={75}
                  openUploader="Upload Image"
                  imageSrc={imagePreviews.image}
                  buttonClass="admin-btn btn-purple"
                />
              </div>
            </div>
            <div className="form-group-wrapper">
              <div className="form-group">
                <label htmlFor="product-name">Store Banner Image</label>
                <FileInput
                  value={formData.banner}
                  inputClass="form-input"
                  name="banner"
                  type="hidden"
                  onButtonClick={() => runUploader('banner')}
                  imageWidth={100}
                  imageHeight={100}
                  openUploader="Upload Image"
                  imageSrc={imagePreviews.banner}
                  buttonClass="admin-btn btn-purple"
                />
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* <div className="add-store">

        <div className="form-group-wrapper">
          <div className="form-group">
            <label>Name</label>
            <BasicInput
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}

            />
          </div>
          <div className="form-group">
            <label>Slug</label>
            <BasicInput
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}

            />
          </div>
        </div>

        <div className="form-group-wrapper">

          <div className="form-group full-width">
            <label>Description</label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group-wrapper">
          <div className="form-group">
            <label>Profile Image</label>
            <FileInput
              value={formData.image}
              inputClass="form-input"
              name="image"
              type="hidden"
              onButtonClick={() => runUploader('image')}
              imageWidth={75}
              imageHeight={75}
              openUploader="Upload Image"
              imageSrc={imagePreviews.image}
              buttonClass="admin-btn btn-purple"
            />
          </div>
          <div className="form-group">
            <label>Store Banner Image</label>
            <FileInput
              value={formData.banner}
              inputClass="form-input"
              name="banner"
              type="hidden"
              onButtonClick={() => runUploader('banner')}
              imageWidth={100}
              imageHeight={100}
              openUploader="Upload Image"
              imageSrc={imagePreviews.banner}
              buttonClass="admin-btn btn-purple"
            />
          </div>
        </div>
        
      </div> end add store */}
    </>
  );
};

export default AddStore;
