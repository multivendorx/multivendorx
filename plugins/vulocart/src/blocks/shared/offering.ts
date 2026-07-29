/**
 * Shared between `src/blocks/offerings/`'s listing and detail views —
 * the public-storefront-facing shape of `GET /offerings`/`GET /offerings/{id}`
 * (classes/RestAPI/Controllers/Offerings.php's `prepare_offering_for_response()`).
 * `meta` is typed loosely (`Record<string, unknown>`) rather than
 * exhaustively, same tradeoff `OfferingEdit.tsx` (the admin equivalent)
 * already accepts — the meta bag's real shape varies per offering type
 * (`TYPE_FIELD_CONFIG`), and this file only needs a handful of common
 * keys out of it, not the full per-type field list.
 */
export interface MediaItem {
	id: number;
	url: string;
}

export interface OfferingSummary {
	id: number;
	type: string;
	title: string;
	slug: string | null;
	sku: string | null;
	status: string;
	price: number | null;
	currency: string | null;
	meta: {
		sale_price?: number | null;
		short_description?: string;
		full_description?: string;
		stock_management?: boolean;
		stock_status?: 'in_stock' | 'out_of_stock' | 'backorder';
		catalog_visibility?: 'shop_and_search' | 'shop_only' | 'search_only' | 'hidden';
		featured_image?: MediaItem | null;
		gallery?: MediaItem[];
		categories?: string[];
		tags?: string[];
		type_details?: Record< string, unknown >;
	};
	created_at: string;
	updated_at: string;
}

/**
 * Whether an offering should appear in the public listing grid —
 * `hidden`/`search_only` are excluded (this codebase has no search
 * feature yet for `search_only` to have anywhere else to surface), same
 * as WooCommerce's own catalog-visibility semantics: still directly
 * reachable via its own `?offering={id}` link either way, just not
 * listed.
 */
export function isVisibleInListing( offering: OfferingSummary ): boolean {
	const visibility = offering.meta?.catalog_visibility ?? 'shop_and_search';
	return 'hidden' !== visibility && 'search_only' !== visibility;
}

export function formatPrice( offering: OfferingSummary ): string | null {
	const price = offering.meta?.sale_price ?? offering.price;

	if ( null === price || undefined === price ) {
		return null;
	}

	return `${ price } ${ offering.currency ?? '' }`.trim();
}

/**
 * `booking_slot` -> `Booking slot` — used to render `meta.type_details`
 * entries on the detail page without needing to duplicate
 * OfferingEdit.tsx's full `TYPE_FIELD_CONFIG` label list on the public
 * side too.
 */
export function humanizeKey( key: string ): string {
	const words = key.replace( /_/g, ' ' );
	return words.charAt( 0 ).toUpperCase() + words.slice( 1 );
}
