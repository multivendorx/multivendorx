import { __ } from '@wordpress/i18n';

export default {
    id: 'product-content-access',
    priority: 1,
    name: __( 'Store Product Permissions', 'multivendorx' ),
    desc: __(
        'Decide which product types, fields, and features stores can access when creating or managing products in their store.',
        'multivendorx'
    ),
    icon: 'adminlib-warehousing-icon',
    submitUrl: 'settings',
    modal: [
        {
            key: 'type_options',
            type: 'checkbox',
            label: __( 'Allowed product type', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            desc: __(
                'Select the product fields vendors can configure when adding or managing their products: <li><b>Virtual products </b>: Choose this option for products that don’t have a physical form (e.g., services, memberships). <li><b>Downloadable products</b>: Use this option for products that customers can download (e.g., software, eBooks).',
                'multivendorx'
            ),
            options: [
                {
                    key: 'virtual',
                    label: __( 'Virtual', 'multivendorx' ),
                    value: 'virtual',
                },
                {
                    key: 'downloadable',
                    label: __( 'Downloadable', 'multivendorx' ),
                    value: 'downloadable',
                },
            ],
            selectDeselect: true,
        },
        {
            key: 'products_fields',
            type: 'checkbox',
            label: __( 'Required product information fields', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'general',
                    label: __( 'General', 'multivendorx' ),
					desc: __( 'Basic product details such as name, description, and price.', 'multivendorx' ),
                    value: 'general',
                },
                {
                    key: 'inventory',
                    label: __( 'Inventory', 'multivendorx' ),
					desc: __( 'Manage stock levels, SKU, and stock status for products.', 'multivendorx' ),
                    value: 'inventory',
                },
                {
                    key: 'linked_product',
                    label: __( 'Linked product', 'multivendorx' ),
					desc: __( 'Link related products, upsells, and cross-sells to increase sales.', 'multivendorx' ),
                    value: 'linked_product',
                },
                {
                    key: 'attribute',
                    label: __( 'Attribute', 'multivendorx' ),
					desc: __( 'Add custom attributes like size, color, or material to products.', 'multivendorx' ),
                    value: 'attribute',
                },
                {
                    key: 'advanced',
                    label: __( 'Advanced', 'multivendorx' ),
					desc: __( 'Configure additional options like purchase notes and order visibility.', 'multivendorx' ),
                    value: 'advanced',
                },
                {
                    key: 'policies',
                    label: __( 'Policies', 'multivendorx' ),
					desc: __( 'Set store policies, including return and refund rules.', 'multivendorx' ),
                    value: 'policies',
                },
                {
                    key: 'product_tag',
                    label: __( 'Product tag', 'multivendorx' ),
					desc: __( 'Help categorize products using tags for easier searching and filtering.', 'multivendorx' ),
                    value: 'product_tag',
                },
                {
                    key: 'GTIN',
                    label: __( 'GTIN', 'multivendorx' ),
					desc: __( 'Enter the product’s unique identifier for tracking and categorization purposes.', 'multivendorx' ),
                    value: 'GTIN',
                },
            ],
            selectDeselect: true,
        },
        {
            key: 'separator_content',
            type: 'section',
            desc: __( 'SKU generation', 'multivendorx' ),
            hint: __(
                'Control how SKUs are handled for products.',
                'multivendorx'
            ),
        },
        {
            key: 'sku_generator_simple',
            type: 'setting-toggle',
            label: __(
                'SKU management for products',
                'multivendorx'
            ),
            desc: __(
                'Choose how SKUs for simple, external, or parent products are generated:',
                'multivendorx'
            ),
            options: [
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
                    label: __( 'Using the product ID', 'multivendorx' ),
                    value: 'ids',
                },
            ],
        },
        {
            key: 'sku_generator_attribute_spaces',
            type: 'setting-toggle',
            label: __(
                'SKU formatting options',
                'multivendorx'
            ),
            desc: __(
                'Choose whether to replace spaces in attribute names when generating SKUs:',
                'multivendorx'
            ),
            options: [
                {
                    key: 'no',
                    label: __(
                        'Replace spaces in attribute',
                        'multivendorx'
                    ),
                    value: 'no',
                },
                {
                    key: 'underscore',
                    label: __(
                        'Keep original spacing',
                        'multivendorx'
                    ),
                    value: 'underscore',
                },
                {
                    key: 'dash',
                    label: __(
                        'Custom SKU format rules',
                        'multivendorx'
                    ),
                    value: 'dash',
                },
            ],
        },

        {
            key: 'separator_content',
            type: 'section',
            desc: __( '', 'multivendorx' ),
            hint: __('Related products source','multivendorx'),
        },
        {
            key: 'sku_generator_attribute_spaces',
            type: 'setting-toggle',
            label: __(
                'Recommendation source',
                'multivendorx'
            ),
            desc: __(
                '<li>Same store: Show related products only from the current store.<li>All stores: Show related products from across the marketplace. Choose whether to replace spaces in attribute names when generating SKUs:',
                'multivendorx'
            ),
            options: [
                {
                    key: 'no',
                    label: __(
                        'Same store',
                        'multivendorx'
                    ),
                    value: 'no',
                },
                {
                    key: 'underscore',
                    label: __(
                        'All stores',
                        'multivendorx'
                    ),
                    value: 'underscore',
                },

            ],
        },
    ],
};
