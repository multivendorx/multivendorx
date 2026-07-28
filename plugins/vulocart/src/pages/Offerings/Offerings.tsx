import { OfferingsList } from './OfferingsList';
import { OfferingEdit } from './OfferingEdit';

interface OfferingsProps {
	action: string | null;
	id: number | null;
}

/**
 * Branches between the list and the dedicated add/edit page based on the
 * `action`/`id` query params src/index.tsx parses from `location.search`
 * on mount — see Menu.php's `add_offerings_menu()` docblock for why this
 * is query-string-driven rather than a client-side route: every
 * transition here (list → add, list → edit, edit → back) is a real
 * browser navigation to a distinct `admin.php?page=vulocart-offerings...`
 * URL, matching WooCommerce's own Products/Orders admin screens.
 */
export function Offerings( { action, id }: OfferingsProps ) {
	if ( 'add' === action ) {
		return <OfferingEdit id={ null } />;
	}

	if ( 'edit' === action && null !== id ) {
		return <OfferingEdit id={ id } />;
	}

	return <OfferingsList />;
}

export default Offerings;
