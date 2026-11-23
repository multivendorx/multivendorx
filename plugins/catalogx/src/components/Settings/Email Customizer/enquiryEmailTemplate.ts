import { createElement } from 'react';
import { __ } from '@wordpress/i18n';
import EnquiryEmailPanel from '../../VuloMail/EnquiryEmailPanel';

export default {
    id: 'enquiry-email-template',
    priority: 1,
    headerTitle: __('Enquiry', 'catalogx'),
    headerDescription: __(
        'Preview the enquiry email and edit it in VuloMail.',
        'catalogx'
    ),
    headerIcon: 'enquiry',
    hideSettingHeader: true,
    submitUrl: 'settings',
    modal: [],
    PanelComponent: () => createElement(EnquiryEmailPanel),
};
