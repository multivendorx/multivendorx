/* global appLocalizer */
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import App from './app';
import 'zyra/build/index.css';
import { configureZyra, initializeModules } from 'zyra';

configureZyra(appLocalizer);
initializeModules('catalogx', 'free', 'modules');

render(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
    document.getElementById( 'admin-main-wrapper' )
);
