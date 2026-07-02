import { render } from '@wordpress/element';
import SubscribeForm from './SubscribeForm';

export const mountSubscribeForm = () => {
	const container = document.getElementById('notifima-subscribe-form');

	if (!container || container.dataset.mounted === 'true') {
		return;
	}

	container.dataset.mounted = 'true';

	render(
		<SubscribeForm
			productId={parseInt(container.dataset.productId || '0', 10)}
			variationId={parseInt(container.dataset.variationId || '0', 10)}
			productTitle={container.dataset.productTitle || ''}
			userEmail={container.dataset.userEmail || ''}
			shownInterest={container.dataset.shownInterest || ''}
		/>,
		container
	);
};

document.addEventListener('DOMContentLoaded', () => {
	// Initial mount (simple products)
	mountSubscribeForm();

	// Watch for dynamically added forms (variable products)
	const observer = new MutationObserver(() => {
		mountSubscribeForm();
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true,
	});
});