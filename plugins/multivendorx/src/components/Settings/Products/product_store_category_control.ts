import { __ } from '@wordpress/i18n';

export default {
    id: 'product -store-category -control',
    priority: 3,
    name: __( 'Category Pyramid Guide (CPG)', 'multivendorx' ),
    desc: __(
        'Choose whether stores follow a step-by-step guided process through the category hierarchy or freely select multiple categories & subcategories without restrictions.','multivendorx'
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
            key: 'sku_generator_attribute_spaces',
            type: 'setting-toggle',
            label: __(
                'Category selection method',
                'multivendorx'
            ),
            desc: __('<ul><li><b>Guided sequential selection</b>: Stores must first choose primary category, then select from available subcategories.</li><li><b>Free multi-selection</b>ss: Stores can select any number of categories and subcategories without restrictions.</li></ul>',
                'multivendorx'
            ),
            options: [
                {
                    key: 'no',
                    label: __(
                        'Guided sequential selection',
                        'multivendorx'
                    ),
                    value: 'no',
                },
                {
                    key: 'underscore',
                    label: __(
                        'Free multi-selection',
                        'multivendorx'
                    ),
                    value: 'underscore',
                },
            ],
        },      
    ],
};
