import { __ } from '@wordpress/i18n';

export const temp1 = {
    id: 'store-registration',
    name: __('Store Registration', 'multivendorx'),
    previewText: __('Welcome to our marketplace! Complete your store setup to get started.', 'multivendorx'),
    blocks: [
        {
            id: 1,
            type: 'heading',
            name: 'email-heading',
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
            id: 2,
            type: 'richtext',
            name: 'email-text',
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
            id: 3,
            type: 'button',
            name: 'email-button',
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
};