import { __ } from '@wordpress/i18n';

export default {
    id: 'synchronize-cohort',
    priority: 30,
    headerTitle: __('Cohorts Synchronization', 'moowoodle'),
    headerDescription: __(
        'Fetch Moodle cohort on demand & generate products on demand.',
        'moowoodle'
    ),
    headerIcon: 'cohort',
    submitUrl: 'settings',
    proDependent: true,
    modal: [
        {
            key: 'cohort_sync_option',
            type: 'checkbox',
            settingDescription: __(
                'Moodle cohort data is mapped to WordPress products, allowing new products to be created or existing ones to be updated with cohort details.',
                'moowoodle'
            ),
            label: __('Cohort & product synchronization', 'moowoodle'),
            selectDeselect: true,
            options: [
                {
                    key: 'create',
                    label: __('Create new products along with', 'moowoodle'),
                    hints: __(
                        'This will additionally create new products based on Moodle cohort fetched, if they do not already exist in WordPress.',
                        'moowoodle'
                    ),
                    value: 'create',
                    proSetting: true,
                },
                {
                    key: 'update',
                    label: __(
                        'Update existing products along with',
                        'moowoodle'
                    ),
                    hints: __(
                        'Update product information based on Moodle cohort data. <br><span class="highlighted-part">Caution: This will overwrite all existing product details with those from Moodle cohort details.</span>',
                        'moowoodle'
                    ),
                    value: 'update',
                    proSetting: true,
                },
            ],
        },
        // {
        //     key: 'sync_cohort_btn',
        //     type: 'do-action-btn',
        //     label: 'On-Demand Cohort',
        //     settingDescription:
        //         'All cohorts are immediately fetched from Moodle and updated in WordPress. This action runs independently of the scheduled synchronization settings.',
        //     interval: 2500,
        //     apilink: 'synchronization',
        //     parameter: 'cohort',
        //     proSetting: true,
        //     value: 'Synchronize cohort now!',
        //     desc: "Initiate the immediate synchronization of all cohort from Moodle to WordPress.<br><span class='highlighted-part'><br>With the 'Cohort & product synchronization' option, you have the ability to specify whether you want to create new products, update existing products.</span>",
        // },
        {
            key: 'sync_cohort_btn',
            label: 'On-demand course',
            settingDescription: 'Courses are fetched from Moodle and synchronized with WordPress, ensuring product details remain updated.',
            type: 'sequential-task-executor',
            buttonText: 'Synchronize cohort now!',
            apilink: 'synchronization',
            action: 'sync_course',
            interval: 2500,
            successMessage: 'Courses synchronized successfully!',
            failureMessage: 'Failed to synchronize courses.',
            tasks: [
                {
                    action: 'fetch_moodle_courses',
                    message: 'Fetching courses from Moodle...',
                    successMessage: 'Courses fetched successfully',
                    failureMessage: 'Failed to fetch courses',
                    requiresResponeData: true
                },
                {
                    action: 'sync_to_wordpress',
                    message: 'Synchronizing with WordPress products...',
                    successMessage: 'Products synchronized',
                    failureMessage: 'Failed to sync products',
                    requiresResponeData: true
                },
                {
                    action: 'update_product_metadata',
                    message: 'Updating product metadata...',
                    successMessage: 'Metadata updated',
                    failureMessage: 'Failed to update metadata',
                    requiresResponeData: false
                }
            ],
            desc: "Initiate the immediate synchronization of all courses from Moodle to WordPress.<br><span class='highlighted-part'><br>With the 'Course & product synchronization' option, you have the ability to specify whether you want to create new products, update existing products.<br>Through the 'Course information mapping' feature, you gain the flexibility to define which specific course data gets imported from Moodle, like course ID number/course images etc. By default we will fetch only the category of the product.</span>",
        }
    ],
};
