import { render } from '@wordpress/element';
import { Offerings } from './Offerings';

window.addEventListener( 'DOMContentLoaded', () => {
	document.querySelectorAll( '.vulocart-offerings-block' ).forEach( ( placeholder ) => {
		const container = document.createElement( 'div' );
		placeholder.appendChild( container );

		render( <Offerings />, container );
	} );
} );
