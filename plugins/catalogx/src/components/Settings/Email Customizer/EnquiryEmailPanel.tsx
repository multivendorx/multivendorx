/* global appLocalizer */
import React from 'react';
import { __ } from '@wordpress/i18n';
import { EmailPreview, useVuloMailTemplatePreview } from 'zyra';

/**
 * Sample values so the admin preview reads like a real enquiry instead of showing raw `{tag}`
 * placeholders. Preview-only -- sending always substitutes the real submitted values (see
 * `CatalogX\VuloMail\Integration::send()`).
 */
const demoTags = {
	'{product_name}': __('Sample Product', 'catalogx'),
	'{user_name}': __('Jane Doe', 'catalogx'),
	'{user_email}': 'jane.doe@example.com',
	'{enquiry_details}': __(
		'Is this product available in other colors?',
		'catalogx'
	),
	'{date_time}': new Date().toLocaleString(),
};

/** Settings → Email Customizer → Enquiry: a preview of the VuloMail-managed enquiry email. */
const EnquiryEmailPanel: React.FC = () => {
	const loadErrorMessage = __('The email could not be loaded.', 'catalogx');
	const { data, error } = useVuloMailTemplatePreview(
		appLocalizer.apiUrl,
		appLocalizer.nonce,
		appLocalizer.vulomail_enquiry.template_name,
		appLocalizer.vulomail_enquiry.installed &&
			appLocalizer.vulomail_enquiry.available,
		demoTags,
		loadErrorMessage
	);

	return (
		<EmailPreview
			installed={appLocalizer.vulomail_enquiry.installed}
			pluginUrl={appLocalizer.vulomail_enquiry.plugin_url}
			available={appLocalizer.vulomail_enquiry.available}
			editUrl={appLocalizer.vulomail_enquiry.edit_url}
			subject={data?.subject}
			content={data?.content}
			error={error}
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
		/>
	);
};

export default EnquiryEmailPanel;
