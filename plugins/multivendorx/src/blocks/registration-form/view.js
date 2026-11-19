import { createRoot } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import RegistrationForm from './registrationForm';

// Frontend render
document.addEventListener('DOMContentLoaded', () => {
	const element = document.getElementById('multivendorx-registration-form');
	if (element) {
		createRoot(element).render(
			<BrowserRouter>
				<RegistrationForm />
			</BrowserRouter>
		);
	}
});
