/* global appLocalizer */
import React from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { FormPreview, useVuloFormPreview } from 'zyra';

/** Settings → Registration: a preview of the VuloForm store registration form. */
const RegistrationFormPanel: React.FC = () => {
	const loadErrorMessage = __(
		'The form could not be loaded.',
		'multivendorx'
	);
	const { data: embed, error } = useVuloFormPreview(
		appLocalizer.apiUrl,
		appLocalizer.vuloform.form_id,
		appLocalizer.vuloform.installed,
		loadErrorMessage
	);

	return (
		<FormPreview
			adminUrl={appLocalizer.admin_url}
			installed={appLocalizer.vuloform.installed}
			pluginUrl={appLocalizer.vuloform.plugin_url}
			canActivate={appLocalizer.vuloform.can_activate}
			formId={appLocalizer.vuloform.form_id}
			embed={embed}
			error={error}
			companionTitle={__('Enable VuloForm', 'multivendorx')}
			companionDesc={__(
				'This form is built with VuloForm. Activate the plugin to show it and edit it here.',
				'multivendorx'
			)}
			activateLabel={__('Activate VuloForm', 'multivendorx')}
			installLabel={__('Install VuloForm', 'multivendorx')}
			editLabel={__('Edit form', 'multivendorx')}
			noticeText={sprintf(
				/* translators: %s: VuloForm link. */
				__(
					'This form is editable in %s. Use Edit form to change its fields and settings. Changes show here after you save the form and reload this page.',
					'multivendorx'
				),
				'<a href="https://wordpress.org/plugins/vuloform/" target="_blank" rel="noopener noreferrer"><strong>VuloForm</strong></a>'
			)}
		/>
	);
};

export default RegistrationFormPanel;
