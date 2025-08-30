import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import App from './app';
import 'zyra/build/index.css';

render(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
    document.getElementById( 'admin-main-wrapper' )
);
