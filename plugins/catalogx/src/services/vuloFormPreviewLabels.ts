import { __, sprintf } from '@wordpress/i18n';

/**
 * Every `FormPreview` label/copy prop, shared by every VuloForm-powered settings panel in this
 * folder (`EnquiryFormPanel`, `WholesaleFormPanel`) -- they're otherwise identical.
 */
export function vuloFormPreviewLabels() {
	return {
		companionTitle: __('Enable VuloForm', 'catalogx'),
		companionDesc: __(
			'This form is built with VuloForm. Activate the plugin to show it and edit it here.',
			'catalogx'
		),
		activateLabel: __('Activate VuloForm', 'catalogx'),
		installLabel: __('Install VuloForm', 'catalogx'),
		editLabel: __('Edit form', 'catalogx'),
		noticeText: sprintf(
			/* translators: %s: VuloForm link. */
			__(
				'This form is editable in %s. Use Edit form to change its fields and settings. Changes show here after you save the form and reload this page.',
				'catalogx'
			),
			'<a href="https://wordpress.org/plugins/vuloform/" target="_blank" rel="noopener noreferrer"><strong>VuloForm</strong></a>'
		),
	};
}
