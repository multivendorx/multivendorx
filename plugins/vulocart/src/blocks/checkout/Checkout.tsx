/* global vulocartFrontendData */
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { client, getOrCreateCartToken, CART_TOKEN_STORAGE_KEY } from '../shared/cart';
import type { CartResponse } from '../shared/cart';

interface OfferingSummary {
	id: number;
	title: string;
	type: string;
	price: number | null;
	currency: string | null;
	status: string;
}

interface OrderConfirmation {
	order_number: string;
	access_token: string;
	total: number;
	currency: string | null;
}

/**
 * A real, minimal single-page checkout — the vision's "Single Page
 * Checkout" variant, not the full set (Multi Step/Popup/Embedded/Hosted/
 * Express/One-Click are separate, not-yet-built variants). No payment
 * gateway exists yet (Payment adapters are a separate, not-yet-built
 * layer), so "Place Order" creates a real order in `pending` status rather
 * than faking a paid/completed one.
 *
 * The "Available Offerings" section here and `src/blocks/offerings/`'s
 * listing page both browse the same catalog and share the same cart
 * token (`../shared/cart.ts`) — this block's own browsing section stays
 * for a single-page all-in-one storefront setup, but a store can also
 * point shoppers at a dedicated Offerings page instead (or both).
 *
 * Deliberately plain axios/useState, no zyra — zyra is the wp-admin
 * design system (react-frontend.md); this is a public storefront-facing
 * block with no WordPress admin context to match.
 */

