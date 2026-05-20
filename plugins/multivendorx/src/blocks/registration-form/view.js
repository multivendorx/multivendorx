import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import RegistrationForm from './registrationForm';

// Frontend render
document.addEventListener('DOMContentLoaded', () => {
	const element = document.getElementById('multivendorx-registration-form');
	if (element) {
		render(
			<BrowserRouter>
				<RegistrationForm />
			</BrowserRouter>,
			element
		);
	}
});