import { OfferingsListing } from './OfferingsListing';
import { OfferingDetail } from './OfferingDetail';

/**
 * Dual-mode, same URL: listing by default, one offering's detail view
 * when `?offering={id}` is present — the same query-string-driven
 * mode-switch convention this plugin's own wp-admin pages already use
 * (Menu.php's `add_orders_menu()`/`add_offerings_menu()` docblocks), just
 * applied to a public storefront page instead of wp-admin. Avoids needing
 * a block-editor "pick the product page" control: a store owner adds one
 * `vulocart/offerings` block to one page, and every offering's link
 * (`OfferingsListing.tsx`'s card links) just appends `?offering={id}` to
 * that same page's own URL.
 */
export function Offerings() {
	const params = new URLSearchParams( window.location.search );
	const offeringId = params.get( 'offering' );

	if ( offeringId ) {
		return <OfferingDetail id={ Number( offeringId ) } />;
	}

	return <OfferingsListing />;
}
