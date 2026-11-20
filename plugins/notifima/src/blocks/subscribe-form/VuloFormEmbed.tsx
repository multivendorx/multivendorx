import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

interface VuloFormEmbedPayload {
	html: string;
	/** Asset URL, not inline CSS. */
	style: string;
	/** Asset URL, not inline JS. */
	script: string;
}

export interface VuloFormEmbedProps {
	formId: number;
	/** REST root, e.g. `https://site.com/wp-json`. */
	apiUrl: string;
	/** Passed as `?product_id=` so the form's hidden `product_id` field resolves correctly. */
	productId?: number;
	/**
	 * Without this, WordPress treats even a logged-in visitor's REST request as anonymous
	 * (`is_user_logged_in()` false server-side), so a `{user:email}` default never resolves.
	 */
	nonce?: string;
	/**
	 * Takes over the form's submission entirely: called with the raw posted `FormData` instead
	 * of letting VuloForm's own script submit it. The caller decides what happens next -- e.g.
	 * check eligibility with Notifima's own API first, and only forward it to VuloForm's submit
	 * endpoint itself once that passes. If it doesn't pass, VuloForm never sees this submission.
	 */
	onBeforeSubmit?: (formData: FormData) => void;
}

/** Loads a stylesheet/script by URL into `<head>` once, shared across form instances. */
const loadAssetOnce = (tag: 'link' | 'script', url: string) => {
	const attr = tag === 'link' ? 'href' : 'src';

	if (document.head.querySelector(`${tag}[${attr}="${url}"]`)) {
		return;
	}

	const el = document.createElement(tag);

	if (tag === 'link') {
		el.setAttribute('rel', 'stylesheet');
		el.setAttribute('href', url);
	} else {
		el.setAttribute('src', url);
	}

	document.head.appendChild(el);
};

/** Injects an `embed` payload into a container; `style`/`script` are asset URLs to load. */
export const injectVuloFormEmbed = (
	container: HTMLElement,
	embed: VuloFormEmbedPayload
) => {
	container.innerHTML = embed.html;

	if (embed.style) {
		loadAssetOnce('link', embed.style);
	}

	if (embed.script) {
		loadAssetOnce('script', embed.script);
	}
};

/** Renders a published VuloForm form via its public `embed` endpoint. */
const VuloFormEmbed: React.FC<VuloFormEmbedProps> = ({
	formId,
	apiUrl,
	productId,
	nonce,
	onBeforeSubmit,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		let cancelled = false;
		setFailed(false);

		const url = `${apiUrl}/vuloform/v1/public/forms/${formId}/embed`;

		axios
			.get<VuloFormEmbedPayload>(
				productId ? `${url}?product_id=${productId}` : url,
				nonce ? { headers: { 'X-WP-Nonce': nonce } } : undefined
			)
			.then(({ data }) => {
				if (!cancelled && containerRef.current) {
					injectVuloFormEmbed(containerRef.current, data);
				}
			})
			.catch(() => {
				if (!cancelled) {
					setFailed(true);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [formId, apiUrl, productId, nonce]);

	useEffect(() => {
		const container = containerRef.current;

		if (!container || !onBeforeSubmit) {
			return;
		}

		// Capture phase: runs before VuloForm's own bubble-phase listener on the <form>, so this
		// fully takes over the submission -- VuloForm's script never sees it.
		const onSubmitCapture = (event: Event) => {
			const form = event.target as HTMLFormElement;

			if (!form || 'FORM' !== form.tagName) {
				return;
			}

			event.preventDefault();
			event.stopImmediatePropagation();

			onBeforeSubmit(new FormData(form));
		};

		container.addEventListener('submit', onSubmitCapture, true);

		return () => {
			container.removeEventListener('submit', onSubmitCapture, true);
		};
	}, [formId, onBeforeSubmit]);

	if (failed) {
		return null;
	}

	return <div className="notifima-vuloform-embed" ref={containerRef} />;
};

export default VuloFormEmbed;
