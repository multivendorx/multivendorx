/* global appLocalizer */
import React from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { FormPreview, useVuloFormPreview } from 'zyra';

/** Settings → Enquiry: a preview of the VuloForm enquiry form. */
const EnquiryFormPanel: React.FC = () => {
	const loadErrorMessage = __('The form could not be loaded.', 'catalogx');
	const { data: embed, error } = useVuloFormPreview(
		appLocalizer.apiUrl,
		appLocalizer.vuloform_enquiry.form_id,
		appLocalizer.vuloform_enquiry.installed,
		loadErrorMessage
	);

	return (
		<FormPreview
			adminUrl={appLocalizer.url}
			installed={appLocalizer.vuloform_enquiry.installed}
			pluginUrl={appLocalizer.vuloform_enquiry.plugin_url}
			canActivate={appLocalizer.vuloform_enquiry.can_activate}
			formId={appLocalizer.vuloform_enquiry.form_id}
			embed={embed}
			error={error}
			companionTitle={__('Enable VuloForm', 'catalogx')}
			companionDesc={__(
				'This form is built with VuloForm. Activate the plugin to show it and edit it here.',
				'catalogx'
			)}
			activateLabel={__('Activate VuloForm', 'catalogx')}
			installLabel={__('Install VuloForm', 'catalogx')}
			editLabel={__('Edit form', 'catalogx')}
			noticeText={sprintf(
				/* translators: %s: VuloForm link. */
				__(
					'This form is editable in %s. Use Edit form to change its fields and settings. Changes show here after you save the form and reload this page.',
					'catalogx'
				),
				'<a href="https://wordpress.org/plugins/vuloform/" target="_blank" rel="noopener noreferrer"><strong>VuloForm</strong></a>'
			)}
		/>
	);
};

export default EnquiryFormPanel;
