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
            'approve_store' : 'manually'
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
            label: 'Choose what kind of marketplace you are building',
            icon: 'adminfont-storefront',
            desc: 'This helps us tailor features for your business.',
            countBtn: true,
            isWizardMode: true,
            openForm:true,
            formFields: [
                {
                    key: 'marketplace_model',
                    type: 'multi-select',
                    selectType: 'single-select',
                    label: __(
                        'What kind of marketplace you are building',
                        'multivendorx'
                    ),
                    options: [
                        {
                            key: 'general',
                            label: __('General marketplace', 'multivendorx'),
                            value: 'general',
                        },
                        {
                            key: 'product',
                            label: __('Product marketplace', 'multivendorx'),
                            value: 'product',
                        },
                        {
                            key: 'rental',
                            label: __('Rental marketplace', 'multivendorx'),
                            value: 'rental',
                        },
                        {
                            key: 'auction',
                            label: __('Auction marketplace', 'multivendorx'),
                            value: 'auction',
                        },
                        {
                            key: 'subscription',
                            label: __('Subscription marketplace', 'multivendorx'),
                            value: 'subscription',
                        },
                        {
                            key: 'service',
                            label: __('Service marketplace', 'multivendorx'),
                            value: 'service',
                        },
                        {
                            key: 'mixed',
                            label: __('Mixed marketplace', 'multivendorx'),
                            value: 'mixed',
                        }
                    ],
                },
                {
                    key: 'product_types',
                    type: 'multi-select',
                    selectType: 'multi-select',
                    label: __(
                        'What kind of listings stores can create',
                        'multivendorx'
                    ),
                    options: [
                        {
                            key: 'simple',
                            label: __('Simple', 'multivendorx'),
                            value: 'simple',
                        },
                        {
                            key: 'variable',
                            label: __('Variable', 'multivendorx'),
                            value: 'variable',
                        },
                        {
                            key: 'booking',
                            label: __('Booking', 'multivendorx'),
                            value: 'booking',
                        },
                        {
                            key: 'subscription',
                            label: __('Subscription', 'multivendorx'),
                            value: 'subscription',
                        },
                        {
                            key: 'rental',
                            label: __('Rental', 'multivendorx'),
                            value: 'rental',
                        },
                        {
                            key: 'auction',
                            label: __('Auction', 'multivendorx'),
                            value: 'auction',
                        },
                        {
                            key: 'accommodation',
                            label: __('Accommodation', 'multivendorx'),
                            value: 'accommodation',
                        },
                    ],
                },
                {
                    key: 'notice',
                    type: 'blocktext',
                    label: __(' ', 'multivendorx'),
                    blocktext: __(
                        'Ready to unlock the full potential of your marketplace? Activate Woocommerce Rental with MultiVendorX Pro and start selling like a pro today!',
                        'multivendorx'
                    ),
                    dependent: {
                        key: 'marketplace_model',
                        value: 'rental',
                    },
                },
                {
                    key: 'notice',
                    type: 'blocktext',
                    label: __(' ', 'multivendorx'),
                    blocktext: __(
                        'Ready to unlock the full potential of your marketplace? Activate Woocommerce Simple Auction with MultiVendorX Pro and start selling like a pro today!',
                        'multivendorx'
                    ),
                    dependent: {
                        key: 'marketplace_model',
                        value: 'auction',
                    },
                },
                {
                    key: 'notice',
                    type: 'blocktext',
                    label: __(' ', 'multivendorx'),
                    blocktext: __(
                        'Ready to unlock the full potential of your marketplace? Activate Woocommerce Subscription with MultiVendorX Pro and start selling like a pro today!',
                        'multivendorx'
                    ),
                    dependent: {
                        key: 'marketplace_model',
                        value: 'subscription',
                    },
                },
                {
                    key: 'store_selling_mode',
                    type: 'setting-toggle',
                    label: __(
                        'How stores sell on your marketplace',
                        'multivendorx'
                    ),
                    desc: __('Choose how listings are created and sold by stores.', 'multivendorx'),
                    options: [
                        {
                            key: 'default',
                            label: __('Own listing', 'multivendorx'),
                            value: 'default',
                        },
                        {
                            key: 'single_product_multiple_vendor',
                            label: __('Shared listing', 'multivendorx'),
                            value: 'single_product_multiple_vendor',
                        },
                        {
                            key: 'franchise',
                            label: __('Franchise', 'multivendorx'),
                            value: 'franchise',
                            proSetting: true
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
            label: 'Configure Your Store',
            icon: 'adminfont-storefront',
            desc: 'How stores sell on your marketplace.',
            countBtn: true,
            isWizardMode: true,
            openForm:true,
            formFields: [
                {
                    key: 'approve_store',
                    type: 'setting-toggle',
                    label: __(
                        'Store registration approval',
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
            id: 'commission_setup',
            label: 'How marketplace commission is calculated',
            icon: 'adminfont-storefront',
            desc: 'Decide how your marketplace earns money.',
            countBtn: true,
            isWizardMode: true,
            openForm:true,
            formFields: [
                {
                    key: 'commission_type',
                    type: 'setting-toggle',
                    label: __('How commission is calculated', 'multivendorx'),
                    settingDescription: __(
                        'Choose how marketplace commission is applied.',
                        'multivendorx'
                    ),
                    desc: __(
                        '<ul><li>Store order based - Calculated on the full order amount of each store. Example: A customer buys from 3 stores → commission applies separately to each store’s order.</li><li>Per item based - Applied to each product in the order. Example: An order with 5 items → commission applies 5 times, once per item.</li></ul>',
                        'multivendorx'
                    ),
                    options: [
                        {
                            key: 'store_order',
                            label: __('Store order based', 'multivendorx'),
                            value: 'store_order',
                        },
                        {
                            key: 'item',
                            label: __('Per item based', 'multivendorx'),
                            value: 'item',
                        },
                    ],
                },
                {
                    key: 'commission_value',
                    type: 'nested',
                    label: 'Commission value',
                    single: true,
                    desc: __(
                        'Set global commission rates that apply to each individual item quantity. Commission will be calculated by multiplying the rate with the total number of items across all products in the order.',
                        'multivendorx'
                    ),
                    nestedFields: [
                        {
                            key: 'commission_fixed',
                            type: 'number',
                            preInsideText: __('$', 'multivendorx'),
                            size: '8rem',
                            preText: 'Fixed',
                            postText: '+',
                        },
                        {
                            key: 'commission_percentage',
                            type: 'number',
                            postInsideText: __('%', 'multivendorx'),
                            size: '8rem',
                        },
                    ],
                },
                {
                    key: 'disbursement_order_status',
                    type: 'multi-checkbox',
                    label: __(
                        'When stores earn money',
                        'multivendorx'
                    ),
                    settingDescription: __(
                        'Choose when store earnings are added to their wallet.',
                        'multivendorx'
                    ),
                     
                    options: [
                        {
                            key: 'completed',
                            label: __('Completed', 'multivendorx'),
                            value: 'completed',
                        },
                        {
                            key: 'delivered',
                            label: __('Delivered', 'multivendorx'),
                            value: 'delivered',
                            proSetting: true,
                        },
                        {
                            key: 'processing',
                            label: __('Processing', 'multivendorx'),
                            value: 'processing',
                        },
                        {
                            key: 'shipped',
                            label: __('Shipped', 'multivendorx'),
                            value: 'shipped',
                            proSetting: true,
                        },
                    ],
                    selectDeselect: true,
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
            label: 'Want to configure more settings?',
            icon: 'adminfont-storefront',
            desc: "You're all set with the basics! Use the quick links below to fine-tune your marketplace now — or come back later anytime.",
            countBtn: true,
            isWizardMode: true,
            openForm:true,
            formFields: [
                {
                    key: 'commission_settings',
                    type: 'setup',
                    title: 'Commission settings',
                    desc: 'Adjust commission rules and payout behavior.',
                    hideCheckbox: true,
                    link: `${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=settings&subtab=store-commissions`,
                },
                {
                    key: 'commission_settings',
                    type: 'setup',
                    title: 'Commission settings',
                    desc: 'Adjust commission rules and payout behavior.',
                    hideCheckbox: true,
                    link: `${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=settings&subtab=store-commissions`,
                },
                {
                    key: 'commission_settings',
                    type: 'setup',
                    title: 'Commission settings',
                    desc: 'Adjust commission rules and payout behavior.',
                    hideCheckbox: true,
                    link: `${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=settings&subtab=store-commissions`,
                },
                {
                    key: 'commission_settings',
                    type: 'setup',
                    title: 'Commission settings',
                    desc: 'Adjust commission rules and payout behavior.',
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