import React from 'react';
import EmailPreviewFrame from './EmailPreviewFrame';

/** Settings → Email Customizer → Enquiry: a preview of the VuloMail-managed enquiry email. */
const EnquiryEmailPanel: React.FC = () => (
	<EmailPreviewFrame previewPath="vulomail-enquiry-preview" />
);

export default EnquiryEmailPanel;
