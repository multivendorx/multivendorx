import { __ } from '@wordpress/i18n';

export default {
    id: 'products',
    priority: 5,
    name: __( 'Products', 'multivendorx' ),
    desc: __(
        'Choose the product types and options that best fit your marketplace.',
        'multivendorx'
    ),
    icon: 'adminlib-warehousing-icon',
    submitUrl: 'settings',
    modal: [
        {
            key: 'product_types',
            type: 'checkbox',
            label: __( 'Product Types', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            desc: __(
                'Select the types of products you want to allow in your marketplace. <li>Simple: Standard product with no variations. <li>Variable: Product with variations (like size or color). <li>External: Links to another site. <li>Rental: Rental-based product.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'simple',
                    label: __( 'Simple', 'multivendorx' ),
                    value: 'simple',
                },
                {
                    key: 'variable',
                    label: __( 'Variable', 'multivendorx' ),
                    value: 'variable',
                },
                {
                    key: 'external',
                    label: __( 'External', 'multivendorx' ),
                    value: 'external',
                },
                {
                    key: 'rental',
                    label: __( 'Rental', 'multivendorx' ),
                    value: 'rental',
                },
            ],
            selectDeselect: true,
        },        
        {
            key: 'type_options',
            type: 'checkbox',
            label: __( 'Type options', 'multivendorx' ),
            class: 'mvx-toggle-checkbox',
            desc: __(
                'Select the types of products you want to enable in your marketplace: <li>Virtual Products: Choose this option for products that don’t have a physical form (e.g., services, memberships). <li>Downloadable Products: Use this option for products that customers can download (e.g., software, eBooks).',
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
            label: __( 'Product fields ', 'multivendorx' ),
            desc: __(
                'Select the types of products you want to enable in your marketplace: <li>General: Basic product details such as name, description, and price.<li>Inventory: Manage stock levels, SKU, and stock status for products.<li>Linked Products: Link related products, upsells, and cross-sells to increase sales.<li>Attributes: Add custom attributes like size, color, or material to products.<li>Advanced Settings: Configure additional options like purchase notes and order visibility.<li>Policies: Set store policies, including return and refund rules.<li>Product Tags: Help categorize products using tags for easier searching and filtering.<li>GTIN (Global Trade Item Number): Enter the product’s unique identifier for tracking and categorization purposes.',
                'multivendorx'
            ),
            class: 'mvx-toggle-checkbox',
            options: [
                {
                    key: 'general',
                    label: __( 'General', 'multivendorx' ),
                    value: 'general',
                },
                {
                    key: 'inventory',
                    label: __( 'Inventory', 'multivendorx' ),
                    value: 'inventory',
                },
                {
                    key: 'linked_product',
                    label: __( 'Linked Product', 'multivendorx' ),
                    value: 'linked_product',
                },
                {
                    key: 'attribute',
                    label: __( 'Attribute', 'multivendorx' ),
                    value: 'attribute',
                },
                {
                    key: 'advanced',
                    label: __( 'Advance', 'multivendorx' ),
                    value: 'advanced',
                },
                {
                    key: 'policies',
                    label: __( 'Policies', 'multivendorx' ),
                    value: 'policies',
                },
                {
                    key: 'product_tag',
                    label: __( 'Product Tag', 'multivendorx' ),
                    value: 'product_tag',
                },
                {
                    key: 'GTIN',
                    label: __( 'GTIN', 'multivendorx' ),
                    value: 'GTIN',
                },
            ],
            selectDeselect: true,
        },
    ],
};
