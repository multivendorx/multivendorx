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

            rows: [
                {
                    key: 'userroles_list',
                    label: __('User Role', 'catalogx'),
                },
                {
                    key: 'user_list',
                    label: __('User Name', 'catalogx'),
                },
                {
                    key: 'product_list',
                    label: __('Product', 'catalogx'),
                },
                {
                    key: 'category_list',
                    label: __('Category', 'catalogx'),
                },
                {
                    key: 'tag_list',
                    label: __('Tag', 'catalogx'),
                },
                {
                    key: 'brand_list',
                    label: __('Brand', 'catalogx'),
                },
            ],

            columns: [
                {
                    key: 'catalog_exclusion',
                    label: __('Catalog', 'catalogx'),
                    placeholder: __('Select...', 'catalogx'),

                    options: appLocalizer.role_array,

                    isClearable: true,

                    fields: [
                        {
                            key: 'value',
                            type: 'multi-select',
                        },
                    ],
                },

                {
                    key: 'enquiry_exclusion',
                    label: __('Enquiry', 'catalogx'),
                    placeholder: __('Select...', 'catalogx'),

                    options: appLocalizer.role_array,

                    isClearable: true,

                    fields: [
                        {
                            key: 'value',
                            type: 'multi-select',
                        },
                    ],
                },

                {
                    key: 'quote_exclusion',
                    label: __('Quote', 'catalogx'),

                    placeholder: __('Select...', 'catalogx'),

                    options: appLocalizer.role_array,

                    isClearable: true,

                    fields: [
                        {
                            key: 'value',
                            type: 'multi-select',
                        },
                    ],
                },
            ],
        },
    ],
};