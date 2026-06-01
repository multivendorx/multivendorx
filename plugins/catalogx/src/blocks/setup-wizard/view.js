import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import SetupWizard from './SetupWizard';

// Render on frontend
document.addEventListener('DOMContentLoaded', () => {
	const element = document.getElementById('catalogx-setup-wizard');
	if (element) {
		render(
			<BrowserRouter>
				<SetupWizard />
			</BrowserRouter>,
			element
		);
	}
});