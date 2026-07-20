/* global appLocalizer */
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import App from './app';
import '@multivendorx/zyra/build/index.css';
import { configureZyra } from '@zyra/core';

configureZyra(appLocalizer);

// Render the App component into the DOM
render(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
    document.getElementById( 'admin-main-wrapper' )
);
