import { render } from '@wordpress/element';
import EnquiryForm from './EnquiryForm';

document.addEventListener( 'DOMContentLoaded', () => {
    const element = document.getElementById( 'catalogx-modal' );
    if ( element ) {
        render( <EnquiryForm />, element );
    }
} );
