jQuery(function ($) {
	$(document).on(
		'click',
		'.catalogx-add-request-quote-button',
		handleClick
	);

	async function handleClick(event) {
		event.preventDefault();

		const currentElement = $(this);
		const productId = currentElement.data('product_id');
		const quantity = $('.quantity .qty').val() || 1;

		const responseSelector =
			`.catalogx-quote-add-item-product-response-${productId}`;

		const browseSelector =
			`.catalogx-quote-add-item-browse-list-${productId}`;
		const quoteSelector =
			`.add-to-quote-${productId}`;

		currentElement.after(
			` <img src="${addToQuoteCart.loader}" >`
		);

		try {
			const response = await fetch(
				`${addToQuoteCart.apiUrl}/${addToQuoteCart.restUrl}/quote/add`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': addToQuoteCart.nonce,
					},
					body: JSON.stringify({
						product_id: productId,
						quantity,
						quote_action: 'add_item',
					}),
				}
			);

			const data = await response.json();

			currentElement.next().remove();
			if (
				data.result === 'true' ||
				data.result === 'exists'
			) {
				$(responseSelector)
					.hide()
					.addClass('hide')
					.empty();

				$(browseSelector)
					.show()
					.removeClass('hide');

				currentElement
					.parent()
					.hide()
					.removeClass('show')
					.addClass('addedd');

				$(quoteSelector).attr(
					'data-variation',
					data.variations
				);

				return;
			}

			$(responseSelector)
				.show()
				.removeClass('hide')
				.html(data.message || __('Unable to add quote item.', 'catalogx'));
		} catch (error) {
			currentElement.next().remove();

			console.error(
				'Failed to add quote item:',
				error
			);
		}
	}
});