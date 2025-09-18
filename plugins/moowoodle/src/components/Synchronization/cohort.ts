import { __ } from '@wordpress/i18n';

export default {
    id: 'synchronize-cohort',
    priority: 30,
    name: __('Cohort synchronization', 'moowoodle'),
    desc: __('Fetch Moodle cohort on demand & generate products on demand.', 'moowoodle'),
    icon: 'adminlib-book',
    submitUrl: 'settings',
    proDependent: true,
    modal: [
        {
            key: 'cohort_sync_option',
            type: 'checkbox',
            settingDescription: __('Moodle cohort data is mapped to WordPress products, allowing new products to be created or existing ones to be updated with cohort details.', 'moowoodle'),
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
        {
            key: 'sync_cohort_btn',
            type: 'do-action-btn',
            interval: 2500,
            apilink: 'synchronization',
            parameter: 'cohort',
            proSetting: true,
            value: 'Synchronize cohort now!',
            desc: "Initiate the immediate synchronization of all cohort from Moodle to WordPress.<br><span class='highlighted-part'><br>With the 'Cohort & product synchronization' option, you have the ability to specify whether you want to create new products, update existing products.</span>",
        },
    ],
};
