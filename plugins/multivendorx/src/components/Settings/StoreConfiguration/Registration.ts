import { __ } from '@wordpress/i18n';

// The registration form is a VuloForm form: this tab previews it and links to its editor
// (see RegistrationPreview).
export default {
	id: 'registration',
	priority: 2,
	headerTitle: __('Registration', 'multivendorx'),
	headerDescription: __(
		'Preview the store registration form and edit it in VuloForm.',
		'multivendorx'
	),
	headerIcon: 'contact-form',
	hideSettingHeader: true,
	submitUrl: 'settings',
	modal: [],
};
