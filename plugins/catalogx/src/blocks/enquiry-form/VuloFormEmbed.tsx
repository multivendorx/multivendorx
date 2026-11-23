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
	productId?: string;
	/** Passed as `?quantity=` so the form's hidden `quantity` field resolves correctly. */
	quantity?: string;
	/**
	 * VuloForm's own script handles submission entirely client-side and never tells the host
	 * page about it. Called once it swaps the form for its success message -- e.g. to apply
	 * CatalogX's own "redirect after enquiry" setting, which the submission response itself
	 * can't reach (the browser never sees it; `SubmissionBridge` creates the enquiry server-side).
	 */
	onSubmitted?: () => void;
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
	productId,
	quantity,
	onSubmitted,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		let cancelled = false;
		setFailed(false);

		const url = `${apiUrl}/vuloform/v1/public/forms/${formId}/embed`;
		const query = new URLSearchParams({
			...(productId && { product_id: productId }),
			...(quantity && { quantity }),
		}).toString();

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
	}, [formId, apiUrl, productId, quantity]);

	useEffect(() => {
		const container = containerRef.current;

		if (!container || !onSubmitted) {
			return;
		}

		// VuloForm's script swaps the <form> for a `.vuloform-message--success` node on success.
		const observer = new MutationObserver((mutations) => {
			const succeeded = mutations.some((mutation) =>
				Array.prototype.some.call(
					mutation.addedNodes,
					(node: Node) =>
						node instanceof HTMLElement &&
						node.classList.contains('vuloform-message--success')
				)
			);

			if (succeeded) {
				onSubmitted();
			}
		});

		observer.observe(container, { childList: true, subtree: true });

		return () => {
			observer.disconnect();
		};
	}, [formId, onSubmitted]);

	if (failed) {
		return null;
	}

	return <div className="catalogx-vuloform-embed" ref={containerRef} />;
};

export default VuloFormEmbed;
