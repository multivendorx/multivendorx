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
	/** Forced into the form's hidden `applicant_user_id` field once VuloForm finishes init. */
	userId?: string;
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
 * VuloForm doesn't support a `{user:id}` token -- only `query:`/`page:url`/`page:title` -- so a
 * hidden field relying on it submits that literal, unresolved string. Set the real value
 * directly once VuloForm's own init (which last touches hidden fields) has already run.
 */
const forceHiddenFieldValues = (
	container: HTMLElement,
	values: Record<string, string | undefined>
) => {
	Object.entries(values).forEach(([key, value]) => {
		if (!value) {
			return;
		}

		const input = container.querySelector<HTMLInputElement>(
			`input[name="vf[${key}]"]`
		);

		if (input) {
			input.value = value;
		}
	});
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
	embed: VuloFormEmbedPayload,
	fieldOverrides?: Record<string, string | undefined>
) => {
	container.innerHTML = embed.html;

	if (embed.style) {
		loadAssetOnce('link', embed.style);
	}

	const applyOverrides = () => {
		if (fieldOverrides) {
			forceHiddenFieldValues(container, fieldOverrides);
		}
	};

	if (embed.script) {
		loadAssetOnce('script', embed.script, () => {
			window.vuloformInit?.(container);
			applyOverrides();
		});
	} else {
		window.vuloformInit?.(container);
		applyOverrides();
	}
};

/** Renders a published VuloForm form via its public `embed` endpoint. */
const VuloFormEmbed: React.FC<VuloFormEmbedProps> = ({
	formId,
	apiUrl,
	prefill,
	userId,
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
					injectVuloFormEmbed(containerRef.current, data, {
						applicant_user_id: userId,
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
	}, [formId, apiUrl, JSON.stringify(prefill), userId]);

	if (failed) {
		return null;
	}

	return <div className="multivendorx-vuloform-embed" ref={containerRef} />;
};

export default VuloFormEmbed;
