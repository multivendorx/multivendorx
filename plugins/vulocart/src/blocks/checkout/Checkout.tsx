/* global vulocartFrontendData */
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import axios from 'axios';

interface AssetSummary {
	id: number;
	title: string;
	type: string;
	price: number | null;
	currency: string | null;
	status: string;
}

interface CartItem {
	id: number;
	asset_id: number;
	title: string;
	type: string;
	quantity: number;
	unit_price: number;
	currency: string | null;
	subtotal: number;
}

interface CartResponse {
	token: string;
	currency: string | null;
	item_count: number;
	items: CartItem[];
	totals: { currency: string | null; item_count: number; subtotal: number; total: number };
}

interface OrderConfirmation {
	order_number: string;
	access_token: string;
	total: number;
	currency: string | null;
}

const CART_TOKEN_STORAGE_KEY = 'vulocart_cart_token';

/**
 * A real, minimal single-page checkout — the vision's "Single Page
 * Checkout" variant, not the full set (Multi Step/Popup/Embedded/Hosted/
 * Express/One-Click are separate, not-yet-built variants). No payment
 * gateway exists yet (Payment adapters are a separate, not-yet-built
 * layer), so "Place Order" creates a real order in `pending` status rather
 * than faking a paid/completed one.
 *
 * Combines catalog browsing + cart adjustment + order placement in one
 * page since no separate Catalog/Cart blocks exist yet — once those are
 * built, this can shrink to just the cart-review + place-order steps.
 *
 * Deliberately plain axios/useState, no zyra — zyra is the wp-admin
 * design system (react-frontend.md); this is a public storefront-facing
 * block with no WordPress admin context to match.
 */
const client = axios.create( { baseURL: `${ vulocartFrontendData.apiUrl }/${ vulocartFrontendData.restUrl }` } );

function getOrCreateCartToken(): string {
	const existing = window.localStorage.getItem( CART_TOKEN_STORAGE_KEY );

	if ( existing ) {
		return existing;
	}

	const token =
		typeof window.crypto?.randomUUID === 'function'
			? window.crypto.randomUUID()
			: `vulocart-${ Date.now() }-${ Math.random().toString( 16 ).slice( 2 ) }`;

	window.localStorage.setItem( CART_TOKEN_STORAGE_KEY, token );

	return token;
}

export function Checkout() {
	const [ cartToken, setCartToken ] = useState( '' );
	const [ cart, setCart ] = useState< CartResponse | null >( null );
	const [ assets, setAssets ] = useState< AssetSummary[] >( [] );
	const [ isLoading, setIsLoading ] = useState( true );
	const [ customerEmail, setCustomerEmail ] = useState( '' );
	const [ customerName, setCustomerName ] = useState( '' );
	const [ isPlacingOrder, setIsPlacingOrder ] = useState( false );
	const [ error, setError ] = useState< string | null >( null );
	const [ confirmation, setConfirmation ] = useState< OrderConfirmation | null >( null );

	useEffect( () => {
		const token = getOrCreateCartToken();
		setCartToken( token );

		Promise.all( [
			client.get< AssetSummary[] >( '/assets', { params: { per_page: 50 } } ),
			client.get< CartResponse >( '/cart', { headers: { 'X-Cart-Token': token } } ),
		] )
			.then( ( [ assetsResponse, cartResponse ] ) => {
				setAssets( assetsResponse.data );
				setCart( cartResponse.data );
			} )
			.finally( () => setIsLoading( false ) );
	}, [] );

	const addToCart = ( assetId: number ) => {
		client
			.post< CartResponse >(
				'/cart/items',
				{ asset_id: assetId, quantity: 1 },
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

	if ( isLoading ) {
		return <p>{ __( 'Loading…', 'vulocart' ) }</p>;
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
			<div style={ { flex: '1 1 320px' } }>
				<h3>{ __( 'Available Assets', 'vulocart' ) }</h3>
				{ assets.length === 0 && <p>{ __( 'No assets yet.', 'vulocart' ) }</p> }
				{ assets.map( ( asset ) => (
					<div
						key={ asset.id }
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
							<strong>{ asset.title }</strong>
							<div style={ { fontSize: '12px', color: '#6b7280' } }>
								{ asset.price !== null ? `${ asset.price } ${ asset.currency ?? '' }` : __( 'Price not set', 'vulocart' ) }
							</div>
						</div>
						<button type="button" onClick={ () => addToCart( asset.id ) }>
							{ __( 'Add to cart', 'vulocart' ) }
						</button>
					</div>
				) ) }
			</div>

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

				{ error && <p style={ { color: '#dc2626' } }>{ error }</p> }

				<button
					type="button"
					style={ { marginTop: '12px', padding: '10px 18px', fontWeight: 700 } }
					disabled={ ! cart || cart.items.length === 0 || ! customerEmail || isPlacingOrder }
					onClick={ placeOrder }
				>
					{ isPlacingOrder ? __( 'Placing order…', 'vulocart' ) : __( 'Place Order', 'vulocart' ) }
				</button>
			</div>
		</div>
	);
}
