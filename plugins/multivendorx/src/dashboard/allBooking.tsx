import React, { useState, useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { AdminButtonUI, Analytics, Column, Container, FormGroup, FormGroupWrapper, NavigatorHeader, PopupUI, SelectInputUI, ToggleSettingUI } from 'zyra';

const AllBooking = () => {
    const [AddBooking, setAddBooking] = useState(false);
    const overviewData = [
        {
            icon: "booking1",
            number: "5",
            text: __("Total Bookings", "multivendorx-pro"),
            iconClass: "primary",
        },
        {
            icon: "booking",
            number: "2",
            text: __("Confirmed", "multivendorx-pro"),
            iconClass: "green",
        },
        {
            icon: "pending",
            number: "2",
            text: __("Pending", "multivendorx-pro"),
            iconClass: "orange",
        },
        {
            icon: "user-circle",
            number: "28",
            text: __("Total Customers", "multivendorx-pro"),
            iconClass: "purple",
        },
    ];
    const customerOptions = [
        { label: 'Select a customer...', value: '' },
        { label: 'John Doe (john@example.com)', value: '1' },
        { label: 'Jane Smith (jane@example.com)', value: '2' },
        { label: 'Robert Johnson (robert@example.com)', value: '3' },
        { label: 'Emily Davis (emily@example.com)', value: '4' },
        { label: 'Michael Brown (michael@example.com)', value: '5' },
    ];
    const productOptions = [
        { label: __('Select a bookable product...', 'multivendorx-pro'), value: '' },
        { label: 'Conference Room A - Full Day', value: '1' },
        { label: 'Conference Room B - Half Day', value: '2' },
        { label: 'Photography Session - 2 Hours', value: '3' },
        { label: 'Consultation Service - 1 Hour', value: '4' },
        { label: 'Equipment Rental - Daily', value: '5' },
        { label: 'Meeting Space - Hourly', value: '6' },
    ];
    return (
        <>
            <NavigatorHeader
                headerTitle={__('Bookings Dashboard', 'multivendorx-pro')}
                headerDescription={__('Manage all your store bookings in one place', 'multivendorx-pro')}
                buttons={[
                    {
                        label: __('Export', 'multivendorx-pro'),
                        icon: 'export',
                        // onClick: () => { setAddBooking(true); },
                        color: 'purple'
                    },
                    {
                        label: __('Add Booking', 'multivendorx-pro'),
                        icon: 'plus',
                        onClick: () => { setAddBooking(true); },
                    },
                ]}
            />

            <Container general>
                <Column>
                    <Analytics
                        // variant="default"
                        data={overviewData}
                    />

                </Column>
            </Container>

            {AddBooking && (
                <PopupUI
                    open={AddBooking}
                    onClose={() => setAddBooking(false)}
                    width={37}
                    height="85%"
                    header={{
                        icon: 'coupon',
                        title: __('Add Booking', 'multivendorx-pro'),
                        description: __(
                            'You can create a new booking for a customer here. This form will create a booking for the user, and optionally an associated order.',
                            'multivendorx-pro'
                        ),
                    }}
                    footer={
                        <AdminButtonUI
                            buttons={[
                                {
                                    icon: 'contact-form',
                                    text: __('Cancel', 'multivendorx-pro'),
                                    color: 'red',
                                },
                                {
                                    icon: 'save',
                                    text: __('Create Booking', 'multivendorx-pro'),
                                },
                            ]}
                        />
                    }
                >
                    <>
                        <FormGroupWrapper>
                            <FormGroup label={__('Customer', 'multivendorx-pro')} htmlFor="Content">
                                <SelectInputUI
                                    name="type"
                                    options={customerOptions}
                                // value={product.type}
                                // onChange={(selected) =>
                                //     handleChange('type', selected.value)
                                // }
                                />
                            </FormGroup>
                            <FormGroup label={__('Bookable Product', 'multivendorx-pro')} htmlFor="Content">
                                <SelectInputUI
                                    name="type"
                                    options={productOptions}
                                // value={product.type}
                                // onChange={(selected) =>
                                //     handleChange('type', selected.value)
                                // }
                                />
                            </FormGroup>
                            <div className="form-group-title-wrapper">
                                <div className="title">
                                    {__('Create Order', 'multivendorx-pro')}
                                </div>
                            </div>
                            <FormGroup label={__('Order Options', 'multivendorx-pro')} desc="Create a new corresponding order for this new booking. Please note - the booking will not be active until the order is processed/completed.">
                                <ToggleSettingUI
                                    custom={true}
                                    options={[
                                        {
                                            key: 'draft',
                                            value: 'draft',
                                            label: __('Create a new corresponding order for this booking', 'multivendorx-pro'),
                                            desc: __('A new order will be created and marked as pending payment.', 'multivendorx-pro'),
                                        },
                                        {
                                            key: 'pending',
                                            value: 'pending',
                                            label: __('Assign this booking to an existing order', 'multivendorx-pro'),
                                            desc: __('Link this booking to an order that already exists in your system.', 'multivendorx-pro'),
                                        },
                                        {
                                            key: 'publish',
                                            value: 'publish',
                                            label: __('Dont create an order for this booking', 'multivendorx-pro'),
                                            desc: __('Create a standalone booking without any associated order.', 'multivendorx-pro'),
                                        },
                                    ]}
                                // value={formData.status}
                                // onChange={(val: string) =>
                                //     handleChange('status', val)
                                // }
                                />
                            </FormGroup>
                        </FormGroupWrapper>
                    </>
                </PopupUI>
            )}
        </>
    );
};

export default AllBooking;
