import { render } from '@wordpress/element';
import SubscribeForm from './SubscribeForm';

const mountForm = (container) => {
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

jQuery(() => {
	// Mount simple/grouped product form.
	document
		.querySelectorAll('.notifima-subscribe-form')
		.forEach((container) => {
			mountForm(container);
		});

	// Variable products.
	jQuery('.variations_form')
		.on('found_variation', (_event, variation) => {
			// Hide all variation forms.
			jQuery('[id^="notifima-subscribe-form-"]').hide();

			const container = document.getElementById(
				`notifima-subscribe-form-${variation.variation_id}`
			);

			if (!container) {
				return;
			}

			jQuery(container).show();

			mountForm(container);
		})
		.on('reset_data', () => {
			jQuery('[id^="notifima-subscribe-form-"]').hide();
		});
});