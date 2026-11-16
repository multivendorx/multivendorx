/* global jQuery, subscription */
// The subscription form is VuloForm's, drawn by PHP. This only decides when it is shown: for the
// sold-out variation a visitor picks, and inside a popup when the site is set to use one.

const parse = (value, fallback) => {
	try {
		return JSON.parse(value || '');
	} catch (error) {
		return fallback;
	}
};

const togglePopup = (container, show) => {
	const overlay = container.querySelector('.notifima-popup-overlay');

	if (overlay) {
		overlay.style.display = show ? 'flex' : 'none';
	}
};

const setupPopup = (container) => {
	container.querySelector('.notifima-open-popup')?.addEventListener('click', () => {
		togglePopup(container, true);
	});

	container.querySelector('.notifima-popup-close')?.addEventListener('click', () => {
		togglePopup(container, false);
	});

	container.querySelector('.notifima-popup-overlay')?.addEventListener('click', (event) => {
		if (event.target === event.currentTarget) {
			togglePopup(container, false);
		}
	});
};

const prepare = (container) => {
	const email = container.dataset.userEmail;

	// A logged-in visitor's address is filled in, as the old form did.
	if (email) {
		container.querySelectorAll('input[type="email"]').forEach((input) => {
			if (!input.value) {
				input.value = email;
			}
		});
	}

	setupPopup(container);
};

const showInterest = (container, id) => {
	const line = container.querySelector('.notifima-interest');

	if (!line) {
		return;
	}

	const text = parse(container.dataset.interest, {})[id] || '';

	line.textContent = text;
	line.style.display = text ? '' : 'none';
};

const unsubscribe = (button) => {
	button.disabled = true;

	fetch(`${subscription.apiUrl}/${subscription.restUrl}/subscribers/${button.dataset.productId}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-WP-Nonce': subscription.nonce,
		},
		body: JSON.stringify({
			action: 'unsubscribe',
			customer_email: button.dataset.customerEmail,
			product_id: button.dataset.productId,
			variation_id: button.dataset.variationId,
		}),
	})
		.then((response) => response.json())
		.then((result) => {
			button.outerHTML = `<div class="vuloform-message vuloform-message--${result.status ? 'success' : 'error'}">${result.message}</div>`;
		})
		.catch(() => {
			button.disabled = false;
		});
};

jQuery(() => {
	document.querySelectorAll('.notifima-subscribe-form').forEach((container) => {
		prepare(container);

		const variations = parse(container.dataset.variations, []);

		if (variations.length) {
			// A variable product: nothing to show until a sold-out variation is chosen.
			container.style.display = 'none';
		} else {
			showInterest(container, container.dataset.productId);
		}
	});

	document.body.addEventListener('click', (event) => {
		const button = event.target.closest('.notifima-unsubscribe');

		if (button) {
			unsubscribe(button);
		}
	});

	jQuery('.variations_form')
		.on('found_variation', (_event, variation) => {
			document
				.querySelectorAll('.notifima-subscribe-form')
				.forEach((container) => {
					const variations = parse(container.dataset.variations, []);

					if (!variations.length) {
						return;
					}

					const match = variations.includes(variation.variation_id);

					container.style.display = match ? '' : 'none';

					const field = container.querySelector(
						'input[name="notifima_variation_id"]'
					);

					if (field) {
						field.value = match ? variation.variation_id : 0;
					}

					if (match) {
						showInterest(container, variation.variation_id);
					}
				});
		})
		.on('reset_data', () => {
			document
				.querySelectorAll('.notifima-subscribe-form')
				.forEach((container) => {
					if (parse(container.dataset.variations, []).length) {
						container.style.display = 'none';
					}
				});
		});
});
