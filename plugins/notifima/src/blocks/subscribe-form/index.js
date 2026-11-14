/* global jQuery */
// The subscription form is VuloForm's, drawn by PHP. This only decides when it is shown: for the
// sold-out variation a visitor picks, and inside a popup when the site is set to use one.

const parse = (value, fallback) => {
	try {
		return JSON.parse(value || '');
	} catch (error) {
		return fallback;
	}
};

const setupPopup = (container) => {
	if (container.dataset.display !== 'popup' || container.dataset.popupReady) {
		return;
	}

	container.dataset.popupReady = 'true';

	const panel = document.createElement('div');
	[...container.children].forEach((child) => panel.appendChild(child));
	panel.className = 'notifima-popup-overlay';
	panel.style.display = 'none';

	const dialog = document.createElement('div');
	dialog.className = 'notifima-popup';

	const close = document.createElement('button');
	close.type = 'button';
	close.className = 'notifima-popup-close';
	close.setAttribute('aria-label', 'Close');
	close.textContent = '×';

	while (panel.firstChild) {
		dialog.appendChild(panel.firstChild);
	}

	dialog.prepend(close);
	panel.appendChild(dialog);

	const open = document.createElement('button');
	open.type = 'button';
	open.className =
		'notifima-open-popup woocommerce-button button wp-element-button wp-block-button__link';
	open.textContent =
		(window.subscription && window.subscription.button_text) || 'Notify Me';

	const toggle = (show) => {
		panel.style.display = show ? 'flex' : 'none';
	};

	open.addEventListener('click', () => toggle(true));
	close.addEventListener('click', () => toggle(false));
	panel.addEventListener('click', (event) => {
		if (event.target === panel) {
			toggle(false);
		}
	});

	container.appendChild(open);
	container.appendChild(panel);
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
