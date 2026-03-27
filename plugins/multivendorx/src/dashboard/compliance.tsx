/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { Analytics, ButtonInputUI, Card, Column, Container, ExpandablePanelUI, ItemListUI, Notice, SettingsNavigator } from 'zyra';
import Counter from '@/services/Counter';

const Compliance = (React.FC = () => {
    const SimpleLink = ({ to, children, onClick, className }) => (
        <a href={to} onClick={onClick} className={className}>
            {children}
        </a>
    );

    const getCurrentTabFromUrl = () => {
        const hash = window.location.hash.replace(/^#/, '');
        const hashParams = new URLSearchParams(hash);
        return hashParams.get('subtab') || 'product-compliance';
    };

    const [currentTab, setCurrentTab] = useState(getCurrentTabFromUrl());

    useEffect(() => {
        const handleHashChange = () => setCurrentTab(getCurrentTabFromUrl());
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Build hash URL for a given tab
    const prepareUrl = (tabId: string) => `#subtab=${tabId}`;

    const settingContent = [
        {
            type: 'file',
            content: {
                id: 'product-compliance',
                headerTitle: __('Product Compliance', 'multivendorx'),
                hideSettingHeader: true,
                headerIcon: 'tools',
            },
        },
        {
            type: 'file',
            content: {
                id: 'tax-compliance',
                headerTitle: __('Tax Compliance ', 'multivendorx'),
                hideSettingHeader: true,
                headerIcon: 'tools',
            },
        },
        {
            type: 'file',
            content: {
                id: 'my-products',
                headerTitle: __('My Products ', 'multivendorx'),
                hideSettingHeader: true,
                headerIcon: 'announcement',
            },
        },
        {
            type: 'file',
            content: {
                id: 'store-verification',
                headerTitle: __('Store Verification', 'multivendorx'),
                hideSettingHeader: true,
                headerIcon: 'announcement',
            },
        },
        {
            type: 'file',
            content: {
                id: 'legal-compliance',
                headerTitle: __('Legal Compliance', 'multivendorx'),
                hideSettingHeader: true,
                headerIcon: 'announcement',
            },
        },
    ];
    const overviewData = [
        {
            id: 'total_order_amount',
            label: __('Total Products', 'multivendorx'),
            count: 24,
            icon: 'order',
        },
        {
            id: 'facilitator_fee',
            label: __('Issues Found', 'multivendorx'),
            count: 5,
            icon: 'facilitator',
            module: 'facilitator',
        },
        {
            id: 'gateway_fee',
            label: __('Compliant', 'multivendorx'),
            count: 20,
            icon: 'credit-card',
            condition: false,
        }
    ];

    // expendable
    const [value, setValue] = useState({
        marketplace_setup: {
            store_selling_mode: 'default',
        },
        commission_setup: {
            disbursement_order_status: ['completed'],
        },
        store_setup: {
            approve_store: 'manually',
        },
    });

    const inputField = {
        key: 'setup_wizard',
        proSetting: false,
        apiLink: 'settings',
        modal: [],
    };

    const methods = [
        {
            id: 'marketplace_setup',
            label: __(
                'Choose what kind of marketplace you are building',
                'multivendorx'
            ),
            icon: 'storefront',
            desc: __(
                'This helps us tailor features for your business.',
                'multivendorx'
            ),
            disableBtn: true,
            formFields: [
                {
                    key: 'marketplace_model',
                    type: 'multi-select',
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
                            label: __(
                                'Subscription marketplace',
                                'multivendorx'
                            ),
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
                        },
                    ],
                }
            ],
        },
        {
            id: 'store_setup',
            label: __('Configure Your Store', 'multivendorx'),
            icon: 'storefront',
            desc: __('How stores sell on your marketplace.', 'multivendorx'),
            formFields: [
                {
                    key: 'approve_store',
                    type: 'choice-toggle',

                    label: __('Store registration approval', 'multivendorx'),

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
            ],
        },
        {
            id: 'commission_setup',
            label: __(
                'How marketplace commission is calculated',
                'multivendorx'
            ),
            icon: 'storefront',
            desc: __(
                'Decide how your marketplace earns money.',
                'multivendorx'
            ),
            formFields: [
                {
                    key: 'commission_type',
                    type: 'choice-toggle',
                    label: __('How commission is calculated', 'multivendorx'),
                    settingDescription: __(
                        'Choose how marketplace commission is applied.',
                        'multivendorx'
                    ),
                    desc: `<ul>
                                <li>${__('Store order based - Calculated on the full order amount of each store.', 'multivendorx')}</li>
                                <li>${__('Per item based - Applied to each product in the order.', 'multivendorx')}</li>
                                </ul>`,
                    options: [
                        {
                            key: 'store_order',
                            label: __('Store order based', 'multivendorx'),
                            value: 'store_order',
                        },
                        {
                            key: 'per_item',
                            label: __('Per item based', 'multivendorx'),
                            value: 'per_item',
                        },
                    ],
                },
            ],
        },
        {
            id: 'more_settings',
            label: __('Want to configure more settings?', 'multivendorx'),
            icon: 'storefront',
            desc: __(
                "You're all set with the basics! Use the quick links below to fine-tune your marketplace now — or come back later anytime.",
                'multivendorx'
            ),
            formFields: [
                {
                    key: 'commission_settings',
                    type: 'button',
                    name: __('Setup', 'multivendorx'),
                    desc: __(
                        'Adjust commission rules and payout behavior.',
                        'multivendorx'
                    ),
                    onClick: () => {
                        window.open(
                            `${appLocalizer.admin_url}admin.php?page=multivendorx#&tab=settings&subtab=commissions`,
                            '_blank'
                        );
                    },
                },
            ],
        },
    ];
    const getForm = (tabId: string) => {
        switch (tabId) {
            case 'product-compliance':
                return (
                    <Container>
                        <Notice
                            type="info"
                            displayPosition="inline-notice"
                            message={__('All product listings must follow platform guidelines. Branded or regulated products require authenticity certificates. Upload the required documents to keep your listings active.', 'multivendorx')}
                        />
                        <Column row>
                            <Card
                                title={__('Product Images & Descriptions', 'multivendorx')}
                                // desc={__('Each product listing must have at least one clear image and an accurate description matching the actual item being sold.', 'multivendorx')}
                                action={
                                    <>
                                        <span className="admin-badge red">Incomplete</span>
                                    </>
                                }
                            >
                                <Notice
                                    type="warning"
                                    displayPosition="inline-notice"
                                    message={__('3 of your products are missing descriptions or have low-quality images. Fix them to avoid listing suspension.', 'multivendorx')}
                                />
                            </Card>
                            <Card
                                title={__('Product Authenticity Certificates', 'multivendorx')}>
                                <ItemListUI
                                    className="mini-card"
                                    // background
                                    border
                                    items={[
                                        {
                                            title: __('Nike Air Max — Authenticity Certificate', 'multivendorx'),
                                            desc: __(
                                                'Brand: Nike · Added Mar 12, 2026',
                                                'multivendorx'
                                            ),
                                            tags: (
                                                <>
                                                    <span className="admin-badge green">
                                                        {__('Verified', 'multivendorx')}
                                                    </span>
                                                    <ButtonInputUI
                                                        buttons={[
                                                            {
                                                                icon: 'export',
                                                                text: __('Replace', 'multivendorx'),
                                                                color: 'red'
                                                            },
                                                        ]}
                                                    />
                                                </>
                                            ),
                                        },
                                        {
                                            title: __('Nike Air Max — Authenticity Certificate', 'multivendorx'),
                                            desc: __(
                                                'Brand: Nike · Added Mar 12, 2026',
                                                'multivendorx'
                                            ),
                                            tags: (
                                                <>
                                                    <span className="admin-badge red">
                                                        {__('Missing', 'multivendorx')}
                                                    </span>
                                                    <ButtonInputUI
                                                        buttons={[
                                                            {
                                                                icon: 'export',
                                                                text: __('Upload', 'multivendorx'),
                                                            },
                                                        ]}
                                                    />
                                                </>
                                            ),
                                        },
                                    ]}
                                />
                            </Card>
                        </Column>

                        <Column row>
                            <Card
                                title={__('Safety Certifications', 'multivendorx')}
                                action={
                                    <>
                                        <span className="admin-badge yellow">{__('Not Uploaded', 'multivendorx')}</span>
                                    </>
                                }>
                                <ItemListUI
                                    className="mini-card"
                                    // background
                                    border
                                    items={[
                                        {
                                            title: __('Safety / Quality Certification', 'multivendorx'),
                                            desc: __(
                                                'e.g. CE, BIS, ISO, FDA — PDF or image, max 10MB',
                                                'multivendorx'
                                            ),
                                            tags: (
                                                <>
                                                    <span className="admin-badge blue">
                                                        {__('Optional', 'multivendorx')}
                                                    </span>
                                                    <ButtonInputUI
                                                        buttons={[
                                                            {
                                                                icon: 'export',
                                                                text: __('Replace', 'multivendorx'),
                                                                color: 'red'
                                                            },
                                                        ]}
                                                    />
                                                </>
                                            ),
                                        }
                                    ]}
                                />
                                <Notice
                                    type="info"
                                    displayPosition="inline-notice"
                                    message={__('Recommended for electronics, cosmetics, and baby products to build buyer confidence.', 'multivendorx')}
                                />
                            </Card>

                            <Card
                                title={__('Product Abuse Reporting', 'multivendorx')}>
                                <ItemListUI
                                    className="badge-list"
                                    items={[
                                        { title: __('Counterfeit / Fake item', 'multivendorx') },
                                        { title: __('Incorrect description', 'multivendorx') },
                                        { title: __('Prohibited category', 'multivendorx') },
                                        { title: __('Offensive content', 'multivendorx') },
                                        { title: __('Misleading images', 'multivendorx') },
                                    ]} />
                                <Notice
                                    type="warning"
                                    displayPosition="inline-notice"
                                    message={__('Multiple reports can result in product removal or account penalties. Ensure all listings comply with platform guidelines.', 'multivendorx')}
                                />
                            </Card>
                        </Column>
                    </Container>
                );
            case 'tax-compliance':
                return (
                    <Container>
                         <Notice
                            type="error"
                            displayPosition="inline-notice"
                            title={__('Payouts Currently On Hold', 'multivendorx')}
                            message={__('Your bank account verification is pending. Payouts will be released within 2–3 business days once your bank details and tax documents are verified by our team.', 'multivendorx')}
                        />
                        <Column grid={6}>
                            <Card
                                title={__('Bank Account Details', 'multivendorx')}
                                action={
                                    <>
                                        <span className="admin-badge yellow">{__('Pending Verification', 'multivendorx')}</span>
                                    </>}>
                                <ItemListUI
                                    className="mini-card"
                                    // background
                                    border
                                    items={[
                                        {
                                            title: __('Cancelled Cheque / Bank Statement', 'multivendorx'),
                                            desc: __(
                                                'Must show your name, account number, and IFSC / routing code',
                                                'multivendorx'
                                            ),
                                            tags: (
                                                <>
                                                    <span className="admin-badge green">
                                                        {__('Under Review', 'multivendorx')}
                                                    </span>
                                                    <ButtonInputUI
                                                        buttons={[
                                                            {
                                                                icon: 'export',
                                                                text: __('Replace', 'multivendorx'),
                                                                color: 'red'
                                                            },
                                                        ]}
                                                    />
                                                </>
                                            ),
                                        }
                                    ]}
                                />
                            </Card>
                            <Card
                                title={__('Business Registration', 'multivendorx')}>
                                <ItemListUI
                                    className="mini-card"
                                    // background
                                    border
                                    items={[
                                        {
                                            title: __('Business Registration Certificate', 'multivendorx'),
                                            desc: __(
                                                'biz_registration_2024.pdf · Uploaded Mar 9, 2026',
                                                'multivendorx'
                                            ),
                                            tags: (
                                                <>
                                                    <span className="admin-badge green">
                                                        {__('Under Review', 'multivendorx')}
                                                    </span>
                                                    <ButtonInputUI
                                                        buttons={[
                                                            {
                                                                icon: 'export',
                                                                text: __('Replace', 'multivendorx'),
                                                                color: 'red'
                                                            },
                                                        ]}
                                                    />
                                                </>
                                            ),
                                        }
                                    ]}
                                />
                            </Card>

                        </Column>

                        <Column grid={6}>
                            <Card
                                title={__('Tax Identification Documents ', 'multivendorx')}
                                action={
                                    <>
                                        <span className="admin-badge blue">{__('Under Review', 'multivendorx')}</span>
                                    </>
                                }>
                                <ItemListUI
                                    className="mini-card"
                                    // background
                                    border
                                    items={[
                                        {
                                            title: __('PAN Card', 'multivendorx'),
                                            desc: __(
                                                'pan_arjun_kumar.pdf · Uploaded Mar 8, 2026',
                                                'multivendorx'
                                            ),
                                            tags: (
                                                <>
                                                    <span className="admin-badge blue">
                                                        {__('Optional', 'multivendorx')}
                                                    </span>
                                                    <ButtonInputUI
                                                        buttons={[
                                                            {
                                                                icon: 'export',
                                                                text: __('Replace', 'multivendorx'),
                                                                color: 'red'
                                                            },
                                                        ]}
                                                    />
                                                </>
                                            ),
                                        },
                                        {
                                            title: __('GST Registration Certificate', 'multivendorx'),
                                            desc: __(
                                                'gst_cert_2024.pdf · Uploaded Mar 9',
                                                'multivendorx'
                                            ),
                                            tags: (
                                                <>
                                                    <span className="admin-badge blue">
                                                        {__('Under Review', 'multivendorx')}
                                                    </span>
                                                    <ButtonInputUI
                                                        buttons={[
                                                            {
                                                                icon: 'export',
                                                                text: __('Replace', 'multivendorx'),
                                                                color: 'red'
                                                            },
                                                        ]}
                                                    />
                                                </>
                                            ),
                                        },
                                        {
                                            title: __('VAT / TIN / EIN', 'multivendorx'),
                                            desc: __(
                                                'Only if applicable in your region',
                                                'multivendorx'
                                            ),
                                            tags: (
                                                <>
                                                    <span className="admin-badge blue">
                                                        {__('Optional', 'multivendorx')}
                                                    </span>
                                                    <ButtonInputUI
                                                        buttons={[
                                                            {
                                                                icon: 'export',
                                                                text: __('Replace', 'multivendorx'),
                                                                color: 'red'
                                                            },
                                                        ]}
                                                    />
                                                </>
                                            ),
                                        }
                                    ]}
                                />
                            </Card>
                            <div>  </div>
                        </Column>
                    </Container>
                );
            case 'my-products':
                return (
                    <>
                        <Analytics
                            cols={3}
                            data={overviewData.map((item, idx) => ({
                                icon: item.icon,
                                iconClass: `admin-color${idx + 2}`,
                                number: item.count,
                                text: __(item.label, 'multivendorx'),
                            }))}
                        />
                        <Notice
                            type="error"
                            displayPosition="inline-notice"
                            message={__('5 products have compliance issues. Fix them to keep listings active and avoid restrictions.', 'multivendorx')}
                        />
                    </>
                );
            case 'store-verification':
                return (
                    <Container>
                        <Column grid={6}>
                            <Card
                                title={__('Identity Verification', 'multivendorx')}>
                                <ItemListUI
                                    className="mini-card"
                                    // background
                                    border
                                    items={[
                                        {
                                            title: __('Business Registration Certificate', 'multivendorx'),
                                            desc: __(
                                                'Confirms the store is legally registered as a business entity.',
                                                'multivendorx'
                                            ),
                                            tags: (
                                                <>
                                                    <span className="admin-badge green">
                                                        {__('Under Review', 'multivendorx')}
                                                    </span>
                                                    <ButtonInputUI
                                                        buttons={[
                                                            {
                                                                icon: 'export',
                                                                text: __('Replace', 'multivendorx'),
                                                                color: 'red'
                                                            },
                                                        ]}
                                                    />
                                                </>
                                            ),
                                        },
                                        {
                                            title: __('Trade License or Permit', 'multivendorx'),
                                            desc: __(
                                                'Validates the store is authorised to operate and conduct business legally.',
                                                'multivendorx'
                                            ),
                                            tags: (
                                                <>
                                                    {/* <span className="admin-badge green">
                                                        {__('Under Review', 'multivendorx')}
                                                    </span> */}
                                                    <ButtonInputUI
                                                        buttons={[
                                                            {
                                                                icon: 'export',
                                                                text: __('Replace', 'multivendorx'),
                                                                color: 'red'
                                                            },
                                                        ]}
                                                    />
                                                </>
                                            ),
                                        },
                                        {
                                            title: __('Address Proof of Business Location', 'multivendorx'),
                                            desc: __(
                                                'Confirms the stores physical or operational business address.',
                                                'multivendorx'
                                            ),
                                            tags: (
                                                <>
                                                    {/* <span className="admin-badge green">
                                                        {__('Under Review', 'multivendorx')}
                                                    </span> */}
                                                    <ButtonInputUI
                                                        buttons={[
                                                            {
                                                                icon: 'export',
                                                                text: __('Upload', 'multivendorx'),
                                                                color: 'green'
                                                            },
                                                        ]}
                                                    />
                                                </>
                                            ),
                                        }
                                    ]}
                                />
                            </Card>

                        </Column>

                        <Column grid={6}>
                            <Card title={__('Social Verification', 'multivendorx')}>
                                <ExpandablePanelUI
                                    key={inputField.key}
                                    name={inputField.key}
                                    // proSetting={isProSetting(inputField.proSetting ?? false)}
                                    // proSettingChanged={() =>
                                    // 	proSettingChanged(inputField.proSetting ?? false)
                                    // }
                                    apilink={String(inputField.apiLink)}
                                    appLocalizer={appLocalizer}
                                    methods={methods}
                                    buttonEnable={inputField.buttonEnable}
                                    moduleEnabled={inputField.moduleEnabled}
                                    value={value}
                                    onChange={(data: any) => {
                                        // if (hasAccess()) {
                                        // 	settingChanged.current = true;
                                        // 	updateSetting(inputField.key, data);
                                        // }
                                    }}
                                />
                            </Card>
                        </Column>
                    </Container>
                );
            case 'legal-compliance':
                return (
                    <div>store-verification</div>
                );
            default:
                return <div></div>;
        }
    };
    return (
        <>
            <SettingsNavigator
                settingContent={settingContent}
                currentSetting={currentTab}
                getForm={getForm}
                prepareUrl={prepareUrl}
                menuIcon={true}
                appLocalizer={appLocalizer}
                settingName="Compliance"
                variant={'compact'}
                Link={SimpleLink}
            />
        </>
    );
});

export default Compliance;
