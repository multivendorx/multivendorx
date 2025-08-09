import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {BasicInput, TextArea, FileInput, getApiLink} from 'zyra';
import Default from '../../assets/images/default.png';
import BannerDefault from '../../assets/images/banner-placeholder.jpg';

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
    axios({
        method: 'POST',
        url: getApiLink(appLocalizer, 'store'),
        headers: { 'X-WP-Nonce': appLocalizer.nonce },
        data: {
            formData: formData
        },
    })
    .then((response) => {
        if(response.data.success) {
          console.log('Store Create successfully')
          navigate(`?page=multivendorx#&tab=store-management&edit/${response.data.id}`);
        }
    })
  };

  return (
    <>
        <Link
            to="?page=multivendorx#&tab=store-management"
            className="button"
            >
            Back
        </Link>
        <div>
            <h3>Add New Store</h3>
            <label>Name</label>
            <BasicInput
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}

            />
            <label>Slug</label>
            <BasicInput
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}

            />
            <label>Description</label>
            <TextArea
                name="description"
                value={formData.description}
                onChange={handleChange}
            />
            <br/>
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
            <br/>
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
            <br/>
            <button 
              className="button"
              onClick={handleSubmit}
            >Submit</button>
        </div>
    </>
  );
};

export default AddStore;
