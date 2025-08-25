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
        const nonce = currentElement.data( 'wp_nonce' );

        const requestData = {
            action: 'quote_added_in_list',
            wp_nonce: nonce,
            product_id: productId,
            quantity,
            quote_action: 'add_item',
        };

        currentElement.after( ' <img src="' + addToQuoteCart.loader + '" >' );

        $.post( addToQuoteCart.ajaxurl, requestData, function ( response ) {
            currentElement.next().remove();
            if ( response.result === 'true' || response.result === 'exists' ) {
                $( '.catalogx_quote_add_item_response-' + productId )
                    .hide()
                    .addClass( 'hide' )
                    .html( '' );
                $( '.catalogx_quote_add_item_browse-list-' + productId )
                    .show()
                    .removeClass( 'hide' );
                currentElement
                    .parent()
                    .hide()
                    .removeClass( 'show' )
                    .addClass( 'addedd' );
                $( '.add-to-quote-' + productId ).attr(
                    'data-variation',
                    response.variations
                );
            } else if ( response.result === 'false' ) {
                $( '.catalogx_quote_add_item_response-' + productId )
                    .show()
                    .removeClass( 'hide' )
                    .html( response.message );
            }
        } );
    }
} );
