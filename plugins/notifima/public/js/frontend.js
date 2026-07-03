'use strict';

/* global jQuery, frontendLocalizer */
jQuery( function ( $ ) {
    /**
     * Init event listener on page loading.
     * @return {undefined}
     */
    function init() {
        $( document ).on( 'change', 'input.variation_id', variationSubscribe );
    }

    /**
     * Get subscription form of variation product.
     */
    function variationSubscribe() {
        const variationId = Number( $( this ).val() );
        const productId = Number(
            $( '.notifima-shortcode-subscribe-form' ).data( 'product-id' )
        );

        // Subscription form exist and variation id exist
        if ( $( '.notifima-shortcode-subscribe-form' ).length && variationId ) {
            // Request body for subscription form
            const subscriptionFormRequest = {
                action: 'get_subscription_form_for_variation',
                nonce: frontendLocalizer.nonce,
                product_id: productId,
                variation_id: variationId,
            };

            // Request for subscription form
            $.post(
                frontendLocalizer.ajax_url,
                subscriptionFormRequest,
                function ( response ) {
                    // Set subscription form as inner-html
                    $( '.notifima-shortcode-subscribe-form' ).html( response );
                }
            );
        } else {
            // Variation not exist.
            $( '.notifima-shortcode-subscribe-form' ).html( '' );
        }
    }

    // Call init function
    init();
} );
