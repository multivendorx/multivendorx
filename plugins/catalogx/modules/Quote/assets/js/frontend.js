/* global jQuery, addToQuoteCart */
jQuery( function ( $ ) {
	$( document ).on(
		'click',
		'.catalogx-add-request-quote-button',
		handleClick
	);

	function handleClick( event ) {
		event.preventDefault();
		const currentElement = $( this );
		const productId = currentElement.data( 'product_id' );
		const quantity = $( '.quantity .qty' ).val() || 1;

		const responseSelector =
			`.catalogx_quote_add_item_response-${ productId }`;
		const browseSelector =
			`.catalogx_quote_add_item_browse-list-${ productId }`;
		const quoteSelector =
			`.add-to-quote-${ productId }`;

		currentElement.after(
			` <img src="${ addToQuoteCart.loader }" >`
		);

		try {
			const response = fetch(
				`${ addToQuoteCart.apiUrl }/${ addToQuoteCart.restUrl }/quote/add`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': addToQuoteCart.nonce,
					},
					body: JSON.stringify( {
						product_id: productId,
						quantity,
						quote_action: 'add_item',
					} ),
				}
			);

			const data = response.json();

			currentElement.next().remove();

			if (
				data.result === 'true' ||
				data.result === 'exists'
			) {
				$( responseSelector )
					.hide()
					.addClass( 'hide' )
					.empty();

				$( browseSelector )
					.show()
					.removeClass( 'hide' );

				currentElement
					.parent()
					.hide()
					.removeClass( 'show' )
					.addClass( 'addedd' );

				$( quoteSelector ).attr(
					'data-variation',
					data.variations
				);

				return;
			}

			$( responseSelector )
				.show()
				.removeClass( 'hide' )
				.html( data.message );
		} catch ( error ) {
			currentElement.next().remove();

			console.error(
				'Failed to add quote item:',
				error
			);
		}
	}
} );
