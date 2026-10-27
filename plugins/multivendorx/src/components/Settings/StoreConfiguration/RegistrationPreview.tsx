/* global appLocalizer */
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { CardComponent, NoticeComponent } from '@zyra/components';
import { ButtonInput } from '@zyra/inputs';
import { getApiLink } from '@zyra/core';

interface RegistrationFormData {
	available: boolean;
	form_id: number;
	edit_url: string;
	style_url: string;
	html: string;
}

/**
 * Settings > Store configuration > Registration: a read-only preview of the store registration form
 * (a VuloForm form) and a button to the VuloForm editor, where it is changed.
 */
const RegistrationPreview = () => {
	const [data, setData] = useState<RegistrationFormData | null>(null);
	const [error, setError] = useState('');

	useEffect(() => {
		axios({
			url: getApiLink(appLocalizer, 'registration-form'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		})
			.then((res) => setData(res.data))
			.catch(() =>
				setError(
					__('The registration form could not be loaded.', 'multivendorx')
				)
			);
	}, []);

	const frame = useRef<HTMLIFrameElement>(null);
	const [height, setHeight] = useState(400);

	// The form is shown in its own frame with its own stylesheet, so the admin's styles can't change
	// how it looks: it is the form as visitors see it, and as the VuloForm builder shows it.
	const document_ = data?.html
		? `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="${data.style_url}"><style>html,body{margin:0;padding:0;background:transparent;font-family:${
				window.getComputedStyle(window.document.body).fontFamily || 'sans-serif'
		  }}body{padding:2px}</style></head><body>${data.html}</body></html>`
		: '';

	const fitHeight = () => {
		const doc = frame.current?.contentDocument;

		if (doc?.body) {
			setHeight(doc.documentElement.scrollHeight + 8);
		}
	};

	let body;

	if (error) {
		body = <p>{error}</p>;
	} else if (!data) {
		body = <p>{__('Loading…', 'multivendorx')}</p>;
	} else if (!data.available || !data.form_id) {
		body = (
			<p>
				{__(
					'Store registration needs the VuloForm plugin to be active.',
					'multivendorx'
				)}
			</p>
		);
	} else {
		// No scripts run in the frame, and it ignores the pointer, so the preview can't be filled in
		// or submitted.
		body = (
			<iframe
				ref={frame}
				title={__('Store registration form preview', 'multivendorx')}
				className="multivendorx-registration-preview"
				sandbox="allow-same-origin"
				srcDoc={document_}
				onLoad={fitHeight}
				style={{
					width: '100%',
					height,
					border: 0,
					display: 'block',
					pointerEvents: 'none',
				}}
			/>
		);
	}

	return (
		<CardComponent
			title={__('Store registration form', 'multivendorx')}
			desc={__(
				'This is the form store owners fill in to apply. Edit it in VuloForm.',
				'multivendorx'
			)}
			action={
				data?.edit_url ? (
					<ButtonInput
						buttons={{
							text: __('Edit form', 'multivendorx'),
							icon: 'edit',
							color: 'purple',
							onClick: () => {
								window.location.href = data.edit_url;
							},
						}}
					/>
				) : null
			}
		>
			<NoticeComponent
				type="info"
				displayPosition="inline-notice"
				message={__(
					'This form is editable in VuloForm. Use <b>Edit form</b> to change its fields and settings. Changes show here after you save the form and reload this page.',
					'multivendorx'
				)}
			/>
			{body}
		</CardComponent>
	);
};

export default RegistrationPreview;
