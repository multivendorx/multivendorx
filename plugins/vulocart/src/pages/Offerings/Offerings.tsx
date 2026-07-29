import { OfferingsList } from './OfferingsList';
import { OfferingEdit } from './OfferingEdit';
import { TermsPage } from '../Terms/TermsPage';
import { AttributesPage } from '../Attributes/AttributesPage';
import { OfferingTypesPage } from '../OfferingTypes/OfferingTypesPage';
import { InventoryPage } from '../Inventory/InventoryPage';
import { ReviewsPage } from '../Reviews/ReviewsPage';
import { __ } from '@wordpress/i18n';

interface OfferingsProps {
	action: string | null;
	id: number | null;
	/** `categories`|`collections`|`brands`|`attributes`|`offering-types`|`inventory`|`reviews`. */
	view: string | null;
}

/**
 * Branches between the list, the dedicated add/edit page, and every other
 * Offerings-menu sub-page (Categories/Collections/Brands/Attributes/
 * Offering Types/Inventory/Reviews) based on the `action`/`id`/`view`
 * query params src/index.tsx parses from `location.search` on mount —
 * see Menu.php's `add_offerings_menu()` docblock for why this is
 * query-string-driven rather than a client-side route: every transition
 * here is a real browser navigation to a distinct
 * `admin.php?page=vulocart-offerings...` URL, matching WooCommerce's own
 * Products/Orders admin screens.
 */
export function Offerings( { action, id, view }: OfferingsProps ) {
	if ( 'add' === action ) {
		return <OfferingEdit id={ null } />;
	}

	if ( 'edit' === action && null !== id ) {
		return <OfferingEdit id={ id } />;
	}

	if ( 'categories' === view ) {
		return (
			<TermsPage
				routeSegment="categories"
				headerTitle={ __( 'Categories', 'vulocart' ) }
				headerDescription={ __( 'Group offerings into a hierarchy of categories.', 'vulocart' ) }
				headerIcon="category"
				hierarchical
			/>
		);
	}

	if ( 'collections' === view ) {
		return (
			<TermsPage
				routeSegment="collections"
				headerTitle={ __( 'Collections', 'vulocart' ) }
				headerDescription={ __( 'Manually-curated groups of offerings, e.g. "Summer Sale" or "Staff Picks".', 'vulocart' ) }
				headerIcon="folder-open"
			/>
		);
	}

	if ( 'brands' === view ) {
		return (
			<TermsPage
				routeSegment="brands"
				headerTitle={ __( 'Brands', 'vulocart' ) }
				headerDescription={ __( 'The manufacturers/brands your offerings come from.', 'vulocart' ) }
				headerIcon="product"
			/>
		);
	}

	if ( 'attributes' === view ) {
		return <AttributesPage />;
	}

	if ( 'offering-types' === view ) {
		return <OfferingTypesPage />;
	}

	if ( 'inventory' === view ) {
		return <InventoryPage />;
	}

	if ( 'reviews' === view ) {
		return <ReviewsPage />;
	}

	return <OfferingsList />;
}

export default Offerings;
