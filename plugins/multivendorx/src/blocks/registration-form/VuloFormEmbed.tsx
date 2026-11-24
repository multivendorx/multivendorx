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
	/**
	 * Prefills the form's fields with the vendor's own already-saved store data (when
	 * re-editing an existing registration) -- each key matches one of Templates::fields()'s
	 * `{query:<key>}` defaults. Omit a key (or pass '') to leave that field empty.
	 */
	prefill?: Record<string, string>;
}

/** Loads a stylesheet/script by URL into `<head>` once, shared across form instances. */
const loadAssetOnce = (tag: 'link' | 'script', url: string) => {
	const attr = tag === 'link' ? 'href' : 'src';

	if (document.head.querySelector(`${tag}[${attr}="${url}"]`)) {
		return;
	}

	const el = document.createElement(tag);

	el.setAttribute(attr, url);

	if (tag === 'link') {
		el.setAttribute('rel', 'stylesheet');
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
	prefill,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		let cancelled = false;
		setFailed(false);

		const url = `${apiUrl}/vuloform/v1/public/forms/${formId}/embed`;
		const params = new URLSearchParams();
		const prefillValues: Record<string, string> = prefill ?? {};

		Object.entries(prefillValues).forEach(([key, value]) => {
			if (value) {
				params.set(key, value);
			}
		});

		const query = params.toString();

		axios
			.get<VuloFormEmbedPayload>(query ? `${url}?${query}` : url)
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
	}, [formId, apiUrl, JSON.stringify(prefill)]);

	if (failed) {
		return null;
	}

	return <div className="multivendorx-vuloform-embed" ref={containerRef} />;
};

export default VuloFormEmbed;
