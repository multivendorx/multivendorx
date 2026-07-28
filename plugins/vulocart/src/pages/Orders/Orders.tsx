import { OrdersList } from './OrdersList';
import { OrderEdit } from './OrderEdit';

interface OrdersProps {
	action: string | null;
	id: number | null;
}

/**
 * Branches between the list and the dedicated order-detail page based on
 * the `action`/`id` query params src/index.tsx parses from
 * `location.search` on mount — see Menu.php's `add_orders_menu()`/
 * OfferingsList.tsx's sibling docblock for why this is query-string-driven
 * rather than a client-side route or a popup: every transition here is a
 * real browser navigation to a distinct
 * `admin.php?page=vulocart-orders...` URL, matching WooCommerce's own
 * order edit screen.
 */
export function Orders( { action, id }: OrdersProps ) {
	if ( 'edit' === action && null !== id ) {
		return <OrderEdit id={ id } />;
	}

	return <OrdersList />;
}

export default Orders;
