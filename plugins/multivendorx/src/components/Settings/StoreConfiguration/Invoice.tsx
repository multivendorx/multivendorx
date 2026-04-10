import { BasicInputUI, Card, ChoiceToggleUI, ColorSettingInputUI, Column, Container, ExpandablePanelUI, FileInputUI, FormGroup, FormGroupWrapper, MultiCheckBoxUI, TabsUI, TextAreaUI } from "zyra";
import { __ } from '@wordpress/i18n';
import { useState } from "react";
import CustomerInvoice1 from '../../../assets/template/customerInvoice/Invoice-1';
import subscriptionInvoice1 from '../../../assets/template/subscriptionInvoice/subscriptionInvoice1';
import adminInvoice1 from '../../../assets/template/adminInvoice/adminInvoice1';
import packingSlip1 from '../../../assets/template/packingSlip/packingSlip1';

const ratingsField = {
    key: 'ratings_parameters',
    type: 'expandable-panel',
    label: __('Rating parameters', 'multivendorx'),
    settingDescription: __(
        'Define the key factors customers will use to evaluate each store.',
        'multivendorx'
    ),
    min: 3,
    desc: __(
        'Give customers a fair way to share feedback! Define what they rate, like product/listing quality, delivery, or service. You’ll start with five default parameters that can be edited or removed, but make sure at least three stay active for balanced, detailed reviews.',
        'multivendorx'
    ),
    modal: [
        {
            id: 'quality',
            label: __('VAT / Tax number', 'multivendorx'),
            desc: __('DE987654321', 'multivendorx'),
            isCustom: true,
            disableBtn: true,
            iconEnable: false,
            formFields: [],
        },
        {
            id: 'delivery',
            label: __('Additional Tax ID', 'multivendorx'),
            desc: __('GB123456789', 'multivendorx'),
            isCustom: true,
            disableBtn: true,
            iconEnable: false,
            formFields: [],
        },
        {
            id: 'service',
            label: __('Company registration number', 'multivendorx'),
            desc: __('GB123456789', 'multivendorx'),
            isCustom: true,
            disableBtn: true,
            iconEnable: false,
            formFields: [],
        },
        {
            id: 'service',
            label: __('Company registration number', 'multivendorx'),
            desc: __('GB123456789', 'multivendorx'),
            isCustom: true,
            disableBtn: true,
            iconEnable: false,
            formFields: [],
        },
    ],
    addNewTemplate: {
        label: 'New Rating Parameters',
        editableFields: {
            title: true,
            description: true,
        },
    },

};

const COLOR_PALETTES = [
    {
        key: 'orchid_bloom',
        label: 'Orchid Bloom',
        value: 'orchid_bloom',
        colors: {
            colorPrimary: '#FF5959',
            colorSecondary: '#FADD3A',
            colorAccent: '#49BEB6',
            colorSupport: '#075F63',
        },
    },
    {
        key: 'emerald_edge',
        label: 'Emerald Edge',
        value: 'emerald_edge',
        colors: {
            colorPrimary: '#e6b924',
            colorSecondary: '#d888c1',
            colorAccent: '#6b7923',
            colorSupport: '#6e97d0',
        },
    },
    {
        key: 'solar_ember',
        label: 'Solar Ember',
        value: 'solar_ember',
        colors: {
            colorPrimary: '#fe900d',
            colorSecondary: '#6030db',
            colorAccent: '#17cadb',
            colorSupport: '#a52fff',
        },
    },
    {
        key: 'crimson_blaze',
        label: 'Crimson Blaze',
        value: 'crimson_blaze',
        colors: {
            colorPrimary: '#04e762',
            colorSecondary: '#f5b700',
            colorAccent: '#dc0073',
            colorSupport: '#008bf8',
        },
    },
    {
        key: 'golden_ray',
        label: 'Golden Ray',
        value: 'golden_ray',
        colors: {
            colorPrimary: '#0E117A',
            colorSecondary: '#399169',
            colorAccent: '#12E2A4',
            colorSupport: '#DCF516',
        },
    },
    {
        key: 'obsidian_night',
        label: 'Obsidian Night',
        value: 'obsidian_night',
        colors: {
            colorPrimary: '#00eed0',
            colorSecondary: '#0197af',
            colorAccent: '#4b227a',
            colorSupport: '#02153d',
        },
    },
    {
        key: 'obsidian',
        label: 'Obsidian',
        value: 'obsidian',
        colors: {
            colorPrimary: '#7ccc63',
            colorSecondary: '#f39c12',
            colorAccent: '#e74c3c',
            colorSupport: '#2c3e50',
        },
    },
    {
        key: 'black',
        label: 'Black Diamond',
        value: 'black',
        colors: {
            colorPrimary: '#2c3e50',
            colorSecondary: '#2c3e50',
            colorAccent: '#2c3e50',
            colorSupport: '#2c3e50',
        },
    },
];