export function Checkout() {
	const [ cartToken, setCartToken ] = useState( '' );
	const [ cart, setCart ] = useState< CartResponse | null >( null );
	const [ offerings, setOfferings ] = useState< OfferingSummary[] >( [] );
	const [ isLoading, setIsLoading ] = useState( true );
	const [ customerEmail, setCustomerEmail ] = useState( '' );
	const [ customerName, setCustomerName ] = useState( '' );
	const [ termsAccepted, setTermsAccepted ] = useState( false );
	const [ isPlacingOrder, setIsPlacingOrder ] = useState( false );
	const [ error, setError ] = useState< string | null >( null );
	const [ confirmation, setConfirmation ] = useState< OrderConfirmation | null >( null );

	useEffect( () => {
		if ( ! vulocartFrontendData.cartCheckoutEnabled ) {
			return;
		}

		const token = getOrCreateCartToken();
		setCartToken( token );

		const requests: [ Promise< { data: OfferingSummary[] } >, Promise< { data: CartResponse } > ] = [
			vulocartFrontendData.offeringsListingEnabled
				? client.get< OfferingSummary[] >( '/offerings', { params: { per_page: 50 } } )
				: Promise.resolve( { data: [] } ),
			client.get< CartResponse >( '/cart', { headers: { 'X-Cart-Token': token } } ),
		];

		Promise.all( requests )
			.then( ( [ offeringsResponse, cartResponse ] ) => {
				setOfferings( offeringsResponse.data );
				setCart( cartResponse.data );
			} )
			.finally( () => setIsLoading( false ) );
	}, [] );

	const addToCart = ( offeringId: number ) => {
		client
			.post< CartResponse >(
				'/cart/items',
				{ offering_id: offeringId, quantity: 1 },
				{ headers: { 'X-Cart-Token': cartToken } }
			)
			.then( ( response ) => setCart( response.data ) );
	};

	const changeQuantity = ( itemId: number, quantity: number ) => {
		if ( quantity <= 0 ) {
			client
				.delete< CartResponse >( `/cart/items/${ itemId }`, { headers: { 'X-Cart-Token': cartToken } } )
				.then( ( response ) => setCart( response.data ) );
			return;
		}

		client
			.put< CartResponse >(
				`/cart/items/${ itemId }`,
				{ quantity },
				{ headers: { 'X-Cart-Token': cartToken } }
			)
			.then( ( response ) => setCart( response.data ) );
	};

	const placeOrder = () => {
		if ( ! cart || cart.items.length === 0 || ! customerEmail ) {
			return;
		}

		if ( vulocartFrontendData.requireTermsAcceptance && ! termsAccepted ) {
			return;
		}

		setIsPlacingOrder( true );
		setError( null );

		client
			.post(
				'/orders',
				{ customer_email: customerEmail, customer_name: customerName || undefined },
				{ headers: { 'X-Cart-Token': cartToken } }
			)
			.then( ( response ) => {
				setConfirmation( response.data );
				window.localStorage.removeItem( CART_TOKEN_STORAGE_KEY );
			} )
			.catch( () => {
				setError( __( 'Could not place order. Your cart may be empty.', 'vulocart' ) );
			} )
			.finally( () => setIsPlacingOrder( false ) );
	};

	if ( ! vulocartFrontendData.cartCheckoutEnabled ) {
		return (
			<div style={ { border: '1px solid #d1d5db', borderRadius: '8px', padding: '20px' } }>
				<p>{ __( 'Checkout is temporarily unavailable. Please check back soon.', 'vulocart' ) }</p>
			</div>
		);
	}

	if ( isLoading ) {
		return <p>{ __( 'Loading…', 'vulocart' ) }</p>;
	}

	if ( ! vulocartFrontendData.guestCheckoutEnabled && ! vulocartFrontendData.isLoggedIn ) {
		return (
			<div style={ { border: '1px solid #d1d5db', borderRadius: '8px', padding: '20px' } }>
				<p>
					{ __( 'Guest checkout is disabled for this store. Please log in to place an order.', 'vulocart' ) }
				</p>
				<a href="/wp-login.php" style={ { fontWeight: 700 } }>
					{ __( 'Log in', 'vulocart' ) }
				</a>
			</div>
		);
	}

	if ( confirmation ) {
		return (
			<div style={ { border: '1px solid #16a34a', borderRadius: '8px', padding: '20px', background: '#f0fdf4' } }>
				<h3 style={ { margin: '0 0 8px' } }>{ __( 'Thank you — your order is in!', 'vulocart' ) }</h3>
				<p>
					{ __( 'Order number:', 'vulocart' ) } <strong>{ confirmation.order_number }</strong>
				</p>
				<p>
					{ __( 'Total:', 'vulocart' ) } { confirmation.total } { confirmation.currency }
				</p>
				<p style={ { fontSize: '13px', color: '#4b5563' } }>
					{ __(
						'Save this access token to check your order status later:',
						'vulocart'
					) }{ ' ' }
					<code>{ confirmation.access_token }</code>
				</p>
			</div>
		);
	}

	return (
		<div style={ { display: 'flex', gap: '24px', flexWrap: 'wrap' } }>
			{ vulocartFrontendData.offeringsListingEnabled && (
				<div style={ { flex: '1 1 320px' } }>
					<h3>{ __( 'Available Offerings', 'vulocart' ) }</h3>
					{ offerings.length === 0 && <p>{ __( 'No offerings yet.', 'vulocart' ) }</p> }
					{ offerings.map( ( offering ) => (
						<div
							key={ offering.id }
							style={ {
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								border: '1px solid #e5e7eb',
								borderRadius: '6px',
								padding: '10px 14px',
								marginBottom: '8px',
							} }
						>
							<div>
								<strong>
									{ vulocartFrontendData.offeringsPageUrl ? (
										<a href={ `${ vulocartFrontendData.offeringsPageUrl }?offering=${ offering.id }` }>
											{ offering.title }
										</a>
									) : (
										offering.title
									) }
								</strong>
								<div style={ { fontSize: '12px', color: '#6b7280' } }>
									{ offering.price !== null ? `${ offering.price } ${ offering.currency ?? '' }` : __( 'Price not set', 'vulocart' ) }
								</div>
							</div>
							<button type="button" onClick={ () => addToCart( offering.id ) }>
								{ __( 'Add to cart', 'vulocart' ) }
							</button>
						</div>
					) ) }
				</div>
			) }

			<div style={ { flex: '1 1 320px' } }>
				<h3>{ __( 'Your Cart', 'vulocart' ) }</h3>

				{ ( ! cart || cart.items.length === 0 ) && <p>{ __( 'Your cart is empty.', 'vulocart' ) }</p> }

				{ cart?.items.map( ( item ) => (
					<div
						key={ item.id }
						style={ {
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							borderBottom: '1px solid #e5e7eb',
							padding: '8px 0',
						} }
					>
						<span>{ item.title }</span>
						<div style={ { display: 'flex', alignItems: 'center', gap: '8px' } }>
							<button type="button" onClick={ () => changeQuantity( item.id, item.quantity - 1 ) }>
								−
							</button>
							<span>{ item.quantity }</span>
							<button type="button" onClick={ () => changeQuantity( item.id, item.quantity + 1 ) }>
								+
							</button>
							<span>{ item.subtotal } { item.currency }</span>
						</div>
					</div>
				) ) }

				{ cart && cart.items.length > 0 && (
					<p style={ { fontWeight: 700, marginTop: '8px' } }>
						{ __( 'Total:', 'vulocart' ) } { cart.totals.total } { cart.totals.currency }
					</p>
				) }

				<h3 style={ { marginTop: '24px' } }>{ __( 'Your details', 'vulocart' ) }</h3>
				<div style={ { display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '320px' } }>
					<input
						type="email"
						placeholder={ __( 'Email', 'vulocart' ) }
						value={ customerEmail }
						onChange={ ( event ) => setCustomerEmail( event.target.value ) }
					/>
					<input
						type="text"
						placeholder={ __( 'Name (optional)', 'vulocart' ) }
						value={ customerName }
						onChange={ ( event ) => setCustomerName( event.target.value ) }
					/>
				</div>

				{ vulocartFrontendData.requireTermsAcceptance && (
					<label style={ { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '13px' } }>
						<input
							type="checkbox"
							checked={ termsAccepted }
							onChange={ ( event ) => setTermsAccepted( event.target.checked ) }
						/>
						{ vulocartFrontendData.checkoutTermsUrl ? (
							<span>
								{ __( 'I agree to the', 'vulocart' ) }{ ' ' }
								<a href={ vulocartFrontendData.checkoutTermsUrl } target="_blank" rel="noreferrer">
									{ __( 'terms & conditions', 'vulocart' ) }
								</a>
							</span>
						) : (
							<span>{ __( 'I agree to the terms & conditions', 'vulocart' ) }</span>
						) }
					</label>
				) }

				{ error && <p style={ { color: '#dc2626' } }>{ error }</p> }

				<button
					type="button"
					style={ { marginTop: '12px', padding: '10px 18px', fontWeight: 700 } }
					disabled={
						! cart ||
						cart.items.length === 0 ||
						! customerEmail ||
						isPlacingOrder ||
						( vulocartFrontendData.requireTermsAcceptance && ! termsAccepted )
					}
					onClick={ placeOrder }
				>
					{ isPlacingOrder ? __( 'Placing order…', 'vulocart' ) : __( 'Place Order', 'vulocart' ) }
				</button>
			</div>
		</div>
	);
}
