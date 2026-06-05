import { __ } from '@wordpress/i18n';

export default {
    id: 'enquiry-quote-exclusion',
    priority: 40,

    headerTitle: __('Exclusion', 'catalogx'),

    headerDescription: __(
        'Exclude catalog viewing, enquiries, and quotes by user roles and product attributes.',
        'catalogx'
    ),

    headerIcon: 'exclude',
    submitUrl: 'settings',

    modal: [
        {
            key: 'exclusion',
            type: 'multi-checkbox-table',
            storeSetting: true,
            label: '',
            columns: [
                {
                    key: 'catalog_exclusion',
                    label: __('Catalog', 'catalogx'),
                    moduleEnabled: 'catalog'
                },
                {
                    key: 'enquiry_exclusion',
                    label: __('Enquiry', 'catalogx'),
                    moduleEnabled: 'enquiry'
                },
                {
                    key: 'quote_exclusion',
                    label: __('Quote', 'catalogx'),
                    moduleEnabled: 'quote'
                },
            ],

            rows: [
                {
                    key: 'userroles_list',
                    label: __('User Role', 'catalogx'),

                    fields: [
                        {
                            key: 'value',
                            type: 'multi-select',
                            placeholder: __('Select...', 'catalogx'),
                            options: appLocalizer.role_array,
                            isClearable: true,
                            size: 15
                        },
                    ],
                },

                {
                    key: 'user_list',
                    label: __('User Name', 'catalogx'),

                    fields: [
                        {
                            key: 'value',
                            type: 'multi-select',
                            placeholder: __('Select...', 'catalogx'),
                            options: appLocalizer.users_data,
                            isClearable: true,
                            size: 15
                        },
                    ],
                },

                {
                    key: 'product_list',
                    label: __('Product', 'catalogx'),

                    fields: [
                        {
                            key: 'value',
                            type: 'multi-select',
                            placeholder: __('Select...', 'catalogx'),
                            options: appLocalizer.products_data,
                            isClearable: true,
                            size: 15
                        },
                    ],
                },

                {
                    key: 'category_list',
                    label: __('Category', 'catalogx'),

                    fields: [
                        {
                            key: 'value',
                            type: 'multi-select',
                            placeholder: __('Select...', 'catalogx'),
                            options: appLocalizer.all_product_categories,
                            isClearable: true,
                            size: 15
                        },
                    ],
                },

                {
                    key: 'tag_list',
                    label: __('Tag', 'catalogx'),

                    fields: [
                        {
                            key: 'value',
                            type: 'multi-select',
                            placeholder: __('Select...', 'catalogx'),
                            options: appLocalizer.all_product_tag,
                            isClearable: true,
                            size: 15
                        },
                    ],
                },

                {
                    key: 'brand_list',
                    label: __('Brand', 'catalogx'),

                    fields: [
                        {
                            key: 'value',
                            type: 'multi-select',
                            placeholder: __('Select...', 'catalogx'),
                            options: appLocalizer.product_brands,
                            isClearable: true,
                            size: 15
                        },
                    ],
                },
            ],
        },
    ],
};