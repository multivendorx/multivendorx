import React from 'react';
import { __, sprintf } from '@wordpress/i18n';
import PreviewFrameBase from '../VuloPreview/PreviewFrameBase';

interface PreviewData {
	installed: boolean;
	plugin_url: string;
	available: boolean;
	form_id: number;
	edit_url: string;
	style_url: string;
	html: string;
}

export interface PreviewFrameProps {
	/** REST path segment, e.g. `vuloform-enquiry-preview` or `vuloform-wholesale-preview`. */
	previewPath: string;
	/** Form id to request; 0 lets the server resolve/create the default one. */
	formId?: number;
}

/** Read-only preview of a VuloForm form, plus a link to edit it in VuloForm. */
const PreviewFrame: React.FC<PreviewFrameProps> = ({
	previewPath,
	formId = 0,
}) => (
	<PreviewFrameBase<PreviewData>
		previewPath={`${previewPath}/${formId}`}
		isUnavailable={(data) => !data.available || !data.form_id}
		companion={{
			icon: 'form',
			title: __('Enable VuloForm', 'catalogx'),
			desc: __(
				'This form is built with VuloForm. Activate the plugin to show it and edit it here.',
				'catalogx'
			),
			activateLabel: __('Activate VuloForm', 'catalogx'),
			installLabel: __('Install VuloForm', 'catalogx'),
		}}
		getCompanionState={(data) => data}
		getEditUrl={(data) => data.edit_url}
		editLabel={__('Edit form', 'catalogx')}
		noticeText={sprintf(
			/* translators: %s: VuloForm link. */
			__(
				'This form is editable in %s. Use Edit form to change its fields and settings. Changes show here after you save the form and reload this page.',
				'catalogx'
			),
			'<a href="https://wordpress.org/plugins/vuloform/" target="_blank" rel="noopener noreferrer"><strong>VuloForm</strong></a>'
		)}
		getFrameHtml={(data) => data.html}
		getFrameHeadExtra={(data) =>
			data.style_url
				? `<link rel="stylesheet" href="${data.style_url}">`
				: ''
		}
		frameWidth="70%"
		frameBorder="0"
		framePadding="2px"
		loadErrorMessage={__('The form could not be loaded.', 'catalogx')}
	/>
);

export default PreviewFrame;
