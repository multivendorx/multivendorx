import { render } from '@wordpress/element';
import { OrderTracking } from './OrderTracking';

window.addEventListener( 'DOMContentLoaded', () => {
	document.querySelectorAll( '.vulocart-order-tracking-block' ).forEach( ( placeholder ) => {
		const container = document.createElement( 'div' );
		placeholder.appendChild( container );

		render( <OrderTracking />, container );
	} );
} );
