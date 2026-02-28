// FreeVsProTab.tsx

import React from 'react';
import { Card, Column } from 'zyra';
import { __ } from '@wordpress/i18n';
import freePro from '../../assets/images/dashboard-1.png';
interface Feature {
    name: string;
    free: boolean | string;
    pro: boolean | string;
}

interface Section {
    title: string;
    features: Feature[];
}
const sections: Section[] = [
    {
        title: __('Product & store tools', 'multivendorx'),
        features: [
            {
                name: __('Multiple stores per product', 'multivendorx'),
                free: true,
                pro: true,
            },
            { name: __('Store policies', 'multivendorx'), free: true, pro: true },
            { name: __('Store reviews', 'multivendorx'), free: true, pro: true },
            { name: __('Follow store', 'multivendorx'), free: true, pro: true },
            {
                name: __('Privacy controls to show/hide store details)', 'multivendorx'),
                free: true,
                pro: true,
            },
            {
                name: __('Confirm vendor identity with documents', 'multivendorx'),
                free: false,
                pro: true,
            },
            {
                name: __('Bulk upload/download product via CSV', 'multivendorx'),
                free: false,
                pro: true,
            },
            {
                name: __('Display store opening/closing times', 'multivendorx'),
                free: false,
                pro: true,
            },
            {
                name: __('Store can temporarily close shop with customer notice', 'multivendorx'),
                free: false,
                pro: true,
            },
            {
                name: __('Assign assistants to your store and control what they can access', 'multivendorx'),
                free: false,
                pro: true,
            },
        ],
    },
    {
        title: __(' Get paid without hassle', 'multivendorx'),
        features: [
            { name: __('Bank transfer', 'multivendorx'), free: true, pro: true },
            { name: __('PayPal payout', 'multivendorx'), free: true, pro: true },
            { name: __('Stripe connect', 'multivendorx'), free: true, pro: true },
            { name: __('Razorpay', 'multivendorx'), free: true, pro: true },
            { name: __('Real-time split payments', 'multivendorx'), free: false, pro: true },
        ],
    },
    {
        title: __(' Deliver seamless shopping experiences', 'multivendorx'),
        features: [
            { name: __('Product Q&A', 'multivendorx'), free: true, pro: true },
            { name: __('Marketplace refunds', 'multivendorx'), free: true, pro: true },
            { name: __('Announcements', 'multivendorx'), free: true, pro: true },
            { name: __('Product abuse report', 'multivendorx'), free: true, pro: true },
            { name: __('Invoices & packing slips', 'multivendorx'), free: false, pro: true },
            { name: __('Live chat', 'multivendorx'), free: false, pro: true },
            { name: __('Customer support', 'multivendorx'), free: false, pro: true },
            { name: __('Product enquiry', 'multivendorx'), free: false, pro: true },
        ],
    },
    {
        title: __(' Ship the way you want', 'multivendorx'),
        features: [
            { name: __('Zone-based shipping', 'multivendorx'), free: true, pro: true },
            { name: __('Distance-based shipping', 'multivendorx'), free: true, pro: true },
            { name: __('Country restrictions', 'multivendorx'), free: true, pro: true },
            { name: __('Weight-based shipping', 'multivendorx'), free: true, pro: true },
            { name: __('Per-product shipping', 'multivendorx'), free: false, pro: true },
        ],
    },
    {
        title: __(' Sell in different ways', 'multivendorx'),
        features: [
            {
                name: __('Optimize store & product SEO with Yoast or Rank Math', 'multivendorx'),
                free: false,
                pro: true,
            },
            {
                name: __('Sales, revenue, and order reports', 'multivendorx'),
                free: false,
                pro: true,
            },
            {
                name: __('Store with different capabilities as per subsctiption plan', 'multivendorx'),
                free: false,
                pro: true,
            },
            { name: __('Paid product promotions', 'multivendorx'), free: false, pro: true },
            {
                name: __('Special pricing & bulk rules for groups', 'multivendorx'),
                free: false,
                pro: true,
            },
            {
                name: __('Low-stock alerts, waitlists, inventory management', 'multivendorx'),
                free: false,
                pro: true,
            },
        ],
    },
    {
        title: __('Automate rules and commissions', 'multivendorx'),
        features: [
            { name: __('Payment gateway fees', 'multivendorx'), free: true, pro: true },
            { name: __('Min/Max quantities', 'multivendorx'), free: true, pro: true },
            { name: __('Facilitator fees', 'multivendorx'), free: false, pro: true },
            { name: __('Marketplace fees', 'multivendorx'), free: false, pro: true },
        ],
    },
];

