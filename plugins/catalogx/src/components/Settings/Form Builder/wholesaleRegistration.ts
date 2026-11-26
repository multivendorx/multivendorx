import { createElement } from 'react';
import { __ } from '@wordpress/i18n';
import WholesaleFormPanel from './WholesaleFormPanel';

export default {
    id: 'wholesale-registration',
    priority: 2,
    headerTitle: __('Wholesale', 'catalogx'),
    headerDescription: __(
        'Preview the wholesale registration form and edit it in VuloForm.',
        'catalogx'
    ),
    headerIcon: 'contact-form',
    hideSettingHeader: true,
    submitUrl: 'settings',
    modal: [],
    PanelComponent: () => createElement(WholesaleFormPanel),
};
