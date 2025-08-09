import { __ } from '@wordpress/i18n';

export default {
    id: 'product -store-category -control',
    priority: 2,
    name: __( 'Product & Store Category Control', 'multivendorx' ),
    desc: __(
        'Controls how sellers are onboarded and what access they get.',
        'multivendorx'
    ),
    video: {
        icon: 'adminlib-general-tab', // optional icon class
        link: 'https://example.com/video/general-settings',
    },
    docs: {
        icon: 'adminlib-general-tab', // optional icon class
        link: 'https://example.com/docs/general-settings',
    },
    icon: 'adminlib-general-tab',
    submitUrl: 'settings',
    modal: [

        {
            key: 'category_pyramid_guide',
            type: 'checkbox',
            label: __( 'Category assistance (CPG)', 'multivendorx' ),
            desc: __(
                'Help vendors categorize their products accurately with the Category Pyramid Guide.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'category_pyramid_guide',
                    value: 'category_pyramid_guide',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'enable_store_category',
            type: 'setting-toggle',
            label: __( 'Enable Store Category', 'mvx-pro' ),
            options: [
                {
                    key: 'none',
                    label: __( 'None', 'mvx-pro' ),
                    value: 'none',
                },
                {
                    key: 'single',
                    label: __( 'Single', 'mvx-pro' ),
                    value: 'single',
                },
                {
                    key: 'multiple',
                    label: __( 'Multiple', 'mvx-pro' ),
                    value: 'multiple',
                },
            ],
        },
        {
            key: 'show_related_products',
            type: 'select',
            label: __( 'Related Product', 'multivendorx' ),
            desc: __(
                'Let customers view other products related to the product they are viewing..',
                'multivendorx'
            ),
            options: [
                {
                    key: 'all_related',
                    label: __(
                        'Related Products from Entire Store',
                        'multivendorx'
                    ),
                    value: __( 'all_related', 'multivendorx' ),
                },
                {
                    key: 'vendors_related',
                    label: __(
                        'Related Products from Seller Store',
                        'multivendorx'
                    ),
                    value: __( 'vendors_related', 'multivendorx' ),
                },
                {
                    key: 'disable',
                    label: __( 'Disable', 'multivendorx' ),
                    value: __( 'disable', 'multivendorx' ),
                },
            ],
        },
        {
            key: 'section',
            type: 'section',
            hint: __(
                'Single Product Multiple Vendor',
                'multivendorx'
            ),
        },
        {
            key: 'is_singleproductmultiseller',
            type: 'checkbox',
            label: __( 'Allow Vendor to Copy Products', 'multivendorx' ),
            desc: __(
                'Let vendors search for products sold on your site and sell them from their store.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'is_singleproductmultiseller',
                    value: 'is_singleproductmultiseller',
                },
            ],
            look: 'toggle',
            // moduleEnabled: 'spmv',
        },
        {
            key: 'singleproductmultiseller_show_order',
            type: 'select',
            label: __( 'Display Shop Page Product', 'multivendorx' ),
            desc: __(
                'Select the criteria on which the SPMV product is going to be based on.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'min-price',
                    label: __( 'Min Price', 'multivendorx' ),
                    value: __( 'min-price', 'multivendorx' ),
                },
                {
                    key: 'max-price',
                    label: __( 'Max Price', 'multivendorx' ),
                    value: __( 'max-price', 'multivendorx' ),
                },
                {
                    key: 'top-rated-vendor',
                    label: __( 'Top rated vendor', 'multivendorx' ),
                    value: __( 'top-rated-vendor', 'multivendorx' ),
                },
            ],
            dependent: {
                key: 'is_singleproductmultiseller',
                set: true,
            },
            proSetting: true,
            moduleEnabled: 'spmv',
        },
        {
            key: 'moreoffers_display_position',
            type: 'select',
            label: __( 'More Offers Display Position', 'multivendorx' ),
            desc: __(
                'Select where you want the "More Offers" section to appear on the Single Product Page.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'none',
                    label: __( 'None', 'multivendorx' ),
                    value: 'none',
                },
                {
                    key: 'above-tabs',
                    label: __( 'Above Single Page Product Tabs', 'multivendorx' ),
                    value: 'above-tabs',
                },
                {
                    key: 'inside-tabs',
                    label: __( 'Display Inside Single Page Product Tabs', 'multivendorx' ),
                    value: 'inside-tabs',
                },
                {
                    key: 'after-tabs',
                    label: __( 'After Single Page Product Tabs', 'multivendorx' ),
                    value: 'after-tabs',
                },
            ],
            dependent: {
                key: 'is_singleproductmultiseller',
                set: true,
            },
            proSetting: false,
            moduleEnabled: 'spmv',
        },
        {
            key: 'separator_content',
            type: 'section',
            desc: __( 'SKU Generation', 'multivendorx' ),
            hint: __(
                'Control how SKUs are handled for products.',
                'multivendorx'
            ),
        },
        {
            key: 'sku_generator_simple',
            type: 'select',
            label: __(
                'SKU Management for Simple & Parent Products',
                'multivendorx'
            ),
            desc: __(
                'Choose how SKUs for simple, external, or parent products are generated:',
                'multivendorx'
            ),
            options: [
                {
                    key: 'choose_options',
                    label: __( 'Choose options', 'multivendorx' ),
                    value: 'choose_options',
                },
                {
                    key: 'never',
                    label: __( 'Never (let me set them)', 'multivendorx' ),
                    value: 'never',
                },
                {
                    key: 'slugs',
                    label: __(
                        'Using the product slug (name)',
                        'multivendorx'
                    ),
                    value: 'slugs',
                },
                {
                    key: 'ids',
                    label: __( 'Using the product ID)', 'multivendorx' ),
                    value: 'ids',
                },
            ],
        },
        {
            key: 'sku_generator_variation',
            type: 'select',
            label: __(
                'SKU Management for Product Variations',
                'multivendorx'
            ),
            desc: __(
                'Define how SKUs for product variations will be generated:',
                'multivendorx'
            ),
            options: [
                {
                    key: 'choose_options',
                    label: __( 'Choose options', 'multivendorx' ),
                    value: 'choose_options',
                },
                {
                    key: 'never',
                    label: __( 'Never (let me set them)', 'multivendorx' ),
                    value: 'never',
                },
                {
                    key: 'slugs',
                    label: __(
                        'Using the product slug (name)',
                        'multivendorx'
                    ),
                    value: 'slugs',
                },
                {
                    key: 'ids',
                    label: __( 'Using the product ID)', 'multivendorx' ),
                    value: 'ids',
                },
            ],
        },
        {
            key: 'sku_generator_attribute_spaces',
            type: 'select',
            label: __(
                'Replace Spaces in Attribute Names for SKUs',
                'multivendorx'
            ),
            desc: __(
                'Choose whether to replace spaces in attribute names when generating SKUs:',
                'multivendorx'
            ),
            options: [
                {
                    key: 'choose_options',
                    label: __( 'Choose options', 'multivendorx' ),
                    value: 'choose_options',
                },
                {
                    key: 'no',
                    label: __(
                        'Do not replace spaces in attribute names.',
                        'multivendorx'
                    ),
                    value: 'no',
                },
                {
                    key: 'underscore',
                    label: __(
                        'Replace spaces with underscores',
                        'multivendorx'
                    ),
                    value: 'underscore',
                },
                {
                    key: 'dash',
                    label: __(
                        'Replace spaces with dashes / hyphens',
                        'multivendorx'
                    ),
                    value: 'dash',
                },
                {
                    key: 'none',
                    label: __(
                        'Remove spaces from attribute names',
                        'multivendorx'
                    ),
                    value: 'none',
                },
            ],
        },   
    ],
};