const FreeVsProTab: React.FC<{}> = () => {
    const renderCell = (value: string | boolean) => {
        if (typeof value === 'boolean') {
            return value ? (
                <i className="check-icon adminfont-check"></i>
            ) : (
                <i className="close-icon adminfont-close"></i>
            );
        }
        return value;
    };

    return (
        <>
            <Column grid={8}>
                <Card
                    title={__('Free vs Pro comparison', 'multivendorx')}
                    desc={__(
                        'See what you get with MultiVendorX Pro',
                        'multivendorx'
                    )}
                    action={
                        <a
                            href="https://multivendorx.com/pricing/"
                            className="admin-btn btn-purple"
                        >
                            {__(
                                'Get Pro Access Today!',
                                'multivendorx'
                            )}
                            <i className="adminfont-arrow-right icon-pro-btn"></i>
                        </a>
                    }
                >
                    <div id="free-vs-pro" className="free-vs-pro">
                        {sections.map((section, idx) => (
                            <table key={idx}>
                                <thead>
                                    <tr>
                                        <td>
                                            {__(
                                                section.title,
                                                'multivendorx'
                                            )}
                                        </td>
                                        <td>
                                            {__('Free', 'multivendorx')}
                                        </td>
                                        <td>
                                            {__('Pro', 'multivendorx')}
                                        </td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {section.features.map(
                                        (feature, i) => (
                                            <tr key={i}>
                                                <td>
                                                    {__(
                                                        feature.name,
                                                        'multivendorx'
                                                    )}
                                                </td>
                                                <td>
                                                    {renderCell(
                                                        feature.free
                                                    )}
                                                </td>
                                                <td>
                                                    {renderCell(
                                                        feature.pro
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        ))}
                    </div>
                </Card>
            </Column>

            <Column grid={4}>
                <Card>
                    <div className="right-pro-banner">
                        <div className="image-wrapper">
                            <img src={freePro} alt="" />
                        </div>

                        <div className="title">
                            {__(
                                'Join 8,000+ successful marketplace owners',
                                'multivendorx'
                            )}
                        </div>

                        <div className="des">
                            {__(
                                'Build, manage, and expand your marketplace with confidence. Loved by entrepreneurs globally.',
                                'multivendorx'
                            )}
                        </div>

                        <ul>
                            <li>
                                <i className="adminfont-check"></i>
                                {__(
                                    'Flexible selling models',
                                    'multivendorx'
                                )}
                            </li>
                            <li>
                                <i className="adminfont-check"></i>
                                {__(
                                    'Effortless inventory control',
                                    'multivendorx'
                                )}
                            </li>
                            <li>
                                <i className="adminfont-check"></i>
                                {__(
                                    'Intelligent alert system',
                                    'multivendorx'
                                )}
                            </li>
                            <li>
                                <i className="adminfont-check"></i>
                                {__(
                                    'Secure seller onboarding',
                                    'multivendorx'
                                )}
                            </li>
                            <li>
                                <i className="adminfont-check"></i>
                                {__(
                                    'Recurring revenue tools',
                                    'multivendorx'
                                )}
                            </li>
                        </ul>

                        <div className="button-wrapper">
                            <a
                                href="https://multivendorx.com/pricing/"
                                className="admin-btn btn-purple"
                            >
                                <i className="adminfont-pro-tag"></i>
                                {__('Upgrade Now', 'multivendorx')}
                                <i className="adminfont-arrow-right icon-pro-btn"></i>
                            </a>

                            <div
                                onClick={() =>
                                    (window.location.href = `?page=multivendorx-setup`)
                                }
                                className="admin-btn"
                            >
                                {__(
                                    'Launch Setup Wizard',
                                    'multivendorx'
                                )}
                                <i className="adminfont-import"></i>
                            </div>
                        </div>
                    </div>
                </Card>
            </Column>
        </>
    );
};

export default FreeVsProTab;