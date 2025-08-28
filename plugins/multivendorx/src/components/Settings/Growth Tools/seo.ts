import { __ } from '@wordpress/i18n';

export default {
    id: 'seo',
    priority: 1,
    name: __( 'SEO Support', 'mvx-pro' ),
    desc: __( 'Manage and process store seo', 'mvx-pro' ),
    icon: 'adminlib-support',
    submitUrl: 'settings',
    modal: [       
        {
            key: 'store_seo_options',
            type: 'setting-toggle',
            label: __( 'SEO mode', 'mvx-pro' ),
            options: [
                {
                    key: 'yoast',
                    label: __( 'Yoast', 'mvx-pro' ),
                    value: 'yoast',
                },
                {
                    key: 'rank_math',
                    label: __( 'Rank Math', 'mvx-pro' ),
                    value: 'rank_math',
                },
            ],
        },
    ],
};
