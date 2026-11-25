/* global appLocalizer */
import React from 'react';
import { __ } from '@wordpress/i18n';
import { FormPreview } from 'zyra';
import { useSetting } from '@zyra/core';

/** Settings → Subscription Form Designer: a preview of the VuloForm subscription form. */
const VuloFormPanel: React.FC = () => {
	const { setting } = useSetting();
	const selectedFormId = Number(setting.vuloform_subscription_form_id) || 0;

	return (
		<FormPreview
			appLocalizer={appLocalizer}
			previewPath="vuloform-preview"
			formId={selectedFormId}
			companionTitle={__('Enable VuloForm', 'notifima')}
			companionDesc={__(
				'The back in stock subscription form is built with VuloForm. Activate the plugin to show the form on your products and edit it here.',
				'notifima'
			)}
			activateLabel={__('Activate VuloForm', 'notifima')}
			installLabel={__('Install VuloForm', 'notifima')}
			editLabel={__('Edit form', 'notifima')}
			noticeText={__(
				'This form is editable in VuloForm. Use Edit form to change its fields and settings. Changes show here after you save the form and reload this page.',
				'notifima'
			)}
			loadErrorMessage={__(
				'The subscription form could not be loaded.',
				'notifima'
			)}
		/>
	);
};

export default VuloFormPanel;
