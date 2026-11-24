/* global appLocalizer */
import React from 'react';
import { __ } from '@wordpress/i18n';
import { EmailPreview } from 'zyra';

/** Settings → Email Customizer → Enquiry: a preview of the VuloMail-managed enquiry email. */
const EnquiryEmailPanel: React.FC = () => (
	<EmailPreview
		appLocalizer={appLocalizer}
		previewPath="vulomail-enquiry-preview"
		companionTitle={__('Enable VuloMail', 'catalogx')}
		companionDesc={__(
			'This email is built with VuloMail. Activate the plugin to show it and edit it here.',
			'catalogx'
		)}
		activateLabel={__('Activate VuloMail', 'catalogx')}
		installLabel={__('Install VuloMail', 'catalogx')}
		editLabel={__('Edit in VuloMail', 'catalogx')}
		noticeText={__(
			'This email is editable in VuloMail. Use Edit in VuloMail to change its subject, text and layout. Changes show here after you save it there and reload this page.',
			'catalogx'
		)}
		subjectLabel={__('Subject:', 'catalogx')}
		loadErrorMessage={__('The email could not be loaded.', 'catalogx')}
	/>
);

export default EnquiryEmailPanel;
