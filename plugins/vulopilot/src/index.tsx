/* global appLocalizer */
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import { configureZyra, initializeModules } from '@zyra/core';
import App from './app';

configureZyra(appLocalizer);
initializeModules('vulopilot', 'free', 'modules');

const adminWrapper = document.getElementById('admin-main-wrapper');

if (adminWrapper) {
	render(
		<BrowserRouter>
			<App />
		</BrowserRouter>,
		adminWrapper
	);
}
