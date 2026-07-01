import { render } from '@wordpress/element';
import SubscribeForm from './SubscribeForm';

document.addEventListener('DOMContentLoaded', () => {
	const container = document.getElementById('notifima-subscribe-form');

	if (!container) {
		return;
	}

	render(
		<SubscribeForm
			productId={parseInt(container.dataset.productId, 10)}
			variationId={parseInt(container.dataset.variationId, 10)}
			productTitle={container.dataset.productTitle}
			userEmail={container.dataset.userEmail}
		/>,
		container
	);
});