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

export interface PreviewFrameBaseProps<T> {
	/** REST path (after `${apiUrl}/${restUrl}/`) to fetch the preview data from. */
	previewPath: string;
	/** Whether `data` means the companion plugin isn't active/usable yet. */
	isUnavailable: (data: T) => boolean;
	/** `desc`/`buttonText` shown while unavailable -- which companion plugin and what it builds. */
	companion: {
		icon: string;
		title: string;
		desc: string;
		activateLabel: string;
		installLabel: string;
	};
	/** `installed`/`available`/`plugin_url` are the three unavailable-state fields every preview endpoint returns. */
	getCompanionState: (data: T) => {
		installed: boolean;
		available: boolean;
		plugin_url: string;
	};
	getEditUrl: (data: T) => string;
	editLabel: string;
	noticeText: string;
	/** Full `<body>` HTML for the sandboxed iframe; '' when there's nothing to preview yet. */
	getFrameHtml: (data: T) => string;
	/** Extra markup for the iframe's `<head>` (e.g. a form's own stylesheet `<link>`). */
	getFrameHeadExtra?: (data: T) => string;
	/** Rendered above the iframe once `data` has loaded, e.g. an email's subject line. */
	renderBeforeFrame?: (data: T) => React.ReactNode;
	frameWidth?: string | number;
	frameBorder?: string;
	/** Overrides the default `body { padding: 1rem }`, e.g. a form's own tighter `2px`. */
	framePadding?: string;
	loadErrorMessage: string;
}

/**
 * Shared shape behind every read-only "this is built in VuloForm/VuloMail, edit it there" admin
 * preview in CatalogX: fetch once, show a companion-plugin guard card if it isn't active, otherwise
 * an auto-height sandboxed iframe plus an "Edit" link out to the companion's own editor.
 */
function PreviewFrameBase<T>({
	previewPath,
	isUnavailable,
	companion,
	getCompanionState,
	getEditUrl,
	editLabel,
	noticeText,
	getFrameHtml,
	getFrameHeadExtra,
	renderBeforeFrame,
	frameWidth = '100%',
	frameBorder = '0',
	framePadding = '1rem',
	loadErrorMessage,
}: PreviewFrameBaseProps<T>) {
	const [data, setData] = useState<T | null>(null);
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
			.catch(() => setError(loadErrorMessage));
	}, [previewPath]);

	const fitHeight = () => {
		const doc = frame.current?.contentDocument;

		if (doc?.body) {
			setHeight(doc.documentElement.scrollHeight + 8);
		}
	};

	if (data && isUnavailable(data)) {
		const state = getCompanionState(data);

		return (
			<CardComponent>
				<ModuleGuardComponent
					icon={companion.icon}
					iconColor="purple-bg"
					title={companion.title}
					desc={companion.desc}
					buttonText={
						state.installed
							? companion.activateLabel
							: companion.installLabel
					}
					buttonLink={state.plugin_url}
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
		// Own frame, own stylesheet -- the admin's styles can't change how it looks.
		const html = getFrameHtml(data);
		const previewDocument = html
			? `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${getFrameHeadExtra?.(
					data
				) || ''}<style>html,body{margin:0;padding:0;background:transparent;font-family:${
					window.getComputedStyle(window.document.body)
						.fontFamily || 'sans-serif'
				}}body{padding:${framePadding}}</style></head><body>${html}</body></html>`
			: '';

		body = (
			<>
				{renderBeforeFrame?.(data)}
				<iframe
					ref={frame}
					title={__('Preview', 'catalogx')}
					sandbox="allow-same-origin"
					srcDoc={previewDocument}
					onLoad={fitHeight}
					style={{
						width: frameWidth,
						height,
						border: frameBorder,
						borderRadius: '0' === frameBorder ? 0 : '4px',
						display: 'block',
						pointerEvents: 'none',
						margin: '0 auto',
					}}
				/>
			</>
		);
	}

	const editUrl = data ? getEditUrl(data) : '';

	return (
		<>
			{editUrl && (
				<div
					style={{
						display: 'flex',
						justifyContent: 'flex-end',
						marginBottom: '0.75rem',
					}}
				>
					<ButtonInput
						buttons={{
							text: editLabel,
							icon: 'edit',
							color: 'purple-bg',
							onClick: () => {
								window.location.href = editUrl;
							},
						}}
					/>
				</div>
			)}

			<CardComponent>
				<NoticeComponent
					type="info"
					displayPosition="inline-notice"
					message={noticeText}
				/>
				{body}
			</CardComponent>
		</>
	);
}

export default PreviewFrameBase;
