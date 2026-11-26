import { createElement } from 'react';
import { __ } from '@wordpress/i18n';
import VuloFormPanel from '../../VuloForm/VuloFormPanel';

/** Settings → Subscription Form Designer, now backed by VuloForm instead of Free/Pro tabs. */
export default {
    id: 'subscription-form-designer',
    priority: 1,
    headerTitle: __('Subscription Form Designer', 'notifima'),
    headerDescription: __('Choose or build the form visitors fill in to request a back-in-stock notification, using VuloForm.', 'notifima'),
    headerIcon: 'form',
    submitUrl: 'settings',
    modal: [],
    PanelComponent: () => createElement(VuloFormPanel),
};
