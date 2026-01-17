'use strict';

/* global jQuery, frontendLocalizer */
jQuery(function ($) {
    /**
     * Init event listener on page loading.
     * @return {undefined}
     */
    function init() {
        $(document).on('click', '.notifima-subscribe', subscribe);
        $(document).on('click', '.notifima-unsubscribe', unsubscribe);
        $(document).on('change', 'input.variation_id', variationSubscribe);
    }

    /**
     * Subscribe user on subscribe button click.
     *
     * @param {Object} event dom event object.
     * @return {undefined}
     */
    function subscribe(event) {
        // Prevent default form submission.
        event.preventDefault();

        /**
         * Subscriber form dom objects
         *
         * @var {Object} dom objects
         */
        const form = $(this).closest('.notifima-subscribe-form');

        // Set button as processing and disable click event.
        $(this).text(frontendLocalizer.processing);
        $(this).addClass('disabled');

        // Get data from form.
        const customerEmail = form.find('.notifima-email').val();
        const productId = form.find('.notifima-product-id').val();
        const variationId = form.find('.notifima-variation-id').val();
        const productTitle = form.find('.notifima-product-name').val();

        // Get data from localizer
        const buttonHtml = frontendLocalizer.button_html;

        $(this).toggleClass('notifima-loader').blur();

        // Request data for subscription
        const requestData = {
            action: 'subscribe_users',
            nonce: frontendLocalizer.nonce,
            customer_email: customerEmail,
            product_id: productId,
            product_title: productTitle,
            variation_id: variationId,
        };

        form.append(frontendLocalizer.additional_fields_html);
        form.find('input[id^="notifima_"]').each(function () {
            const name = $(this).attr('name');
            const value = $(this).val();
            if (name) {
                requestData[name] = value;
            }
        });

        // Request for subscription
        $.post(frontendLocalizer.ajax_url, requestData, function (response) {
            // Handle response
            if (response.status) {
                form.html(response.message);
            } else {
                form.find(`.notifima-error-message`).remove() &&
                    form.html(response.message);
            }
            form.find('.notifima-subscribe').replaceWith(buttonHtml);
        });
    }

    /**
     * Unsubscribe user on subscribe button click.
     * @param {Object} event dom event object.
     * @return {undefined}
     */
    function unsubscribe(event) {
        // Prevent default from submittion.
        event.preventDefault();

        /**
         * Subscriber form dom objects
         * @var {Object} dom objects
         */
        const form = $(this).parent().parent();

        // Set button as processing and disable click event.
        $(this).text(frontendLocalizer.processing);
        $(this).addClass('disabled');

        // Unsubscribe request data
        const unsubscribeRequest = {
            action: 'unsubscribe_users',
            nonce: frontendLocalizer.nonce,
            customer_email: form.find('.notifima-subscribed-email').val(),
            product_id: form.find('.notifima-product-id').val(),
            variation_id: form.find('.notifima-variation-id').val(),
        };

        // Request for unsubscribe user.
        $.post(
            frontendLocalizer.ajax_url,
            unsubscribeRequest,
            function (response) {
                // unsubscribe success
                if (response) {
                    form.html(response.message);
                }
                // Enable submit button.
                $(this).removeClass('disabled');
            }
        );
    }

    /**
     * Get subscription form of variation product.
     */
    function variationSubscribe() {
        const variationId = Number($(this).val());
        const productId = Number(
            $('.notifima-shortcode-subscribe-form').data('product-id')
        );

        // Subscription form exist and variation id exist
        if ($('.notifima-shortcode-subscribe-form').length && variationId) {
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
                function (response) {
                    // Set subscription form as inner-html
                    $('.notifima-shortcode-subscribe-form').html(response);
                }
            );
        } else {
            // Variation not exist.
            $('.notifima-shortcode-subscribe-form').html('');
        }
    }

    // Call init function
    init();
});
