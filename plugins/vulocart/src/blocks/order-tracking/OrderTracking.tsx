/* global vulocartFrontendData */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import axios from 'axios';

interface OrderItem {
	id: number;
	title: string;
	quantity: number;
	unit_price: number;
	currency: string | null;
	subtotal: number;
}

interface OrderDetail {
	order_number: string;
	status: string;
	total: number;
	currency: string | null;
	created_at: string;
	items: OrderItem[];
}

const client = axios.create( { baseURL: `${ vulocartFrontendData.apiUrl }/${ vulocartFrontendData.restUrl }` } );

/**
 * The frontend half of `GET /orders/track` (modules/Order/Rest.php,
 * public — an order number alone is guessable/sequential, the
 * access_token is the real authorization check). Same "deliberately plain
 * axios/useState, no zyra" tradeoff as src/blocks/checkout/Checkout.tsx —
 * this is a public storefront block with no wp-admin context.
 */
export function OrderTracking() {
	const [ orderNumber, setOrderNumber ] = useState( '' );
	const [ accessToken, setAccessToken ] = useState( '' );
	const [ order, setOrder ] = useState< OrderDetail | null >( null );
	const [ error, setError ] = useState< string | null >( null );
	const [ isLoading, setIsLoading ] = useState( false );

	const trackOrder = () => {
		if ( ! orderNumber || ! accessToken ) {
			return;
		}

		setIsLoading( true );
		setError( null );
		setOrder( null );

		client
			.get< OrderDetail >( '/orders/track', {
				params: { order_number: orderNumber, access_token: accessToken },
			} )
			.then( ( response ) => setOrder( response.data ) )
			.catch( () => {
				setError( __( 'No order found with that order number and access token.', 'vulocart' ) );
			} )
			.finally( () => setIsLoading( false ) );
	};

	return (
		<div style={ { maxWidth: '480px' } }>
			<h3>{ __( 'Track Your Order', 'vulocart' ) }</h3>

			<div style={ { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' } }>
				<input
					type="text"
					placeholder={ __( 'Order number (e.g. VC-000042)', 'vulocart' ) }
					value={ orderNumber }
					onChange={ ( event ) => setOrderNumber( event.target.value ) }
				/>
				<input
					type="text"
					placeholder={ __( 'Access token', 'vulocart' ) }
					value={ accessToken }
					onChange={ ( event ) => setAccessToken( event.target.value ) }
				/>
			</div>

			<button
				type="button"
				disabled={ ! orderNumber || ! accessToken || isLoading }
				onClick={ trackOrder }
			>
				{ isLoading ? __( 'Checking…', 'vulocart' ) : __( 'Track Order', 'vulocart' ) }
			</button>

			{ error && <p style={ { color: '#dc2626' } }>{ error }</p> }

			{ order && (
				<div
					style={ {
						marginTop: '16px',
						border: '1px solid #e5e7eb',
						borderRadius: '8px',
						padding: '16px',
					} }
				>
					<p>
						{ __( 'Order', 'vulocart' ) } <strong>{ order.order_number }</strong>
					</p>
					<p>
						{ __( 'Status:', 'vulocart' ) } <strong>{ order.status }</strong>
					</p>
					<ul>
						{ order.items.map( ( item ) => (
							<li key={ item.id }>
								{ item.title } x{ item.quantity } — { item.subtotal } { item.currency }
							</li>
						) ) }
					</ul>
					<p style={ { fontWeight: 700 } }>
						{ __( 'Total:', 'vulocart' ) } { order.total } { order.currency }
					</p>
				</div>
			) }
		</div>
	);
}
