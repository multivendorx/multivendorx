import { __ } from '@wordpress/i18n';

export default {
    id: 'shipping-status',
    priority: 24,
    name: __( 'Shipping Status', 'mvx-pro' ),
    desc: __( 'Shipping Status', 'mvx-pro' ),
    icon: 'adminlib-wholesale',
    submitUrl: 'settings',
    modal: [
        {
            key: 'allow_shipment_tracking',
            label: __( 'Allow Shipment Tracking', 'multivendorx' ),
            desc: __(
                'Enable this option to allow vendors to add and manage shipment tracking details for their orders.',
                'multivendorx'
            ),
            type: 'checkbox',
            options: [
                {
                    key: 'allow_shipment_tracking',
                    value: 'allow_shipment_tracking',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'separator_content',
            type: 'section',
            desc: __( 'Shipping Provider', 'multivendorx' ),
            hint: __(
                'Allow vendors to configure their preferred shipping providers and manage shipping settings.',
                'multivendorx'
            ),
        },
        {
            key: 'australia_post',
            label: __( 'Australia Post', 'multivendorx' ),
            desc: __( 'Enable Australia Post for shipment tracking.', 'multivendorx' ),
            type: 'checkbox',
            options: [
                {
                    key: 'australia_post',
                    value: 'australia_post',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'canada_post',
            label: __( 'Canada Post', 'multivendorx' ),
            desc: __( 'Enable Canada Post for shipment tracking.', 'multivendorx' ),
            type: 'checkbox',
            options: [
                {
                    key: 'canada_post',
                    value: 'canada_post',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'city_link',
            label: __( 'City Link', 'multivendorx' ),
            desc: __( 'Enable City Link for shipment tracking.', 'multivendorx' ),
            type: 'checkbox',
            options: [
                {
                    key: 'city_link',
                    value: 'city_link',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'dhl',
            label: __( 'DHL', 'multivendorx' ),
            desc: __( 'Enable DHL for shipment tracking.', 'multivendorx' ),
            type: 'checkbox',
            options: [
                {
                    key: 'dhl',
                    value: 'dhl',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'dpd',
            label: __( 'DPD', 'multivendorx' ),
            desc: __( 'Enable DPD for shipment tracking.', 'multivendorx' ),
            type: 'checkbox',
            options: [
                {
                    key: 'dpd',
                    value: 'dpd',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'fastway_south_africa',
            label: __( 'Fastway South Africa', 'multivendorx' ),
            desc: __( 'Enable Fastway South Africa for shipment tracking.', 'multivendorx' ),
            type: 'checkbox',
            options: [
                {
                    key: 'fastway_south_africa',
                    value: 'fastway_south_africa',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'fedex',
            label: __( 'FedEx', 'multivendorx' ),
            desc: __( 'Enable FedEx for shipment tracking.', 'multivendorx' ),
            type: 'checkbox',
            options: [
                {
                    key: 'fedex',
                    value: 'fedex',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'ontrack',
            label: __( 'Ontrack', 'multivendorx' ),
            desc: __( 'Enable Ontrack for shipment tracking.', 'multivendorx' ),
            type: 'checkbox',
            options: [
                {
                    key: 'ontrack',
                    value: 'ontrack',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'parcelforce',
            label: __( 'ParcelForce', 'multivendorx' ),
            desc: __( 'Enable ParcelForce for shipment tracking.', 'multivendorx' ),
            type: 'checkbox',
            options: [
                {
                    key: 'parcelforce',
                    value: 'parcelforce',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'polish_shipping_providers',
            label: __( 'Polish Shipping Providers', 'multivendorx' ),
            desc: __( 'Enable Polish Shipping Providers for shipment tracking.', 'multivendorx' ),
            type: 'checkbox',
            options: [
                {
                    key: 'polish_shipping_providers',
                    value: 'polish_shipping_providers',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'royal_mail',
            label: __( 'Royal Mail', 'multivendorx' ),
            desc: __( 'Enable Royal Mail for shipment tracking.', 'multivendorx' ),
            type: 'checkbox',
            options: [
                {
                    key: 'royal_mail',
                    value: 'royal_mail',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'tnt_express',
            label: __( 'TNT Express (Reference)', 'multivendorx' ),
            desc: __( 'Enable TNT Express for shipment tracking.', 'multivendorx' ),
            type: 'checkbox',
            options: [
                {
                    key: 'tnt_express',
                    value: 'tnt_express',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'fedex_sameday',
            label: __( 'FedEx Sameday', 'multivendorx' ),
            desc: __( 'Enable FedEx Sameday for shipment tracking.', 'multivendorx' ),
            type: 'checkbox',
            options: [
                {
                    key: 'fedex_sameday',
                    value: 'fedex_sameday',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'ups',
            label: __( 'UPS', 'multivendorx' ),
            desc: __( 'Enable UPS for shipment tracking.', 'multivendorx' ),
            type: 'checkbox',
            options: [
                {
                    key: 'ups',
                    value: 'ups',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'usps',
            label: __( 'USPS', 'multivendorx' ),
            desc: __( 'Enable USPS for shipment tracking.', 'multivendorx' ),
            type: 'checkbox',
            options: [
                {
                    key: 'usps',
                    value: 'usps',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'dhl_us',
            label: __( 'DHL US', 'multivendorx' ),
            desc: __( 'Enable DHL US for shipment tracking.', 'multivendorx' ),
            type: 'checkbox',
            options: [
                {
                    key: 'dhl_us',
                    value: 'dhl_us',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'other_shipping',
            label: __( 'Other', 'multivendorx' ),
            desc: __( 'Enable other shipping providers for shipment tracking.', 'multivendorx' ),
            type: 'checkbox',
            options: [
                {
                    key: 'other_shipping',
                    value: 'other_shipping',
                },
            ],
            look: 'toggle',
        },
        
                
    ],
};
