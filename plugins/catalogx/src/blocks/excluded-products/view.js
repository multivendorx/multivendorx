import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import ExcludedProducts from './ExcludedProducts';

document.addEventListener('DOMContentLoaded', () => {
    const element = document.getElementById('catalogx-excluded-products');

    if (element) {
        const attributes = JSON.parse(
            element.dataset.attributes || '{}'
        );

        render(
            <BrowserRouter>
                <ExcludedProducts attributes={attributes} />
            </BrowserRouter>,
            element
        );
    }
});