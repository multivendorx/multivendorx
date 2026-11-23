import React from 'react';
import { __ } from '@wordpress/i18n';
import PreviewFrameBase from '../VuloPreview/PreviewFrameBase';

interface PreviewData {
	installed: boolean;
	plugin_url: string;
	available: boolean;
	edit_url: string;
	subject: string;
	content: string;
}

export interface EmailPreviewFrameProps {
	/** REST path segment, e.g. `vulomail-enquiry-preview`. */
	previewPath: string;
}

/** Read-only preview of a VuloMail-managed email, plus a link to edit it in VuloMail. */
const EmailPreviewFrame: React.FC<EmailPreviewFrameProps> = ({
	previewPath,
}) => (
	<PreviewFrameBase<PreviewData>
		previewPath={previewPath}
		isUnavailable={(data) => !data.available}
		companion={{
			icon: 'mail',
			title: __('Enable VuloMail', 'catalogx'),
			desc: __(
				'This email is built with VuloMail. Activate the plugin to show it and edit it here.',
				'catalogx'
			),
			activateLabel: __('Activate VuloMail', 'catalogx'),
			installLabel: __('Install VuloMail', 'catalogx'),
		}}
		getCompanionState={(data) => data}
		getEditUrl={(data) => data.edit_url}
		editLabel={__('Edit in VuloMail', 'catalogx')}
		noticeText={__(
			'This email is editable in VuloMail. Use Edit in VuloMail to change its subject, text and layout. Changes show here after you save it there and reload this page.',
			'catalogx'
		)}
		getFrameHtml={(data) => data.content}
		renderBeforeFrame={(data) => (
			<p>
				<strong>{__('Subject:', 'catalogx')}</strong> {data.subject}
			</p>
		)}
		frameBorder="1px solid #e2e2e2"
		loadErrorMessage={__('The email could not be loaded.', 'catalogx')}
	/>
);

export default EmailPreviewFrame;
