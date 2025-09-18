import { useState } from "react";
import { BasicInput, FileInput, SelectInput, TextArea } from "zyra";

const Storefront: React.FC = () => {
    const [activeTab, setActiveTab] = useState("general-information");

    const tabs = [
        {
            id: "general-information",
            label: "General Information",
            content: (
                <>
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
                    </div>
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="product-name">Store URL Slug</label>
                            <BasicInput
                                wrapperClass="setting-form-input"
                                descClass="settings-metabox-description"
                                type="text"
                                name="name"
                                addonBefore="multivendordemo.com/mvx/"
                                size="15rem"
                            // value={formData.name}
                            // onChange={handleChange}

                            />
                        </div>
                    </div>
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="product-name">Store Description</label>
                            <TextArea
                                name="description"
                            // value={formData.description}
                            // onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="product-name">Store Description</label>
                            <TextArea
                                name="description"
                            // value={formData.description}
                            // onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="product-name">Store Description</label>
                            <TextArea
                                name="description"
                            // value={formData.description}
                            // onChange={handleChange}
                            />
                        </div>
                    </div>
                </>
            ),
        },
        {
            id: "contact-information",
            label: "Contact Information",
            content: (
                <>
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="product-name">Phone Number</label>
                            <BasicInput
                                type="number"
                                name="name"
                            // value={formData.name}
                            // onChange={handleChange}

                            />
                        </div>
                    </div>
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="product-name">Primary Email</label>
                            <BasicInput
                                type="text"
                                name="name"
                            // value={formData.name}
                            // onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="product-name">Additional Email</label>
                            <BasicInput
                                type="text"
                                name="name"
                            // value={formData.name}
                            // onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="product-name">Street Address</label>
                            <TextArea
                                name="description"
                            // value={formData.description}
                            // onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="product-name">City Code</label>
                            <BasicInput
                                type="text"
                                name="name"
                            // value={formData.name}
                            // onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="product-name">Timezone</label>
                            <SelectInput
                                name="store_owners"
                                // options={appLocalizer.store_owners || []}
                                options={[
                                    { value: 'john_doe', label: 'John Doe' },
                                    { value: 'jane_smith', label: 'Jane Smith' },
                                    { value: 'alex_johnson', label: 'Alex Johnson' },
                                ]}
                                type="multi-select"
                            // value={(formData.store_owners || []).map((id: any) => {
                            //     const match = (appLocalizer.store_owners || []).find(
                            //         (opt: any) => String(opt.value) === String(id)
                            //     );
                            //     return match ? match.value : String(id);
                            // })}
                            // onChange={(selected: any) => {
                            //     const store_owners =
                            //         (selected as any[])?.map(
                            //             (option) => option.value
                            //         ) || [];
                            //     const updated = {
                            //         ...formData,
                            //         store_owners,
                            //         state: '',
                            //     };
                            //     setFormData(updated);
                            //     autoSave(updated);
                            // }}
                            />
                        </div>
                    </div>
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="product-name">Store Location</label>
                            <TextArea
                                name="description"
                            // value={formData.description}
                            // onChange={handleChange}
                            />
                        </div>
                    </div>
                </>
            ),
        },
        {
            id: "social-information",
            label: "Social information",
            content: (
                <>
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="facebook"><i className="adminlib-supervised-user-circle"></i> Facebook</label>
                            <BasicInput
                                name="facebook"
                                wrapperClass="setting-form-input"
                                descClass="settings-metabox-description"
                            // value={formData.facebook}
                            // onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* x */}
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="twitter"><i className="adminlib-supervised-user-circle"></i> X</label>
                            <BasicInput
                                name="twitter"
                                wrapperClass="setting-form-input"
                                descClass="settings-metabox-description"
                            // value={formData.twitter}
                            // onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* LinkedIn */}
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="linkedin"><i className="adminlib-supervised-user-circle"></i> LinkedIn</label>
                            <BasicInput
                                name="linkedin"
                                wrapperClass="setting-form-input"
                                descClass="settings-metabox-description"
                            // value={formData.linkedin}
                            // onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* YouTube */}
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="youtube"><i className="adminlib-supervised-user-circle"></i> YouTube</label>
                            <BasicInput
                                name="youtube"
                                wrapperClass="setting-form-input"
                                descClass="settings-metabox-description"
                            // value={formData.youtube}
                            // onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Instagram */}
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="instagram"><i className="adminlib-supervised-user-circle"></i> Instagram</label>
                            <BasicInput
                                name="instagram"
                                wrapperClass="setting-form-input"
                                descClass="settings-metabox-description"
                            // value={formData.instagram}
                            // onChange={handleChange}
                            />
                        </div>
                    </div>
                </>
            ),
        },
    ];

    return (
        <>
            {/* page title start */}
            <div className="page-title-wrapper">
                <div className="page-title">
                    <div className="title">Store Settings</div>
                    <div className="des">Manage your store information and preferences</div>
                </div>

                {/* <div className="buttons-wrapper">
                    <div className="admin-btn btn-purple">
                        Save draft
                    </div>
                    <div className="admin-btn btn-purple">
                        Publish product
                    </div>
                </div> */}
            </div> {/* page title end */}

            {/* form start */}
            <div className="container-wrapper">

                <div className="card-wrapper width-65">
                    <div className="card-content">
                        <div className="content">
                            <div className="tab-titles">
                                {tabs.map((tab) => (
                                    <div
                                        key={tab.id}
                                        className={`title ${activeTab === tab.id ? "active" : ""}`}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        <h2>{tab.label}</h2>
                                    </div>
                                ))}
                            </div>
                            {/* Tab Content */}
                            <div className="tab-content">
                                {tabs.map(
                                    (tab) =>
                                        activeTab === tab.id && (
                                            <div key={tab.id} className="tab-panel">
                                                {tab.content}
                                            </div>
                                        )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card-wrapper width-35">
                    <div className="card-content">
                        <div className="card-title">Storefront</div>

                        <div className="form-group">
                            <label htmlFor="product-name">Banner Type</label>
                            <SelectInput
                                name="store_owners"
                                options={[
                                    { value: 'john_doe', label: 'video' },
                                    { value: 'jane_smith', label: 'Image' },
                                    { value: 'alex_johnson', label: 'Alex Johnson' },
                                ]}
                                type="multi-select"
                            // value={(formData.store_owners || []).map((id: any) => {
                            //     const match = (appLocalizer.store_owners || []).find(
                            //         (opt: any) => String(opt.value) === String(id)
                            //     );
                            //     return match ? match.value : String(id);
                            // })}
                            // onChange={(selected: any) => {
                            //     const store_owners =
                            //         (selected as any[])?.map(
                            //             (option) => option.value
                            //         ) || [];
                            //     const updated = {
                            //         ...formData,
                            //         store_owners,
                            //         state: '',
                            //     };
                            //     setFormData(updated);
                            //     autoSave(updated);
                            // }}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="store-image">Store Logo</label>
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
                        <div className="form-group">
                            <label htmlFor="store-image">Display Picture</label>
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
                        <div className="form-group">
                            <label htmlFor="store-image">Store Banner</label>
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


            </div> {/* form end */}
        </>
    );
};

export default Storefront;