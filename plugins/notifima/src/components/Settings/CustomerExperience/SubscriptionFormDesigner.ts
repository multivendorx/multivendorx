import { __ } from '@wordpress/i18n';

// The subscription form is a VuloForm form: this tab previews it and links to its editor
// (see SubscriptionFormPreview).
export default {
    id: 'subscription-form-designer',
    priority: 1,
    headerTitle: __('Subscription Form', 'notifima'),
    headerDescription: __('Preview the back in stock form and edit it in VuloForm.', 'notifima'),
    headerIcon: 'form',
    hideSettingHeader: true,
    submitUrl: 'settings',
    modal: [],
};
