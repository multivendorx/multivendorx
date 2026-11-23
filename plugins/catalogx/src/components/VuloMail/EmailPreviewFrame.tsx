/* global appLocalizer */
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	CardComponent,
	ModuleGuardComponent,
	NoticeComponent,
	ButtonInput,
} from 'zyra';

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
}) => {
	const [data, setData] = useState<PreviewData | null>(null);
	const [error, setError] = useState('');
	const frame = useRef<HTMLIFrameElement>(null);
	const [height, setHeight] = useState(240);

	useEffect(() => {
		setData(null);
		setError('');

		axios({
			url: `${appLocalizer.apiUrl}/${appLocalizer.restUrl}/${previewPath}`,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		})
			.then((res) => setData(res.data))
			.catch(() =>
				setError(__('The email could not be loaded.', 'catalogx'))
			);
	}, [previewPath]);

	// Own frame -- the admin's styles can't change how it looks.
	const previewDocument = data?.content
		? `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;padding:0;background:transparent;font-family:${
				window.getComputedStyle(window.document.body).fontFamily ||
				'sans-serif'
			}}body{padding:1rem}</style></head><body>${data.content}</body></html>`
		: '';

	const fitHeight = () => {
		const doc = frame.current?.contentDocument;

		if (doc?.body) {
			setHeight(doc.documentElement.scrollHeight + 8);
		}
	};

	if (data && !data.available) {
		return (
			<CardComponent>
				<ModuleGuardComponent
					icon="mail"
					iconColor="purple-bg"
					title={__('Enable VuloMail', 'catalogx')}
					desc={__(
						'This email is built with VuloMail. Activate the plugin to show it and edit it here.',
						'catalogx'
					)}
					buttonText={
						data.installed
							? __('Activate VuloMail', 'catalogx')
							: __('Install VuloMail', 'catalogx')
					}
					buttonLink={data.plugin_url}
				/>
			</CardComponent>
		);
	}

	let body;

	if (error) {
		body = <p>{error}</p>;
	} else if (!data) {
		body = <p>{__('Loading…', 'catalogx')}</p>;
	} else {
		body = (
			<>
				<p>
					<strong>{__('Subject:', 'catalogx')}</strong>{' '}
					{data.subject}
				</p>
				<iframe
					ref={frame}
					title={__('Email preview', 'catalogx')}
					sandbox="allow-same-origin"
					srcDoc={previewDocument}
					onLoad={fitHeight}
					style={{
						width: '100%',
						height,
						border: '1px solid #e2e2e2',
						borderRadius: '4px',
						display: 'block',
						pointerEvents: 'none',
					}}
				/>
			</>
		);
	}

	return (
		<>
			{data?.edit_url && (
				<div
					style={{
						display: 'flex',
						justifyContent: 'flex-end',
						marginBottom: '0.75rem',
					}}
				>
					<ButtonInput
						buttons={{
							text: __('Edit in VuloMail', 'catalogx'),
							icon: 'edit',
							color: 'purple-bg',
							onClick: () => {
								window.location.href = data.edit_url;
							},
						}}
					/>
				</div>
			)}

			<CardComponent>
				<NoticeComponent
					type="info"
					displayPosition="inline-notice"
					message={__(
						'This email is editable in VuloMail. Use Edit in VuloMail to change its subject, text and layout. Changes show here after you save it there and reload this page.',
						'catalogx'
					)}
				/>
				{body}
			</CardComponent>
		</>
	);
};

export default EmailPreviewFrame;
