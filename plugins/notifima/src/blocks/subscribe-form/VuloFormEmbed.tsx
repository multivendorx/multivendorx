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
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		let cancelled = false;
		setFailed(false);

		const url = `${apiUrl}/vuloform/v1/public/forms/${formId}/embed`;

		axios
			.get<VuloFormEmbedPayload>(
				productId ? `${url}?product_id=${productId}` : url
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
	}, [formId, apiUrl, productId]);

	if (failed) {
		return null;
	}

	return <div className="notifima-vuloform-embed" ref={containerRef} />;
};

export default VuloFormEmbed;
