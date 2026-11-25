import { createElement } from 'react';
import { __ } from '@wordpress/i18n';
import EnquiryFormPanel from './EnquiryFormPanel';

export default {
    id: 'enquiry-form-customization',
    priority: 1,
    headerTitle: __('Enquiry', 'catalogx'),
    headerDescription: __(
        'Preview the enquiry form and edit it in VuloForm.',
        'catalogx'
    ),
    headerIcon: 'contact-form',
    hideSettingHeader: true,
    submitUrl: 'settings',
    modal: [],
    PanelComponent: () => createElement(EnquiryFormPanel),
};
