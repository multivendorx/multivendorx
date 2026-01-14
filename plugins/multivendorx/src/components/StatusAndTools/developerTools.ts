import { __ } from '@wordpress/i18n';

const productTypes = [
    { key: 'simple', label: 'Simple (Default)', value: 'simple' },
    { key: 'booking', label: 'Booking', value: 'booking', pro: true },
    { key: 'rental', label: 'Rental', value: 'rental', pro: true },
    { key: 'auction', label: 'Auction', value: 'auction', pro: true },
    { key: 'appointment', label: 'Appointment', value: 'appointment', pro: true },
    { key: 'bundle', label: 'Bundle', value: 'bundle', pro: true },
    { key: 'subscription', label: 'Subscription', value: 'subscription', pro: true },
    { key: 'gift_card', label: 'Gift Card', value: 'gift_card', pro: true },
];
export default {
    id: 'development-tools',
    priority: 3,
    name: __('Developer Tools', 'multivendorx'),
    tabTitle: 'Dashboard Caching',
    desc: __(
        'Site errors and events are logged for easy troubleshooting.',
        'multivendorx'
    ),
    icon: 'adminfont-database',
    submitUrl: 'settings',
    modal: [
        {
            key: 'transients',
            type: 'button',
            name: __('Clear Transients', 'multivendorx'),
            label: __('Dashbaord transients', 'multivendorx'),
            desc: __(
                'Clear all store dashboards transient cache.',
                'multivendorx'
            ),
            apilink: 'status',
			method: 'POST'
        },
        {
            key: 'visitor',
            type: 'button',
            name: __('Reset Database', 'multivendorx'),
            label: __('Reset visitors stats table', 'multivendorx'),
            desc: __(
                'Clear all the table data of MultivendorX visitors stats.',
                'multivendorx'
            ),
            apilink: 'status',
			method: 'POST'
        },
        {
            key: 'separator_content',
            type: 'section',
            hint: __('Maintenance Tools', 'multivendorx'),
            desc: __('', 'multivendorx'),
        },
        {
            key: 'import_dummy_data',
            type: 'do-action-btn',
            value: __('Import Dummy Data', 'multivendorx'),
            label: __('Import Dummy Data', 'multivendorx'),
            desc: __('Import dummy data for testing purpose. This will create store owners, stores, products, and orders.', 'multivendorx'),
            apilink: 'import-dummy-data',
            parameter: 'action',
            interval: 1000,
            successMessage: __('Dummy data imported successfully!', 'multivendorx'),
            failureMessage: __('Failed to import dummy data.', 'multivendorx'),
            tasks: [
                { 
                    action: 'import_store_owners', 
                    message: __('Importing store owners...', 'multivendorx'),
                    cacheKey: 'store_owners',
                    successMessage: __('Store owners imported', 'multivendorx'),
                    failureMessage: __('Failed to import store owners', 'multivendorx')
                },
                { 
                    action: 'import_stores', 
                    message: __('Creating stores...', 'multivendorx'),
                    cacheKey: 'store_ids',
                    successMessage: __('Stores created', 'multivendorx'),
                    failureMessage: __('Failed to create stores', 'multivendorx')
                },
                { 
                    action: 'import_products', 
                    message: __('Importing products...', 'multivendorx'),
                    cacheKey: 'product_ids',
                    successMessage: __('Products imported', 'multivendorx'),
                    failureMessage: __('Failed to import products', 'multivendorx'),
                    additionalData: (selectedProductType: any) => ({ product_type: selectedProductType || 'simple' }),
                },
                { 
                    action: 'import_commissions', 
                    message: __('Creating commissions...', 'multivendorx'),
                    successMessage: __('Commissions created', 'multivendorx'),
                    failureMessage: __('Failed to create commissions', 'multivendorx')
                },
                { 
                    action: 'import_orders', 
                    message: __('Creating orders...', 'multivendorx'),
                    successMessage: __('Orders created', 'multivendorx'),
                    failureMessage: __('Failed to create orders', 'multivendorx')
                },
                { 
                    action: 'import_reviews', 
                    message: __('Creating reviews...', 'multivendorx'),
                    successMessage: __('Reviews created', 'multivendorx'),
                    failureMessage: __('Failed to create reviews', 'multivendorx')
                }
            ],
        },
        {
            key: 'default_pages',
            type: 'button',
            name: __('Create Default MultiVendorX Page', 'multivendorx'),
            label: __('MultiVendorX page', 'multivendorx'),
            desc: __(
                'This tool will install all the missing MultiVendorX pages. Pages already defined and set up will not be replaced.',
                'multivendorx'
            ),
            apilink: 'status',
            method: 'GET'
        },
        {
            key: 'multivendorx_adv_log',
            type: 'checkbox',
            label: __('Developer log', 'moowoodle'),
            desc: __(
                'View system logs related to MultiVendorX to help identify errors, warnings, and debugging information.',
                'multivendorx'
            ),
            options: [
                {
                    key: 'multivendorx_adv_log',
                    value: 'multivendorx_adv_log',
                },
            ],
            look: 'toggle',
        },
        {
            key: 'separator_content',
            type: 'section',
            hint: __('Version Control', 'multivendorx'),
            desc: __('', 'multivendorx'),
        },
        {
            key: 'store_registration_page',
            type: 'select',
            label: __('Rollback version', 'multivendorx'),
            desc: __(
                'Choose the previous MultiVendorX version you want to switch to.<br>Use this option if you are facing issues after an update and need to restore an earlier version.',
                'multivendorx'
            ),
             
            size: '30rem',
            options: [
                {
                    key: 'kilometers',
                    label: __('5.0.0', 'multivendorx'),
                    value: 'kilometers',
                },
            ],
        },
        {
            key: 'separator_content',
            type: 'section',
            hint: __('Custom CSS', 'multivendorx'),
            desc: __('', 'multivendorx'),
        },
        {
            key: 'custom_css_product_page',
            type: 'textarea',
            desc: __(
                'Add your own CSS here to modify and style the dashboard to match your preferences.',
                'multivendorx'
            ),
            label: __('Addional CSS', 'multivendorx'),
        },
        {
            key: 'separator_content',
            type: 'section',
            wrapperClass: 'divider-wrapper red',
            hint: __('Notification Events Handling', 'multivendorx'),
            desc: __('', 'multivendorx'),
        },
        {
            key: 'clear_notifications',
            type: 'number',
            wrapperClass: 'red-text',
            label: __('Notification storage period', 'multivendorx'),
			desc: __(
                    '<ul>MultiVendorX stores system notifications for both admins and stores.<br>By default, notifications are saved for 180 days. Only notifications within this period are retained; older notifications are automatically deleted.<br>You can set a custom retention period, which will override the default.', 'multivendorx'
                ),
            postInsideText: __('days', 'multivendorx')
			
        },
        {
            key: 'sync_notifications',
            type: 'setting-toggle',
            label: __('Notification events rules', 'multivendorx'),
			// settingDescription: __(
			// 	'MultiVendorX includes predefined notification events by default. Additional notification events added via custom code are not listed automatically. Select a sync option below to define how notifications are synced, then click Sync.',
			// 	'multivendorx'
			// ),
            desc: __(
                    'MultiVendorX includes predefined notification events by default. Additional notification events added via custom code are not listed automatically. Select a synchronization rules below to define how notifications are synced, then click Sync.<ul>\
                        <li><strong>Restore default</strong> - Clears all existing events and inserts the full default event list.<br></li>\
                        <li><strong>Overwrite and update</strong> - Allows selective overriding of predefined events:<br> When a field is selected, its value will be replaced with the default value during sync.<br> Fields not selected will remain unchanged.<br> Any newly added events will automatically appear in the event list.<br></li>\
                    </ul>', 'multivendorx'
                ),
            options: [
                {
                    key: 'sync_only_new_entry',
                    label: __('Restore Default', 'multivendorx'),
                    value: 'sync_only_new_entry',
                },
                {
                    key: 'sync_existing_entry',
                    label: __('Overwrite and Update', 'multivendorx'),
                    value: 'sync_existing_entry',
                },
            ],
        },
        {
            key: 'override_existing_fields',
            type: 'checkbox',
            label: __('Fields available for override', 'multivendorx'),
             
            options: [
                {
                    key: 'override_notifiers',
                    label: __('Recipients', 'multivendorx'),
                    value: 'override_notifiers',
                    desc: __( 'Sync the assigned recipients for the notification. Options: Store, Admin.', 'multivendorx'),
                },
                {
                    key: 'override_custom',
                    label: __('Additional Emails', 'multivendorx'),
                    value: 'override_custom',
                    desc: __( 'any additional email addresses added to the notification.', 'multivendorx'),
                },
                {
                    key: 'override_email_content',
                    label: __('Email Content', 'multivendorx'),
                    value: 'override_email_content',
                    desc: __( 'Subject and body of the email.', 'multivendorx'),
                },
                {
                    key: 'override_sms_content',
                    label: __('SMS Content', 'multivendorx'),
                    value: 'override_sms_content',
                    desc: __( 'Text message content sent via SMS.', 'multivendorx'),
                },
                {
                    key: 'override_system_content',
                    label: __('System Content', 'multivendorx'),
                    value: 'override_system_content',
                    desc: __( 'Notification message displayed in the system.', 'multivendorx'),
                },
            ],
            selectDeselect: true,
            dependent: {
                key: 'sync_notifications',
                set: true,
                value: 'sync_existing_entry',
            },
        },
        {
            key: 'sync_table',
            type: 'button',
            label: ' ',
            name: __('Sync Now', 'multivendorx'),
            apilink: 'notifications',
            method: 'POST',
            dependent: {
                key: 'sync_notifications',
                set: true,
            },
        },
    ],
}