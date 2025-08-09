import { __ } from '@wordpress/i18n';

export default {
    id: 'role-manager',
    priority: 4,
    name: __('Role-Based Access', 'mvx-pro'),
    desc: __('Manage access permissions for different store roles.', 'mvx-pro'),
    icon: 'adminlib-wholesale',
    submitUrl: 'settings',
    modal: [  
        {
            key: 'separator_content',
            type: 'section',
            desc: __( 'Product Permission Options', 'multivendorx' ),
            hint: __(
                'Control how sellers can submit and manage their products',
                'multivendorx'
            ),
        },
        {
            key: 'product_permission_options',
            type: 'checkbox',
            label: __( 'Product Permission Options', 'multivendorx' ),
            desc: __( 'Manage the permissions sellers have for product submission, publishing, and editing.', 'multivendorx' ),
            options: [
                {
                    key: 'is_submit_product',
                    label: __( 'Submit Products for Approval', 'multivendorx' ),
                    value: 'is_submit_product',
                },
                {
                    key: 'is_published_product',
                    label: __( 'Publish Products Directly', 'multivendorx' ),
                    value: 'is_published_product',
                },
                {
                    key: 'is_edit_delete_published_product',
                    label: __( 'Edit/Delete Published Products', 'multivendorx' ),
                    value: 'is_edit_delete_published_product',
                },
                {
                    key: 'publish_and_submit_products',
                    label: __( 'Publish & Submit Edited Products', 'multivendorx' ),
                    value: 'publish_and_submit_products',
                },
            ],
            selectDeselect: true,
        },
        {
            key: 'separator_content',
            type: 'section',
            desc: __( 'Coupon Management', 'multivendorx' ),
            hint: __(
                'Give sellers control over their discount coupons.',
                'multivendorx'
            ),
        },
        {
            key: 'coupon_management_options',
            type: 'checkbox',
            label: __( 'Coupon Management Options', 'multivendorx' ),
            desc: __( 'Manage the permissions sellers have for creating, publishing, and editing coupons.', 'multivendorx' ),
            options: [
                {
                    key: 'is_submit_coupon',
                    label: __( 'Create Coupons', 'multivendorx' ),
                    value: 'is_submit_coupon',
                },
                {
                    key: 'is_published_coupon',
                    label: __( 'Publish Coupons', 'multivendorx' ),
                    value: 'is_published_coupon',
                },
                {
                    key: 'is_edit_delete_published_coupon',
                    label: __( 'Edit/Delete Published Coupons', 'multivendorx' ),
                    value: 'is_edit_delete_published_coupon',
                },
            ],
            selectDeselect: true,
        },
        {
            key: 'separator_content',
            type: 'section',
            desc: __( 'Media Management', 'multivendorx' ),
            hint: __(
                'Manage the media files sellers can upload.',
                'multivendorx'
            ),
        },
        {
            key: 'media_management_options',
            type: 'checkbox',
            label: __( 'Media Management Options', 'multivendorx' ),
            desc: __(
                'Select the permissions you want to grant sellers for media file uploads.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'is_upload_files',
                    label: __( 'Upload Media Files', 'multivendorx' ),
                    value: 'is_upload_files',
                },
            ],
            selectDeselect: true,
        },
                       
        {
            key: 'role_access_table',
            type: 'multi-checkbox-table',
            label: __('Role Access Control', 'mvx-pro'),
            desc: __('Define which permissions each role should have.', 'mvx-pro'),
            moduleEnabled: 'role_manager',

            columns: [
                { key: 'storeOwner', label: __('Store Owner', 'mvx-pro') },
                { key: 'storeManager', label: __('Store Manager', 'mvx-pro') },
                { key: 'productManager', label: __('Product Manager', 'mvx-pro') },
                { key: 'customerSupport', label: __('Customer Support', 'mvx-pro') },
                { key: 'orderAssistant', label: __('Order Assistant', 'mvx-pro') },
            ],

            rows: [
                { key: 'manageUsers', label: __('Manage Users', 'mvx-pro') },
                { key: 'manageProducts', label: __('Manage Products', 'mvx-pro') },
                {
                    key: 'orders',
                    label: __('View/Process Orders', 'mvx-pro'),
                    options: [
                        { value: 'Full', label: __('Full', 'mvx-pro') },
                        { value: 'Limited', label: __('Limited', 'mvx-pro') },
                        { value: 'View Only', label: __('View Only', 'mvx-pro') },
                        { value: 'Views Only Basic Access', label: __('Views Only Basic Access', 'mvx-pro') },
                        { value: 'No', label: __('No', 'mvx-pro') },
                    ],
                },
                {
                    key: 'finances',
                    label: __('Access Finances', 'mvx-pro'),
                    options: [
                        { value: 'Full', label: __('Full', 'mvx-pro') },
                        { value: 'Limited', label: __('Limited', 'mvx-pro') },
                        { value: 'Refunds Only', label: __('Refunds Only', 'mvx-pro') },
                        { value: 'No', label: __('No', 'mvx-pro') },
                    ],
                },
                {
                    key: 'analytics',
                    label: __('Analytics', 'mvx-pro'),
                    options: [
                        { value: 'Full', label: __('Full', 'mvx-pro') },
                        { value: 'Some', label: __('Some', 'mvx-pro') },
                        { value: 'Product Only', label: __('Product Only', 'mvx-pro') },
                        { value: 'No', label: __('No', 'mvx-pro') },
                    ],
                },
                { key: 'messages', label: __('Customer Messages', 'mvx-pro') },
            ],
        },                     
    ],
};
