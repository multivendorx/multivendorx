import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import EnquiryButton from './EnquiryButton';

window.addEventListener('DOMContentLoaded', () => {
	document
		.querySelectorAll('.catalogx-enquiry-button')
		.forEach((root) => {
			const container = document.createElement('div');

			container.className =
				'catalogx-enquiry-button-wrapper';

			root.appendChild(container);
            render(
					<BrowserRouter>
						<EnquiryButton />
					</BrowserRouter>,
					container
				);
		});
});