import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import QuoteListTable from './QuoteListTable';

document.addEventListener( 'DOMContentLoaded', () => {
    const element = document.getElementById( 'request-quote-list' );
    if ( element ) {
        render(
            <BrowserRouter>
                <QuoteListTable />
            </BrowserRouter>,
            element
        );
    }
} );