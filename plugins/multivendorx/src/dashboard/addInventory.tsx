import { AdminButtonUI, Analytics, BasicInputUI, Card, Column, Container, DynamicRowSetting, FormGroup, FormGroupWrapper, NavigatorHeader, SelectInputUI, ToggleSettingUI } from "zyra";
import { __ } from '@wordpress/i18n';
import { useState } from 'react';

const AddInventory = () => {
    const [formData, setFormData] = useState({
        quantity: '',
        distance_unit: 'kilometer',
        distance_price: '',
        hourly_price_type: '1',
        hourly_price: '',
        distance_rules: []
    });

    const productOptions = [
        { label: 'General Hourly Pricing', value: '1', customers: '5' },
        { label: 'Hourly Range Pricing', value: '2', customers: '3' },
    ];
    const setPriceType = [
        { label: 'General Pricing', value: '1', customers: '5' },
        { label: 'Daily Pricing', value: '2', customers: '3' },
        { label: 'Monthly Pricing', value: '2', customers: '3' },
        { label: 'Days Range Pricing', value: '2', customers: '3' },
        { label: 'Flat Hour Pricing', value: '2', customers: '3' },
    ];

    const handleChange = (key: string, value: any) => {
        const updated = { ...formData, [key]: value };
        setFormData(updated);
    };

    return (
        <>
            <NavigatorHeader
                headerTitle={__('Rental Inventory Management', 'multivendorx-pro')}
                headerDescription={__('Configure pricing plans, availability, and inventory settings for your rental products', 'multivendorx-pro')}
                buttons={[
                    {
                        label: __('Preview', 'multivendorx-pro'),
                        icon: 'eye',
                        color: 'purple',
                    },
                    {
                        label: __('Save', 'multivendorx-pro'),
                        icon: 'eye',
                        color: 'green-bg',
                    },
                ]}
            />

            <Container general>
                <Column grid={8}>
                    <Card title={__('Inventory Management   ', 'multivendorx-pro')}>
                        <FormGroupWrapper>
                            <FormGroup row label={__('Set Quantity', 'multivendorx-pro')} desc={__('Total number of units available for rental', 'multivendorx-pro')}>
                                <BasicInputUI
                                    type="number"
                                    size="15rem"
                                />
                            </FormGroup>
                            <FormGroup row label={__('Distance Unit', 'multivendorx-pro')} desc={__('Select distance unit for pricing', 'multivendorx-pro')}>
                                <ToggleSettingUI
                                    options={[
                                        {
                                            key: 'kilometer',
                                            value: 'kilometer',
                                            label: __('Kilometer', 'multivendorx'),
                                        },
                                        {
                                            key: 'mile',
                                            value: 'mile',
                                            label: __('Mile', 'multivendorx'),
                                        },
                                    ]}
                                    value={formData.distance_unit}
                                    onChange={(val: string) => handleChange('distance_unit', val)}
                                />
                            </FormGroup>
                            <FormGroup row label={__('Distance Unit Price', 'multivendorx-pro')} desc={__('Additional charge per distance unit (kilometer or mile)', 'multivendorx-pro')}>
                                <BasicInputUI
                                    type="number"
                                    size="15rem"
                                    preText={appLocalizer.currency_symbol}
                                    value={formData.distance_price}
                                    onChange={(value) => handleChange('distance_price', value)}
                                />
                            </FormGroup>
                        </FormGroupWrapper>
                    </Card>

                    <Card title={__('Availability Management', 'multivendorx-pro')}>
                        <FormGroupWrapper>
                            <FormGroup row label={__('Product Date Availabilities', 'multivendorx-pro')} desc={__('Block specific dates and times when this product is unavailable for rental', 'multivendorx-pro')}>
                                <DynamicRowSetting
                                    keyName="block_types"
                                    addLabel={__('Add Date Block', 'multivendorx-pro')}
                                    emptyText={__('No  Date Block added yet', 'multivendorx-pro')}
                                    value={formData.block_types || []}
                                    template={{
                                        fields: [
                                            {
                                                key: 'start_time',
                                                type: 'select',
                                                label: __('Start Time', 'multivendorx-pro'),
                                                options: [
                                                    { label: 'Pickup Datetime', value: 'pickup-datetime' },
                                                    { label: 'Dropoff Datetime', value: 'dropoff-datetime' },
                                                ],
                                            },
                                            {
                                                key: 'start_date',
                                                type: 'date',
                                                label: __('Start Date', 'multivendorx-pro'),
                                                placeholder: __('dd/mm/yyyy', 'multivendorx-pro'),
                                            },
                                            {
                                                key: 'start_time',
                                                type: 'time',
                                                label: __('Start Time', 'multivendorx-pro'),
                                                placeholder: __('--:-- --', 'multivendorx-pro'),
                                            },
                                        ],
                                    }}
                                    onChange={(updatedRules: any[]) => {
                                        handleChange('block_types', updatedRules);
                                    }}
                                />
                            </FormGroup>
                        </FormGroupWrapper>
                    </Card>
                </Column>

                <Column grid={4}>
                    <Card contentHeight title={__('Configure Day Pricing Plans', 'multivendorx-pro')}>
                        <FormGroupWrapper>
                            <FormGroup label={__('Set Hourly Price Type', 'multivendorx-pro')} desc={__('Choose hourly pricing schema for short-term rentals', 'multivendorx-pro')}>
                                <SelectInputUI
                                    name="type"
                                    size="15rem"
                                    options={setPriceType}
                                    value={formData.hourly_price_type}
                                    onChange={(val) => handleChange('hourly_price_type', val)}
                                />
                            </FormGroup>
                            <FormGroup label={__('Hourly Price', 'multivendorx-pro')} desc={__('Price per hour for short-term rentals', 'multivendorx-pro')}>
                                <BasicInputUI
                                    type="number"
                                    size="15rem"
                                    preText={appLocalizer.currency_symbol}
                                />
                            </FormGroup>
                        </FormGroupWrapper>
                    </Card>
                    <Card contentHeight title={__('Configure Hourly Pricing Plans', 'multivendorx-pro')}>
                        <FormGroupWrapper>
                            <FormGroup label={__('Set Hourly Price Type', 'multivendorx-pro')} desc={__('Choose hourly pricing schema for short-term rentals', 'multivendorx-pro')}>
                                <SelectInputUI
                                    name="type"
                                    size="15rem"
                                    options={productOptions}
                                    value={formData.hourly_price_type}
                                    onChange={(value) => handleChange('hourly_price_type', value)}
                                />
                            </FormGroup>
                            <FormGroup label={__('Hourly Price', 'multivendorx-pro')} desc={__('Price per hour for short-term rentals', 'multivendorx-pro')}>
                                <BasicInputUI
                                    type="number"
                                    size="15rem"
                                    preText={appLocalizer.currency_symbol}
                                    value={formData.hourly_price}
                                    onChange={(value) => handleChange('hourly_price', value)}
                                />
                            </FormGroup>
                        </FormGroupWrapper>
                    </Card>
                </Column>
            </Container>
        </>
    );
};

export default AddInventory;