const Invoice: React.FC = () => {
    const [paymentCapability, setPaymentCapability] = useState<string[]>([]);
    const [invoiceEmails, setinvoiceEmails] = useState<string[]>([]);
    const [PackingSlip, setPackingSlip] = useState<string[]>([]);
    const [value, setValue] = useState({
        quality: { enable: true },
        delivery: { enable: true },
        service: { enable: true },
    });
    return (
        <Container className="notice-settings">
            <Column grid={8}>
                <Card title={__('Invoices PDF format', 'multivendorx')} desc={__('Configure the layout and numbering format used for all generated invoices.', 'multivendorx')}>
                    <FormGroupWrapper>
                        <FormGroup cols={2} label="Page size">
                            <ChoiceToggleUI
                                options={[
                                    {
                                        key: 'public',
                                        value: 'public',
                                        label: __('A4 (210 × 297 mm)', 'multivendorx'),
                                    },
                                    {
                                        key: 'private',
                                        value: 'private',
                                        label: __('Letter (8.5 × 11 in)', 'multivendorx'),
                                    },
                                    {
                                        key: 'private',
                                        value: 'private',
                                        label: __('Legal (8.5 × 14 in)', 'multivendorx'),
                                    },
                                ]}
                            />
                        </FormGroup>
                        <FormGroup cols={2} label="Orientation">
                            <ChoiceToggleUI
                                options={[
                                    {
                                        key: 'public',
                                        value: 'public',
                                        label: __('Portrait (Vertical)', 'multivendorx'),
                                    },
                                    {
                                        key: 'private',
                                        value: 'private',
                                        label: __('Landscape (Horizontal)', 'multivendorx'),
                                    },
                                ]}
                            />
                        </FormGroup>
                        <FormGroup cols={2} label="Invoice numbers will include this prefix" desc={__('<b>Example results:</b> INV-2026-0001, INV-MVX-0001', 'multivendorx')}>
                            <BasicInputUI
                                name="name"
                                placeholder={__('Invoice numbers will include this prefix', 'multivendorx')}
                            // value={formData.name || ''}
                            // onChange={(val) =>
                            //     handleChange('name', val as string)
                            // }
                            />
                        </FormGroup>
                    </FormGroupWrapper>
                </Card>
                <Card title={__('Customer invoice generator', 'multivendorx')} desc={__('Define when invoices should be automatically created and how they are delivered to customers.', 'multivendorx')}>
                    <FormGroupWrapper>
                        <FormGroup cols={2} label={__('Invoices will be created based on', 'multivendorx')}>
                            <ChoiceToggleUI
                                options={[
                                    {
                                        key: 'public',
                                        value: 'public',
                                        label: __('Main order', 'multivendorx'),
                                    },
                                    {
                                        key: 'private',
                                        value: 'private',
                                        label: __('Store sub-order', 'multivendorx'),
                                    },
                                ]}
                            />
                        </FormGroup>
                        <FormGroup label={__('Generate invoice when order status becomes', 'multivendorx')}>
                            <MultiCheckBoxUI
                                selectDeselect={true}
                                wrapperClass="checkbox-list-side-by-side"
                                inputInnerWrapperClass="default-checkbox"
                                inputClass={'basic-checkbox'}
                                options={[
                                    {
                                        key: 'completed',
                                        label: __('Completed', 'multivendorx'),
                                        value: 'completed',
                                        desc: __(
                                            'Order is delivered and customer has received all items.',
                                            'multivendorx'
                                        ),
                                    },
                                    {
                                        key: 'processing',
                                        label: __('Processing', 'multivendorx'),
                                        value: 'processing',
                                        desc: __(
                                            'Payment received and order is being prepared for shipment.',
                                            'multivendorx'
                                        ),
                                    },
                                    {
                                        key: 'paid',
                                        label: __('Paid', 'multivendorx'),
                                        value: 'paid',
                                        desc: __('Payment has been confirmed.', 'multivendorx'),
                                    },
                                    {
                                        key: 'on-hold',
                                        label: __('On Hold', 'multivendorx'),
                                        value: 'on-hold',
                                        desc: __(
                                            'Order placed on hold pending verification.',
                                            'multivendorx'
                                        ),
                                    },
                                    {
                                        key: 'pending-payment',
                                        label: __('Pending Payment', 'multivendorx'),
                                        value: 'pending-payment',
                                        desc: __(
                                            'Order created but awaiting payment (useful for bank transfers, checks)',
                                            'multivendorx'
                                        ),
                                    },
                                ]}
                                value={paymentCapability}
                                modules={[]} // required prop
                                onChange={(val: string[]) => setPaymentCapability(val)}
                                onMultiSelectDeselectChange={(val: string[]) => setPaymentCapability(val)}
                            />
                        </FormGroup>
                    </FormGroupWrapper>
                </Card>
                {/* <Card title={__('Customer access to invoices', 'multivendorx')} desc={__('Control how customers can access and download their order invoices.', 'multivendorx')}>
                    <FormGroupWrapper>
                        
                    </FormGroupWrapper>
                </Card> */}
                <Card title={__('Invoices will include these additional notes', 'multivendorx')} desc={__('Customize additional text that appears on the invoice document when customers download it.', 'multivendorx')}>
                    <FormGroupWrapper>
                        <FormGroup label={__('Invoice footer text', 'multivendorx')} >
                            <TextAreaUI
                                name="content"
                            />
                        </FormGroup>
                        <FormGroup label={__('Terms and conditions', 'multivendorx')}>
                            <TextAreaUI
                                name="content"
                            />
                        </FormGroup>
                    </FormGroupWrapper>
                </Card>
            </Column>


            <Column grid={4}>
                <Card title={__('Invoices will display these tax details', 'multivendorx')} >
                    <FormGroupWrapper>
                        <FormGroup desc={__('Enter or update your VAT/Tax number, additional tax IDs, and company registration numbers here - all changes will be reflected in future invoices.', 'multivendorx')}>
                            <ExpandablePanelUI
                                name={ratingsField.key}
                                methods={ratingsField.modal}
                                value={value}
                                onChange={setValue}
                                canAccess={true}
                                min={ratingsField.min}
                                addNewBtn={ratingsField.addNewBtn}
                                editTitleShow={true}
                                addNewTemplate={ratingsField.addNewTemplate}
                            />
                        </FormGroup>
                    </FormGroupWrapper>
                </Card>
                <Card title={__('Store commission invoices', 'multivendorx')} >
                    <FormGroupWrapper>
                        <FormGroup label="Commission invoices will be issued" desc={__(
                            'Choose how often store receive commission invoices from the marketplace:<ul><li>Per order - Generate a commission invoice for each order.</li><li>Monthly - Generate a single consolidated commission invoice at the end of each month.</li></ul>',
                            'multivendorx'
                        )}>
                            <ChoiceToggleUI
                                options={[
                                    {
                                        key: 'public',
                                        value: 'public',
                                        label: __('Per order', 'multivendorx'),
                                    },
                                    {
                                        key: 'private',
                                        value: 'private',
                                        label: __('Monthly', 'multivendorx'),
                                    },
                                ]}
                            />
                        </FormGroup>
                    </FormGroupWrapper>
                </Card>
                <Card title={__('Packing slip generator', 'multivendorx')}>
                    <FormGroupWrapper>
                        <FormGroup cols={2} label={__('What appears on packing slips', 'multivendorx')}>
                            <MultiCheckBoxUI
                                selectDeselect={true}
                                wrapperClass="checkbox-list-side-by-side"
                                inputInnerWrapperClass="default-checkbox"
                                inputClass={'basic-checkbox'}
                                options={[
                                    {
                                        key: 'include_prices',
                                        label: __(
                                            'Include prices on packing slips',
                                            'multivendorx'
                                        ),
                                        desc: __(
                                            'Show item prices on packing slips',
                                            'multivendorx'
                                        ),
                                        value: 'include_prices',
                                    },
                                    {
                                        key: 'use_store_address',
                                        label: __('Use store address', 'multivendorx'),
                                        desc: __(
                                            'Use store address instead of marketplace address',
                                            'multivendorx'
                                        ),
                                        value: 'use_store_address',
                                    },
                                ]}
                                value={PackingSlip}
                                modules={[]}
                                onChange={(val: string[]) => setPackingSlip(val)}
                                onMultiSelectDeselectChange={(val: string[]) => setPackingSlip(val)}
                            />
                        </FormGroup>
                    </FormGroupWrapper>
                </Card>
                <Card title={__('Invoice branding: logo & signature', 'multivendorx')} >
                    <FormGroupWrapper>
                        <FormGroup label="Company logo" desc={__('', 'multivendorx')}>
                            <FileInputUI />
                        </FormGroup>
                        <FormGroup label="Invoice signature" desc={__('', 'multivendorx')}>
                            <FileInputUI />
                        </FormGroup>
                    </FormGroupWrapper>
                </Card>
            </Column>

            <Column>
                <Card title={__('Invoice preview', 'multivendorx')} desc={__('Preview how the invoice layout will appear to customers and stores', 'multivendorx')}>
                    <TabsUI
                        tabs={[
                            {
                                label: __('Customer Invoice', 'multivendorx'),
                                content: (
                                    <ColorSettingInputUI
                                        filedKey="invoice_template"
                                        wrapperClass="form-group-color-setting"
                                        inputClass="setting-form-input"
                                        templateSelector={false}
                                        showPdfButton={true}
                                        idPrefix="color-setting"
                                        templates={[
                                            {
                                                key: 'customer_invoice1',
                                                label: 'Customer Invoice',
                                                preview: CustomerInvoice1,
                                                component: CustomerInvoice1,
                                                pdf: CustomerInvoice1,
                                            },
                                        ]}
                                        predefinedOptions={COLOR_PALETTES}
                                        value={{
                                            selectedPalette: 'orchid_bloom',
                                            colors: {},
                                            templateKey: 'customer_invoice1',
                                        }}
                                        onChange={(e) => {
                                            console.log('Updated Value:', e.target.value);
                                        }}
                                    />
                                ),
                            },
                            {
                                label: __('Admin Commission', 'multivendorx'),
                                content: (
                                    <ColorSettingInputUI
                                        filedKey="invoice_template_builder"
                                        wrapperClass="form-group-color-setting"
                                        inputClass="setting-form-input"
                                        templateSelector={false}
                                        showPdfButton={true}
                                        idPrefix="invoice-template-builder"

                                        templates={[
                                            {
                                                key: 'customer_invoice1',
                                                label: 'Customer Invoice',
                                                preview: subscriptionInvoice1,
                                                component: subscriptionInvoice1,
                                                pdf: subscriptionInvoice1,
                                            },
                                        ]}
                                        predefinedOptions={COLOR_PALETTES}
                                        value={{
                                            selectedPalette: 'orchid_bloom',
                                            colors: {},
                                            templateKey: 'customer_invoice1',
                                        }}

                                        onChange={(e) => {
                                            console.log('Updated:', e.target.value);
                                        }}
                                    />
                                ),
                            },
                            {
                                label: __('Membership', 'multivendorx'),
                                content: (
                                    <ColorSettingInputUI
                                        filedKey="invoice_template_builder"
                                        wrapperClass="form-group-color-setting"
                                        inputClass="setting-form-input"
                                        templateSelector={false}
                                        showPdfButton={true}
                                        idPrefix="invoice-template-builder"

                                        templates={[
                                            {
                                                key: 'customer_invoice1',
                                                label: 'Customer Invoice',
                                                preview: adminInvoice1,
                                                component: adminInvoice1,
                                                pdf: adminInvoice1,
                                            },
                                        ]}
                                        predefinedOptions={COLOR_PALETTES}
                                        value={{
                                            selectedPalette: 'orchid_bloom',
                                            colors: {},
                                            templateKey: 'customer_invoice1',
                                        }}

                                        onChange={(e) => {
                                            console.log(e.target.value);
                                        }}
                                    />
                                ),
                            },
                            {
                                label: __('Packing Slip', 'multivendorx'),
                                content: (
                                    <ColorSettingInputUI
                                        filedKey="invoice_template_builder"
                                        wrapperClass="form-group-color-setting"
                                        inputClass="setting-form-input"
                                        templateSelector={false}
                                        showPdfButton={true}
                                        idPrefix="invoice-template-builder"

                                        templates={[
                                            {
                                                key: 'customer_invoice1',
                                                label: 'Customer Invoice',
                                                preview: packingSlip1,
                                                component: packingSlip1,
                                                pdf: packingSlip1,
                                            },
                                        ]}
                                        predefinedOptions={COLOR_PALETTES}
                                        value={{
                                            selectedPalette: 'orchid_bloom',
                                            colors: {},
                                            templateKey: 'customer_invoice1',
                                        }}

                                        onChange={(e) => {
                                            console.log(e.target.value);
                                        }}
                                    />
                                ),
                            },
                        ]}
                    />
                </Card>
            </Column>
        </Container>
    );
}

export default Invoice;
