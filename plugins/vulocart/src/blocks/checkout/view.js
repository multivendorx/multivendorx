import { render } from '@wordpress/element';
import { Checkout } from './Checkout';

window.addEventListener( 'DOMContentLoaded', () => {
	document.querySelectorAll( '.vulocart-checkout-block' ).forEach( ( placeholder ) => {
		const container = document.createElement( 'div' );
		placeholder.appendChild( container );

		render( <Checkout />, container );
	} );
} );
