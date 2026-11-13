/* global appLocalizer */
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	CardComponent,
	ModuleGuardComponent,
	NoticeComponent,
} from '@zyra/components';
import { ButtonInput } from '@zyra/inputs';
import { getApiLink } from '@zyra/core';

interface SubscriptionFormData {
	installed: boolean;
	plugin_url: string;
	available: boolean;
	form_id: number;
	edit_url: string;
	style_url: string;
	html: string;
}

/**
 * Settings > Customer Experience > Subscription form: a read-only preview of the back in stock form
 * (a VuloForm form) and a button to the VuloForm editor, where it is changed.
 */
const SubscriptionFormPreview = () => {
	const [data, setData] = useState<SubscriptionFormData | null>(null);
	const [error, setError] = useState('');
	const frame = useRef<HTMLIFrameElement>(null);
	const [height, setHeight] = useState(240);

	useEffect(() => {
		axios({
			url: getApiLink(appLocalizer, 'subscription-form'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		})
			.then((res) => setData(res.data))
			.catch(() =>
				setError(
					__('The subscription form could not be loaded.', 'notifima')
				)
			);
	}, []);

	// The form is shown in its own frame with its own stylesheet, so the admin's styles can't change how
	// it looks: it is the form as visitors see it, and as the VuloForm builder shows it.
	const previewDocument = data?.html
		? `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="${data.style_url}"><style>html,body{margin:0;padding:0;background:transparent;font-family:${
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

	// Without VuloForm there is no form to show or edit: offer to enable it.
	if (data && (!data.available || !data.form_id)) {
		return (
			<CardComponent>
				<ModuleGuardComponent
					icon="form"
					iconColor="purple"
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
		// No scripts run in the frame, and it ignores the pointer, so the preview can't be submitted.
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
		<CardComponent
			title={__('Subscription form', 'notifima')}
			desc={__(
				'This is the form customers fill in to be told when a product is back in stock. Edit it in VuloForm.',
				'notifima'
			)}
			action={
				data?.edit_url ? (
					<ButtonInput
						buttons={{
							text: __('Edit form', 'notifima'),
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
					'notifima'
				)}
			/>
			{body}
		</CardComponent>
	);
};

export default SubscriptionFormPreview;
