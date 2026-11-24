/* global appLocalizer */
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	CardComponent,
	ModuleGuardComponent,
	NoticeComponent,
} from '@zyra/components';
import { ButtonInput } from '@zyra/inputs';

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
	/** REST path segment, e.g. `vuloform-store-registration-preview`. */
	previewPath: string;
	/** Form id to request; 0 lets the server resolve/create the default one. */
	formId?: number;
}

/** Read-only preview of a VuloForm form, plus a link to edit it in VuloForm. */
const PreviewFrame: React.FC<PreviewFrameProps> = ({
	previewPath,
	formId = 0,
}) => {
	const [data, setData] = useState<PreviewData | null>(null);
	const [error, setError] = useState('');
	const frame = useRef<HTMLIFrameElement>(null);
	const [height, setHeight] = useState(240);

	useEffect(() => {
		setData(null);
		setError('');

		axios({
			url: `${appLocalizer.apiUrl}/${appLocalizer.restUrl}/${previewPath}/${formId}`,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		})
			.then((res) => setData(res.data))
			.catch(() =>
				setError(__('The form could not be loaded.', 'multivendorx'))
			);
	}, [previewPath, formId]);

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
					title={__('Enable VuloForm', 'multivendorx')}
					desc={__(
						'This form is built with VuloForm. Activate the plugin to show it and edit it here.',
						'multivendorx'
					)}
					buttonText={
						data.installed
							? __('Activate VuloForm', 'multivendorx')
							: __('Install VuloForm', 'multivendorx')
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
		body = <p>{__('Loading…', 'multivendorx')}</p>;
	} else {
		const previewDocument = data.html
			? `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${
					data.style_url
						? `<link rel="stylesheet" href="${data.style_url}">`
						: ''
				}<style>html,body{margin:0;padding:0;background:transparent;font-family:${
					window.getComputedStyle(window.document.body)
						.fontFamily || 'sans-serif'
				}}body{padding:2px}</style></head><body>${data.html}</body></html>`
			: '';

		body = (
			<iframe
				ref={frame}
				title={__('Form preview', 'multivendorx')}
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
					style={{
						display: 'flex',
						justifyContent: 'flex-end',
						marginBottom: '0.75rem',
					}}
				>
					<ButtonInput
						buttons={{
							text: __('Edit form', 'multivendorx'),
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
						'multivendorx'
					)}
				/>
				{body}
			</CardComponent>
		</>
	);
};

export default PreviewFrame;
