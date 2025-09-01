import { __ } from '@wordpress/i18n';

export default {
    id: 'enquiry-quote-exclusion',
    priority: 2,
    name: __( 'Exclusion', 'catalogx' ),
    desc: __(
        'Exclude catalog viewing, enquiries, and quotes by user roles and product attributes.',
        'catalogx'
    ),
    icon: 'adminlib-exclude',
    submitUrl: 'settings',
    modal: [
        {
            key: 'exclusion',
            type: 'multi-checkbox-table',
            label: __( '', 'catalogx' ),
            desc: __( 'Grid Table', 'catalogx' ),
            classes: 'gridTable no-label',
            rows: [
                {
                    key: 'userroles_list',
                    label: __( 'User Role', 'catalogx' ),
                    options: appLocalizer.role_array,
                },
                {
                    key: 'user_list',
                    label: __( 'User Name', 'catalogx' ),
                    options: appLocalizer.all_users,
                },
                {
                    key: 'product_list',
                    label: __( 'Product', 'catalogx' ),
                    options: appLocalizer.all_products,
                },
                {
                    key: 'category_list',
                    label: __( 'Category', 'catalogx' ),
                    options: appLocalizer.all_product_cat,
                },
                {
                    key: 'tag_list',
                    label: __( 'Tag', 'catalogx' ),
                    options: appLocalizer.all_product_tag,
                },
                {
                    key: 'brand_list',
                    label: __( 'Brand', 'catalogx' ),
                    options: appLocalizer.all_product_brand,
                },
            ],
            columns: [
                {
                    key: 'catalog_exclusion',
                    label: __( 'Catalog', 'catalogx' ),
                },
                {
                    key: 'enquiry_exclusion',
                    label: __( 'Enquiry', 'catalogx' ),
                },
                {
                    key: 'quote_exclusion',
                    label: __( 'Quote', 'catalogx' ),
                },
            ],
        },
    ],
};
