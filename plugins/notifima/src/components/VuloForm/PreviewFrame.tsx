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
	form_id: number;
	edit_url: string;
	style_url: string;
	html: string;
}

export interface PreviewFrameProps {
	formId: number;
}

/** Read-only preview of the subscription form, plus a link to edit it in VuloForm. */
const PreviewFrame: React.FC<PreviewFrameProps> = ({ formId }) => {
	const [data, setData] = useState<PreviewData | null>(null);
	const [error, setError] = useState('');
	const frame = useRef<HTMLIFrameElement>(null);
	const [height, setHeight] = useState(240);

	useEffect(() => {
		setData(null);
		setError('');

		axios({
			url: `${appLocalizer.apiUrl}/${appLocalizer.restUrl}/vuloform-preview/${formId}`,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		})
			.then((res) => setData(res.data))
			.catch(() =>
				setError(
					__('The subscription form could not be loaded.', 'notifima')
				)
			);
	}, [formId]);

	// Own frame, own stylesheet -- the admin's styles can't change how it looks.
	const previewDocument = data?.html
		? `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${
				data.style_url
					? `<link rel="stylesheet" href="${data.style_url}">`
					: ''
			}<style>html,body{margin:0;padding:0;background:transparent;font-family:${
				window.getComputedStyle(window.document.body).fontFamily ||
				'sans-serif'
			}}body{padding:2px}</style></head><body>${data.html}</body></html>`
		: '';

	const fitHeight = () => {
		const doc = frame.current?.contentDocument;

		if (doc?.body) {
			setHeight(doc.documentElement.scrollHeight + 8);
		}
	};

	if (data && (!data.available || !data.form_id)) {
		return (
			<CardComponent>
				<ModuleGuardComponent
					icon="form"
					iconColor="purple-bg"
					title={__('Enable VuloForm', 'notifima')}
					desc={__(
						'The back in stock subscription form is built with VuloForm. Activate the plugin to show the form on your products and edit it here.',
						'notifima'
					)}
					buttonText={
						data.installed
							? __('Activate VuloForm', 'notifima')
							: __('Install VuloForm', 'notifima')
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
		body = <p>{__('Loading…', 'notifima')}</p>;
	} else {
		body = (
			<iframe
				ref={frame}
				title={__('Subscription form preview', 'notifima')}
				sandbox="allow-same-origin"
				srcDoc={previewDocument}
				onLoad={fitHeight}
				style={{
					width: '70%',
					height,
					border: 0,
					display: 'block',
					pointerEvents: 'none',
					margin: '0 auto',
				}}
			/>
		);
	}

	return (
		<>
			{data?.edit_url && (
				<div
					className="nf-vuloform-edit-action"
					style={{
						display: 'flex',
						justifyContent: 'flex-end',
						marginBottom: '0.75rem',
					}}
				>
					<ButtonInput
						buttons={{
							text: __('Edit form', 'notifima'),
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
						'This form is editable in VuloForm. Use Edit form to change its fields and settings. Changes show here after you save the form and reload this page.',
						'notifima'
					)}
				/>
				{body}
			</CardComponent>
		</>
	);
};

export default PreviewFrame;
