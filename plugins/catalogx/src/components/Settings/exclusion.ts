import { __ } from '@wordpress/i18n';

export default {
    id: 'enquiry-quote-exclusion',
    priority: 6,

    headerTitle: __('Access Rules', 'catalogx'),

    headerDescription: __(
        'Exclude catalog viewing, enquiries, and quotes by role, name, product, category, tag or brand.',
        'catalogx'
    ),

    headerIcon: 'exclude',
    groupBySections: true,
    hideSettingHeader: true,
    submitUrl: 'settings',

    modal: [
        {
            key: 'exclusions_section',
            type: 'section',
            icon: 'exclude',
            title: __('Exclusions', 'catalogx'),
            desc: __(
                'Leave user roles, users or products out of catalog mode, enquiries or quotes. Anything you pick under a column is excluded from that feature.',
                'catalogx'
            ),
        },
        {
            key: 'exclusion',
            type: 'multi-checkbox-table',
            storeSetting: true,
            label: '',
            classes: 'full-width access-rules-table',
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
                            maxVisibleItems: 1,
                            enableOverflowPopup: true,
                            popupTitle: __('Selected user roles', 'catalogx'),
                            popupWidth: 28,
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
                            options: appLocalizer.users_data,
                            maxVisibleItems: 1,
                            enableOverflowPopup: true,
                            popupTitle: __('Selected users', 'catalogx'),
                            popupWidth: 28,
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
                            options: appLocalizer.products_data,
                            maxVisibleItems: 1,
                            enableOverflowPopup: true,
                            popupTitle: __('Selected products', 'catalogx'),
                            popupWidth: 28,
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
                            options: appLocalizer.all_product_categories,
                            maxVisibleItems: 1,
                            enableOverflowPopup: true,
                            popupTitle: __('Selected categories', 'catalogx'),
                            popupWidth: 28,
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
                            options: appLocalizer.all_product_tag,
                            maxVisibleItems: 1,
                            enableOverflowPopup: true,
                            popupTitle: __('Selected tags', 'catalogx'),
                            popupWidth: 28,
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
                            options: appLocalizer.product_brands,
                            maxVisibleItems: 1,
                            enableOverflowPopup: true,
                            popupTitle: __('Selected brands', 'catalogx'),
                            popupWidth: 28,
                            isClearable: true,
                        },
                    ],
                },
            ],
        },
    ],
};