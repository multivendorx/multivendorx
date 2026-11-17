/* global appLocalizer */
import { __ } from '@wordpress/i18n';

export default {
    id: 'wholesale-email-template',
    priority: 3,
    headerTitle: __('Wholesale', 'catalogx'),
    headerDescription: __(
        'Customize the email template used for wholesale notifications.',
        'catalogx'
    ),
    headerIcon: 'wholesale',
    submitUrl: 'settings',
    modal: [
        {
            key: 'notice',
            type: 'notice',
            title: __(
                'Wholesale email templates are now customized centrally in VuloMail, alongside every other plugin’s email templates.',
                'catalogx'
            ),
            noticeType: 'info',
            display: 'inline-notice',
        },
        {
            key: 'open-vulomail',
            type: 'button',
            text: __('Customise in VuloMail', 'catalogx'),
            redirect_url: `${appLocalizer.url}admin.php?page=vulomail#&tab=email-templates`,
        },
    ],
};