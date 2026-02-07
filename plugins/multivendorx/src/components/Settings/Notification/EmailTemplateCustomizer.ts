import { __ } from '@wordpress/i18n';
import { createBlock } from '/home/techmonastic/Documents/Shivam/multivendorx/packages/js/zyra/src/components/block/blockCore';

export default {
    id: 'email-template-customizer',
    priority: 3,
    name: __('Email Template Customizer', 'multivendorx'),
    desc: __(
        'Edit and manage individual email templates used across the marketplace.',
        'multivendorx'
    ),
    icon: 'adminfont-store-seo',
    submitUrl: 'settings',
    modal: [
        {
            key: 'store_registration_from',
            type: 'email-template',
            classes: 'full-width',
            desc: 'Customise personalised store registration form for marketplace.',
            // Add templates configuration with proper content
            templates: [
                {
                    id: 'store-registration',
                    name: __('Store Registration', 'multivendorx'),
                    previewText: __('Welcome to our marketplace! Complete your store setup to get started.', 'multivendorx'),
                    blocks: [
                        {
                            ...createBlock('heading'),
                            id: 1,
                            label: 'Welcome Heading',
                            text: __('Welcome to Our Marketplace', 'multivendorx'),
                            level: 2,
                            style: {
                                backgroundColor: '#ffffff',
                                color: '#333333',
                                fontSize: 24,
                                fontWeight: 'bold',
                                paddingTop: 20,
                                paddingBottom: 20,
                                textAlign: 'center',
                            }
                        },
                        {
                            ...createBlock('richtext'),
                            id: 2,
                            label: 'Welcome Message',
                            html: __('<p>Thank you for registering your store with <strong>MultiVendorX Marketplace</strong>!</p><p>Please complete your store setup to start selling products and reach thousands of customers.</p>', 'multivendorx'),
                            style: {
                                backgroundColor: '#ffffff',
                                color: '#555555',
                                fontSize: 16,
                                lineHeight: 1.6,
                                paddingTop: 10,
                                paddingBottom: 20,
                            }
                        },
                        {
                            ...createBlock('button'),
                            id: 3,
                            label: 'Complete Setup',
                            text: __('Complete Store Setup', 'multivendorx'),
                            url: '#',
                            style: {
                                backgroundColor: '#007cba',
                                color: '#ffffff',
                                fontSize: 16,
                                fontWeight: 'bold',
                                paddingTop: 12,
                                paddingRight: 30,
                                paddingBottom: 12,
                                paddingLeft: 30,
                                borderRadius: 5,
                                textAlign: 'center',
                                marginTop: 20,
                                marginBottom: 20,
                            }
                        },
                    ],
                },
                {
                    id: 'vendor-approval',
                    name: __('Vendor Approval', 'multivendorx'),
                    previewText: __('Congratulations! Your store has been approved and is now live.', 'multivendorx'),
                    blocks: [
                        {
                            ...createBlock('heading'),
                            id: 1,
                            label: 'Approval Heading',
                            text: __('Congratulations! Your Store is Approved', 'multivendorx'),
                            level: 2,
                            style: {
                                backgroundColor: '#f0f9ff',
                                color: '#0369a1',
                                fontSize: 24,
                                fontWeight: 'bold',
                                paddingTop: 20,
                                paddingBottom: 20,
                                textAlign: 'center',
                                borderRadius: 8,
                            }
                        },
                        {
                            ...createBlock('richtext'),
                            id: 2,
                            label: 'Approval Message',
                            html: __('<p><strong>Great news!</strong> Your store registration has been approved by our admin team.</p><p>Your store is now live and visible to customers. You can:</p><ul><li>Add products to your catalog</li><li>Manage orders and shipments</li><li>Update store settings and policies</li><li>View your sales dashboard</li></ul>', 'multivendorx'),
                            style: {
                                backgroundColor: '#ffffff',
                                color: '#555555',
                                fontSize: 16,
                                lineHeight: 1.6,
                                paddingTop: 20,
                                paddingRight: 20,
                                paddingBottom: 20,
                                paddingLeft: 20,
                                borderLeft: '4px solid #10b981',
                            }
                        },
                        {
                            ...createBlock('divider'),
                            id: 3,
                            label: 'Content Divider',
                            style: {
                                backgroundColor: '#e5e7eb',
                                height: '2px',
                                marginTop: 30,
                                marginBottom: 30,
                                width: '100%',
                            }
                        },
                        {
                            ...createBlock('button'),
                            id: 4,
                            label: 'Go to Dashboard',
                            text: __('Visit Your Dashboard', 'multivendorx'),
                            url: '#',
                            style: {
                                backgroundColor: '#10b981',
                                color: '#ffffff',
                                fontSize: 16,
                                fontWeight: 'bold',
                                paddingTop: 12,
                                paddingRight: 30,
                                paddingBottom: 12,
                                paddingLeft: 30,
                                borderRadius: 5,
                                textAlign: 'center',
                                marginTop: 10,
                                marginBottom: 20,
                            }
                        },
                    ],
                },
                {
                    id: 'new-order',
                    name: __('New Order Notification', 'multivendorx'),
                    previewText: __('New order received! Check details and start processing.', 'multivendorx'),
                    blocks: [
                        {
                            ...createBlock('heading'),
                            id: 1,
                            label: 'Order Heading',
                            text: __('New Order Received!', 'multivendorx'),
                            level: 2,
                            style: {
                                backgroundColor: '#fff7ed',
                                color: '#ea580c',
                                fontSize: 24,
                                fontWeight: 'bold',
                                paddingTop: 20,
                                paddingBottom: 20,
                                textAlign: 'center',
                                borderRadius: 8,
                            }
                        },
                        {
                            ...createBlock('richtext'),
                            id: 2,
                            label: 'Order Notification',
                            html: __('<p>You have received a new order from a customer. Here are the quick details:</p><div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;"><p><strong>Order ID:</strong> #ORD-2024-00123</p><p><strong>Customer:</strong> John Doe</p><p><strong>Total Amount:</strong> $149.99</p><p><strong>Order Date:</strong> January 15, 2024</p></div><p>Please process this order as soon as possible to ensure timely delivery.</p>', 'multivendorx'),
                            style: {
                                backgroundColor: '#ffffff',
                                color: '#555555',
                                fontSize: 16,
                                lineHeight: 1.6,
                                paddingTop: 20,
                                paddingBottom: 20,
                            }
                        },
                        {
                            ...createBlock('columns'),
                            id: 3,
                            label: 'Action Buttons',
                            layout: '2-50',
                            columns: [
                                [
                                    {
                                        ...createBlock('button'),
                                        id: 31,
                                        label: 'View Order',
                                        text: __('View Order Details', 'multivendorx'),
                                        url: '#',
                                        style: {
                                            backgroundColor: '#3b82f6',
                                            color: '#ffffff',
                                            fontSize: 14,
                                            fontWeight: 'bold',
                                            paddingTop: 10,
                                            paddingRight: 20,
                                            paddingBottom: 10,
                                            paddingLeft: 20,
                                            borderRadius: 5,
                                            width: '100%',
                                            textAlign: 'center',
                                        }
                                    }
                                ],
                                [
                                    {
                                        ...createBlock('button'),
                                        id: 32,
                                        label: 'Process Order',
                                        text: __('Process Order', 'multivendorx'),
                                        url: '#',
                                        style: {
                                            backgroundColor: '#10b981',
                                            color: '#ffffff',
                                            fontSize: 14,
                                            fontWeight: 'bold',
                                            paddingTop: 10,
                                            paddingRight: 20,
                                            paddingBottom: 10,
                                            paddingLeft: 20,
                                            borderRadius: 5,
                                            width: '100%',
                                            textAlign: 'center',
                                        }
                                    }
                                ]
                            ],
                            style: {
                                backgroundColor: '#ffffff',
                                paddingTop: 20,
                                paddingBottom: 20,
                            }
                        },
                    ],
                },
            ],
            defaultTemplateId: 'store-registration',
        },
    ]
};
