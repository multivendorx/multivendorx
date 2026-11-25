/* global appLocalizer */
import React from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { FormPreview, useVuloFormPreview } from 'zyra';

/** Settings → Subscription Form Designer: a preview of the VuloForm subscription form. */
const VuloFormPanel: React.FC = () => {
	const loadErrorMessage = __(
		'The subscription form could not be loaded.',
		'notifima'
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
			companionTitle={__('Enable VuloForm', 'notifima')}
			companionDesc={__(
				'The back in stock subscription form is built with VuloForm. Activate the plugin to show the form on your products and edit it here.',
				'notifima'
			)}
			activateLabel={__('Activate VuloForm', 'notifima')}
			installLabel={__('Install VuloForm', 'notifima')}
			editLabel={__('Edit form', 'notifima')}
			noticeText={sprintf(
				/* translators: %s: VuloForm link. */
				__(
					'This form is editable in %s. Use Edit form to change its fields and settings. Changes show here after you save the form and reload this page.',
					'notifima'
				),
				'<a href="https://wordpress.org/plugins/vuloform/" target="_blank" rel="noopener noreferrer"><strong>VuloForm</strong></a>'
			)}
		/>
	);
};

export default VuloFormPanel;
