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
	/** Staged into the page URL so the form's hidden `product_id` field resolves correctly. */
	productId?: string;
	/** Staged into the page URL so the form's hidden `quantity` field resolves correctly. */
	quantity?: string;
	/** Staged into the page URL so the form's hidden `user_id` field resolves correctly. */
	userId?: string;
	/**
	 * VuloForm's own script handles submission entirely client-side and never tells the host
	 * page about it. Called once it swaps the form for its success message -- e.g. to apply
	 * CatalogX's own "redirect after enquiry" setting, which the submission response itself
	 * can't reach (the browser never sees it; `SubmissionBridge` creates the enquiry server-side).
	 */
	onSubmitted?: () => void;
}

declare global {
	interface Window {
		vuloformInit?: (root?: ParentNode) => void;
	}
}

/**
 * Loads a stylesheet/script by URL into `<head>` once, shared across form instances. `onReady`
 * (script only) fires once that script has actually finished loading -- immediately if it was
 * already loaded by an earlier embed on this page, otherwise once its `load` event fires, even
 * when we aren't the one who originally added the tag. Mirrors VuloForm's own embed-loader
 * (`vuloform-embed.min.js`)'s identical helper.
 */
const loadAssetOnce = (
	tag: 'link' | 'script',
	url: string,
	onReady?: () => void
) => {
	const attr = tag === 'link' ? 'href' : 'src';
	const existing = document.head.querySelector<HTMLElement>(
		`${tag}[${attr}="${url}"]`
	);

	if (existing) {
		if (tag === 'script' && onReady) {
			window.vuloformInit ? onReady() : existing.addEventListener('load', onReady);
		}
		return;
	}

	const el = document.createElement(tag);

	el.setAttribute(attr, url);

	if (tag === 'link') {
		el.setAttribute('rel', 'stylesheet');
	} else if (onReady) {
		el.addEventListener('load', onReady);
	}

	document.head.appendChild(el);
};

/**
 * Injects an `embed` payload into a container; `style`/`script` are asset URLs to load.
 * VuloForm's script only auto-initializes the forms present when *it* first finishes loading --
 * a form injected after that (every embed past the first on a page that dedupes the shared
 * script) needs this explicit call, or its submit button falls through to a plain, unhandled
 * browser form POST.
 */
export const injectVuloFormEmbed = (
	container: HTMLElement,
	embed: VuloFormEmbedPayload
) => {
	container.innerHTML = embed.html;

	if (embed.style) {
		loadAssetOnce('link', embed.style);
	}

	if (embed.script) {
		loadAssetOnce('script', embed.script, () => window.vuloformInit?.(container));
	} else {
		window.vuloformInit?.(container);
	}
};

/**
 * VuloForm's own script overwrites a hidden field's value from its `{query:x}` default shortly
 * after the form is injected -- keep re-asserting our real values for a short window so ours
 * is what actually gets submitted, instead of staging them into the page URL.
 */
const forceHiddenFieldValues = (
	container: HTMLElement,
	values: Record<string, string | undefined>
) => {
	const apply = () => {
		Object.entries(values).forEach(([key, value]) => {
			if (!value) {
				return;
			}

			const input = container.querySelector<HTMLInputElement>(
				`input[name="vf[${key}]"]`
			);

			if (input && input.value !== value) {
				input.value = value;
			}
		});
	};

	apply();
	const interval = setInterval(apply, 100);
	setTimeout(() => clearInterval(interval), 1500);
};

/** Renders a published VuloForm form via its public `embed` endpoint. */
const VuloFormEmbed: React.FC<VuloFormEmbedProps> = ({
	formId,
	apiUrl,
	productId,
	quantity,
	userId,
	onSubmitted,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		let cancelled = false;
		setFailed(false);

		axios
			.get<VuloFormEmbedPayload>(`${apiUrl}/vuloform/v1/public/forms/${formId}/embed`)
			.then(({ data }) => {
				if (!cancelled && containerRef.current) {
					injectVuloFormEmbed(containerRef.current, data);
					forceHiddenFieldValues(containerRef.current, {
						product_id: productId,
						quantity,
						user_id: userId,
					});
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
	}, [formId, apiUrl, productId, quantity, userId]);

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
