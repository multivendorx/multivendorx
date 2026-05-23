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
            desc: __('Grid Table', 'catalogx'),
            classes: 'gridTable no-label',

            columns: [
                {
                    key: 'catalog_exclusion',
                    label: __('Catalog', 'catalogx'),
                },
                {
                    key: 'enquiry_exclusion',
                    label: __('Enquiry', 'catalogx'),
                },
                {
                    key: 'quote_exclusion',
                    label: __('Quote', 'catalogx'),
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
                            options: appLocalizer.user_array,
                            isClearable: true,
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
                            options: appLocalizer.product_array,
                            isClearable: true,
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
                            options: appLocalizer.category_array,
                            isClearable: true,
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
                            options: appLocalizer.tag_array,
                            isClearable: true,
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
                            options: appLocalizer.brand_array,
                            isClearable: true,
                        },
                    ],
                },
            ],
        },
    ],
};