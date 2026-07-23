/* global appLocalizer */
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import { configureZyra } from '@zyra/core';
import App from './app';

configureZyra(appLocalizer);

const adminWrapper = document.getElementById('admin-main-wrapper');

if (adminWrapper) {
	render(
		<BrowserRouter>
			<App />
		</BrowserRouter>,
		adminWrapper
	);
}
