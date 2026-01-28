import React, { useState, useRef } from 'react';
import 'zyra/build/index.css';
import { ExpandablePanelGroup } from 'zyra';
import { __ } from '@wordpress/i18n';
// import img from '../../assets/images/multivendorx-logo.png';

const SetupWizard: React.FC = () => {
    // Required state for ExpandablePanelGroup
    const [value, setValue] = useState({
        'marketplace_setup': {
            'store_selling_mode': 'default'
        },
        'commission_setup': {
            'disbursement_order_status': ['completed']
        },
        'store_setup': {
            'approve_store': 'manually'
        }
    });
    const settingChanged = useRef(false);

    // NEW: Wizard step control
    const [currentStep, setCurrentStep] = useState(0);

    const appLocalizer = (window as any).appLocalizer;

    const inputField = {
        key: 'setup_wizard',
        proSetting: false,
        apiLink: 'settings',
        moduleEnabled: true,
        dependentSetting: '',
        dependentPlugin: '',
        modal: [],
        buttonEnable: true,
    };

    const isProSetting = (pro: boolean) => pro === true;

    const methods = [
        {
            id: 'marketplace_setup',
            label: 'Store Profile',
            icon: 'adminfont-storefront',
            desc: 'Set up how your store appears',
            countBtn: true,
            isWizardMode: true,
            openForm: true,
            formFields: [
                {
                    key: 'store_name',
                    type: 'text',
                    label: __('Store name', 'multivendorx'),
                    desc: __(
                        'The name shown on your store page and product listings.',
                        'multivendorx'
                    ),
                },
                {
                    key: 'store_name',
                    type: 'textarea',
                    label: __('Store description', 'multivendorx'),
                    desc: __(
                        'The name shown on your store page and product listings.',
                        'multivendorx'
                    ),
                },
                {
                    key: 'store_dashboard_site_logo',
                    type: 'file',
                    label: __('Store logo', 'multivendorx'),
                    size: 'small',
                },
                {
                    key: 'store_dashboard_site_logo',
                    type: 'file',
                    label: __('Banner image (optional)', 'multivendorx'),
                    size: 'small',
                },
                {
                    key: 'store_name',
                    type: 'text',
                    label: __('Contact phone', 'multivendorx'),
                    desc: __(
                        'The name shown on your store page and product listings.',
                        'multivendorx'
                    ),
                },
                {
                    key: 'approve_store',
                    type: 'setting-toggle',
                    label: __(
                        'Timezone',
                        'multivendorx'
                    ),
                    options: [
                        {
                            key: 'manually',
                            label: __('Manual', 'multivendorx'),
                            value: 'manually',
                        },
                        {
                            key: 'automatically',
                            label: __('Automatic', 'multivendorx'),
                            value: 'automatically',
                        },
                    ],
                },
                {
                    key: 'wizardButtons',
                    type: 'buttons',
                    options: [
                        {
                            label: 'Back',
                            action: 'back',
                            btnClass: 'admin-btn btn-red',
                        },
                        {
                            label: 'Next',
                            action: 'next',
                            btnClass: 'admin-btn btn-purple',
                        },
                    ],
                },
            ],
        },
        {
            id: 'store_setup',
            label: 'Business Location',
            icon: 'adminfont-storefront',
            desc: 'Confirm your operating address',
            countBtn: true,
            isWizardMode: true,
            openForm: true,
            formFields: [
                {
                    key: 'approve_store',
                    type: 'setting-toggle',
                    label: __(
                        'Country',
                        'multivendorx'
                    ),
                    options: [
                        {
                            key: 'manually',
                            label: __('United States', 'multivendorx'),
                            value: 'manually',
                        },
                        {
                            key: 'automatically',
                            label: __('United Kingdom', 'multivendorx'),
                            value: 'automatically',
                        },
                        {
                            key: 'automatically',
                            label: __('Canada', 'multivendorx'),
                            value: 'automatically',
                        },
                        {
                            key: 'automatically',
                            label: __('Australia', 'multivendorx'),
                            value: 'automatically',
                        },
                    ],
                },
                {
                    key: 'store_name',
                    type: 'textarea',
                    label: __('Address', 'multivendorx'),
                },
                {
                    key: 'store_name',
                    type: 'text',
                    label: __('City', 'multivendorx'),
                    desc: __(
                        'The name shown on your store page and product listings.',
                        'multivendorx'
                    ),
                },
                {
                    key: 'store_name',
                    type: 'text',
                    label: __('Postcode / ZIP ', 'multivendorx'),
                    desc: __(
                        'The name shown on your store page and product listings.',
                        'multivendorx'
                    ),
                },
                {
                    key: 'wizardButtons',
                    type: 'buttons',
                    options: [
                        {
                            label: 'Back',
                            action: 'back',
                            btnClass: 'admin-btn btn-red',
                        },
                        {
                            label: 'Next',
                            action: 'next',
                            btnClass: 'admin-btn btn-purple',
                        },
                    ],
                },
            ],
        },
        {
            id: 'commission_setup',
            label: 'Payout Method',
            icon: 'adminfont-storefront',
            desc: 'Choose how you receive earnings',
            countBtn: true,
            isWizardMode: true,
            openForm: true,
            formFields: [
                {
                    key: 'commission_settings',
                    type: 'setup',
                    title: 'Bank Transfer',
                    desc: 'Click to configure',
                    hideCheckbox: true,
                    link: `${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=settings&subtab=store-commissions`,
                },
                {
                    key: 'commission_settings',
                    type: 'setup',
                    title: 'PayPal',
                    desc: 'Click to configure',
                    hideCheckbox: true,
                    link: `${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=settings&subtab=store-commissions`,
                },
                {
                    key: 'commission_settings',
                    type: 'setup',
                    title: 'Stripe',
                    desc: 'Click to configure',
                    hideCheckbox: true,
                    link: `${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=settings&subtab=store-commissions`,
                },
                {
                    key: 'commission_settings',
                    type: 'setup',
                    title: 'Other Methods',
                    desc: 'Click to configure',
                    hideCheckbox: true,
                    link: `${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=settings&subtab=store-commissions`,
                },
                {
                    key: 'wizardButtons',
                    type: 'buttons',
                    options: [
                        {
                            label: 'Back',
                            action: 'back',
                            btnClass: 'admin-btn btn-red',
                        },
                        {
                            label: 'Next',
                            action: 'next',
                            btnClass: 'admin-btn btn-purple',
                        },
                    ],
                },
            ],
        },
        {
            id: 'more_settings',
            label: 'Store Policies',
            icon: 'adminfont-storefront',
            desc: "Set your selling rules",
            countBtn: true,
            isWizardMode: true,
            openForm: true,
            formFields: [
                {
                    key: 'store_name',
                    type: 'textarea',
                    label: __('Refund & return policy', 'multivendorx'),
                },
                {
                    key: 'store_name',
                    type: 'textarea',
                    label: __('Shipping terms', 'multivendorx'),
                },
                {
                    key: 'store_name',
                    type: 'textarea',
                    label: __('Store terms and conditions', 'multivendorx'),
                },
                {
                    key: 'wizardButtons',
                    type: 'buttons',
                    options: [
                        {
                            label: 'Back',
                            action: 'back',
                            btnClass: 'admin-btn btn-red',
                        },
                        {
                            label: 'Next',
                            action: 'next',
                            btnClass: 'admin-btn btn-purple',
                        },
                    ],
                },
            ],
        },
        {
            id: 'identity_verification',
            label: 'Identity Verification',
            icon: 'adminfont-storefront',
            desc: "Verify your store details",
            countBtn: true,
            isWizardMode: true,
            openForm: true,
            formFields: [
                {
                    key: 'store_dashboard_site_logo',
                    type: 'file',
                    label: __('Government-issued ID', 'multivendorx'),
                    size: 'small',
                },
                {
                    key: 'store_dashboard_site_logo',
                    type: 'file',
                    label: __('Business address proof', 'multivendorx'),
                    size: 'small',
                },
                {
                    key: 'Registration or tax documents',
                    type: 'file',
                    label: __('Government-issued ID', 'multivendorx'),
                    size: 'small',
                },
                {
                    key: 'wizardButtons',
                    type: 'buttons',
                    options: [
                        {
                            label: 'Back',
                            action: 'back',
                            btnClass: 'admin-btn btn-red',
                        },
                        {
                            label: 'Next',
                            action: 'next',
                            btnClass: 'admin-btn btn-purple',
                        },
                    ],
                },
            ],
        },
        {
            id: 'first_product',
            label: 'First Product',
            icon: 'adminfont-storefront',
            desc: "Add at least one item",
            countBtn: true,
            isWizardMode: true,
            openForm: true,
            formFields: [
                {
                    key: 'store_name',
                    type: 'text',
                    label: __('Product title', 'multivendorx'),
                },
                {
                    key: 'store_name',
                    type: 'textarea',
                    label: __('Product description', 'multivendorx'),
                },
                {
                    key: 'store_name',
                    type: 'number',
                    label: __('Price', 'multivendorx'),
                },
                {
                    key: 'store_name',
                    type: 'number',
                    label: __('Inventory', 'multivendorx'),
                },
                {
                    key: 'Registration or tax documents',
                    type: 'file',
                    label: __('Product images', 'multivendorx'),
                    size: 'small',
                },
                {
                    key: 'wizardButtons',
                    type: 'buttons',
                    options: [
                        {
                            label: 'Back',
                            action: 'back',
                            btnClass: 'admin-btn btn-red',
                        },
                        {
                            label: 'Finish',
                            action: 'next',
                            btnClass: 'admin-btn btn-purple',
                            redirect: `${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=modules`,
                        },
                    ],
                },
            ],
        },
    ];

    const proSettingChanged = (pro: boolean) => {
        console.log('Pro setting change triggered', pro);
    };

    const updateSetting = (key: string, data: any) => {
        setValue(data);
    };

    const hasAccess = () => true;

    return (
        <div className="wizard-container">
            <div>
                <div className="welcome-wrapper">
                    {/* <img src={img} alt="" /> */}
                    <h4 className="wizard-title">
                        Welcome to the MultivendorX family!
                    </h4>
                    <div className="des">
                        Thank you for choosing MultiVendorX! This quick setup
                        wizard will help you configure the basic settings and
                        have your marketplace ready in no time. It’s completely
                        optional and shouldn’t take longer than five minutes.
                    </div>
                </div>

                <ExpandablePanelGroup
                    key={inputField.key}
                    name={inputField.key}
                    proSetting={isProSetting(inputField.proSetting ?? false)}
                    proSettingChanged={() =>
                        proSettingChanged(inputField.proSetting ?? false)
                    }
                    apilink={String(inputField.apiLink)}
                    appLocalizer={appLocalizer}
                    methods={methods}
                    buttonEnable={inputField.buttonEnable}
                    moduleEnabled={inputField.moduleEnabled}
                    value={value}
                    onChange={(data: any) => {
                        if (hasAccess()) {
                            settingChanged.current = true;
                            updateSetting(inputField.key, data);
                        }
                    }}
                    isWizardMode={true}
                    wizardIndex={currentStep}
                    setWizardIndex={setCurrentStep}
                />

                {/* <div className="welcome-wrapper">
                    <div className="wizard-title">! Well Done</div>
                    <div className="des">Thank you for choosing MultiVendorX!</div>
                </div> */}
            </div>
        </div>
    );
};

export default SetupWizard;