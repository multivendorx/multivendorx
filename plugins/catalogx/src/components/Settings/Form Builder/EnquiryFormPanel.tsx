/* global appLocalizer */
import React from 'react';
import { __ } from '@wordpress/i18n';
import { FormPreview, useVuloFormPreview } from 'zyra';
import { vuloFormPreviewLabels } from '../../../services/vuloFormPreviewLabels';

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
			{...vuloFormPreviewLabels()}
		/>
	);
};

export default EnquiryFormPanel;
