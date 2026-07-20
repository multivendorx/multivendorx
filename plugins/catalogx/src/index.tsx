/* global appLocalizer */
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import App from './app';
import '@multivendorx/zyra/build/index.css';
import { configureZyra } from '@zyra/core';
import { initializeModules } from '@zyra/providers';

configureZyra(appLocalizer);
initializeModules('catalogx', 'free', 'modules');

render(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
    document.getElementById( 'admin-main-wrapper' )
);
