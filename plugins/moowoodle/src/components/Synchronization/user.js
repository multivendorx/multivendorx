/* global appLocalizer */
import { __ } from '@wordpress/i18n';
import wordpressLogo from '@/assets/images/wordPress-to-moodle.png';
import moodleLogo from '@/assets/images/moodle-to-wordpress.png';
const nestedFields = [
    {
        key: 'wordpress',
        type: 'select',
        size: 8,
        options: [
            {
                key: 'firstname',
                label: 'First name',
                value: 'firstname',
            },
            {
                key: 'lastname',
                label: 'Last name',
                value: 'lastname',
            },
            {
                key: 'username',
                label: 'User name',
                value: 'username',
            },
        ],
        afterElement: {
            type: 'preposttext',
            textType: 'post',
            postText: '⇌',
        },
    },
    {
        key: 'moodle',
        type: 'select',
        size: 8,
        options: [
            {
                key: 'firstname',
                label: 'First name',
                value: 'firstname',
            },
            {
                key: 'lastname',
                label: 'Last name',
                value: 'lastname',
            },
            {
                key: 'username',
                label: 'User name',
                value: 'username',
            },
        ],
    },
];
export default {
    id: 'synchronize-user',
    priority: 20,
    headerTitle: __('Users', 'moowoodle'),
    headerDescription: __('Manage how accounts and profiles sync between systems.', 'moowoodle'),
    headerIcon: 'supervised-user-circle',
    groupBySections: true,
    hideSettingHeader: true,
    submitUrl: 'settings',
    proDependent: true,
    modal: [
        {
            key: 'synchronize-user-section',
            type: 'section',
            icon: 'supervised-user-circle',
            title: __('User synchronization', 'moowoodle'),
            desc: __('Which way accounts flow between WordPress and Moodle, and which profile details travel with them.', 'moowoodle'),
        },
        {
            key: 'user_sync_direction',
            type: 'choice-toggle',
            settingDescription: __("Choose which way accounts sync. Select both for two-way sync. Existing users are included.<br><span class='highlighted-part'>Users are matched by email: a match is updated, anyone else is created. A user is skipped when their username already belongs to a different email on the other site.</span>", 'moowoodle'),
            label: __('Synchronization flow between sites', 'moowoodle'),
            options: [
                {
                    key: 'wordpress_to_moodle',
                    value: 'wordpress_to_moodle',
                    label: 'WordPress to Moodle',
                    img: wordpressLogo,
                },
                {
                    key: 'moodle_to_wordpress',
                    value: 'moodle_to_wordpress',
                    label: 'Moodle to WordPress',
                    img: moodleLogo,
                },
            ],
            multiSelect: true,
            proSetting: true,
        },
        {
            key: 'wordpress_user_role',
            type: 'checkbox',
            settingDescription: __('Users with these roles are created or updated in Moodle.', 'moowoodle'),
            label: __('WordPress user role to synchronize', 'moowoodle'),
            options: Object.entries(appLocalizer.wp_user_roles).map(([key, label]) => {
                return {
                    key,
                    label,
                    value: key,
                    proSetting: true,
                };
            }),
            selectDeselect: true,
            dependent: {
                key: 'user_sync_direction',
                value: 'wordpress_to_moodle',
            },
        },
        {
            key: 'moodle_user_role',
            type: 'checkbox',
            settingDescription: __('Users with these roles are created or updated in WordPress.', 'moowoodle'),
            label: __('Moodle user role to synchronize', 'moowoodle'),
            options: Object.entries(appLocalizer.md_user_roles).map(([key, label]) => {
                return {
                    key,
                    label,
                    value: key,
                    proSetting: true,
                };
            }),
            selectDeselect: true,
            dependent: {
                key: 'user_sync_direction',
                value: 'moodle_to_wordpress',
            },
        },
        {
            key: 'user_sync_options',
            type: 'nested',
            label: __('Profile information mapping', 'moowoodle'),
            rowClass: 'single-multi-line',
            mapping: true,
            addButtonLabel: __('Add New', 'moowoodle'),
            deleteButtonLabel: __('Remove', 'moowoodle'),
            settingDescription: __("Pair the WordPress and Moodle profile fields to keep in sync. Fields you don't map aren't synced.<br>Email can't be mapped: it is how users are matched.", 'moowoodle'),
            nestedFields,
        },
        {
            key: 'realtime_user_sync',
            type: 'checkbox',
            settingDescription: __('Sync a profile as soon as a user is added or changes it, in the direction and with the fields set above.', 'moowoodle'),
            label: __('Real-Time profile synchronization', 'moowoodle'),
            options: [
                {
                    key: 'realtime_user_sync',
                    label: __('', 'moowoodle'),
                    value: 'realtime_user_sync',
                },
            ],
            look: 'toggle',
            proSetting: true,
        },
        {
            key: 'sync_user_btn',
            label: __('Synchronize users now', 'moowoodle'),
            settingDescription: __('Run a full user sync right away, using the direction, roles and field mapping above.', 'moowoodle'),
            type: 'sequential-task-executor',
            buttonText: __('Synchronize users now', 'moowoodle'),
            buttonIcon: 'bulk-course-sync',
            apilink: 'synchronization',
            parameter: 'user',
            interval: 2500,
            successMessage: __('Users synchronized.', 'moowoodle'),
            failureMessage: __('Could not synchronize users.', 'moowoodle'),
        },
    ],
};
//# sourceMappingURL=user.js.map