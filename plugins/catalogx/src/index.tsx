/* global appLocalizer */
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import App from './app';

import { configureZyra, initializeModules } from '@zyra/core';

configureZyra(appLocalizer);
initializeModules('catalogx', 'free', 'modules');

render(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
    document.getElementById( 'admin-main-wrapper' )
);
