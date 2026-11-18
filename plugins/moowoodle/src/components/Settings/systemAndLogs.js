import { createElement, Fragment } from 'react';
import { __ } from '@wordpress/i18n';
import './log-mode-field.scss';
/**
 * The Logs card's toggle text: both words are rendered, and log-mode-field.scss shows "Basic" while the toggle is off
 * and "Advanced" while it is on.
 */
const logModeLabel = createElement(Fragment, null, createElement('span', { className: 'mw-log-mode-off' }, __('Basic', 'moowoodle')), createElement('span', { className: 'mw-log-mode-on' }, __('Advanced', 'moowoodle')));
/**
 * Settings → System & Logs, in two sub-tabs: Connection & Schedule, and Logs. SettingsNavigator draws it as a settings
 * folder, each sub-tab showing the sections it lists; both are one settings tab, saved together in
 * `moowoodle_system_logs_settings`.
 */
export default {
    id: 'system-logs',
    priority: 3,
    headerTitle: __('System & Logs', 'moowoodle'),
    headerDescription: __('Connection timing, the synchronization schedule, and the error log.', 'moowoodle'),
    headerIcon: 'tools',
    groupBySections: true,
    hideSettingHeader: true,
    submitUrl: 'settings',
    subTabs: [
        {
            id: 'connection-schedule',
            label: __('Connection & Schedule', 'moowoodle'),
            icon: 'tools',
            sections: ['system-logs-section-timing'],
        },
        {
            id: 'logs',
            label: __('Logs', 'moowoodle'),
            icon: 'info',
            sections: ['system-logs-section-logs'],
        },
    ],
    modal: [
        {
            key: 'system-logs-section-timing',
            type: 'section',
            icon: 'tools',
            title: __('Connection & schedule', 'moowoodle'),
            desc: __('How long to wait for Moodle, and how often the automatic synchronization runs.', 'moowoodle'),
        },
        {
            key: 'moodle_timeout',
            type: 'text',
            settingDescription: __('When WordPress sends a request to the Moodle server for data, communication delays might exceed the default server connection timeout. You can customize the timeout parameters by adjusting them here. <br>Default: 5 seconds.', 'moowoodle'),
            size: 8,
            postInsideText: __('sec', 'moowoodle'),
            label: __('Connection timeout', 'moowoodle'),
            parameter: __('Seconds', 'moowoodle'),
        },
        {
            key: 'schedule_interval',
            type: 'text',
            settingDescription: __('Select the interval for the user synchronization process. Based on this schedule, the cron job will run to sync users between WordPress and Moodle.', 'moowoodle'),
            size: 8,
            postInsideText: __('min', 'moowoodle'),
            parameter: __('Minutes', 'moowoodle'),
            label: __('Automatic synchronization frequency', 'moowoodle'),
        },
        {
            key: 'system-logs-section-logs',
            type: 'section',
            icon: 'info',
            title: __('Logs', 'moowoodle'),
            desc: __('Basic records MooWoodle’s usual messages and errors. Advanced also records every request sent to Moodle™ and its response, so the log grows quickly: turn it on only while troubleshooting.', 'moowoodle'),
        },
        {
            // The Advance log toggle, at the right of the Logs card header (log-mode-field.scss), reading "Basic" off
            // and "Advanced" on. Same key and stored value as before: ['moowoodle_adv_log'] on, [] off.
            key: 'moowoodle_adv_log',
            type: 'checkbox',
            look: 'toggle',
            classes: 'mw-log-mode-row',
            options: [
                {
                    key: 'moowoodle_adv_log',
                    value: 'moowoodle_adv_log',
                    label: logModeLabel,
                },
            ],
        },
        {
            // Its own key, not the Advance log toggle's above: zyra keys each field by `key`, and the viewer stores no
            // value of its own (it only reads `apiLink`/`fileName`).
            key: 'moowoodle_log_viewer',
            type: 'log',
            classes: 'log-section full-width row',
            apiLink: 'logs',
            fileName: 'error.txt',
        },
    ],
};
//# sourceMappingURL=systemAndLogs.js.map