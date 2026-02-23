import React, { useState, useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import {
    AdminButtonUI,
    Analytics,
    BasicInputUI,
    Column,
    Container,
    FormGroup,
    FormGroupWrapper,
    MultiCheckBoxUI,
    NavigatorHeader,
    PopupUI
} from 'zyra';

const StaffManagement: React.FC = () => {
    const [AddStaff, setAddStaff] = useState(false);
    const overviewData = [
        {
            icon: "user-network-icon",
            number: "3",
            text: "Total Staff",
            colorClass: 'primary',
        },
        {
            icon: "active",
            number: "2",
            text: "Active",
            colorClass: 'green',
        },
        {
            icon: "store-reject",
            number: "1",
            text: "Inactive",
            colorClass: 'red',
        }
    ];
    const vendorStorefrontProductsField = {
        key: 'vendor_storefront_products_capabilities',
        look: 'checkbox',
        selectDeselect: true,
        class: 'basic-checkbox',
        desc: 'Only selected product actions will be available to stores.',
        options: [
            { key: 'view_products', value: 'view_products', label: 'View products' },
            { key: 'add_products', value: 'add_products', label: 'Add products' },
            { key: 'publish_products', value: 'publish_products', label: 'Publish products' },
            { key: 'edit_published_products', value: 'edit_published_products', label: 'Edit published products' },
            { key: 'review_product_edits', value: 'review_product_edits', label: 'Review edits' },
        ],
    };
    return (
        <>
            <NavigatorHeader
                headerTitle={__('Staff Management', 'multivendorx')}
                headerDescription={__('View, edit, and control your teams access permissions.', 'multivendorx')}
                buttons={[
                    {
                        label: __('Add New Staff', 'multivendorx'),
                        icon: 'plus',
                        onClick: () => { setAddStaff(true); },
                    },
                ]}
            />

            <Container general>
                <Column>
                    <Analytics
                        variant="default"
                        data={overviewData}
                    />

                </Column>

            </Container>

            {AddStaff && (
                <PopupUI
                    open={AddStaff}
                    onClose={() => setAddStaff(false)}
                    width={60}
                    header={{
                        icon: 'coupon',
                        title: __('Add Store Staff Member', 'multivendorx'),
                        description: __(
                            'Set code, discount, and usage limits, then activate.',
                            'multivendorx'
                        ),
                    }}
                    footer={
                        <AdminButtonUI
                            buttons={[
                                {
                                    icon: 'contact-form',
                                    text: __('Cancel', 'multivendorx'),
                                    color: 'red',
                                },
                                {
                                    icon: 'save',
                                    text: __('Add Staff Member', 'multivendorx'),
                                },
                            ]}
                        />
                    }
                >
                    <>
                        <FormGroupWrapper className="bg-light-white">
                            <div className="form-group-title-wrapper">
                                <div className="title">
                                    {__(
                                        'User Information',
                                        'multivendorx'
                                    )}
                                </div>
                            </div>
                            <FormGroup cols={2} label={__('Username', 'multivendorx')} htmlFor="title" >
                                <BasicInputUI
                                    type="text"
                                />
                            </FormGroup>

                            <FormGroup cols={2} label={__('Email', 'multivendorx')} htmlFor="title" >
                                <BasicInputUI
                                    type="email"
                                />
                            </FormGroup>

                            <FormGroup cols={2} label={__('First Name', 'multivendorx')} htmlFor="title" >
                                <BasicInputUI
                                    type="text"
                                />
                            </FormGroup>
                            <FormGroup cols={2} label={__('Last Name', 'multivendorx')} htmlFor="title" >
                                <BasicInputUI
                                    type="text"
                                />
                            </FormGroup>
                        </FormGroupWrapper>
                        <FormGroupWrapper >
                            <div className="form-group-title-wrapper">
                                <div className="title">
                                    {__('Assign Capabilities', 'multivendorx')}
                                </div>
                            </div>
                            <FormGroup className="bg-light-white" cols={2} label={__('Products', 'multivendorx')} htmlFor="title" >
                                <MultiCheckBoxUI
                                    description={vendorStorefrontProductsField.desc}
                                    wrapperClass="checkbox-list-side-by-side"
                                    inputInnerWrapperClass="default-checkbox"
                                    inputClass={vendorStorefrontProductsField.class}
                                    idPrefix={vendorStorefrontProductsField.key}
                                    selectDeselect
                                    options={vendorStorefrontProductsField.options}
                                />
                            </FormGroup>

                            <FormGroup className="bg-light-white" cols={2} label={__('Orders', 'multivendorx')} htmlFor="title" >
                                <MultiCheckBoxUI
                                    description={vendorStorefrontProductsField.desc}
                                    wrapperClass="checkbox-list-side-by-side"
                                    inputInnerWrapperClass="default-checkbox"
                                    inputClass={vendorStorefrontProductsField.class}
                                    idPrefix={vendorStorefrontProductsField.key}
                                    selectDeselect
                                    options={vendorStorefrontProductsField.options}
                                />
                            </FormGroup>

                            <FormGroup className="bg-light-white" cols={2} label={__('Coupons', 'multivendorx')} htmlFor="title" >
                                <MultiCheckBoxUI
                                    description={vendorStorefrontProductsField.desc}
                                    wrapperClass="checkbox-list-side-by-side"
                                    inputInnerWrapperClass="default-checkbox"
                                    inputClass={vendorStorefrontProductsField.class}
                                    idPrefix={vendorStorefrontProductsField.key}
                                    selectDeselect
                                    options={vendorStorefrontProductsField.options}
                                />
                            </FormGroup>

                            <FormGroup className="bg-light-white" cols={2} label={__('Analytics', 'multivendorx')} htmlFor="title" >
                                <MultiCheckBoxUI
                                    description={vendorStorefrontProductsField.desc}
                                    wrapperClass="checkbox-list-side-by-side"
                                    inputInnerWrapperClass="default-checkbox"
                                    inputClass={vendorStorefrontProductsField.class}
                                    idPrefix={vendorStorefrontProductsField.key}
                                    selectDeselect
                                    options={vendorStorefrontProductsField.options}
                                />
                            </FormGroup>
                        </FormGroupWrapper>
                    </>
                </PopupUI>
            )}
        </>
    );
};

export default StaffManagement;