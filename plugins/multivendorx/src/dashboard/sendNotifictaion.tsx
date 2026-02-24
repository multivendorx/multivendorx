import { AdminButtonUI, Analytics, BasicInputUI, Card, Column, Container, FormGroup, FormGroupWrapper, MultiCheckBoxUI, NavigatorHeader, SelectInputUI, TextAreaUI } from "zyra";
import { __ } from '@wordpress/i18n';
import { useState } from "react";

const SendNotifictaion = () => {
    const [graceEnabled, setGraceEnabled] = useState<string[]>([]);
    const productOptions = [
        { label: 'Choose from your products...', value: '', customers: '' },
        { label: 'Conference Room A - Full Day', value: '1', customers: '5' },
        { label: 'Conference Room B - Half Day', value: '2', customers: '3' },
        { label: 'Photography Session - 2 Hours', value: '3', customers: '8' },
        { label: 'Consultation Service - 1 Hour', value: '4', customers: '12' },
        { label: 'Equipment Rental - Daily', value: '5', customers: '4' },
        { label: 'Meeting Space - Hourly', value: '6', customers: '6' },
    ];
    return (
        <>
            <NavigatorHeader
                headerTitle={__('Send Email to Customers', 'multivendorx-pro')}
                headerDescription={__('Send an email to all customers who have upcoming bookings for a specific product or service. The email will use your stores default email design from WooCommerce settings.', 'multivendorx-pro')}
            />

            <Container general>
                <Column>
                    <Card title={__('Step 1: Choose a Product', 'multivendorx-pro')}>
                        <FormGroupWrapper>
                            <FormGroup row label={__('Product', 'multivendorx-pro')} desc={__('Select which products customers you want to send an email to. Only customers with upcoming bookings will receive the email.', 'multivendorx-pro')}>
                                <SelectInputUI
                                    name="type"
                                    options={productOptions}
                                    size="20rem"
                                // value={product.type}
                                // onChange={(selected) =>
                                //     handleChange('type', selected.value)
                                // }
                                />
                            </FormGroup>
                        </FormGroupWrapper>
                    </Card>

                    <Card title={__('Step 2: Write Your Email', 'multivendorx-pro')}>
                        <FormGroupWrapper>
                            <FormGroup row label={__('Product', 'multivendorx-pro')} desc={__('This is what customers will see in their inbox. Tip: Click the blue tags below to add personalized details.', 'multivendorx-pro')}>
                                <BasicInputUI
                                    type="text"
                                    size="20rem"
                                />
                            </FormGroup>
                            <FormGroup row label={__('Email Message', 'multivendorx-pro')} desc={__('Write your email message here. Click the blue tags below to automatically add customer names, booking dates, and other details.', 'multivendorx-pro')}>
                                <TextAreaUI />
                            </FormGroup>
                        </FormGroupWrapper>
                    </Card>

                    <Card title={__('Step 3: Add Calendar File (Optional)', 'multivendorx-pro')}>
                        <FormGroupWrapper>
                            <FormGroup row label={__('Include calendar file with email', 'multivendorx-pro')} desc={__('When checked, customers will receive a calendar file (.ics) that they can click to automatically add the booking to Google Calendar, Outlook, Apple Calendar, or any other calendar app they use.', 'multivendorx-pro')}>
                                <div className="toggle-checkbox">
                                    <MultiCheckBoxUI
                                        look="toggle"
                                        type="checkbox"
                                        value={graceEnabled}
                                        onChange={(value) => {
                                            if (Array.isArray(value)) {
                                                setGraceEnabled(value);
                                            } else if (value?.target) {
                                                const { checked, value: v } = value.target as HTMLInputElement;
                                                setGraceEnabled((prev) =>
                                                    checked
                                                        ? [...prev, v]
                                                        : prev.filter((item) => item !== v)
                                                );
                                            }
                                        }}
                                        options={[
                                            { key: 'grace', value: 'grace', },
                                        ]}
                                    />
                                </div>
                            </FormGroup>
                            {/* 
                            <AdminButtonUI
                                buttons={[
                                    {
                                        text: __('Cancel', 'multivendorx-pro'),
                                        icon: 'close',
                                        color: 'red',
                                    },
                                    {
                                        text: __('Send Email to Customers', 'multivendorx-pro'),
                                        icon: 'send',   
                                    },
                                ]}
                            /> */}
                        </FormGroupWrapper>
                    </Card>

                </Column>
            </Container>
        </>
    );
};

export default SendNotifictaion;