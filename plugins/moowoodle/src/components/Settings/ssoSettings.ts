/* global appLocalizer */
import { __, sprintf } from '@wordpress/i18n';

export default {
    id: 'sso',
    priority: 30,
    name: __('Single Sign On', 'moowoodle'),
    desc: __('Manage seamless login and logout synchronization', 'moowoodle'),
    icon: 'adminlib-vpn-key',
    submitUrl: 'settings',
    proDependent: true,
    modal: [
        {
            key: 'moowoodle_sso_enable',
            type: 'checkbox',
            desc: __(
                'Enabling this option allows users to access Moodle courses directly, bypassing the need for login',
                'moowoodle'
            ),
            label: __('Single Sign On', 'moowoodle'),
            options: [
                {
                    key: 'moowoodle_sso_enable',
                    value: 'moowoodle_sso_enable',
                },
            ],
            proSetting: true,
            look: 'toggle',
        },
        {
            key: 'moowoodle_sso_secret_key',
            type: 'text',            
            dependent: {
                key: 'moowoodle_sso_enable', // parent dependent key
                set: true,
                value: 'moowoodle_sso_enable', // updated value
            },
            desc: sprintf(
                /* translators: %s: URL to Moodle SSO settings page */
                __(
                    'Generate a unique SSO secret key (must be at least 8 characters) and copy it. Then, go to your Moodle site and paste the copied SSO key <a href="%s" target="_blank" rel="noreferrer">there</a>.',
                    'moowoodle'
                ),
                appLocalizer.moodle_site_url +
                    'admin/settings.php?section=authsettingmoowoodle'
            ),
            label: __('SSO Secret Key', 'moowoodle'),
            proSetting: true,
            generate: true,
        },
    ],
};
