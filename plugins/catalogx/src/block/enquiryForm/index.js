import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import EnquiryForm from './EnquiryForm';

// Render the App component into the DOM
document.addEventListener('DOMContentLoaded', () => {
    const element = document.getElementById('catalogx-modal');
    if (element) {
        render(
            <BrowserRouter>
                <EnquiryForm />
            </BrowserRouter>,
            element
        );
    }
});
